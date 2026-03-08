import { createContext, useContext, useCallback, ReactNode, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────

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
  role: string;
  department: string;
  level: "ceo" | "department-head" | "worker";
  parentId: string | null;
}

// ── Constants ──────────────────────────────────────

const QUERY_KEY = ["agents"];

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

// ── DB ↔ UI mapping ──────────────────────────────────

interface AgentRow {
  id: string;
  agent_key: string;
  name: string;
  active: boolean;
  language: string;
  zone: string;
  model: string;
  department: string;
  level: string;
  role: string;
  parent_agent_id: string | null;
  skills: string[];
  archived: boolean;
  capabilities: AgentCapabilities;
  task_count: number;
  tasks_today: number;
  success_rate: number;
  cost_today: number;
  cost_month: number;
  tokens_used: number;
  avg_response_time: string;
}

function rowToAgent(row: AgentRow): MyAgent {
  return {
    id: row.agent_key,
    name: row.name,
    skills: row.skills ?? [],
    model: row.model ?? "claude",
    active: row.active ?? false,
    capabilities: row.capabilities ?? DEFAULT_CAPABILITIES,
    archived: row.archived ?? false,
    taskCount: row.task_count ?? 0,
    zone: (row.zone as MyAgent["zone"]) ?? "operations",
    language: row.language ?? "en",
    tasksToday: row.tasks_today ?? 0,
    successRate: row.success_rate ?? 100,
    costToday: Number(row.cost_today) ?? 0,
    costMonth: Number(row.cost_month) ?? 0,
    tokensUsed: row.tokens_used ?? 0,
    avgResponseTime: row.avg_response_time ?? "—",
    role: row.role ?? "",
    department: row.department ?? "",
    level: (row.level as MyAgent["level"]) ?? "worker",
    parentId: row.parent_agent_id,
  };
}

function agentToRow(agent: MyAgent, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    agent_key: agent.id,
    name: agent.name,
    active: agent.active,
    language: agent.language,
    zone: agent.zone,
    model: agent.model,
    department: agent.department,
    level: agent.level,
    role: agent.role,
    parent_agent_id: agent.parentId,
    skills: agent.skills,
    archived: agent.archived ?? false,
    capabilities: agent.capabilities,
    task_count: agent.taskCount,
    tasks_today: agent.tasksToday,
    success_rate: agent.successRate,
    cost_today: agent.costToday,
    cost_month: agent.costMonth,
    tokens_used: agent.tokensUsed,
    avg_response_time: agent.avgResponseTime,
  };
}

// ── Data fetching ────────────────────────────────────

async function fetchAgents(): Promise<MyAgent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_AGENTS;

  const { data, error } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) {
    // First time: seed default agents into DB
    const rows = DEFAULT_AGENTS.map((a) => agentToRow(a, user.id));
    const { error: seedError } = await supabase
      .from("agent_configs")
      .insert(rows as never[]);

    if (seedError) {
      console.error("Failed to seed agents:", seedError);
      return DEFAULT_AGENTS;
    }
    return DEFAULT_AGENTS;
  }

  return data.map((row) => rowToAgent(row as unknown as AgentRow));
}

// ── Context type ───────────────────────────────────

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

// ── Context ──────────────────────────────────────────

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: agents = DEFAULT_AGENTS } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAgents,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const addMutation = useMutation({
    mutationFn: async (agent: MyAgent) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const row = agentToRow(agent, user.id);
      const { error } = await supabase.from("agent_configs").insert(row as never);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MyAgent> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.model !== undefined) dbUpdates.model = updates.model;
      if (updates.zone !== undefined) dbUpdates.zone = updates.zone;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.parentId !== undefined) dbUpdates.parent_agent_id = updates.parentId;
      if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
      if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
      if (updates.capabilities !== undefined) dbUpdates.capabilities = updates.capabilities;
      if (updates.taskCount !== undefined) dbUpdates.task_count = updates.taskCount;
      if (updates.tasksToday !== undefined) dbUpdates.tasks_today = updates.tasksToday;
      if (updates.successRate !== undefined) dbUpdates.success_rate = updates.successRate;
      if (updates.costToday !== undefined) dbUpdates.cost_today = updates.costToday;
      if (updates.costMonth !== undefined) dbUpdates.cost_month = updates.costMonth;
      if (updates.tokensUsed !== undefined) dbUpdates.tokens_used = updates.tokensUsed;
      if (updates.avgResponseTime !== undefined) dbUpdates.avg_response_time = updates.avgResponseTime;

      const { error } = await supabase
        .from("agent_configs")
        .update(dbUpdates as never)
        .eq("agent_key", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<MyAgent[]>(QUERY_KEY);
      queryClient.setQueryData<MyAgent[]>(QUERY_KEY, (old) =>
        (old ?? []).map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("agent_configs")
        .delete()
        .eq("agent_key", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<MyAgent[]>(QUERY_KEY);
      queryClient.setQueryData<MyAgent[]>(QUERY_KEY, (old) =>
        (old ?? []).filter((a) => a.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const addAgent = useCallback(
    (agent: MyAgent) => addMutation.mutate(agent),
    [addMutation]
  );

  const updateAgent = useCallback(
    (id: string, updates: Partial<MyAgent>) => updateMutation.mutate({ id, updates }),
    [updateMutation]
  );

  const deleteAgent = useCallback(
    (id: string) => deleteMutation.mutate(id),
    [deleteMutation]
  );

  const archiveAgent = useCallback(
    (id: string) => updateMutation.mutate({ id, updates: { archived: true, active: false } }),
    [updateMutation]
  );

  const restoreAgent = useCallback(
    (id: string) => updateMutation.mutate({ id, updates: { archived: false } }),
    [updateMutation]
  );

  const getActiveAgents = useCallback(
    () => agents.filter((a) => a.active && !a.archived),
    [agents]
  );

  const getAgentById = useCallback(
    (id: string) => agents.find((a) => a.id === id),
    [agents]
  );

  const value = useMemo(
    () => ({
      agents,
      addAgent,
      updateAgent,
      deleteAgent,
      archiveAgent,
      restoreAgent,
      getActiveAgents,
      getAgentById,
    }),
    [agents, addAgent, updateAgent, deleteAgent, archiveAgent, restoreAgent, getActiveAgents, getAgentById]
  );

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error("useAgents must be used within an AgentProvider");
  return context;
};
