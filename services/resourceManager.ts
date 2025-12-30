import { DesignResource } from "../types";

/**
 * Design Resource Manager
 * Handles uploading, parsing, and managing design resources (PDFs, style guides, etc.)
 */

const STORAGE_KEY = 'aura_design_resources';

// Helper to extract text from PDF (basic implementation)
// For production, you'd want to use a library like pdf.js
const extractTextFromPDF = async (file: File): Promise<string> => {
    // For now, we'll store the file as base64 and let Gemini parse it
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Extract text from plain text files
const extractTextFromTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

/**
 * Upload and store a design resource
 * For PDFs, also analyzes content with AI to extract key guidelines
 */
export const uploadDesignResource = async (
    file: File,
    type: DesignResource['type'],
    tags: string[] = [],
    analyzePDF?: (base64: string, fileName: string) => Promise<string>
): Promise<DesignResource> => {
    let content: string;
    let aiAnalysis: string | undefined;

    // Extract content based on file type
    if (file.type === 'application/pdf') {
        content = await extractTextFromPDF(file);

        // If analyzePDF function is provided, use AI to understand the PDF
        if (analyzePDF) {
            try {
                console.log(`🧠 AI is reading and understanding: ${file.name}...`);
                aiAnalysis = await analyzePDF(content, file.name);
                console.log(`✅ AI has learned from: ${file.name}`);
            } catch (error) {
                console.warn('AI analysis failed, PDF will be used as-is:', error);
            }
        }
    } else if (file.type.startsWith('text/')) {
        content = await extractTextFromTextFile(file);
    } else {
        throw new Error('Unsupported file type. Please upload PDF or text files.');
    }

    const resource: DesignResource = {
        id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type,
        content,
        uploadedAt: Date.now(),
        tags,
        fileSize: file.size,
        aiAnalysis // Store AI's understanding of the PDF
    };

    // Save to localStorage
    const existing = getDesignResources();
    existing.push(resource);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    return resource;
};

/**
 * Get all design resources
 */
export const getDesignResources = (): DesignResource[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

/**
 * Get a specific resource by ID
 */
export const getResourceById = (id: string): DesignResource | null => {
    const resources = getDesignResources();
    return resources.find(r => r.id === id) || null;
};

/**
 * Delete a resource
 */
export const deleteResource = (id: string): void => {
    const resources = getDesignResources();
    const filtered = resources.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Update resource tags
 */
export const updateResourceTags = (id: string, tags: string[]): void => {
    const resources = getDesignResources();
    const updated = resources.map(r =>
        r.id === id ? { ...r, tags } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/**
 * Build context from all design resources for AI
 */
export const buildResourceContext = (): string => {
    const resources = getDesignResources();

    if (resources.length === 0) {
        return "";
    }

    let context = "\n\n=== DESIGN RESOURCES & GUIDELINES ===\n";
    context += "The following design resources have been uploaded by the team:\n\n";

    resources.forEach((resource, idx) => {
        context += `${idx + 1}. ${resource.name} (${resource.type})\n`;
        if (resource.tags.length > 0) {
            context += `   Tags: ${resource.tags.join(', ')}\n`;
        }
        context += `   Uploaded: ${new Date(resource.uploadedAt).toLocaleDateString()}\n`;

        // If AI has analyzed this PDF, include the analysis
        if (resource.aiAnalysis) {
            context += `\n   AI Analysis:\n`;
            context += `   ${resource.aiAnalysis.split('\n').join('\n   ')}\n`;
        } else if (!resource.name.endsWith('.pdf')) {
            // For text files, include the content directly
            context += `   Content: ${resource.content.substring(0, 500)}...\n`;
        }
        context += "\n";
    });

    context += "Please reference these resources when providing design feedback.\n";
    context += "When you see a design issue, check if these resources specify the correct approach.\n";
    context += "=== END DESIGN RESOURCES ===\n\n";

    return context;
};

/**
 * Get PDF resources for sending to Gemini
 */
export const getPDFResources = (): DesignResource[] => {
    return getDesignResources().filter(r => r.name.endsWith('.pdf'));
};

/**
 * Export all resources as JSON
 */
export const exportResources = (): string => {
    const resources = getDesignResources();
    return JSON.stringify(resources, null, 2);
};

/**
 * Import resources from JSON
 */
export const importResources = (jsonString: string): void => {
    try {
        const resources = JSON.parse(jsonString);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    } catch (error) {
        throw new Error('Invalid JSON format');
    }
};

/**
 * Clear all resources
 */
export const clearAllResources = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
