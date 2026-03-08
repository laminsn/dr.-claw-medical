-- Agent system prompts: versioned, composable prompts for each agent.

CREATE TABLE public.agent_system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_key TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_key, version)
);

ALTER TABLE public.agent_system_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prompts" ON public.agent_system_prompts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prompts" ON public.agent_system_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON public.agent_system_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_agent_prompts_lookup
  ON public.agent_system_prompts (user_id, agent_key, is_active, version DESC);

-- Add created_by_agent column to kanban_tasks for agent-created tasks
ALTER TABLE public.kanban_tasks
  ADD COLUMN IF NOT EXISTS created_by_agent TEXT;
