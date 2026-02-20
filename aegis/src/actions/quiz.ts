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
    scheduled_at: string;
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
            scheduled_at: quizData.scheduled_at,
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
            registration_count:quiz_registrations(count)
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
        .eq("status", "scheduled")
        .order("scheduled_at", { ascending: true });

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
