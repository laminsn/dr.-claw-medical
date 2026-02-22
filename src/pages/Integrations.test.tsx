import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { mockEq } = vi.hoisted(() => ({
  mockEq: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: mockEq }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: () => ({ eq: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }) }),
    }),
  },
}));

vi.mock("@/data/integrations", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/data/integrations")>();
  return {
    ...orig,
    integrationCategories: [
      { id: "llm", name: "AI Models", description: "AI" },
      { id: "crm", name: "CRM", description: "CRM" },
    ],
    integrations: [
      {
        id: "openai", name: "OpenAI", description: "GPT-4o",
        category: "llm" as const, icon: "brain", website: "https://openai.com",
        apiKeyLabel: "API Key", apiKeyPlaceholder: "sk-...",
        features: ["GPT-4o", "Function calling", "Vision", "JSON mode", "Fine-tuning"],
        tier: "starter" as const, popular: true,
      },
      {
        id: "slack", name: "Slack", description: "Team messaging",
        category: "crm" as const, icon: "message-square", website: "https://slack.com",
        apiKeyLabel: "Bot Token", apiKeyPlaceholder: "xoxb-...",
        features: ["Notifications", "Alerts", "Channels"],
        tier: "professional" as const,
      },
    ],
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const map: Record<string, string> = {
        "integrations.title": "EHR & Integrations",
        "integrations.subtitle": "Connect your tools",
        "integrations.all": "All", "integrations.categoryAiModels": "AI Models",
        "integrations.categoryVoiceAi": "Voice AI", "integrations.categoryCrm": "CRM",
        "integrations.categoryCloud": "Cloud", "integrations.categoryProductivity": "Productivity",
        "integrations.categoryHealthcare": "Healthcare", "integrations.categoryCommunication": "Communication",
        "integrations.categoryEhr": "EHR", "integrations.categoryVideo": "Video",
        "integrations.categoryMessaging": "Messaging", "integrations.categoryProjectMgmt": "Project Management",
        "integrations.connect": "Connect", "integrations.connected": "Connected",
        "integrations.connecting": "Connecting...", "integrations.disconnect": "Disconnect",
        "integrations.cancel": "Cancel", "integrations.error": "Error",
        "integrations.popular": "Popular", "integrations.more": "more",
        "integrations.zones": "Zones",
        "integrations.zone1": "Zone 1", "integrations.zone2": "Zone 2", "integrations.zone3": "Zone 3",
        "integrations.zone1Desc": "Zone 1: Clinical — EHR/EMR only",
        "integrations.zone2Desc": "Zone 2: Operations — Internal tools",
        "integrations.zone3Desc": "Zone 3: External — All integrations",
        "integrations.zoneLockedTitle": "Zone-Locked Integration Security",
        "integrations.zoneLockedDesc": "Integrations are isolated by security zone.",
        "integrations.noIntegrations": "No integrations in this category.",
        "integrations.enterApiKey": "Enter your API key to connect",
        "integrations.keyEncrypted": "Key encrypted securely",
        "integrations.features": "Features", "integrations.saveAndConnect": "Save & Connect",
        "integrations.signInWith": "Sign in with {{name}}",
        "integrations.connectName": "Connect {{name}}", "integrations.visitName": "Visit {{name}}",
        "integrations.toastConnected": "Connected", "integrations.toastConnectedDesc": "{{name}} connected.",
        "integrations.toastDisconnected": "Disconnected", "integrations.toastDisconnectedDesc": "{{name}} disconnected.",
        "integrations.toastInvalidKey": "Invalid Key", "integrations.toastInvalidKeyDesc": "{{message}}",
        "integrations.disconnectConfirm": "Disconnect {{name}}?",
      };
      let v = map[key] ?? key;
      if (opts) Object.entries(opts).forEach(([k, val]) => { v = v.replace(`{{${k}}}`, val); });
      return v;
    },
    i18n: { language: "en" },
  }),
}));

vi.mock("@/components/DashboardSidebar", () => ({
  default: () => <nav data-testid="sidebar">Sidebar</nav>,
}));

import Integrations from "./Integrations";

// ---------------------------------------------------------------------------
// Render test — verifies component mounts and displays all elements
// ---------------------------------------------------------------------------

