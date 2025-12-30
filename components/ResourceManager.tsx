import React, { useState, useRef } from 'react';
import { DesignResource } from '../types';
import { uploadDesignResource, getDesignResources, deleteResource, exportResources } from '../services/resourceManager';
import { Button } from './UIComponents';

export const ResourceManager: React.FC = () => {
    const [resources, setResources] = useState<DesignResource[]>(getDesignResources());
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState<DesignResource['type']>('style_guide');
    const [tags, setTags] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
            const resource = await uploadDesignResource(file, selectedType, tagArray);
            setResources(getDesignResources());
            setTags('');

            // Show success message
            alert(`✅ Successfully uploaded: ${file.name}\n\nThe AI will now use this resource when providing design feedback!`);
        } catch (error: any) {
            alert(`❌ Error uploading file: ${error.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            deleteResource(id);
            setResources(getDesignResources());
        }
    };

    const handleExport = () => {
        const data = exportResources();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aura-design-resources-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown';
        const kb = bytes / 1024;
        const mb = kb / 1024;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    };

    return (
        <div className="max-w-6xl mx-auto pt-20 px-8 pb-12 relative z-10 animate-fade-in">
            <header className="mb-16">
                <h1 className="text-4xl font-medium text-slate-900 dark:text-white mb-2">
                    Design Resources
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-normal text-lg">
                    Upload design guidelines, style guides, and brand resources to train the AI
                </p>
            </header>

            {/* Upload Section */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-6">
                    Upload New Resource
                </h2>

                <div className="space-y-6">
                    {/* Resource Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Resource Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'style_guide', label: 'Style Guide', icon: 'palette' },
                                { value: 'brand_guidelines', label: 'Brand Guidelines', icon: 'branding_watermark' },
                                { value: 'design_system', label: 'Design System', icon: 'dashboard_customize' },
                                { value: 'reference', label: 'Reference', icon: 'bookmark' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedType(type.value as any)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${selectedType === type.value
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <span className="material-icons-round text-2xl">{type.icon}</span>
                                    <span className="text-xs font-medium text-center">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tags (comma-separated, optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., colors, typography, spacing"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.txt,.md"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="resource-upload"
                        />
                        <label
                            htmlFor="resource-upload"
                            className={`flex items-center justify-center gap-3 w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading
                                    ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-purple-600 dark:text-purple-400 font-medium">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-round text-3xl text-slate-400">cloud_upload</span>
                                    <div className="text-center">
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            PDF, TXT, or MD files
                                        </p>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            {/* Resources List */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-slate-900 dark:text-white">
                        Uploaded Resources ({resources.length})
                    </h2>
                    {resources.length > 0 && (
                        <Button onClick={handleExport} variant="secondary" icon="download" className="text-sm">
                            Export All
                        </Button>
                    )}
                </div>

                {resources.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-round text-3xl text-slate-400">folder_open</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No resources yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Upload your first design resource to start training the AI
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resources.map((resource) => (
                            <div
                                key={resource.id}
                                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 transition-all group"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-icons-round text-purple-600 dark:text-purple-400">
                                        {resource.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-slate-900 dark:text-white truncate">
                                        {resource.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                            {resource.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatFileSize(resource.fileSize)}
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(resource.uploadedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {resource.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {resource.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => handleDelete(resource.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                >
                                    <span className="material-icons-round text-xl">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900">
                <div className="flex gap-4">
                    <span className="material-icons-round text-blue-600 dark:text-blue-400 text-2xl">info</span>
                    <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                            How AI Training Works
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                            <li>• <strong>Uploaded resources</strong> are automatically included in every AI analysis</li>
                            <li>• The AI will reference your <strong>style guides and brand guidelines</strong> when giving feedback</li>
                            <li>• <strong>Every conversation</strong> helps the AI learn your preferences</li>
                            <li>• <strong>Feedback you provide</strong> (thumbs up/down, ratings) trains the AI to give better suggestions</li>
                            <li>• Resources are stored locally in your browser for privacy</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceManager;
