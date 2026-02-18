import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

// ── Types ──────────────────────────────────────────────

export interface AgentCapabilities {
  phiProtection: boolean;
  messaging: boolean;
  voiceRecognition: boolean;
  distressDetection: boolean;
  taskCreation: boolean;
  hrAssistant: boolean;
}

export interface MyAgent {
  id: string;
  name: string;
  skills: string[];
  model: string;
  active: boolean;
  capabilities: AgentCapabilities;
  archived?: boolean;
  taskCount: number;
  zone: "clinical" | "operations" | "external";
  language: string;
  tasksToday: number;
  successRate: number;
  costToday: number;
  costMonth: number;
  tokensUsed: number;
  avgResponseTime: string;
  // Org chart fields
  role: string;
  department: string;
  level: "ceo" | "department-head" | "worker";
  parentId: string | null;
}

// ── Constants ──────────────────────────────────────────

const STORAGE_KEY = "dr-claw-agents";

const DEFAULT_CAPABILITIES: AgentCapabilities = {
  phiProtection: true,
  messaging: true,
  voiceRecognition: false,
  distressDetection: false,
  taskCreation: false,
  hrAssistant: false,
};

const DEFAULT_AGENTS: MyAgent[] = [
  {
    id: "ceo-1",
    name: "Dr. Claw Prime",
    skills: ["Strategic Planning", "Cross-Department Coordination", "Decision Making"],
    model: "claude",
    active: true,
    capabilities: { ...DEFAULT_CAPABILITIES, taskCreation: true },
    archived: false,
    taskCount: 0,
    zone: "operations",
    language: "en",
    tasksToday: 0,
    successRate: 100,
    costToday: 0,
    costMonth: 0,
    tokensUsed: 0,
    avgResponseTime: "—",
    role: "Chief AI Officer (CEO)",
    department: "Executive",
    level: "ceo",
    parentId: null,
  },
  {
    id: "1",
    name: "Dr. Front Desk",
    skills: ["appointment-scheduling", "insurance-verification", "patient-follow-up"],
    model: "openai",
    active: true,
    capabilities: { ...DEFAULT_CAPABILITIES, distressDetection: true, voiceRecognition: true, taskCreation: true },
    archived: false,
    taskCount: 12,
    zone: "clinical",
    language: "en",
    tasksToday: 47,
    successRate: 94,
    costToday: 4.13,
    costMonth: 87.40,
    tokensUsed: 412500,
    avgResponseTime: "1.4s",
    role: "Clinical Operations Lead",
    department: "Clinical Operations",
    level: "department-head",
    parentId: "ceo-1",
  },
  {
    id: "clin-1",
    name: "Nurse Navigator",
    skills: ["Care Coordination", "Follow-Up Scheduling"],
    model: "openai",
    active: true,
    capabilities: { ...DEFAULT_CAPABILITIES },
    archived: false,
    taskCount: 5,
    zone: "clinical",
    language: "en",
    tasksToday: 15,
    successRate: 92,
    costToday: 1.80,
    costMonth: 35.50,
    tokensUsed: 152000,
    avgResponseTime: "1.8s",
    role: "Clinical Coordinator",
    department: "Clinical Operations",
    level: "worker",
    parentId: "1",
  },
  {
    id: "clin-2",
    name: "InsureBot",
    skills: ["Eligibility Checks", "Prior Authorization"],
    model: "gemini",
    active: true,
    capabilities: { ...DEFAULT_CAPABILITIES },
    archived: false,
    taskCount: 8,
    zone: "clinical",
    language: "en",
    tasksToday: 31,
    successRate: 96,
    costToday: 2.45,
    costMonth: 52.10,
    tokensUsed: 220000,
    avgResponseTime: "1.2s",
    role: "Insurance Verifier",
    department: "Clinical Operations",
    level: "worker",
    parentId: "1",
  },
  {
    id: "2",
    name: "Marketing Maven",
    skills: ["professional-copywriter", "cmo", "researcher"],
    model: "claude",
    active: true,
    capabilities: { ...DEFAULT_CAPABILITIES, taskCreation: true },
    archived: false,
    taskCount: 8,
    zone: "external",
    language: "en",
    tasksToday: 23,
    successRate: 98,
    costToday: 2.21,
    costMonth: 43.60,
    tokensUsed: 198000,
    avgResponseTime: "2.1s",
    role: "Chief Marketing Officer",
    department: "Marketing & Growth",
    level: "department-head",
    parentId: "ceo-1",
  },
  {
    id: "mkt-1",
    name: "CopySmith",
    skills: ["Ad Copy", "Blog Writing", "Email Sequences"],
    model: "claude",
    active: true,
    capabilities: { ...DEFAULT_CAPABILITIES },
    archived: false,
    taskCount: 4,
    zone: "external",
    language: "en",
    tasksToday: 12,
    successRate: 95,
    costToday: 1.50,
    costMonth: 28.90,
    tokensUsed: 130000,
    avgResponseTime: "2.3s",
    role: "Copywriter",
    department: "Marketing & Growth",
    level: "worker",
    parentId: "2",
  },
  {
    id: "mkt-2",
    name: "Social Pulse",
    skills: ["Content Scheduling", "Engagement Tracking", "Trend Analysis"],
    model: "openai",
    active: false,
    capabilities: { ...DEFAULT_CAPABILITIES },
    archived: false,
    taskCount: 0,
    zone: "external",
    language: "en",
    tasksToday: 0,
    successRate: 89,
    costToday: 0,
    costMonth: 15.20,
    tokensUsed: 67000,
    avgResponseTime: "2.0s",
    role: "Social Media Manager",
    department: "Marketing & Growth",
    level: "worker",
    parentId: "2",
  },
  {
    id: "3",
    name: "Grant Pro",
    skills: ["grant-writer", "researcher", "cfo"],
    model: "claude",
    active: false,
    capabilities: { ...DEFAULT_CAPABILITIES },
    archived: false,
    taskCount: 3,
    zone: "operations",
    language: "en",
    tasksToday: 0,
    successRate: 88,
    costToday: 0.00,
    costMonth: 21.30,
    tokensUsed: 89200,
    avgResponseTime: "3.4s",
    role: "Chief Financial Officer",
    department: "Finance & Accounting",
    level: "department-head",
    parentId: "ceo-1",
  },
  {
    id: "fin-1",
    name: "Ledger AI",
    skills: ["Bookkeeping", "Tax Prep", "Invoice Processing"],
    model: "gemini",
    active: true,
    capabilities: { ...DEFAULT_CAPABILITIES },
    archived: false,
    taskCount: 6,
    zone: "operations",
    language: "en",
    tasksToday: 18,
    successRate: 97,
    costToday: 1.90,
    costMonth: 38.40,
    tokensUsed: 175000,
    avgResponseTime: "1.5s",
    role: "Accountant",
    department: "Finance & Accounting",
    level: "worker",
    parentId: "3",
  },
];

