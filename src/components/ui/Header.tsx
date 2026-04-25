"use client";

import React from 'react';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import AegisLogo from './AegisLogo';
import { useAppContext } from '../AppProvider';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { logout } from '@/actions/auth';

const Header: React.FC = () => {
    const { isDark, toggleTheme } = useAppContext();
    const pathname = usePathname();
    const router = useRouter(); // If needed for logout redirect, but logout action handles it

    const isProfileActive = pathname === '/profile';
    const isAdmin = pathname.startsWith('/admin');

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className={`fixed top-0 left-0 w-full z-[80] px-6 md:px-10 py-6 flex justify-between items-center transition-all duration-500 pointer-events-none ${isDark ? 'bg-gradient-to-b from-black/80 to-transparent' : 'bg-gradient-to-b from-white/80 to-transparent'
            }`}>
            <div className="pointer-events-auto">
                <Link href={isAdmin ? "/admin/dashboard" : "/"}>
                    <AegisLogo isDark={isDark} />
                </Link>
            </div>

            <div className="flex items-center gap-4 md:gap-8 pointer-events-auto">
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
                        }`}
                >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>

                <NotificationBell />

                {isAdmin ? (
                    <button
                        onClick={handleLogout}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-[1.25rem] border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${isDark ? 'border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'border-red-500/20 bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                    >
                        <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                ) : (
                    <Link
                        href="/profile"
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-[1.25rem] border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${isProfileActive
                            ? (isDark ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-black border-black')
                            : (isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5 shadow-sm')
                            }`}>
                        <User className={`w-5 h-5 md:w-6 md:h-6 ${isProfileActive ? 'text-white' : ''}`} />
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
