-- ============================================================================
-- Supabase Database Schema: Vocalis AI Speaking Coach
-- Execute this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Practice Sessions Table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    topic_id TEXT,
    topic_title TEXT NOT NULL,
    topic_category TEXT NOT NULL,
    average_band NUMERIC(3, 1),
    total_words INTEGER DEFAULT 0,
    total_turns INTEGER DEFAULT 0,
    student_notes TEXT
);

-- 3. Speaking Turns & AI Evaluations Table
CREATE TABLE IF NOT EXISTS public.speaking_turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
    turn_index INTEGER NOT NULL,
    question TEXT NOT NULL,
    student_transcript TEXT NOT NULL,
    overall_band NUMERIC(3, 1),
    grammar_score NUMERIC(3, 1),
    grammar_mistakes JSONB DEFAULT '[]'::jsonb,
    pronunciation_score NUMERIC(3, 1),
    pronunciation_feedback JSONB DEFAULT '{}'::jsonb,
    content_score NUMERIC(3, 1),
    vocabulary_upgrades JSONB DEFAULT '[]'::jsonb,
    idea_score NUMERIC(3, 1),
    idea_development JSONB DEFAULT '{}'::jsonb,
    follow_up_question TEXT,
    spoken_coach_response TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Custom Topics Table
CREATE TABLE IF NOT EXISTS public.custom_topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    key_vocabulary TEXT[] DEFAULT '{}',
    idea_starters TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Row Level Security (RLS) Setup
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_topics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for the student application via public anon key
CREATE POLICY "Allow public read access on practice_sessions" 
    ON public.practice_sessions FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert on practice_sessions" 
    ON public.practice_sessions FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on practice_sessions" 
    ON public.practice_sessions FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete on practice_sessions" 
    ON public.practice_sessions FOR DELETE 
    USING (true);

CREATE POLICY "Allow public read access on speaking_turns" 
    ON public.speaking_turns FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert on speaking_turns" 
    ON public.speaking_turns FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public read access on custom_topics" 
    ON public.custom_topics FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert on custom_topics" 
    ON public.custom_topics FOR INSERT 
    WITH CHECK (true);

-- 6. Indexes for Fast Analytics Queries
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at ON public.practice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speaking_turns_session_id ON public.speaking_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_custom_topics_category ON public.custom_topics(category);
