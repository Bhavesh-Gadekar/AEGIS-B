"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
    ArrowLeft, 
    Sparkles, 
    FileText, 
    CheckCircle2, 
    User, 
    Briefcase, 
    GraduationCap, 
    Loader2, 
    Plus, 
    Trash2, 
    Download, 
    Eye, 
    RotateCcw,
    Sliders,
    Award,
    Code,
    FileSpreadsheet
} from 'lucide-react';
import { generateResumeSummary, polishResumeBullet } from '@/actions/resume';
import { toast } from 'sonner';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

// Fictional neutral demo data
const DEMO_DATA = {
    personal: {
        fullName: "Alex Carter",
        title: "Senior Full Stack Architect",
        email: "alex.carter@email.com",
        phone: "+1-555-019-2834",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexcarter",
        github: "github.com/alexcarter",
        website: "alexcarter.dev"
    },
    summary: "High-impact Full Stack Architect with over 7 years of experience engineering high-performance distributed systems, cloud migrations, and decentralized security platforms. Proven capability in leading cross-functional teams to deploy scalable API solutions and zero-knowledge identity protocols, optimizing latency and ensuring SOC2 compliance.",
    skills: [
        { category: "Languages", items: "TypeScript, Python, Go, Rust, SQL, Bash" },
        { category: "Frontend", items: "React.js, Next.js, TailwindCSS, WebGL, Zustand" },
        { category: "Backend", items: "Node.js, FastAPI, NestJS, gRPC, REST APIs" },
        { category: "Databases", items: "PostgreSQL, Redis, MongoDB, Supabase" },
        { category: "DevOps & Cloud", items: "Docker, Kubernetes, AWS, Terraform, GitHub Actions" }
    ],
    experience: [
        {
            company: "Apex Ledger Systems",
            position: "Senior Software Architect",
            link: "apexledger.io",
            techStack: "Next.js, FastAPI, PostgreSQL, AWS",
            date: "Jan 2024 - Present",
            bullets: [
                "Spearheaded redesign of decentralized accounting ledger, reducing transaction processing time by 42%.",
                "Led team of 6 engineers to build secure data pipelines processing $5M+ in weekly transaction volume.",
                "Implemented unified authentication architecture using Supabase and Auth0, enhancing cross-domain security."
            ]
        },
        {
            company: "CloudSync Solutions",
            position: "Full Stack Engineer",
            link: "cloudsync.com",
            techStack: "React, Express, Redis, Docker",
            date: "Aug 2021 - Dec 2023",
            bullets: [
                "Engineered dynamic asset caching system that lowered cloud compute overhead by 28% annually.",
                "Architected internal component library utilizing Shadcn UI, boosting developer velocity by 35%."
            ]
        }
    ],
    projects: [
        {
            title: "VaultShield Protocol",
            link: "vaultshield.net",
            github: "github.com/alexc/vaultshield",
            techStack: "Rust, WebAssembly, React, Supabase",
            date: "Jul 2024",
            bullets: [
                "Designed zero-knowledge document vault application ensuring end-to-end client-side encryption.",
                "Integrated secure serverless storage backends on Supabase, hosting 15k+ encrypted accounts."
            ]
        }
    ],
    education: [
        {
            school: "Stanford University",
            degree: "Master of Science in Computer Science",
            date: "2019 - 2021",
            grade: "GPA: 3.92"
        },
        {
            school: "UC Berkeley",
            degree: "Bachelor of Science in Electrical Engineering",
            date: "2015 - 2019",
            grade: "GPA: 3.85"
        }
    ],
    achievements: [
        "Recipient of Stanford Computer Science Innovation Scholarship (2020)",
        "Successfully developed and deployed 5+ open-source cloud architectures with 10k+ GitHub stars combined.",
        "Gained practical production scaling expertise handling multi-region Kubernetes clusters."
    ]
};

const BLANK_STATE = {
    personal: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "" },
    summary: "",
    skills: [{ category: "", items: "" }],
    experience: [{ company: "", position: "", link: "", techStack: "", date: "", bullets: [""] }],
    projects: [{ title: "", link: "", github: "", techStack: "", date: "", bullets: [""] }],
    education: [{ school: "", degree: "", date: "", grade: "" }],
    achievements: [""]
};

type FormState = typeof BLANK_STATE;

