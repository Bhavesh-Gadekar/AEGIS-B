"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Trophy, Clock, CheckCircle, XCircle, Crown, Medal, Award, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getQuizQuestions, getQuizSessionStatus } from '@/actions/quiz';
import { submitAnswerSecure } from '@/actions/quiz-session';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

const Antigravity = dynamic(() => import('@/components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

function QuizPlayContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = parseInt(searchParams.get('id') || '');
    const { isDark } = useAppContext();
    const supabase = createClient();

    // Quiz Data
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [qTimeRemaining, setQTimeRemaining] = useState(0);
    const [quizTimeRemaining, setQuizTimeRemaining] = useState(0);

    // User State
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [totalScore, setTotalScore] = useState(0);

    // Leaderboard
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    // 1. Fetch Initial Data
    useEffect(() => {
        if (!quizId) return;
        const init = async () => {
            const [statusRes, questionsRes] = await Promise.all([
                getQuizSessionStatus(quizId),
                getQuizQuestions(quizId)
            ]);

            if (statusRes.data) setQuiz(statusRes.data);
            if (questionsRes.data) setQuestions(questionsRes.data);
            setLoading(false);
        };
        init();
    }, [quizId]);

    // 2. Real-time Leaderboard & Sync
    useEffect(() => {
        if (!quizId) return;

        const channel = supabase.channel(`leaderboard_${quizId}`)
            .on('broadcast', { event: 'score_update' }, ({ payload }) => {
                setLeaderboard(prev => {
                    const others = prev.filter(p => p.user_id !== payload.user_id);
                    return [...others, payload].sort((a, b) => b.score - a.score);
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [quizId]);

    // 3. Central Synchronization Loop
    useEffect(() => {
        if (!quiz?.scheduled_at || questions.length === 0) return;

        const sync = () => {
            const now = Date.now();
            const start = new Date(quiz.scheduled_at).getTime();
            const elapsedSeconds = Math.floor((now - start) / 1000);

            // Global Quiz Timer
            const totalDuration = (quiz.duration_minutes || 15) * 60;
            const remainingQuizTime = Math.max(0, totalDuration - elapsedSeconds);
            setQuizTimeRemaining(remainingQuizTime);

            if (remainingQuizTime <= 0) {
                // Quiz Finished
                setCurrentQuestionIndex(questions.length);
                return;
            }

            // Find current question based on elapsed time
            let cumulative = 0;
            let foundIndex = -1;
            for (let i = 0; i < questions.length; i++) {
                const qDuration = questions[i].timer_seconds || 15;
                if (elapsedSeconds >= cumulative && elapsedSeconds < cumulative + qDuration) {
                    foundIndex = i;
                    setQTimeRemaining(cumulative + qDuration - elapsedSeconds);
                    break;
                }
                cumulative += qDuration;
            }

            if (foundIndex === -1 && elapsedSeconds >= cumulative && questions.length > 0) {
                setCurrentQuestionIndex(questions.length);
            } else if (foundIndex !== -1 && foundIndex !== currentQuestionIndex) {
                // Question Transition
                setCurrentQuestionIndex(foundIndex);
                setSelectedOption(null);
                setShowResult(false);
                setIsCorrect(null);
            }
        };

        const interval = setInterval(sync, 1000);
        sync();
        return () => clearInterval(interval);
    }, [quiz, questions, currentQuestionIndex]);

    const handleOptionSelect = async (index: number) => {
        if (showResult || currentQuestionIndex < 0) return;

        setSelectedOption(index);
        const currentQ = questions[currentQuestionIndex];
        const responseTimeMs = ((currentQ.timer_seconds || 15) - qTimeRemaining) * 1000;

        // Secure Submission
        const result = await submitAnswerSecure({
            quizId,
            questionId: currentQ.id,
            chosenIndex: index,
            responseTimeMs
        });

        if (result.success) {
            setIsCorrect(index === currentQ.correct_option_index);
            setPointsEarned(result.points || 0);
            setTotalScore(prev => prev + (result.points || 0));
            setShowResult(true);

            // Broadcast score update to others
            supabase.channel(`leaderboard_${quizId}`).send({
                type: 'broadcast',
                event: 'score_update',
                payload: {
                    user_id: 'me', // Real userId would be better but Presence key is used in lobby
                    name: 'You',
                    score: totalScore + (result.points || 0)
                }
            });
        } else {
            toast.error(result.error || "Submission rejected");
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs.toString().padStart(2, '0')}`;
    };

    if (loading || currentQuestionIndex === -1 && quizTimeRemaining > 0) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-black uppercase italic tracking-[0.4em]">
            <Brain className="w-12 h-12 mb-6 animate-bounce text-amber-500" />
            Synchronizing Arena State...
        </div>
    );

    if (currentQuestionIndex >= questions.length || quizTimeRemaining <= 0) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <Antigravity count={100} color="#F59E0B" />
                <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-[4rem] p-16 text-center backdrop-blur-3xl shadow-2xl relative">
                    <Trophy className="w-24 h-24 mx-auto mb-8 text-amber-500 animate-pulse" />
                    <h1 className="text-6xl font-black mb-4 tracking-tighter italic uppercase">Arena Concluded</h1>
                    <p className="text-3xl mb-12 font-black italic">Final Score: <span className="text-amber-400">{totalScore}</span></p>

                    <div className="grid grid-cols-2 gap-4 mb-12">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Global Rank</p>
                            <p className="text-4xl font-black italic text-amber-500">TBD</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Accuracy</p>
                            <p className="text-4xl font-black italic">--%</p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/quiz')}
                        className="w-full py-6 bg-white text-black hover:bg-amber-500 hover:text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl active:scale-90"
                    >
                        Exit Arena
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className={`min-h-screen relative ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity count={50} magnetRadius={4} ringRadius={4} color="#ffffff" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] blur-[200px] rounded-full opacity-10 bg-amber-900" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
                {/* Left Sidebar - High Priority Leaderboard */}
                <div className="w-full md:w-80 p-6 border-r border-white/10 bg-black/40 backdrop-blur-3xl">
                    <div className="sticky top-6">
                        <div className="flex items-center gap-4 mb-10">
                            <Trophy className="w-8 h-8 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Live Rank</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 rounded-3xl border bg-amber-500/10 border-amber-500/40 shadow-2xl relative">
                                <div className="absolute top-4 right-4"><Crown className="w-5 h-5 text-amber-500" /></div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">My Standing</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black italic leading-none">{totalScore}</span>
                                    <span className="text-[10px] font-black uppercase opacity-30 pb-1">Points</span>
                                </div>
                            </div>

                            <div className="h-px bg-white/5 my-6" />

                            {/* Broadcaster Leaderboard */}
                            <div className="space-y-2 opacity-60">
                                {leaderboard.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-white/5">
                                        <span className="text-[10px] font-black italic">#{i + 1} {p.name}</span>
                                        <span className="text-xs font-black">{p.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Play Area */}
                <div className="flex-1 p-6 md:p-12">
                    <div className="max-w-4xl mx-auto h-full flex flex-col">
                        {/* Game Status Bar */}
                        <div className="flex justify-between items-center mb-12 gap-6">
                            <div className="flex flex-wrap gap-3">
                                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                        Trial {currentQuestionIndex + 1} <span className="opacity-30">/ {questions.length}</span>
                                    </p>
                                </div>
                                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                                        Arena: {formatTime(quizTimeRemaining)}
                                    </p>
                                </div>
                            </div>

                            <div className={`p-6 rounded-3xl border transition-all duration-300 ${qTimeRemaining <= 5 ? 'bg-red-500/10 border-red-500/50 shadow-red-500/20 shadow-xl scale-110' : 'bg-white/5 border-white/10 shadow-2xl'}`}>
                                <div className="flex flex-col items-center">
                                    <span className={`text-4xl font-black italic leading-none ${qTimeRemaining <= 5 ? 'text-red-500' : 'text-amber-500'}`}>
                                        {qTimeRemaining}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">SECONDS</span>
                                </div>
                            </div>
                        </div>

                        {/* Question View */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-20 backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-20" />

                                <h3 className="text-4xl md:text-6xl font-black mb-12 leading-[1.1] italic uppercase tracking-tighter">
                                    {currentQ?.question_text}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {currentQ?.options?.map((option: string, index: number) => {
                                        const isSelected = selectedOption === index;
                                        const isCorrectOption = index === currentQ.correct_option_index;
                                        const showCorrect = showResult && isCorrectOption;
                                        const showWrong = showResult && isSelected && !isCorrectOption;

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleOptionSelect(index)}
                                                disabled={showResult}
                                                className={`p-8 rounded-[2rem] border-4 text-left transition-all duration-500 relative group flex items-start gap-5 ${showCorrect
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xl shadow-emerald-500/40 scale-105 z-10'
                                                    : showWrong
                                                        ? 'bg-red-500 border-red-500 text-white shadow-2xl shadow-red-500/40 z-10'
                                                        : isSelected
                                                            ? 'bg-amber-500 border-amber-500 text-white shadow-2xl'
                                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-xl italic flex-shrink-0 transition-colors ${isSelected || showCorrect || showWrong ? 'border-white/40 bg-white/20' : 'border-white/10 opacity-30'}`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="text-lg font-black uppercase tracking-tight leading-tight pt-1">{option}</span>

                                                {showCorrect && <CheckCircle className="w-8 h-8 ml-auto drop-shadow-lg" />}
                                                {showWrong && <XCircle className="w-8 h-8 ml-auto drop-shadow-lg" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {showResult && (
                                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500 text-center">
                                    <div className={`inline-flex px-10 py-5 rounded-full border-4 font-black italic tracking-[0.2em] text-sm uppercase ${isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-2xl shadow-emerald-500/20' : 'bg-red-500/10 border-red-500 text-red-500 shadow-2xl shadow-red-500/20'}`}>
                                        {isCorrect ? `Perfect Timing! +${pointsEarned} PTS` : 'Critical Failure: Neutralized'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QuizPlayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-amber-500/10 border-t-amber-500 animate-spin mb-8 shadow-[0_0_50px_rgba(245,158,11,0.2)]" />
                <p className="font-black italic uppercase tracking-[0.5em] animate-pulse">Initializing Play Stream</p>
            </div>
        }>
            <QuizPlayContent />
        </Suspense>
    );
}
