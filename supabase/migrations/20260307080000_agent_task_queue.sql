-- Phase 5.1: Agent task queue with priority system and delegation

CREATE TABLE public.agent_task_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  instruction TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'claimed', 'running', 'completed', 'failed', 'cancelled')),
  -- Delegation chain
  delegated_from_agent TEXT,
  delegated_from_task UUID REFERENCES public.agent_task_queue(id),
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  max_steps INTEGER NOT NULL DEFAULT 5,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  -- Execution tracking
  claimed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  execution_id UUID REFERENCES public.agent_executions(id),
  result_summary TEXT,
  error_message TEXT,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_task_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own task queue" ON public.agent_task_queue
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Priority-ordered index for polling
CREATE INDEX idx_task_queue_poll ON public.agent_task_queue (
  status,
  CASE priority
    WHEN 'critical' THEN 0
    WHEN 'high' THEN 1
    WHEN 'normal' THEN 2
    WHEN 'low' THEN 3
  END,
  created_at ASC
) WHERE status = 'pending';

CREATE INDEX idx_task_queue_user ON public.agent_task_queue (user_id, status);
CREATE INDEX idx_task_queue_agent ON public.agent_task_queue (agent_id, status);
CREATE INDEX idx_task_queue_scheduled ON public.agent_task_queue (scheduled_for)
  WHERE status = 'pending' AND scheduled_for IS NOT NULL;

-- ── Claim next task (atomic) ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.claim_next_task(
  _agent_id TEXT,
  _user_id UUID
)
RETURNS public.agent_task_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _task public.agent_task_queue;
BEGIN
  UPDATE public.agent_task_queue
  SET status = 'claimed',
      claimed_at = now(),
      updated_at = now()
  WHERE id = (
    SELECT id FROM public.agent_task_queue
    WHERE user_id = _user_id
      AND agent_id = _agent_id
      AND status = 'pending'
      AND (scheduled_for IS NULL OR scheduled_for <= now())
    ORDER BY
      CASE priority
        WHEN 'critical' THEN 0
        WHEN 'high' THEN 1
        WHEN 'normal' THEN 2
        WHEN 'low' THEN 3
      END,
      created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING * INTO _task;

  RETURN _task;
END;
$$;

-- ── Enqueue task with delegation ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.enqueue_agent_task(
  _user_id UUID,
  _agent_id TEXT,
  _instruction TEXT,
  _priority TEXT DEFAULT 'normal',
  _context JSONB DEFAULT '{}'::jsonb,
  _delegated_from_agent TEXT DEFAULT NULL,
  _delegated_from_task UUID DEFAULT NULL,
  _scheduled_for TIMESTAMPTZ DEFAULT NULL,
  _max_steps INTEGER DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _task_id UUID;
BEGIN
  INSERT INTO public.agent_task_queue (
    user_id, agent_id, instruction, priority, context,
    delegated_from_agent, delegated_from_task,
    scheduled_for, max_steps
  )
  VALUES (
    _user_id, _agent_id, _instruction, _priority, _context,
    _delegated_from_agent, _delegated_from_task,
    _scheduled_for, _max_steps
  )
  RETURNING id INTO _task_id;

  -- Audit delegation
  IF _delegated_from_agent IS NOT NULL THEN
    INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, description, metadata)
    VALUES (
      _user_id, 'agent.delegate', 'agent_task',
      _task_id::text,
      'Agent ' || _delegated_from_agent || ' delegated task to ' || _agent_id,
      jsonb_build_object('from_agent', _delegated_from_agent, 'to_agent', _agent_id, 'priority', _priority)
    );
  END IF;

  RETURN _task_id;
END;
$$;

-- ── Timestamp trigger ───────────────────────────────────────────────────

CREATE TRIGGER update_task_queue_updated_at
  BEFORE UPDATE ON public.agent_task_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
