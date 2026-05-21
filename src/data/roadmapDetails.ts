
import { PREDEFINED_ROADMAPS, RoadmapItem } from './roadmapData';

export interface Topic {
    name: string;
    type: 'video' | 'article' | 'code';
    duration: string;
}

export interface Module {
    id: number;
    title: string;
    status: 'completed' | 'in-progress' | 'locked';
    topics: Topic[];
}

export interface RoadmapDetail {
    title: string;
    field: string;
    color: string;
    description: string;
    modules: Module[];
}

const generateModulesFromSteps = (steps: string[]): Module[] => {
    return steps.map((step, index) => ({
        id: index + 1,
        title: step,
        status: index === 0 ? 'in-progress' : 'locked',
        topics: [
            { name: `${step} Fundamentals`, type: 'video', duration: '45m' },
            { name: `Deep Dive into ${step}`, type: 'article', duration: '1h' },
            { name: `${step} Practice Project`, type: 'code', duration: '2h' }
        ]
    }));
};

export const getRoadmapDetails = (id: string | number): RoadmapDetail | null => {
    const roadmap = PREDEFINED_ROADMAPS.find(r => r.id.toString() === id.toString());

    if (!roadmap) return null;

    return {
        title: roadmap.title,
        field: roadmap.field,
        color: roadmap.color,
        description: `Comprehensive mastery path for becoming a world-class ${roadmap.title}. Covers all essential skills from basics to advanced concepts.`,
        modules: generateModulesFromSteps(roadmap.steps)
    };
};
