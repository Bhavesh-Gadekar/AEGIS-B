"use client";

import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Trophy, CheckCircle2, Clock, Brain, Play, AlertCircle, Sparkles } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getQuizSessionStatus, registerForQuiz } from '@/actions/quiz';
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

    const getButtonState = () => {
        if (!quiz) return { text: "Loading...", disabled: true };

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

        const scheduledTime = new Date(quiz.scheduled_at);
        const diffMs = scheduledTime.getTime() - currentTime.getTime();
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

                    {quiz.scheduled_at && (
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

                    <p className="text-sm md:text-md opacity-50 mb-12 leading-relaxed max-w-lg mx-auto font-bold uppercase tracking-tight italic">
                        {quiz.description}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                            <Clock className="w-5 h-5 mx-auto mb-3 opacity-30" />
                            <div className="text-2xl font-black italic">{quiz.duration_minutes || 15}m</div>
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
                        className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 border ${buttonState.disabled
                            ? 'bg-transparent text-white/20 border-white/5 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-amber-500 hover:text-white border-transparent shadow-amber-500/20'
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
            <div className="h-20" />
        </div>
    );
}

const Users = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
