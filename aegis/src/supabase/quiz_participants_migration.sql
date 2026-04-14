-- quiz_participants table: tracks who is actively playing a live quiz
CREATE TABLE IF NOT EXISTS public.quiz_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id INTEGER REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(quiz_id, user_id)
);

ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can read participants (for leaderboard)
CREATE POLICY "Anyone can view quiz participants"
ON public.quiz_participants FOR SELECT
USING (true);

-- Users can insert themselves
CREATE POLICY "Users can join as participant"
ON public.quiz_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own score and status
CREATE POLICY "Users can update own participant record"
ON public.quiz_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for leaderboard sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_participants;
