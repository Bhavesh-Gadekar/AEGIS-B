"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

export default function CreateQuizPage() {
    const router = useRouter();
    const { isDark } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        category: 'Development',
        difficulty: 'Easy',
        is_active: true,
        time_limit_minutes: 15
    });

    const [questions, setQuestions] = useState([
        {
            id: 1,
            question: '',
            options: ['', '', '', ''],
            correctOption: 0,
            explanation: ''
        }
    ]);

    const handleQuestionChange = (id: number, field: string, value: any) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const handleOptionChange = (qId: number, oIndex: number, value: string) => {
        setQuestions(questions.map(q =>
            q.id === qId ? {
                ...q,
                options: q.options.map((opt, idx) => idx === oIndex ? value : opt)
            } : q
        ));
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: questions.length + 1,
                question: '',
                options: ['', '', '', ''],
                correctOption: 0,
                explanation: ''
            }
        ]);
    };

    const removeQuestion = (id: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleSubmit = async () => {
        if (!quizData.title || !quizData.description) {
            toast.error("Please fill in basic quiz details");
            return;
        }

        // Validate questions
        for (const q of questions) {
            if (!q.question || q.options.some(o => !o)) {
                toast.error("Please fill in all question fields");
                return;
            }
        }

        setLoading(true);
        try {
            // 1. Insert Quiz
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .insert([{
                    title: quizData.title,
                    description: quizData.description,
                    category: quizData.category, // Assuming column exists
                    difficulty: quizData.difficulty, // Assuming column exists
                    is_active: quizData.is_active,
                    time_limit_minutes: quizData.time_limit_minutes
                }])
                .select()
                .single();

            if (quizError) throw quizError;

            // 2. Insert Questions
            const questionsPayload = questions.map(q => ({
                quiz_id: quiz.id,
                question_text: q.question,
                options: q.options,
                correct_option_index: q.correctOption,
                explanation: q.explanation
            }));

            // Note: This assumes you have a 'quiz_questions' table as per standard schema
            // If not, adjust accordingly based on existing schema or create table
            const { error: questionsError } = await supabase
                .from('quiz_questions')
                .insert(questionsPayload);

            if (questionsError) throw questionsError;

            toast.success("Quiz created successfully!");
            router.push('/admin/dashboard');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Design a challenge for users.
                        </p>
                    </div>
                </div>

                {/* Main Form */}
                <div className="space-y-8">

                    {/* Basic Info */}
                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium opacity-80">Quiz Title</label>
                                <input
                                    type="text"
                                    value={quizData.title}
                                    onChange={e => setQuizData({ ...quizData, title: e.target.value })}
                                    placeholder="e.g. React Fundamentals"
                                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium opacity-80">Category</label>
                                <select
                                    value={quizData.category}
                                    onChange={e => setQuizData({ ...quizData, category: e.target.value })}
                                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <option>Development</option>
                                    <option>Design</option>
                                    <option>Product</option>
                                    <option>Marketing</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium opacity-80">Description</label>
                                <textarea
                                    value={quizData.description}
                                    onChange={e => setQuizData({ ...quizData, description: e.target.value })}
                                    placeholder="Brief overview of what this quiz covers..."
                                    rows={3}
                                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium opacity-80">Difficulty</label>
                                <div className="flex gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setQuizData({ ...quizData, difficulty: level })}
                                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium border transition-all ${quizData.difficulty === level
                                                ? 'bg-indigo-500 border-indigo-500 text-white'
                                                : isDark ? 'bg-black/20 border-white/10 hover:bg-white/5' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium opacity-80">Time Limit (Minutes)</label>
                                <input
                                    type="number"
                                    value={quizData.time_limit_minutes}
                                    onChange={e => setQuizData({ ...quizData, time_limit_minutes: parseInt(e.target.value) })}
                                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
                            <button
                                onClick={addQuestion}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
                            >
                                <Plus className="w-4 h-4" /> Add Question
                            </button>
                        </div>

                        {questions.map((q, index) => (
                            <div key={q.id} className={`p-6 rounded-2xl border relative group ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        disabled={questions.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 block">Question {index + 1}</label>
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={e => handleQuestionChange(q.id, 'question', e.target.value)}
                                        placeholder="Enter question text here..."
                                        className={`w-full text-lg font-medium bg-transparent border-b border-dashed outline-none focus:border-indigo-500 transition-colors pb-2 ${isDark ? 'border-white/20' : 'border-gray-300'}`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuestionChange(q.id, 'correctOption', oIndex)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${q.correctOption === oIndex
                                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                                    : isDark ? 'border-white/20 hover:border-emerald-500/50' : 'border-gray-300 hover:border-emerald-500/50'
                                                    }`}
                                            >
                                                {q.correctOption === oIndex && <CheckCircle2 className="w-3 h-3" />}
                                            </button>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={e => handleOptionChange(q.id, oIndex, e.target.value)}
                                                placeholder={`Option ${oIndex + 1}`}
                                                className={`flex-1 p-2 rounded-lg text-sm bg-transparent border outline-none focus:border-indigo-500 transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1 block">Explanation (Optional)</label>
                                    <input
                                        type="text"
                                        value={q.explanation}
                                        onChange={e => handleQuestionChange(q.id, 'explanation', e.target.value)}
                                        placeholder="Why is the correct answer correct?"
                                        className={`w-full text-sm bg-transparent outline-none opacity-80 focus:opacity-100 ${isDark ? 'placeholder:text-gray-600' : 'placeholder:text-gray-400'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-8 pb-20">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Publish Quiz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
