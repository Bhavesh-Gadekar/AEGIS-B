"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, CheckCircle, Clock, AlertCircle, Send, User } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

export default function SupportCenterPage() {
    const router = useRouter();
    const { isDark } = useAppContext();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');

    // Chat State
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
            // Mark as read or similar logic could go here
        }
    }, [selectedTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTickets = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('reports')
                .select(`
                    *,
                    reporter_id,
                    user_id,
                    profiles:profiles!reports_reporter_id_fkey (full_name, avatar_url, handle)
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (data && data.length > 0) {
                console.log("DEBUG: Ticket 0 raw:", data[0]);
                if (!data[0].profiles) {
                    console.log("DEBUG: Profiles is null. Attempting manual fetch for reporter details...");
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data[0].reporter_id)
                        .single();
                    console.log("DEBUG: Manual profile fetch:", profileData, profileError);
                }
            }

            if (error) throw error;
            setTickets(data || []);
        } catch (error: any) {
            console.error("SupportPage Error:", error);
            // Fallback to mock data if table doesn't exist
            setTickets([]);
            /*
            setTickets([
                {
                    id: 'mock-1',
                    created_at: new Date().toISOString(),
                    status: 'pending',
                    reason: 'Unable to reset password',
                    profiles: { full_name: 'Alex Johnson', avatar_url: null },
                    content: 'I cannot access my account even after resetting payload.'
                },
                {
                    id: 'mock-2',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    status: 'resolved',
                    reason: 'Question about premium features',
                    profiles: { full_name: 'Sarah Williams', avatar_url: null },
                    content: 'How do I upgrade to the premium plan?'
                }
            ]);
            */
            // Only show toast if it's a real connection error and not just empty
            if (error?.code !== 'PGRST116') {
                toast.error("Failed to load tickets");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (ticketId: string) => {
        setChatLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            // console.error(error);
            setMessages([]);
        } finally {
            setChatLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const msgContent = newMessage;
        setNewMessage('');

        // Optimistic UI update
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            message: msgContent,
            is_admin: true,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            // Get user safely
            let { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                const { data: { session } } = await supabase.auth.getSession();
                user = session?.user || null;
            }

            if (!user) throw new Error("Not authenticated: No active session found.");

            const { error } = await supabase
                .from('support_messages')
                .insert({
                    ticket_id: selectedTicket.id,
                    sender_id: user.id,
                    message: msgContent,
                    is_admin: true
                });

            if (error) throw error;

            // In a real app, we'd wait for the clear subscription or re-fetch
            // fetchMessages(selectedTicket.id); 

        } catch (error: any) {
            console.error("Message send error:", error);
            toast.error(error.message || "Failed to send message");
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id)); // Revert
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            if (newStatus === 'resolved') {
                const ticket = tickets.find(t => t.id === id);
                const recipientId = ticket?.reporter_id || ticket?.user_id;

                if (recipientId) {
                    await supabase.from('notifications').insert({
                        user_id: recipientId,
                        type: 'ticket_resolved',
                        title: 'Support Ticket Resolved',
                        content: `Your ticket regarding "${ticket.reason || 'content'}" has been resolved.`,
                        is_read: false
                    });
                }
            }

            toast.success(`Ticket marked as ${newStatus}`);
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));

            if (selectedTicket && selectedTicket.id === id) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }

            if (filter !== 'all' && filter !== newStatus) {
                setTickets(prev => prev.filter(t => t.id !== id));
                if (selectedTicket?.id === id) setSelectedTicket(null);
            }

        } catch (error: any) {
            console.error(error);
            toast.error("Failed to update ticket status");
        }
    };

    const deleteTicket = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;
        try {
            const { error } = await supabase.from('reports').delete().eq('id', id);
            if (error) throw error;

            toast.success("Ticket deleted");
            setTickets(prev => prev.filter(t => t.id !== id));
            if (selectedTicket?.id === id) setSelectedTicket(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete ticket");
        }
    };

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                    <button
                        onClick={() => selectedTicket ? setSelectedTicket(null) : router.back()}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedTicket ? `Chatting with ${selectedTicket.profiles?.full_name}` : 'Resolve user queries and manage tickets.'}
                        </p>
                    </div>
                </div>

                {!selectedTicket ? (
                    <>
                        {/* Filters */}
                        <div className="flex gap-4 mb-6 flex-shrink-0">
                            {['pending', 'resolved', 'all'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${filter === f
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Tickets List */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : tickets.length > 0 ? (
                                <div className="space-y-4">
                                    {tickets.map((ticket) => {
                                        const profile = Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles;
                                        const fullName = profile?.full_name || profile?.handle || 'Anonymous User';

                                        return (
                                            <div key={ticket.id} className={`group p-6 rounded-2xl border transition-all cursor-pointer ${isDark ? 'bg-white/5 border-white/10 hover:border-indigo-500/30 hover:bg-white/10' : 'bg-white border-gray-200 hover:shadow-lg'}`}
                                                onClick={() => setSelectedTicket(ticket)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                            {profile?.avatar_url ? (
                                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                fullName[0] || '?'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-sm">{fullName}</h3>
                                                            <div className="text-xs opacity-50 flex items-center gap-2">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(ticket.created_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ticket.status === 'resolved'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {ticket.status}
                                                    </div>
                                                </div>

                                                <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                                                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {ticket.content || ticket.reason || "No content."}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                                                    <div className="flex items-center text-xs font-bold text-indigo-500 gap-1">
                                                        <MessageSquare className="w-4 h-4" /> Open Conversation
                                                    </div>
                                                    {ticket.status === 'resolved' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteTicket(ticket.id);
                                                            }}
                                                            className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-50">
                                    <MessageSquare className="w-16 h-16 mb-4" />
                                    <h3 className="text-xl font-bold">No tickets found</h3>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // CHAT INTERFACE
                    <div className={`flex flex-col flex-1 rounded-3xl border overflow-hidden ${isDark ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200'}`}>
                        {/* Chat Header */}
                        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className={`md:hidden p-2 -ml-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {((Array.isArray(selectedTicket.profiles) ? selectedTicket.profiles[0] : selectedTicket.profiles)?.avatar_url) ? (
                                        <img src={(Array.isArray(selectedTicket.profiles) ? selectedTicket.profiles[0] : selectedTicket.profiles).avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        ((Array.isArray(selectedTicket.profiles) ? selectedTicket.profiles[0] : selectedTicket.profiles)?.full_name?.[0]) || ((Array.isArray(selectedTicket.profiles) ? selectedTicket.profiles[0] : selectedTicket.profiles)?.handle?.[0]) || '?'
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold">
                                        {(Array.isArray(selectedTicket.profiles) ? selectedTicket.profiles[0] : selectedTicket.profiles)?.full_name ||
                                            (Array.isArray(selectedTicket.profiles) ? selectedTicket.profiles[0] : selectedTicket.profiles)?.handle ||
                                            'User'}
                                    </div>
                                    <div className="text-xs opacity-60">ID: {selectedTicket.id.slice(0, 8)}...</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedTicket.status === 'pending' ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateStatus(selectedTicket.id, 'resolved'); }}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600"
                                    >
                                        Mark Resolved
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateStatus(selectedTicket.id, 'pending'); }}
                                            className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-bold hover:bg-yellow-500/20"
                                        >
                                            Re-open
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteTicket(selectedTicket.id); }}
                                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {/* Original Ticket Issue */}
                            <div className="flex justify-start w-full">
                                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl rounded-tl-none ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black'}`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-50 text-xs font-bold uppercase tracking-wider">
                                        <AlertCircle className="w-3 h-3" /> Original Issue
                                    </div>
                                    <p className="text-sm leading-relaxed">{selectedTicket.content || selectedTicket.reason}</p>
                                </div>
                            </div>

                            {messages.map((msg, i) => (
                                <div key={msg.id || i} className={`flex w-full ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] p-3 px-4 rounded-2xl text-sm leading-relaxed ${msg.is_admin
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20'
                                        : (isDark ? 'bg-white/10 text-white rounded-tl-none' : 'bg-gray-100 text-black rounded-tl-none')
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className={`p-4 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    className={`flex-1 p-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 text-white placeholder:text-gray-600' : 'bg-white text-black border border-gray-200'}`}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 px-4 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
