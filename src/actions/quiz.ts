"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Admin: Create a quiz manually
 */
export async function createQuizManual(quizData: {
    title: string;
    description: string;
    duration_minutes: number;
    scheduled_at?: string | null;
    questions: {
        question_text: string;
        options: string[];
        correct_index: number;
        timer_seconds: number;
    }[];
}) {
    const supabase = await createClient();

    // 1. Verify Admin Role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Authentication required" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') return { error: "Admin access required" };

    // 2. Insert Quiz
    const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
            title: quizData.title,
            description: quizData.description,
            duration_minutes: quizData.duration_minutes,
            scheduled_at: quizData.scheduled_at || null,
            status: 'scheduled',
            created_by: user.id
        })
        .select()
        .single();

    if (quizError) return { error: quizError.message };

    // 3. Insert Questions
    const questionsToInsert = quizData.questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_index,
        timer_seconds: q.timer_seconds,
        order_index: index
    }));

    const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(questionsToInsert);

    if (questionsError) {
        // Cleanup on failure
        await supabase.from("quizzes").delete().eq("id", quiz.id);
        return { error: questionsError.message };
    }

    revalidatePath("/quiz");
    return { success: true, quizId: quiz.id };
}

/**
 * User: Register for a quiz
 */
export async function registerForQuiz(quizId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Authentication required" };

    const { error } = await supabase
        .from("quiz_registrations")
        .insert({
            user_id: user.id,
            quiz_id: quizId
        });

    if (error) {
        if (error.code === '23505') return { success: true, message: "Already registered" };
        return { error: error.message };
    }

    revalidatePath(`/quiz/${quizId}`);
    return { success: true };
}

/**
 * Common: Get quiz session status
 */
export async function getQuizSessionStatus(quizId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("quizzes")
        .select(`
            *,
            registration_count:quiz_registrations(count),
            quiz_questions(timer_seconds)
        `)
        .eq("id", quizId)
        .single();

    if (error) return { error: error.message };

    // Check if current user is registered
    let isRegistered = false;
    if (user) {
        const { data: reg } = await supabase
            .from("quiz_registrations")
            .select("id")
            .eq("user_id", user.id)
            .eq("quiz_id", quizId)
            .single();
        isRegistered = !!reg;
    }

    // Format the count properly
    const registrationCount = (data.registration_count as any)?.[0]?.count || 0;

    return {
        data: {
            ...data,
            registration_count: registrationCount,
            is_registered: isRegistered
        }
    };
}

/**
 * User: Get all scheduled upcoming quizzes
 */
export async function getUpcomingQuizzes() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .in("status", ["scheduled", "live", "completed"])
        .order("scheduled_at", { ascending: false });

    if (error) return { error: error.message };
    return { data };
}

/**
 * Common: Get all questions for a quiz
 */
export async function getQuizQuestions(quizId: number) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true });

    if (error) return { error: error.message };
    return { data };
}

/**
 * Admin: Schedule or reschedule a quiz (set date/time separately from creation)
 */
export async function scheduleQuiz(quizId: number, scheduledAt: string, durationMinutes: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Authentication required" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') return { error: "Admin access required" };

    const { error } = await supabase
        .from("quizzes")
        .update({
            scheduled_at: scheduledAt,
            duration_minutes: durationMinutes,
            status: 'scheduled'
        })
        .eq("id", quizId);

    if (error) return { error: error.message };

    revalidatePath("/quiz");
    revalidatePath(`/quiz/${quizId}`);
    return { success: true };
}

/**
 * Admin: Delete a quiz and all associated data
 */
export async function deleteQuiz(quizId: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Authentication required" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') return { error: "Admin access required" };

    const { data, error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId)
        .select();

    if (error) return { error: error.message };
    
    // Supabase RLS silently ignores deletes without a policy, deleting 0 rows without throwing an error
    if (!data || data.length === 0) {
        return { error: "Action blocked by Database Security (RLS). Missing DELETE policy on quizzes table." };
    }

    revalidatePath("/quiz");
    revalidatePath("/admin/quiz");
    return { success: true };
}

/**
 * Admin: Update a quiz question
 */
export async function updateQuizQuestion(questionId: number, updates: { question_text: string, options: string[], correct_option_index: number, timer_seconds: number }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Authentication required" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') return { error: "Admin access required" };

    const { error } = await supabase
        .from("quiz_questions")
        .update({
            question_text: updates.question_text,
            options: updates.options,
            correct_option_index: updates.correct_option_index,
            timer_seconds: updates.timer_seconds
        })
        .eq("id", questionId);

    if (error) return { error: error.message };

    revalidatePath("/quiz");
    revalidatePath("/admin/quiz");
    return { success: true };
}

/**
 * Common: Get final leaderboard results for a completed quiz
 */
export async function getQuizResults(quizId: number) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("quiz_participants")
        .select("user_id, score, profiles(full_name, handle, avatar_url)")
        .eq("quiz_id", quizId)
        .order("score", { ascending: false })
        .limit(20);

    if (error) return { error: error.message };
    return { data };
}
