"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

export default function ManageEventsPage() {
    const router = useRouter();
    const { isDark } = useAppContext();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });

            if (error) {
                // console.error("Error fetching events:", error);
                // Fallback to static if table doesn't exist yet, for demo purposes
                // setEvents([]); 
            } else {
                setEvents(data || []);
            }
        } catch (error) {
            // console.error("Error fetching events:", error); 
            // Silently fail to empty list if table doesn't exist
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("Event deleted successfully");
            setEvents(events.filter(e => e.id !== id));
        } catch (error: any) {
            toast.error(error.message || "Failed to delete event");
        }
    };

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Organize hackathons, workshops, and exams.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/admin/events/add')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
                    >
                        <Plus className="w-5 h-5" /> Add Event
                    </button>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event.id} className={`group relative p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:border-indigo-500/50' : 'bg-white border-gray-200 hover:border-indigo-500/50 shadow-sm hover:shadow-lg'}`}>
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                                    {event.type}
                                </div>

                                <div className="mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-500 transition-colors">{event.title}</h3>
                                    <p className={`text-sm line-clamp-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {event.description}
                                    </p>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm opacity-70">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm opacity-70">
                                        <MapPin className="w-4 h-4" />
                                        <span>{event.venue}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                                    <button
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className={`px-3 py-2 rounded-lg text-red-500 transition-colors ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`text-center py-20 rounded-3xl border border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                            <Calendar className="w-8 h-8 opacity-40" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">No events found</h3>
                        <p className="opacity-60 mb-6">Get started by creating your first event.</p>
                        <button
                            onClick={() => router.push('/admin/events/add')}
                            className="px-6 py-2 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors"
                        >
                            Create Event
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
