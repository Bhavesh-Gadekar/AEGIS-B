'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Uploads a resume PDF to Supabase and analyzes it with Gemini AI
 */
export async function uploadAndAnalyzeResume(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Not authenticated. Please log in first.' };
        }

        const file = formData.get('file') as File;
        const targetJob = (formData.get('targetJob') as string) || 'General Software Engineering';

        if (!file) {
            return { error: 'No PDF file was provided.' };
        }

        if (file.type !== 'application/pdf') {
            return { error: 'Only PDF files are supported.' };
        }

        // 2. Upload file to Resume bucket
        const fileExt = file.name.split('.').pop();
        const fileName = `resume_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from('Resume')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Supabase storage upload error:', uploadError);
            return { 
                error: `Failed to upload PDF: ${uploadError.message}. Please ensure a public storage bucket named "Resume" has been created in your Supabase Console, and has RLS policies allowing authenticated uploads.`
            };
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('Resume')
            .getPublicUrl(filePath);

        // 4. Convert file to Base64 for Gemini AI input
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        // 5. Call Gemini AI REST API
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { error: 'Gemini API key is not configured on the server.' };
        }

        const prompt = `You are a professional ATS (Applicant Tracking System) optimizer and expert resume reviewer.
Analyze the attached resume PDF carefully in the context of the user's targeted job role: "${targetJob}".

Please perform a thorough review and return a JSON object with the following fields:
1. "score": An overall percentage score (0 to 100) representing how well-aligned the resume is with the targeted role.
2. "strengths": A list of 3-5 specific, strong points in the resume (e.g. active verbs, metrics, solid formatting).
3. "improvements": A list of 3-5 specific areas that need work (e.g. weak verbs, verbose summary, formatting issues).
4. "missing": A list of critical skills, keywords, certifications, or experience descriptions that are missing for the targeted job role: "${targetJob}".
5. "detailedSuggestions": Comprehensive, structured markdown text detailing suggestions, restructuring advice, or rewrite examples.

You MUST respond strictly in valid JSON format matching this schema:
{
  "score": number,
  "strengths": string[],
  "improvements": string[],
  "missing": string[],
  "detailedSuggestions": string
}

Ensure the output is pure JSON. Do not include markdown code block syntax (like \`\`\`json) in the raw response, or if you do, let it be clean. We will parse this directly.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: 'application/pdf',
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: 'application/json'
                    }
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API Error details:', errText);
            return { error: 'Gemini AI failed to process the resume. Please try again.' };
        }

        const apiResult = await response.json();
        const textResult = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResult) {
            return { error: 'No response content from Gemini AI.' };
        }

        let parsedResult;
        try {
            // Remove potential markdown code wrappers if Gemini returned them despite responseMimeType
            const cleanJson = textResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            parsedResult = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse Gemini output as JSON. Raw output:', textResult);
            return { error: 'Failed to parse AI analysis. Please retry.' };
        }

        // 6. Save results to resumes table
        const { data: resumeRecord, error: dbError } = await supabase
            .from('resumes')
            .insert({
                user_id: user.id,
                title: file.name,
                file_url: publicUrl,
                parsed_content: parsedResult,
                ats_score: parsedResult.score || 70
            })
            .select()
            .single();

        if (dbError) {
            console.error('Error saving resume analysis to database:', dbError);
            // We still return the analysis even if DB save fails
        }

        revalidatePath('/resume-analysis');
        return { success: true, data: parsedResult, record: resumeRecord };
    } catch (error: any) {
        console.error('Exception in uploadAndAnalyzeResume:', error);
        return { error: error.message || 'An unexpected error occurred during resume analysis.' };
    }
}

/**
 * Fetches all resume analyses for the logged-in user
 */
export async function getPastResumes() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching past resumes:', error);
            return { error: 'Failed to fetch resume history' };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Exception in getPastResumes:', error);
        return { error: error.message };
    }
}

/**
 * Deletes a resume analysis and its corresponding storage file
 */
export async function deleteResume(id: string, fileUrl: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'Not authenticated' };

        // 1. Delete from database
        const { error: dbError } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (dbError) {
            console.error('Error deleting resume record:', dbError);
            return { error: 'Failed to delete resume record' };
        }

        // 2. Try to delete from storage if publicUrl matches our bucket
        try {
            if (fileUrl && fileUrl.includes('/Resume/')) {
                const fileName = fileUrl.split('/Resume/').pop();
                if (fileName) {
                    await supabase.storage.from('Resume').remove([fileName]);
                }
            }
        } catch (storageErr) {
            console.error('Error removing file from storage:', storageErr);
        }

        revalidatePath('/resume-analysis');
        return { success: true };
    } catch (error: any) {
        console.error('Exception in deleteResume:', error);
        return { error: error.message };
    }
}

/**
 * Generates a professional summary for the Resume Builder using Gemini AI
 */
export async function generateResumeSummary(details: {
    fullName: string;
    role: string;
    skills: string;
    experienceSummary: string;
    educationSummary: string;
}) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { error: 'Gemini API key is not configured.' };
        }

        const prompt = `You are an expert resume writer. Please draft a highly compelling, professional summary paragraph for a resume based on the following details. 
- Full Name: ${details.fullName}
- Target Role: ${details.role}
- Core Skills: ${details.skills}
- Work Experience Summary: ${details.experienceSummary}
- Education: ${details.educationSummary}

Guidelines:
1. Write in a premium, professional tone.
2. Use active, high-impact language.
3. Keep it between 3 to 4 impactful sentences.
4. Highlight skills and professional drive.
5. Do NOT include any placeholder text or bracketed instructions. Output ONLY the drafted summary text itself.
6. Make sure NOT to mention the name "Bhavesh Sanjay Gadekar" or his personal details in the draft.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            return { error: 'Failed to communicate with Gemini API.' };
        }

        const apiResult = await response.json();
        const textResult = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResult) {
            return { error: 'No response from Gemini AI.' };
        }

        return { success: true, summary: textResult.trim() };
    } catch (error: any) {
        console.error('Exception in generateResumeSummary:', error);
        return { error: error.message };
    }
}

/**
 * Polishes a single resume bullet point using Gemini AI to make it high-impact and action-oriented
 */
export async function polishResumeBullet(bulletText: string, jobTitle: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { error: 'Gemini API key is not configured.' };
        }

        const prompt = `You are a resume writing expert. Revise the following single bullet point from a resume to make it more professional, metrics-oriented, and action-verb driven.
Target Position: ${jobTitle}
Original bullet: "${bulletText}"

Guidelines:
1. Begin with a strong action verb (e.g., Spearheaded, Formulated, Streamlined).
2. Quantify achievements where possible (add realistic sample metrics or percentages like 'by 25%', 'improved load times by 40%').
3. Keep it to one clear, powerful sentence.
4. Output ONLY the revised bullet point. Do not add quotes, introductions, or explanations.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            return { error: 'Failed to communicate with Gemini API.' };
        }

        const apiResult = await response.json();
        const textResult = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResult) {
            return { error: 'No response from Gemini AI.' };
        }

        return { success: true, polished: textResult.trim().replace(/^-\s*/, '') };
    } catch (error: any) {
        console.error('Exception in polishResumeBullet:', error);
        return { error: error.message };
    }
}
