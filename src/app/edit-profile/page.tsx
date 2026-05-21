"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Upload, User, Mail, Briefcase, FileText, Loader2, Link as LinkIcon, GraduationCap } from 'lucide-react';
import { getProfile, updateProfile, uploadAvatar } from '@/actions/profile';
import { toast } from 'sonner';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function EditProfilePage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        handle: '',
        university: '',
        bio: '',
        email: '', // Read-only mostly? Or editable?
        // website: '', // Removed from schema
        avatar_url: ''
    });

    useEffect(() => {
        const loadProfile = async () => {
            const profile = await getProfile();
            if (profile) {
                setFormData({
                    name: profile.full_name || '',
                    handle: profile.handle || '',
                    university: profile.university || '',
                    bio: profile.bio || '',
                    email: profile.email || '',
                    avatar_url: profile.avatar_url || ''
                });
            }
            setFetching(false);
        };
        loadProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic preview? Or loading state?
        const toastId = toast.loading('Uploading avatar...');

        const form = new FormData();
        form.append('avatar', file);

        const result = await uploadAvatar(form);

        if (result.error) {
            toast.error(result.error, { id: toastId });
        } else {
            toast.success('Avatar updated!', { id: toastId });
            setFormData(prev => ({ ...prev, avatar_url: result.avatarUrl || '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateProfile(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Profile updated successfully');
            router.push('/profile'); // Redirect to profile
            router.refresh();
        }
        setLoading(false);
    };

    if (fetching) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>

            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={40}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => router.push('/profile')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </button>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Edit Profile</h1>
                    <p className="opacity-60 font-medium">Update your academic presence on the network.</p>
                </div>

                {/* Form Container */}
                <div className={`p-8 md:p-12 rounded-[3rem] border backdrop-blur-xl ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div onClick={handleAvatarClick} className="relative group cursor-pointer">
                                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black border-4 overflow-hidden ${isDark ? 'border-black bg-black text-white' : 'border-white bg-white text-black'}`}>
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.name?.[0] || '?'
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Change Avatar</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Display Name</label>
                                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                                    <User className="w-4 h-4 opacity-50" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-transparent border-none outline-none text-sm font-bold w-full"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Academic Handle</label>
                                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                                    <span className="text-indigo-500 font-bold">@</span>
                                    <input
                                        type="text"
                                        name="handle"
                                        value={formData.handle}
                                        onChange={handleChange}
                                        className="bg-transparent border-none outline-none text-sm font-bold w-full"
                                        placeholder="handle"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">University / Organization</label>
                            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                                <GraduationCap className="w-4 h-4 opacity-50" />
                                <input
                                    type="text"
                                    name="university"
                                    value={formData.university}
                                    onChange={handleChange}
                                    className="bg-transparent border-none outline-none text-sm font-bold w-full"
                                    placeholder="e.g. Stanford University"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Bio</label>
                            <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                                <FileText className="w-4 h-4 opacity-50 mt-1" />
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="bg-transparent border-none outline-none text-sm font-bold w-full resize-none"
                                    placeholder="Tell the network about your research interests..."
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-wait' : ''} ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4" /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
