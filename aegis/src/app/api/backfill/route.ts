import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();

    // Fetch all roadmaps with their steps
    const { data: roadmaps, error } = await supabase
        .from('roadmaps')
        .select(`
            id, title, field, color,
            roadmap_steps (
                id
            )
        `);

    if (error || !roadmaps) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch roadmaps' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const results = [];

    for (const rm of roadmaps) {
        try {
            // Delete existing steps to replace them unconditionally
            await supabase.from('roadmap_steps').delete().eq('roadmap_id', rm.id);

            const prompt = `Generate a realistic and logical sequence of 6-8 learning or mastery steps for a roadmap titled "${rm.title}" in the field of "${rm.field}".
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
                        roadmap_id: rm.id,
                        title: step,
                        step_order: index + 1
                    }));

                    const { error: insertError } = await supabase
                        .from('roadmap_steps')
                        .insert(stepsData);

                    if (insertError) {
                        results.push({ id: rm.id, status: 'error', error: insertError.message });
                    } else {
                        results.push({ id: rm.id, status: 'success', steps: parsedSteps });
                    }
                } else {
                    results.push({ id: rm.id, status: 'error', error: 'Invalid parsed AI format' });
                }
            } catch (err: any) {
                results.push({ id: rm.id, status: 'error', error: err.message });
            }
    }

    return NextResponse.json({ done: true, results });
}
