'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Map,
    Brain,
    ShieldAlert,
    Bell,
    HelpCircle,
    Trophy,
    ArrowRight,
    Plus,
    Settings,
    MoreVertical,
    Calendar,
    Zap,
    Activity,
    UserX
} from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { supabase } from '@/lib/supabase/client';

export default function AdminDashboard() {
    const router = useRouter();
    const { isDark } = useAppContext();

    // State for stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeQuizzes: 0,
        bannedUsers: 0,
        pendingReports: 0
    });

    // State for top quiz results
    const [topQuizResults, setTopQuizResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Total Users
                const { count: userCount, error: userError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // 2. Fetch Active Quizzes
                const { count: quizCount, error: quizError } = await supabase
                    .from('quizzes')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true);

                // 3. Fetch Banned Users
                const { count: bannedCount, error: bannedError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_banned', true);

                // 4. Fetch Pending Reports
                const { count: reportCount, error: reportError } = await supabase
                    .from('reports')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending');

                if (userError || quizError || bannedError || reportError) {
                    console.error("Error fetching stats:", userError, quizError, bannedError, reportError);
                }

                setStats({
                    totalUsers: userCount || 0,
                    activeQuizzes: quizCount || 0,
                    bannedUsers: bannedCount || 0,
                    pendingReports: reportCount || 0
                });

                // 5. Fetch Top Quiz Results (Join quiz_attempts with profiles and quizzes)
                const { data: quizResults, error: resultsError } = await supabase
                    .from('quiz_attempts')
                    .select(`
            score,
            completed_at,
            profiles (full_name),
            quizzes (title)
          `)
                    .order('score', { ascending: false })
                    .limit(3);

                if (resultsError) {
                    console.error("Error fetching quiz results:", resultsError);
                } else if (quizResults) {
                    // Transform data for display
                    const formattedResults = quizResults.map((item: any, index: number) => ({
                        id: index,
                        user: item.profiles?.full_name || 'Unknown User',
                        quiz: item.quizzes?.title || 'Unknown Quiz',
                        score: `${item.score}%`,
                        time: new Date(item.completed_at).toLocaleDateString() // Or format as needed
                    }));
                    setTopQuizResults(formattedResults);
                }

            } catch (error) {
                console.error("Unexpected error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const STAT_CARDS = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
        { label: 'Active Quizzes', value: stats.activeQuizzes, icon: Brain, color: 'purple' },
        { label: 'Banned Users', value: stats.bannedUsers, icon: UserX, color: 'red' },
        { label: 'Pending Reports', value: stats.pendingReports, icon: ShieldAlert, color: 'orange' },
    ];

    const QUICK_ACTIONS = [
        { title: 'Create Quiz', icon: Plus, path: '/admin/quiz/create', color: 'bg-indigo-500' },
        { title: 'Manage Roadmaps', icon: Map, path: '/admin/manage-roadmaps', color: 'bg-emerald-500' },
        { title: 'Ban Rules', icon: ShieldAlert, path: '/admin/bans', color: 'bg-red-500' },
        { title: 'Add Event', icon: Calendar, path: '/admin/events/add', color: 'bg-blue-500' },
    ];

    // Static for now, as events table wasn't explicitly in the schema provided earlier but can be added or fetched if exists
    const UPCOMING_EVENTS = [
        { id: 1, title: 'Annual Hackathon 2024', type: 'Hackathon', date: 'Oct 15, 2024', venue: 'Main Hall A' },
        { id: 2, title: 'Final Semester Exams', type: 'Examination', date: 'Nov 01, 2024', venue: 'Campus Wide' },
        { id: 3, title: 'AI Ethics Workshop', type: 'Workshop', date: 'Oct 20, 2024', venue: 'Auditorium' },
    ];

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                    <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Overview of platform activity and management tools.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {STAT_CARDS.map((stat, idx) => (
                            <div
                                key={idx}
                                className={`p-6 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:shadow-lg'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                        <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                                    </div>
                                    {/* Placeholder for change metric if we implement historical tracking later */}
                                    {/* <span className={`text-xs font-semibold px-2 py-1 rounded-full text-green-500 bg-green-500/10`}>
                        +0%
                    </span> */}
                                </div>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                        {/* Quick Actions */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {QUICK_ACTIONS.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => router.push(action.path)}
                                    className={`group relative p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] overflow-hidden ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:shadow-lg'}`}
                                >
                                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full blur-2xl opacity-20 transition-all group-hover:opacity-40 ${action.color}`} />

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                            <action.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold mb-1 group-hover:translate-x-1 transition-transform">{action.title}</h3>
                                            <div className="flex items-center text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                                                <span>Access Tool</span>
                                                <ArrowRight className="w-3 h-3 ml-2 group-hover:ml-3 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* Help & Support Card */}
                            <div
                                onClick={() => router.push('/admin/support')}
                                className={`col-span-1 sm:col-span-2 p-6 rounded-2xl border flex items-center justify-between group cursor-pointer hover:border-indigo-500/50 transition-all ${isDark ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-white/10' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-gray-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                                        <HelpCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Support Center</h3>
                                        <p className={`text-sm ${isDark ? 'text-indigo-200' : 'text-indigo-600'}`}>Resolve user queries and manage tickets</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                        </div>

                        {/* Top Quiz Results Widget */}
                        <div className={`p-6 rounded-2xl border h-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    Top Performers
                                </h3>
                                <button className="text-xs font-semibold opacity-60 hover:opacity-100 transition-opacity">View All</button>
                            </div>
                            <div className="space-y-4">
                                {topQuizResults.length > 0 ? topQuizResults.map((result, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : 'bg-orange-700 text-white'}`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{result.user}</div>
                                                <div className="text-xs opacity-60">{result.quiz}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-emerald-500">{result.score}</div>
                                            <div className="text-xs opacity-60">{result.time}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-sm opacity-60 text-center py-4">No quiz results yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events Section */}
                    <div className={`p-6 md:p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Upcoming Events</h3>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hackathons, Exams, and Workshops</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/admin/events')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-50'}`}
                            >
                                Manage Events
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {UPCOMING_EVENTS.map((event) => (
                                <div key={event.id} className={`p-4 rounded-xl border relative overflow-hidden group hover:border-orange-500/50 transition-all ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="absolute top-0 right-0 w-20 h-20 -mr-4 -mt-4 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all" />

                                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                        <div className={`w-fit px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                                            {event.type}
                                        </div>

                                        <div>
                                            <h4 className="font-bold mb-1 group-hover:text-orange-500 transition-colors">{event.title}</h4>
                                            <div className="flex items-center gap-2 text-xs opacity-60">
                                                <Calendar className="w-3 h-3" />
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                                                <Map className="w-3 h-3" />
                                                <span>{event.venue}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
