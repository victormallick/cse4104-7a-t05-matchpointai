-- ==============================================================================
-- MatchPoint AI - Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create public.users Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  target_job_role TEXT DEFAULT '',
  location TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  portfolio_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  skills JSONB DEFAULT '[]'::jsonb,
  role TEXT DEFAULT 'candidate',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create public.analysis_records Table (Linked to public.users)
CREATE TABLE IF NOT EXISTS public.analysis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT DEFAULT '',
  ats_score INTEGER NOT NULL DEFAULT 0,
  match_rate INTEGER DEFAULT 0,
  experience_level TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  missing_keywords JSONB DEFAULT '[]'::jsonb,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  extracted_skills JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  category_scores JSONB DEFAULT '{}'::jsonb,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create public.saved_jobs Table (Linked to public.users)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT '',
  salary TEXT DEFAULT '',
  portal TEXT DEFAULT '',
  url TEXT DEFAULT '',
  match_score INTEGER DEFAULT 0,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_analysis_records_user_id ON public.analysis_records(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_records_analyzed_at ON public.analysis_records(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);

-- 6. Enable Row Level Security (RLS) on all user data tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: public.users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- 8. RLS Policies: public.analysis_records
DROP POLICY IF EXISTS "Users can view own analysis records" ON public.analysis_records;
CREATE POLICY "Users can view own analysis records" 
  ON public.analysis_records FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analysis records" ON public.analysis_records;
CREATE POLICY "Users can insert own analysis records" 
  ON public.analysis_records FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own analysis records" ON public.analysis_records;
CREATE POLICY "Users can delete own analysis records" 
  ON public.analysis_records FOR DELETE USING (auth.uid() = user_id);

-- 9. RLS Policies: public.saved_jobs
DROP POLICY IF EXISTS "Users can view own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can view own saved jobs" 
  ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can insert own saved jobs" 
  ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can delete own saved jobs" 
  ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);
