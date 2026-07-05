-- MatchPoint AI (CSE4104-7A-T05)
-- PostgreSQL / Supabase schema
-- Run this file in the Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The backend progress document uses `users.id` as the Supabase auth user id.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'candidate'
        CHECK (role IN ('candidate', 'admin', 'moderator')),
    target_job_role VARCHAR(150),
    portfolio_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_path TEXT,
    file_type VARCHAR(100),
    file_url TEXT,
    parsed_text TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(150),
    company VARCHAR(150),
    jd_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- `analysis_records` is the implemented backend name for the ER diagram's
-- conceptual `analysis_results` entity.
CREATE TABLE IF NOT EXISTS public.analysis_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    jd_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    ats_score INTEGER NOT NULL CHECK (ats_score BETWEEN 0 AND 100),
    missing_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    missing_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    improved_bullets JSONB NOT NULL DEFAULT '[]'::JSONB,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- `interview_sessions` stores the ER diagram's interview question records
-- together so one generated practice session is easy to retrieve.
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES public.analysis_records(id) ON DELETE CASCADE,
    questions_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.job_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analysis_records(id) ON DELETE SET NULL,
    job_title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    match_score INTEGER NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    job_url TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_saved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    level VARCHAR(30) NOT NULL DEFAULT 'info',
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    endpoint VARCHAR(150) NOT NULL,
    provider VARCHAR(60) NOT NULL DEFAULT 'demo',
    model VARCHAR(100),
    token_count INTEGER NOT NULL DEFAULT 0 CHECK (token_count >= 0),
    latency_ms INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
    success BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Safe upgrades when the original Week 6 five-table schema already exists.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'candidate';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_job_role VARCHAR(150);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.job_descriptions ADD COLUMN IF NOT EXISTS title VARCHAR(150);
ALTER TABLE public.job_descriptions ADD COLUMN IF NOT EXISTS company VARCHAR(150);
ALTER TABLE public.analysis_records ADD COLUMN IF NOT EXISTS missing_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_records_user_id ON public.analysis_records(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_records_resume_id ON public.analysis_records(resume_id);
CREATE INDEX IF NOT EXISTS idx_analysis_records_jd_id ON public.analysis_records(jd_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_analysis_id ON public.interview_sessions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_user_id ON public.job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_performed_at ON public.admin_logs(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SECURITY DEFINER avoids recursive RLS checks when an admin reads users.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own profile" ON public.users;
CREATE POLICY "Users manage own profile"
    ON public.users FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own resumes" ON public.resumes;
CREATE POLICY "Users manage own resumes"
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own job descriptions" ON public.job_descriptions;
CREATE POLICY "Users manage own job descriptions"
    ON public.job_descriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own analyses" ON public.analysis_records;
CREATE POLICY "Users manage own analyses"
    ON public.analysis_records FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own interviews" ON public.interview_sessions;
CREATE POLICY "Users manage own interviews"
    ON public.interview_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own recommendations" ON public.job_recommendations;
CREATE POLICY "Users manage own recommendations"
    ON public.job_recommendations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all profiles" ON public.users;
CREATE POLICY "Admins read all profiles"
    ON public.users FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins read admin logs" ON public.admin_logs;
CREATE POLICY "Admins read admin logs"
    ON public.admin_logs FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins read AI usage" ON public.ai_usage_logs;
CREATE POLICY "Admins read AI usage"
    ON public.ai_usage_logs FOR SELECT
    USING (public.is_admin());
