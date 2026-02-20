"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Trophy, Clock, Users, Play, ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getQuizSessionStatus } from '@/actions/quiz';
import { getProfile } from '@/actions/profile';
import { autoStartQuiz } from '@/actions/quiz-session';
import { createClient } from '@/utils/supabase/client';

const Antigravity = dynamic(() => import('@/components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

function QuizLobbyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = parseInt(searchParams.get('id') || '');
    const { isDark } = useAppContext();
    const supabase = createClient();

    const [quiz, setQuiz] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);

    // 1. Initial Load: Quiz Status & Profile
    useEffect(() => {
        if (!quizId) return;

        const init = async () => {
            const [statusRes, profile] = await Promise.all([
                getQuizSessionStatus(quizId),
                getProfile()
            ]);

            if (statusRes.data) {
                setQuiz(statusRes.data);
                if (!statusRes.data.is_registered) {
                    router.push(`/quiz/${quizId}`);
                    return;
                }
            }
            setLoading(false);

            // 2. Realtime Presence
            if (profile) {
                const channel = supabase.channel(`quiz_lobby_${quizId}`, {
                    config: {
                        presence: {
                            key: profile.id,
                        },
                    },
                });

                channel
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel.presenceState();
                        const users = Object.values(state).flat().map((p: any) => p.user_info);
                        setParticipants(users);
                    })
                    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                        // Optional: show join notifications
                    })
                    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                        // Optional: show leave notifications
                    })
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            await channel.track({
                                user_info: {
                                    id: profile.id,
                                    name: profile.full_name || 'Anonymous Combatant',
                                    handle: profile.handle || 'Guest',
                                    avatar: profile.avatar_url
                                }
                            });
                        }
                    });

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        };

        init();
    }, [quizId, router]);

    // 3. Precise Countdown Sync
    useEffect(() => {
        if (!quiz?.scheduled_at) return;

        const updateTimer = async () => {
            const target = new Date(quiz.scheduled_at).getTime();
            const now = Date.now();
            const diff = Math.max(0, Math.floor((target - now) / 1000));
            setTimeRemaining(diff);

            // AUTO-START: If time reaches zero
            if (diff <= 0 && !isStarting) {
                if (quiz.status === 'live') {
                    router.push(`/quiz/play?id=${quizId}`);
                } else {
                    setIsStarting(true);
                    console.log("Triggering auto-start...");
                    const res = await autoStartQuiz(quizId);
                    if (res.error) {
                        setIsStarting(false);
                        console.error("Auto-start failed:", res.error);
                    } else {
                        console.log("Auto-start successful");
                    }
                }
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, [quiz, quizId, router]);

    // 4. Listen for Remote Status Change (Admin Force Start)
    useEffect(() => {
        if (!quizId) return;

        const statusChannel = supabase
            .channel(`quiz_status_${quizId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'quizzes', filter: `id=eq.${quizId}` },
                (payload) => {
                    if (payload.new.status === 'live') {
                        router.push(`/quiz/play?id=${quizId}`);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(statusChannel);
        };
    }, [quizId, router]);

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const getGradientColor = (index: number) => {
        const gradients = [
            'from-amber-500/20 to-orange-500/20 border-amber-500/30',
            'from-purple-500/20 to-pink-500/20 border-purple-500/30',
            'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
            'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
        ];
        return gradients[index % gradients.length];
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center font-black italic uppercase tracking-[0.5em] ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
            Syncing Realtime Core...
        </div>
    );

    return (
        <div className={`min-h-screen relative transition-colors duration-700 flex flex-col items-center justify-center p-6 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity count={60} magnetRadius={6} ringRadius={6} color={isDark ? "#ffffff" : "#F59E0B"} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[200px] rounded-full opacity-10 ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`} />
            </div>

            <div className="relative z-10 w-full max-w-4xl">
                <button
                    onClick={() => router.push('/quiz')}
                    className={`absolute top-0 left-0 p-4 rounded-3xl transition-all hover:scale-110 active:scale-90 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white shadow-xl text-black'}`}
                >
                    <ArrowLeft className="w-5 h-5 font-black" />
                </button>

                <div className={`mt-16 p-10 md:p-16 rounded-[4rem] border backdrop-blur-3xl relative overflow-hidden transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-2xl'}`}>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16 px-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter italic uppercase leading-none">{quiz?.title}</h1>
                            <div className="flex items-center gap-3 opacity-40 font-black uppercase tracking-[0.3em] text-[10px]">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authorized Participant
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className={`relative w-48 h-48 rounded-[3.5rem] border-8 flex items-center justify-center transition-all duration-300 ${(timeRemaining !== null && timeRemaining <= 10)
                                ? 'border-red-500 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.4)]'
                                : 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)]'
                                }`}>
                                <div className="text-center">
                                    <Clock className={`w-8 h-8 mx-auto mb-3 opacity-30 ${(timeRemaining !== null && timeRemaining <= 10) ? 'animate-bounce text-red-500 opacity-100' : ''}`} />
                                    <div className={`text-6xl font-black italic transition-colors ${(timeRemaining !== null && timeRemaining <= 10) ? 'text-red-500' : ''}`}>
                                        {formatTime(timeRemaining)}
                                    </div>
                                    <div className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30 mt-3 italic">
                                        Channel Start
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-16">
                        <div className="flex items-center justify-center gap-4 mb-10">
                            <div className="h-px bg-white/10 flex-1" />
                            <Users className="w-6 h-6 opacity-30" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight">Active Combatants ({participants.length})</h2>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <div className="flex flex-wrap justify-center gap-8 min-h-[160px]">
                            {participants.map((participant, index) => (
                                <div key={participant.id} className="flex flex-col items-center gap-4 group">
                                    <div className={`relative w-24 h-24 rounded-[2.5rem] border-4 flex items-center justify-center overflow-hidden bg-gradient-to-br ${getGradientColor(index)} transition-all duration-500 hover:rotate-6 hover:scale-110 cursor-pointer shadow-xl group-hover:shadow-amber-500/20`}>
                                        {participant.avatar ? (
                                            <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black italic">{getInitials(participant.name)}</span>
                                        )}
                                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-widest">{participant.name}</p>
                                        <p className="text-[10px] opacity-30 font-bold tracking-tight">@{participant.handle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`p-8 rounded-[2.5rem] border text-center relative overflow-hidden group ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-black/5 shadow-inner'}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-xs opacity-50 flex items-center justify-center gap-3 font-black uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Synchronized Broadcast will begin automatically
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-20" />
        </div>
    );
}

export default function QuizLobbyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-black uppercase tracking-widest italic animate-pulse">Establishing Signal...</div>}>
            <QuizLobbyContent />
        </Suspense>
    );
}
