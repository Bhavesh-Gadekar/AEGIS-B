"use client";

import React from 'react';
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

                    <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">{data.title}</h1>
                    <p className="text-lg opacity-60 mb-10 leading-relaxed">{data.description}</p>

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
                            <div key={topic} className="flex items-center gap-3 text-sm font-medium opacity-70">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {topic}
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-5 rounded-[1.5rem] bg-amber-500 hover:bg-amber-400 text-white font-black uppercase tracking-[0.25em] text-xs shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                        <Play className="w-4 h-4 fill-current" /> Initialize Session
                    </button>

                </div>
            </div>
        </div>
    );
}
