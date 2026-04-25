"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Calendar, MapPin, Type, FileText } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

export default function AddEventPage() {
    const router = useRouter();
    const { isDark } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'Workshop',
        venue: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!eventData.title || !eventData.date || !eventData.venue) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('events')
                .insert([{
                    title: eventData.title,
                    date: `${eventData.date}T${eventData.time}:00`,
                    type: eventData.type,
                    venue: eventData.venue,
                    description: eventData.description
                }]);

            if (error) throw error;

            toast.success("Event created successfully!");
            router.back();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen p-6 md:p-10 pt-24 transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Add New Event</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Create workshops, hackathons, and more.
                        </p>
                    </div>
                </div>

                <div className={`p-8 rounded-3xl border shadow-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                <Type className="w-4 h-4" /> Event Title
                            </label>
                            <input
                                type="text"
                                value={eventData.title}
                                onChange={e => setEventData({ ...eventData, title: e.target.value })}
                                placeholder="e.g. AI Hackathon 2024"
                                className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Date
                                </label>
                                <input
                                    type="date"
                                    value={eventData.date}
                                    onChange={e => setEventData({ ...eventData, date: e.target.value })}
                                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10 text-white scheme-dark' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Time
                                </label>
                                <input
                                    type="time"
                                    value={eventData.time}
                                    onChange={e => setEventData({ ...eventData, time: e.target.value })}
                                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10 text-white scheme-dark' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                    <Type className="w-4 h-4" /> Type
                                </label>
                                <select
                                    value={eventData.type}
                                    onChange={e => setEventData({ ...eventData, type: e.target.value })}
                                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <option>Workshop</option>
                                    <option>Hackathon</option>
                                    <option>Exam</option>
                                    <option>Webinar</option>
                                    <option>Meetup</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Venue
                                </label>
                                <input
                                    type="text"
                                    value={eventData.venue}
                                    onChange={e => setEventData({ ...eventData, venue: e.target.value })}
                                    placeholder="e.g. Auditorium A"
                                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Description
                            </label>
                            <textarea
                                value={eventData.description}
                                onChange={e => setEventData({ ...eventData, description: e.target.value })}
                                rows={4}
                                placeholder="Details about specific requirements, agenda, etc."
                                className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Save Event
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
