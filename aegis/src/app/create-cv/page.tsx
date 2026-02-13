"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Shield, Lock, Fingerprint, RefreshCcw } from 'lucide-react';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function CreateGuardedCVPage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(true);
    const [loading, setLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(0);

    const steps = [
        { title: 'Identity Verification', icon: Fingerprint, desc: 'Biometric hashing complete' },
        { title: 'Academic Trace', icon: Shield, desc: 'Degree verification on-chain' },
        { title: 'Experience Lock', icon: Lock, desc: 'Immutable work history record' },
    ];

    const handleCreate = () => {
        setLoading(true);
        let step = 0;
        const interval = setInterval(() => {
            step++;
            setVerificationStep(step);
            if (step >= 3) {
                clearInterval(interval);
                setTimeout(() => {
                    setLoading(false);
                    router.push('/?tab=profile');
                }, 1000);
            }
        }, 1500);
    };

    return (
        <div className={`min-h-screen relative transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>

            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={50}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full opacity-30 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-16">
                    <button
                        onClick={() => router.push('/?tab=profile')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </button>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 flex items-center gap-4">
                        Guarded CV <Shield className="w-12 h-12 text-emerald-500" />
                    </h1>
                    <p className="opacity-60 font-medium max-w-xl text-lg leading-relaxed">Create a cryptographically signed version of your professional history. Immutable, verifiable, and instantly trustable.</p>
                </div>

                {/* Status Area */}
                <div className={`p-10 md:p-12 rounded-[3.5rem] border backdrop-blur-xl transition-all relative overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>

                    {/* Progress Visualization */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {steps.map((s, i) => {
                            const isActive = i === verificationStep;
                            const isCompleted = i < verificationStep;

                            return (
                                <div key={i} className={`p-6 rounded-3xl border transition-all duration-500 ${isActive ? 'bg-emerald-500/10 border-emerald-500/50 scale-105 shadow-xl shadow-emerald-500/10' :
                                        isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 opacity-50' :
                                            (isDark ? 'bg-white/5 border-white/5 opacity-30' : 'bg-gray-50 border-gray-200 opacity-30')
                                    }`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isActive || isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-500/20 text-gray-500'
                                        }`}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60">{s.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col items-center justify-center py-8">
                        {loading ? (
                            <div className="flex flex-col items-center gap-6 animate-pulse">
                                <RefreshCcw className="w-12 h-12 animate-spin text-emerald-500" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Processing Block {verificationStep + 1}/3...</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleCreate}
                                className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-transform active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 ${isDark ? 'bg-white text-black hover:bg-emerald-50' : 'bg-black text-white hover:bg-gray-800'}`}
                            >
                                Initialize Creation
                            </button>
                        )}
                    </div>

                    {/* Decor */}
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                </div>

            </div>
        </div>
    );
}
