-- ============================================================
-- AEGIS Quiz System — Critical Fixes Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- FIX 1: quiz_participants — Add UNIQUE constraint
-- Without this, upsert(onConflict:'quiz_id,user_id') silently
-- inserts duplicates, causing the same user to appear multiple
-- times on the leaderboard.
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'quiz_participants_quiz_user_unique'
        AND conrelid = 'public.quiz_participants'::regclass
    ) THEN
        ALTER TABLE public.quiz_participants
        ADD CONSTRAINT quiz_participants_quiz_user_unique
        UNIQUE (quiz_id, user_id);
        RAISE NOTICE 'Added UNIQUE constraint on quiz_participants(quiz_id, user_id)';
    ELSE
        RAISE NOTICE 'UNIQUE constraint on quiz_participants already exists — skipping';
    END IF;
END
$$;

-- ============================================================
-- FIX 2: quiz_participants — Enable RLS + Add Policies
-- Without RLS policies, all leaderboard reads/writes fail
-- silently for authenticated (non-service-role) clients.
-- ============================================================
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to make this idempotent
DROP POLICY IF EXISTS "Anyone can view quiz participants"     ON public.quiz_participants;
DROP POLICY IF EXISTS "Authenticated users can join"         ON public.quiz_participants;
DROP POLICY IF EXISTS "Users can update own participant"     ON public.quiz_participants;
DROP POLICY IF EXISTS "Admins can manage participants"       ON public.quiz_participants;

CREATE POLICY "Anyone can view quiz participants"
ON public.quiz_participants FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join"
ON public.quiz_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participant"
ON public.quiz_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can deactivate all participants at quiz end
CREATE POLICY "Admins can manage participants"
ON public.quiz_participants FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================
-- FIX 3: quiz_registrations — Verify UNIQUE constraint
-- Ensures registerForQuiz 23505 duplicate guard works correctly
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'quiz_registrations_user_quiz_unique'
        AND conrelid = 'public.quiz_registrations'::regclass
    ) THEN
        ALTER TABLE public.quiz_registrations
        ADD CONSTRAINT quiz_registrations_user_quiz_unique
        UNIQUE (user_id, quiz_id);
        RAISE NOTICE 'Added UNIQUE constraint on quiz_registrations(user_id, quiz_id)';
    ELSE
        RAISE NOTICE 'UNIQUE constraint on quiz_registrations already exists — skipping';
    END IF;
END
$$;

-- ============================================================
-- FIX 4: Enable Realtime for quiz_participants
-- Required so the live leaderboard Postgres Changes subscription
-- on play page and admin dashboard receives score updates.
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'quiz_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_participants;
        RAISE NOTICE 'Added quiz_participants to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'quiz_participants already in realtime publication — skipping';
    END IF;
END
$$;

-- ============================================================
-- FIX 5: Apply quiz DELETE policy (if not already applied)
-- Idempotent — safe to run even if already applied
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;

CREATE POLICY "Admins can delete quizzes"
ON public.quizzes FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================
-- VERIFICATION: Check all fixes applied correctly
-- ============================================================
SELECT 
    'quiz_participants UNIQUE' AS check_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'quiz_participants_quiz_user_unique'
    ) THEN '✅ OK' ELSE '❌ MISSING' END AS status

UNION ALL

SELECT 
    'quiz_participants RLS enabled',
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'quiz_participants' AND relrowsecurity = true
    ) THEN '✅ OK' ELSE '❌ MISSING' END

UNION ALL

SELECT 
    'quiz_registrations UNIQUE',
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'quiz_registrations_user_quiz_unique'
    ) THEN '✅ OK' ELSE '❌ MISSING' END

UNION ALL

SELECT 
    'quiz_participants in realtime',
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'quiz_participants'
    ) THEN '✅ OK' ELSE '❌ MISSING' END

UNION ALL

SELECT 
    'quizzes DELETE policy',
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'quizzes' AND cmd = 'DELETE'
    ) THEN '✅ OK' ELSE '❌ MISSING' END;
