import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import Loader3D from './Loader3D';

interface DojoCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
}

interface DesignDojoProps {
    onBack: () => void;
    onSelectCategory: (categoryId: string) => void;
}

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export const DesignDojo: React.FC<DesignDojoProps> = ({ onBack, onSelectCategory }) => {
    const categories: DojoCategory[] = [
        {
            id: 'fundamentals',
            title: 'Fundamentals',
            description: 'Typography, color theory, and whitespace.',
            icon: 'auto_awesome',
            color: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            id: 'graphic_design',
            title: 'Graphic Design',
            description: 'Composition, branding, and color storytelling.',
            icon: 'edit',
            color: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            id: 'fintech',
            title: 'Fintech Products',
            description: 'Trust signals, data density, and risk states.',
            icon: 'account_balance',
            color: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            id: 'data_viz',
            title: 'Data Visualization',
            description: 'Complex layouts and charting.',
            icon: 'grid_view',
            color: 'text-pink-500',
            bgColor: 'bg-pink-50 dark:bg-pink-900/20'
        },
        {
            id: 'mobile',
            title: 'Mobile Design',
            description: 'iOS and Android patterns.',
            icon: 'smartphone',
            color: 'text-orange-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        },
        {
            id: 'saas',
            title: 'SaaS Marketing',
            description: 'Conversion focused web design.',
            icon: 'campaign',
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
        }
    ];

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [config, setConfig] = useState({ level: 'Intermediate', type: 'Zen', questions: 10 });
    const [quizMode, setQuizMode] = useState<'setup' | 'loading' | 'active' | 'result'>('setup');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

    // Blitz mode timer state
    const [timeLeft, setTimeLeft] = useState<number>(15); // 15 seconds per question in Blitz mode
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Load quiz history from localStorage
    const loadQuizHistory = () => {
        try {
            const history = localStorage.getItem('designDojoHistory');
            return history ? JSON.parse(history) : [];
        } catch {
            return [];
        }
    };

    // Save quiz result to localStorage
    const saveQuizResult = (category: string, level: string, score: number, total: number) => {
        try {
            const history = loadQuizHistory();
            const result = {
                category,
                level,
                score,
                total,
                percentage: Math.round((score / total) * 100),
                date: new Date().toISOString()
            };
            history.unshift(result); // Add to beginning
            // Keep only last 50 results
            const trimmedHistory = history.slice(0, 50);
            localStorage.setItem('designDojoHistory', JSON.stringify(trimmedHistory));
        } catch (e) {
            console.error('Failed to save quiz history:', e);
        }
    };

    const handleCategorySelect = (id: string) => {
        setActiveCategory(id);
        setQuizMode('setup');
        if (onSelectCategory) onSelectCategory(id);
    };

    // Clear timer on unmount or when leaving quiz
    React.useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Blitz mode timer effect
    React.useEffect(() => {
        // Only run timer in Blitz mode during active quiz
        if (config.type === 'Blitz' && quizMode === 'active' && selectedOption === null) {
            // Reset timer for new question
            setTimeLeft(15);

            // Start countdown
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time's up! Auto-advance to next question
                        if (timerRef.current) clearInterval(timerRef.current);
                        // Mark as incorrect (no answer selected)
                        setTimeout(() => nextQuestion(), 100);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // Cleanup timer when question is answered or mode changes
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [config.type, quizMode, currentIndex, selectedOption]);

    const startSession = async () => {
        if (!activeCategory) return;

        // CRITICAL: Reset ALL state before starting to prevent auto-answer bug
        setSelectedOption(null);
        setShowExplanation(false);
        setCurrentIndex(0);
        setScore(0);

        setQuizMode('loading');

        try {
            const categoryTitle = categories.find(c => c.id === activeCategory)?.title || 'Design';
            console.log(`🎯 Starting quiz: ${categoryTitle}, ${config.level}, ${config.type}, ${config.questions} questions`);

            // Generate quiz with exact count requested
            let generatedQuestions = await generateQuiz(categoryTitle, config.level, config.type, config.questions);

            // Safety check: ensure we have questions
            if (!generatedQuestions || generatedQuestions.length === 0) {
                console.warn("API returned empty, using fallback.");
                generatedQuestions = [
                    {
                        id: 'fallback-1',
                        question: 'Which principle establishes the importance of elements within a design?',
                        options: ['Visual Hierarchy', 'Color Theory', 'Grid Systems', 'Typography'],
                        correctIndex: 0,
                        explanation: 'Visual hierarchy guides the user\'s eye to the most important information first using size, color, and layout.'
                    },
                    {
                        id: 'fallback-2',
                        question: 'What is the optimal line length for readability?',
                        options: ['100-120 chars', '45-75 chars', '20-40 chars', '150+ chars'],
                        correctIndex: 1,
                        explanation: '45-75 characters per line ensures comfortable reading without causing eye fatigue.'
                    },
                    {
                        id: 'fallback-3',
                        question: 'What is the recommended minimum touch target size for mobile?',
                        options: ['32x32 px', '44x44 px', '56x56 px', '64x64 px'],
                        correctIndex: 1,
                        explanation: 'Apple and Google both recommend minimum 44x44 px touch targets for accessibility.'
                    }
                ];
            }

            console.log(`📊 Received ${generatedQuestions.length} questions from API`);

            // DON'T filter by used IDs on first load - only filter on replay if needed
            // This was causing the "only 3 questions" bug
            let finalQuestions = generatedQuestions;

            // Only filter if we have enough questions and user is replaying
            if (usedQuestionIds.size > 0 && generatedQuestions.length > config.questions) {
                const unusedQuestions = generatedQuestions.filter(q => !usedQuestionIds.has(q.id));
                if (unusedQuestions.length >= config.questions) {
                    finalQuestions = unusedQuestions;
                    console.log(`🔄 Filtered to ${unusedQuestions.length} unused questions`);
                }
            }

            // Ensure we have exactly the requested number
            finalQuestions = finalQuestions.slice(0, config.questions);

            // Track used question IDs for future replays
            const newUsedIds = new Set(usedQuestionIds);
            finalQuestions.forEach(q => newUsedIds.add(q.id));
            setUsedQuestionIds(newUsedIds);

            console.log(`✅ Final: ${finalQuestions.length} questions (requested: ${config.questions})`);

            setQuestions(finalQuestions);
            setQuizMode('active');
        } catch (e) {
            console.error("Session start error:", e);
            // Even on error, show fallback with exact count
            const fallbackQuestions = [
                {
                    id: 'err-1',
                    question: 'Select the correct Primary Color logic:',
                    options: ['60%', '30%', '10%', '100%'],
                    correctIndex: 0,
                    explanation: 'The 60-30-10 rule suggests using your primary color for 60% of the UI area.'
                },
                {
                    id: 'err-2',
                    question: 'What does WCAG stand for?',
                    options: ['Web Content Accessibility Guidelines', 'World Color Association Group', 'Web Component API Guide', 'Website Code Analysis Guide'],
                    correctIndex: 0,
                    explanation: 'WCAG provides guidelines for making web content accessible to people with disabilities.'
                },
                {
                    id: 'err-3',
                    question: 'What is the ideal contrast ratio for normal text?',
                    options: ['3:1', '4.5:1', '7:1', '10:1'],
                    correctIndex: 1,
                    explanation: 'WCAG AA requires 4.5:1 contrast ratio for normal text.'
                }
            ];
            setQuestions(fallbackQuestions.slice(0, config.questions));
            setQuizMode('active');
        }
    };

    const handleOptionClick = (index: number) => {
        if (selectedOption !== null) return; // Prevent changing answer

        // Stop timer if in Blitz mode
        if (config.type === 'Blitz' && timerRef.current) {
            clearInterval(timerRef.current);
        }

        setSelectedOption(index);
        setShowExplanation(true);
        if (index === questions[currentIndex].correctIndex) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            // Reset state BEFORE moving to next question to prevent auto-answer bug
            setSelectedOption(null);
            setShowExplanation(false);
            // Use setTimeout to ensure state is cleared before index changes
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 50);
        } else {
            // Save quiz result before showing results
            const categoryTitle = categories.find(c => c.id === activeCategory)?.title || 'Unknown';
            saveQuizResult(categoryTitle, config.level, score, questions.length);
            setQuizMode('result');
        }
    };

    const replayQuiz = () => {
        // Reset to setup to allow reconfiguration
        setQuizMode('setup');
        setSelectedOption(null);
        setShowExplanation(false);
        setCurrentIndex(0);
        setScore(0);
        // Don't reset usedQuestionIds - this prevents repetition
    };

    if (activeCategory) {
        const category = categories.find(c => c.id === activeCategory);

        if (quizMode === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in relative z-10">
                    <Loader3D />
                    <h2 className="text-2xl font-medium text-slate-900 dark:text-white mb-2 mt-8">Generating Challenge...</h2>
                    <p className="text-slate-400">Refyna is crafting a custom {config.level} session.</p>
                </div>
            );
        }

        if (quizMode === 'result') {
            const percentage = Math.round((score / questions.length) * 100);
            const isPerfect = percentage === 100;
            const isGood = percentage >= 70;

            return (
                <div className="min-h-screen flex items-center justify-center px-4 py-8 relative z-10">
                    <div className="w-full max-w-md">
                        {/* Score Display */}
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 mb-4">
                            <div className="text-sm font-mono uppercase tracking-widest mb-2 opacity-60">
                                Final Score
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-7xl font-black">{score}</span>
                                <span className="text-3xl font-bold opacity-40">/ {questions.length}</span>
                            </div>
                            <div className="mt-4 h-2 bg-white/20 dark:bg-slate-900/20">
                                <div
                                    className="h-full bg-white dark:bg-slate-900 transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Category Info */}
                        <div className="bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-white p-6 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    {category?.title}
                                </span>
                                <span className="font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    {config.level}
                                </span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {isPerfect ? '🎯 Perfect Score!' : isGood ? '💪 Well Done!' : '📚 Keep Learning!'}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={replayQuiz}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-5 font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors border-2 border-slate-900 dark:border-white"
                            >
                                REPLAY QUIZ →
                            </button>
                            <button
                                onClick={() => { setQuizMode('setup'); setActiveCategory(null); }}
                                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-5 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-900 dark:border-white"
                            >
                                Return to Hub
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (quizMode === 'active') {
            // Use fallback if questions empty (shouldn't happen with updated logic but good for safety)
            const safeQuestions = questions.length > 0 ? questions : [{
                id: 'backup', question: 'Ready?', options: ['Yes'], correctIndex: 0, explanation: ''
            }];
            const question = safeQuestions[currentIndex] || safeQuestions[0];

            return (
                <div className="min-h-screen flex items-center justify-center px-4 py-4 md:py-12 pb-20 md:pb-12 relative z-10">
                    <div className="w-full max-w-2xl">
                        {/* Brutalist Header */}
                        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
                            <button
                                onClick={() => setQuizMode('setup')}
                                className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-lg md:text-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex-shrink-0"
                            >
                                ✕
                            </button>

                            {/* Timer for Blitz Mode */}
                            {config.type === 'Blitz' && (
                                <div className={`px-3 py-2 md:px-6 md:py-3 font-mono text-lg md:text-2xl font-black border-2 md:border-4 ${timeLeft > 10
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
                                    : timeLeft > 5
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-400'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400 animate-pulse'
                                    }`}>
                                    ⏱ {timeLeft}s
                                </div>
                            )}

                            <div className="font-mono text-xs md:text-sm font-bold">
                                <span className="text-slate-900 dark:text-white">{currentIndex + 1}</span>
                                <span className="text-slate-400 dark:text-slate-500"> / {safeQuestions.length}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 md:h-3 bg-slate-200 dark:bg-slate-700 mb-4 md:mb-8">
                            <div
                                className="h-full bg-slate-900 dark:bg-white transition-all duration-500"
                                style={{ width: `${((currentIndex + 1) / safeQuestions.length) * 100}%` }}
                            />
                        </div>

                        {/* Question Block */}
                        <div className="bg-white dark:bg-slate-800 border-2 md:border-4 border-slate-900 dark:border-white p-4 md:p-8 mb-4 md:mb-6">
                            <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3 md:mb-4">
                                {category?.title} — {config.level}
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                {question.question}
                            </h2>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 mb-6">
                            {question.options.map((option, idx) => {
                                const isSelected = selectedOption === idx;
                                const isCorrect = idx === question.correctIndex;
                                const showResult = selectedOption !== null;

                                let bgClass = "bg-white dark:bg-slate-800";
                                let borderClass = "border-slate-300 dark:border-slate-600";
                                let textClass = "text-slate-900 dark:text-white";

                                if (showResult) {
                                    if (isCorrect) {
                                        bgClass = "bg-slate-900 dark:bg-white";
                                        borderClass = "border-slate-900 dark:border-white";
                                        textClass = "text-white dark:text-slate-900";
                                    } else if (isSelected) {
                                        bgClass = "bg-red-100 dark:bg-red-900/30";
                                        borderClass = "border-red-500 dark:border-red-400";
                                        textClass = "text-red-900 dark:text-red-100";
                                    } else {
                                        bgClass = "bg-slate-100 dark:bg-slate-700/30";
                                        borderClass = "border-slate-200 dark:border-slate-700";
                                        textClass = "text-slate-400 dark:text-slate-500";
                                    }
                                }

                                return (
                                    <button
                                        key={`option-${idx}-${currentIndex}`}
                                        onClick={() => handleOptionClick(idx)}
                                        disabled={showResult}
                                        className={`w-full text-left p-3 md:p-5 border-2 transition-all duration-200 flex items-center gap-3 md:gap-4 min-h-[44px] ${bgClass} ${borderClass} ${!showResult ? 'hover:border-slate-900 dark:hover:border-white cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
                                    >
                                        <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 font-black text-lg border-2 ${showResult && isCorrect
                                            ? 'border-white dark:border-slate-900 text-white dark:text-slate-900'
                                            : 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`flex-1 font-bold ${textClass}`}>
                                            {option}
                                        </span>
                                        {showResult && isCorrect && (
                                            <span className="text-2xl">✓</span>
                                        )}
                                        {showResult && isSelected && !isCorrect && (
                                            <span className="text-2xl">✗</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        {showExplanation && (
                            <div className="bg-slate-900 dark:bg-white p-6 border-4 border-slate-900 dark:border-white animate-fade-in">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="font-mono text-xs uppercase tracking-widest text-white/60 dark:text-slate-900/60 mb-3">
                                            Why?
                                        </div>
                                        <p className="text-white dark:text-slate-900 font-medium leading-relaxed">
                                            {question.explanation}
                                        </p>
                                    </div>
                                    <button
                                        onClick={nextQuestion}
                                        className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black hover:scale-105 transition-transform whitespace-nowrap"
                                    >
                                        {currentIndex === safeQuestions.length - 1 ? 'FINISH →' : 'NEXT →'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return (
            <div className="max-w-5xl mx-auto pt-16 px-6 pb-16 relative z-10 animate-fade-in">

                {/* Back Button */}
                <button
                    onClick={() => setActiveCategory(null)}
                    className="mb-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all text-sm font-semibold"
                >
                    <span className="material-icons-round text-base">arrow_back</span>
                    Back to Categories
                </button>

                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left: Title & Description */}
                    <div className="lg:sticky lg:top-24">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${category?.bgColor} mb-6 shadow-sm`}>
                            <span className={`material-icons-round text-3xl ${category?.color}`}>{category?.icon}</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                            {category?.title}
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                            {category?.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="material-icons-round text-base">auto_awesome</span>
                            <span>AI-generated questions tailored to your level</span>
                        </div>
                    </div>

                    {/* Right: Configuration */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 lg:p-10 border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm">

                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Configure Session</h2>

                        {/* Mastery Level */}
                        <div className="mb-8">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                                Skill Level
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Beginner', 'Intermediate', 'Expert'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setConfig({ ...config, level })}
                                        className={`py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${config.level === level
                                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg scale-105'
                                            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50 border border-slate-200 dark:border-slate-600'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Session Type */}
                        <div className="mb-8">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                                Session Mode
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfig({ ...config, type: 'Blitz' })}
                                    className={`py-4 px-5 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center gap-2 ${config.type === 'Blitz'
                                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50 border border-slate-200 dark:border-slate-600'
                                        }`}
                                >
                                    <span className="material-icons-round text-2xl">timer</span>
                                    <span className="text-sm">Blitz</span>
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, type: 'Zen' })}
                                    className={`py-4 px-5 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center gap-2 ${config.type === 'Zen'
                                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50 border border-slate-200 dark:border-slate-600'
                                        }`}
                                >
                                    <span className="material-icons-round text-2xl">self_improvement</span>
                                    <span className="text-sm">Zen</span>
                                </button>
                            </div>
                        </div>

                        {/* Question Count */}
                        <div className="mb-10">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                                Number of Questions
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[5, 10, 20].map(count => (
                                    <button
                                        key={count}
                                        onClick={() => setConfig({ ...config, questions: count })}
                                        className={`py-3.5 rounded-xl font-bold text-lg transition-all duration-200 ${config.questions === count
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50 border border-slate-200 dark:border-slate-600'
                                            }`}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={startSession}
                            className="w-full py-4 rounded-xl bg-slate-700 dark:bg-slate-300 hover:bg-slate-600 dark:hover:bg-slate-400 text-white dark:text-slate-900 font-semibold text-base shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round">play_arrow</span>
                            Start Session
                        </button>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pt-20 px-8 pb-12 relative z-10 animate-fade-in">
            {/* Header */}
            <div className="mb-12">
                <button
                    onClick={onBack}
                    className="mb-8 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <span className="material-icons-round mr-1">arrow_back</span>
                    Back to Dashboard
                </button>
                <h1 className="text-4xl font-medium text-slate-900 dark:text-white mb-3">
                    Design Dojo
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-light">
                    Dynamic challenges to sharpen your instincts.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${category.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <span className={`material-icons-round text-2xl ${category.color}`}>
                                {category.icon}
                            </span>
                        </div>

                        <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            {category.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                            {category.description}
                        </p>

                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                DYNAMIC
                            </span>
                        </div>

                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/30 dark:from-blue-900/0 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
};
