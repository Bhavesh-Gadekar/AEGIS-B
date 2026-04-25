'use server'

import { createClient } from '@/utils/supabase/server';
import { RoadmapItem } from '@/data/roadmapData';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getRoadmaps(): Promise<RoadmapItem[]> {
    const supabase = await createClient();

    // Fetch roadmaps along with their steps
    let { data: roadmapsWithSteps, error } = await supabase
        .from('roadmaps')
        .select(`
            *,
            roadmap_steps (
                title,
                step_order
            )
        `)
        .order('field'); // Optional ordering

    if (error) {
        console.error('Error fetching roadmaps with steps:', error);
        return [];
    }

    if (!roadmapsWithSteps) return [];

    let didBackfill = false;

    // Inline backfill for roadmaps with dummy steps ('Step 1') or missing steps
    for (const r of roadmapsWithSteps) {
        const hasDummySteps = !r.roadmap_steps || r.roadmap_steps.length === 0 || r.roadmap_steps.some((s: any) => s.title === 'Step 1' || s.title === 'Step 2');
        if (hasDummySteps) {
            try {
                // Delete existing dummy steps
                if (r.roadmap_steps && r.roadmap_steps.length > 0) {
                    await supabase.from('roadmap_steps').delete().eq('roadmap_id', r.id);
                }

                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                
                const prompt = `Generate a realistic and logical sequence of 6-8 learning or mastery steps for a roadmap titled "${r.title}" in the field of "${r.field}".
Must return ONLY a valid JSON array of strings representing the step titles, e.g., ["Learn Basics", "Understand Concepts", "Build Project", "Mastery"].
Do not include any explanation or markdown formatting, just the raw JSON array.`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                
                const cleaned = responseText.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, (s: string) =>
                    s.replace(/```json|```/g, '').trim()
                ).trim();

                const parsedSteps = JSON.parse(cleaned);

                if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
                    const stepsData = parsedSteps.map((step, index) => ({
                        roadmap_id: r.id,
                        title: step,
                        step_order: index + 1
                    }));

                    const { error: insertError } = await supabase
                        .from('roadmap_steps')
                        .insert(stepsData);

                    if (!insertError) {
                        r.roadmap_steps = stepsData;
                        didBackfill = true;
                    }
                }
            } catch (e) {
                console.error("Failed inline backfill:", e);
                r.roadmap_steps = [
                    { title: "Introduction", step_order: 1 },
                    { title: "Core Concepts", step_order: 2 },
                    { title: "Advanced Topics", step_order: 3 },
                    { title: "Mastery", step_order: 4 }
                ];
            }
        }
    }

    // Transform to RoadmapItem format
    return roadmapsWithSteps.map((r: any) => ({
        id: r.id,
        title: r.title,
        field: r.field,
        color: r.color as any, // Cast to specific color type
        quiz_data: r.quiz_data,
        steps: r.roadmap_steps
            .sort((a: any, b: any) => a.step_order - b.step_order)
            .map((s: any) => s.title)
    }));
}

export async function getRoadmapById(id: string): Promise<RoadmapItem | null> {
    const supabase = await createClient();

    const { data: roadmap, error } = await supabase
        .from('roadmaps')
        .select(`
            *,
            roadmap_steps (
                title,
                step_order
            )
        `)
        .eq('id', id)
        .single();

    if (error || !roadmap) return null;

    return {
        id: roadmap.id,
        title: roadmap.title,
        field: roadmap.field,
        color: roadmap.color as any,
        quiz_data: roadmap.quiz_data,
        steps: roadmap.roadmap_steps
            .sort((a: any, b: any) => a.step_order - b.step_order)
            .map((s: any) => s.title)
    };
}

