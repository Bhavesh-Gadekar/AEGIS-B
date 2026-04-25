"use client";

import React from 'react';
import { useAppContext } from '@/components/AppProvider';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isDark } = useAppContext();

    return (
        <div className={`min-h-screen transition-all duration-700 ease-in-out ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            <main className="relative z-10 pt-20 pb-24 md:pt-24 md:pb-10 px-4 md:px-10">
                {children}
            </main>
        </div>
    );
}
