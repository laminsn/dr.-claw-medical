import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock dependencies before importing the component
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
    loading: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      insert: vi.fn(() => ({
        catch: vi.fn(() => Promise.resolve()),
      })),
    })),
    rpc: vi.fn(() => ({
      catch: vi.fn(() => Promise.resolve()),
    })),
  },
}));

vi.mock("@/data/agentTemplates", () => ({
  agentTemplates: [
    {
      id: "front-desk-agent",
      name: "Front Desk Agent",
      description: "Handles patient intake",
      category: "healthcare",
      tier: "core",
      suggestedModel: "Claude",
      defaultSkills: ["patient-intake", "scheduling"],
      longDescription: "A front desk AI agent.",
    },
    {
      id: "insurance-verifier",
      name: "Insurance Verifier",
      description: "Verifies insurance coverage",
      category: "operations",
      tier: "core",
      suggestedModel: "OpenAI",
      defaultSkills: ["insurance-verification"],
      longDescription: "An insurance verification agent.",
    },
    {
      id: "patient-outreach-agent",
      name: "Patient Outreach",
      description: "Reduces no-shows",
      category: "marketing",
      tier: "core",
      suggestedModel: "Claude",
      defaultSkills: ["outreach"],
      longDescription: "A patient outreach agent.",
    },
    {
      id: "clinical-coordinator",
      name: "Clinical Coordinator",
      description: "Streamlines documentation",
      category: "healthcare",
      tier: "advanced",
      suggestedModel: "Claude",
      defaultSkills: ["documentation"],
      longDescription: "A clinical coordinator agent.",
    },
    {
      id: "marketing-strategist",
      name: "Marketing Maven",
      description: "Attracts patients",
      category: "marketing",
      tier: "core",
      suggestedModel: "OpenAI",
      defaultSkills: ["marketing"],
      longDescription: "A marketing strategist agent.",
    },
  ],
}));

vi.mock("@/data/hospiceCareTemplates", () => ({
  hospiceCareTemplates: [
    {
      id: "hospice-ceo-diane",
      name: "Diane — CEO",
      description: "Chief Executive Officer",
      category: "healthcare",
      tier: "enterprise",
      suggestedModel: "Claude",
      defaultSkills: ["ceo"],
      longDescription: "CEO agent.",
      level: "ceo",
      department: "executive",
    },
    {
      id: "hospice-dir-marketing",
      name: "Camila — Marketing Director",
      description: "Marketing Director",
      category: "healthcare",
      tier: "enterprise",
      suggestedModel: "Claude",
      defaultSkills: ["marketing"],
      longDescription: "Marketing director agent.",
      level: "director",
      department: "marketing",
      parentTemplateId: "hospice-ceo-diane",
    },
  ],
  HOSPICE_DEPARTMENTS: ["executive", "marketing"],
}));

vi.mock("@/data/orgChartPacks", () => ({
  ORG_CHART_PACKS: [
    {
      id: "hospice-care-team",
      name: "Hospice Care Team",
      description: "Full hospice operation with CEO + directors + workers.",
      icon: "Heart",
      agentIds: ["hospice-ceo-diane", "hospice-dir-marketing"],
      hierarchy: [],
      totalAgents: 2,
      departments: ["executive", "marketing"],
      recommended: true,
    },
  ],
}));

import Onboarding from "./Onboarding";

function renderOnboarding() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("Onboarding Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome step initially", () => {
    renderOnboarding();
    expect(screen.getByText("Welcome to Dr. Claw Medical")).toBeInTheDocument();
    expect(screen.getByText(/Get Started/)).toBeInTheDocument();
  });

  it("navigates to pick-pack step on Get Started click", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    expect(screen.getByText("Choose Your Team")).toBeInTheDocument();
  });

  it("shows all quick start packs including hospice", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    expect(screen.getByText("Front Office Starter")).toBeInTheDocument();
    expect(screen.getByText("Clinical Operations")).toBeInTheDocument();
    expect(screen.getByText("Growth Engine")).toBeInTheDocument();
    expect(screen.getByText("Hospice Care Team")).toBeInTheDocument();
  });

  it("shows recommended badges on recommended packs", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    const badges = screen.getAllByText("Recommended");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("enables Continue button after selecting a pack", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));

    // Continue should be disabled initially
    const continueBtn = screen.getByText(/Continue/);
    expect(continueBtn.closest("button")).toBeDisabled();

    // Click a pack
    fireEvent.click(screen.getByText("Front Office Starter"));

    // Continue should now be enabled
    expect(continueBtn.closest("button")).not.toBeDisabled();
  });

  it("navigates to customize step after selecting pack and clicking Continue", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    fireEvent.click(screen.getByText("Front Office Starter"));
    fireEvent.click(screen.getByText(/Continue/));

    expect(screen.getByText(/Customize Front Office Starter/)).toBeInTheDocument();
    expect(screen.getByText(/3 agents? selected/)).toBeInTheDocument();
  });

  it("can go back from pick-pack to welcome", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    expect(screen.getByText("Choose Your Team")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByText("Welcome to Dr. Claw Medical")).toBeInTheDocument();
  });

  it("allows custom selection without a pack", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    fireEvent.click(screen.getByText("Custom Selection"));

    expect(screen.getByText("Build Your Team")).toBeInTheDocument();
    expect(screen.getByText(/0 agents selected/)).toBeInTheDocument();
  });

  it("toggles agent templates in customize step", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    fireEvent.click(screen.getByText("Custom Selection"));

    // Select an agent
    fireEvent.click(screen.getByText("Front Desk Agent"));
    expect(screen.getByText(/1 agent selected/)).toBeInTheDocument();

    // Deselect it
    fireEvent.click(screen.getByText("Front Desk Agent"));
    expect(screen.getByText(/0 agents selected/)).toBeInTheDocument();
  });

  it("disables deploy button when no agents selected", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    fireEvent.click(screen.getByText("Custom Selection"));

    const deployBtn = screen.getByText(/Deploy/);
    expect(deployBtn.closest("button")).toBeDisabled();
  });

  it("shows department grouping for hospice pack", () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/));
    fireEvent.click(screen.getByText("Hospice Care Team"));
    fireEvent.click(screen.getByText(/Continue/));

    // Department headers are uppercase h3 elements
    expect(screen.getByText("Diane — CEO")).toBeInTheDocument();
    expect(screen.getByText("Camila — Marketing Director")).toBeInTheDocument();
    expect(screen.getByText(/2 agents? selected/)).toBeInTheDocument();
  });
});
