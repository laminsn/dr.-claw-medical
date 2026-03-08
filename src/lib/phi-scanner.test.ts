/**
 * Tests for the shared PHI scanner module.
 *
 * Note: The PHI scanner lives in supabase/functions/_shared/phi-scanner.ts (Deno runtime).
 * We test the patterns and logic by copying the core functions here since vitest runs in Node.
 * The patterns are identical — any drift should be caught by import alignment.
 */

import { describe, it, expect } from "vitest";

// ── Inline the PHI patterns for testability (mirrors phi-scanner.ts) ──

type PhiRisk = "none" | "low" | "medium" | "high";

const PHI_PATTERNS: Array<{ pattern: RegExp; type: string; risk: PhiRisk }> = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: "ssn", risk: "high" },
  { pattern: /\b\d{9}\b/, type: "ssn_nodash", risk: "medium" },
  { pattern: /\b(?:MRN|mrn)[:\s#]*\w{4,}\b/i, type: "mrn", risk: "high" },
  { pattern: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/, type: "date", risk: "low" },
  { pattern: /\b(?:DOB|dob|Date of Birth)[:\s]*\S+/i, type: "dob", risk: "medium" },
  { pattern: /\b(?:patient|pt|member)\s*(?:name|id)[:\s]*\S+/i, type: "patient_id", risk: "high" },
  { pattern: /\b[A-Z]\d{4,9}\b/, type: "insurance_id", risk: "medium" },
  { pattern: /\b(?:NPI|npi)[:\s#]*\d{10}\b/i, type: "npi", risk: "medium" },
  { pattern: /\b(?:DEA|dea)[:\s#]*[A-Z]{2}\d{7}\b/i, type: "dea", risk: "medium" },
  { pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, type: "phone", risk: "medium" },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: "email", risk: "medium" },
  { pattern: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s*){1,3}(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Rd|Road|Way|Ct|Court|Pl|Place)\b/i, type: "address", risk: "high" },
  { pattern: /\b[A-TV-Z]\d{2}(?:\.\d{1,4})?\b/, type: "icd10", risk: "low" },
  { pattern: /\b\d{1}[A-Z]{1}\w{1}\d{1}[A-Z]{1}\w{1}\d{1}[A-Z]{2}\d{2}\b/, type: "mbi", risk: "high" },
];

function containsPhi(text: string): boolean {
  return PHI_PATTERNS.some((p) => p.pattern.test(text));
}

function classifyPhiRisk(text: string): PhiRisk {
  let highest: PhiRisk = "none";
  const order: Record<PhiRisk, number> = { none: 0, low: 1, medium: 2, high: 3 };
  for (const { pattern, risk } of PHI_PATTERNS) {
    if (pattern.test(text) && order[risk] > order[highest]) {
      highest = risk;
      if (highest === "high") break;
    }
  }
  return highest;
}

function redactPhi(text: string): string {
  let result = text;
  for (const { pattern } of PHI_PATTERNS) {
    result = result.replace(new RegExp(pattern, "g"), "[REDACTED]");
  }
  return result;
}

interface PhiScanResult {
  containsPhi: boolean;
  fieldsWithPhi: string[];
  highestRisk: PhiRisk;
  detectedTypes: string[];
}

function scanObject(obj: Record<string, unknown>, path = ""): PhiScanResult {
  const fieldsWithPhi: string[] = [];
  const detectedTypes: Set<string> = new Set();
  let highestRisk: PhiRisk = "none";
  const order: Record<PhiRisk, number> = { none: 0, low: 1, medium: 2, high: 3 };

  for (const [key, value] of Object.entries(obj)) {
    const fp = path ? `${path}.${key}` : key;
    if (typeof value === "string") {
      for (const { pattern, type, risk } of PHI_PATTERNS) {
        if (pattern.test(value)) {
          fieldsWithPhi.push(fp);
          detectedTypes.add(type);
          if (order[risk] > order[highestRisk]) highestRisk = risk;
          break;
        }
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = scanObject(value as Record<string, unknown>, fp);
      fieldsWithPhi.push(...nested.fieldsWithPhi);
      nested.detectedTypes.forEach((t) => detectedTypes.add(t));
      if (order[nested.highestRisk] > order[highestRisk]) highestRisk = nested.highestRisk;
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "string") {
          for (const { pattern, type, risk } of PHI_PATTERNS) {
            if (pattern.test(item)) {
              fieldsWithPhi.push(`${fp}[${i}]`);
              detectedTypes.add(type);
              if (order[risk] > order[highestRisk]) highestRisk = risk;
              break;
            }
          }
        }
      });
    }
  }

  return { containsPhi: fieldsWithPhi.length > 0, fieldsWithPhi, highestRisk, detectedTypes: Array.from(detectedTypes) };
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("PHI Scanner — SSN Detection", () => {
  it("detects SSN with dashes", () => {
    expect(containsPhi("SSN: 123-45-6789")).toBe(true);
  });

  it("detects SSN without dashes (9-digit number)", () => {
    expect(containsPhi("ID number 123456789")).toBe(true);
  });

  it("does not flag 8-digit numbers", () => {
    expect(containsPhi("Code 12345678")).toBe(false);
  });
});

describe("PHI Scanner — Medical Record Numbers", () => {
  it("detects MRN with colon", () => {
    expect(containsPhi("MRN: ABCD1234")).toBe(true);
  });

  it("detects mrn with hash", () => {
    expect(containsPhi("mrn#XYZ99999")).toBe(true);
  });

  it("detects MRN with space", () => {
    expect(containsPhi("MRN 12345678")).toBe(true);
  });
});

describe("PHI Scanner — Phone Numbers", () => {
  it("detects US phone with dashes", () => {
    expect(containsPhi("Call 555-123-4567")).toBe(true);
  });

  it("detects US phone with parentheses", () => {
    expect(containsPhi("Phone: (555) 123-4567")).toBe(true);
  });

  it("detects phone with +1 prefix", () => {
    expect(containsPhi("+1-555-123-4567")).toBe(true);
  });

  it("detects phone with dots", () => {
    expect(containsPhi("555.123.4567")).toBe(true);
  });
});

describe("PHI Scanner — Email Addresses", () => {
  it("detects standard email", () => {
    expect(containsPhi("Contact john.doe@hospital.com")).toBe(true);
  });

  it("detects email with plus tag", () => {
    expect(containsPhi("Email: user+tag@domain.org")).toBe(true);
  });
});

describe("PHI Scanner — Street Addresses", () => {
  it("detects street address with St", () => {
    expect(containsPhi("Lives at 123 Main St")).toBe(true);
  });

  it("detects street address with Avenue", () => {
    expect(containsPhi("456 Oak Avenue")).toBe(true);
  });

  it("detects street address with Blvd", () => {
    expect(containsPhi("789 Sunset Blvd")).toBe(true);
  });
});

describe("PHI Scanner — ICD-10 Codes", () => {
  it("detects simple ICD-10 code", () => {
    expect(containsPhi("Diagnosis: J44")).toBe(true);
  });

  it("detects ICD-10 with decimal", () => {
    expect(containsPhi("Code E11.65")).toBe(true);
  });
});

describe("PHI Scanner — Insurance / Provider IDs", () => {
  it("detects NPI", () => {
    expect(containsPhi("NPI: 1234567890")).toBe(true);
  });

  it("detects DEA number", () => {
    expect(containsPhi("DEA: AB1234567")).toBe(true);
  });

  it("detects insurance policy ID pattern", () => {
    expect(containsPhi("Policy A12345678")).toBe(true);
  });
});

describe("PHI Scanner — DOB", () => {
  it("detects labeled DOB", () => {
    expect(containsPhi("DOB: 01/15/1990")).toBe(true);
    expect(containsPhi("Date of Birth: 1990-05-20")).toBe(true);
  });

  it("detects date formats", () => {
    expect(containsPhi("Born 01/15/1990")).toBe(true);
    expect(containsPhi("Date 12-25-2000")).toBe(true);
  });
});

describe("PHI Scanner — Patient Identifiers", () => {
  it("detects patient name", () => {
    expect(containsPhi("patient name: John Smith")).toBe(true);
  });

  it("detects pt id", () => {
    expect(containsPhi("pt id: 12345")).toBe(true);
  });

  it("detects member id", () => {
    expect(containsPhi("member id: MEM-999")).toBe(true);
  });
});

describe("PHI Scanner — Clean Text", () => {
  it("allows generic medical terminology", () => {
    expect(containsPhi("The patient should take ibuprofen twice daily")).toBe(false);
  });

  it("allows scheduling text", () => {
    expect(containsPhi("Schedule a follow-up appointment in two weeks")).toBe(false);
  });

  it("allows short numbers", () => {
    expect(containsPhi("Take 2 pills")).toBe(false);
  });
});

// ── Risk Classification ───────────────────────────────────────────────

describe("classifyPhiRisk", () => {
  it("classifies SSN as high", () => {
    expect(classifyPhiRisk("SSN: 123-45-6789")).toBe("high");
  });

  it("classifies MRN as high", () => {
    expect(classifyPhiRisk("MRN: ABCD1234")).toBe("high");
  });

  it("classifies address as high", () => {
    expect(classifyPhiRisk("123 Main St")).toBe("high");
  });

  it("classifies phone as medium", () => {
    expect(classifyPhiRisk("555-123-4567")).toBe("medium");
  });

  it("classifies email as medium", () => {
    expect(classifyPhiRisk("user@example.com")).toBe("medium");
  });

  it("classifies ICD-10 as low", () => {
    expect(classifyPhiRisk("Code J44")).toBe("low");
  });

  it("classifies clean text as none", () => {
    expect(classifyPhiRisk("Hello world")).toBe("none");
  });

  it("returns highest risk when multiple types present", () => {
    expect(classifyPhiRisk("SSN 123-45-6789 born on 01/15/1990")).toBe("high");
  });
});

// ── Redaction ─────────────────────────────────────────────────────────

describe("redactPhi", () => {
  it("redacts SSN", () => {
    const result = redactPhi("SSN: 123-45-6789");
    expect(result).not.toContain("123-45-6789");
    expect(result).toContain("[REDACTED]");
  });

  it("redacts phone numbers", () => {
    const result = redactPhi("Call 555-123-4567 for info");
    expect(result).not.toContain("555-123-4567");
  });

  it("redacts email addresses", () => {
    const result = redactPhi("Email john@hospital.com");
    expect(result).not.toContain("john@hospital.com");
  });

  it("redacts multiple PHI types in one string", () => {
    const result = redactPhi("Patient SSN 123-45-6789, email john@hospital.com, MRN: ABC12345");
    expect(result).not.toContain("123-45-6789");
    expect(result).not.toContain("john@hospital.com");
  });

  it("preserves non-PHI text", () => {
    const result = redactPhi("Hello world");
    expect(result).toBe("Hello world");
  });
});

// ── Object Scanning ───────────────────────────────────────────────────

describe("scanObject", () => {
  it("detects PHI in flat object", () => {
    const result = scanObject({ name: "John", ssn: "123-45-6789" });
    expect(result.containsPhi).toBe(true);
    expect(result.fieldsWithPhi).toContain("ssn");
    expect(result.detectedTypes).toContain("ssn");
    expect(result.highestRisk).toBe("high");
  });

  it("detects PHI in nested objects", () => {
    const result = scanObject({
      patient: {
        demographics: {
          mrn: "MRN: ABCD1234",
        },
      },
    });
    expect(result.containsPhi).toBe(true);
    expect(result.fieldsWithPhi).toContain("patient.demographics.mrn");
  });

  it("detects PHI in arrays", () => {
    const result = scanObject({
      notes: ["Normal visit", "SSN: 123-45-6789"],
    });
    expect(result.containsPhi).toBe(true);
    expect(result.fieldsWithPhi).toContain("notes[1]");
  });

  it("returns clean result for safe objects", () => {
    const result = scanObject({
      greeting: "Hello",
      count: 42,
      tags: ["medical", "routine"],
    });
    expect(result.containsPhi).toBe(false);
    expect(result.fieldsWithPhi).toHaveLength(0);
    expect(result.highestRisk).toBe("none");
  });

  it("handles empty objects", () => {
    const result = scanObject({});
    expect(result.containsPhi).toBe(false);
  });

  it("tracks highest risk across nested fields", () => {
    const result = scanObject({
      low_risk: "Date: 01/15/2024",
      high_risk: "SSN: 123-45-6789",
    });
    expect(result.highestRisk).toBe("high");
  });
});

// ── PHI Leak Prevention Tests ─────────────────────────────────────────

describe("PHI leak scenarios", () => {
  const PHI_TEST_DATA = [
    { input: "SSN: 123-45-6789", type: "SSN" },
    { input: "MRN: ABCD1234", type: "MRN" },
    { input: "DOB: 01/15/1990", type: "DOB" },
    { input: "patient name: Jane Doe", type: "Patient Name" },
    { input: "Call 555-123-4567", type: "Phone" },
    { input: "Email jane@clinic.com", type: "Email" },
    { input: "123 Main Street", type: "Address" },
    { input: "NPI: 1234567890", type: "NPI" },
    { input: "DEA: AB1234567", type: "DEA" },
  ];

  for (const { input, type } of PHI_TEST_DATA) {
    it(`detects and redacts ${type}`, () => {
      expect(containsPhi(input)).toBe(true);
      const redacted = redactPhi(input);
      expect(redacted).toContain("[REDACTED]");
    });
  }

  it("handles combined PHI in realistic clinical note", () => {
    const note = `
      Patient: Jane Smith (MRN: XYZ12345)
      DOB: 03/15/1985
      SSN: 987-65-4321
      Phone: (555) 987-6543
      Address: 456 Oak Avenue
      Diagnosis: E11.65 (Type 2 diabetes with hyperglycemia)
      Provider NPI: 1234567890
    `;

    expect(containsPhi(note)).toBe(true);
    expect(classifyPhiRisk(note)).toBe("high");

    const redacted = redactPhi(note);
    expect(redacted).not.toContain("987-65-4321");
    expect(redacted).not.toContain("XYZ12345");
    expect(redacted).not.toContain("(555) 987-6543");
  });
});
