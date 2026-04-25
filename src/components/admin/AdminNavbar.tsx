'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Shield, Menu, X, Settings } from 'lucide-react';
import { logout } from '@/actions/auth';
import { useAppContext } from '../AppProvider';

export default function AdminNavbar() {
    const pathname = usePathname();
    const { isDark } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        // Add more items here as requested
    ];

    return (
        <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className={`font-black text-lg tracking-tight leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>AEGIS</h1>
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Admin Panel</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${isActive
                                        ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                                        : (isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className={`h-6 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${isDark
                                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                }`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`md:hidden p-2 rounded-lg ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className={`md:hidden border-t ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                        ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                                        : (isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                        <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isDark
                                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                }`}
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
