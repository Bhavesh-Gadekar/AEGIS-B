"use client";

import dynamic from 'next/dynamic';

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowRight, User, Lock, Mail, GraduationCap, Building, Check } from 'lucide-react';
import { signup } from '@/actions/auth';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/components/AppProvider';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const { isDark, toggleTheme } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    university: '',
    field: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('fullName', formData.fullName);
    data.append('university', formData.university);
    data.append('field', formData.field);

    await signup(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
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

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo and Title */}
        <div className="text-center mb-10">
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-center text-sm font-bold ${isDark ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-red-100 text-red-600 border border-red-200'}`}>
              {decodeURIComponent(message)}
            </div>
          )}
          <div className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/10 shadow-xl'
            }`}>
            {/* Full Name */}
            <div className="mb-5">
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-black/10 text-black placeholder-gray-400 focus:border-indigo-500/50'
                    }`}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Academic Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="jane.smith@university.edu"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-black/10 text-black placeholder-gray-400 focus:border-indigo-500/50'
                    }`}
                  required
                />
              </div>
            </div>

            {/* University */}
            <div className="mb-5">
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Institution
              </label>
              <div className="relative">
                <Building className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                  placeholder="Massachusetts Institute of Technology"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-black/10 text-black placeholder-gray-400 focus:border-indigo-500/50'
                    }`}
                  required
                />
              </div>
            </div>

            {/* Field of Study */}
            <div className="mb-5">
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Field of Study
              </label>
              <div className="relative">
                <GraduationCap className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) => handleChange('field', e.target.value)}
                  placeholder="Computer Science & AI"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-black/10 text-black placeholder-gray-400 focus:border-indigo-500/50'
                    }`}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Secure Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border transition-all duration-300 ${isDark
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

            {/* Confirm Password */}
            <div className="mb-6">
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border transition-all duration-300 ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-black/10 text-black placeholder-gray-400 focus:border-indigo-500/50'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={`w-4 h-4 rounded border transition-all mt-0.5 ${isDark ? 'border-white/20 bg-white/10' : 'border-black/20 bg-black/5'
                    }`}
                  required
                />
                <span className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  I agree to the AEGIS Academic Terms of Service and Privacy Policy, and confirm my academic status for verification purposes.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreedToTerms}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-300 transform active:scale-95 shadow-xl ${agreedToTerms
                ? (isDark
                  ? 'bg-white text-black hover:bg-gray-100 shadow-white/10'
                  : 'bg-black text-white hover:bg-gray-800 shadow-black/20')
                : 'opacity-50 cursor-not-allowed'
                }`}
            >
              Create Academic Account
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{" "}
            <a
              href="/login"
              className={`font-bold transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                }`}
            >
              Sign in to AEGIS
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
