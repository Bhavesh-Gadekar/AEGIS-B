"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSlidingNavbarProps {
    isDark: boolean;
}

const AdminSlidingNavbar: React.FC<AdminSlidingNavbarProps> = ({ isDark }) => {
    const pathname = usePathname();
    const tabs = [
        { id: '/admin/dashboard', label: 'Dashboard' },
        { id: '/admin/manage-roadmaps', label: 'Roadmaps' },
        { id: '/admin/quiz/create', label: 'Quiz' },
        { id: '/admin/events', label: 'Events' },
        { id: '/admin/bans', label: 'Bans' },
        { id: '/admin/support', label: 'Support' },
    ];

    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const activeIndex = tabs.findIndex(t => t.id === pathname);

    return (
        <div className={`fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[70] px-1 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
            <div className={`relative flex items-center p-1.5 backdrop-blur-3xl border rounded-full transition-all duration-500 ${isDark ? 'bg-black/80 border-white/20 shadow-2xl shadow-white/10' : 'bg-white/80 border-black/20 shadow-2xl shadow-black/10'
                }`}>
                <div
                    className={`absolute h-[calc(100%-8px)] rounded-full transition-all duration-500 ease-in-out z-0 ${isDark ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                        }`}
                    style={{
                        width: `calc(100% / ${tabs.length} - 4px)`,
                        left: activeIndex === -1 ? '2px' : `calc(${activeIndex} * (100% / ${tabs.length}) + 2px)`,
                        opacity: activeIndex === -1 ? 0 : 1
                    }}
                />

                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={tab.id}
                        className={`relative z-10 px-2 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase transition-colors duration-300 w-16 md:w-24 text-center truncate ${pathname === tab.id
                            ? (isDark ? 'text-black' : 'text-white')
                            : `text-gray-500 hover:${isDark ? 'text-white' : 'text-black'}`
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminSlidingNavbar;
