
-- ── kanban_tasks table ─────────────────────────────────────────────────────
CREATE TABLE public.kanban_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  agent_id TEXT NOT NULL DEFAULT '1',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  zone TEXT NOT NULL DEFAULT 'clinical' CHECK (zone IN ('clinical','operations','external')),
  column_id TEXT NOT NULL DEFAULT 'backlog' CHECK (column_id IN ('backlog','todo','in_progress','review','done')),
  due_date DATE NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT NULL, -- 'daily','weekly','monthly'
  is_saved BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.kanban_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.kanban_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.kanban_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.kanban_tasks FOR DELETE USING (auth.uid() = user_id);

-- ── task_comments table ───────────────────────────────────────────────────
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.kanban_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author TEXT NOT NULL DEFAULT 'You',
  content TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT 'bg-cyan-500/20 text-cyan-400',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on own tasks" ON public.task_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.kanban_tasks WHERE id = task_comments.task_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert comments on own tasks" ON public.task_comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.kanban_tasks WHERE id = task_comments.task_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own comments" ON public.task_comments FOR DELETE USING (auth.uid() = user_id);

-- ── updated_at trigger for kanban_tasks ──────────────────────────────────
CREATE TRIGGER update_kanban_tasks_updated_at
  BEFORE UPDATE ON public.kanban_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── realtime ─────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
