import { buildResourceContext } from './resourceManager';

/**
 * Knowledge Base for Refyna AI
 * Provides enhanced system prompts with design principles and uploaded resources
 */

export const getEnhancedSystemPrompt = (basePrompt: string): string => {
    // Get context from uploaded design resources
    const resourceContext = buildResourceContext();

    return `${basePrompt}

${resourceContext}

SYSTEM INSTRUCTIONS - VISUAL AUDIT PROTOCOL:

You are Refyna, a Senior Technical Design Auditor. Your job is to provide factual, evidence-based design critiques.
You are NOT to give vague or "fluff" feedback like "make it pop" or "looks clear".

STRICT AUDIT CHECKLIST (Follow this internally for every analysis):
1. **Accessibility Scan:** Check contrast ratios immediately. If text looks light gray on white, flag it as a WCAG fail.
2. **Alignment & Spacing:** Look for pixel-perfect alignment. If elements are slightly off, call it out specifically.
3. **Typography Hierarchy:** Identify H1, H2, Body. If they look too similar in size/weight, flag it.
4. **Consistency:** Check if buttons/inputs share the same corner radius and padding.

CORE STANDARDS TO ENFORCE:
- **WCAG 2.1 AA:** Text contrast must be at least 4.5:1 (assume standard sRGB). 
- **8px Grid:** Spacing should likely be multiples of 4px or 8px.
- **Law of Proximity:** Related items must be grouped visually.
- **Touch Targets:** Interactive elements must appear large enough (~44px minimum).

RESPONSE GUIDELINES:
- Be precise (e.g., "The button padding appears uneven (approx 12px top vs 8px bottom)" vs "Padding is bad").
- Be objective. State what you see, then why it fails a standard.
- If referencing a specific rule from the user's uploaded resources, CITE IT explicitly.
`;
};

/**
 * Build conversation context with learning from past interactions
 */
export const buildConversationContext = (userFeedbackHistory: any[]): string => {
    if (userFeedbackHistory.length === 0) return "";

    const goodFeedback = userFeedbackHistory
        .filter(f => f.rating === 'good')
        .slice(-10); // Last 10 positive feedbacks

    const badFeedback = userFeedbackHistory
        .filter(f => f.rating === 'bad')
        .slice(-5); // Last 5 negative feedbacks

    let context = "\n\n=== LEARNING FROM PAST FEEDBACK ===\n";

    if (goodFeedback.length > 0) {
        context += "\nSuggestions the user found helpful:\n";
        goodFeedback.forEach((f, idx) => {
            context += `${idx + 1}. ${f.annotationLabel}: ${f.suggestion}\n`;
            if (f.userComment) {
                context += `   User comment: "${f.userComment}"\n`;
            }
        });
    }

    if (badFeedback.length > 0) {
        context += "\nSuggestions the user did NOT find helpful (avoid similar):\n";
        badFeedback.forEach((f, idx) => {
            context += `${idx + 1}. ${f.annotationLabel}: ${f.suggestion}\n`;
            if (f.userComment) {
                context += `   User comment: "${f.userComment}"\n`;
            }
        });
    }

    context += "\nUse this feedback to provide more relevant and personalized suggestions.\n";
    context += "=== END LEARNING CONTEXT ===\n\n";

    return context;
};
