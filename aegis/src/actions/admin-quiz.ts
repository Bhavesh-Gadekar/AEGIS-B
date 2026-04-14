"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAdminQuizzes() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Auth required" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'admin') return { error: "Admin only" };

    const { data, error } = await supabase
        .from("quizzes")
        .select(`
            *,
            registration_count:quiz_registrations(count),
            quiz_questions(timer_seconds)
        `)
        .order('scheduled_at', { ascending: false });

    if (error) return { error: error.message };

    // Normalize registration_count from raw aggregation array to a plain number
    const normalized = data.map((quiz: any) => ({
        ...quiz,
        registration_count: Number(quiz.registration_count?.[0]?.count) || 0
    }));

    return { data: normalized };
}
