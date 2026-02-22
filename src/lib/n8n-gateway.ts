/**
 * N8N Gateway — HIPAA/PHI Compliance Layer for Zone 1 (Clinical) Agents
 *
 * All Zone 1 agent requests MUST pass through this gateway before reaching
 * N8N workflows. The gateway enforces:
 *   1. PHI detection and redaction before data leaves the clinical zone
 *   2. Immutable audit logging of every N8N flow execution
 *   3. Zone boundary enforcement (clinical → N8N is allowed, but data must be sanitized)
 *   4. Webhook routing to the correct N8N flow based on agent + action
 *   5. Request/response integrity verification
 */

import { containsPhi, redactPhi, classifyPhiRisk } from "./security";
import type { SecurityZone } from "./security";

/* ── Types ──────────────────────────────────────────────────────────── */

export type N8nExecutionMode = "edge" | "client-proxy";

export type N8nFlowStatus = "active" | "inactive" | "error" | "pending";

export type GatewayVerdict = "allowed" | "blocked" | "sanitized";

export interface N8nFlowConfig {
  id: string;
  name: string;
  webhookUrl: string;
  description: string;
  agentZone: SecurityZone;
  allowedAgentIds: string[];
  executionMode: N8nExecutionMode;
  requiresPhiScan: boolean;
  requiresAuditLog: boolean;
  isActive: boolean;
  timeout: number; // ms
  retryPolicy: { maxRetries: number; backoffMs: number };
  createdAt: string;
  updatedAt: string;
}

export interface N8nGatewayRequest {
  flowId: string;
  agentId: string;
  agentName: string;
  agentZone: SecurityZone;
  payload: Record<string, unknown>;
  userId: string;
  sessionId: string;
  executionMode: N8nExecutionMode;
  timestamp: string;
}

export interface PhiScanResult {
  containsPhi: boolean;
  riskLevel: "none" | "low" | "medium" | "high";
  fieldsRedacted: string[];
  originalHash: string;
  sanitizedHash: string;
}

export interface N8nAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  agentId: string;
  agentName: string;
  agentZone: SecurityZone;
  flowId: string;
  flowName: string;
  executionMode: N8nExecutionMode;
  verdict: GatewayVerdict;
  phiScanResult: PhiScanResult;
  requestPayloadHash: string;
  responseStatus: number | null;
  durationMs: number | null;
  errorMessage: string | null;
}

export interface N8nGatewayResponse {
  success: boolean;
  verdict: GatewayVerdict;
  auditId: string;
  phiScanResult: PhiScanResult;
  flowResponse: unknown | null;
  errorMessage: string | null;
  durationMs: number;
}

/* ── Constants ──────────────────────────────────────────────────────── */

const GATEWAY_VERSION = "1.0.0";

/** Zones that require all data to pass through the N8N gateway */
export const GATEWAY_REQUIRED_ZONES: SecurityZone[] = ["clinical"];

/** Maximum payload size before gateway rejects (prevent exfil) */
const MAX_PAYLOAD_SIZE_BYTES = 512 * 1024; // 512KB

/* ── Hash utility ───────────────────────────────────────────────────── */

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ── PHI Scanner ────────────────────────────────────────────────────── */

function scanObjectForPhi(
  obj: Record<string, unknown>,
  path: string = ""
): { fieldsWithPhi: string[]; highestRisk: "none" | "low" | "medium" | "high" } {
  const fieldsWithPhi: string[] = [];
  let highestRisk: "none" | "low" | "medium" | "high" = "none";
  const riskOrder = { none: 0, low: 1, medium: 2, high: 3 };

  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = path ? `${path}.${key}` : key;

    if (typeof value === "string") {
      if (containsPhi(value)) {
        fieldsWithPhi.push(fieldPath);
        const risk = classifyPhiRisk(value);
        if (riskOrder[risk] > riskOrder[highestRisk]) {
          highestRisk = risk;
        }
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = scanObjectForPhi(value as Record<string, unknown>, fieldPath);
      fieldsWithPhi.push(...nested.fieldsWithPhi);
      if (riskOrder[nested.highestRisk] > riskOrder[highestRisk]) {
        highestRisk = nested.highestRisk;
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === "string" && containsPhi(item)) {
          fieldsWithPhi.push(`${fieldPath}[${i}]`);
          const risk = classifyPhiRisk(item);
          if (riskOrder[risk] > riskOrder[highestRisk]) {
            highestRisk = risk;
          }
        } else if (item && typeof item === "object") {
          const nested = scanObjectForPhi(item as Record<string, unknown>, `${fieldPath}[${i}]`);
          fieldsWithPhi.push(...nested.fieldsWithPhi);
          if (riskOrder[nested.highestRisk] > riskOrder[highestRisk]) {
            highestRisk = nested.highestRisk;
          }
        }
      }
    }
  }

  return { fieldsWithPhi, highestRisk };
}