export async function createRoadmap(roadmap: RoadmapItem) {
    const supabase = await createClient();

    const roadmapId = roadmap.id.toString();
    let stepsToInsert = roadmap.steps || [];

    // Auto-generate steps using AI if empty
    if (stepsToInsert.length === 0) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const prompt = `Generate a realistic and logical sequence of 6-8 learning or mastery steps for a roadmap titled "${roadmap.title}" in the field of "${roadmap.field}".
Must return ONLY a valid JSON array of strings representing the step titles, e.g., ["Learn Basics", "Understand Concepts", "Build Project", "Mastery"].
Do not include any explanation or markdown formatting, just the raw JSON array.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            const cleaned = responseText.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, (s: string) =>
                s.replace(/```json|```/g, '').trim()
            ).trim();

            const parsedSteps = JSON.parse(cleaned);
            if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
                stepsToInsert = parsedSteps;
            } else {
                throw new Error("Invalid AI response format");
            }
        } catch (error) {
            console.error("Failed to generate AI steps for roadmap:", error);
            // Fallback steps if AI fails
            stepsToInsert = ["Introduction & Basics", "Core Concepts", "Advanced Methodologies", "Practical Application", "Mastery"];
        }
    }

    let generatedQuizData = null;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const quizPrompt = `Generate a 5-question multiple choice quiz to test a user's mastery of the roadmap titled "${roadmap.title}" in the field of "${roadmap.field}".
Return ONLY a valid JSON array matching this exact structure, with no markdown:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": 0
  }
]`;
        const result = await model.generateContent(quizPrompt);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, (s: string) =>
            s.replace(/```json|```/g, '').trim()
        ).trim();

        const questions = JSON.parse(cleaned);
        if (Array.isArray(questions)) {
            generatedQuizData = questions;
        }
    } catch (e) {
        console.error("Failed to generate quiz data for roadmap:", e);
    }

    // 1. Insert roadmap
    const { error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
            id: roadmapId,
            title: roadmap.title,
            field: roadmap.field,
            color: roadmap.color,
            quiz_data: generatedQuizData
        });

    if (roadmapError) {
        console.error('Error creating roadmap:', roadmapError);
        throw new Error(roadmapError.message);
    }

    // 2. Insert steps
    if (stepsToInsert.length > 0) {
        const stepsData = stepsToInsert.map((step, index) => ({
            roadmap_id: roadmapId,
            title: step,
            step_order: index + 1
        }));

        const { error: stepsError } = await supabase
            .from('roadmap_steps')
            .insert(stepsData);

        if (stepsError) {
            console.error('Error creating roadmap steps:', stepsError);
            throw new Error(stepsError.message);
        }
    }

    return { success: true };
}

export async function deleteRoadmap(id: string) {
    const supabase = await createClient();
    
    // Attempt deletion
    const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting roadmap:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function generateRoadmapQuizAI(title: string, field: string) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Generate a 5-question multiple choice quiz to test a user's mastery of the roadmap titled "${title}" in the field of "${field}".
Return ONLY a valid JSON array matching this exact structure, with no markdown:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": 0
  }
]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, (s: string) =>
            s.replace(/```json|```/g, '').trim()
        ).trim();

        const questions = JSON.parse(cleaned);

        if (Array.isArray(questions)) {
            return { success: true, questions };
        }
        return { success: false, error: 'Invalid format received.' };
    } catch (e: any) {
        console.error("Quiz generation failed:", e);
        return { success: false, error: e.message };
    }
}

export async function getRoadmapProgress(roadmapId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data, error } = await supabase
        .from('roadmap_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('roadmap_id', roadmapId)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        console.error("getRoadmapProgress DB error:", error);
        return { success: false, error: error.message };
    }
    
    return { success: true, progress: data };
}

export async function updateRoadmapProgress(roadmapId: string, completedCountStr: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: 'Unauthorized' };

    const completed_module_count = parseInt(completedCountStr) || 0;

    // Use upsert on our custom table which has a primary key (user_id, roadmap_id)
    const { error: upsertErr } = await supabase
        .from('roadmap_progress')
        .upsert({
            user_id: user.id,
            roadmap_id: roadmapId,
            completed_module_count,
            is_completed: isCompleted
        }, { onConflict: 'user_id, roadmap_id', ignoreDuplicates: false });

    if (upsertErr) {
        console.error("updateRoadmapProgress DB Upsert Error:", upsertErr);
        return { success: false, error: upsertErr.message };
    }
    
    return { success: true };
}
