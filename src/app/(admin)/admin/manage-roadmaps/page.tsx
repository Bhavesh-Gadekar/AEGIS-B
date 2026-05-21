
'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import { PREDEFINED_ROADMAPS, RoadmapItem } from '@/data/roadmapData';
import RoadmapsTab from '@/components/tabs/RoadmapsTab';
import { getRoadmaps, createRoadmap, deleteRoadmap } from '@/actions/roadmaps';
import { toast } from 'sonner';

export default function AdminRoadmapsPage() {
    const { isDark } = useAppContext();
    const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>(PREDEFINED_ROADMAPS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch roadmaps on mount
    React.useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                const dbRoadmaps = await getRoadmaps();
                // Combine predefined and DB roadmaps, avoiding duplicates if any
                // Typically DB roadmaps are dynamic. Predefined are static.
                // We'll just append DB roadmaps.
                setRoadmaps([...PREDEFINED_ROADMAPS, ...dbRoadmaps]);
            } catch (error) {
                console.error('Failed to fetch roadmaps:', error);
                toast.error('Failed to load roadmaps');
            }
        };
        fetchRoadmaps();
    }, []);

    // New roadmap form state
    const [newRoadmap, setNewRoadmap] = useState<Partial<RoadmapItem>>({
        title: '',
        field: '',
        color: 'blue',
        steps: []
    });
    const [stepsInput, setStepsInput] = useState('');

    const handleAddRoadmap = async () => {
        if (!newRoadmap.title || !newRoadmap.field) return;

        setIsLoading(true);
        const steps = stepsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const roadmapToAdd: RoadmapItem = {
            id: Date.now().toString(), // Use string ID for consistency
            title: newRoadmap.title || 'Untitled',
            field: newRoadmap.field || 'General',
            color: (newRoadmap.color as any) || 'blue',
            steps: steps
        };

        try {
            await createRoadmap(roadmapToAdd);

            // Refresh list
            const dbRoadmaps = await getRoadmaps();
            setRoadmaps([...PREDEFINED_ROADMAPS, ...dbRoadmaps]);

            setIsModalOpen(false);
            setNewRoadmap({ title: '', field: '', color: 'blue', steps: [] });
            setStepsInput('');
            toast.success('Roadmap created successfully');
        } catch (error) {
            console.error('Error creating roadmap:', error);
            toast.error('Failed to create roadmap');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRoadmap = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this custom roadmap?')) return;
        try {
            const res = await deleteRoadmap(id.toString());
            if (res.success) {
                toast.success('Roadmap deleted safely');
                const dbRoadmaps = await getRoadmaps();
                setRoadmaps([...PREDEFINED_ROADMAPS, ...dbRoadmaps]);
            } else {
                toast.error(res.error || 'Failed to delete roadmap');
            }
        } catch(e: any) {
            toast.error(e.message || 'Error deleting roadmap');
        }
    };

    return (
        <>
            <RoadmapsTab
                isDark={isDark}
                roadmaps={roadmaps}
                basePath="/admin/manage-roadmaps"
                actionLabel="View Roadmap"
                onAddClick={() => setIsModalOpen(true)}
                onDeleteClick={handleDeleteRoadmap}
            />

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className={`relative w-full max-w-lg rounded-[2rem] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-[#0A0A0A] border border-white/10 text-white' : 'bg-white border border-black/10 text-black'}`}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black italic uppercase">New Designation</h3>
                            <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full hover:bg-gray-500/10 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Job Title</label>
                                <input
                                    type="text"
                                    value={newRoadmap.title}
                                    onChange={(e) => setNewRoadmap({ ...newRoadmap, title: e.target.value })}
                                    className={`w-full p-4 rounded-xl text-sm font-medium border bg-transparent transition-all focus:ring-2 focus:ring-indigo-500/20 outline-none ${isDark ? 'border-white/10 focus:border-indigo-500/50' : 'border-black/10 focus:border-indigo-500'}`}
                                    placeholder="e.g. Senior Backend Engineer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Field</label>
                                    <input
                                        type="text"
                                        value={newRoadmap.field}
                                        onChange={(e) => setNewRoadmap({ ...newRoadmap, field: e.target.value })}
                                        className={`w-full p-4 rounded-xl text-sm font-medium border bg-transparent transition-all focus:ring-2 focus:ring-indigo-500/20 outline-none ${isDark ? 'border-white/10 focus:border-indigo-500/50' : 'border-black/10 focus:border-indigo-500'}`}
                                        placeholder="e.g. Development"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Theme</label>
                                    <select
                                        value={newRoadmap.color}
                                        onChange={(e) => setNewRoadmap({ ...newRoadmap, color: e.target.value as any })}
                                        className={`w-full p-4 rounded-xl text-sm font-medium border bg-transparent transition-all focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none ${isDark ? 'border-white/10 focus:border-indigo-500/50 bg-[#0A0A0A]' : 'border-black/10 focus:border-indigo-500 bg-white'}`}
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="purple">Purple</option>
                                        <option value="emerald">Emerald</option>
                                        <option value="amber">Amber</option>
                                        <option value="orange">Orange</option>
                                        <option value="cyan">Cyan</option>
                                        <option value="pink">Pink</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Roadmap Steps <span className="normal-case opacity-50 ml-2">(comma separated) - Leave empty to auto-generate with AI</span></label>
                                <textarea
                                    value={stepsInput}
                                    onChange={(e) => setStepsInput(e.target.value)}
                                    className={`w-full p-4 rounded-xl text-sm font-medium border bg-transparent transition-all focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[100px] resize-none ${isDark ? 'border-white/10 focus:border-indigo-500/50' : 'border-black/10 focus:border-indigo-500'}`}
                                    placeholder="e.g. Learn HTML, Master CSS, JavaScript Fundamentals, React Basics"
                                />
                            </div>

                            <button
                                onClick={handleAddRoadmap}
                                disabled={isLoading || !newRoadmap.title || !newRoadmap.field}
                                className={`w-full py-4 mt-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                                    ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                    : 'bg-black text-white hover:bg-gray-800 shadow-xl'
                                    }`}
                            >
                                {isLoading ? 'Creating...' : 'Create Roadmap'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
