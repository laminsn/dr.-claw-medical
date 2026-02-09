
-- User integration API keys (per-user, per-integration)
CREATE TABLE public.user_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_key TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, integration_key)
);

ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations" ON public.user_integrations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON public.user_integrations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.user_integrations
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.user_integrations
FOR DELETE USING (auth.uid() = user_id);

-- Agent documents for training data uploads
CREATE TABLE public.agent_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.agent_documents
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.agent_documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.agent_documents
FOR DELETE USING (auth.uid() = user_id);

-- Marketplace skills (community-driven)
CREATE TABLE public.marketplace_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  icon TEXT DEFAULT 'Zap',
  author_id UUID NOT NULL,
  author_name TEXT,
  downloads INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published marketplace skills" ON public.marketplace_skills
FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create marketplace skills" ON public.marketplace_skills
FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own marketplace skills" ON public.marketplace_skills
FOR UPDATE USING (auth.uid() = author_id);

-- Skill ratings
CREATE TABLE public.skill_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL REFERENCES public.marketplace_skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(skill_id, user_id)
);

-- Validation trigger for rating range instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_skill_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_skill_rating_trigger
BEFORE INSERT OR UPDATE ON public.skill_ratings
FOR EACH ROW EXECUTE FUNCTION public.validate_skill_rating();

ALTER TABLE public.skill_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" ON public.skill_ratings
FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON public.skill_ratings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.skill_ratings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON public.skill_ratings
FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for agent documents
INSERT INTO storage.buckets (id, name, public) VALUES ('agent-documents', 'agent-documents', false);

-- Storage RLS policies
CREATE POLICY "Users can upload own agent documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'agent-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own agent documents" ON storage.objects
FOR SELECT USING (bucket_id = 'agent-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own agent documents" ON storage.objects
FOR DELETE USING (bucket_id = 'agent-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update timestamp trigger for user_integrations
CREATE TRIGGER update_user_integrations_updated_at
BEFORE UPDATE ON public.user_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for marketplace_skills
CREATE TRIGGER update_marketplace_skills_updated_at
BEFORE UPDATE ON public.marketplace_skills
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
