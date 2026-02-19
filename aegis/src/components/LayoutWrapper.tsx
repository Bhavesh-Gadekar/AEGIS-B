"use client";

import React from 'react';
import Header from './ui/Header';
import SlidingNavbar from './ui/SlidingNavbar';
import { useAppContext } from './AppProvider';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isDark } = useAppContext();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isAdminPage = pathname.startsWith('/admin');

    return (
        <div className={`min-h-screen selection:bg-indigo-500/30 overflow-x-hidden transition-all duration-700 ease-in-out ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
            }`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-1000 ${isDark
                        ? 'bg-white/5 opacity-100'
                        : 'bg-black/5 opacity-60'
                        }`}
                />

                <div
                    className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-1000 ${isDark
                        ? 'bg-white/5 opacity-100'
                        : 'bg-black/5 opacity-40'
                        }`}
                />

                <div
                    className={`absolute top-0 right-[-5%] w-[50%] h-full transition-all duration-1000 z-0 ${isDark
                        ? 'bg-gradient-to-l from-white/10 to-transparent'
                        : 'bg-gradient-to-l from-black/5 to-transparent'
                        }`}
                />
            </div>

            {!isAuthPage && !isAdminPage && <Header />}
            {!isAuthPage && !isAdminPage && <SlidingNavbar isDark={isDark} />}

            <main className="relative z-10">
                {children}
            </main>

            {/* Footer / Aegis Guard Core Badge */}


            <Toaster
                position="top-center"
                toastOptions={{
                    className: isDark
                        ? '!bg-black/80 !backdrop-blur-xl !border !border-white/10 !text-white !rounded-2xl !shadow-2xl !shadow-indigo-500/20'
                        : '!bg-white/80 !backdrop-blur-xl !border !border-black/5 !text-black !rounded-2xl !shadow-xl',
                    descriptionClassName: isDark ? '!text-gray-400' : '!text-gray-500',
                    actionButtonStyle: {
                        background: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff',
                    }
                }}
            />
        </div>
    );
}
