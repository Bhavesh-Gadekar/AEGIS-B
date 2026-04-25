"use client";

import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isDark }) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'feed', label: 'Feed' },
    { id: 'network', label: 'Network' },
    { id: 'chat', label: 'Chat' },
    { id: 'roadmaps', label: 'Roadmaps' },
    { id: 'quiz', label: 'Quiz' },
  ];

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <div className="fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[70] px-1 shadow-2xl transition-all duration-1000">
      <div className={`relative flex items-center p-1.5 backdrop-blur-3xl border rounded-full transition-all duration-500 ${
        isDark ? 'bg-black/80 border-white/20 shadow-2xl shadow-white/10' : 'bg-white/90 border-black/20 shadow-2xl shadow-black/10'
      }`}>
        {/* Sliding Indicator */}
        <div 
          className={`absolute h-[calc(100%-8px)] rounded-full transition-all duration-500 ease-in-out z-0 ${
            isDark ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
          }`}
          style={{ 
            width: `calc(100% / ${tabs.length} - 4px)`,
            left: `calc(${activeIndex} * (100% / ${tabs.length}) + 2px)`,
            opacity: activeIndex === -1 ? 0 : 1
          }}
        />
        
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 px-2 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase transition-colors duration-300 w-16 md:w-24 text-center truncate ${
              activeTab === tab.id 
                ? (isDark ? 'text-black' : 'text-white') 
                : `text-gray-500 hover:${isDark ? 'text-white' : 'text-black'}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