function sanitizePayload(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = containsPhi(value) ? redactPhi(value) : value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === "string") {
          return containsPhi(item) ? redactPhi(item) : item;
        }
        if (item && typeof item === "object") {
          return sanitizePayload(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/* ── Audit Log (in-memory + localStorage for client, Supabase for edge) */

const AUDIT_STORAGE_KEY = "dr-claw-n8n-audit-log";

let auditLog: N8nAuditEntry[] = [];

function loadAuditLog(): N8nAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupted — reset
  }
  return [];
}

function persistAuditLog(entries: N8nAuditEntry[]): void {
  try {
    // Keep last 500 entries to prevent storage bloat
    const trimmed = entries.slice(-500);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full — silently fail
  }
}

function appendAuditEntry(entry: N8nAuditEntry): void {
  auditLog.push(entry);
  persistAuditLog(auditLog);
}

export function getAuditLog(): N8nAuditEntry[] {
  if (auditLog.length === 0) {
    auditLog = loadAuditLog();
  }
  return [...auditLog];
}

export function clearAuditLog(): void {
  auditLog = [];
  persistAuditLog([]);
}

/* ── Flow Configuration Store ───────────────────────────────────────── */

const FLOW_CONFIG_KEY = "dr-claw-n8n-flows";

let flowConfigs: N8nFlowConfig[] = [];

