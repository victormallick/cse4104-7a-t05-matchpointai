-- MatchPoint AI - Database Schema Script
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RESUMES TABLE
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    file_path TEXT,
    parsed_text TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. JOB DESCRIPTIONS TABLE
CREATE TABLE public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    jd_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ANALYSIS RECORDS TABLE
CREATE TABLE public.analysis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    jd_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    ats_score INT CHECK (ats_score >= 0 AND ats_score <= 100) NOT NULL,
    missing_keywords TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    improved_bullets JSONB DEFAULT '[]'::JSONB NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. INTERVIEW SESSIONS TABLE
CREATE TABLE public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    analysis_id UUID REFERENCES public.analysis_records(id) ON DELETE CASCADE NOT NULL,
    questions_json JSONB DEFAULT '[]'::JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes for performance optimization on foreign keys
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_job_descriptions_user_id ON public.job_descriptions(user_id);
CREATE INDEX idx_analysis_records_user_id ON public.analysis_records(user_id);
CREATE INDEX idx_analysis_records_resume_id ON public.analysis_records(resume_id);
CREATE INDEX idx_analysis_records_jd_id ON public.analysis_records(jd_id);
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_analysis_id ON public.interview_sessions(analysis_id);

-- Optional: Supabase Trigger to automatically create a public.users row on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS) on tables for security best practices
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (allows users to CRUD only their own rows)
CREATE POLICY "Users can view and edit their own profiles"
    ON public.users FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Users can CRUD their own resumes"
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own job descriptions"
    ON public.job_descriptions FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own analysis records"
    ON public.analysis_records FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own interview sessions"
    ON public.interview_sessions FOR ALL
    USING (auth.uid() = user_id);
