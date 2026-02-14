"use client";

import dynamic from 'next/dynamic';

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowRight, User, Lock, Mail } from 'lucide-react';
import { login } from '@/actions/auth';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/components/AppProvider';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const { isDark, toggleTheme } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    await login(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
            }`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
        </button>
      </div>
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <Antigravity
          count={150}
          magnetRadius={4}
          ringRadius={4}
          color={isDark ? "#ffffff" : "#5227FF"}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-6 group flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg]">
            <div className={`absolute inset-0 rounded-xl border-2 rotate-45 transition-colors ${isDark ? 'border-white/20 group-hover:border-white' : 'border-black/10 group-hover:border-black'
              }`} />
            <div className={`absolute inset-1 rounded-lg border transition-all ${isDark ? 'border-indigo-500/50 group-hover:border-indigo-400' : 'border-indigo-500/30'
              }`} />
            <Shield className={`w-6 h-6 md:w-8 md:h-8 relative z-10 transition-colors ${isDark ? 'text-white' : 'text-black'}`} />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className={`text-2xl md:text-3xl font-black tracking-tighter uppercase italic transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Aegis</span>
            <span className="text-[8px] md:text-[10px] tracking-[0.4em] font-bold text-indigo-500 uppercase">Intelligent Systems</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-center text-sm font-bold ${isDark ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-red-100 text-red-600 border border-red-200'}`}>
              {decodeURIComponent(message)}
            </div>
          )}
          <div className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/10 shadow-xl'
            }`}>
            {/* Email Field */}
            <div className="mb-6">
              <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Academic Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-black/10 text-black placeholder-gray-400 focus:border-indigo-500/50'
                    }`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-8">
              <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Secure Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl border transition-all duration-300 ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-black/10 text-black placeholder-gray-400 focus:border-indigo-500/50'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className={`w-4 h-4 rounded border transition-all ${isDark ? 'border-white/20 bg-white/10' : 'border-black/20 bg-black/5'
                    }`}
                />
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className={`text-xs font-bold transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                  }`}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-300 transform active:scale-95 shadow-xl ${isDark
                ? 'bg-white text-black hover:bg-gray-100 shadow-white/10'
                : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
                }`}
            >
              Sign In to AEGIS
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            New to AEGIS?{" "}
            <a
              href="/signup"
              className={`font-bold transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                }`}
            >
              Create academic account
            </a>
          </p>
        </div>

        {/* Theme Toggle */}
      </div>
    </div>
  );
}

// Import missing icons
import { Sun, Moon } from 'lucide-react';