// ── Context type ───────────────────────────────────────

interface AgentContextType {
  agents: MyAgent[];
  addAgent: (agent: MyAgent) => void;
  updateAgent: (id: string, updates: Partial<MyAgent>) => void;
  deleteAgent: (id: string) => void;
  archiveAgent: (id: string) => void;
  restoreAgent: (id: string) => void;
  getActiveAgents: () => MyAgent[];
  getAgentById: (id: string) => MyAgent | undefined;
}

// ── Context ────────────────────────────────────────────

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// ── Helpers ────────────────────────────────────────────

function loadAgentsFromStorage(): MyAgent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migration: if no agents have org chart fields, reset to new defaults
        const hasOrgFields = parsed.some((a: MyAgent) => a.department);
        if (!hasOrgFields) return DEFAULT_AGENTS;
        return parsed;
      }
    }
  } catch {
    // Corrupted data — fall back to defaults
  }
  return DEFAULT_AGENTS;
}

function saveAgentsToStorage(agents: MyAgent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// ── Provider ───────────────────────────────────────────

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgents] = useState<MyAgent[]>(loadAgentsFromStorage);

  // Persist to localStorage whenever agents change
  useEffect(() => {
    saveAgentsToStorage(agents);
  }, [agents]);

  const addAgent = useCallback((agent: MyAgent) => {
    setAgents((prev) => [...prev, agent]);
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<MyAgent>) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const deleteAgent = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const archiveAgent = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, archived: true, active: false } : a))
    );
  }, []);

  const restoreAgent = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, archived: false } : a))
    );
  }, []);

  const getActiveAgents = useCallback(() => {
    return agents.filter((a) => a.active && !a.archived);
  }, [agents]);

  const getAgentById = useCallback(
    (id: string) => {
      return agents.find((a) => a.id === id);
    },
    [agents]
  );

  return (
    <AgentContext.Provider
      value={{
        agents,
        addAgent,
        updateAgent,
        deleteAgent,
        archiveAgent,
        restoreAgent,
        getActiveAgents,
        getAgentById,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error("useAgents must be used within an AgentProvider");
  return context;
};