export default function AIResumeBuildPage() {
    const router = useRouter();
    const [isDark] = useState(true);
    const [activeTab, setActiveTab] = useState<'personal' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'achievements'>('personal');
    
    // Resume Form State
    const [resumeData, setResumeData] = useState<FormState>(BLANK_STATE);
    
    // AI Loading States
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [polishingBulletKey, setPolishingBulletKey] = useState<string | null>(null); // e.g. 'exp-0-1' or 'proj-0-0'
    const [isPreviewMode, setIsPreviewMode] = useState(false); // Mobile screen toggle

    // Handlers for personal fields
    const handlePersonalChange = (field: keyof FormState['personal'], val: string) => {
        setResumeData(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: val }
        }));
    };

    // Summary AI generator
    const handleGenerateSummary = async () => {
        if (!resumeData.personal.fullName || !resumeData.personal.title) {
            toast.error("Please enter your Full Name and Professional Title first.");
            return;
        }

        setGeneratingSummary(true);
        const res = await generateResumeSummary({
            fullName: resumeData.personal.fullName,
            role: resumeData.personal.title,
            skills: resumeData.skills.map(s => `${s.category}: ${s.items}`).join(', '),
            experienceSummary: resumeData.experience.map(e => `${e.position} at ${e.company}`).join(', '),
            educationSummary: resumeData.education.map(ed => `${ed.degree} from ${ed.school}`).join(', ')
        });

        setGeneratingSummary(false);
        if (res.success && res.summary) {
            setResumeData(prev => ({ ...prev, summary: res.summary! }));
            toast.success("AI Professional Summary generated!");
        } else {
            toast.error(res.error || "Failed to generate summary.");
        }
    };

    // AI Bullet polisher
    const handlePolishBullet = async (type: 'exp' | 'proj', parentIndex: number, bulletIndex: number) => {
        const text = type === 'exp' 
            ? resumeData.experience[parentIndex].bullets[bulletIndex]
            : resumeData.projects[parentIndex].bullets[bulletIndex];

        if (!text || text.trim().length < 5) {
            toast.error("Please write a draft bullet point first (at least 5 characters).");
            return;
        }

        const key = `${type}-${parentIndex}-${bulletIndex}`;
        setPolishingBulletKey(key);

        const role = type === 'exp' ? resumeData.experience[parentIndex].position : resumeData.projects[parentIndex].title;
        const res = await polishResumeBullet(text, role || resumeData.personal.title || "Software Engineer");

        setPolishingBulletKey(null);

        if (res.success && res.polished) {
            setResumeData(prev => {
                const updated = { ...prev };
                if (type === 'exp') {
                    updated.experience[parentIndex].bullets[bulletIndex] = res.polished!;
                } else {
                    updated.projects[parentIndex].bullets[bulletIndex] = res.polished!;
                }
                return updated;
            });
            toast.success("AI polished bullet point!");
        } else {
            toast.error(res.error || "Failed to polish bullet point.");
        }
    };

    // Load neutral demo data
    const loadDemo = () => {
        setResumeData(DEMO_DATA);
        toast.success("Demo profile loaded! You can now customize or AI-optimize.");
    };

    // Reset fields
    const handleReset = () => {
        if (confirm("Are you sure you want to clear all fields?")) {
            setResumeData(BLANK_STATE);
            toast.info("All fields cleared.");
        }
    };

    // Skill handlers
    const addSkillRow = () => {
        setResumeData(prev => ({
            ...prev,
            skills: [...prev.skills, { category: "", items: "" }]
        }));
    };

    const removeSkillRow = (index: number) => {
        setResumeData(prev => {
            const updated = [...prev.skills];
            updated.splice(index, 1);
            return { ...prev, skills: updated };
        });
    };

    const handleSkillChange = (index: number, field: 'category' | 'items', val: string) => {
        setResumeData(prev => {
            const updated = [...prev.skills];
            updated[index][field] = val;
            return { ...prev, skills: updated };
        });
    };

    // Experience handlers
    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, { company: "", position: "", link: "", techStack: "", date: "", bullets: [""] }]
        }));
    };

    const removeExperience = (index: number) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            updated.splice(index, 1);
            return { ...prev, experience: updated };
        });
    };

    const handleExperienceChange = (index: number, field: keyof FormState['experience'][0], val: any) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, experience: updated };
        });
    };

    const addExpBullet = (expIdx: number) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            updated[expIdx].bullets = [...updated[expIdx].bullets, ""];
            return { ...prev, experience: updated };
        });
    };

    const removeExpBullet = (expIdx: number, bulletIdx: number) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            updated[expIdx].bullets.splice(bulletIdx, 1);
            return { ...prev, experience: updated };
        });
    };

    const handleExpBulletChange = (expIdx: number, bulletIdx: number, val: string) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            updated[expIdx].bullets[bulletIdx] = val;
            return { ...prev, experience: updated };
        });
    };

    // Project handlers
    const addProject = () => {
        setResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, { title: "", link: "", github: "", techStack: "", date: "", bullets: [""] }]
        }));
    };

    const removeProject = (index: number) => {
        setResumeData(prev => {
            const updated = [...prev.projects];
            updated.splice(index, 1);
            return { ...prev, projects: updated };
        });
    };

    const handleProjectChange = (index: number, field: keyof FormState['projects'][0], val: any) => {
        setResumeData(prev => {
            const updated = [...prev.projects];
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, projects: updated };
        });
    };

    const addProjBullet = (projIdx: number) => {
        setResumeData(prev => {
            const updated = [...prev.projects];
            updated[projIdx].bullets = [...updated[projIdx].bullets, ""];
            return { ...prev, projects: updated };
        });
    };

    const removeProjBullet = (projIdx: number, bulletIdx: number) => {
        setResumeData(prev => {
            const updated = [...prev.projects];
            updated[projIdx].bullets.splice(bulletIdx, 1);
            return { ...prev, projects: updated };
        });
    };

    const handleProjBulletChange = (projIdx: number, bulletIdx: number, val: string) => {
        setResumeData(prev => {
            const updated = [...prev.projects];
            updated[projIdx].bullets[bulletIdx] = val;
            return { ...prev, projects: updated };
        });
    };

    // Education handlers
    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, { school: "", degree: "", date: "", grade: "" }]
        }));
    };

    const removeEducation = (index: number) => {
        setResumeData(prev => {
            const updated = [...prev.education];
            updated.splice(index, 1);
            return { ...prev, education: updated };
        });
    };

    const handleEducationChange = (index: number, field: keyof FormState['education'][0], val: string) => {
        setResumeData(prev => {
            const updated = [...prev.education];
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, education: updated };
        });
    };

    // Achievement handlers
    const handleAchievementChange = (index: number, val: string) => {
        setResumeData(prev => {
            const updated = [...prev.achievements];
            updated[index] = val;
            return { ...prev, achievements: updated };
        });
    };

    const addAchievement = () => {
        setResumeData(prev => ({
            ...prev,
            achievements: [...prev.achievements, ""]
        }));
    };

    const removeAchievement = (index: number) => {
        setResumeData(prev => {
            const updated = [...prev.achievements];
            updated.splice(index, 1);
            return { ...prev, achievements: updated };
        });
    };

    // Premium PDF download via vector window print engine
    const downloadPDF = () => {
        if (!resumeData.personal.fullName) {
            toast.error("Please fill in your name before printing.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to download your resume.");
            return;
        }

        // Assemble styled HTML strictly matching the live resume layout
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${resumeData.personal.fullName} - Resume</title>
            <meta charset="utf-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: 'Inter', sans-serif;
                    color: #1e293b;
                    background: #ffffff;
                    line-height: 1.45;
                    font-size: 11px;
                    padding: 40px 48px;
                }
                a {
                    color: #2563eb;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                .header {
                    text-align: center;
                    margin-bottom: 16px;
                }
                .name {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: #0f172a;
                    margin-bottom: 2px;
                    text-transform: uppercase;
                }
                .title {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #4f46e5;
                    margin-bottom: 8px;
                }
                .contacts {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 12px;
                    font-size: 9px;
                    font-weight: 500;
                    color: #64748b;
                }
                .section {
                    margin-bottom: 16px;
                }
                .section-title {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #0f172a;
                    border-bottom: 1.5px solid #e2e8f0;
                    padding-bottom: 2px;
                    margin-bottom: 8px;
                }
                .summary {
                    text-align: justify;
                }
                .skills-grid {
                    display: table;
                    width: 100%;
                }
                .skills-row {
                    display: table-row;
                }
                .skills-cat {
                    display: table-cell;
                    font-weight: 700;
                    width: 120px;
                    padding-bottom: 4px;
                    color: #334155;
                }
                .skills-items {
                    display: table-cell;
                    padding-bottom: 4px;
                }
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 11px;
                    margin-bottom: 2px;
                }
                .item-sub {
                    display: flex;
                    justify-content: space-between;
                    font-size: 9.5px;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 4px;
                }
                .tech-stack {
                    font-weight: 500;
                    color: #4f46e5;
                }
                .item-date {
                    font-weight: 500;
                    color: #64748b;
                }
                ul {
                    margin-left: 14px;
                    margin-bottom: 10px;
                }
                li {
                    margin-bottom: 3px;
                    text-align: justify;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    @page {
                        size: letter;
                        margin: 0.5in;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="name">${resumeData.personal.fullName}</div>
                ${resumeData.personal.title ? `<div class="title">${resumeData.personal.title}</div>` : ''}
                <div class="contacts">
                    ${resumeData.personal.email ? `<span>${resumeData.personal.email}</span>` : ''}
                    ${resumeData.personal.phone ? `<span>${resumeData.personal.phone}</span>` : ''}
                    ${resumeData.personal.location ? `<span>${resumeData.personal.location}</span>` : ''}
                    ${resumeData.personal.website ? `<span><a href="https://${resumeData.personal.website}" target="_blank">${resumeData.personal.website}</a></span>` : ''}
                    ${resumeData.personal.linkedin ? `<span><a href="https://${resumeData.personal.linkedin}" target="_blank">${resumeData.personal.linkedin}</a></span>` : ''}
                    ${resumeData.personal.github ? `<span><a href="https://${resumeData.personal.github}" target="_blank">${resumeData.personal.github}</a></span>` : ''}
                </div>
            </div>

            ${resumeData.summary ? `
            <div class="section">
                <div class="section-title">Professional Summary</div>
                <p class="summary">${resumeData.summary}</p>
            </div>
            ` : ''}

            ${resumeData.skills.some(s => s.category) ? `
            <div class="section">
                <div class="section-title">Technical Skills</div>
                <div class="skills-grid">
                    ${resumeData.skills.map(s => s.category ? `
                        <div class="skills-row">
                            <div class="skills-cat">${s.category}:</div>
                            <div class="skills-items">${s.items}</div>
                        </div>
                    ` : '').join('')}
                </div>
            </div>
            ` : ''}

            ${resumeData.experience.some(e => e.company) ? `
            <div class="section">
                <div class="section-title">Professional Experience</div>
                ${resumeData.experience.map(e => e.company ? `
                    <div style="margin-bottom: 10px;">
                        <div class="item-header">
                            <div>${e.position} @ ${e.company}</div>
                            <div class="item-date">${e.date}</div>
                        </div>
                        <div class="item-sub">
                            <div>Tech Stack: <span class="tech-stack">${e.techStack}</span></div>
                            ${e.link ? `<div><a href="https://${e.link}" target="_blank">${e.link}</a></div>` : ''}
                        </div>
                        <ul>
                            ${e.bullets.map(b => b ? `<li>${b}</li>` : '').join('')}
                        </ul>
                    </div>
                ` : '').join('')}
            </div>
            ` : ''}

            ${resumeData.projects.some(p => p.title) ? `
            <div class="section">
                <div class="section-title">Projects</div>
                ${resumeData.projects.map(p => p.title ? `
                    <div style="margin-bottom: 10px;">
                        <div class="item-header">
                            <div>${p.title}</div>
                            <div class="item-date">${p.date}</div>
                        </div>
                        <div class="item-sub">
                            <div>Tech Stack: <span class="tech-stack">${p.techStack}</span></div>
                            <div style="display: flex; gap: 8px;">
                                ${p.link ? `<span><a href="https://${p.link}" target="_blank">Demo</a></span>` : ''}
                                ${p.github ? `<span><a href="https://${p.github}" target="_blank">GitHub</a></span>` : ''}
                            </div>
                        </div>
                        <ul>
                            ${p.bullets.map(b => b ? `<li>${b}</li>` : '').join('')}
                        </ul>
                    </div>
                ` : '').join('')}
            </div>
            ` : ''}

            ${resumeData.education.some(edu => edu.school) ? `
            <div class="section">
                <div class="section-title">Education</div>
                ${resumeData.education.map(edu => edu.school ? `
                    <div style="margin-bottom: 6px;">
                        <div class="item-header">
                            <div>${edu.degree}</div>
                            <div class="item-date">${edu.date}</div>
                        </div>
                        <div class="item-sub">
                            <div>${edu.school}</div>
                            <div>${edu.grade}</div>
                        </div>
                    </div>
                ` : '').join('')}
            </div>
            ` : ''}

            ${resumeData.achievements.some(a => a) ? `
            <div class="section">
                <div class="section-title">Key Achievements</div>
                <ul>
                    ${resumeData.achievements.map(a => a ? `<li>${a}</li>` : '').join('')}
                </ul>
            </div>
            ` : ''}
        </body>
        </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Let styles and fonts resolve, then print
        setTimeout(() => {
            printWindow.print();
        }, 800);
    };

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
                <div className="absolute top-0 right-0 w-[45%] h-[45%] bg-amber-500/10 blur-[130px] rounded-full opacity-35 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-indigo-500/5 blur-[150px] rounded-full opacity-20 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                    <div>
                        <button
                            onClick={() => router.push('/?tab=profile')}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 transition-all bg-white/5 hover:bg-white/10 text-white border border-white/5"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Profile
                        </button>
                        
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                            AI Resume Builder <Sparkles className="w-8 h-8 text-amber-400" />
                        </h1>
                        <p className="opacity-60 font-medium max-w-xl text-sm mt-1">
                            Real-time interactive resume engineering platform powered by Gemini AI. Optimize experience items instantly.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={loadDemo}
                            className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Load Demo Profile
                        </button>
                        <button 
                            onClick={handleReset}
                            className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
                        >
                            Clear Form
                        </button>
                        <button 
                            onClick={downloadPDF}
                            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg shadow-white/5"
                        >
                            <Download className="w-4 h-4" /> Export PDF
                        </button>
                    </div>
                </div>

                {/* Mobile Preview Toggle */}
                <div className="lg:hidden flex justify-center mb-6">
                    <button
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2"
                    >
                        {isPreviewMode ? <Sliders className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isPreviewMode ? "Edit Resume Fields" : "View Live Preview"}
                    </button>
                </div>

                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Form Builder */}
                    <div className={`lg:col-span-6 space-y-6 ${isPreviewMode ? 'hidden lg:block' : ''}`}>
                        
                        {/* Tab Switcher */}
                        <div className="flex flex-wrap gap-2 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                            {(['personal', 'summary', 'skills', 'experience', 'projects', 'education', 'achievements'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white text-black' 
                                            : 'opacity-50 hover:opacity-100 bg-white/5 text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Form Panel */}
                        <div className="p-8 rounded-[2.5rem] border bg-white/[0.02] border-white/10 backdrop-blur-xl min-h-[500px]">
                            
                            {/* Personal Details */}
                            {activeTab === 'personal' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <h3 className="text-xl font-black flex items-center gap-2 text-indigo-400">
                                        <User className="w-5 h-5" /> Personal Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Full Name</label>
                                            <input
                                                type="text"
                                                value={resumeData.personal.fullName}
                                                onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                                                placeholder="e.g. Alex Carter"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Professional Title</label>
                                            <input
                                                type="text"
                                                value={resumeData.personal.title}
                                                onChange={(e) => handlePersonalChange('title', e.target.value)}
                                                placeholder="e.g. Senior Software Architect"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Email Address</label>
                                            <input
                                                type="email"
                                                value={resumeData.personal.email}
                                                onChange={(e) => handlePersonalChange('email', e.target.value)}
                                                placeholder="e.g. alex@example.com"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Phone Number</label>
                                            <input
                                                type="text"
                                                value={resumeData.personal.phone}
                                                onChange={(e) => handlePersonalChange('phone', e.target.value)}
                                                placeholder="e.g. +1-555-019-2834"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Location</label>
                                            <input
                                                type="text"
                                                value={resumeData.personal.location}
                                                onChange={(e) => handlePersonalChange('location', e.target.value)}
                                                placeholder="e.g. San Francisco, CA"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Personal Website</label>
                                            <input
                                                type="text"
                                                value={resumeData.personal.website}
                                                onChange={(e) => handlePersonalChange('website', e.target.value)}
                                                placeholder="e.g. alexcarter.dev"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">LinkedIn Profile URL</label>
                                            <input
                                                type="text"
                                                value={resumeData.personal.linkedin}
                                                onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                                                placeholder="e.g. linkedin.com/in/alexcarter"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">GitHub Profile URL</label>
                                            <input
                                                type="text"
                                                value={resumeData.personal.github}
                                                onChange={(e) => handlePersonalChange('github', e.target.value)}
                                                placeholder="e.g. github.com/alexcarter"
                                                className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {activeTab === 'summary' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black flex items-center gap-2 text-indigo-400">
                                            <FileText className="w-5 h-5" /> Professional Summary
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleGenerateSummary}
                                            disabled={generatingSummary}
                                            className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                                        >
                                            {generatingSummary ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3.5 h-3.5" />
                                            )}
                                            {generatingSummary ? "Drafting..." : "AI Generate Summary"}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                            Summary Paragraph
                                        </label>
                                        <textarea
                                            value={resumeData.summary}
                                            onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                                            rows={6}
                                            placeholder="Write a highly compelling, professional introduction summarizing your core experience and skills. Or click 'AI Generate Summary' to draft it instantly!"
                                            className="w-full px-4 py-3 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors resize-none placeholder:opacity-30 leading-relaxed"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Categorized Skills */}
                            {activeTab === 'skills' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black flex items-center gap-2 text-indigo-400">
                                            <Code className="w-5 h-5" /> Technical Skills
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addSkillRow}
                                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Category
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                        {resumeData.skills.map((skill, idx) => (
                                            <div key={idx} className="flex gap-3 items-start bg-white/[0.01] border border-white/5 rounded-xl p-4 relative group">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                                                    <div className="md:col-span-4 space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Category</label>
                                                        <input
                                                            type="text"
                                                            value={skill.category}
                                                            onChange={(e) => handleSkillChange(idx, 'category', e.target.value)}
                                                            placeholder="e.g. Languages"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-8 space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Skills (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={skill.items}
                                                            onChange={(e) => handleSkillChange(idx, 'items', e.target.value)}
                                                            placeholder="e.g. TypeScript, Python, Go"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {resumeData.skills.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkillRow(idx)}
                                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors mt-5"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Work Experience */}
                            {activeTab === 'experience' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black flex items-center gap-2 text-indigo-400">
                                            <Briefcase className="w-5 h-5" /> Professional Experience
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addExperience}
                                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Job
                                        </button>
                                    </div>

                                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {resumeData.experience.map((exp, expIdx) => (
                                            <div key={expIdx} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4 relative">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded">
                                                        Position #{expIdx + 1}
                                                    </span>
                                                    {resumeData.experience.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExperience(expIdx)}
                                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Company Name</label>
                                                        <input
                                                            type="text"
                                                            value={exp.company}
                                                            onChange={(e) => handleExperienceChange(expIdx, 'company', e.target.value)}
                                                            placeholder="e.g. Apex Ledger Systems"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Job Position / Title</label>
                                                        <input
                                                            type="text"
                                                            value={exp.position}
                                                            onChange={(e) => handleExperienceChange(expIdx, 'position', e.target.value)}
                                                            placeholder="e.g. Senior Software Architect"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Company Website Link</label>
                                                        <input
                                                            type="text"
                                                            value={exp.link}
                                                            onChange={(e) => handleExperienceChange(expIdx, 'link', e.target.value)}
                                                            placeholder="e.g. apexledger.io"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Technology Stack</label>
                                                        <input
                                                            type="text"
                                                            value={exp.techStack}
                                                            onChange={(e) => handleExperienceChange(expIdx, 'techStack', e.target.value)}
                                                            placeholder="e.g. Next.js, FastAPI, AWS"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 md:col-span-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Employment Date (e.g. Jan 2024 - Present)</label>
                                                        <input
                                                            type="text"
                                                            value={exp.date}
                                                            onChange={(e) => handleExperienceChange(expIdx, 'date', e.target.value)}
                                                            placeholder="e.g. Jan 2024 - Present"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bullet Points */}
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Impact Bullet Points</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addExpBullet(expIdx)}
                                                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold tracking-widest text-indigo-300 flex items-center gap-1"
                                                        >
                                                            <Plus className="w-2.5 h-2.5" /> Bullet
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {exp.bullets.map((bullet, bulletIdx) => {
                                                            const isPolishing = polishingBulletKey === `exp-${expIdx}-${bulletIdx}`;
                                                            return (
                                                                <div key={bulletIdx} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        value={bullet}
                                                                        onChange={(e) => handleExpBulletChange(expIdx, bulletIdx, e.target.value)}
                                                                        placeholder="e.g. Spearheaded core redesign..."
                                                                        className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        title="AI Polish Bullet"
                                                                        onClick={() => handlePolishBullet('exp', expIdx, bulletIdx)}
                                                                        disabled={isPolishing}
                                                                        className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors border border-amber-500/20 flex-shrink-0"
                                                                    >
                                                                        {isPolishing ? (
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                        ) : (
                                                                            <Sparkles className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                    {exp.bullets.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeExpBullet(expIdx, bulletIdx)}
                                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {activeTab === 'projects' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black flex items-center gap-2 text-indigo-400">
                                            <FileSpreadsheet className="w-5 h-5" /> Personal Projects
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addProject}
                                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Project
                                        </button>
                                    </div>

                                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {resumeData.projects.map((proj, projIdx) => (
                                            <div key={projIdx} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4 relative">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded">
                                                        Project #{projIdx + 1}
                                                    </span>
                                                    {resumeData.projects.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProject(projIdx)}
                                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Project Title</label>
                                                        <input
                                                            type="text"
                                                            value={proj.title}
                                                            onChange={(e) => handleProjectChange(projIdx, 'title', e.target.value)}
                                                            placeholder="e.g. VaultShield Protocol"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Technology Stack</label>
                                                        <input
                                                            type="text"
                                                            value={proj.techStack}
                                                            onChange={(e) => handleProjectChange(projIdx, 'techStack', e.target.value)}
                                                            placeholder="e.g. Rust, WebAssembly, Supabase"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Project Live URL</label>
                                                        <input
                                                            type="text"
                                                            value={proj.link}
                                                            onChange={(e) => handleProjectChange(projIdx, 'link', e.target.value)}
                                                            placeholder="e.g. vaultshield.net"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">GitHub Code Link</label>
                                                        <input
                                                            type="text"
                                                            value={proj.github}
                                                            onChange={(e) => handleProjectChange(projIdx, 'github', e.target.value)}
                                                            placeholder="e.g. github.com/user/project"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 md:col-span-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Completion Date (e.g. Jul 2024)</label>
                                                        <input
                                                            type="text"
                                                            value={proj.date}
                                                            onChange={(e) => handleProjectChange(projIdx, 'date', e.target.value)}
                                                            placeholder="e.g. Jul 2024"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bullets */}
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Key Achievements Bullets</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addProjBullet(projIdx)}
                                                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold tracking-widest text-indigo-300 flex items-center gap-1"
                                                        >
                                                            <Plus className="w-2.5 h-2.5" /> Bullet
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {proj.bullets.map((bullet, bulletIdx) => {
                                                            const isPolishing = polishingBulletKey === `proj-${projIdx}-${bulletIdx}`;
                                                            return (
                                                                <div key={bulletIdx} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        value={bullet}
                                                                        onChange={(e) => handleProjBulletChange(projIdx, bulletIdx, e.target.value)}
                                                                        placeholder="e.g. Designed zero-knowledge Dokument..."
                                                                        className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        title="AI Polish Bullet"
                                                                        onClick={() => handlePolishBullet('proj', projIdx, bulletIdx)}
                                                                        disabled={isPolishing}
                                                                        className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors border border-amber-500/20 flex-shrink-0"
                                                                    >
                                                                        {isPolishing ? (
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                        ) : (
                                                                            <Sparkles className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                    {proj.bullets.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeProjBullet(projIdx, bulletIdx)}
                                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {activeTab === 'education' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black flex items-center gap-2 text-indigo-400">
                                            <GraduationCap className="w-5 h-5" /> Education history
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addEducation}
                                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Degree
                                        </button>
                                    </div>

                                    <div className="space-y-5 max-h-[385px] overflow-y-auto pr-2 custom-scrollbar">
                                        {resumeData.education.map((edu, idx) => (
                                            <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3 relative">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                        Degree #{idx + 1}
                                                    </span>
                                                    {resumeData.education.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEducation(idx)}
                                                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">School / University</label>
                                                        <input
                                                            type="text"
                                                            value={edu.school}
                                                            onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                                                            placeholder="e.g. Stanford University"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Degree & Field</label>
                                                        <input
                                                            type="text"
                                                            value={edu.degree}
                                                            onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                                            placeholder="e.g. M.S. Computer Science"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Attendance Dates</label>
                                                        <input
                                                            type="text"
                                                            value={edu.date}
                                                            onChange={(e) => handleEducationChange(idx, 'date', e.target.value)}
                                                            placeholder="e.g. 2019 - 2021"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">GPA / Grade Details</label>
                                                        <input
                                                            type="text"
                                                            value={edu.grade}
                                                            onChange={(e) => handleEducationChange(idx, 'grade', e.target.value)}
                                                            placeholder="e.g. GPA: 3.92 or CGPA: 9.09"
                                                            className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Achievements */}
                            {activeTab === 'achievements' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black flex items-center gap-2 text-indigo-400">
                                            <Award className="w-5 h-5" /> Key Achievements
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addAchievement}
                                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                        {resumeData.achievements.map((ach, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <span className="text-xs font-black opacity-30 w-6 text-center">#{idx + 1}</span>
                                                <input
                                                    type="text"
                                                    value={ach}
                                                    onChange={(e) => handleAchievementChange(idx, e.target.value)}
                                                    placeholder="e.g. Awarded Outstanding Developer of the Year..."
                                                    className="flex-1 px-3 py-2.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                                />
                                                {resumeData.achievements.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAchievement(idx)}
                                                        className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Column: Live Interactive Preview */}
                    <div className={`lg:col-span-6 flex flex-col ${!isPreviewMode ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-1.5 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between px-6 py-4 mb-4 backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Real-time preview panel
                            </span>
                            <span className="text-[9px] font-bold opacity-45 uppercase tracking-widest">Letter Format (1:1 Ratio)</span>
                        </div>

                        {/* Interactive Page Container */}
                        <div className="bg-white text-slate-800 p-10 shadow-2xl rounded-2xl aspect-[1/1.29] w-full max-w-[560px] mx-auto overflow-hidden text-[9px] leading-relaxed border border-slate-200 select-text relative flex flex-col justify-between">
                            
                            <div>
                                {/* Header Details */}
                                <div className="text-center border-b border-slate-100 pb-3 mb-3">
                                    <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                                        {resumeData.personal.fullName || "Your Full Name"}
                                    </h2>
                                    <h4 className="text-[8px] font-black uppercase tracking-[0.15em] text-indigo-600 mt-0.5">
                                        {resumeData.personal.title || "Target Job Position"}
                                    </h4>
                                    
                                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-medium text-slate-500 text-[7.5px] mt-2">
                                        {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
                                        {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
                                        {resumeData.personal.location && <span>{resumeData.personal.location}</span>}
                                        {resumeData.personal.website && <span className="text-indigo-600 font-bold">{resumeData.personal.website}</span>}
                                        {resumeData.personal.linkedin && <span className="text-indigo-600 font-bold">{resumeData.personal.linkedin}</span>}
                                        {resumeData.personal.github && <span className="text-indigo-600 font-bold">{resumeData.personal.github}</span>}
                                    </div>
                                </div>

                                {/* Summary */}
                                {resumeData.summary && (
                                    <div className="mb-3.5">
                                        <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                                            Professional Summary
                                        </div>
                                        <p className="text-slate-600 text-justify leading-relaxed">
                                            {resumeData.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                {resumeData.skills.some(s => s.category) && (
                                    <div className="mb-3.5">
                                        <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                                            Technical Skills
                                        </div>
                                        <div className="space-y-1 text-slate-600 font-medium">
                                            {resumeData.skills.map((skill, idx) => skill.category ? (
                                                <div key={idx} className="flex">
                                                    <span className="font-bold text-slate-800 w-24 flex-shrink-0">{skill.category}:</span>
                                                    <span>{skill.items}</span>
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}

                                {/* Experience */}
                                {resumeData.experience.some(e => e.company) && (
                                    <div className="mb-3.5">
                                        <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                                            Professional Experience
                                        </div>
                                        <div className="space-y-2.5">
                                            {resumeData.experience.map((exp, idx) => exp.company ? (
                                                <div key={idx} className="space-y-0.5">
                                                    <div className="flex justify-between font-bold text-slate-900 text-[8.5px]">
                                                        <div>{exp.position} @ {exp.company}</div>
                                                        <div className="text-slate-500 font-normal text-[7.5px]">{exp.date}</div>
                                                    </div>
                                                    <div className="flex justify-between text-slate-500 text-[7.5px] font-semibold">
                                                        <div>Tech Stack: <span className="text-indigo-600 font-bold">{exp.techStack}</span></div>
                                                        {exp.link && <div className="text-indigo-500">{exp.link}</div>}
                                                    </div>
                                                    <ul className="list-disc ml-3 text-slate-600 space-y-0.5 mt-1 font-medium">
                                                        {exp.bullets.map((b, bIdx) => b ? <li key={bIdx}>{b}</li> : null)}
                                                    </ul>
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}

                                {/* Projects */}
                                {resumeData.projects.some(p => p.title) && (
                                    <div className="mb-3.5">
                                        <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                                            Projects
                                        </div>
                                        <div className="space-y-2.5">
                                            {resumeData.projects.map((proj, idx) => proj.title ? (
                                                <div key={idx} className="space-y-0.5">
                                                    <div className="flex justify-between font-bold text-slate-900 text-[8.5px]">
                                                        <div>{proj.title}</div>
                                                        <div className="text-slate-500 font-normal text-[7.5px]">{proj.date}</div>
                                                    </div>
                                                    <div className="flex justify-between text-slate-500 text-[7.5px] font-semibold">
                                                        <div>Tech Stack: <span className="text-indigo-600 font-bold">{proj.techStack}</span></div>
                                                        <div className="flex gap-2 text-indigo-500">
                                                            {proj.link && <span>{proj.link}</span>}
                                                            {proj.github && <span>{proj.github}</span>}
                                                        </div>
                                                    </div>
                                                    <ul className="list-disc ml-3 text-slate-600 space-y-0.5 mt-1 font-medium">
                                                        {proj.bullets.map((b, bIdx) => b ? <li key={bIdx}>{b}</li> : null)}
                                                    </ul>
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {resumeData.education.some(edu => edu.school) && (
                                    <div className="mb-3.5">
                                        <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                                            Education
                                        </div>
                                        <div className="space-y-1.5">
                                            {resumeData.education.map((edu, idx) => edu.school ? (
                                                <div key={idx} className="space-y-0.5">
                                                    <div className="flex justify-between font-bold text-slate-900">
                                                        <div>{edu.degree}</div>
                                                        <div className="text-slate-500 font-normal text-[7.5px]">{edu.date}</div>
                                                    </div>
                                                    <div className="flex justify-between text-slate-500 text-[7.5px] font-semibold">
                                                        <div>{edu.school}</div>
                                                        <div>{edu.grade}</div>
                                                    </div>
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}

                                {/* Achievements */}
                                {resumeData.achievements.some(a => a) && (
                                    <div>
                                        <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                                            Key Achievements
                                        </div>
                                        <ul className="list-disc ml-3 text-slate-600 space-y-0.5 font-medium">
                                            {resumeData.achievements.map((a, idx) => a ? <li key={idx}>{a}</li> : null)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
