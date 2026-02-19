"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useAppContext } from '../AppProvider';

export default function NotificationBell() {
    const { isDark } = useAppContext();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    };

    const deleteNotification = async (id: string) => {
        // Immediate optimistic removal
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => {
            const wasUnread = notifications.find(n => n.id === id && !n.is_read);
            return wasUnread ? Math.max(0, prev - 1) : prev;
        });

        // Background deletion
        await supabase.from('notifications').delete().eq('id', id);
    };

    const markAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
                <Bell className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-xl border overflow-hidden z-50 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-indigo-500 font-medium hover:text-indigo-600"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`relative group block p-4 border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50'} ${!notif.is_read ? (isDark ? 'bg-indigo-500/10' : 'bg-indigo-50/50') : ''}`}
                                >
                                    <div className="flex gap-3 justify-between items-start">
                                        <Link
                                            href={notif.link || '#'}
                                            onClick={() => markAsRead(notif.id)}
                                            className="flex gap-3 flex-1 min-w-0"
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                <div className={`w-2 h-2 rounded-full ${!notif.is_read ? 'bg-indigo-500' : (isDark ? 'bg-white/20' : 'bg-gray-300')}`}></div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.title}</p>
                                                <p className={`text-xs line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{notif.content}</p>
                                                <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </Link>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
