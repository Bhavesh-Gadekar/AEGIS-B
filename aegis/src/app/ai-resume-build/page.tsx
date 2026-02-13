"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Sparkles, FileText, CheckCircle2, User, Briefcase, GraduationCap, Loader2 } from 'lucide-react';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function AIResumeBuildPage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(true);
    const [building, setBuilding] = useState(false);
    const [complete, setComplete] = useState(false);
    const [step, setStep] = useState(0);

    const handleBuild = () => {
        setBuilding(true);
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            setStep(currentStep);
            if (currentStep >= 3) {
                clearInterval(interval);
                setTimeout(() => {
                    setBuilding(false);
                    setComplete(true);
                }, 1000);
            }
        }, 1500);
    };

    return (
        <div className={`min-h-screen relative transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>

            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={40}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full opacity-30 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => router.push('/?tab=profile')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </button>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4">
                        AI Resume Builder <Sparkles className="w-8 h-8 text-amber-400" />
                    </h1>
                    <p className="opacity-60 font-medium max-w-xl">Powered by Gemini AI. Construct a professional resume from scratch tailored to your career goals.</p>
                </div>

                {/* Content */}
                {!complete ? (
                    <div className={`p-12 rounded-[3rem] border border-dashed flex flex-col items-center justify-center text-center transition-all min-h-[400px] ${isDark ? 'bg-white/5 border-white/20' : 'bg-white border-black/10'}`}>
                        {building ? (
                            <div className="py-12 animate-in fade-in zoom-in duration-500 w-full max-w-md">
                                <div className="flex justify-center mb-10">
                                    <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-8">Gemini is Drafting...</h3>

                                <div className="space-y-6">
                                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${step >= 1 ? (isDark ? 'bg-white/10' : 'bg-gray-100 opacity-100') : 'opacity-30'}`}>
                                        <User className="w-5 h-5" />
                                        <span className="font-bold text-sm">Structuring Personal Profile</span>
                                        {step >= 1 && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                                    </div>
                                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${step >= 2 ? (isDark ? 'bg-white/10' : 'bg-gray-100 opacity-100') : 'opacity-30'}`}>
                                        <Briefcase className="w-5 h-5" />
                                        <span className="font-bold text-sm">Optimizing Experience Descriptions</span>
                                        {step >= 2 && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                                    </div>
                                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${step >= 3 ? (isDark ? 'bg-white/10' : 'bg-gray-100 opacity-100') : 'opacity-30'}`}>
                                        <Sparkles className="w-5 h-5" />
                                        <span className="font-bold text-sm">Polishing with Industry Keywords</span>
                                        {step >= 3 && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 animate-in fade-in duration-500">
                                <div className={`w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Sparkles className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">Start Building</h3>
                                <p className="opacity-60 mb-10 max-w-sm mx-auto">Gemini will analyze your profile data and generate a perfectly formatted, ATS-friendly resume.</p>
                                <button
                                    onClick={handleBuild}
                                    className={`px-12 py-5 rounded-xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95 shadow-xl hover:shadow-indigo-500/20 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                                >
                                    Generate with Gemini
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
                        <div className={`p-8 rounded-[2rem] border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="w-8 h-8" />
                                <div>
                                    <h3 className="text-xl font-black">Resume Generated Successfully</h3>
                                    <p className="opacity-80 font-medium">Your customized resume is ready for review.</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-10 rounded-[2.5rem] border relative overflow-hidden group ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <FileText className="w-48 h-48 -rotate-12" />
                            </div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                    JP
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Jaimil Patel</h2>
                                    <p className="opacity-60 font-bold uppercase tracking-widest text-xs">Lead Architect @ AEGIS</p>
                                </div>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4 border-b border-dashed border-white/10 pb-2">Professional Summary</h4>
                                    <p className="text-sm leading-relaxed opacity-80">
                                        Innovative Software Architect with a focus on decentralized systems and zero-knowledge proofs. Proven track record of designing scalable, secure applications. Passionate about bridging the gap between academic research and practical implementation.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4 border-b border-dashed border-white/10 pb-2">Experience</h4>
                                        <ul className="space-y-4">
                                            <li className="opacity-80">
                                                <span className="font-bold block">Lead Architect @ AEGIS</span>
                                                <span className="text-xs opacity-60 block mb-1">2023 - Present</span>
                                                <span className="text-sm">Spearheading the development of properietary guarding algorithms.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4 border-b border-dashed border-white/10 pb-2">Education</h4>
                                        <ul className="space-y-4">
                                            <li className="opacity-80">
                                                <span className="font-bold block">M.S. Computer Science</span>
                                                <span className="text-xs opacity-60 block mb-1">Stanford University</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                                    Download PDF
                                </button>
                                <button className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs border ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'}`}>
                                    Edit with Gemini
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
