
-- 1. User Roles (for admin system)
CREATE TYPE public.app_role AS ENUM ('master_admin', 'admin', 'manager', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only master_admin can manage roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'master_admin'));

-- 2. Expand profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS organization TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "slack": false}'::jsonb;

-- 3. Agent configurations
CREATE TABLE public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_key TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT false,
  voice_profile TEXT DEFAULT 'alloy',
  language TEXT DEFAULT 'en',
  auto_detect_language BOOLEAN DEFAULT false,
  opening_script TEXT DEFAULT '',
  max_retries INTEGER DEFAULT 3,
  auto_escalate BOOLEAN DEFAULT true,
  schedule_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  schedule_start TEXT DEFAULT '09:00',
  schedule_end TEXT DEFAULT '17:00',
  slack_channel TEXT,
  slack_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_key)
);

ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent configs" ON public.agent_configs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent configs" ON public.agent_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent configs" ON public.agent_configs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent configs" ON public.agent_configs
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_agent_configs_updated_at
  BEFORE UPDATE ON public.agent_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Bot Skills
CREATE TABLE public.bot_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  icon TEXT DEFAULT 'Zap',
  xp_reward INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  prerequisites UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bot_skills ENABLE ROW LEVEL SECURITY;

-- Skills are viewable by all authenticated users
CREATE POLICY "Authenticated users can view skills" ON public.bot_skills
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage skills" ON public.bot_skills
  FOR ALL USING (public.has_role(auth.uid(), 'master_admin'));

-- Track which agents have which skills
CREATE TABLE public.agent_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_key TEXT NOT NULL,
  skill_id UUID REFERENCES public.bot_skills(id) ON DELETE CASCADE NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_key, skill_id)
);

ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent skills" ON public.agent_skills
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own agent skills" ON public.agent_skills
  FOR ALL USING (auth.uid() = user_id);

-- 5. Training Modules (for users)
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  content_url TEXT,
  duration_minutes INTEGER DEFAULT 15,
  difficulty TEXT DEFAULT 'beginner',
  icon TEXT DEFAULT 'BookOpen',
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view modules" ON public.training_modules
  FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins can manage modules" ON public.training_modules
  FOR ALL USING (public.has_role(auth.uid(), 'master_admin'));

CREATE TABLE public.user_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'not_started',
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.user_training_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON public.user_training_progress
  FOR ALL USING (auth.uid() = user_id);

-- 6. Seed bot skills
INSERT INTO public.bot_skills (name, description, category, difficulty, icon, xp_reward) VALUES
  ('Empathetic Listening', 'Improve patient tone detection and response empathy', 'Communication', 'beginner', 'Heart', 100),
  ('Insurance Terminology', 'Learn key insurance terms and verification protocols', 'Admin', 'intermediate', 'Shield', 200),
  ('Appointment Optimization', 'Minimize scheduling conflicts and improve fill rates', 'Scheduling', 'beginner', 'Calendar', 150),
  ('Multi-Language Support', 'Handle calls in Spanish, French, and Portuguese', 'Communication', 'advanced', 'Globe', 300),
  ('HIPAA Compliance', 'Ensure all interactions meet HIPAA standards', 'Compliance', 'intermediate', 'Lock', 250),
  ('Escalation Judgment', 'Know when to transfer to human staff vs handle autonomously', 'Decision Making', 'advanced', 'AlertTriangle', 350),
  ('Follow-Up Sequencing', 'Create effective multi-touch follow-up call campaigns', 'Outreach', 'intermediate', 'Repeat', 200),
  ('Patient Sentiment Analysis', 'Detect and respond to patient frustration or urgency', 'Communication', 'advanced', 'Brain', 400);

-- 7. Seed training modules
INSERT INTO public.training_modules (title, description, category, duration_minutes, difficulty, icon, order_index) VALUES
  ('Getting Started with Dr. Claw', 'Learn the basics of setting up and managing your AI agents', 'Onboarding', 10, 'beginner', 'Rocket', 1),
  ('Configuring Voice Agents', 'Set up voice profiles, language, and call scripts for your agents', 'Configuration', 15, 'beginner', 'Mic', 2),
  ('Understanding Analytics', 'Read and interpret your dashboard metrics and call reports', 'Analytics', 20, 'intermediate', 'BarChart', 3),
  ('HIPAA Best Practices', 'Ensure your practice meets HIPAA requirements with AI tools', 'Compliance', 30, 'intermediate', 'Shield', 4),
  ('Advanced Agent Workflows', 'Build multi-step workflows with conditional logic', 'Configuration', 25, 'advanced', 'GitBranch', 5),
  ('Integration Setup Guide', 'Connect Slack, SMS, email and other channels to your agents', 'Integrations', 20, 'intermediate', 'Link', 6),
  ('Patient Communication Strategies', 'Best practices for AI-assisted patient outreach', 'Communication', 15, 'beginner', 'MessageSquare', 7),
  ('Troubleshooting & Support', 'Common issues and how to resolve them quickly', 'Support', 10, 'beginner', 'Wrench', 8);
