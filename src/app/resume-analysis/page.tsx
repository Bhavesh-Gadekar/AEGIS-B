"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
    ArrowLeft, 
    Upload, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Trash2, 
    Briefcase, 
    ChevronRight,
    TrendingUp,
    Bookmark,
    Eye,
    PlusCircle
} from 'lucide-react';
import { 
    uploadAndAnalyzeResume, 
    getPastResumes, 
    deleteResume 
} from '@/actions/resume';
import { toast } from 'sonner';

const Antigravity = dynamic(() => import('../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function ResumeAnalysisPage() {
    const router = useRouter();
    const [isDark] = useState(true); // Matches page theme
    const [file, setFile] = useState<File | null>(null);
    const [targetJob, setTargetJob] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [progressStep, setProgressStep] = useState(0);
    const [activeAnalysis, setActiveAnalysis] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const steps = [
        "Uploading PDF secure document...",
        "Validating structural file integrity...",
        "Deploying Gemini Deep Intelligence...",
        "Compiling keyword optimization matrix...",
        "Generating professional roadmap..."
    ];

    // Fetch past resumes on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoadingHistory(true);
        const res = await getPastResumes();
        if (res.success && res.data) {
            setHistory(res.data);
        } else if (res.error) {
            toast.error(`History error: ${res.error}`);
        }
        setLoadingHistory(false);
    };

    // Auto animate steps when analyzing
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (analyzing) {
            setProgressStep(0);
            interval = setInterval(() => {
                setProgressStep((prev) => {
                    if (prev < steps.length - 1) return prev + 1;
                    return prev;
                });
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [analyzing]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
                toast.success(`Selected: ${droppedFile.name}`);
            } else {
                toast.error("Please upload a PDF file only.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile);
                toast.success(`Selected: ${selectedFile.name}`);
            } else {
                toast.error("Please upload a PDF file only.");
            }
        }
    };

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a PDF resume to analyze.");
            return;
        }

        setAnalyzing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('targetJob', targetJob || 'Software Engineer');

        const result = await uploadAndAnalyzeResume(formData);

        setAnalyzing(false);
        if (result.success && result.data) {
            setActiveAnalysis({
                ...result.data,
                title: file.name,
                file_url: result.record?.file_url,
                created_at: new Date().toISOString()
            });
            toast.success("AI analysis completed successfully!");
            loadHistory();
        } else {
            toast.error(result.error || "Analysis failed. Please try again.");
        }
    };

    const handleDelete = async (id: string, fileUrl: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this resume analysis? This will remove the file from storage too.")) {
            return;
        }

        const res = await deleteResume(id, fileUrl);
        if (res.success) {
            toast.success("Resume analysis deleted.");
            if (activeAnalysis && activeAnalysis.id === id) {
                setActiveAnalysis(null);
            }
            loadHistory();
        } else {
            toast.error(res.error || "Failed to delete.");
        }
    };

    const selectFromHistory = (item: any) => {
        setActiveAnalysis({
            ...item.parsed_content,
            id: item.id,
            title: item.title,
            file_url: item.file_url,
            created_at: item.created_at
        });
    };

    // A lightweight parser to display basic Markdown in recommendations
    const renderMarkdown = (text: string) => {
        if (!text) return "";
        
        // Escape HTML
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Convert bold (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert simple lists (- item or * item)
        html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-4 list-disc opacity-90 my-1 font-medium text-sm">$1</li>');

        // Wrap sets of <li> elements inside <ul> if there are any
        // (This is simple regex but good enough for the structured bullets returned by Gemini)
        
        // Headers (### Header)
        html = html.replace(/^\s*###\s+(.*)$/gm, '<h5 class="text-base font-black uppercase tracking-widest text-indigo-400 mt-6 mb-2">$1</h5>');
        html = html.replace(/^\s*##\s+(.*)$/gm, '<h4 class="text-lg font-black tracking-tight text-white mt-8 mb-3 border-b border-white/10 pb-1">$1</h4>');

        // Paragraph linebreaks
        html = html.replace(/\n/g, '<br />');

        return <div dangerouslySetInnerHTML={{ __html: html }} className="space-y-2 text-sm leading-relaxed opacity-85" />;
    };

    // Color theme helper based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' };
        if (score >= 60) return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' };
        return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20' };
    };

    return (
        <div className={`min-h-screen relative transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={35}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
                <div className="absolute top-0 right-0 w-[45%] h-[45%] bg-indigo-500/10 blur-[130px] rounded-full opacity-35 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-purple-500/5 blur-[150px] rounded-full opacity-20 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                    <div>
                        <button
                            onClick={() => router.push('/?tab=profile')}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 transition-all bg-white/5 hover:bg-white/10 text-white border border-white/5"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Profile
                        </button>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-3">
                            Resume Intelligence
                        </h1>
                        <p className="opacity-60 font-medium max-w-xl text-sm">
                            Powered by Gemini 1.5 Deep Vision. Store resumes securely in Supabase and run real-time audits for ATS compatibility.
                        </p>
                    </div>

                    {activeAnalysis && (
                        <button
                            onClick={() => {
                                setActiveAnalysis(null);
                                setFile(null);
                            }}
                            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-white text-black hover:bg-indigo-50 flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" /> Analyze Another
                        </button>
                    )}
                </div>

                {/* Main Content Layout */}
                {analyzing ? (
                    /* Loading State */
                    <div className="flex flex-col items-center justify-center py-24 min-h-[500px] text-center bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 backdrop-blur-md">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse" />
                            <Loader2 className="w-20 h-20 animate-spin text-indigo-500 relative z-10" />
                        </div>
                        <h3 className="text-3xl font-black mb-3 tracking-tight animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                            Gemini is Auditing...
                        </h3>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 max-w-md">
                            {steps[progressStep]}
                        </p>

                        {/* Progress bar */}
                        <div className="w-full max-w-md bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="bg-indigo-500 h-full transition-all duration-1000 ease-out" 
                                style={{ width: `${((progressStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between w-full max-w-md mt-2 text-[10px] uppercase font-bold tracking-widest opacity-40">
                            <span>Upload</span>
                            <span>Parsing</span>
                            <span>Deep Scan</span>
                            <span>Scoring</span>
                        </div>
                    </div>
                ) : !activeAnalysis ? (
                    /* Dashboard Grid: File Upload + History */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left column: Upload form */}
                        <div className="lg:col-span-7 space-y-6">
                            <form 
                                onSubmit={handleAnalyze} 
                                className="p-8 md:p-10 rounded-[2.5rem] border bg-white/[0.02] border-white/10 backdrop-blur-xl space-y-6 flex flex-col justify-between"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2">New Resume Audit</h2>
                                    <p className="text-xs opacity-50 font-medium mb-6">
                                        Upload your latest PDF and detail your targeted professional role.
                                    </p>

                                    {/* Targeted Job Input */}
                                    <div className="space-y-2 mb-6">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5" /> Target Professional Post
                                        </label>
                                        <input
                                            type="text"
                                            value={targetJob}
                                            onChange={(e) => setTargetJob(e.target.value)}
                                            placeholder="e.g. Senior Full Stack Developer, ML Engineer, Product Manager"
                                            className="w-full px-5 py-4 rounded-xl text-sm font-bold bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-colors placeholder:opacity-30"
                                            required
                                        />
                                    </div>

                                    {/* Drag & Drop Zone */}
                                    <div 
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-10 rounded-[2rem] border border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                                            dragActive 
                                                ? 'bg-indigo-500/10 border-indigo-500' 
                                                : file 
                                                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                                                    : 'bg-white/[0.01] border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        {file ? (
                                            <>
                                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </div>
                                                <h4 className="text-sm font-black max-w-xs truncate">{file.name}</h4>
                                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-1">
                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Loaded
                                                </p>
                                                <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 hover:underline mt-4">
                                                    Click to change file
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <h4 className="text-base font-black mb-1">Upload Resume PDF</h4>
                                                <p className="text-xs opacity-50 max-w-xs mx-auto">
                                                    Drag & drop your file here, or click to browse. Max file size: 10MB.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!file}
                                    className={`w-full py-4 mt-8 rounded-xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95 shadow-xl ${
                                        file 
                                            ? 'bg-white text-black hover:bg-indigo-50 cursor-pointer shadow-indigo-500/5' 
                                            : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                                    }`}
                                >
                                    Initialize AI Intelligence Scan
                                </button>
                            </form>
                        </div>

                        {/* Right column: Audit History */}
                        <div className="lg:col-span-5 flex flex-col">
                            <div className="p-8 md:p-10 rounded-[2.5rem] border bg-white/[0.02] border-white/10 backdrop-blur-xl flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Bookmark className="w-5 h-5 text-indigo-400" /> Audit History
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                        {history.length} Saved
                                    </span>
                                </div>

                                {loadingHistory ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 opacity-60" />
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                        <FileText className="w-12 h-12 opacity-10 mb-4" />
                                        <p className="text-xs font-bold opacity-30 uppercase tracking-widest">No audits processed yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-2 custom-scrollbar">
                                        {history.map((item) => {
                                            const scoreDetails = getScoreColor(item.ats_score);
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => selectFromHistory(item)}
                                                    className="p-4 rounded-2xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black border text-sm ${scoreDetails.text} ${scoreDetails.border} ${scoreDetails.bg} ${scoreDetails.glow} shadow-sm flex-shrink-0`}>
                                                            {item.ats_score}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <h4 className="text-xs font-black truncate max-w-[180px] group-hover:text-indigo-400 transition-colors">
                                                                {item.title}
                                                            </h4>
                                                            <p className="text-[9px] uppercase tracking-widest font-black opacity-40 flex items-center gap-1.5 mt-0.5">
                                                                <span>Score</span>
                                                                <span>•</span>
                                                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            title="View Analysis"
                                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            title="Delete"
                                                            onClick={(e) => handleDelete(item.id, item.file_url, e)}
                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                ) : (
                    /* Detailed Analysis Display */
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        {/* Quick metrics banner */}
                        <div className={`p-8 rounded-[2rem] border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl ${getScoreColor(activeAnalysis.score).bg} ${getScoreColor(activeAnalysis.score).border}`}>
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <TrendingUp className="w-40 h-40" />
                            </div>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`w-24 h-24 rounded-[1.5rem] flex flex-col items-center justify-center font-black border text-3xl md:text-4xl shadow-xl ${getScoreColor(activeAnalysis.score).text} ${getScoreColor(activeAnalysis.score).border} bg-black/40`}>
                                    {activeAnalysis.score}
                                    <span className="text-[9px] uppercase tracking-widest font-black opacity-50 -mt-1">ATS Score</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                        Audit Complete
                                    </span>
                                    <h3 className="text-2xl font-black mt-2 truncate max-w-md">{activeAnalysis.title}</h3>
                                    <p className="text-xs font-semibold opacity-60">
                                        Analyzed on {new Date(activeAnalysis.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                {activeAnalysis.file_url && (
                                    <a
                                        href={activeAnalysis.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center gap-2"
                                    >
                                        View PDF File
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Main Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Identified Strengths & Weaknesses (Left Column) */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Strengths */}
                                <div className="p-8 rounded-[2.5rem] border bg-white/[0.02] border-white/10 backdrop-blur-xl">
                                    <h3 className="text-lg font-black tracking-tight text-emerald-400 mb-6 flex items-center gap-2.5">
                                        <CheckCircle2 className="w-5 h-5" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-4">
                                        {activeAnalysis.strengths?.map((strength: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                                                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="text-xs font-bold leading-relaxed opacity-85">{strength}</span>
                                            </li>
                                        ))}
                                        {(!activeAnalysis.strengths || activeAnalysis.strengths.length === 0) && (
                                            <p className="text-xs opacity-40">No major strengths identified.</p>
                                        )}
                                    </ul>
                                </div>

                                {/* Areas for Improvement */}
                                <div className="p-8 rounded-[2.5rem] border bg-white/[0.02] border-white/10 backdrop-blur-xl">
                                    <h3 className="text-lg font-black tracking-tight text-amber-400 mb-6 flex items-center gap-2.5">
                                        <AlertCircle className="w-5 h-5" /> Recommended Improvements
                                    </h3>
                                    <ul className="space-y-4">
                                        {activeAnalysis.improvements?.map((imp: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                                                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="text-xs font-bold leading-relaxed opacity-85">{imp}</span>
                                            </li>
                                        ))}
                                        {(!activeAnalysis.improvements || activeAnalysis.improvements.length === 0) && (
                                            <p className="text-xs opacity-40">No critical improvements needed.</p>
                                        )}
                                    </ul>
                                </div>

                                {/* What is Missing */}
                                <div className="p-8 rounded-[2.5rem] border bg-white/[0.02] border-white/10 backdrop-blur-xl">
                                    <h3 className="text-lg font-black tracking-tight text-rose-400 mb-6 flex items-center gap-2.5">
                                        <AlertCircle className="w-5 h-5" /> What is Missing
                                    </h3>
                                    <ul className="space-y-4">
                                        {activeAnalysis.missing?.map((missingItem: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                                                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="text-xs font-bold leading-relaxed opacity-85">{missingItem}</span>
                                            </li>
                                        ))}
                                        {(!activeAnalysis.missing || activeAnalysis.missing.length === 0) && (
                                            <p className="text-xs opacity-40">No missing details identified for this target job post.</p>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Tailored suggestions and Action Roadmap (Right Column) */}
                            <div className="lg:col-span-7">
                                <div className="p-8 md:p-10 rounded-[2.5rem] border bg-white/[0.02] border-white/10 backdrop-blur-xl h-full space-y-6">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-indigo-400 flex items-center gap-2">
                                            Tailored AI Recommendations
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                                            Roadmap & Optimization guidelines
                                        </p>
                                    </div>
                                    <div className="border-t border-white/10 pt-6">
                                        {renderMarkdown(activeAnalysis.detailedSuggestions)}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
