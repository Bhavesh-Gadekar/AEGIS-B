"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { logout } from '@/actions/auth';
import { useAppContext } from '@/components/AppProvider';
import {
    ArrowLeft,
    User,
    Lock,
    Bell,
    Eye,
    HelpCircle,
    LogOut,
    ChevronRight,
    Shield,
    Smartphone,
    Globe
} from 'lucide-react';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

const SettingsCategory = ({ icon: Icon, title, description, color, onClick, isDark }: any) => (
    <button
        onClick={onClick}
        className={`w-full group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 active:scale-[0.98] ${isDark
            ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
            : 'bg-white border-black/5 hover:bg-gray-50 hover:border-black/10 shadow-sm'
            }`}>
        <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDark ? `bg-${color}-500/10 text-${color}-400` : `bg-${color}-50 text-${color}-600`
                }`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-left">
                <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
            </div>
        </div>
        <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isDark ? 'text-gray-600 group-hover:text-white' : 'text-gray-300 group-hover:text-black'
            }`} />
    </button>
);

export default function SettingsPage() {
    const router = useRouter();
    const { isDark } = useAppContext();

    const categories = [
        {
            id: 'account',
            title: 'Account Center',
            description: 'Profile details, password, and security.',
            icon: User,
            color: 'indigo'
        },
        {
            id: 'privacy',
            title: 'Privacy & Visibility',
            description: 'Manage who can see your academic profile.',
            icon: Eye,
            color: 'emerald'
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Customize alerts for research & networks.',
            icon: Bell,
            color: 'amber'
        },
        {
            id: 'security',
            title: 'Login & Security',
            description: 'Two-factor authentication and login activity.',
            icon: Shield,
            color: 'rose'
        },
        {
            id: 'display',
            title: 'App Display',
            description: 'Dark mode, text size, and accessibility.',
            icon: Smartphone,
            color: 'purple'
        },
        {
            id: 'help',
            title: 'Help & Support',
            description: 'FAQs, contact support, and app info.',
            icon: HelpCircle,
            color: 'blue'
        },
    ];

    return (
        <div className={`pt-10 min-h-screen relative flex items-center justify-center p-4 transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
            }`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={100}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
                <div className={`absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full opacity-40 ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-200/40'
                    }`} />
            </div>

            <div className="relative z-10 w-full max-w-2xl py-12">
                <div className="flex items-center gap-4 mb-5">
                    <button
                        onClick={() => router.back()}
                        className={`p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-black tracking-tight">Settings</h1>
                </div>

                <div className="grid gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    {categories.map((category) => (
                        <SettingsCategory
                            key={category.id}
                            icon={category.icon}
                            title={category.title}
                            description={category.description}
                            color={category.color}
                            onClick={() => router.push(`/settings/${category.id}`)}
                            isDark={isDark}
                        />
                    ))}

                    <button
                        onClick={async () => await logout()}
                        className={`w-full mt-8 p-5 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs active:scale-95 ${isDark
                            ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                            : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                            }`}>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>

                    <p className="text-center mt-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
                        AEGIS v1.0.4 • Build 2026.02
                    </p>
                </div>
            </div>
        </div>
    );
}
