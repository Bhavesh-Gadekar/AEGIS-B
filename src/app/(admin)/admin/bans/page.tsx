"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert, UserX, Search, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

export default function BanRulesPage() {
    const router = useRouter();
    const { isDark } = useAppContext();
    const [bannedUsers, setBannedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchBannedUsers();
    }, []);

    const fetchBannedUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_banned', true);

            if (error) throw error;
            setBannedUsers(data || []);
        } catch (error) {
            console.error("Error fetching banned users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('full_name', `%${searchQuery}%`) // Search by name
                .eq('is_banned', false) // Only show unbanned users in search results to ban them
                .limit(5);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error("Error searching users:", error);
            toast.error("Failed to search users");
        } finally {
            setIsSearching(false);
        }
    };

    const toggleBan = async (userId: string, currentStatus: boolean, userName: string) => {
        const action = currentStatus ? "unban" : "ban";
        if (!confirm(`Are you sure you want to ${action} ${userName}?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_banned: !currentStatus })
                .eq('id', userId);

            if (error) throw error;

            toast.success(`User ${action}ned successfully`);

            // Refresh lists
            fetchBannedUsers();
            setSearchResults([]); // Clear search results
            setSearchQuery('');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || `Failed to ${action} user`);
        }
    };

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ban Rules & User Management</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Manage restricted users and platform safety.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ban New User Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                Ban New User
                            </h2>
                            <form onSubmit={handleSearch} className="relative mb-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search user by name..."
                                    className={`w-full p-3 pr-10 rounded-xl border outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </form>

                            {isSearching ? (
                                <div className="text-center py-4 opacity-60 text-sm">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map(user => (
                                        <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                                    {user.full_name?.[0]}
                                                </div>
                                                <div className="text-sm font-medium">{user.full_name}</div>
                                            </div>
                                            <button
                                                onClick={() => toggleBan(user.id, false, user.full_name)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Ban User"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery && !isSearching ? (
                                <div className="text-center py-4 opacity-50 text-sm">No users found.</div>
                            ) : null}
                        </div>

                        <div className={`p-6 rounded-2xl border border-dashed ${isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
                            <div className="flex gap-3">
                                <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-orange-500 text-sm mb-1">Warning</h3>
                                    <p className={`text-xs ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
                                        Banning a user will revoke their access to posting, commenting, and taking quizzes. This action is reversible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banned Users List */}
                    <div className="lg:col-span-2">
                        <div className={`p-6 rounded-2xl border min-h-[500px] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <UserX className="w-5 h-5" />
                                Banned Users ({bannedUsers.length})
                            </h2>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                                </div>
                            ) : bannedUsers.length > 0 ? (
                                <div className="space-y-3">
                                    {bannedUsers.map((user) => (
                                        <div key={user.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? 'bg-black/20 border-white/5 hover:bg-white/5' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-sm font-bold text-white grayscale">
                                                    {user.full_name?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{user.full_name}</div>
                                                    <div className="text-xs opacity-50 font-mono">{user.id}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">BANNED</span>
                                                <button
                                                    onClick={() => toggleBan(user.id, true, user.full_name)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500' : 'bg-gray-200 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                                >
                                                    <Unlock className="w-3 h-3" /> Unban
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
                                    <ShieldAlert className="w-12 h-12 mb-4" />
                                    <p>No banned users found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