describe("Integrations Page — render", () => {
  it("renders page with title, zone banner, tabs, and integration cards", async () => {
    render(<MemoryRouter><Integrations /></MemoryRouter>);
    // Wait for supabase load to complete
    expect(await screen.findByText("OpenAI")).toBeInTheDocument();
    // Title & subtitle
    expect(screen.getByText("EHR & Integrations")).toBeInTheDocument();
    expect(screen.getByText("Connect your tools")).toBeInTheDocument();
    // Sidebar
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    // Zone banner
    expect(screen.getByText("Zone-Locked Integration Security")).toBeInTheDocument();
    expect(screen.getByText(/Zone 1: Clinical/)).toBeInTheDocument();
    expect(screen.getByText(/Zone 2: Operations/)).toBeInTheDocument();
    expect(screen.getByText(/Zone 3: External/)).toBeInTheDocument();
    // Category tabs (translated, not hardcoded)
    const tabs = screen.getAllByRole("button").map((b) => b.textContent);
    expect(tabs).toContain("All");
    expect(tabs).toContain("AI Models");
    expect(tabs).toContain("CRM");
    // Integration cards
    expect(screen.getByText("Slack")).toBeInTheDocument();
    // Badge: Popular on OpenAI
    expect(screen.getAllByText("Popular")).toHaveLength(1);
    // LLM → Sign in, non-LLM → Connect
    expect(screen.getByText("Sign in with OpenAI")).toBeInTheDocument();
    expect(screen.getAllByText("Connect")).toHaveLength(1);
    // +2 more features on OpenAI (5 features, shows 3)
    expect(screen.getAllByText("+2 more")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Translation integrity — pure file checks, no rendering
// ---------------------------------------------------------------------------

describe("Integrations translations", () => {
  it("source uses t() for Cancel and Error (no hardcoded strings)", async () => {
    const fs = await import("fs");
    const src = fs.readFileSync("src/pages/Integrations.tsx", "utf-8");
    expect(src).toContain('t("integrations.cancel")');
    expect(src).toContain('t("integrations.error")');
    expect(src).not.toMatch(/title:\s*"Error"/);
    expect(src).not.toMatch(/>\s*Cancel\s*</);
  });

  it("category tabs use translated categoryLabel mapping", async () => {
    const fs = await import("fs");
    const src = fs.readFileSync("src/pages/Integrations.tsx", "utf-8");
    expect(src).toContain("categoryLabel[c.id]");
  });

  it("all t() keys used in component exist in en.json", async () => {
    const fs = await import("fs");
    const src = fs.readFileSync("src/pages/Integrations.tsx", "utf-8");
    const used = [...new Set([...src.matchAll(/t\("(integrations\.\w+)"/g)].map((m) => m[1]))];
    const en = JSON.parse(fs.readFileSync("src/i18n/locales/en.json", "utf-8"));
    const keys = Object.keys(en.integrations);
    for (const k of used) {
      expect(keys, `Missing: ${k}`).toContain(k.replace("integrations.", ""));
    }
  });

  it("en, es, pt have identical integrations key sets (50 keys each)", async () => {
    const fs = await import("fs");
    const load = (lang: string) =>
      Object.keys(JSON.parse(fs.readFileSync(`src/i18n/locales/${lang}.json`, "utf-8")).integrations).sort();
    const enKeys = load("en");
    expect(enKeys).toHaveLength(50);
    expect(load("es")).toEqual(enKeys);
    expect(load("pt")).toEqual(enKeys);
  });

  it("es and pt values are properly translated (not identical to English)", async () => {
    const fs = await import("fs");
    const en = JSON.parse(fs.readFileSync("src/i18n/locales/en.json", "utf-8")).integrations;
    const es = JSON.parse(fs.readFileSync("src/i18n/locales/es.json", "utf-8")).integrations;
    const pt = JSON.parse(fs.readFileSync("src/i18n/locales/pt.json", "utf-8")).integrations;
    const skip = new Set(["categoryCrm", "categoryEhr", "zone1", "zone2", "zone3", "toastInvalidKeyDesc"]);
    for (const k of Object.keys(en)) {
      if (skip.has(k) || en[k].length <= 10) continue;
      expect.soft(es[k], `es.${k} not translated`).not.toBe(en[k]);
      expect.soft(pt[k], `pt.${k} not translated`).not.toBe(en[k]);
    }
  });
});
