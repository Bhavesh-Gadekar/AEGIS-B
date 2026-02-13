"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Heart, MessageSquare, Share2, MoreHorizontal, CheckCircle2, ImageIcon } from 'lucide-react';

interface Post {
  id: number;
  user: string;
  handle: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  type: string;
  image: boolean;
}

interface FeedTabProps {
  isDark: boolean;
  posts: Post[];
}

const FeedItem: React.FC<{ post: Post; isDark: boolean }> = ({ post, isDark }) => (
  <div className={`p-6 border rounded-[2.5rem] transition-all duration-500 group ${isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]' : 'border-black/5 bg-white shadow-sm hover:bg-gray-50'}`}>
    <div className="flex gap-4">
      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg relative ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
        {post.user[0]}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-inherit flex items-center justify-center">
          <CheckCircle2 className="w-2 h-2 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{post.user}</span>
            <span className="text-gray-500 text-xs">{post.handle} • {post.time}</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {post.content}
        </p>

        {post.image && (
          <div className={`w-full aspect-video rounded-3xl mb-4 overflow-hidden border border-white/10 bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.01] ${isDark ? 'from-zinc-900 via-indigo-900/10 to-zinc-900' : 'from-zinc-100 via-indigo-50 to-zinc-100'
            } flex flex-col items-center justify-center gap-3 relative`}>
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
            <ImageIcon className="w-8 h-8 opacity-20 relative z-10" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 relative z-10">Research Proof Data</span>
          </div>
        )}

        <div className="flex items-center gap-8 text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" /> <span className="text-xs font-bold">{post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
            <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors ml-auto">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const FeedTab: React.FC<FeedTabProps> = ({ isDark, posts }) => {
  const router = useRouter();
  return (
    <div className="max-w-3xl mx-auto pt-32 pb-24 px-4">
      <div className="flex justify-between items-center mb-12 px-4">
        <h2 className="text-4xl font-black tracking-tight transition-colors">Activity Feed</h2>
        <button
          onClick={() => router.push('/create-post')}
          className={`p-4 rounded-[1.5rem] shadow-2xl transition-all active:scale-95 ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-black hover:bg-gray-800 shadow-black/20'} text-white`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="flex flex-col gap-6">
        {posts.map(post => (
          <FeedItem key={post.id} post={post} isDark={isDark} />
        ))}
      </div>
    </div>
  );
};

export default FeedTab;
