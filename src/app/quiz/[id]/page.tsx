"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Trophy, CheckCircle2, Clock, Brain, Play, AlertCircle, Sparkles } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getQuizSessionStatus, registerForQuiz, getQuizResults } from '@/actions/quiz';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

const Antigravity = dynamic(() => import('@/components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function QuizDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { isDark } = useAppContext();

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [results, setResults] = useState<any[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            const result = await getQuizSessionStatus(id);
            if (result.data) {
                setQuiz(result.data);
            }
            setLoading(false);
        };
        fetchStatus();

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [id]);

    // Real-time: react to admin scheduling, force-start, or quiz completion
    useEffect(() => {
        if (!id) return;
        const supabase = createClient();
        const channel = supabase
            .channel(`quiz_detail_${id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'quizzes', filter: `id=eq.${id}` },
                (payload) => {
                    setQuiz((prev: any) => prev ? {
                        ...prev,
                        status: payload.new.status,
                        scheduled_at: payload.new.scheduled_at,
                        duration_minutes: payload.new.duration_minutes
                    } : prev);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    // Fetch final results when quiz is completed
    useEffect(() => {
        if (quiz?.status !== 'completed') return;
        setResultsLoading(true);
        getQuizResults(id).then(res => {
            if (res.data) setResults(res.data);
            setResultsLoading(false);
        });
    }, [quiz?.status, id]);

    const handleRegister = async () => {
        const result = await registerForQuiz(id);
        if (result.success) {
            toast.success("Successfully registered for the arena!");
            // Refresh local state
            setQuiz((prev: any) => ({ ...prev, is_registered: true }));
        } else {
            toast.error(result.error || "Registration failed");
        }
    };

    const getTotalDuration = () => {
        if (!quiz?.quiz_questions || quiz.quiz_questions.length === 0) {
            return (quiz?.duration_minutes || 15) * 60;
        }
        return quiz.quiz_questions.reduce((sum: number, q: any) => sum + (q.timer_seconds || 0), 0);
    };

    const getButtonState = () => {
        if (!quiz) return { text: "Loading...", disabled: true };

        const totalSecs = getTotalDuration();
        const scheduledTime = quiz.scheduled_at ? new Date(quiz.scheduled_at) : null;
        const endTime = scheduledTime ? new Date(scheduledTime.getTime() + totalSecs * 1000) : null;
        const isPastEnd = endTime ? currentTime.getTime() > endTime.getTime() : false;

        if (quiz.status === 'completed' || isPastEnd) {
            return {
                text: "Arena Concluded",
                disabled: true,
                icon: <CheckCircle2 className="w-4 h-4" />
            }
        }

        if (!quiz.is_registered) {
            return {
                text: "Authorize Entry (Register)",
                disabled: false,
                action: handleRegister,
                icon: <CheckCircle2 className="w-4 h-4" />
            };
        }

        if (!quiz.scheduled_at) {
            return { text: "Waiting for Broadcast Schedule...", disabled: true, icon: <Clock className="w-4 h-4" /> };
        }

        const scheduledAtTime = new Date(quiz.scheduled_at);
        const diffMs = scheduledAtTime.getTime() - currentTime.getTime();
        const diffMins = diffMs / 60000;

        // Requirement: Lobby opens 1 minute before start
        if (diffMins > 1) {
            return {
                text: `Lobby opens in ${Math.ceil(diffMins - 1)} min`,
                disabled: true,
                icon: <Clock className="w-4 h-4" />
            };
        }

        return {
            text: "Engage (Enter Lobby)",
            disabled: false,
            action: () => router.push(`/quiz/lobby?id=${id}`),
            icon: <Play className="w-4 h-4 fill-current" />
        };
    };

    const totalSecs = getTotalDuration();
    const durationDisplay = totalSecs >= 60 ? `${Math.ceil(totalSecs / 60)}m` : `${totalSecs}s`;
    const buttonState = getButtonState();

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center font-black italic uppercase tracking-widest ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <Sparkles className="w-8 h-8 animate-pulse text-amber-500 mr-4" /> Calibrating Arena...
        </div>
    );

    if (!quiz) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white font-black uppercase">
            Record not found in database.
        </div>
    );

    return (
        <div className={`min-h-screen relative transition-colors duration-700 flex flex-col items-center justify-center p-6 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={40}
                    magnetRadius={5}
                    ringRadius={5}
                    color={isDark ? "#ffffff" : "#F59E0B"}
                />
                <div className={`absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full opacity-10 ${isDark ? 'bg-amber-900' : 'bg-amber-200'}`} />
            </div>

            <div className="relative z-10 w-full max-w-2xl mt-12">
                <button
                    onClick={() => router.push('/quiz')}
                    className={`absolute top-0 left-0 p-4 rounded-2xl transition-all hover:scale-110 active:scale-90 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white shadow-xl text-black'}`}
                >
                    <ArrowLeft className="w-5 h-5 font-black" />
                </button>

                <div className={`mt-20 p-10 md:p-14 rounded-[4rem] border backdrop-blur-3xl text-center relative overflow-hidden transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-2xl'}`}>

                    {/* Animated gradient top bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-transparent to-amber-500 opacity-30" />

                    <div className="flex justify-center mb-10">
                        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-transform hover:rotate-[15deg] ${isDark ? 'bg-amber-500/10 text-amber-500 shadow-inner' : 'bg-amber-50 text-amber-600'}`}>
                            <Trophy className="w-14 h-14 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>

                    <div className="inline-block px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-40 border-amber-500/20">
                        {quiz.difficulty} Difficulty Rating
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none italic uppercase">{quiz.title}</h1>

                    {quiz.scheduled_at && quiz.status !== 'completed' && (
                        <div className="mb-10 inline-flex flex-col items-center">
                            <div className="px-6 py-3 rounded-2xl bg-amber-500 text-white text-[11px] font-black tracking-widest uppercase flex items-center gap-3 shadow-2xl shadow-amber-500/30">
                                <Clock className="w-4 h-4" />
                                Start Channel: {new Date(quiz.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <span className="text-[9px] mt-4 opacity-30 font-black uppercase tracking-[0.3em]">
                                Synchronized Global Time
                            </span>
                        </div>
                    )}

                    {quiz.status === 'completed' && quiz.scheduled_at && (
                        <div className="mb-10 inline-flex flex-col items-center">
                            <div className="px-6 py-3 rounded-2xl bg-gray-500/20 text-gray-500 text-[11px] font-black tracking-widest uppercase flex items-center gap-3 border border-gray-500/30">
                                <CheckCircle2 className="w-4 h-4" />
                                Concluded: {new Date(new Date(quiz.scheduled_at).getTime() + totalSecs * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <span className="text-[9px] mt-4 opacity-30 font-black uppercase tracking-[0.3em]">
                                Session Officially Terminated
                            </span>
                        </div>
                    )}

                    <p className="text-sm md:text-md opacity-50 mb-12 leading-relaxed max-w-lg mx-auto font-bold uppercase tracking-tight italic">
                        {quiz.description}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                            <Clock className="w-5 h-5 mx-auto mb-3 opacity-30" />
                            <div className="text-2xl font-black italic">{durationDisplay}</div>
                            <div className="text-[9px] uppercase font-black tracking-widest opacity-30">Trial Limit</div>
                        </div>
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                            <Users className="w-5 h-5 mx-auto mb-3 opacity-30" />
                            <div className="text-2xl font-black italic">{quiz.registration_count}</div>
                            <div className="text-[9px] uppercase font-black tracking-widest opacity-30">Combatants</div>
                        </div>
                    </div>

                    <button
                        onClick={buttonState.action}
                        disabled={buttonState.disabled}
                        className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${buttonState.disabled
                          ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                          : 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20'
                        }`}
                    >
                        {buttonState.icon} {buttonState.text}
                    </button>

                    <div className="mt-12 flex justify-center gap-8 opacity-20">
                        <Brain className="w-5 h-5 animate-pulse" />
                        <Sparkles className="w-5 h-5" />
                        <AlertCircle className="w-5 h-5" />
                    </div>

                </div>
            </div>

            {/* Final Results Leaderboard — shown when quiz is completed */}
            {quiz.status === 'completed' && (
                <div className={`relative z-10 w-full max-w-2xl mt-6 mb-6 p-8 md:p-12 rounded-[3rem] border backdrop-blur-3xl transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-2xl'}`}>
                    <div className="flex items-center gap-4 mb-8">
                        <Trophy className="w-7 h-7 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Final Results</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Arena Leaderboard</p>
                        </div>
                    </div>

                    {resultsLoading ? (
                        <div className="py-10 text-center text-xs font-black uppercase tracking-widest opacity-30 animate-pulse">Loading Results...</div>
                    ) : results.length === 0 ? (
                        <div className="py-10 text-center text-xs font-black uppercase tracking-widest opacity-30">No participants recorded</div>
                    ) : (
                        <div className="space-y-3">
                            {results.map((p: any, i: number) => {
                                const name = p.profiles?.full_name || p.profiles?.handle || 'Player';
                                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                                const isTop3 = i < 3;
                                return (
                                    <div key={p.user_id} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${
                                        i === 0 ? 'bg-amber-500/10 border-amber-500/30' :
                                        i === 1 ? 'bg-white/10 border-white/20' :
                                        i === 2 ? 'bg-orange-900/20 border-orange-700/20' :
                                        isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-black/5'
                                    }`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0 ${
                                            isTop3 ? 'text-xl' : 'text-xs opacity-40'
                                        }`}>
                                            {medal ?? `#${i + 1}`}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black uppercase tracking-tight text-sm truncate">{name}</p>
                                            {p.profiles?.handle && (
                                                <p className="text-[10px] opacity-30 font-bold">@{p.profiles.handle}</p>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-xl font-black italic ${i === 0 ? 'text-amber-500' : ''}`}>{p.score.toLocaleString()}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30">pts</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="h-20" />
        </div>
    );
}

const Users = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
