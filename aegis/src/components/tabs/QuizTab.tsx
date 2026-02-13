"use client";

import React from 'react';
import { Search, Trophy } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  difficulty: string;
  active: boolean;
  time: string;
}

interface QuizTabProps {
  isDark: boolean;
  quizzes: Quiz[];
}

const QuizTab: React.FC<QuizTabProps> = ({ isDark, quizzes }) => {
  return (
    <div className="pt-48 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
        <h2 className="text-5xl font-black tracking-tight transition-colors italic uppercase">Quiz</h2>
        <div className={`flex items-center gap-4 px-5 py-3 border rounded-full w-full md:w-auto transition-all ${isDark ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50 shadow-lg' : 'bg-white border-black/10 shadow-sm'}`}>
          <Search className="w-4 h-4 opacity-50" />
          <input type="text" placeholder="Filter quiz..." className="bg-transparent border-none focus:ring-0 text-xs w-full md:w-56 font-bold uppercase tracking-widest" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {quizzes.map(q => (
          <div key={q.id} className={`p-12 rounded-[4rem] border transition-all duration-500 group ${isDark ? 'bg-white/[0.02] border-white/10 hover:border-amber-500/50 shadow-2xl' : 'bg-white border-black/10 shadow-xl hover:shadow-2xl'}`}>
            <div className="flex justify-between items-start mb-12">
              <Trophy className="w-14 h-14 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
              <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg' : 'bg-amber-50 border-amber-500/20 text-amber-600 shadow-sm'
              }`}>{q.difficulty}</span>
            </div>
            <h3 className="text-2xl font-black mb-5 leading-tight transition-colors tracking-tight">{q.title}</h3>
            <p className="text-sm opacity-60 mb-12 font-bold transition-opacity tracking-tight">
              {q.active ? `Live session concluding in ${q.time}` : `Guarded start: ${q.time}`}
            </p>
            <button className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-[0.98] ${
              q.active 
                ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-xl shadow-amber-500/30' 
                : (isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border border-black/10 text-black hover:bg-gray-100 shadow-sm')
            }`}>
              {q.active ? 'Join Secure Hall' : 'Request Reminder'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizTab;
