import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-2.5-flash does not support responseMimeType — JSON is enforced via prompt
export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});
