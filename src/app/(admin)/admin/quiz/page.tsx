"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Play, CheckCircle, Clock, Search, Trash2, Trophy, Calendar, Edit2, X, Save } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getAdminQuizzes } from '@/actions/admin-quiz';
import { startQuiz, endQuiz } from '@/actions/quiz-session';
import { deleteQuiz, scheduleQuiz, getQuizQuestions, updateQuizQuestion, getQuizResults } from '@/actions/quiz';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export default function AdminQuizDashboard() {
    const { isDark } = useAppContext();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [liveData, setLiveData] = useState<Record<number, { count: number; leaderboard: any[] }>>({});
    const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

    const [schedulingQuiz, setSchedulingQuiz] = useState<number | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleDuration, setScheduleDuration] = useState(15);
    const [isScheduling, setIsScheduling] = useState(false);

    const [viewingQuestionsQuiz, setViewingQuestionsQuiz] = useState<any | null>(null);
    const [quizQuestionsList, setQuizQuestionsList] = useState<any[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
    const [editQuestionData, setEditQuestionData] = useState<any>(null);

    // Completed quiz results
    const [expandedResults, setExpandedResults] = useState<number | null>(null);
    const [completedResults, setCompletedResults] = useState<Record<number, any[]>>({});

    const loadQuizzes = async () => {
        const result = await getAdminQuizzes();
        if (result.data) {
            setQuizzes(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadQuizzes();
    }, []);

    // Active polling for auto-start & auto-end logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setQuizzes((prev) => {
                const toStart = prev.filter(q => q.status === 'scheduled' && q.scheduled_at && now >= new Date(q.scheduled_at).getTime());
                
                const toEnd = prev.filter(q => {
                    if (q.status !== 'live' || !q.scheduled_at) return false;
                    const elapsed = Math.floor((now - new Date(q.scheduled_at).getTime()) / 1000);
                    let totalSeconds = 0;
                    if (q.quiz_questions && q.quiz_questions.length > 0) {
                        totalSeconds = q.quiz_questions.reduce((sum: number, qq: any) => sum + (qq.timer_seconds || 15), 0);
                    } else {
                        totalSeconds = (q.duration_minutes || 15) * 60;
                    }
                    return elapsed >= totalSeconds;
                });

                if (toStart.length > 0) {
                    setTimeout(() => {
                        toStart.forEach(q => startQuiz(q.id).catch(console.error));
                    }, 0);
                }

                if (toEnd.length > 0) {
                    setTimeout(() => {
                        toEnd.forEach(q => endQuiz(q.id).catch(console.error));
                    }, 0);
                }

                return prev.map((quiz) => {
                    if (toStart.some(qs => qs.id === quiz.id)) return { ...quiz, status: 'live' };
                    if (toEnd.some(qe => qe.id === quiz.id)) return { ...quiz, status: 'completed' };
                    return quiz;
                });
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getRemainingTime = (quiz: any) => {
        if (quiz.status !== 'live' || !quiz.scheduled_at) return null;
        
        const now = Date.now();
        const start = new Date(quiz.scheduled_at).getTime();
        const elapsed = Math.floor((now - start) / 1000);
        
        let totalSeconds = 0;
        if (quiz.quiz_questions && quiz.quiz_questions.length > 0) {
            totalSeconds = quiz.quiz_questions.reduce((sum: number, q: any) => sum + (q.timer_seconds || 15), 0);
        } else {
            totalSeconds = (quiz.duration_minutes || 15) * 60;
        }

        const remaining = Math.max(0, totalSeconds - elapsed);
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Live leaderboard subscription for all live quizzes
    useEffect(() => {
        const liveQuizzes = quizzes.filter(q => q.status === 'live');
        if (liveQuizzes.length === 0) return;

        const supabaseClient = createClient();
        const channels: any[] = [];

        liveQuizzes.forEach(quiz => {
            // Load initial leaderboard
            supabaseClient
                .from('quiz_participants')
                .select('user_id, score, is_active, profiles(full_name, handle)')
                .eq('quiz_id', quiz.id)
                .eq('is_active', true)
                .order('score', { ascending: false })
                .limit(10)
                .then(({ data }) => {
                    if (data) {
                        setLiveData(prev => ({
                            ...prev,
                            [quiz.id]: {
                                count: data.length,
                                leaderboard: data.map((p: any) => ({
                                    name: p.profiles?.full_name || p.profiles?.handle || 'Player',
                                    score: p.score
                                }))
                            }
                        }));
                    }
                });

            // Subscribe to live updates
            const channel = supabaseClient
                .channel(`admin_live_${quiz.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'quiz_participants',
                        filter: `quiz_id=eq.${quiz.id}`
                    },
                    () => {
                        // Refetch leaderboard on any change
                        supabaseClient
                            .from('quiz_participants')
                            .select('user_id, score, is_active, profiles(full_name, handle)')
                            .eq('quiz_id', quiz.id)
                            .eq('is_active', true)
                            .order('score', { ascending: false })
                            .limit(10)
                            .then(({ data }) => {
                                if (data) {
                                    setLiveData(prev => ({
                                        ...prev,
                                        [quiz.id]: {
                                            count: data.length,
                                            leaderboard: data.map((p: any) => ({
                                                name: p.profiles?.full_name || p.profiles?.handle || 'Player',
                                                score: p.score
                                            }))
                                        }
                                    }));
                                }
                            });
                    }
                )
                .subscribe();

            channels.push({ supabaseClient, channel });
        });

        return () => {
            channels.forEach(({ supabaseClient, channel }) => supabaseClient.removeChannel(channel));
        };
    }, [quizzes.map(q => `${q.id}:${q.status}`).join(',')]);

    const handleStartQuiz = async (id: number) => {
        const result = await startQuiz(id);
        if (result.success) {
            toast.success("Quiz is now LIVE!");
            loadQuizzes();
        } else {
            toast.error(result.error || "Failed to start quiz");
        }
    };

    const handleDeleteQuiz = async (id: number, title: string) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        // Optimistically remove from UI immediately
        setQuizzes(prev => prev.filter(q => q.id !== id));
        const result = await deleteQuiz(id);
        if (result.success) {
            toast.success("Quiz deleted.");
        } else {
            toast.error(result.error || "Delete failed");
            // Restore list if server-side delete failed
            loadQuizzes();
        }
    };

    const handleViewQuestions = async (quiz: any) => {
        setViewingQuestionsQuiz(quiz);
        setLoadingQuestions(true);
        const result = await getQuizQuestions(quiz.id);
        if (result.data) {
            setQuizQuestionsList(result.data);
        }
        setLoadingQuestions(false);
    };

    const handleViewResults = async (quizId: number) => {
        if (expandedResults === quizId) {
            setExpandedResults(null);
            return;
        }
        if (!completedResults[quizId]) {
            const res = await getQuizResults(quizId);
            if (res.data) {
                setCompletedResults(prev => ({ ...prev, [quizId]: res.data as any[] }));
            }
        }
        setExpandedResults(quizId);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            live: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse',
            completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        };
        const activeStyle = styles[status] || 'bg-gray-100 text-gray-600';
        const displayText = status === 'completed' ? 'concluded' : status;

        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${activeStyle}`}>
                {displayText}
            </span>
        );
    };

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Quiz Control</h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 mt-1 underline decoration-amber-500/30">Master Dashboard</p>
                    </div>

                    <button
                        onClick={() => router.push('/admin/quiz/create')}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
                    >
                        <Plus className="w-4 h-4" /> New Competition
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Events', val: quizzes.length, icon: Trophy, color: 'text-amber-500' },
                        { label: 'Live Sessions', val: quizzes.filter(q => q.status === 'live').length, icon: Play, color: 'text-emerald-500' },
                        { label: 'Upcoming', val: quizzes.filter(q => q.status === 'scheduled').length, icon: Clock, color: 'text-blue-500' },
                        { label: 'Registrations', val: quizzes.reduce((acc, q) => acc + (Number(q.registration_count) || 0), 0), icon: Users, color: 'text-purple-500' }
                    ].map((s, idx) => (
                        <div key={idx} className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
                            <s.icon className={`w-6 h-6 mb-4 ${s.color} opacity-80`} />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{s.label}</p>
                            <p className="text-3xl font-black italic">{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* Main Table/List */}
                <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
                    <div className="p-6 border-b border-white/5 flex items-center gap-4">
                        <Search className="w-5 h-5 opacity-30" />
                        <input
                            type="text"
                            placeholder="FILTER SESSIONS..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="bg-transparent border-none outline-none font-black text-xs tracking-widest flex-1"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className={`text-[10px] font-black uppercase tracking-widest border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                                    <th className="px-8 py-5">Competition</th>
                                    <th className="px-8 py-5">Schedule</th>
                                    <th className="px-8 py-5 text-center">Registrations</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center uppercase font-black text-xs tracking-widest opacity-30">Synchronizing...</td>
                                    </tr>
                                ) : quizzes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center uppercase font-black text-xs tracking-widest opacity-30">No active trials found</td>
                                    </tr>
                                ) : quizzes.filter(q => q.title.toLowerCase().includes(filter.toLowerCase())).map(quiz => (
                                    <tr key={quiz.id} className={`group hover:bg-white/5 transition-colors border-b ${isDark ? 'border-white/5' : 'border-black/5 opacity-80 hover:opacity-100'}`}>
                                        <td 
                                            className="px-8 py-6 cursor-pointer hover:bg-white/10 transition-colors"
                                            onClick={() => handleViewQuestions(quiz)}
                                            title="Click to view/edit questions"
                                        >
                                            <p className="font-black italic text-lg tracking-tight uppercase group-hover:text-amber-500 transition-colors">{quiz.title}</p>
                                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{quiz.difficulty}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-xs tracking-widest uppercase">
                                                {quiz.scheduled_at ? new Date(quiz.scheduled_at).toLocaleDateString() : 'NO DATE'}
                                            </p>
                                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                                {quiz.scheduled_at ? new Date(quiz.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-black italic text-xl">{quiz.registration_count || 0}</span>
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">AUTH_USERS</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <StatusBadge status={quiz.status} />
                                                {quiz.status === 'live' && quiz.scheduled_at && (
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">
                                                        {getRemainingTime(quiz)} Left
                                                    </span>
                                                )}
                                                {quiz.status === 'completed' && quiz.scheduled_at && (
                                                    <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.1em]">
                                                        Ended {new Date(new Date(quiz.scheduled_at).getTime() + (quiz.duration_minutes || 15) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Live leaderboard for live quizzes */}
                                            {quiz.status === 'live' && liveData[quiz.id] && (
                                                <div className="mt-4">
                                                    <button
                                                        onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 mx-auto"
                                                    >
                                                        <Play className="w-3 h-3 fill-current" />
                                                        {liveData[quiz.id].count} Active — {expandedQuiz === quiz.id ? 'Hide' : 'Show'} Leaderboard
                                                    </button>

                                                    {expandedQuiz === quiz.id && (
                                                        <div className="mt-4 space-y-2">
                                                            {liveData[quiz.id].leaderboard.map((p, i) => (
                                                                <div key={i} className="flex justify-between items-center px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                                                    <span className="text-[10px] font-black">#{i + 1} {p.name}</span>
                                                                    <span className="text-[10px] font-black text-amber-500">{p.score} pts</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {/* Completed Results */}
                                            {quiz.status === 'completed' && (
                                                <div className="mt-4">
                                                    <button
                                                        onClick={() => handleViewResults(quiz.id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 mx-auto"
                                                    >
                                                        <Trophy className="w-3 h-3" />
                                                        {expandedResults === quiz.id ? 'Hide' : 'Show'} Final Results
                                                    </button>

                                                    {expandedResults === quiz.id && completedResults[quiz.id] && (
                                                        <div className="mt-4 space-y-2">
                                                            {completedResults[quiz.id].map((p, i) => (
                                                                <div key={i} className="flex justify-between items-center px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                                                    <span className="text-[10px] font-black">#{i + 1} {p.profiles?.full_name || p.profiles?.handle || 'Unknown'}</span>
                                                                    <span className="text-[10px] font-black text-amber-500">{p.score} pts</span>
                                                                </div>
                                                            ))}
                                                            {completedResults[quiz.id].length === 0 && (
                                                                <div className="text-[10px] opacity-40 italic text-center">No participants</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                { (quiz.status === 'scheduled' || quiz.status === 'draft') && (
                                                    <>
                                                        {quiz.status === 'scheduled' && (
                                                            <button
                                                                onClick={() => handleStartQuiz(quiz.id)}
                                                                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                                                            >
                                                                Force Start
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSchedulingQuiz(quiz.id);
                                                                const d = new Date();
                                                                setScheduleDate(quiz.scheduled_at ? quiz.scheduled_at.split('T')[0] : d.toISOString().split('T')[0]);
                                                                setScheduleTime(quiz.scheduled_at ? new Date(quiz.scheduled_at).toTimeString().split(' ')[0].substring(0, 5) : d.toTimeString().split(' ')[0].substring(0, 5));
                                                                setScheduleDuration(quiz.duration_minutes || 15);
                                                            }}
                                                            className="p-3 rounded-xl border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all flex items-center justify-center"
                                                            title="Schedule quiz"
                                                        >
                                                            <Calendar className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                                                    className="p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Delete quiz"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Schedule Modal */}
                {schedulingQuiz && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className={`w-full max-w-md p-8 rounded-[2rem] border shadow-2xl ${isDark ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-black/5'}`}>
                            <h3 className="text-xl font-black italic uppercase tracking-tight mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-500" />
                                Schedule Competition
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={scheduleDate}
                                        onChange={e => setScheduleDate(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:border-amber-500/50 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={scheduleTime}
                                        onChange={e => setScheduleTime(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:border-amber-500/50 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={scheduleDuration}
                                        onChange={e => setScheduleDuration(Number(e.target.value))}
                                        min={5}
                                        max={180}
                                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:border-amber-500/50 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSchedulingQuiz(null)}
                                    className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!scheduleDate || !scheduleTime) {
                                            toast.error("Please select both date and time");
                                            return;
                                        }
                                        setIsScheduling(true);
                                        const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
                                        const result = await scheduleQuiz(schedulingQuiz, scheduledAt, scheduleDuration);
                                        if (result.success) {
                                            toast.success("Quiz scheduled successfully!");
                                            setSchedulingQuiz(null);
                                            loadQuizzes();
                                        } else {
                                            toast.error(result.error || "Scheduling failed");
                                        }
                                        setIsScheduling(false);
                                    }}
                                    disabled={isScheduling}
                                    className="flex-1 py-4 rounded-xl bg-amber-500 text-white font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all disabled:opacity-50"
                                >
                                    {isScheduling ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Questions Preview & Edit Modal */}
                {viewingQuestionsQuiz && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col p-8 rounded-[2rem] border shadow-2xl overflow-hidden ${isDark ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-black/5'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tight">
                                        {viewingQuestionsQuiz.title} — Questions
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                        {quizQuestionsList.length} Questions
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setViewingQuestionsQuiz(null); setEditingQuestionId(null); }}
                                    className="p-2 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {loadingQuestions ? (
                                    <div className="p-10 text-center text-xs font-black uppercase tracking-widest opacity-40">Loading Questions...</div>
                                ) : (
                                    quizQuestionsList.map((q, idx) => (
                                        <div key={q.id} className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                            {editingQuestionId === q.id ? (
                                                <div className="space-y-4">
                                                    <textarea 
                                                        value={editQuestionData.question_text}
                                                        onChange={e => setEditQuestionData({...editQuestionData, question_text: e.target.value})}
                                                        className={`w-full p-3 rounded-xl text-sm font-bold bg-transparent border focus:border-amber-500 outline-none ${isDark ? 'border-white/10' : 'border-gray-300'}`}
                                                        rows={2}
                                                    />
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {editQuestionData.options.map((opt: string, oIdx: number) => (
                                                            <div key={oIdx} className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setEditQuestionData({...editQuestionData, correct_option_index: oIdx})}
                                                                    className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center border-2 transition-all ${editQuestionData.correct_option_index === oIdx ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : isDark ? 'border-white/10' : 'border-gray-300'}`}
                                                                >
                                                                    {editQuestionData.correct_option_index === oIdx ? <CheckCircle className="w-4 h-4" /> : <span className="text-[10px] font-black">{String.fromCharCode(65 + oIdx)}</span>}
                                                                </button>
                                                                <input 
                                                                    type="text" 
                                                                    value={opt}
                                                                    onChange={e => {
                                                                        const newOptions = [...editQuestionData.options];
                                                                        newOptions[oIdx] = e.target.value;
                                                                        setEditQuestionData({...editQuestionData, options: newOptions});
                                                                    }}
                                                                    className={`flex-1 p-2 rounded-lg text-sm font-bold bg-transparent border outline-none ${isDark ? 'border-white/10 w-full focus:border-white/30' : 'border-gray-200 w-full focus:border-black/20'}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 opacity-40" />
                                                            <input 
                                                                type="number"
                                                                value={editQuestionData.timer_seconds}
                                                                onChange={e => setEditQuestionData({...editQuestionData, timer_seconds: parseInt(e.target.value)})}
                                                                className={`w-20 p-2 text-center rounded-lg text-xs font-black bg-transparent border ${isDark ? 'border-white/10 outline-none focus:border-white/30' : 'border-gray-200 outline-none focus:border-black/20'}`}
                                                            />
                                                            <span className="text-[10px] font-black uppercase opacity-40">Seconds</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => setEditingQuestionId(null)}
                                                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={async () => {
                                                                    const result = await updateQuizQuestion(q.id, editQuestionData);
                                                                    if (result.success) {
                                                                        toast.success("Question updated!");
                                                                        setQuizQuestionsList(quizQuestionsList.map(item => item.id === q.id ? {...q, ...editQuestionData} : item));
                                                                        setEditingQuestionId(null);
                                                                    } else {
                                                                        toast.error(result.error || "Failed to update");
                                                                    }
                                                                }}
                                                                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-400"
                                                            >
                                                                <Save className="w-3 h-3" /> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="group/q relative">
                                                    <div className="absolute top-0 right-0 opacity-0 group-hover/q:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingQuestionId(q.id);
                                                                setEditQuestionData({ ...q });
                                                            }}
                                                            className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <h4 className="text-lg font-black italic pr-10 mb-4">{idx + 1}. {q.question_text}</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                        {q.options.map((opt: string, oIdx: number) => (
                                                            <div key={oIdx} className={`p-3 rounded-xl border flex items-center gap-3 ${q.correct_option_index === oIdx ? 'border-emerald-500/50 bg-emerald-500/5' : isDark ? 'border-white/5 opacity-50' : 'border-gray-200 opacity-70'}`}>
                                                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${q.correct_option_index === oIdx ? 'bg-emerald-500 text-white' : isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                                                    {String.fromCharCode(65 + oIdx)}
                                                                </span>
                                                                <span className="text-sm font-bold">{opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                                                        <Clock className="w-3 h-3" /> {q.timer_seconds} Seconds
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
