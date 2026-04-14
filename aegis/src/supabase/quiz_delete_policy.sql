-- Run this in your Supabase SQL Editor to allow admins to delete quizzes

CREATE POLICY "Admins can delete quizzes"
ON public.quizzes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
