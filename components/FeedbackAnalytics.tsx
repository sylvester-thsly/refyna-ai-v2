import React, { useMemo } from 'react';
import { UserFeedback, LearningMetrics } from '../types';
import { Button } from './UIComponents';

interface FeedbackAnalyticsProps {
    feedbackHistory: UserFeedback[];
    onExport: () => void;
    onClearAll: () => void;
}

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({
    feedbackHistory,
    onExport,
    onClearAll
}) => {
    const metrics: LearningMetrics = useMemo(() => {
        const total = feedbackHistory.length;
        const positive = feedbackHistory.filter(f => f.rating === 'good').length;
        const ratio = total > 0 ? (positive / total) * 100 : 0;

        // Calculate improvement trend (last 10 feedbacks)
        const recentFeedback = feedbackHistory.slice(-10);
        const trend = recentFeedback.map((f, idx) => {
            const recentPositive = recentFeedback.slice(0, idx + 1).filter(rf => rf.rating === 'good').length;
            return (recentPositive / (idx + 1)) * 100;
        });

        // Top preferences (most liked annotation labels)
        const labelCounts: Record<string, number> = {};
        feedbackHistory.filter(f => f.rating === 'good').forEach(f => {
            labelCounts[f.annotationLabel] = (labelCounts[f.annotationLabel] || 0) + 1;
        });
        const topPreferences = Object.entries(labelCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([label]) => label);

        return {
            totalFeedback: total,
            positiveRatio: ratio,
            improvementTrend: trend,
            topPreferences,
            confidenceScore: Math.min(100, Math.max(0, ratio + (total / 10))), // Increases with feedback
            lastUpdated: Date.now()
        };
    }, [feedbackHistory]);

    const categoryBreakdown = useMemo(() => {
        const categories = {
            accuracy: 0,
            usefulness: 0,
            clarity: 0,
            relevance: 0
        };

        feedbackHistory.forEach(f => {
            if (f.category) {
                categories[f.category]++;
            }
        });

        return categories;
    }, [feedbackHistory]);

    const averageStars = useMemo(() => {
        const withStars = feedbackHistory.filter(f => f.stars);
        if (withStars.length === 0) return 0;
        return withStars.reduce((sum, f) => sum + (f.stars || 0), 0) / withStars.length;
    }, [feedbackHistory]);

    return (
        <div className="max-w-6xl mx-auto pt-20 px-8 pb-12 relative z-10 animate-fade-in">
            <header className="mb-16">
                <h1 className="text-4xl font-medium text-slate-900 dark:text-white mb-2">
                    Learning Analytics
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-normal text-lg">
                    Track how Refyna AI learns from your feedback
                </p>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="material-icons-round text-purple-600 dark:text-purple-400">feedback</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {metrics.totalFeedback}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Feedback</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-icons-round text-green-600 dark:text-green-400">thumb_up</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {metrics.positiveRatio.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Positive Ratio</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <span className="material-icons-round text-yellow-600 dark:text-yellow-400">star</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {averageStars.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Average Stars</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="material-icons-round text-blue-600 dark:text-blue-400">psychology</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {metrics.confidenceScore.toFixed(0)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">AI Confidence</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Improvement Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">
                        Learning Trend
                    </h3>
                    <div className="h-48 flex items-end gap-2">
                        {metrics.improvementTrend.length > 0 ? (
                            metrics.improvementTrend.map((value, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-400"
                                        style={{ height: `${value}%` }}
                                        title={`${value.toFixed(1)}%`}
                                    />
                                    <span className="text-[10px] text-slate-400">{idx + 1}</span>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                No data yet. Start providing feedback!
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">
                        Feedback by Category
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(categoryBreakdown).map(([category, count]) => {
                            const percentage = metrics.totalFeedback > 0 ? (Number(count) / metrics.totalFeedback) * 100 : 0;
                            const colors = {
                                accuracy: 'bg-green-500',
                                usefulness: 'bg-blue-500',
                                clarity: 'bg-yellow-500',
                                relevance: 'bg-purple-500'
                            };
                            return (
                                <div key={category}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600 dark:text-slate-400 capitalize">{category}</span>
                                        <span className="text-slate-900 dark:text-white font-medium">{count}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[category as keyof typeof colors]} transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Preferences */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 mb-8">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">
                    Your Top Preferences
                </h3>
                {metrics.topPreferences.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {metrics.topPreferences.map((pref, idx) => (
                            <div
                                key={idx}
                                className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-100 dark:border-purple-800"
                            >
                                {pref}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">
                        No preferences identified yet. Keep providing feedback!
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Button onClick={onExport} icon="download">
                    Export Feedback Data
                </Button>
                <Button variant="danger" onClick={onClearAll} icon="delete">
                    Clear All Feedback
                </Button>
            </div>
        </div>
    );
};

export default FeedbackAnalytics;
