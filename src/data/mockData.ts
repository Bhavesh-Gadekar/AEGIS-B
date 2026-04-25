import {
    Shield,
    User,
    MessageSquare,
    Map,
    Trophy,
    FileText,
    Search,
    Bell,
    ArrowUpRight,
    ChevronDown,
    Brain,
    Zap,
    CheckCircle2,
    AlertTriangle,
    Send,
    Plus,
    Users,
    Sun,
    Moon,
    Heart,
    Share2,
    UserPlus,
    UserCheck,
    MoreHorizontal,
    X,
    Grid,
    Bookmark,
    Award,
    ZapOff,
    Flame,
    Camera,
    Image as ImageIcon,
    Lock,
    LogOut
} from 'lucide-react';
import React from 'react';

export const INITIAL_ROADMAPS = [
    { id: 'fs', title: 'Full-Stack Engineering', field: 'Development', color: 'blue', steps: ['React/Next.js', 'Node.js Systems', 'PostgreSQL Mastery', 'Cloud Deployment'] },
    { id: 'ai', title: 'AI & Machine Learning', field: 'Intelligence', color: 'purple', steps: ['Linear Algebra', 'PyTorch Foundations', 'Transformer Models', 'LLM Fine-tuning'] },
    { id: 'cy', title: 'Cybersecurity Architect', field: 'Security', color: 'emerald', steps: ['Network Security', 'Penetration Testing', 'Cryptography', 'Cloud Compliance'] },
    { id: 'ds', title: 'Data Science Specialist', field: 'Analysis', color: 'amber', steps: ['Stat Analysis', 'R/Python Viz', 'Big Data Systems', 'Predictive Modeling'] },
    { id: 'bc', title: 'Blockchain Developer', field: 'Web3', color: 'orange', steps: ['Smart Contracts', 'Solidity/Rust', 'DeFi Protocols', 'dApp Architecture'] },
    { id: 'ca', title: 'Cloud Solutions Architect', field: 'Infrastructure', color: 'cyan', steps: ['AWS/Azure Services', 'Microservices', 'Kubernetes', 'Serverless Design'] },
    { id: 'ux', title: 'UI/UX Design Systems', field: 'Design', color: 'pink', steps: ['User Research', 'Figma Prototyping', 'Design Tokens', 'Accessibility'] },
];

export const QUIZZES = [
    { id: 1, title: 'Data Structures & Algorithms', time: '15:00', difficulty: 'Hard', active: true },
    { id: 2, title: 'Quantum Computing Basics', time: '18:30', difficulty: 'Expert', active: false },
    { id: 3, title: 'UI/UX Design Systems', time: '21:00', difficulty: 'Medium', active: false },
    { id: 4, title: 'Blockchain Security', time: '12:00', difficulty: 'Hard', active: true },
    { id: 5, title: 'Cloud Architecture Patterns', time: '09:00', difficulty: 'Medium', active: true },
];

export const INITIAL_USERS = [
    { id: 1, name: 'Jaimil Patel', handle: '@jaimil_p', role: 'Lead Software Architect', avatar: 'JP', following: true, achievements: 18, online: true },
    { id: 2, name: 'Prajwal Anandgaonkar', handle: '@prajwal_a', role: 'AI Engineering @ Stanford', avatar: 'PA', following: false, achievements: 12, online: false },
    { id: 3, name: 'Bhavesh Gadekar', handle: '@bhavesh_g', role: 'Theoretical Physics @ Princeton', avatar: 'BG', following: true, achievements: 15, online: true },
    { id: 4, name: 'Sahil Shigwan', handle: '@sahil_s', role: 'Distributed Systems Analyst', avatar: 'SS', following: true, achievements: 21, online: true },
];

export const TEST_FEED = [
    {
        id: 1,
        user: 'Jaimil Patel',
        handle: '@jaimil_p',
        time: '2h',
        content: 'Just finished my research paper on "Zero-Knowledge Proofs in Decentralized Finance". AEGIS Guard logic really helped maintain a toxic-free discussion during peer review! 🛡️',
        likes: 42,
        comments: 8,
        type: 'research',
        image: true
    },
    {
        id: 2,
        user: 'Prajwal Anandgaonkar',
        handle: '@prajwal_a',
        time: '5h',
        content: 'Completed the AI Engineer roadmap! The project sections were intense but incredibly rewarding. On to the Deep Learning specialization. 🚀',
        likes: 128,
        comments: 24,
        type: 'achievement',
        image: true
    },
    {
        id: 3,
        user: 'Sahil Shigwan',
        handle: '@sahil_s',
        time: '8h',
        content: 'New Distributed Systems tutorial is live in the Roadmap section. Covering consensus algorithms and fault tolerance. Check it out!',
        likes: 56,
        comments: 12,
        type: 'education',
        image: false
    }
];
