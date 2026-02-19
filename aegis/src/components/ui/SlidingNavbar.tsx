"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SlidingNavbarProps {
    isDark: boolean;
}

const SlidingNavbar: React.FC<SlidingNavbarProps> = ({ isDark }) => {
    const pathname = usePathname();
    const tabs = [
        { id: '/', label: 'Home' },
        { id: '/feed', label: 'Feed' },
        { id: '/network', label: 'Network' },
        { id: '/chat', label: 'Chat' },
        { id: '/roadmaps', label: 'Roadmaps' },
        { id: '/quiz', label: 'Quiz' },
    ];

    // Determine active index based on pathname
    // If pathname matches existing tab id, use that. Otherwise default to -1 or Home if exact match
    const activeIndex = tabs.findIndex(t => t.id === pathname);

    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const lastScrollY = useRef(0);
    const prevIndex = useRef(activeIndex);

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

    useEffect(() => {
        if (prevIndex.current !== activeIndex) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 300); // Duration of the stretch effect (shorter than total transition)
            prevIndex.current = activeIndex;
            return () => clearTimeout(timer);
        }
    }, [activeIndex]);

    return (
        <div className={`fixed bottom-8 lg:top-6 lg:bottom-auto left-1/2 -translate-x-1/2 z-[70] px-1 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24 lg:-translate-y-24 pointer-events-none'}`}>
            <div className={`relative flex items-center p-1.5 backdrop-blur-2xl backdrop-saturate-150 border rounded-full transition-all duration-500 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] ${isDark
                ? 'bg-[rgba(20,20,20,0.6)] border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]'
                : 'bg-[rgba(255,255,255,0.65)] border-[rgba(255,255,255,0.4)] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]'
                }`}>

                {/* Active Tab Indicator (Apple-style pill) */}
                <div
                    className={`absolute h-[calc(100%-8px)] rounded-full transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) z-0 ${isDark
                        ? 'bg-[rgba(60,60,60,0.6)] border border-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
                        : 'bg-white border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                        }`}
                    style={{
                        width: isAnimating
                            ? `calc(130% / ${tabs.length})`
                            : `calc(100% / ${tabs.length} - 4px)`,
                        left: isAnimating
                            ? `calc(${activeIndex === -1 ? 0 : activeIndex} * (100% / ${tabs.length}) - (15% / ${tabs.length}) + 2px)`
                            : `calc(${activeIndex === -1 ? 0 : activeIndex} * (100% / ${tabs.length}) + 2px)`,
                        opacity: activeIndex === -1 ? 0 : 1,
                        backdropFilter: 'blur(8px)',
                    }}
                />

                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={tab.id}
                        className={`relative z-10 px-2 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide transition-all duration-300 w-16 md:w-24 text-center truncate ${pathname === tab.id
                            ? (isDark ? 'text-white drop-shadow-sm' : 'text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]')
                            : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black')
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SlidingNavbar;
