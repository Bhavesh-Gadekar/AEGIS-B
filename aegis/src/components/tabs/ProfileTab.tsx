"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowUpRight,
  Grid,
  Brain,
  FileText,
  LogOut,
  Settings,
  Heart,
  MessageCircle,
  Camera,
  Briefcase,
  Shield, // Added Shield
  Sparkles // Added Sparkles
} from 'lucide-react';

import { useAppContext } from '@/components/AppProvider';
import { logout } from '@/actions/auth';

interface ProfileTabProps {
  initialProfile: any;
  initialPosts: any[];
}

const ProfileTab: React.FC<ProfileTabProps> = ({ initialProfile, initialPosts }) => {
  const { isDark } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'resume'>('posts');

  const handleLogout = async () => {
    await logout();
  };

  if (!initialProfile) {
    return <div className="text-center pt-32">Please log in to view profile.</div>;
  }

  const { full_name, handle, university, bio, avatar_url, email, stats: profileStats } = initialProfile;

  const stats = [
    { label: 'Posts', value: initialPosts.length.toString() },
    { label: 'Followers', value: profileStats?.followers?.toString() || '0' },
    { label: 'Following', value: profileStats?.following?.toString() || '0' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-32 pb-24 animate-in fade-in duration-700">

      {/* Unique Profile Header - Centered Layout */}
      <div className={`relative mb-16 rounded-[3rem] p-10 border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50" />

        <div className="relative flex flex-col items-center text-center z-10">
          {/* Avatar */}
          <div className="relative mb-6">
            <div className="p-1.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black border-4 overflow-hidden ${isDark ? 'border-black bg-black text-white' : 'border-white bg-white text-black'}`}>
                {avatar_url ? (
                  <img src={avatar_url} alt={full_name} className="w-full h-full object-cover" />
                ) : (
                  full_name?.[0] || '?'
                )}
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-blue-500 p-1.5 rounded-full border-4 border-inherit text-white shadow-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Name & Bio */}
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">{full_name}</h1>
          <p className="text-sm font-bold opacity-50 uppercase tracking-widest mb-6">{university || 'Academic'}</p>

          <p className={`max-w-lg mx-auto text-base leading-relaxed mb-8 whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {bio || 'No bio yet.'}
          </p>

          {handle && (
            <a href="#" className="inline-flex items-center gap-2 text-indigo-500 font-bold hover:underline mb-10 bg-indigo-500/10 px-4 py-2 rounded-full transition-colors hover:bg-indigo-500/20">
              <ArrowUpRight className="w-4 h-4" /> {handle}
            </a>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-8 md:gap-16 mb-10 px-8 py-4 rounded-2xl border backdrop-blur-sm bg-white/5 border-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className={`font-black text-2xl ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push('/edit-profile')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
              Edit Profile
            </button>
            <button
              onClick={() => router.push('/settings')}
              className={`p-3 rounded-xl transition-all border ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-black/10 hover:bg-gray-100'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all transform active:scale-95 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center justify-center gap-8 mb-12">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'posts'
            ? (isDark ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-black text-white shadow-xl shadow-black/20')
            : 'opacity-50 hover:opacity-100'
            }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'resume'
            ? (isDark ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-black text-white shadow-xl shadow-black/20')
            : 'opacity-50 hover:opacity-100'
            }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Resume</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px] animate-in slide-in-from-bottom-4 fade-in duration-500">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {initialPosts.map((post) => (
              <div key={post.id} className={`aspect-square relative group cursor-pointer overflow-hidden rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] ${isDark ? 'bg-white/[0.02] border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10' : 'bg-white border-black/5 hover:border-indigo-500/30 hover:shadow-xl'
                }`}>
                {/* Card Content */}
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="Post content" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-20 transition-opacity" />
                ) : (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 group-hover:opacity-20`}>
                    {post.type === 'research' && <FileText className={`w-8 h-8 opacity-40 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />}
                    {post.type === 'certificate' && <Shield className={`w-8 h-8 opacity-40 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />}
                    {post.type === 'media' && <Camera className={`w-8 h-8 opacity-40 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />}
                    {post.type === 'analysis' && <Brain className={`w-8 h-8 opacity-40 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30 text-center px-4 line-clamp-2">
                      {post.content}
                    </span>
                  </div>
                )}


                {/* Hover Overlay */}
                <div
                  onClick={() => router.push(`/edit-post/${post.id}`)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Heart className="w-5 h-5 fill-white" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                    Edit
                  </span>
                </div>
              </div>
            ))}

            {/* New Post Placeholder */}
            <div
              onClick={() => router.push('/create-post')}
              className={`aspect-square flex flex-col items-center justify-center gap-3 border border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 group ${isDark ? 'border-white/10 hover:border-white/30 hover:bg-white/5' : 'border-black/10 hover:border-black/30 hover:bg-black/5'
                }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 text-indigo-500 group-hover:scale-110 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'
                }`}>
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                Create Post
              </span>
            </div>
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Analyse Card */}
            <div className={`flex flex-col p-8 md:p-10 rounded-[2.5rem] border transition-all relative overflow-hidden group hover:scale-[1.01] ${isDark ? 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10' : 'bg-white border-black/5 hover:border-indigo-500/20 shadow-xl hover:shadow-2xl'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain className="w-32 h-32 rotate-12" />
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-3">Resume Analyse</h3>
              <p className="text-sm opacity-60 font-medium mb-8 leading-relaxed max-w-xs">
                Deploy AEGIS intelligent core to scan your CV for industry standard compliance and optimization points.
              </p>
              <button
                onClick={() => router.push('/resume-analysis')}
                className={`w-full mt-auto py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 ${isDark ? 'bg-white text-black hover:bg-indigo-50' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                Start Analysis
              </button>
            </div>

            {/* AI Resume Build Card */}
            <div className={`flex flex-col p-8 md:p-10 rounded-[2.5rem] border transition-all relative overflow-hidden group hover:scale-[1.01] ${isDark ? 'bg-white/5 border-white/10 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10' : 'bg-white border-black/5 hover:border-amber-500/20 shadow-xl hover:shadow-2xl'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-32 h-32 -rotate-12" />
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-amber-500 ${isDark ? 'bg-amber-500/20' : 'bg-amber-50'}`}>
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-3">AI Resume Build</h3>
              <p className="text-sm opacity-60 font-medium mb-8 leading-relaxed max-w-xs">
                Build a professional resume from scratch with Gemini AI assistance.
              </p>
              <button
                onClick={() => router.push('/ai-resume-build')}
                className={`w-full mt-auto py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 border ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'}`}
              >
                Build Resume
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfileTab;
