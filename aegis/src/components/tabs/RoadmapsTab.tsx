"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Map } from 'lucide-react';

interface Roadmap {
  id: string | number;
  title: string;
  field: string;
  color: string;
  steps: string[];
}

interface RoadmapsTabProps {
  isDark: boolean;
  roadmaps: Roadmap[];
}

const getColorStyles = (color: string) => {
  const colors: Record<string, {
    bg: string;
    text: string;
    border: string;
    shadow: string;
    dot: string;
    glow: string;
  }> = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'hover:border-blue-500/50',
      shadow: 'shadow-blue-500/5',
      dot: 'bg-blue-500',
      glow: 'shadow-[0_0_10px_rgba(59,130,246,0.8)]'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      border: 'hover:border-purple-500/50',
      shadow: 'shadow-purple-500/5',
      dot: 'bg-purple-500',
      glow: 'shadow-[0_0_10px_rgba(168,85,247,0.8)]'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500',
      border: 'hover:border-emerald-500/50',
      shadow: 'shadow-emerald-500/5',
      dot: 'bg-emerald-500',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.8)]'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'hover:border-amber-500/50',
      shadow: 'shadow-amber-500/5',
      dot: 'bg-amber-500',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.8)]'
    },
    orange: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      border: 'hover:border-orange-500/50',
      shadow: 'shadow-orange-500/5',
      dot: 'bg-orange-500',
      glow: 'shadow-[0_0_10px_rgba(249,115,22,0.8)]'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-500',
      border: 'hover:border-cyan-500/50',
      shadow: 'shadow-cyan-500/5',
      dot: 'bg-cyan-500',
      glow: 'shadow-[0_0_10px_rgba(6,182,212,0.8)]'
    },
    pink: {
      bg: 'bg-pink-500/10',
      text: 'text-pink-500',
      border: 'hover:border-pink-500/50',
      shadow: 'shadow-pink-500/5',
      dot: 'bg-pink-500',
      glow: 'shadow-[0_0_10px_rgba(236,72,153,0.8)]'
    }
  };

  return colors[color] || colors.purple; // Default to purple if color not found
};

const RoadmapsTab: React.FC<RoadmapsTabProps> = ({ isDark, roadmaps }) => {
  const router = useRouter();

  return (
    <div className="pt-32 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
        <h2 className="text-5xl font-black tracking-tight transition-colors italic uppercase">Roadmaps</h2>
        <div className={`flex items-center gap-4 px-5 py-3 border rounded-full w-full md:w-auto transition-all ${isDark ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50 shadow-lg' : 'bg-white border-black/10 shadow-sm'}`}>
          <Search className="w-4 h-4 opacity-50" />
          <input type="text" placeholder="Filter roadmaps..." className="bg-transparent border-none focus:ring-0 text-xs w-full md:w-56 font-bold uppercase tracking-widest" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {roadmaps.map(r => {
          const styles = getColorStyles(r.color);
          
          return (
            <div
              key={r.id}
              className={`p-12 rounded-[4rem] border transition-all duration-500 group relative hover:scale-[1.02] ${isDark 
                ? `bg-white/[0.02] border-white/10 ${styles.border} shadow-2xl` 
                : `bg-white border-black/10 shadow-xl hover:shadow-2xl`}`}
            >
              <div className={`w-16 h-16 rounded-[1.5rem] mb-10 flex items-center justify-center ${styles.bg} ${styles.text} shadow-lg ${styles.shadow}`}>
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-3 transition-colors tracking-tight">{r.title}</h3>
              <p className={`text-[11px] ${styles.text} uppercase font-black mb-10 tracking-[0.4em]`}>{r.field}</p>
              <div className="space-y-5">
                {r.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-5 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className={`w-2 h-2 rounded-full ${styles.dot} ${styles.glow}`} /> {s}
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/roadmaps/${r.id}`);
                }}
                className={`w-full mt-12 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] border transition-all active:scale-[0.98] ${isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white hover:text-black shadow-lg shadow-white/5' 
                  : 'bg-gray-50 border-black/5 hover:bg-black hover:text-white shadow-sm'
                  }`}>
                Analyze Mastery
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapsTab;
