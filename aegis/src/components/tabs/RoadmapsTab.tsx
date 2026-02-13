"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Map } from 'lucide-react';

interface Roadmap {
  id: number;
  title: string;
  field: string;
  steps: string[];
}

interface RoadmapsTabProps {
  isDark: boolean;
  roadmaps: Roadmap[];
}

const RoadmapsTab: React.FC<RoadmapsTabProps> = ({ isDark, roadmaps }) => {
  const router = useRouter();

  return (
    <div className="pt-48 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
        <h2 className="text-5xl font-black tracking-tight transition-colors italic uppercase">Roadmaps</h2>
        <div className={`flex items-center gap-4 px-5 py-3 border rounded-full w-full md:w-auto transition-all ${isDark ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50 shadow-lg' : 'bg-white border-black/10 shadow-sm'}`}>
          <Search className="w-4 h-4 opacity-50" />
          <input type="text" placeholder="Filter roadmaps..." className="bg-transparent border-none focus:ring-0 text-xs w-full md:w-56 font-bold uppercase tracking-widest" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {roadmaps.map(r => (
          <div
            key={r.id}
            className={`p-12 rounded-[4rem] border transition-all duration-500 group relative hover:scale-[1.02] ${isDark ? 'bg-white/[0.02] border-white/10 hover:border-indigo-500/50 shadow-2xl' : 'bg-white border-black/10 shadow-xl hover:shadow-2xl'}`}
          >
            <div className={`w-16 h-16 rounded-[1.5rem] mb-10 flex items-center justify-center bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/5`}>
              <Map className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-3 transition-colors tracking-tight">{r.title}</h3>
            <p className="text-[11px] text-indigo-500 uppercase font-black mb-10 tracking-[0.4em]">{r.field}</p>
            <div className="space-y-5">
              {r.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-5 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" /> {s}
                </div>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/roadmaps/${r.id}`);
              }}
              className={`w-full mt-12 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] border transition-all active:scale-[0.98] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white hover:text-black shadow-lg shadow-white/5' : 'bg-gray-50 border-black/5 hover:bg-black hover:text-white shadow-sm'
                }`}>
              Analyze Mastery
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapsTab;
