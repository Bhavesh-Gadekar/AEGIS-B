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
            registration_count:quiz_registrations(count)
        `)
        .order('scheduled_at', { ascending: false });

    if (error) return { error: error.message };

    return { data };
}
