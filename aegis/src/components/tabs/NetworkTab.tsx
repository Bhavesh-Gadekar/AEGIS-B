"use client";

import React, { useState } from 'react';
import { Search, CheckCircle2, MoreHorizontal } from 'lucide-react';

interface User {
  id: string | number;
  name: string;
  role: string;
  avatar: string;
  following: boolean;
  achievements: number;
  online: boolean;
}

interface NetworkTabProps {
  isDark: boolean;
  users: User[];
  toggleFollow: (id: string | number) => void;
}

const NetworkTab: React.FC<NetworkTabProps> = ({ isDark, users, toggleFollow }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2 text-center md:text-left w-full">
          <h2 className={`text-4xl md:text-5xl font-medium tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Academic Circle</h2>
          <p className="text-gray-500 text-base font-medium">Verified researchers in your proximity.</p>
        </div>
      </div>

      <div className={`mb-10 flex items-center gap-4 border p-4 rounded-2xl transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50' : 'bg-white border-black/10 shadow-sm'}`}>
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search network..."
          className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={`rounded-[2.5rem] border overflow-hidden backdrop-blur-xl transition-all duration-500 ${isDark ? 'bg-white/[0.02] border-white/10 shadow-2xl' : 'bg-white border-black/10 shadow-xl'}`}>
        {filteredUsers.length === 0 ? (
          <div className={`p-10 text-center font-bold text-sm uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No researchers found matching "{searchQuery}"
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className={`flex items-center justify-between p-6 border-b last:border-0 transition-all duration-300 ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-black/5 hover:bg-gray-50'
              }`}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl transition-all duration-500 ${isDark ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-indigo-50 text-indigo-600 shadow-sm'
                  }`}>
                  {user.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base font-bold transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{user.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">{user.role}</p>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase mt-1.5 opacity-80">{user.achievements} Badges • 1.2k Scholars</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 shadow-md ${user.following
                    ? (isDark ? 'bg-white/10 text-white border border-white/10 hover:bg-white hover:text-black' : 'bg-gray-100 text-black hover:bg-black hover:text-white')
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                    }`}
                >
                  {user.following ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NetworkTab;
