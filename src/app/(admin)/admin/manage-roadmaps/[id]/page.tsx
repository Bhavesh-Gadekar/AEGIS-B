
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    ArrowLeft,
    Map,
    CheckCircle2,
    Circle,
    BookOpen,
    Video,
    Code,
} from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { getRoadmapById } from '@/actions/roadmaps';
import { PREDEFINED_ROADMAPS } from '@/data/roadmapData';
import { getRoadmapDetails } from '@/data/roadmapDetails';

const Antigravity = dynamic(() => import('@/components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

const RoadmapStep = ({ module, index, isLast, color, isDark }: any) => {
    // Treat everything as readable/unlocked for admin view
    const isCompleted = false;
    const isLocked = false;

    return (
        <div className="relative pl-8 md:pl-0">
            {/* Timeline Connector */}
            {!isLast && (
                <div className={`absolute left-3 top-8 bottom-[-24px] w-0.5 md:left-1/2 md:-ml-[1px] ${isDark
                    ? 'bg-gradient-to-b from-white/20 to-white/5'
                    : 'bg-gradient-to-b from-black/20 to-black/5'
                    }`} />
            )}

            <div className={`flex flex-col md:flex-row md:items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}>

                {/* Step Content */}
                <div className="flex-1">
                    <div className={`p-6 rounded-[2rem] border transition-all duration-500 group hover:scale-[1.02] ${isDark
                        ? `bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20`
                        : `bg-white border-black/5 hover:shadow-xl`
                        }`}>

                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${color}-500/10 text-${color}-400`}>
                                Module {index + 1}
                            </span>

                            <div className="opacity-50">
                                <Circle className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{module.title}</h3>
                        </div>


                        <div className="space-y-3">
                            {module.topics.map((topic: any, idx: number) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? 'bg-black/20 hover:bg-black/40' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        {topic.type === 'video' && <Video className={`w-4 h-4 opacity-50`} />}
                                        {topic.type === 'article' && <BookOpen className={`w-4 h-4 opacity-50`} />}
                                        {topic.type === 'code' && <Code className={`w-4 h-4 opacity-50`} />}
                                        <span className={`text-sm font-medium opacity-80`}>{topic.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-40">{topic.duration}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Timeline Node */}
                <div className={`absolute left-0 w-6 h-6 rounded-full border-4 z-10 md:static md:w-8 md:h-8 md:flex-shrink-0 transition-all bg-white border-${color}-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]`} />

                {/* Placeholder for layout balance */}
                <div className="hidden md:block flex-1" />

            </div>
        </div>
    );
};

export default function AdminRoadmapDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { isDark } = useAppContext();

    // Data handling
    const [staticData] = useState(() => getRoadmapDetails(id));
    const [dynamicData, setDynamicData] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);

    useEffect(() => {
        if (staticData && modules.length === 0) {
            setModules(staticData.modules);
        } else if (!staticData) {
            getRoadmapById(id).then((roadmap) => {
                let sourceRoadmap = roadmap;
                if (!sourceRoadmap) {
                    sourceRoadmap = PREDEFINED_ROADMAPS.find(r => r.id === id || r.id.toString() === id) as any;
                }

                if (sourceRoadmap) {
                    const customData = {
                        title: sourceRoadmap.title,
                        field: sourceRoadmap.field,
                        color: sourceRoadmap.color,
                        description: 'Foundational Roadmap for ' + sourceRoadmap.field + ' mastery.',
                        modules: sourceRoadmap.steps.map((step: string, idx: number) => ({
                            id: idx + 1,
                            title: step,
                            status: 'locked',
                            topics: [
                                { name: 'Fundamental theory', type: 'article', duration: '30m' },
                                { name: 'Practical exercises', type: 'video', duration: '45m' },
                                { name: 'Hands-on project base', type: 'code', duration: '1h' }
                            ]
                        }))
                    };
                    setDynamicData(customData);
                    if (modules.length === 0) {
                        setModules(customData.modules);
                    }
                } else {
                    setDynamicData({ notFound: true });
                }
            });
        }
    }, [staticData, modules.length, id]);

    const finalData = staticData || (dynamicData && !dynamicData.notFound ? dynamicData : null);

    if (!finalData) return (
        <div className={`min-h-screen flex items-center justify-center font-bold uppercase tracking-widest ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
            Roadmap not found or loading...
        </div>
    );

    return (
        <div className={`min-h-screen relative transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
            }`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={60}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
                <div className={`absolute top-0 right-0 w-[60%] h-[60%] blur-[150px] rounded-full opacity-20 ${isDark ? `bg-${finalData.color}-900` : `bg-${finalData.color}-200`
                    }`} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 pt-32">
                {/* Header */}
                <div className="mb-16">
                    <button
                        onClick={() => router.push('/admin/manage-roadmaps')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Roadmaps
                    </button>

                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${isDark ? `bg-${finalData.color}-500/10 border-${finalData.color}-500/20 text-${finalData.color}-400` : `bg-${finalData.color}-50 border-${finalData.color}-100 text-${finalData.color}-600`
                                }`}>
                                <Map className="w-3 h-3" /> {finalData.field}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{finalData.title}</h1>
                            <p className="text-lg opacity-60 max-w-xl leading-relaxed">{finalData.description}</p>
                        </div>
                    </div>
                </div>

                {/* Roadmap Path */}
                <div className="relative space-y-12 pb-24">
                    {/* Vertical Line for Mobile */}
                    <div className={`absolute left-3 top-0 bottom-0 w-0.5 md:hidden ${isDark ? 'bg-white/10' : 'bg-black/5'
                        }`} />

                    {modules.map((module: any, index: number) => (
                        <RoadmapStep
                            key={module.id}
                            module={module}
                            index={index}
                            isLast={index === modules.length - 1}
                            color={finalData.color}
                            isDark={isDark}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