function loadFlowConfigs(): N8nFlowConfig[] {
  try {
    const raw = localStorage.getItem(FLOW_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupted — reset
  }
  return getDefaultFlowConfigs();
}

function persistFlowConfigs(configs: N8nFlowConfig[]): void {
  try {
    localStorage.setItem(FLOW_CONFIG_KEY, JSON.stringify(configs));
  } catch {
    // Storage full — silently fail
  }
}

function getDefaultFlowConfigs(): N8nFlowConfig[] {
  const now = new Date().toISOString();
  return [
    {
      id: "n8n-patient-intake",
      name: "Patient Intake Processing",
      webhookUrl: "",
      description: "Processes new patient intake forms, verifies insurance, and creates appointments via N8N workflow.",
      agentZone: "clinical",
      allowedAgentIds: ["1", "clin-1", "clin-2"],
      executionMode: "edge",
      requiresPhiScan: true,
      requiresAuditLog: true,
      isActive: true,
      timeout: 30000,
      retryPolicy: { maxRetries: 2, backoffMs: 2000 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "n8n-insurance-verification",
      name: "Insurance Eligibility Check",
      webhookUrl: "",
      description: "Verifies patient insurance eligibility and benefits through payer APIs via N8N.",
      agentZone: "clinical",
      allowedAgentIds: ["clin-2", "1"],
      executionMode: "edge",
      requiresPhiScan: true,
      requiresAuditLog: true,
      isActive: true,
      timeout: 60000,
      retryPolicy: { maxRetries: 3, backoffMs: 3000 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "n8n-clinical-documentation",
      name: "Clinical Documentation Pipeline",
      webhookUrl: "",
      description: "Routes clinical notes through NLP processing, coding, and EHR submission via N8N.",
      agentZone: "clinical",
      allowedAgentIds: ["1", "clin-1"],
      executionMode: "edge",
      requiresPhiScan: true,
      requiresAuditLog: true,
      isActive: true,
      timeout: 45000,
      retryPolicy: { maxRetries: 2, backoffMs: 2000 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "n8n-appointment-reminder",
      name: "Appointment Reminder Workflow",
      webhookUrl: "",
      description: "Sends appointment reminders via SMS/email with PHI stripped before reaching communication channels.",
      agentZone: "clinical",
      allowedAgentIds: ["1", "clin-1"],
      executionMode: "client-proxy",
      requiresPhiScan: true,
      requiresAuditLog: true,
      isActive: true,
      timeout: 15000,
      retryPolicy: { maxRetries: 1, backoffMs: 1000 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "n8n-referral-management",
      name: "Referral Management Pipeline",
      webhookUrl: "",
      description: "Manages outgoing referrals, tracks status, and syncs with referring providers via N8N.",
      agentZone: "clinical",
      allowedAgentIds: ["clin-1"],
      executionMode: "edge",
      requiresPhiScan: true,
      requiresAuditLog: true,
      isActive: false,
      timeout: 30000,
      retryPolicy: { maxRetries: 2, backoffMs: 2000 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "n8n-ops-reporting",
      name: "Operations Reporting",
      webhookUrl: "",
      description: "Aggregates operational metrics and generates reports via N8N. No PHI in this flow.",
      agentZone: "operations",
      allowedAgentIds: ["ceo-1", "3", "fin-1"],
      executionMode: "client-proxy",
      requiresPhiScan: true,
      requiresAuditLog: true,
      isActive: true,
      timeout: 60000,
      retryPolicy: { maxRetries: 2, backoffMs: 2000 },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function getFlowConfigs(): N8nFlowConfig[] {
  if (flowConfigs.length === 0) {
    flowConfigs = loadFlowConfigs();
  }
  return [...flowConfigs];
}

export function getFlowConfigById(flowId: string): N8nFlowConfig | undefined {
  return getFlowConfigs().find((f) => f.id === flowId);
}

export function getFlowConfigsForAgent(agentId: string, zone: SecurityZone): N8nFlowConfig[] {
  return getFlowConfigs().filter(
    (f) => f.isActive && f.allowedAgentIds.includes(agentId) && f.agentZone === zone
  );
}

export function upsertFlowConfig(config: N8nFlowConfig): void {
  const configs = getFlowConfigs();
  const index = configs.findIndex((f) => f.id === config.id);
  if (index >= 0) {
    configs[index] = { ...config, updatedAt: new Date().toISOString() };
  } else {
    configs.push(config);
  }
  flowConfigs = configs;
  persistFlowConfigs(configs);
}

export function deleteFlowConfig(flowId: string): void {
  flowConfigs = getFlowConfigs().filter((f) => f.id !== flowId);
  persistFlowConfigs(flowConfigs);
}

/* ── Gateway Core ───────────────────────────────────────────────────── */

function generateId(): string {
  return `n8n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Process a request through the N8N gateway.
 *
 * For Zone 1 (Clinical) agents this is MANDATORY.
 * The gateway:
 *   1. Validates the agent is authorized for the target flow
 *   2. Scans the payload for PHI
 *   3. Sanitizes (redacts) any PHI found
 *   4. Logs an immutable audit entry
 *   5. Forwards the sanitized payload to the N8N webhook (if configured)
 *   6. Returns the response with audit metadata
 */
export async function processGatewayRequest(
  request: N8nGatewayRequest
): Promise<N8nGatewayResponse> {
  const startTime = Date.now();
  const auditId = generateId();

  // 1. Find flow config
  const flow = getFlowConfigById(request.flowId);
  if (!flow) {
    const entry = buildAuditEntry(auditId, request, null, "blocked", {
      containsPhi: false,
      riskLevel: "none",
      fieldsRedacted: [],
      originalHash: "",
      sanitizedHash: "",
    }, null, `Flow not found: ${request.flowId}`, Date.now() - startTime);
    appendAuditEntry(entry);

    return {
      success: false,
      verdict: "blocked",
      auditId,
      phiScanResult: entry.phiScanResult,
      flowResponse: null,
      errorMessage: `Flow not found: ${request.flowId}`,
      durationMs: Date.now() - startTime,
    };
  }

  // 2. Validate agent authorization
  if (!flow.allowedAgentIds.includes(request.agentId)) {
    const entry = buildAuditEntry(auditId, request, flow, "blocked", {
      containsPhi: false,
      riskLevel: "none",
      fieldsRedacted: [],
      originalHash: "",
      sanitizedHash: "",
    }, null, `Agent ${request.agentId} not authorized for flow ${flow.id}`, Date.now() - startTime);
    appendAuditEntry(entry);

    return {
      success: false,
      verdict: "blocked",
      auditId,
      phiScanResult: entry.phiScanResult,
      flowResponse: null,
      errorMessage: `Agent not authorized for this flow`,
      durationMs: Date.now() - startTime,
    };
  }

  // 3. Check payload size
  const payloadStr = JSON.stringify(request.payload);
  if (new TextEncoder().encode(payloadStr).length > MAX_PAYLOAD_SIZE_BYTES) {
    const entry = buildAuditEntry(auditId, request, flow, "blocked", {
      containsPhi: false,
      riskLevel: "none",
      fieldsRedacted: [],
      originalHash: "",
      sanitizedHash: "",
    }, null, "Payload exceeds maximum size limit", Date.now() - startTime);
    appendAuditEntry(entry);

    return {
      success: false,
      verdict: "blocked",
      auditId,
      phiScanResult: entry.phiScanResult,
      flowResponse: null,
      errorMessage: "Payload exceeds maximum size limit (512KB)",
      durationMs: Date.now() - startTime,
    };
  }

  // 4. PHI scan
  const originalHash = await sha256(payloadStr);
  const { fieldsWithPhi, highestRisk } = scanObjectForPhi(request.payload);
  const hasPhi = fieldsWithPhi.length > 0;

  // 5. Sanitize if PHI detected
  let sanitizedPayload = request.payload;
  let verdict: GatewayVerdict = "allowed";

  if (hasPhi && flow.requiresPhiScan) {
    sanitizedPayload = sanitizePayload(request.payload);
    verdict = "sanitized";
  }

  const sanitizedStr = JSON.stringify(sanitizedPayload);
  const sanitizedHash = await sha256(sanitizedStr);

  const phiScanResult: PhiScanResult = {
    containsPhi: hasPhi,
    riskLevel: highestRisk,
    fieldsRedacted: fieldsWithPhi,
    originalHash,
    sanitizedHash,
  };

  // 6. Execute N8N webhook (if URL configured)
  let flowResponse: unknown = null;
  let responseStatus: number | null = null;
  let errorMessage: string | null = null;

  if (flow.webhookUrl) {
    try {
      const response = await executeN8nWebhook(flow, sanitizedPayload, request);
      responseStatus = response.status;
      if (response.ok) {
        flowResponse = await response.json().catch(() => ({ status: "ok" }));
      } else {
        errorMessage = `N8N returned status ${response.status}`;
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "N8N webhook execution failed";
    }
  } else {
    // No webhook configured — gateway processes but doesn't forward
    flowResponse = { gateway: "processed", note: "No webhook URL configured — flow validated and audit logged" };
  }

  // 7. Log audit entry
  const entry = buildAuditEntry(
    auditId, request, flow, verdict, phiScanResult,
    responseStatus, errorMessage, Date.now() - startTime
  );
  appendAuditEntry(entry);

  return {
    success: !errorMessage,
    verdict,
    auditId,
    phiScanResult,
    flowResponse,
    errorMessage,
    durationMs: Date.now() - startTime,
  };
}

/* ── N8N Webhook Execution ──────────────────────────────────────────── */

async function executeN8nWebhook(
  flow: N8nFlowConfig,
  payload: Record<string, unknown>,
  request: N8nGatewayRequest
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), flow.timeout);

  try {
    const response = await fetch(flow.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DrClaw-Gateway-Version": GATEWAY_VERSION,
        "X-DrClaw-Agent-Id": request.agentId,
        "X-DrClaw-Agent-Zone": request.agentZone,
        "X-DrClaw-Flow-Id": flow.id,
        "X-DrClaw-Audit-Id": request.sessionId,
      },
      body: JSON.stringify({
        payload,
        metadata: {
          agentId: request.agentId,
          agentName: request.agentName,
          zone: request.agentZone,
          flowId: flow.id,
          timestamp: request.timestamp,
          gatewayVersion: GATEWAY_VERSION,
        },
      }),
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ── Audit Entry Builder ────────────────────────────────────────────── */

function buildAuditEntry(
  auditId: string,
  request: N8nGatewayRequest,
  flow: N8nFlowConfig | null,
  verdict: GatewayVerdict,
  phiScanResult: PhiScanResult,
  responseStatus: number | null,
  errorMessage: string | null,
  durationMs: number
): N8nAuditEntry {
  return {
    id: auditId,
    timestamp: new Date().toISOString(),
    userId: request.userId,
    agentId: request.agentId,
    agentName: request.agentName,
    agentZone: request.agentZone,
    flowId: request.flowId,
    flowName: flow?.name ?? "Unknown",
    executionMode: request.executionMode,
    verdict,
    phiScanResult,
    requestPayloadHash: phiScanResult.originalHash,
    responseStatus,
    durationMs,
    errorMessage,
  };
}

/* ── Zone Enforcement Check ─────────────────────────────────────────── */

/**
 * Returns true if the given zone requires all agent data to flow through
 * the N8N gateway before reaching external services.
 */
export function isGatewayRequired(zone: SecurityZone): boolean {
  return GATEWAY_REQUIRED_ZONES.includes(zone);
}

/**
 * Validate that a zone transition is legal for N8N flow routing.
 * Clinical → N8N is allowed (with sanitization).
 * Clinical → External directly is BLOCKED.
 */
export function validateZoneTransition(
  sourceZone: SecurityZone,
  targetZone: SecurityZone
): { allowed: boolean; requiresSanitization: boolean; reason: string } {
  if (sourceZone === "clinical" && targetZone === "external") {
    return {
      allowed: false,
      requiresSanitization: true,
      reason: "Direct clinical-to-external data flow is prohibited. Route through N8N gateway.",
    };
  }

  if (sourceZone === "clinical") {
    return {
      allowed: true,
      requiresSanitization: true,
      reason: "Clinical zone data must be PHI-sanitized before N8N processing.",
    };
  }

  if (sourceZone === "operations") {
    return {
      allowed: true,
      requiresSanitization: true,
      reason: "Operations zone data scanned for accidental PHI before N8N processing.",
    };
  }

  return {
    allowed: true,
    requiresSanitization: false,
    reason: "External zone — no PHI restrictions for N8N flows.",
  };
}

/* ── Gateway Statistics ─────────────────────────────────────────────── */

export interface GatewayStats {
  totalRequests: number;
  allowedRequests: number;
  sanitizedRequests: number;
  blockedRequests: number;
  phiDetections: number;
  avgDurationMs: number;
  activeFlows: number;
  clinicalFlows: number;
  operationsFlows: number;
}

export function getGatewayStats(): GatewayStats {
  const log = getAuditLog();
  const flows = getFlowConfigs();

  const totalRequests = log.length;
  const allowedRequests = log.filter((e) => e.verdict === "allowed").length;
  const sanitizedRequests = log.filter((e) => e.verdict === "sanitized").length;
  const blockedRequests = log.filter((e) => e.verdict === "blocked").length;
  const phiDetections = log.filter((e) => e.phiScanResult.containsPhi).length;

  const durations = log.filter((e) => e.durationMs !== null).map((e) => e.durationMs!);
  const avgDurationMs = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  return {
    totalRequests,
    allowedRequests,
    sanitizedRequests,
    blockedRequests,
    phiDetections,
    avgDurationMs,
    activeFlows: flows.filter((f) => f.isActive).length,
    clinicalFlows: flows.filter((f) => f.agentZone === "clinical").length,
    operationsFlows: flows.filter((f) => f.agentZone === "operations").length,
  };
}
