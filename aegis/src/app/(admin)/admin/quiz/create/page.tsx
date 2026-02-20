"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, CheckCircle2, Sparkles, Calendar, Clock, Brain } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { toast } from 'sonner';
import { createQuizManual } from '@/actions/quiz';
import { generateQuizAI } from '@/actions/quiz-ai';

export default function CreateQuizPage() {
    const router = useRouter();
    const { isDark } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual');

    // Manual Quiz State
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        category: 'Development',
        difficulty: 'Easy',
        duration_minutes: 15,
        scheduled_date: '',
        scheduled_time: ''
    });

    const [questions, setQuestions] = useState([
        {
            id: 1,
            questionText: '',
            options: ['', '', '', ''],
            correctIndex: 0,
            timerSeconds: 15
        }
    ]);

    // AI Quiz State
    const [aiParams, setAiParams] = useState({
        topic: '',
        difficulty: 'Medium',
        numQuestions: 10,
        scheduled_date: '',
        scheduled_time: ''
    });

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
                id: Date.now(),
                questionText: '',
                options: ['', '', '', ''],
                correctIndex: 0,
                timerSeconds: 15
            }
        ]);
    };

    const removeQuestion = (id: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (createMode === 'manual') {
                if (!quizData.title || !quizData.description) {
                    toast.error("Please fill in basic quiz details");
                    setLoading(false);
                    return;
                }

                if (!quizData.scheduled_date || !quizData.scheduled_time) {
                    toast.error("Please set a broadcast schedule (Date & Time)");
                    setLoading(false);
                    return;
                }

                const result = await createQuizManual({
                    title: quizData.title,
                    description: quizData.description,
                    duration_minutes: quizData.duration_minutes,
                    questions: questions.map(q => ({
                        question_text: q.questionText,
                        options: q.options,
                        correct_index: q.correctIndex,
                        timer_seconds: q.timerSeconds
                    })),
                    scheduled_at: new Date(`${quizData.scheduled_date} ${quizData.scheduled_time}`).toISOString()
                });

                if (result.error) throw new Error(result.error);
                toast.success("Quiz created successfully!");
                router.push('/admin/dashboard');
            } else {
                if (!aiParams.topic) {
                    toast.error("Please provide a topic for AI generation");
                    setLoading(false);
                    return;
                }

                if (!aiParams.scheduled_date || !aiParams.scheduled_time) {
                    toast.error("AI trials require a broadcast schedule");
                    setLoading(false);
                    return;
                }

                const result = await generateQuizAI({
                    topic: aiParams.topic,
                    difficulty: aiParams.difficulty,
                    num_questions: aiParams.numQuestions
                });

                if (result.error) throw new Error(result.error);

                // POPULATE LOCAL STATE FOR REVIEW
                if (result.data) {
                    setQuizData({
                        ...quizData,
                        title: result.data.title,
                        description: result.data.description,
                        scheduled_date: aiParams.scheduled_date,
                        scheduled_time: aiParams.scheduled_time,
                        difficulty: aiParams.difficulty
                    });

                    // Map AI questions to UI state format
                    const mappedQuestions = result.data.questions.map((q: any, i: number) => ({
                        id: Date.now() + i,
                        questionText: q.questionText,
                        options: q.options,
                        correctIndex: q.correctIndex,
                        timerSeconds: q.timerSeconds
                    }));

                    setQuestions(mappedQuestions);
                    setCreateMode('manual');
                    toast.success("AI Content generated! Review and finalize below.");
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 transition-colors duration-500 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm hover:bg-gray-50'}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight italic uppercase">Create Quiz</h1>
                            <p className={`text-xs font-bold uppercase tracking-widest opacity-40 mt-1`}>
                                {createMode === 'manual' ? 'Manual Construction' : 'AI Powered Generation'}
                            </p>
                        </div>
                    </div>

                    <div className={`flex p-1.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <button
                            onClick={() => setCreateMode('manual')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${createMode === 'manual'
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                : 'opacity-40 hover:opacity-100'}`}
                        >
                            <Brain className="w-4 h-4" /> Manual
                        </button>
                        <button
                            onClick={() => setCreateMode('ai')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${createMode === 'ai'
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'opacity-40 hover:opacity-100'}`}
                        >
                            <Sparkles className="w-4 h-4" /> AI Generate
                        </button>
                    </div>
                </div>

                {createMode === 'manual' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Basic Info */}
                        <div className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-xl'}`}>
                            <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm italic">01</span>
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Quiz Title</label>
                                    <input
                                        type="text"
                                        value={quizData.title}
                                        onChange={e => setQuizData({ ...quizData, title: e.target.value })}
                                        placeholder="e.g. ADVANCED DATA STRUCTURES"
                                        className={`w-full p-4 rounded-2xl border outline-none font-bold placeholder:opacity-30 transition-all ${isDark ? 'bg-black/40 border-white/10 focus:border-amber-500/50' : 'bg-gray-50 border-gray-200 focus:border-amber-400'}`}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Difficulty</label>
                                    <div className="flex gap-2">
                                        {['Easy', 'Medium', 'Hard', 'Expert'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setQuizData({ ...quizData, difficulty: level })}
                                                className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${quizData.difficulty === level
                                                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                    : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Description</label>
                                    <textarea
                                        value={quizData.description}
                                        onChange={e => setQuizData({ ...quizData, description: e.target.value })}
                                        placeholder="ENTER A COMPELLING OVERVIEW FOR THIS COMPETITION..."
                                        rows={3}
                                        className={`w-full p-4 rounded-2xl border outline-none font-bold placeholder:opacity-30 transition-all ${isDark ? 'bg-black/40 border-white/10 focus:border-amber-500/50' : 'bg-gray-50 border-gray-200 focus:border-amber-400'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-xl'}`}>
                            <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm italic">02</span>
                                Scheduling & Parameters
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                                        <input
                                            type="date"
                                            value={quizData.scheduled_date}
                                            onChange={e => setQuizData({ ...quizData, scheduled_date: e.target.value })}
                                            className={`w-full p-4 pl-12 rounded-2xl border outline-none font-bold transition-all ${isDark ? 'bg-black/40 border-white/10 focus:border-blue-500/50' : 'bg-gray-50 border-gray-200'}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Start Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                                        <input
                                            type="time"
                                            value={quizData.scheduled_time}
                                            onChange={e => setQuizData({ ...quizData, scheduled_time: e.target.value })}
                                            className={`w-full p-4 pl-12 rounded-2xl border outline-none font-bold transition-all ${isDark ? 'bg-black/40 border-white/10 focus:border-blue-500/50' : 'bg-gray-50 border-gray-200'}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Total Duration (MIN)</label>
                                    <input
                                        type="number"
                                        value={quizData.duration_minutes}
                                        onChange={e => setQuizData({ ...quizData, duration_minutes: parseInt(e.target.value) })}
                                        className={`w-full p-4 rounded-2xl border outline-none font-bold transition-all ${isDark ? 'bg-black/40 border-white/10 focus:border-blue-500/50' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h2 className="text-2xl font-black uppercase italic">Questions ({questions.length})</h2>
                                <button
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] italic shadow-xl"
                                >
                                    <Plus className="w-4 h-4" /> Add Multi-Choice
                                </button>
                            </div>

                            {questions.map((q, index) => (
                                <div key={q.id} className={`p-8 rounded-[2.5rem] border relative group transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-black/5 shadow-lg'}`}>
                                    <div className="absolute top-6 right-6 flex gap-2">
                                        <button
                                            onClick={() => removeQuestion(q.id)}
                                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                            disabled={questions.length === 1}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mb-8">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 block">Question {index + 1}</label>
                                        <input
                                            type="text"
                                            value={q.questionText}
                                            onChange={e => handleQuestionChange(q.id, 'questionText', e.target.value)}
                                            placeholder="What is the time complexity of..."
                                            className="w-full text-2xl font-black bg-transparent border-none outline-none placeholder:opacity-20"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleQuestionChange(q.id, 'correctIndex', oIndex)}
                                                    className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${q.correctIndex === oIndex
                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                                        : isDark ? 'border-white/10 hover:border-white/30' : 'border-gray-200'
                                                        }`}
                                                >
                                                    {q.correctIndex === oIndex ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-[10px] font-black opacity-30">{String.fromCharCode(65 + oIndex)}</span>}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={e => handleOptionChange(q.id, oIndex, e.target.value)}
                                                    placeholder={`Enter option ${String.fromCharCode(65 + oIndex)}`}
                                                    className={`flex-1 p-4 rounded-2xl text-sm font-bold bg-transparent border outline-none transition-all ${isDark ? 'border-white/5 focus:border-white/20' : 'border-gray-100'}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                        <Clock className="w-4 h-4 opacity-30" />
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Question Timer:</label>
                                        <input
                                            type="number"
                                            value={q.timerSeconds}
                                            onChange={e => handleQuestionChange(q.id, 'timerSeconds', parseInt(e.target.value))}
                                            className={`w-24 p-2 rounded-xl text-center font-black bg-transparent border transition-all ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                                        />
                                        <span className="text-[10px] font-black opacity-30">SECONDS</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto py-12">
                        <div className={`p-10 rounded-[3rem] border backdrop-blur-3xl text-center ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-xl'}`}>
                            <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-8">
                                <Sparkles className="w-10 h-10 animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tight">GEMINI AI GENERATOR</h2>
                            <p className="text-sm opacity-50 font-bold mb-10 leading-relaxed uppercase tracking-widest underline decoration-indigo-500/30 underline-offset-8">Generate a full competitive trial in seconds</p>

                            <div className="space-y-8 text-left">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Core Topic</label>
                                    <input
                                        type="text"
                                        value={aiParams.topic}
                                        onChange={e => setAiParams({ ...aiParams, topic: e.target.value })}
                                        placeholder="e.g. ADVANCED QUANTUM GATES"
                                        className={`w-full p-5 rounded-3xl border outline-none font-black text-xl transition-all ${isDark ? 'bg-black/60 border-white/10 focus:border-indigo-500/50 shadow-inner' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Complexity</label>
                                        <select
                                            value={aiParams.difficulty}
                                            onChange={e => setAiParams({ ...aiParams, difficulty: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border outline-none font-black transition-all ${isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                            <option>Expert</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Question Count</label>
                                        <input
                                            type="number"
                                            value={aiParams.numQuestions}
                                            onChange={e => setAiParams({ ...aiParams, numQuestions: parseInt(e.target.value) })}
                                            className={`w-full p-4 rounded-2xl border outline-none font-black transition-all ${isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 my-8" />

                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Broadcast Schedule
                                    </h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={aiParams.scheduled_date}
                                                onChange={e => setAiParams({ ...aiParams, scheduled_date: e.target.value })}
                                                className={`w-full p-4 rounded-2xl border outline-none font-black transition-all ${isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Start Time</label>
                                            <input
                                                type="time"
                                                value={aiParams.scheduled_time}
                                                onChange={e => setAiParams({ ...aiParams, scheduled_time: e.target.value })}
                                                className={`w-full p-4 rounded-2xl border outline-none font-black transition-all ${isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Global */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all active:scale-90 flex items-center justify-center gap-3 ${loading
                            ? 'bg-white/10 text-white/30 cursor-wait'
                            : createMode === 'manual'
                                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/40'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'}`}
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Save className="w-5 h-5 flex-shrink-0" /> {createMode === 'manual' ? 'Finalize Arena' : 'Invoke Gemini Intel'}</>
                        )}
                    </button>
                </div>
            </div>
            <div className="h-40" />
        </div>
    );
}
