"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trophy, Clock, Lock } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getUpcomingQuizzes } from '@/actions/quiz';

export default function QuizPage() {
    const { isDark } = useAppContext();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            const result = await getUpcomingQuizzes();
            if (result.data) {
                setQuizzes(result.data);
            }
            setLoading(false);
        };
        fetchQuizzes();
    }, []);

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTimeDisplay = (scheduledAt: string) => {
        if (!scheduledAt) return 'NOT SCHEDULED';
        const date = new Date(scheduledAt);
        return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`pt-32 pb-20 px-6 md:px-10 max-w-7xl mx-auto transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
                <div>
                    <h2 className="text-6xl font-black tracking-tighter transition-colors italic uppercase leading-none">The Arena</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-2 underline decoration-amber-500/40 underline-offset-8">Synchronized Combat Trials</p>
                </div>

                <div className={`flex items-center gap-4 px-6 py-4 border rounded-[2rem] w-full md:w-auto transition-all ${isDark ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50 shadow-2xl' : 'bg-white border-black/10 shadow-sm'}`}>
                    <Search className="w-4 h-4 opacity-30" />
                    <input
                        type="text"
                        placeholder="FILTER COMPETITIONS..."
                        className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[10px] w-full md:w-64 font-black uppercase tracking-widest placeholder:opacity-20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className={`p-12 rounded-[4rem] border h-[400px] animate-pulse ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`} />
                    ))
                ) : filteredQuizzes.length === 0 ? (
                    <div className={`col-span-1 md:col-span-2 lg:col-span-3 p-20 text-center font-black text-xs uppercase tracking-[0.3em] opacity-30 ${isDark ? 'text-white' : 'text-black'}`}>
                        NO TRIALS CURRENTLY BROADCASTING "{searchQuery}"
                    </div>
                ) : (
                    filteredQuizzes.map(q => (
                        <div key={q.id} className={`p-12 rounded-[4rem] border transition-all duration-700 group relative hover:scale-[1.03] cursor-pointer flex flex-col ${isDark ? 'bg-white/5 border-white/10 hover:border-amber-500/50 shadow-2xl' : 'bg-white/80 border-black/10 shadow-xl hover:shadow-2xl'}`}
                            onClick={() => router.push(`/quiz/${q.id}`)}
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute -inset-1 rounded-[4.2rem] transition-all duration-700 opacity-0 group-hover:opacity-100 blur-2xl -z-10 ${isDark ? 'bg-amber-500/5' : 'bg-amber-500/10'}`} />

                            <div className="flex justify-between items-start mb-12">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:rotate-[10deg] ${isDark ? 'bg-white/5 shadow-inner' : 'bg-amber-50'}`}>
                                    <Trophy className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                </div>
                                <span className={`px-5 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg' : 'bg-amber-50 border-amber-500/20 text-amber-600 shadow-sm'
                                    }`}>{q.difficulty}</span>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-3xl font-black mb-6 leading-[1.1] transition-colors tracking-tight italic uppercase">{q.title}</h3>

                                <div className="flex items-center gap-3 opacity-40 mb-12">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                        {getTimeDisplay(q.scheduled_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto">
                                <button
                                    className={`flex-1 py-5 px-6 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[9px] transition-all active:scale-95 flex items-center justify-center gap-2 ${q.status === 'live'
                                        ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-500/20'
                                        : (isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-lg' : 'bg-gray-50 border border-black/10 text-black hover:bg-gray-100 shadow-sm')
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/quiz/${q.id}`);
                                    }}
                                >
                                    {q.status === 'live' ? <><Play className="w-3 h-3 fill-current" /> Engage</> : 'Register'}
                                </button>
                                <button
                                    className={`w-20 py-5 rounded-[1.8rem] flex items-center justify-center border transition-all active:scale-95 ${isDark ? 'bg-transparent border-white/10 text-white hover:bg-white/5' : 'bg-transparent border-black/10 text-black hover:bg-black/5'
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/quiz/${q.id}`);
                                    }}
                                >
                                    <span className="text-[8px] font-black uppercase tracking-widest">Detail</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const Play = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
