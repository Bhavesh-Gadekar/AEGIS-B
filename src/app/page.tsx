"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Flame } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';

// --- Antigravity Physics Component ---

const Antigravity = dynamic(() => import('@/components/AntigravityInteractive'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

// --- App Root (Home Page) ---

export default function Home() {
  const router = useRouter();
  const { isDark } = useAppContext();

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-24 md:pt-0">
      <Antigravity
        count={300}
        magnetRadius={5}
        ringRadius={5}
        waveSpeed={0.3}
        waveAmplitude={0.8}
        particleSize={0.6}
        color={isDark ? "#ffffff" : "#5227FF"}
        autoAnimate
      />



      <div className="max-w-5xl z-20">
        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-10 backdrop-blur-sm group cursor-pointer transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
          }`}>
          <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Unlock Your Assets Spark!</span>
        </div>

        <h1 className={`text-4xl md:text-[7.5rem] font-medium tracking-tighter mb-8 leading-[0.9] transition-colors duration-700 ${isDark ? 'text-white' : 'text-black'}`}>
          One-click for <br />
          <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-white via-white/80 to-white/40' : 'from-black via-black/80 to-black/40'}`}>
            Asset Defense
          </span>
        </h1>

        <p className={`text-sm md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Dive into the art assets, where innovative blockchain technology meets financial expertise.
          AEGIS ensures your academic footprint is guarded by intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push('/feed')}
            className={`w-full sm:w-auto px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-xl active:scale-95 transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-black text-white hover:bg-gray-800 shadow-black/10'
              }`}
          >
            Open Platform
          </button>
          <button
            onClick={() => router.push('/roadmaps')}
            className={`w-full sm:w-auto px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] border active:scale-95 transition-all ${isDark ? 'bg-transparent border-white/20 text-white hover:bg-white/10' : 'bg-transparent border-black/20 text-black hover:bg-black/5'
              }`}
          >
            Discover More
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 w-full px-6 md:px-16 flex justify-between items-center opacity-40 z-20">
        <div className="flex gap-8 md:gap-16 items-center grayscale hover:grayscale-0 transition-all duration-500 font-bold text-[10px] md:text-xs tracking-widest uppercase">
        </div>
        <div className="hidden sm:flex items-center gap-6 text-[10px] tracking-[0.4em] uppercase font-black">
          <span className={`h-[1px] w-12 ${isDark ? 'bg-white/20' : 'bg-black/20'}`}></span>
          Academic DeFi
        </div>
      </div>
    </div>
  );
}