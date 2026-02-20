"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Play, CheckCircle, Clock, Search, MoreVertical, Trophy } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getAdminQuizzes } from '@/actions/admin-quiz';
import { startQuiz } from '@/actions/quiz-session';
import { toast } from 'sonner';

export default function AdminQuizDashboard() {
    const { isDark } = useAppContext();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

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

    const handleStartQuiz = async (id: number) => {
        const result = await startQuiz(id);
        if (result.success) {
            toast.success("Quiz is now LIVE!");
            loadQuizzes();
        } else {
            toast.error(result.error || "Failed to start quiz");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            live: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse',
            completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }[status] || 'bg-gray-100 text-gray-600';

        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles}`}>
                {status}
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
                        { label: 'Registrations', val: quizzes.reduce((acc, q) => acc + (q.registration_count?.[0]?.count || 0), 0), icon: Users, color: 'text-purple-500' }
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
                                        <td className="px-8 py-6">
                                            <p className="font-black italic text-lg tracking-tight uppercase">{quiz.title}</p>
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
                                                <span className="font-black italic text-xl">{quiz.registration_count?.[0]?.count || 0}</span>
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">AUTH_USERS</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <StatusBadge status={quiz.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {quiz.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleStartQuiz(quiz.id)}
                                                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Force Start
                                                    </button>
                                                )}
                                                <button className={`p-3 rounded-xl border transition-all ${isDark ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'}`}>
                                                    <MoreVertical className="w-4 h-4 opacity-50" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
