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
    Trophy,
    Star
} from 'lucide-react';
import { useAppContext } from '../../../components/AppProvider';

const Antigravity = dynamic(() => import('../../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

// Detailed Mock Data
const ROADMAP_DETAILS: any = {
    fs: {
        title: 'Full-Stack Engineering',
        field: 'Development',
        color: 'blue',
        description: 'Master the complete web development stack from frontend interfaces to backend systems and cloud deployment.',
        modules: [
            {
                id: 1,
                title: 'Frontend Foundations',
                status: 'completed',
                topics: [
                    { name: 'HTML5 & Semantic Structure', type: 'video', duration: '45m' },
                    { name: 'Advanced CSS & Tailwind', type: 'article', duration: '1h 20m' },
                    { name: 'JavaScript ES6+ Deep Dive', type: 'code', duration: '2h' },
                ]
            },
            {
                id: 2,
                title: 'React ecosystem',
                status: 'in-progress',
                topics: [
                    { name: 'React Hooks & State', type: 'video', duration: '1h' },
                    { name: 'Next.js 14 App Router', type: 'article', duration: '45m' },
                    { name: 'Global State (Zustand/Redux)', type: 'code', duration: '1h 30m' },
                ]
            },
            {
                id: 3,
                title: 'Backend Systems',
                status: 'locked',
                topics: [
                    { name: 'Node.js & Express', type: 'video', duration: '50m' },
                    { name: 'PostgreSQL & Prisma', type: 'code', duration: '2h' },
                    { name: 'Authentication (Auth.js)', type: 'article', duration: '40m' },
                ]
            },
            {
                id: 4,
                title: 'DevOps & Deployment',
                status: 'locked',
                topics: [
                    { name: 'Docker Containers', type: 'video', duration: '1h' },
                    { name: 'CI/CD Pipelines', type: 'article', duration: '30m' },
                    { name: 'AWS/Vercel Deployment', type: 'code', duration: '1h' },
                ]
            }
        ]
    },
    ai: {
        title: 'AI & Machine Learning',
        field: 'Intelligence',
        color: 'purple',
        description: 'Build the next generation of intelligent systems using PyTorch, Transformers, and Large Language Models.',
        modules: [
            {
                id: 1,
                title: 'Mathematics for ML',
                status: 'completed',
                topics: [
                    { name: 'Linear Algebra', type: 'video', duration: '3h' },
                    { name: 'Calculus & Optimization', type: 'article', duration: '2h' }
                ]
            },
            {
                id: 2,
                title: 'Deep Learning Basics',
                status: 'in-progress',
                topics: [
                    { name: 'Neural Networks 101', type: 'video', duration: '1h 30m' },
                    { name: 'PyTorch Tensors', type: 'code', duration: '2h' }
                ]
            },
            {
                id: 3,
                title: 'Computer Vision',
                status: 'locked',
                topics: [
                    { name: 'Convolutional Neural Networks', type: 'video', duration: '2h' },
                    { name: 'Object Detection (YOLO)', type: 'code', duration: '2h 30m' }
                ]
            },
            {
                id: 4,
                title: 'NLP & LLMs',
                status: 'locked',
                topics: [
                    { name: 'Transformers Architecture', type: 'article', duration: '1h' },
                    { name: 'Fine-tuning Llama/GPT', type: 'code', duration: '3h' }
                ]
            }
        ]
    },
    cy: {
        title: 'Cybersecurity Architect',
        field: 'Security',
        color: 'emerald',
        description: 'Defend systems against modern threats. Learn penetration testing, cryptography, and cloud security compliance.',
        modules: [
            {
                id: 1,
                title: 'Network Security',
                status: 'completed',
                topics: [
                    { name: 'OSI Model Deep Dive', type: 'article', duration: '1h' },
                    { name: 'Wireshark Analysis', type: 'code', duration: '2h' }
                ]
            },
            {
                id: 2,
                title: 'Ethical Hacking',
                status: 'in-progress',
                topics: [
                    { name: 'Reconnaissance Tools', type: 'video', duration: '1h 30m' },
                    { name: 'Metasploit Framework', type: 'code', duration: '2h' }
                ]
            },
            {
                id: 3,
                title: 'Cryptography',
                status: 'locked',
                topics: [
                    { name: 'Symmetric vs Asymmetric', type: 'article', duration: '1h' },
                    { name: 'PKI implementation', type: 'video', duration: '1h 15m' }
                ]
            },
            {
                id: 4,
                title: 'Cloud Security',
                status: 'locked',
                topics: [
                    { name: 'IAM Policies', type: 'code', duration: '1h 30m' },
                    { name: 'Container Security', type: 'video', duration: '2h' }
                ]
            }
        ]
    },
    ds: {
        title: 'Data Science Specialist',
        field: 'Analysis',
        color: 'amber',
        description: 'Unlock insights from data. Master statistical analysis, big data visualization, and predictive modeling.',
        modules: [
            {
                id: 1,
                title: 'Statistical Analysis',
                status: 'in-progress',
                topics: [
                    { name: 'Probability Theory', type: 'video', duration: '2h' },
                    { name: 'Hypothesis Testing', type: 'article', duration: '1h' }
                ]
            },
            {
                id: 2,
                title: 'Data Wrangling',
                status: 'locked',
                topics: [
                    { name: 'Pandas & NumPy', type: 'code', duration: '2h 30m' },
                    { name: 'SQL for Data Science', type: 'video', duration: '1h 45m' }
                ]
            },
            {
                id: 3,
                title: 'Machine Learning Models',
                status: 'locked',
                topics: [
                    { name: 'Regression & Classification', type: 'article', duration: '1h 30m' },
                    { name: 'Scikit-learn Pipelines', type: 'code', duration: '2h' }
                ]
            },
            {
                id: 4,
                title: 'Big Data Tools',
                status: 'locked',
                topics: [
                    { name: 'Apache Spark', type: 'video', duration: '2h' },
                    { name: 'Data Visualization (Tableau)', type: 'article', duration: '1h' }
                ]
            }
        ]
    },
    bc: {
        title: 'Blockchain Developer',
        field: 'Web3',
        color: 'orange',
        description: 'Architect decentralized applications (dApps) and smart contracts on Ethereum and other blockchain networks.',
        modules: [
            {
                id: 1,
                title: 'Blockchain Fundamentals',
                status: 'completed',
                topics: [
                    { name: 'Distributed Ledger Technology', type: 'video', duration: '1h' },
                    { name: 'Consensus Mechanisms', type: 'article', duration: '45m' }
                ]
            },
            {
                id: 2,
                title: 'Smart Contract Development',
                status: 'in-progress',
                topics: [
                    { name: 'Solidity Basics', type: 'code', duration: '2h' },
                    { name: 'Security Best Practices', type: 'video', duration: '1h 30m' }
                ]
            },
            {
                id: 3,
                title: 'dApp Frontend',
                status: 'locked',
                topics: [
                    { name: 'Web3.js / Ethers.js', type: 'code', duration: '2h' },
                    { name: 'Wallet Integration', type: 'article', duration: '1h' }
                ]
            },
            {
                id: 4,
                title: 'DeFi Protocols',
                status: 'locked',
                topics: [
                    { name: 'Liquidity Pools', type: 'video', duration: '1h 30m' },
                    { name: 'Flash Loans', type: 'code', duration: '2h' }
                ]
            }
        ]
    },
    ca: {
        title: 'Cloud Solutions Architect',
        field: 'Infrastructure',
        color: 'cyan',
        description: 'Design scalable, reliable, and secure cloud infrastructure using AWS, Azure, or Google Cloud Platform.',
        modules: [
            {
                id: 1,
                title: 'Cloud Foundations',
                status: 'completed',
                topics: [
                    { name: 'Virtualization & Containers', type: 'video', duration: '1h 15m' },
                    { name: 'Networking Basics (VPC, DNS)', type: 'article', duration: '1h' }
                ]
            },
            {
                id: 2,
                title: 'AWS Core Services',
                status: 'in-progress',
                topics: [
                    { name: 'EC2 & Lambda', type: 'code', duration: '2h' },
                    { name: 'S3 & Storage Classes', type: 'video', duration: '45m' }
                ]
            },
            {
                id: 3,
                title: 'Infrastructure as Code',
                status: 'locked',
                topics: [
                    { name: 'Terraform Basics', type: 'code', duration: '2h 30m' },
                    { name: 'CloudFormation', type: 'article', duration: '1h 30m' }
                ]
            },
            {
                id: 4,
                title: 'Serverless Architecture',
                status: 'locked',
                topics: [
                    { name: 'API Gateway', type: 'video', duration: '1h' },
                    { name: 'EventBridge', type: 'code', duration: '1h 30m' }
                ]
            }
        ]
    },
    ux: {
        title: 'UI/UX Design Systems',
        field: 'Design',
        color: 'pink',
        description: 'Create intuitive and visually stunning user experiences. Master Figma, prototyping, and accessibility standards.',
        modules: [
            {
                id: 1,
                title: 'Design Thinking',
                status: 'completed',
                topics: [
                    { name: 'User Empathy & Personas', type: 'article', duration: '45m' },
                    { name: 'Wireframing Basics', type: 'video', duration: '1h' }
                ]
            },
            {
                id: 2,
                title: 'Figma Mastery',
                status: 'in-progress',
                topics: [
                    { name: 'Auto Layout & Components', type: 'video', duration: '2h' },
                    { name: 'Interactive Prototyping', type: 'code', duration: '1h 30m' }
                ]
            },
            {
                id: 3,
                title: 'Design Systems',
                status: 'locked',
                topics: [
                    { name: 'Design Tokens', type: 'article', duration: '1h' },
                    { name: 'Component Libraries', type: 'video', duration: '1h 30m' }
                ]
            },
            {
                id: 4,
                title: 'Accessibility (a11y)',
                status: 'locked',
                topics: [
                    { name: 'WCAG Guidelines', type: 'article', duration: '1h 30m' },
                    { name: 'Screen Reader Testing', type: 'code', duration: '2h' }
                ]
            }
        ]
    }
};

const RoadmapStep = ({ module, index, isLast, color, isDark, onToggle }: any) => {
    const isCompleted = module.status === 'completed';
    const isLocked = module.status === 'locked';

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
                        ? `bg-white/5 border-white/10 ${!isLocked && 'hover:bg-white/10 hover:border-white/20'}`
                        : `bg-white border-black/5 hover:shadow-xl`
                        } ${isLocked ? 'opacity-50 grayscale' : ''}`}>

                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCompleted
                                ? `bg-${color}-500/20 text-${color}-400`
                                : isLocked
                                    ? 'bg-gray-500/10 text-gray-500'
                                    : `bg-${color}-500 text-white`
                                }`}>
                                Module {index + 1}
                            </span>

                            <button
                                onClick={() => onToggle(module.id)}
                                disabled={isLocked}
                                className={`transition-transform active:scale-95 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className={`w-6 h-6 text-${color}-500 fill-current opacity-100`} />
                                ) : isLocked ? (
                                    <Circle className="w-6 h-6 text-gray-600" />
                                ) : (
                                    <div className="flex items-center gap-2 group/status">
                                        <div className={`w-5 h-5 rounded-full border-2 border-${color}-500 flex items-center justify-center group-hover/status:bg-${color}-500/20`}>
                                            <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500 animate-pulse`} />
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{module.title}</h3>
                            {!isLocked && !isCompleted && (
                                <span className={`text-[9px] uppercase font-black tracking-widest text-${color}-500`}>In Progress</span>
                            )}
                        </div>


                        <div className="space-y-3">
                            {module.topics.map((topic: any, idx: number) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? 'bg-black/20 hover:bg-black/40' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        {topic.type === 'video' && <Video className={`w-4 h-4 ${isCompleted ? `text-${color}-500` : 'opacity-50'}`} />}
                                        {topic.type === 'article' && <BookOpen className={`w-4 h-4 ${isCompleted ? `text-${color}-500` : 'opacity-50'}`} />}
                                        {topic.type === 'code' && <Code className={`w-4 h-4 ${isCompleted ? `text-${color}-500` : 'opacity-50'}`} />}
                                        <span className={`text-sm font-medium ${isCompleted ? 'opacity-100' : 'opacity-80'}`}>{topic.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-40">{topic.duration}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Timeline Node */}
                <div className={`absolute left-0 w-6 h-6 rounded-full border-4 z-10 md:static md:w-8 md:h-8 md:flex-shrink-0 transition-all ${isCompleted
                    ? `bg-${color}-500 border-${color}-900`
                    : isLocked
                        ? `bg-gray-800 border-gray-900`
                        : `bg-white border-${color}-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]`
                    }`} />

                {/* Placeholder for layout balance */}
                <div className="hidden md:block flex-1" />

            </div>
        </div>
    );
};

export default function RoadmapDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { isDark } = useAppContext();

    // Derived data from static config
    const data = ROADMAP_DETAILS[id];

    // Initialize state with data.modules if available
    const [modules, setModules] = useState<any[]>([]);

    useEffect(() => {
        if (data && modules.length === 0) {
            setModules(data.modules);
        }
    }, [data, modules.length]);


    const handleToggleModule = (moduleId: number) => {
        setModules(prev => {
            const newModules = [...prev];
            const modIndex = newModules.findIndex(m => m.id === moduleId);

            if (modIndex === -1) return prev;

            const currentModule = newModules[modIndex];
            if (currentModule.status === 'locked') return prev; // Cannot toggle locked

            // Toggle logic
            const newStatus = currentModule.status === 'completed' ? 'in-progress' : 'completed';
            newModules[modIndex] = { ...currentModule, status: newStatus };

            // Unlock next module if completing
            if (newStatus === 'completed') {
                const nextIndex = modIndex + 1;
                if (nextIndex < newModules.length) {
                    const nextModule = newModules[nextIndex];
                    if (nextModule.status === 'locked') {
                        newModules[nextIndex] = { ...nextModule, status: 'in-progress' };
                    }
                }
            }

            return newModules;
        });
    };

    const completedCount = modules.filter(m => m.status === 'completed').length;
    const progressPercentage = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white font-bold">
            Roadmap not found.
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
                <div className={`absolute top-0 right-0 w-[60%] h-[60%] blur-[150px] rounded-full opacity-20 ${isDark ? `bg-${data.color}-900` : `bg-${data.color}-200`
                    }`} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-16">
                    <button
                        onClick={() => router.push('/roadmaps')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Roadmap
                    </button>

                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${isDark ? `bg-${data.color}-500/10 border-${data.color}-500/20 text-${data.color}-400` : `bg-${data.color}-50 border-${data.color}-100 text-${data.color}-600`
                                }`}>
                                <Map className="w-3 h-3" /> {data.field}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{data.title}</h1>
                            <p className="text-lg opacity-60 max-w-xl leading-relaxed">{data.description}</p>
                        </div>

                        <div className={`p-6 rounded-3xl border text-center min-w-[200px] transition-all duration-500 hover:scale-105 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-lg'
                            }`}>
                            <div className="flex justify-center mb-2">
                                <Trophy className={`w-8 h-8 text-${data.color}-500 transition-all duration-500 ${progressPercentage === 100 ? 'animate-bounce' : ''}`} />
                            </div>
                            <div className="text-3xl font-black mb-1 transition-all" key={progressPercentage}>{progressPercentage}%</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest opacity-50">Mastery Level</div>
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
                            color={data.color}
                            isDark={isDark}
                            onToggle={handleToggleModule}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
