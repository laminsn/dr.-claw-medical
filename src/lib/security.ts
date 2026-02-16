/**
 * Security utilities for the Dr. Claw platform.
 * Provides input sanitization, PHI detection, and session guards.
 */

/* ── Input Sanitization ──────────────────────────────────────────── */

/** Strip HTML tags to prevent XSS via user-supplied text */
export function sanitizeInput(raw: string): string {
  return raw
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── PHI Detection (client-side redaction layer) ─────────────────── */

const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/,                        // SSN
  /\b\d{9}\b/,                                      // 9-digit ID
  /\b(?:MRN|mrn)[:\s#]*\w{4,}\b/i,                  // Medical Record Number
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/,              // DOB-style dates
  /\b(?:DOB|dob|Date of Birth)[:\s]*\S+/i,           // Labeled DOB
  /\b(?:patient|pt|member)\s*(?:name|id)[:\s]*\S+/i, // Patient identifiers
];

/** Check whether a string likely contains PHI */
export function containsPhi(text: string): boolean {
  return PHI_PATTERNS.some((p) => p.test(text));
}

/** Redact potential PHI tokens from a string */
export function redactPhi(text: string): string {
  let result = text;
  for (const pattern of PHI_PATTERNS) {
    result = result.replace(new RegExp(pattern, "g"), "[REDACTED]");
  }
  return result;
}

/* ── Session Security ────────────────────────────────────────────── */

/** Maximum idle time before we consider the session stale (ms) */
export const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 min default

let lastActivity = Date.now();

export function recordActivity(): void {
  lastActivity = Date.now();
}

export function isSessionStale(): boolean {
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
}

/* ── Distress Detection (keyword-based first pass) ───────────────── */

const DISTRESS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "self-harm",
  "want to die", "hurt myself", "no reason to live", "overdose",
  "emergency", "crisis", "in danger", "help me",
];

/** Detect potential distress signals in text */
export function detectDistress(text: string): boolean {
  const lower = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Standard distress response message */
export const DISTRESS_RESPONSE =
  "It sounds like you may be experiencing a crisis. Please contact the 988 Suicide & Crisis Lifeline (call or text 988) or go to your nearest emergency room. If you are in immediate danger, call 911.";
