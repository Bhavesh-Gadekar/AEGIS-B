"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Image as ImageIcon,
    Video,
    Link as LinkIcon,
    Smile,
    Send,
    X,
    FileText,
    Shield,
    Brain,
    Award,
    Camera
} from 'lucide-react';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function CreatePostPage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('research');
    const [isDark, setIsDark] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);

    const postTypes = [
        { id: 'research', label: 'Research', icon: FileText, color: 'indigo' },
        { id: 'achievement', label: 'Achievement', icon: Award, color: 'emerald' },
        { id: 'question', label: 'Question', icon: Brain, color: 'amber' },
        { id: 'security', label: 'Security Alert', icon: Shield, color: 'red' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ content, postType, selectedImage });
        router.push('/');
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`min-h-screen relative flex items-center justify-center p-4 transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
            }`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={100}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
                <div className={`absolute top-[-20%] right-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full opacity-40 ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-200/40'
                    }`} />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className={`backdrop-blur-3xl rounded-[2.5rem] border shadow-2xl overflow-hidden ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-black/5'
                    }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <button
                            onClick={() => router.back()}
                            className={`p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-600 hover:text-black'
                                }`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-black uppercase tracking-widest">Create Post</h1>
                        <div className="w-11" /> {/* Spacer for centering */}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        {/* Hidden Inputs */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <input
                            type="file"
                            ref={cameraInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                        />

                        {/* Post Type Selector */}
                        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                            {postTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setPostType(type.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap border ${postType === type.id
                                        ? `bg-${type.color}-500 border-${type.color}-500 text-white shadow-lg shadow-${type.color}-500/20`
                                        : isDark
                                            ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            : 'bg-gray-50 border-black/5 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <type.icon className="w-3.5 h-3.5" />
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="mb-6 relative group space-y-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your academic progress, research findings, or security insights..."
                                className={`w-full h-32 bg-transparent border-none resize-none focus:ring-0 text-lg leading-relaxed placeholder:text-gray-500 ${isDark ? 'text-white' : 'text-black'
                                    }`}
                                autoFocus
                            />

                            {/* Image Preview */}
                            {selectedImage && (
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 group/preview transition-all">
                                    <img src={selectedImage} alt="Preview" className="w-full max-h-64 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Media Actions */}
                        <div className={`flex items-center justify-between pt-6 border-t ${isDark ? 'border-white/10' : 'border-black/5'
                            }`}>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-3 rounded-full transition-colors relative group ${isDark ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                    title="Gallery"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Gallery</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => cameraInputRef.current?.click()}
                                    className={`p-3 rounded-full transition-colors relative group ${isDark ? 'text-purple-400 hover:bg-purple-500/10' : 'text-purple-600 hover:bg-purple-50'
                                        }`}
                                    title="Camera"
                                >
                                    <Camera className="w-5 h-5" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Camera</span>
                                </button>
                                <button type="button" className={`p-3 rounded-full transition-colors ${isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}>
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                                <button type="button" className={`p-3 rounded-full transition-colors ${isDark ? 'text-amber-400 hover:bg-amber-500/10' : 'text-amber-600 hover:bg-amber-50'
                                    }`}>
                                    <Smile className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={!content.trim() && !selectedImage}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all transform active:scale-95 ${content.trim() || selectedImage
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500'
                                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <span>Post</span>
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
