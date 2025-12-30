import React, { useState } from 'react';
import { Button } from './UIComponents';

interface EnhancedFeedbackFormProps {
    onSubmit: (feedback: {
        rating: 'good' | 'bad';
        stars?: number;
        category?: 'accuracy' | 'usefulness' | 'clarity' | 'relevance';
        comment?: string;
        applied?: boolean;
    }) => void;
    currentRating?: 'good' | 'bad';
    currentStars?: number;
    currentCategory?: string;
}

export const EnhancedFeedbackForm: React.FC<EnhancedFeedbackFormProps> = ({
    onSubmit,
    currentRating,
    currentStars,
    currentCategory
}) => {
    const [showDetailed, setShowDetailed] = useState(false);
    const [stars, setStars] = useState(currentStars || 0);
    const [category, setCategory] = useState<'accuracy' | 'usefulness' | 'clarity' | 'relevance' | undefined>(
        currentCategory as any
    );
    const [comment, setComment] = useState('');
    const [applied, setApplied] = useState(false);

    const handleQuickFeedback = (rating: 'good' | 'bad') => {
        if (rating === 'good') {
            onSubmit({ rating, stars: 5 });
            setShowDetailed(false);
        } else {
            setShowDetailed(true);
        }
    };

    const handleDetailedSubmit = () => {
        onSubmit({
            rating: stars >= 3 ? 'good' : 'bad',
            stars,
            category,
            comment: comment.trim() || undefined,
            applied
        });
        setShowDetailed(false);
        // Reset form
        setStars(0);
        setCategory(undefined);
        setComment('');
        setApplied(false);
    };

    return (
        <div className="mt-3 border-t border-slate-100 dark:border-slate-600 pt-3">
            {!showDetailed ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                            Was this helpful?
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleQuickFeedback('good')}
                                className={`p-1.5 rounded-lg transition-all ${currentRating === 'good'
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 scale-110'
                                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-110'
                                    }`}
                                title="Helpful!"
                            >
                                <span className="material-icons-round text-base">thumb_up</span>
                            </button>
                            <button
                                onClick={() => handleQuickFeedback('bad')}
                                className={`p-1.5 rounded-lg transition-all ${currentRating === 'bad'
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 scale-110'
                                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-110'
                                    }`}
                                title="Not helpful"
                            >
                                <span className="material-icons-round text-base">thumb_down</span>
                            </button>
                            <button
                                onClick={() => setShowDetailed(true)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                                title="Detailed feedback"
                            >
                                <span className="material-icons-round text-base">rate_review</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    {/* Star Rating */}
                    <div>
                        <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block mb-2">
                            Rating
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setStars(star)}
                                    className={`transition-all ${star <= stars
                                            ? 'text-yellow-400 scale-110'
                                            : 'text-slate-300 dark:text-slate-600 hover:text-yellow-300 hover:scale-105'
                                        }`}
                                >
                                    <span className="material-icons-round text-xl">
                                        {star <= stars ? 'star' : 'star_border'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block mb-2">
                            Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'accuracy', label: 'Accuracy', icon: 'check_circle' },
                                { value: 'usefulness', label: 'Usefulness', icon: 'lightbulb' },
                                { value: 'clarity', label: 'Clarity', icon: 'visibility' },
                                { value: 'relevance', label: 'Relevance', icon: 'target' }
                            ].map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value as any)}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${category === cat.value
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                >
                                    <span className="material-icons-round text-sm">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block mb-2">
                            Comment (Optional)
                        </label>
                        <textarea
                            placeholder="Tell us more about your experience..."
                            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800 resize-none"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Applied Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={applied}
                            onChange={(e) => setApplied(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                            I applied this suggestion to my design
                        </span>
                    </label>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="primary"
                            className="flex-1 py-2 text-xs"
                            onClick={handleDetailedSubmit}
                            disabled={stars === 0}
                        >
                            Submit Feedback
                        </Button>
                        <Button
                            variant="ghost"
                            className="px-3 py-2 text-xs"
                            onClick={() => {
                                setShowDetailed(false);
                                setStars(0);
                                setCategory(undefined);
                                setComment('');
                                setApplied(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedFeedbackForm;
