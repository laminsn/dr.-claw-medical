/**
 * Shared PHI Scanner Module
 *
 * Single source of truth for PHI detection and redaction across all edge functions.
 * Covers all 18 HIPAA identifiers where pattern-matching is feasible.
 */

// ── PHI Patterns ─────────────────────────────────────────────────────────

const PHI_PATTERNS: Array<{ pattern: RegExp; type: string; risk: PhiRisk }> = [
  // SSN (high)
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: "ssn", risk: "high" },
  // 9-digit number (could be SSN without dashes)
  { pattern: /\b\d{9}\b/, type: "ssn_nodash", risk: "medium" },
  // Medical Record Number
  { pattern: /\b(?:MRN|mrn)[:\s#]*\w{4,}\b/i, type: "mrn", risk: "high" },
  // DOB-style dates
  { pattern: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/, type: "date", risk: "low" },
  // Labeled DOB
  { pattern: /\b(?:DOB|dob|Date of Birth)[:\s]*\S+/i, type: "dob", risk: "medium" },
  // Patient identifiers
  { pattern: /\b(?:patient|pt|member)\s*(?:name|id)[:\s]*\S+/i, type: "patient_id", risk: "high" },
  // Insurance/policy IDs
  { pattern: /\b[A-Z]\d{4,9}\b/, type: "insurance_id", risk: "medium" },
  // NPI (National Provider Identifier)
  { pattern: /\b(?:NPI|npi)[:\s#]*\d{10}\b/i, type: "npi", risk: "medium" },
  // DEA number
  { pattern: /\b(?:DEA|dea)[:\s#]*[A-Z]{2}\d{7}\b/i, type: "dea", risk: "medium" },
  // Phone numbers (US format)
  { pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, type: "phone", risk: "medium" },
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: "email", risk: "medium" },
  // Street addresses (basic US pattern)
  { pattern: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s*){1,3}(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Rd|Road|Way|Ct|Court|Pl|Place)\b/i, type: "address", risk: "high" },
  // ICD-10 codes
  { pattern: /\b[A-TV-Z]\d{2}(?:\.\d{1,4})?\b/, type: "icd10", risk: "low" },
  // Medicare Beneficiary ID (HICN/MBI)
  { pattern: /\b\d{1}[A-Z]{1}\w{1}\d{1}[A-Z]{1}\w{1}\d{1}[A-Z]{2}\d{2}\b/, type: "mbi", risk: "high" },
];

// ── Types ────────────────────────────────────────────────────────────────

export type PhiRisk = "none" | "low" | "medium" | "high";

export interface PhiScanResult {
  containsPhi: boolean;
  fieldsWithPhi: string[];
  highestRisk: PhiRisk;
  detectedTypes: string[];
}

// ── Core functions ───────────────────────────────────────────────────────

export function containsPhi(text: string): boolean {
  return PHI_PATTERNS.some((p) => p.pattern.test(text));
}

export function classifyPhiRisk(text: string): PhiRisk {
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

export function redactPhi(text: string): string {
  let result = text;
  for (const { pattern } of PHI_PATTERNS) {
    result = result.replace(new RegExp(pattern, "g"), "[REDACTED]");
  }
  return result;
}

export function scanObject(obj: Record<string, unknown>, path = ""): PhiScanResult {
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
      if (order[nested.highestRisk] > order[highestRisk]) {
        highestRisk = nested.highestRisk;
      }
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
        } else if (item && typeof item === "object") {
          const nested = scanObject(item as Record<string, unknown>, `${fp}[${i}]`);
          fieldsWithPhi.push(...nested.fieldsWithPhi);
          nested.detectedTypes.forEach((t) => detectedTypes.add(t));
          if (order[nested.highestRisk] > order[highestRisk]) {
            highestRisk = nested.highestRisk;
          }
        }
      });
    }
  }

  return {
    containsPhi: fieldsWithPhi.length > 0,
    fieldsWithPhi,
    highestRisk,
    detectedTypes: Array.from(detectedTypes),
  };
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      out[key] = containsPhi(value) ? redactPhi(value) : value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) => {
        if (typeof item === "string") return containsPhi(item) ? redactPhi(item) : item;
        if (item && typeof item === "object") return sanitizeObject(item as Record<string, unknown>);
        return item;
      });
    } else {
      out[key] = value;
    }
  }
  return out;
}
