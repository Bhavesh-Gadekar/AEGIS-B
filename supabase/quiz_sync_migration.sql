-- AEGIS Quiz System - Master Migration

-- 1. Quizzes Table Enhancements
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
ADD COLUMN IF NOT EXISTS current_question_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

-- 2. Quiz Questions Enhancements
ALTER TABLE public.quiz_questions
ADD COLUMN IF NOT EXISTS timer_seconds INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Quiz Registrations Table
CREATE TABLE IF NOT EXISTS public.quiz_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id INTEGER REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, quiz_id)
);

-- 4. Quiz Attempts Enhancements
ALTER TABLE public.quiz_attempts
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_answered_index INTEGER DEFAULT -1;

-- 5. Row Level Security (RLS)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes"
ON public.quizzes FOR SELECT
USING (true);

-- Profiles check for Admin role (Admin features)
-- Policy: Only Admins can modify quizzes
CREATE POLICY "Admins can insert quizzes" 
ON public.quizzes FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can update quizzes" 
ON public.quizzes FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Participants can auto-start quizzes"
ON public.quizzes FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.quiz_registrations 
        WHERE quiz_id = public.quizzes.id AND user_id = auth.uid()
    )
    AND status = 'scheduled'
    AND scheduled_at <= NOW()
)
WITH CHECK (
    status = 'live'
);

-- 5.1 Quiz Questions Policies
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Quiz Registrations Policies
ALTER TABLE public.quiz_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
ON public.quiz_registrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can register themselves"
ON public.quiz_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
ON public.quiz_registrations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Realtime: Enable for necessary tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_registrations;
-- attempts might not be needed for realtime broadcast but good for session tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;
