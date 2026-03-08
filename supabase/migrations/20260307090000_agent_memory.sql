-- Phase 5.2: Agent memory with pgvector for semantic retrieval

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Agent memory table ──────────────────────────────────────────────────

CREATE TABLE public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('short_term', 'long_term', 'fact', 'preference', 'summary')),
  -- Content
  content TEXT NOT NULL,
  embedding vector(1536),          -- OpenAI ada-002 / text-embedding-3-small dimension
  -- Metadata
  source TEXT,                      -- 'conversation', 'task_result', 'user_feedback', 'self_reflection'
  importance REAL NOT NULL DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,           -- NULL = never expires
  conversation_id TEXT,             -- links to chat session
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own agent memory" ON public.agent_memory
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_agent_memory_agent ON public.agent_memory (user_id, agent_id, memory_type);
CREATE INDEX idx_agent_memory_type ON public.agent_memory (memory_type, created_at DESC);
CREATE INDEX idx_agent_memory_importance ON public.agent_memory (importance DESC)
  WHERE memory_type = 'long_term';
CREATE INDEX idx_agent_memory_expires ON public.agent_memory (expires_at)
  WHERE expires_at IS NOT NULL;

-- Vector similarity search index (IVFFlat for scale)
CREATE INDEX idx_agent_memory_embedding ON public.agent_memory
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── Semantic search function ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.search_agent_memory(
  _user_id UUID,
  _agent_id TEXT,
  _query_embedding vector(1536),
  _match_count INTEGER DEFAULT 5,
  _similarity_threshold REAL DEFAULT 0.7,
  _memory_types TEXT[] DEFAULT ARRAY['long_term', 'fact', 'preference']
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  memory_type TEXT,
  importance REAL,
  similarity REAL,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.memory_type,
    m.importance,
    (1 - (m.embedding <=> _query_embedding))::REAL AS similarity,
    m.metadata,
    m.created_at
  FROM public.agent_memory m
  WHERE m.user_id = _user_id
    AND m.agent_id = _agent_id
    AND m.memory_type = ANY(_memory_types)
    AND m.embedding IS NOT NULL
    AND (m.expires_at IS NULL OR m.expires_at > now())
    AND (1 - (m.embedding <=> _query_embedding)) >= _similarity_threshold
  ORDER BY m.embedding <=> _query_embedding
  LIMIT _match_count;

  -- Update access counts for returned memories
  UPDATE public.agent_memory am
  SET access_count = am.access_count + 1,
      last_accessed_at = now()
  WHERE am.user_id = _user_id
    AND am.agent_id = _agent_id
    AND am.id IN (
      SELECT m2.id FROM public.agent_memory m2
      WHERE m2.user_id = _user_id
        AND m2.agent_id = _agent_id
        AND m2.embedding IS NOT NULL
        AND (1 - (m2.embedding <=> _query_embedding)) >= _similarity_threshold
      ORDER BY m2.embedding <=> _query_embedding
      LIMIT _match_count
    );
END;
$$;

-- ── Store memory with embedding ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.store_agent_memory(
  _user_id UUID,
  _agent_id TEXT,
  _memory_type TEXT,
  _content TEXT,
  _embedding vector(1536) DEFAULT NULL,
  _source TEXT DEFAULT 'conversation',
  _importance REAL DEFAULT 0.5,
  _tags TEXT[] DEFAULT '{}',
  _conversation_id TEXT DEFAULT NULL,
  _expires_at TIMESTAMPTZ DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _memory_id UUID;
BEGIN
  INSERT INTO public.agent_memory (
    user_id, agent_id, memory_type, content, embedding,
    source, importance, tags, conversation_id, expires_at, metadata
  )
  VALUES (
    _user_id, _agent_id, _memory_type, _content, _embedding,
    _source, _importance, _tags, _conversation_id, _expires_at, _metadata
  )
  RETURNING id INTO _memory_id;

  RETURN _memory_id;
END;
$$;

-- ── Cleanup expired memories ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_expired_memories()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted INTEGER;
BEGIN
  DELETE FROM public.agent_memory
  WHERE expires_at IS NOT NULL AND expires_at < now()
  RETURNING 1;

  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted;
END;
$$;

-- Timestamp trigger
CREATE TRIGGER update_agent_memory_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
