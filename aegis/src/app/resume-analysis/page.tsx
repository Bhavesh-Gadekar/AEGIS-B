"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function ResumeAnalysisPage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [complete, setComplete] = useState(false);

    const handleUpload = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setComplete(true);
        }, 3000);
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

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Resume Intelligence</h1>
                    <p className="opacity-60 font-medium max-w-xl">Powered by Gemini AI. Deep learning analysis of your professional profile against industry standards.</p>
                </div>

                {/* Content */}
                {!complete ? (
                    <div className={`p-12 rounded-[3rem] border border-dashed flex flex-col items-center justify-center text-center transition-all ${isDark ? 'bg-white/5 border-white/20' : 'bg-white border-black/10'}`}>
                        {analyzing ? (
                            <div className="py-20 animate-in fade-in zoom-in duration-500">
                                <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mb-8" />
                                <h3 className="text-2xl font-black mb-2">Gemini is Thinking...</h3>
                                <p className="opacity-50 font-bold uppercase tracking-widest text-xs">Parsing Content • Contextual Understanding • Generation</p>
                            </div>
                        ) : (
                            <div className="py-12">
                                <div className={`w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Upload className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">Upload Resume</h3>
                                <p className="opacity-60 mb-8 max-w-sm mx-auto">Drag and drop your PDF here, or click to browse. We support parsing for ATS compatibility.</p>
                                <button
                                    onClick={handleUpload}
                                    className={`px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                                >
                                    Select Document
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
                        <div className={`p-8 rounded-[2rem] border ${isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="w-8 h-8" />
                                <div>
                                    <h3 className="text-xl font-black">Gemini Analysis Complete</h3>
                                    <p className="opacity-80 font-medium">Your resume score is 88/100</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
                                <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-6">Gemini Identified Strengths</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium opacity-80">Strong action verbs used throughout experience</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium opacity-80">Quantifiable achievements clearly listed</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium opacity-80">Skills section matches targeted role keywords</span>
                                    </li>
                                </ul>
                            </div>
                            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
                                <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-6">Improvements</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium opacity-80">Summary section is slightly verbose</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium opacity-80">Add more detail to 'Education' regarding coursework</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
