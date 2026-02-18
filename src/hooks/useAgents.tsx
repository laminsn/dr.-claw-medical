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
