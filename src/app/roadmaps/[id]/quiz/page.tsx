"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Brain, ArrowLeft, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../../../../components/AppProvider';
import { getRoadmapById } from '@/actions/roadmaps';
import { PREDEFINED_ROADMAPS, GENERIC_PREDEFINED_QUIZ } from '@/data/roadmapData';
import { toast } from 'sonner';

export default function RoadmapQuizPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { isDark } = useAppContext();

    const [roadmap, setRoadmap] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Fetch original roadmap data
    useEffect(() => {
        const fetchRoadmap = async () => {
            let data: any = PREDEFINED_ROADMAPS.find(r => r.id === id || r.id.toString() === id);
            if (!data) {
                const dbData = await getRoadmapById(id);
                if (dbData) data = dbData;
            }
            if (data) {
                setRoadmap(data);
                if (data.quiz_data && Array.isArray(data.quiz_data) && data.quiz_data.length > 0) {
                    setQuestions(data.quiz_data);
                } else {
                    setQuestions(GENERIC_PREDEFINED_QUIZ);
                }
                setLoading(false);
            } else {
                toast.error("Roadmap not found");
                router.push('/roadmaps');
            }
        };
        fetchRoadmap();
    }, [id]);

    const handleOptionSelect = (index: number) => {
        if (showResult) return;
        setSelectedOption(index);
        setShowResult(true);

        const currentQ = questions[currentIndex];
        if (index === currentQ.correctIndex) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
                setShowResult(false);
            } else {
                setIsFinished(true);
            }
        }, 2000); // 2 second delay before next question
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center font-black uppercase italic tracking-[0.4em] transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
                <Brain className="w-12 h-12 mb-6 animate-bounce text-indigo-500" />
                Loading...
            </div>
        );
    }

    if (isFinished) {
        const accuracy = Math.round((score / questions.length) * 100);
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
                <div className={`max-w-xl w-full p-12 text-center rounded-[3rem] border transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-2xl'}`}>
                    <Trophy className="w-24 h-24 mx-auto mb-8 text-amber-500" />
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tight">{roadmap?.title} Mastery</h1>
                    <p className="text-lg opacity-60 font-medium mb-10">You've completed the individual roadmap quiz!</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Score</p>
                            <p className="text-3xl font-black">{score}/{questions.length}</p>
                        </div>
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Accuracy</p>
                            <p className="text-3xl font-black">{accuracy}%</p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`/roadmaps/${id}`)}
                        className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-transform active:scale-95 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                        Return to Roadmap
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className={`min-h-screen p-6 md:p-12 transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            <div className="max-w-3xl mx-auto flex flex-col h-full">
                <button
                    onClick={() => router.push(`/roadmaps/${id}`)}
                    className={`self-start flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-12 transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
                >
                    <ArrowLeft className="w-4 h-4" /> Cancel Quiz
                </button>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className={`inline-flex px-3 py-1 mb-4 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                            {roadmap?.field}
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">{roadmap?.title} Quiz</h2>
                    </div>
                    <div className="text-sm font-black italic opacity-40">
                        {currentIndex + 1} / {questions.length}
                    </div>
                </div>

                <div className={`p-8 md:p-12 rounded-[3rem] border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-xl'}`}>
                    <h3 className="text-xl md:text-2xl font-black mb-10 leading-relaxed">
                        {currentQ?.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQ?.options?.map((option: string, index: number) => {
                            const isSelected = selectedOption === index;
                            const isCorrectOption = index === currentQ.correctIndex;
                            const showCorrect = showResult && isCorrectOption;
                            const showWrong = showResult && isSelected && !isCorrectOption;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={showResult}
                                    className={`p-5 rounded-2xl text-left border-2 font-medium transition-all group flex items-start gap-4 
                                    ${showCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' :
                                      showWrong ? 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400' :
                                      isSelected ? 'border-black dark:border-white' :
                                      `${isDark ? 'border-white/10 hover:border-white/30' : 'border-black/5 hover:border-black/20'}`}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-black border transition-colors 
                                    ${showCorrect ? 'bg-emerald-500 text-white border-emerald-500' :
                                      showWrong ? 'bg-red-500 text-white border-red-500' :
                                      isSelected ? `${isDark ? 'bg-white text-black' : 'bg-black text-white'}` :
                                      `${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}`}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="pt-1.5">{option}</span>

                                    {showCorrect && <CheckCircle className="w-6 h-6 ml-auto mt-1 flex-shrink-0" />}
                                    {showWrong && <XCircle className="w-6 h-6 ml-auto mt-1 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
