"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Trophy, CheckCircle2, Clock, Brain, AlertCircle, Play } from 'lucide-react';
import { useAppContext } from '../../../components/AppProvider';

const Antigravity = dynamic(() => import('../../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

// Detailed Mock Quiz Data
const QUIZ_DETAILS: any = {
    1: {
        title: 'Data Structures & Algorithms',
        difficulty: 'Hard',
        timeLimit: '45 mins',
        questions: 20,
        description: 'Test your knowledge on complex data structures, sorting algorithms, and time complexity analysis.',
        topics: ['Trees & Graphs', 'Dynamic Programming', 'Big O Notation'],
    },
    2: {
        title: 'Quantum Computing Basics',
        difficulty: 'Expert',
        timeLimit: '60 mins',
        questions: 15,
        description: 'Dive into the world of qubits, superposition, and quantum gates. For advanced physicists and engineers.',
        topics: ['Qubits', 'Superposition', 'Quantum Gates', 'Entanglement'],
    },
    3: {
        title: 'UI/UX Design Systems',
        difficulty: 'Medium',
        timeLimit: '30 mins',
        questions: 25,
        description: 'Evaluate your understanding of design tokens, accessibility standards, and component libraries.',
        topics: ['Accessibility (a11y)', 'Color Theory', 'Component Architecture'],
    },
    4: {
        title: 'Blockchain Security',
        difficulty: 'Hard',
        timeLimit: '50 mins',
        questions: 18,
        description: 'Identify vulnerabilities in smart contracts and understand consensus attack vectors.',
        topics: ['Reentrancy Attacks', 'Consensus Mechanisms', 'Smart Contract Auditing'],
    },
    5: {
        title: 'Cloud Architecture Patterns',
        difficulty: 'Medium',
        timeLimit: '40 mins',
        questions: 22,
        description: 'Architect scalable and resilient cloud solutions using industry-standard patterns.',
        topics: ['Microservices', 'Serverless', 'Event-Driven Architecture'],
    },
};

export default function QuizDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { isDark } = useAppContext();

    const data = QUIZ_DETAILS[id];

    // Registration & Launch Logic
    const [isRegistered, setIsRegistered] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeToStart, setTimeToStart] = useState<number | null>(null);

    // Timer to check lobby availability
    React.useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = startTime.getTime() - now.getTime();
            setTimeToStart(diff);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    // Mock Admin: Set start time initial default
    const setMockStartTime = () => {
        const now = new Date();
        const start = new Date(now.getTime() + 10 * 60000); // 10 mins later default
        setStartTime(start);
    };

    const handleRegister = () => {
        setIsRegistered(true);
        if (!startTime) setMockStartTime();
    };

    const getButtonState = () => {
        if (!isRegistered) {
            return {
                text: "Register for Quiz",
                disabled: false,
                action: handleRegister,
                icon: <CheckCircle2 className="w-4 h-4" />
            };
        }

        if (!startTime) return { text: "Waiting for Schedule...", disabled: true, icon: <Clock className="w-4 h-4" /> };
        if (timeToStart === null) return { text: "Loading...", disabled: true };

        const minutesToStart = Math.floor(timeToStart / 60000);

        // Use 5 minutes as the cut-off for lobby entry
        if (minutesToStart > 5) { // e.g. 6 mins away -> disabled
            return {
                text: `Starts in ${minutesToStart} mins`,
                disabled: true,
                icon: <Clock className="w-4 h-4" />
            };
        }

        return {
            text: "Enter Lobby",
            disabled: false,
            action: () => router.push(`/quiz/lobby?start=${startTime.toISOString()}`),
            icon: <Play className="w-4 h-4 fill-current" />
        };
    };

    const buttonState = getButtonState();

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white font-bold">
            Quiz not found.
        </div>
    );

    return (
        <div className={`min-h-screen relative transition-colors duration-700 flex flex-col items-center justify-center p-6 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
            }`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={80}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#F59E0B"}
                />
                <div className={`absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full opacity-20 ${isDark ? 'bg-amber-900' : 'bg-amber-200'
                    }`} />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <button
                    onClick={() => router.push('/quiz')}
                    className={`absolute top-0 left-0 p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className={`mt-16 p-8 md:p-12 rounded-[3rem] border backdrop-blur-3xl text-center relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-xl'
                    }`}>

                    <div className="flex justify-center mb-8">
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'
                            }`}>
                            <Trophy className="w-12 h-12" />
                        </div>
                    </div>

                    <div className="inline-block px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">
                        {data.difficulty} Level
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight leading-tight">{data.title}</h1>

                    {startTime && (
                        <div className="mb-8 inline-flex flex-col items-center animate-in fade-in duration-500">
                            <div className="px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Clock className="w-4 h-4" />
                                Scheduled: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            {timeToStart && timeToStart > 5 * 60000 && (
                                <span className="text-[10px] mt-3 opacity-50 font-bold uppercase tracking-widest">
                                    Lobby opens at {new Date(startTime.getTime() - 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    )}

                    {!startTime && <p className="text-lg opacity-60 mb-10 leading-relaxed max-w-lg mx-auto">{data.description}</p>}

                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                            <Clock className="w-5 h-5 mx-auto mb-2 opacity-50" />
                            <div className="text-xl font-bold">{data.timeLimit}</div>
                            <div className="text-[9px] uppercase font-bold tracking-widest opacity-40">Duration</div>
                        </div>
                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                            <Brain className="w-5 h-5 mx-auto mb-2 opacity-50" />
                            <div className="text-xl font-bold">{data.questions}</div>
                            <div className="text-[9px] uppercase font-bold tracking-widest opacity-40">Questions</div>
                        </div>
                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                            <CheckCircle2 className="w-5 h-5 mx-auto mb-2 opacity-50" />
                            <div className="text-xl font-bold">80%</div>
                            <div className="text-[9px] uppercase font-bold tracking-widest opacity-40">Pass Rate</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-12">
                        {data.topics.map((topic: string) => (
                            <div key={topic} className="flex items-center gap-3 text-sm font-medium opacity-70 justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {topic}
                            </div>
                        ))}
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

                    {/* Admin Control (Simulation) */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
                        <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Admin Control (Simulation)</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const nextHour = new Date(now);
                                    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Next full hour (e.g. 1:00 PM)
                                    setStartTime(nextHour);
                                }}
                                className="px-3 py-2 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/10 active:scale-95 transition-all text-amber-500 border border-amber-500/20"
                            >
                                Set Next Hour (Wait Mode)
                            </button>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    setStartTime(new Date(now.getTime() + 6 * 60000)); // Set to 6 mins (wait mode)
                                }}
                                className="px-3 py-2 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/10 active:scale-95 transition-all"
                            >
                                Set +6 Mins
                            </button>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    setStartTime(new Date(now.getTime() + 1 * 60000)); // Set to 1 min (ready mode)
                                }}
                                className="px-3 py-2 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/10 active:scale-95 transition-all"
                            >
                                Set +1 Min
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
