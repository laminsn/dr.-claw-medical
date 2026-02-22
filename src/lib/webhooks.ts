/**
 * Webhook Service — Core types, HMAC signing, event definitions, and dispatch logic.
 *
 * Integrates with the security zone model to ensure PHI is stripped from
 * payloads before they leave the clinical zone. Every delivery attempt
 * is logged for HIPAA audit compliance.
 */

import { containsPhi, redactPhi, classifyPhiRisk } from "./security";
import type { SecurityZone } from "./security";

/* ── Event Types ────────────────────────────────────────────────────── */

export interface WebhookEventCategory {
  id: string;
  label: string;
  events: WebhookEventType[];
}

export interface WebhookEventType {
  id: string;
  label: string;
  description: string;
  category: string;
  zone: SecurityZone | "any";
  samplePayload: Record<string, unknown>;
}

export const WEBHOOK_EVENT_CATEGORIES: WebhookEventCategory[] = [
  {
    id: "agent",
    label: "Agent Events",
    events: [
      {
        id: "agent.started",
        label: "Agent Started",
        description: "Fires when an agent begins executing a task",
        category: "agent",
        zone: "any",
        samplePayload: {
          event: "agent.started",
          agentId: "agent-1",
          agentName: "Dr. Front Desk",
          taskId: "task-123",
          zone: "clinical",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "agent.completed",
        label: "Agent Completed",
        description: "Fires when an agent finishes a task successfully",
        category: "agent",
        zone: "any",
        samplePayload: {
          event: "agent.completed",
          agentId: "agent-1",
          agentName: "Dr. Front Desk",
          taskId: "task-123",
          durationMs: 4521,
          tokensUsed: 1280,
          zone: "clinical",
          timestamp: "2026-02-22T10:05:00Z",
        },
      },
      {
        id: "agent.error",
        label: "Agent Error",
        description: "Fires when an agent encounters an error during execution",
        category: "agent",
        zone: "any",
        samplePayload: {
          event: "agent.error",
          agentId: "agent-1",
          agentName: "Dr. Front Desk",
          taskId: "task-123",
          error: "Model timeout after 30000ms",
          zone: "clinical",
          timestamp: "2026-02-22T10:05:00Z",
        },
      },
    ],
  },
  {
    id: "task",
    label: "Task Events",
    events: [
      {
        id: "task.created",
        label: "Task Created",
        description: "Fires when a new task is created in the system",
        category: "task",
        zone: "any",
        samplePayload: {
          event: "task.created",
          taskId: "task-456",
          title: "Follow-up calls",
          assignedTo: "agent-1",
          priority: "high",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "task.completed",
        label: "Task Completed",
        description: "Fires when a task is marked as complete",
        category: "task",
        zone: "any",
        samplePayload: {
          event: "task.completed",
          taskId: "task-456",
          title: "Follow-up calls",
          completedBy: "agent-1",
          durationMs: 120000,
          timestamp: "2026-02-22T10:10:00Z",
        },
      },
      {
        id: "task.failed",
        label: "Task Failed",
        description: "Fires when a task fails after all retry attempts",
        category: "task",
        zone: "any",
        samplePayload: {
          event: "task.failed",
          taskId: "task-456",
          title: "Follow-up calls",
          error: "Maximum retry attempts exceeded",
          retryCount: 3,
          timestamp: "2026-02-22T10:10:00Z",
        },
      },
    ],
  },
  {
    id: "phi",
    label: "PHI / Compliance Events",
    events: [
      {
        id: "phi.detected",
        label: "PHI Detected",
        description: "Fires when PHI is detected and redacted from agent output",
        category: "phi",
        zone: "clinical",
        samplePayload: {
          event: "phi.detected",
          agentId: "agent-1",
          riskLevel: "high",
          fieldsRedacted: ["payload.patientSSN", "payload.notes"],
          action: "redacted",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "phi.violation",
        label: "PHI Violation",
        description: "Fires when a PHI security violation is detected and blocked",
        category: "phi",
        zone: "clinical",
        samplePayload: {
          event: "phi.violation",
          agentId: "agent-1",
          violationType: "zone_boundary_violation",
          severity: "critical",
          description: "Agent attempted cross-zone PHI transfer",
          status: "blocked",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "phi.breach_risk",
        label: "HIPAA Breach Risk",
        description: "Fires when behavior indicates potential HIPAA breach risk",
        category: "phi",
        zone: "clinical",
        samplePayload: {
          event: "phi.breach_risk",
          severity: "critical",
          description: "Unusual volume of PHI access detected",
          affectedRecords: 15,
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
    ],
  },
  {
    id: "auth",
    label: "Authentication Events",
    events: [
      {
        id: "auth.login",
        label: "User Login",
        description: "Fires when a user successfully logs in",
        category: "auth",
        zone: "any",
        samplePayload: {
          event: "auth.login",
          userId: "user-abc",
          method: "email",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "auth.failed_login",
        label: "Failed Login",
        description: "Fires when a login attempt fails (useful for security monitoring)",
        category: "auth",
        zone: "any",
        samplePayload: {
          event: "auth.failed_login",
          email: "user@example.com",
          reason: "invalid_password",
          attemptCount: 3,
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
    ],
  },
  {
    id: "workflow",
    label: "Workflow Events",
    events: [
      {
        id: "workflow.started",
        label: "Workflow Started",
        description: "Fires when an automated workflow begins execution",
        category: "workflow",
        zone: "any",
        samplePayload: {
          event: "workflow.started",
          workflowId: "wf-789",
          name: "Patient Intake Pipeline",
          triggeredBy: "agent-1",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "workflow.completed",
        label: "Workflow Completed",
        description: "Fires when a workflow finishes successfully",
        category: "workflow",
        zone: "any",
        samplePayload: {
          event: "workflow.completed",
          workflowId: "wf-789",
          name: "Patient Intake Pipeline",
          durationMs: 45000,
          stepsCompleted: 5,
          timestamp: "2026-02-22T10:05:00Z",
        },
      },
    ],
  },
  {
    id: "integration",
    label: "Integration Events",
    events: [
      {
        id: "integration.connected",
        label: "Integration Connected",
        description: "Fires when a new external integration is connected",
        category: "integration",
        zone: "any",
        samplePayload: {
          event: "integration.connected",
          integrationId: "slack-1",
          provider: "Slack",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "integration.error",
        label: "Integration Error",
        description: "Fires when an integration encounters a connection or API error",
        category: "integration",
        zone: "any",
        samplePayload: {
          event: "integration.error",
          integrationId: "epic-1",
          provider: "Epic EHR",
          error: "FHIR API returned 503",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
    ],
  },
  {
    id: "message",
    label: "Communication Events",
    events: [
      {
        id: "message.received",
        label: "Message Received",
        description: "Fires when an inbound message is received (SMS, email, chat)",
        category: "message",
        zone: "any",
        samplePayload: {
          event: "message.received",
          messageId: "msg-001",
          channel: "sms",
          from: "+15551234567",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
      {
        id: "message.sent",
        label: "Message Sent",
        description: "Fires when an outbound message is sent successfully",
        category: "message",
        zone: "any",
        samplePayload: {
          event: "message.sent",
          messageId: "msg-002",
          channel: "sms",
          to: "+15559876543",
          status: "delivered",
          timestamp: "2026-02-22T10:00:00Z",
        },
      },
    ],
  },
];

/** Flatten all event types for easy lookup */
export const ALL_WEBHOOK_EVENTS: WebhookEventType[] =
  WEBHOOK_EVENT_CATEGORIES.flatMap((cat) => cat.events);

export function getEventById(eventId: string): WebhookEventType | undefined {
  return ALL_WEBHOOK_EVENTS.find((e) => e.id === eventId);
}

/* ── Webhook Types ──────────────────────────────────────────────────── */

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string;
  description: string | null;
  events: string[];
  zone: SecurityZone;
  headers: Record<string, string>;
  is_active: boolean;
  phi_filter: boolean;
  retry_policy: { maxRetries: number; backoffMs: number };
  timeout_ms: number;
  total_deliveries: number;
  total_failures: number;
  last_triggered_at: string | null;
  last_status_code: number | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  request_headers: Record<string, string>;
  response_status: number | null;
  response_body: string | null;
  response_headers: Record<string, string>;
  duration_ms: number | null;
  attempt_number: number;
  max_attempts: number;
  status: "pending" | "success" | "failed" | "retrying";
  error_message: string | null;
  phi_stripped: boolean;
  phi_fields_redacted: string[];
  next_retry_at: string | null;
  created_at: string;
  completed_at: string | null;
}

export type WebhookCreateInput = Pick<
  Webhook,
  "name" | "url" | "description" | "events" | "zone" | "headers" | "phi_filter" | "retry_policy" | "timeout_ms"
>;

/* ── HMAC-SHA256 Signature ──────────────────────────────────────────── */

/**
 * Generate an HMAC-SHA256 signature for webhook payload verification.
 * The signature is sent as the `X-DrClaw-Signature-256` header.
 *
 * Receiving servers verify by:
 *   1. Reading the raw request body
 *   2. Computing HMAC-SHA256 with their stored secret
 *   3. Comparing against the signature header (constant-time)
 */
export async function generateHmacSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return "sha256=" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ── Secret Generation ──────────────────────────────────────────────── */

/** Generate a cryptographically random webhook signing secret */
export function generateWebhookSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return "whsec_" + Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/* ── PHI Scanning for Webhook Payloads ──────────────────────────────── */

export interface PhiScanResult {
  hasPhi: boolean;
  riskLevel: "none" | "low" | "medium" | "high";
  fieldsRedacted: string[];
}

/**
 * Recursively scan a payload for PHI and return a sanitized copy.
 * Used before dispatching webhooks to ensure PHI doesn't leak.
 */
export function scanAndSanitizePayload(
  payload: Record<string, unknown>,
  path = ""
): { sanitized: Record<string, unknown>; scanResult: PhiScanResult } {
  const fieldsRedacted: string[] = [];
  let highestRisk: PhiScanResult["riskLevel"] = "none";
  const riskOrder = { none: 0, low: 1, medium: 2, high: 3 };

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    const fieldPath = path ? `${path}.${key}` : key;

    if (typeof value === "string") {
      if (containsPhi(value)) {
        fieldsRedacted.push(fieldPath);
        const risk = classifyPhiRisk(value);
        if (riskOrder[risk] > riskOrder[highestRisk]) highestRisk = risk;
        sanitized[key] = redactPhi(value);
      } else {
        sanitized[key] = value;
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = scanAndSanitizePayload(value as Record<string, unknown>, fieldPath);
      sanitized[key] = nested.sanitized;
      fieldsRedacted.push(...nested.scanResult.fieldsRedacted);
      if (riskOrder[nested.scanResult.riskLevel] > riskOrder[highestRisk]) {
        highestRisk = nested.scanResult.riskLevel;
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item, i) => {
        if (typeof item === "string") {
          if (containsPhi(item)) {
            fieldsRedacted.push(`${fieldPath}[${i}]`);
            const risk = classifyPhiRisk(item);
            if (riskOrder[risk] > riskOrder[highestRisk]) highestRisk = risk;
            return redactPhi(item);
          }
          return item;
        }
        if (item && typeof item === "object") {
          const nested = scanAndSanitizePayload(item as Record<string, unknown>, `${fieldPath}[${i}]`);
          fieldsRedacted.push(...nested.scanResult.fieldsRedacted);
          if (riskOrder[nested.scanResult.riskLevel] > riskOrder[highestRisk]) {
            highestRisk = nested.scanResult.riskLevel;
          }
          return nested.sanitized;
        }
        return item;
      });
    } else {
      sanitized[key] = value;
    }
  }

  return {
    sanitized,
    scanResult: { hasPhi: fieldsRedacted.length > 0, riskLevel: highestRisk, fieldsRedacted },
  };
}

/* ── Delivery Status Helpers ────────────────────────────────────────── */

export function getStatusColor(status: WebhookDelivery["status"]): string {
  switch (status) {
    case "success":
      return "bg-green-500/15 text-green-400 border-green-500/30";
    case "failed":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "retrying":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "pending":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    default:
      return "bg-white/10 text-muted-foreground border-white/20";
  }
}

export function getHttpStatusColor(code: number | null): string {
  if (!code) return "text-muted-foreground";
  if (code >= 200 && code < 300) return "text-green-400";
  if (code >= 300 && code < 400) return "text-amber-400";
  return "text-red-400";
}

/** Calculate retry delay with exponential backoff */
export function getRetryDelayMs(attempt: number, baseMs: number): number {
  return baseMs * Math.pow(2, attempt - 1);
}

/* ── Webhook Templates ─────────────────────────────────────────────── */

export interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "alerting" | "ehr" | "compliance" | "devops" | "communication";
  urlPlaceholder: string;
  events: string[];
  zone: SecurityZone;
  phi_filter: boolean;
  retry_policy: { maxRetries: number; backoffMs: number };
  timeout_ms: number;
}

export const WEBHOOK_TEMPLATES: WebhookTemplate[] = [
  {
    id: "slack-notifications",
    name: "Slack Notifications",
    description: "Send agent and task events to a Slack channel via Incoming Webhook.",
    icon: "💬",
    category: "communication",
    urlPlaceholder: "https://hooks.slack.com/services/T00000/B00000/XXXXXXXX",
    events: ["agent.started", "agent.completed", "agent.error", "task.completed", "task.failed"],
    zone: "external",
    phi_filter: true,
    retry_policy: { maxRetries: 3, backoffMs: 1000 },
    timeout_ms: 10000,
  },
  {
    id: "pagerduty-alerts",
    name: "PagerDuty Alerts",
    description: "Trigger PagerDuty incidents for critical failures and PHI violations.",
    icon: "🚨",
    category: "alerting",
    urlPlaceholder: "https://events.pagerduty.com/v2/enqueue",
    events: ["agent.error", "task.failed", "phi.violation", "phi.breach_risk", "integration.error"],
    zone: "external",
    phi_filter: true,
    retry_policy: { maxRetries: 5, backoffMs: 1000 },
    timeout_ms: 15000,
  },
  {
    id: "epic-ehr-sync",
    name: "Epic EHR Sync",
    description: "Forward clinical events to an Epic FHIR endpoint for EHR synchronization.",
    icon: "🏥",
    category: "ehr",
    urlPlaceholder: "https://your-epic-instance.com/api/FHIR/R4/Subscription",
    events: ["agent.completed", "task.completed", "workflow.completed"],
    zone: "clinical",
    phi_filter: false,
    retry_policy: { maxRetries: 3, backoffMs: 2000 },
    timeout_ms: 30000,
  },
  {
    id: "compliance-monitor",
    name: "HIPAA Compliance Monitor",
    description: "Route all PHI and authentication events to your compliance monitoring system.",
    icon: "🛡️",
    category: "compliance",
    urlPlaceholder: "https://compliance.yourorg.com/webhooks/hipaa",
    events: ["phi.detected", "phi.violation", "phi.breach_risk", "auth.login", "auth.failed_login"],
    zone: "operations",
    phi_filter: true,
    retry_policy: { maxRetries: 5, backoffMs: 1000 },
    timeout_ms: 15000,
  },
  {
    id: "ms-teams",
    name: "Microsoft Teams",
    description: "Post notifications to a Microsoft Teams channel via connector webhook.",
    icon: "📋",
    category: "communication",
    urlPlaceholder: "https://your-org.webhook.office.com/webhookb2/...",
    events: ["agent.completed", "agent.error", "task.completed", "task.failed", "workflow.completed"],
    zone: "external",
    phi_filter: true,
    retry_policy: { maxRetries: 3, backoffMs: 1000 },
    timeout_ms: 10000,
  },
  {
    id: "datadog-events",
    name: "Datadog Events",
    description: "Send operational metrics and error events to Datadog for monitoring dashboards.",
    icon: "📊",
    category: "devops",
    urlPlaceholder: "https://http-intake.logs.datadoghq.com/api/v2/logs",
    events: ["agent.started", "agent.completed", "agent.error", "integration.connected", "integration.error"],
    zone: "external",
    phi_filter: true,
    retry_policy: { maxRetries: 3, backoffMs: 1000 },
    timeout_ms: 10000,
  },
  {
    id: "custom-ehr",
    name: "Custom EHR Integration",
    description: "Connect to any EHR system with workflow and task event forwarding.",
    icon: "🔗",
    category: "ehr",
    urlPlaceholder: "https://your-ehr-system.com/api/webhooks",
    events: ["workflow.started", "workflow.completed", "task.created", "task.completed"],
    zone: "clinical",
    phi_filter: false,
    retry_policy: { maxRetries: 3, backoffMs: 2000 },
    timeout_ms: 30000,
  },
  {
    id: "security-siem",
    name: "Security SIEM",
    description: "Forward authentication and PHI events to your SIEM for security analysis.",
    icon: "🔐",
    category: "compliance",
    urlPlaceholder: "https://siem.yourorg.com/api/events/webhook",
    events: ["auth.login", "auth.failed_login", "phi.detected", "phi.violation", "phi.breach_risk"],
    zone: "operations",
    phi_filter: true,
    retry_policy: { maxRetries: 5, backoffMs: 1000 },
    timeout_ms: 15000,
  },
  {
    id: "patient-comms",
    name: "Patient Communications",
    description: "Trigger patient messaging workflows when messages are received or sent.",
    icon: "📨",
    category: "communication",
    urlPlaceholder: "https://your-comms-platform.com/webhooks",
    events: ["message.received", "message.sent"],
    zone: "external",
    phi_filter: true,
    retry_policy: { maxRetries: 3, backoffMs: 1000 },
    timeout_ms: 10000,
  },
  {
    id: "n8n-automation",
    name: "n8n Automation",
    description: "Trigger n8n workflows from Dr. Claw events for custom automation pipelines.",
    icon: "⚡",
    category: "devops",
    urlPlaceholder: "https://your-n8n.com/webhook/drclaw-events",
    events: ["agent.completed", "task.completed", "workflow.completed", "message.received"],
    zone: "external",
    phi_filter: true,
    retry_policy: { maxRetries: 3, backoffMs: 1000 },
    timeout_ms: 15000,
  },
];

export const WEBHOOK_TEMPLATE_CATEGORIES = [
  { id: "communication", label: "Communication" },
  { id: "alerting", label: "Alerting & Monitoring" },
  { id: "ehr", label: "EHR Integration" },
  { id: "compliance", label: "Compliance & Security" },
  { id: "devops", label: "DevOps & Automation" },
] as const;
