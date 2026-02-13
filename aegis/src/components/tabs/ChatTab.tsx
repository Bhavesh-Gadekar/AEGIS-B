"use client";

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Camera,
  Shield,
  MoreHorizontal,
  Lock,
  Info,
  Image as ImageIcon,
  Heart,
  Smile,
  Mic
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  handle?: string;
  role: string;
  avatar: string;
  following: boolean;
  achievements: number;
  online: boolean;
}

interface ChatTabProps {
  isDark: boolean;
  users: User[];
}

const ChatTab: React.FC<ChatTabProps> = ({ isDark, users }) => {
  const [selectedUser, setSelectedUser] = useState(users[1]); // Default to second user
  const [message, setMessage] = useState("");

  const chatUsers = users.filter(u => u.name !== 'Jaimil Patel'); // Exclude self if present

  return (
    <div className="pt-28 md:pt-32 pb-6 px-4 md:px-6 max-w-[1200px] mx-auto h-screen max-h-[900px]">
      <div className={`h-full flex rounded-2xl border overflow-hidden shadow-2xl transition-all duration-500 ${isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
        }`}>

        {/* Sidebar */}
        <div className={`w-24 md:w-96 border-r flex flex-col transition-colors ${isDark ? 'border-white/10 bg-black' : 'border-black/5 bg-white'}`}>
          {/* Sidebar Header */}
          <div className="p-6 md:p-8 flex items-center justify-center md:justify-between">
            <h3 className="hidden md:block font-bold text-xl tracking-tight">@jaimil_p</h3>
            <div className="flex gap-4">
              <Plus className="w-7 h-7 cursor-pointer" />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 md:px-4 space-y-2">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100/5 mb-4">
              <p className="font-semibold text-sm opacity-60">Messages</p>
              <span className="text-xs opacity-40 font-medium">Requests</span>
            </div>

            {chatUsers.map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center justify-center md:justify-start gap-4 p-3 md:p-4 rounded-xl cursor-pointer transition-all ${selectedUser.id === u.id
                  ? (isDark ? 'bg-white/10' : 'bg-gray-100')
                  : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-14 h-14 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    {u.avatar.length > 2 ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.avatar}
                  </div>
                  {u.online && (
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${isDark ? 'border-black bg-green-500' : 'border-white bg-green-500'}`} />
                  )}
                </div>
                <div className="hidden md:block flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm font-semibold truncate ${selectedUser.id === u.id ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>{u.name}</p>
                    {u.handle && <span className="text-[10px] opacity-50 font-medium ml-2">{u.handle}</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {u.online ? 'Active now' : `Sent you a message • 2h`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col relative ${isDark ? 'bg-black' : 'bg-white'}`}>
          {/* Chat Header */}
          <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-500/20 flex items-center justify-center font-bold">
                {selectedUser.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base leading-tight">{selectedUser.name}</p>
                  {selectedUser.handle && <span className="text-xs opacity-50 font-bold">{selectedUser.handle}</span>}
                </div>
                <p className="text-xs text-gray-500 font-medium">{selectedUser.online ? 'Active now' : 'Active 1h ago'}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-gray-500">
              <Info className="w-6 h-6 cursor-pointer hover:text-current transition-colors" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 md:space-y-8 flex flex-col">
            <div className="flex flex-col items-center justify-center py-10 opacity-40 text-center mt-auto">
              <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-4xl font-bold bg-gray-500/10`}>
                {selectedUser.avatar}
              </div>
              <p className="text-lg font-bold">{selectedUser.name}</p>
              <p className="text-sm font-medium opacity-70 mb-4">{selectedUser.role}</p>
              <button className="px-4 py-1.5 rounded-lg bg-gray-500/10 text-xs font-bold hover:bg-gray-500/20 transition-colors">View Profile</button>
            </div>

            <div className="flex justify-center my-4">
              {/* Timestamp separator */}
              <span className="text-[10px] uppercase font-bold text-gray-500 opacity-50">Today 9:41 AM</span>
            </div>

            {/* Message Received */}
            <div className="flex justify-start gap-3 group max-w-[75%] md:max-w-[60%]">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 self-end mb-1 flex items-center justify-center font-bold text-[10px] ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                {selectedUser.avatar}
              </div>
              <div className={`p-4 rounded-3xl rounded-bl-none ${isDark ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-black'}`}>
                <p className="text-sm leading-relaxed">"Hey Jaimil, just pushed the distributed consensus module to the roadmap. Any chance you could peer-review it?"</p>
              </div>
            </div>

            {/* Message Sent */}
            <div className="flex justify-end gap-3 group self-end max-w-[75%] md:max-w-[60%]">
              <div className={`p-4 rounded-3xl rounded-br-none ${isDark ? 'bg-blue-600 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}`}>
                <p className="text-sm leading-relaxed">"I'll dive into it right away. The GUARDED logic you implemented for vertex resolution looked promising in the last draft. 🚀"</p>
              </div>
            </div>

            {/* Message Received */}
            <div className="flex justify-start gap-3 group max-w-[75%] md:max-w-[60%]">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 self-end mb-1 flex items-center justify-center font-bold text-[10px] ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                {selectedUser.avatar}
              </div>
              <div className={`p-4 rounded-3xl rounded-bl-none ${isDark ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-black'}`}>
                <p className="text-sm leading-relaxed">"Thanks! Let me know if the proof logic holds up."</p>
              </div>
              <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Smile className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </div>

          </div>

          {/* Footer Input */}
          <div className="p-4 md:p-6 pb-6 md:pb-8">
            <div className={`flex items-center gap-3 p-1.5 md:p-2 pl-4 rounded-[2rem] border transition-all ${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-300'}`}>
              <div className="p-1.5 bg-blue-500 rounded-full cursor-pointer hover:opacity-90 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message..."
                className={`flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base font-normal ${isDark ? 'placeholder-gray-500' : 'placeholder-gray-400'}`}
              />

              {!message && (
                <>
                  <div className="p-2 cursor-pointer hover:bg-gray-500/10 rounded-full transition-colors">
                    <Mic className="w-6 h-6 opacity-60" />
                  </div>
                  <div className="p-2 cursor-pointer hover:bg-gray-500/10 rounded-full transition-colors">
                    <ImageIcon className="w-6 h-6 opacity-60" />
                  </div>
                  <div className="p-2 cursor-pointer hover:bg-gray-500/10 rounded-full transition-colors">
                    <Heart className="w-6 h-6 opacity-60" />
                  </div>
                </>
              )}

              {message && (
                <button
                  className="px-4 py-2 font-bold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
