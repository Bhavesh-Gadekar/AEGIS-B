"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Admin: Trigger Quiz Start (Update status to 'live')
 */
export async function startQuiz(quizId: number) {
    const supabase = await createClient();

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Authentication required" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'admin') return { error: "Admin access required" };

    const { error } = await supabase
        .from("quizzes")
        .update({ status: 'live', current_question_index: 0 })
        .eq("id", quizId);

    if (error) return { error: error.message };

    revalidatePath(`/quiz/${quizId}`);
    return { success: true };
}

/**
 * User: Submit Answer (Secure Validation & Scoring)
 */
export async function submitAnswerSecure(params: {
    quizId: number;
    questionId: string;
    chosenIndex: number;
    responseTimeMs: number; // For speed bonus calculation (verified by server time if possible)
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Authentication required" };

    // 1. Validate Registration & Quiz Status
    const { data: registration } = await supabase
        .from("quiz_registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("quiz_id", params.quizId)
        .single();

    if (!registration) return { error: "You are not registered for this quiz" };

    const { data: quiz } = await supabase
        .from("quizzes")
        .select("status")
        .eq("id", params.quizId)
        .single();

    if (quiz?.status !== 'live') return { error: "Quiz is not currently live" };

    // 2. Validate Correctness & Calculate Score
    const { data: question } = await supabase
        .from("quiz_questions")
        .select("correct_option_index, timer_seconds")
        .eq("id", params.questionId)
        .single();

    if (!question) return { error: "Question not found" };

    let pointsEarned = 0;
    if (params.chosenIndex === question.correct_option_index) {
        const BASE_POINTS = 1000;
        const SPEED_BONUS_MAX = 500;

        // Speed bonus: More points for faster answers
        // Factor = (TotalTimer - ResponseTime) / TotalTimer
        const timerLimitMs = question.timer_seconds * 1000;
        const timeFactor = Math.max(0, (timerLimitMs - params.responseTimeMs) / timerLimitMs);

        pointsEarned = Math.floor(BASE_POINTS + (timeFactor * SPEED_BONUS_MAX));
    }

    // 3. Update User Score (Atomic Update or Fetch-Update)
    const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("id, total_points")
        .eq("user_id", user.id)
        .eq("quiz_id", params.quizId)
        .single();

    if (attempt) {
        const { error: updateError } = await supabase
            .from("quiz_attempts")
            .update({
                total_points: attempt.total_points + pointsEarned,
                last_answered_index: params.questionId // Mapping this to track progress
            })
            .eq("id", attempt.id);

        if (updateError) return { error: updateError.message };
    } else {
        const { error: insertError } = await supabase
            .from("quiz_attempts")
            .insert({
                user_id: user.id,
                quiz_id: params.quizId,
                total_points: pointsEarned,
                score: pointsEarned, // Backup field
                is_active: true
            });

        if (insertError) return { error: insertError.message };
    }

    return { success: true, points: pointsEarned };
}

/**
 * Auto-Start: Transition Quiz to 'live' when time is reached
 * Can be called by any participant to ensure synchronized start
 */
export async function autoStartQuiz(quizId: number) {
    const supabase = await createClient();

    // 1. Fetch current status and scheduled time
    const { data: quiz } = await supabase
        .from("quizzes")
        .select("status, scheduled_at")
        .eq("id", quizId)
        .single();

    if (!quiz || quiz.status !== 'scheduled') return { error: "Quiz already live or finished" };

    // 2. Verify time
    const now = new Date();
    const scheduledTime = new Date(quiz.scheduled_at);

    if (now < scheduledTime) return { error: "It is not yet time to start" };

    // 3. Update Status (Atomic)
    const { error } = await supabase
        .from("quizzes")
        .update({
            status: 'live',
            current_question_index: 0
        })
        .eq("id", quizId)
        .eq("status", 'scheduled'); // Atomic check

    if (error) return { error: error.message };

    revalidatePath(`/quiz/${quizId}`);
    return { success: true };
}
