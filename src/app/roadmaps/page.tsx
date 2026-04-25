"use client";

import { useState, useEffect } from 'react';
import RoadmapsTab from '@/components/tabs/RoadmapsTab';
import { useAppContext } from '@/components/AppProvider';
import { PREDEFINED_ROADMAPS, RoadmapItem } from '@/data/roadmapData';
import { getRoadmaps } from '@/actions/roadmaps';
import { toast } from 'sonner';

export default function RoadmapsPage() {
    const { isDark } = useAppContext();
    const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>(PREDEFINED_ROADMAPS);

    useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                const dbRoadmaps = await getRoadmaps();
                setRoadmaps([...PREDEFINED_ROADMAPS, ...dbRoadmaps]);
            } catch (error) {
                console.error('Failed to fetch roadmaps:', error);
                toast.error('Failed to load new roadmaps');
            }
        };
        fetchRoadmaps();
    }, []);

    return <RoadmapsTab isDark={isDark} roadmaps={roadmaps} />;
}
