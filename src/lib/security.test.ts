import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitizeInput,
  isValidEmail,
  isSafeIdentifier,
  containsPhi,
  redactPhi,
  classifyPhiRisk,
  checkClientRateLimit,
  resetClientRateLimit,
  maskApiKey,
  validateApiKeyFormat,
  isModelAllowedInZone,
  getZonePolicy,
  detectDistress,
  DISTRESS_RESPONSE,
} from "./security";

// ── Input Sanitization ────────────────────────────────────────────────

describe("sanitizeInput", () => {
  it("escapes HTML tags", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).not.toContain("<");
    expect(sanitizeInput("<script>alert('xss')</script>")).not.toContain(">");
  });

  it("escapes quotes", () => {
    const result = sanitizeInput('He said "hello" & \'goodbye\'');
    expect(result).not.toContain('"');
    expect(result).not.toContain("'");
  });

  it("escapes forward slashes", () => {
    expect(sanitizeInput("a/b")).toContain("&#x2F;");
  });

  it("returns empty string unchanged", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("leaves plain alphanumeric text unchanged", () => {
    expect(sanitizeInput("hello world 123")).toBe("hello world 123");
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("name+tag@domain.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isSafeIdentifier", () => {
  it("accepts alphanumeric with hyphens and underscores", () => {
    expect(isSafeIdentifier("agent-123_key")).toBe(true);
  });

  it("rejects special characters", () => {
    expect(isSafeIdentifier("agent key")).toBe(false);
    expect(isSafeIdentifier("user@name")).toBe(false);
    expect(isSafeIdentifier("path/to/file")).toBe(false);
  });

  it("rejects strings over 128 characters", () => {
    expect(isSafeIdentifier("a".repeat(129))).toBe(false);
    expect(isSafeIdentifier("a".repeat(128))).toBe(true);
  });
});

// ── PHI Detection ─────────────────────────────────────────────────────

describe("containsPhi", () => {
  it("detects SSN format", () => {
    expect(containsPhi("Patient SSN is 123-45-6789")).toBe(true);
  });

  it("detects MRN", () => {
    expect(containsPhi("MRN: ABC12345")).toBe(true);
    expect(containsPhi("mrn#XYZ999")).toBe(true);
  });

  it("detects dates that could be DOB", () => {
    expect(containsPhi("Born on 01/15/1990")).toBe(true);
  });

  it("detects labeled DOB", () => {
    expect(containsPhi("DOB: 1990-01-15")).toBe(true);
  });

  it("detects patient identifiers", () => {
    expect(containsPhi("patient name: John Smith")).toBe(true);
    expect(containsPhi("pt id: 12345")).toBe(true);
  });

  it("returns false for clean text", () => {
    expect(containsPhi("The weather is nice today")).toBe(false);
    expect(containsPhi("Schedule a meeting for tomorrow")).toBe(false);
  });
});

describe("redactPhi", () => {
  it("redacts SSN", () => {
    const result = redactPhi("SSN: 123-45-6789");
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("123-45-6789");
  });

  it("redacts MRN", () => {
    const result = redactPhi("MRN: ABC12345");
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("ABC12345");
  });

  it("leaves clean text unchanged", () => {
    expect(redactPhi("No PHI here")).toBe("No PHI here");
  });
});

describe("classifyPhiRisk", () => {
  it("classifies SSN as high risk", () => {
    expect(classifyPhiRisk("SSN 123-45-6789")).toBe("high");
  });

  it("classifies MRN as high risk", () => {
    expect(classifyPhiRisk("MRN: ABC123")).toBe("high");
  });

  it("classifies DOB as medium risk", () => {
    expect(classifyPhiRisk("DOB: 1990-01-15")).toBe("medium");
  });

  it("classifies dates as low risk", () => {
    expect(classifyPhiRisk("Date: 01/15/2024")).toBe("low");
  });

  it("classifies clean text as none", () => {
    expect(classifyPhiRisk("Hello world")).toBe("none");
  });
});

// ── Rate Limiting ─────────────────────────────────────────────────────

describe("checkClientRateLimit", () => {
  beforeEach(() => {
    resetClientRateLimit("test_action");
  });

  it("allows first request", () => {
    const result = checkClientRateLimit("test_action", {
      maxRequests: 3,
      windowMs: 60_000,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks after limit exceeded", () => {
    const config = { maxRequests: 2, windowMs: 60_000 };
    checkClientRateLimit("test_action", config);
    checkClientRateLimit("test_action", config);
    const result = checkClientRateLimit("test_action", config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("allows unknown actions (no config)", () => {
    const result = checkClientRateLimit("unknown_action_xyz");
    expect(result.allowed).toBe(true);
  });

  it("resets after calling resetClientRateLimit", () => {
    const config = { maxRequests: 1, windowMs: 60_000 };
    checkClientRateLimit("test_action", config);
    checkClientRateLimit("test_action", config); // blocked
    resetClientRateLimit("test_action");
    const result = checkClientRateLimit("test_action", config);
    expect(result.allowed).toBe(true);
  });
});

// ── API Key Validation ────────────────────────────────────────────────

describe("maskApiKey", () => {
  it("masks middle of long keys", () => {
    const result = maskApiKey("sk-ant-1234567890abcdef");
    expect(result).toMatch(/^sk-a\*+cdef$/);
  });

  it("returns **** for short keys", () => {
    expect(maskApiKey("short")).toBe("****");
  });
});

describe("validateApiKeyFormat", () => {
  it("validates OpenAI key format", () => {
    expect(validateApiKeyFormat("openai", "sk-abc123456789").valid).toBe(true);
    expect(validateApiKeyFormat("openai", "wrong-key-123").valid).toBe(false);
  });

  it("validates Anthropic key format", () => {
    expect(validateApiKeyFormat("anthropic", "sk-ant-abc123456789").valid).toBe(true);
    expect(validateApiKeyFormat("anthropic", "sk-abc123456789").valid).toBe(false);
  });

  it("validates Google key format", () => {
    expect(validateApiKeyFormat("google", "AIzaSyD1234567890").valid).toBe(true);
    expect(validateApiKeyFormat("gemini", "AIzaSyD1234567890").valid).toBe(true);
  });

  it("rejects empty keys", () => {
    expect(validateApiKeyFormat("openai", "").valid).toBe(false);
  });

  it("rejects very short keys", () => {
    expect(validateApiKeyFormat("openai", "sk-1").valid).toBe(false);
  });
});

// ── Zone Enforcement ──────────────────────────────────────────────────

describe("isModelAllowedInZone", () => {
  it("allows self-hosted models in clinical zone", () => {
    expect(isModelAllowedInZone("self-hosted", "clinical")).toBe(true);
    expect(isModelAllowedInZone("llama-3.1", "clinical")).toBe(true);
  });

  it("blocks external models in clinical zone", () => {
    expect(isModelAllowedInZone("claude", "clinical")).toBe(false);
    expect(isModelAllowedInZone("openai", "clinical")).toBe(false);
  });

  it("allows all models in operations zone", () => {
    expect(isModelAllowedInZone("claude", "operations")).toBe(true);
    expect(isModelAllowedInZone("openai", "operations")).toBe(true);
    expect(isModelAllowedInZone("self-hosted", "operations")).toBe(true);
  });

  it("allows all models in external zone", () => {
    expect(isModelAllowedInZone("claude", "external")).toBe(true);
    expect(isModelAllowedInZone("gemini", "external")).toBe(true);
  });
});

describe("getZonePolicy", () => {
  it("clinical zone requires PHI scan and audit", () => {
    const policy = getZonePolicy("clinical");
    expect(policy.requirePhiScan).toBe(true);
    expect(policy.requireAuditLog).toBe(true);
    expect(policy.allowExternalApi).toBe(false);
  });

  it("operations zone allows external API", () => {
    const policy = getZonePolicy("operations");
    expect(policy.allowExternalApi).toBe(true);
    expect(policy.requirePhiScan).toBe(true);
  });

  it("external zone has relaxed policies", () => {
    const policy = getZonePolicy("external");
    expect(policy.requirePhiScan).toBe(false);
    expect(policy.requireAuditLog).toBe(false);
    expect(policy.maxTokensPerRequest).toBe(16384);
  });
});

// ── Distress Detection ────────────────────────────────────────────────

describe("detectDistress", () => {
  it("detects suicide-related keywords", () => {
    expect(detectDistress("I want to kill myself")).toBe(true);
    expect(detectDistress("thinking about suicide")).toBe(true);
  });

  it("detects self-harm keywords", () => {
    expect(detectDistress("I want to hurt myself")).toBe(true);
  });

  it("detects emergency keywords", () => {
    expect(detectDistress("this is an emergency")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(detectDistress("SUICIDE")).toBe(true);
    expect(detectDistress("Help Me")).toBe(true);
  });

  it("returns false for normal text", () => {
    expect(detectDistress("How do I schedule an appointment?")).toBe(false);
  });

  it("has a standard distress response", () => {
    expect(DISTRESS_RESPONSE).toContain("988");
    expect(DISTRESS_RESPONSE).toContain("911");
  });
});
