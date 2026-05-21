import React from 'react';
import { Shield } from 'lucide-react';

interface AegisLogoProps {
    isDark: boolean;
}

const AegisLogo: React.FC<AegisLogoProps> = ({ isDark }) => (
    <div className="flex items-center gap-3 cursor-pointer group">
        <div className={`relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg]`}>
            <div className={`absolute inset-0 rounded-xl border-2 rotate-45 transition-colors ${isDark ? 'border-white/20 group-hover:border-white' : 'border-black/10 group-hover:border-black'}`} />
            <div className={`absolute inset-1 rounded-lg border transition-colors ${isDark ? 'border-indigo-500/50 group-hover:border-indigo-400' : 'border-indigo-500/30'}`} />
            <Shield className={`w-4 h-4 md:w-5 md:h-5 relative z-10 transition-colors ${isDark ? 'text-white' : 'text-black'}`} />
        </div>
        <div className="hidden sm:flex flex-col -space-y-1">
            <span className={`text-xl md:text-2xl font-black tracking-tighter uppercase italic transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Aegis</span>
            <span className="text-[7px] md:text-[8px] tracking-[0.4em] font-bold text-indigo-500 uppercase">Intelligent Systems</span>
        </div>
    </div>
);

export default AegisLogo;
