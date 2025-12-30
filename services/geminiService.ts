import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ImageSize, Annotation, UserFeedback } from "../types";
import { getEnhancedSystemPrompt } from "./knowledgeBase";

const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-2.5-pro",
  "gemini-flash-latest",
  "gemini-pro-latest"
];

// Helper to base64 encode blobs
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Keep track of the last working model (Sticky Session Strategy)
export let currentActiveModel = MODELS_TO_TRY[0];

export const getActiveModel = () => currentActiveModel;

const generateWithFallback = async (ai: GoogleGenAI, contents: any, config: any = {}) => {
  let lastError = null;

  // Prioritize the currently active (working) model first
  const sortedModels = [
    currentActiveModel,
    ...MODELS_TO_TRY.filter(m => m !== currentActiveModel)
  ];

  for (const model of sortedModels) {
    try {
      console.log(`🔄 Trying model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: config
      });
      console.log(`✅ Success with model: ${model}`);

      // Update the sticky model for future calls (like Chat)
      currentActiveModel = model;

      return response;
    } catch (e: any) {
      const errorMsg = e.message || e.error?.message || "";
      console.warn(`❌ Model ${model} failed:`, errorMsg);

      // Analyze error type for better logging
      if (e.status === 429 || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        console.log(`⏭️  Rate limited on ${model}, switching to backup...`);
      } else if (e.status === 404 || errorMsg.includes("NOT_FOUND")) {
        console.log(`⏭️  Model ${model} not found, switching to backup...`);
      } else if (e.status === 503 || errorMsg.includes("Overloaded")) {
        console.log(`⏭️  Model ${model} overloaded, switching to backup...`);
      } else {
        console.log(`⏭️  Error on ${model}, switching to backup...`);
      }

      lastError = e;
      // Loop continues naturally to next model
    }
  }
  throw lastError || new Error("All models failed");
};

/**
 * Deep analysis using available Gemini models with fallback
 */
export const analyzeDesignToken = async (tokenCode: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });
  try {
    const prompt = getEnhancedSystemPrompt(`You are Refyna, an expert UI/UX designer. Analyze this design token/code for best practices.`);
    const response = await generateWithFallback(ai, {
      parts: [{
        text: `Analyze this Figma design token/code snippet for UX best practices, accessibility, and visual harmony. Provide a concise but critical review. \n\n Code: ${tokenCode}`
      }]
    }, {
      systemInstruction: prompt
    });
    return response.text || "Could not analyze token.";
  } catch (error) {
    console.error("Analysis error:", error);
    return "Service temporarily unavailable. Please try again in a moment.";
  }
};

/**
 * Analyze a PDF design resource to extract ONLY key guidelines
 * This creates a concise summary to avoid burning tokens
 */
export const analyzePDFResource = async (pdfBase64: string, fileName: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log(`📄 Analyzing PDF: ${fileName}... (extracting key guidelines only)`);

    const response = await generateWithFallback(ai, {
      parts: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
          }
        },
        {
          text: `Analyze this design resource PDF and extract ONLY the most important guidelines in a CONCISE format.

IMPORTANT: Keep the summary SHORT and TOKEN-EFFICIENT. Extract only:

1. **Colors** (max 10 most important):
   - Name: Hex - Usage
   Example: Primary Blue: #0052CC - CTAs and links

2. **Typography** (max 5 rules):
   - Font, size, usage
   Example: Body: Inter 16px, Headings: Inter Bold 32px

3. **Spacing** (max 3 rules):
   - Grid system or key spacing values
   Example: 8px grid system (8, 16, 24, 32, 48)

4. **Key Rules** (max 10 most critical):
   - Only the MUST-FOLLOW rules
   Example: Minimum contrast 4.5:1, Touch targets 44x44px

5. **Components** (max 5 most used):
   - Only if clearly specified
   Example: Buttons: 16px padding, 8px radius

DO NOT include:
- Long explanations
- Examples or case studies
- Historical context
- Redundant information
- Full page content

Format as a compact list. Be extremely concise. Aim for under 500 words total.

Example output:
## Colors
- Primary: #0052CC - CTAs
- Text: #1F2937 - Body
- Gray: #6B7280 - Secondary

## Typography
- Body: Inter 16px
- H1: Inter Bold 32px

## Spacing
- 8px grid (8, 16, 24, 32)

## Rules
- Min contrast: 4.5:1
- Touch targets: 44x44px
- No arbitrary spacing`
        }
      ]
    });

    const analysis = response.text || "Could not analyze PDF.";

    // Count approximate tokens (rough estimate: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(analysis.length / 4);
    console.log(`✅ PDF analysis complete: ${fileName}`);
    console.log(`📊 Summary size: ~${estimatedTokens} tokens (${analysis.length} characters)`);

    // Warn if summary is too long
    if (estimatedTokens > 1000) {
      console.warn(`⚠️  Summary is large (${estimatedTokens} tokens). Consider uploading a more focused PDF.`);
    }

    return analysis;

  } catch (error: any) {
    console.error("PDF analysis error:", error);
    if (error.status === 429 || error.message?.includes("quota")) {
      return "⏳ Rate limit reached. PDF will be used as-is. Wait 1-2 minutes to re-analyze.";
    }
    return "PDF uploaded successfully. Content will be used in analysis.";
  }
};

/**
 * Quick UI suggestions using Flash
 */
export const getQuickSuggestion = async (context: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await generateWithFallback(ai, {
      parts: [{
        text: `Give a short, single-sentence UI design tip regarding: ${context}. Be witty and concise.`
      }]
    });
    return response.text || "Simplify the layout for better clarity.";
  } catch (error) {
    return "Try simplifying the layout.";
  }
};

/**
 * Initialize a Chat Session with Gemini
 * Now with self-learning feedback integration
 */
export const createChatSession = (initialContext: string, userFeedback?: UserFeedback[]): Chat => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  let feedbackContext = '';
  if (userFeedback && userFeedback.length > 0) {
    const helpfulFeedback = userFeedback.filter(f => f.rating === 'good');
    const criticalFeedback = userFeedback.filter(f => f.rating === 'bad');

    feedbackContext = `
      
      SELF-LEARNING: Based on past feedback from this user:
      - Topics they found helpful: ${helpfulFeedback.length > 0 ? helpfulFeedback.map(f => f.annotationLabel).join(', ') : 'None yet'}
      - Topics needing improvement: ${criticalFeedback.length > 0 ? criticalFeedback.map(f => f.annotationLabel).join(', ') : 'None yet'}
      
      Use this information to tailor your suggestions - focus more on areas they found helpful, and improve your feedback on areas they marked as unhelpful.`;
  }

  const basePrompt = `You are Refyna, a world-class senior UI/UX designer trained on industry best practices and design principles. 
      You are currently reviewing a design provided by the user. 
      Context of the design: ${initialContext.substring(0, 2000)}.
      
      Your goal is to help the user improve their design. 
      Be critical but constructive. Focus on whitespace, typography, accessibility, and visual hierarchy.
      Keep your responses conversational and helpful.${feedbackContext}
      `;

  const enhancedPrompt = getEnhancedSystemPrompt(basePrompt);

  return ai.chats.create({
    model: currentActiveModel,
    config: {
      systemInstruction: enhancedPrompt,
    }
  });
};

/**
 * Generate a visual improvement using Image Generation model
 * This is the basic variant generation
 */
export const generateDesignVariant = async (prompt: string, size: ImageSize = ImageSize.K1): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await generateWithFallback(ai, {
      parts: [{ text: `A high fidelity UI design interface. ${prompt}` }]
    }, {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size,
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image gen error:", error);
    if (error.status === 403 || error.message?.includes("PERMISSION_DENIED")) {
      throw error;
    }
    return null;
  }
};

/**
 * Advanced Nano Brain Variant Generation
 * Uses the original image and applied positive feedback to generate a superior version.
 */
export const generateAdvancedVariant = async (
  originalImageBase64: string,
  improvements: string[]
): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  const cleanBase64 = originalImageBase64.includes(',')
    ? originalImageBase64.split(',')[1]
    : originalImageBase64;

  const improvementPrompt = improvements.length > 0
    ? `Crucially improve the following areas: ${improvements.join(', ')}.`
    : "Optimize layout structure, visual hierarchy, and color harmony.";

  try {
    const response = await generateWithFallback(ai, {
      parts: [
        {
          text: `Redesign this UI interface to be world-class.
            Maintain the core content and purpose of the original design.
            ${improvementPrompt}
            Ensure high contrast, perfect alignment, and modern aesthetics.
            Return a high-fidelity image of the improved design.`
        },
        {
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64
          }
        }
      ]
    }, {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "2K",
      }
    }
    );

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;

  } catch (error: any) {
    console.error("Advanced variant gen error:", error);
    if (error.status === 403 || error.message?.includes("PERMISSION_DENIED")) {
      throw error;
    }
    return null;
  }
};

/**
 * Analyze an uploaded image with structured output, taking into account prior user feedback (Memory Layer).
 */
export const analyzeImage = async (file: File, priorFeedback: UserFeedback[] = []): Promise<{ text: string; annotations: Annotation[] }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  const goodFeedback = priorFeedback
    .filter(f => f.rating === 'good')
    .map(f => f.suggestion)
    .slice(-5);

  const memoryContext = goodFeedback.length > 0
    ? `NOTE: The user has previously reacted positively to these types of improvements: ${goodFeedback.join('; ')}. Prioritize similar suggestions.`
    : "";

  try {
    const base64Data = await blobToBase64(file);
    const prompt = getEnhancedSystemPrompt(`You are Refyna, an expert UI/UX designer analyzing design screenshots.`);
    const response = await generateWithFallback(ai, {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        },
        {
          text: `Analyze this UI design screenshot systematically.
${memoryContext}

Step 1: Scan the design from Top-Left to Bottom-Right.
Step 2: Identify structural issues (Grid, Alignment, Visual Hierarchy).
Step 3: Identify visual issues (Contrast, Color Harmony, Typography).

Return EXACTLY 3 critical annotations:
- label: Specific Issue (e.g. "Low Contrast H3", "Misaligned Button")
- suggestion: Specific, actionable fix (e.g. "Increase contrast to #4B5563", "Align left edge to 24px grid"). DO NOT give generic advice.
- confidenceScore: 0-100 (Be strict. High score = obvious violation).
- box_2d: Exact coordinates [ymin, xmin, ymax, xmax]

Overall analysis: Provide a technical summary of the design's maturity and adherence to modern standards.`
        }
      ]
    }, {
      systemInstruction: prompt,
      temperature: 0,
      topP: 1,
      topK: 1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          annotations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                confidenceScore: { type: Type.INTEGER, description: "Confidence score 0-100" },
                box_2d: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER },
                  description: "Bounding box coordinates [ymin, xmin, ymax, xmax] in percentages (0-100)"
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    return {
      text: json.analysis || "Analysis failed.",
      annotations: json.annotations || []
    };
  } catch (error: any) {
    console.error("Image analysis error", error);
    // Better error handling for rate limits
    if (error.status === 429 || error.message?.includes("quota")) {
      return {
        text: "⏳ Rate limit reached. Please wait 1-2 minutes and try again.",
        annotations: []
      };
    }
    return { text: "Failed to analyze image. Please try again.", annotations: [] };
  }
}
/**
 * Generate a Design Dojo quiz with multi-provider fallback.
 * Tries: Gemini -> OpenAI -> Anthropic -> Static Fallback
 */
export const generateQuiz = async (category: string, level: string, type: string, count: number): Promise<any[]> => {
  console.log(`🎯 Generating ${count} ${level} questions for ${category}...`);

  // Try Gemini first
  try {
    return await generateQuizWithGemini(category, level, type, count);
  } catch (geminiError: any) {
    console.warn('❌ Gemini failed:', geminiError.message);

    // Try Groq as first fallback (fast & generous limits)
    try {
      console.log('🔄 Trying Groq fallback...');
      return await generateQuizWithGroq(category, level, type, count);
    } catch (groqError: any) {
      console.warn('❌ Groq failed:', groqError.message);

      // Try OpenAI as second fallback
      try {
        console.log('🔄 Trying OpenAI fallback...');
        return await generateQuizWithOpenAI(category, level, type, count);
      } catch (openaiError: any) {
        console.warn('❌ OpenAI failed:', openaiError.message);

        // Try Anthropic as final AI fallback
        try {
          console.log('🔄 Trying Anthropic fallback...');
          return await generateQuizWithAnthropic(category, level, type, count);
        } catch (anthropicError: any) {
          console.warn('❌ Anthropic failed:', anthropicError.message);

          // Use static fallback
          console.log('📦 Using static fallback questions');
          return getStaticFallbackQuiz(category, level, count);
        }
      }
    }
  }
};

/**
 * Generate quiz using Gemini (original implementation)
 */
const generateQuizWithGemini = async (category: string, level: string, type: string, count: number): Promise<any[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a ${count}-question ${level} level UI/UX design quiz about "${category}". 
  Session Type: ${type} (If 'Blitz', keep questions short. If 'Zen', include deeper conceptual questions).
  
  Return ONLY a raw JSON array (no markdown block, no code fences) with objects having:
  - id: string
  - question: string
  - options: string[] (4 options)
  - correctIndex: number (0-3)
  - explanation: string (brief explanation of why the answer is correct)`;

  const response = await generateWithFallback(ai, {
    parts: [{ text: prompt }]
  });

  let text = response.text || "[]";
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  const questions = JSON.parse(text);
  if (!questions || questions.length === 0) throw new Error("Empty response from Gemini");

  console.log(`✅ Generated ${questions.length} questions with Gemini`);
  return questions;
};

/**
 * Generate quiz using Groq (Fast & Generous Free Tier)
 */
const generateQuizWithGroq = async (category: string, level: string, type: string, count: number): Promise<any[]> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API Key not found");

  const prompt = `Generate a ${count}-question ${level} level UI/UX design quiz about "${category}". 
  Session Type: ${type} (If 'Blitz', keep questions short and quick. If 'Zen', include deeper conceptual questions).
  
  Return ONLY a raw JSON array (no markdown, no code fences) with objects having:
  - id: string (unique identifier)
  - question: string
  - options: string[] (exactly 4 options)
  - correctIndex: number (0-3, index of correct answer)
  - explanation: string (brief explanation why the answer is correct)
  
  IMPORTANT: Generate EXACTLY ${count} questions. Make them specific to ${category}.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Fast and capable model
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();
  let text = data.choices[0]?.message?.content || "[]";

  // Clean up any markdown formatting
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  const questions = JSON.parse(text);
  if (!questions || questions.length === 0) throw new Error("Empty response from Groq");

  console.log(`✅ Generated ${questions.length} questions with Groq`);
  return questions;
};

/**
 * Generate quiz using OpenAI
 */
const generateQuizWithOpenAI = async (category: string, level: string, type: string, count: number): Promise<any[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API Key not found");

  const prompt = `Generate a ${count}-question ${level} level UI/UX design quiz about "${category}". 
  Session Type: ${type} (If 'Blitz', keep questions short. If 'Zen', include deeper conceptual questions).
  
  Return ONLY a raw JSON array with objects having:
  - id: string
  - question: string
  - options: string[] (4 options)
  - correctIndex: number (0-3)
  - explanation: string`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a UI/UX design expert creating quiz questions. Return only valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  let text = data.choices[0].message.content;
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  const questions = JSON.parse(text);
  console.log(`✅ Generated ${questions.length} questions with OpenAI`);
  return questions;
};

/**
 * Generate quiz using Anthropic Claude
 */
const generateQuizWithAnthropic = async (category: string, level: string, type: string, count: number): Promise<any[]> => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API Key not found");

  const prompt = `Generate a ${count}-question ${level} level UI/UX design quiz about "${category}". 
  Session Type: ${type} (If 'Blitz', keep questions short. If 'Zen', include deeper conceptual questions).
  
  Return ONLY a raw JSON array with objects having:
  - id: string
  - question: string
  - options: string[] (4 options)
  - correctIndex: number (0-3)
  - explanation: string`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  let text = data.content[0].text;
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  const questions = JSON.parse(text);
  console.log(`✅ Generated ${questions.length} questions with Anthropic`);
  return questions;
};

/**
 * Static fallback quiz questions by category
 */
const getStaticFallbackQuiz = (category: string, level: string, count: number): any[] => {
  const quizBank: Record<string, any[]> = {
    'fundamentals': [
      {
        id: '1',
        question: 'What is the primary purpose of whitespace in UI design?',
        options: ['To fill empty space', 'To create visual hierarchy and reduce cognitive load', 'To make the design look expensive', 'To separate colors'],
        correctIndex: 1,
        explanation: 'Whitespace helps group related elements and guides the user\'s eye through the content.'
      },
      {
        id: '2',
        question: 'What is the recommended minimum contrast ratio for normal text (WCAG AA)?',
        options: ['3:1', '4.5:1', '7:1', '2:1'],
        correctIndex: 1,
        explanation: 'WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text to ensure readability.'
      },
      {
        id: '3',
        question: 'Which typography principle suggests using a maximum of 2-3 typefaces?',
        options: ['Font Hierarchy', 'Type Scale', 'Font Pairing', 'Kerning'],
        correctIndex: 2,
        explanation: 'Font pairing principles recommend limiting typefaces to maintain visual consistency.'
      },
      {
        id: '4',
        question: 'What is the 60-30-10 rule in color theory?',
        options: ['60% primary, 30% secondary, 10% accent', '60% text, 30% images, 10% whitespace', '60% content, 30% navigation, 10% footer', '60% desktop, 30% tablet, 10% mobile'],
        correctIndex: 0,
        explanation: 'The 60-30-10 rule suggests using 60% dominant color, 30% secondary color, and 10% accent color.'
      },
      {
        id: '5',
        question: 'What does F-pattern refer to in web design?',
        options: ['Font selection pattern', 'Eye-tracking reading pattern', 'Form layout pattern', 'Footer design pattern'],
        correctIndex: 1,
        explanation: 'F-pattern describes how users typically scan web content in an F-shaped pattern.'
      },
      {
        id: '6',
        question: 'What is the recommended line height for body text?',
        options: ['1.0', '1.5', '2.0', '2.5'],
        correctIndex: 1,
        explanation: 'A line height of 1.5 (150%) is generally recommended for optimal readability.'
      },
      {
        id: '7',
        question: 'What is the purpose of a design system?',
        options: ['To make designs look similar', 'To ensure consistency and scalability', 'To reduce designer workload', 'To impress stakeholders'],
        correctIndex: 1,
        explanation: 'Design systems ensure consistency across products and enable teams to scale efficiently.'
      },
      {
        id: '8',
        question: 'What is the ideal character count per line for readability?',
        options: ['20-40', '45-75', '80-100', '100-120'],
        correctIndex: 1,
        explanation: '45-75 characters per line is optimal for comfortable reading without eye fatigue.'
      },
      {
        id: '9',
        question: 'What does "above the fold" mean?',
        options: ['Content at the top of the page', 'Folded paper design', 'Mobile-first design', 'Responsive breakpoint'],
        correctIndex: 0,
        explanation: 'Above the fold refers to content visible without scrolling, originating from newspaper design.'
      },
      {
        id: '10',
        question: 'What is the purpose of a grid system?',
        options: ['To create visual alignment and consistency', 'To make designs look modern', 'To reduce file size', 'To improve SEO'],
        correctIndex: 0,
        explanation: 'Grid systems provide structure and help maintain consistent alignment across layouts.'
      },
      {
        id: '11',
        question: 'What is the difference between UI and UX?',
        options: ['UI is visual, UX is functional', 'UI is how it looks, UX is how it works', 'UI is for web, UX is for mobile', 'UI is design, UX is development'],
        correctIndex: 1,
        explanation: 'UI focuses on visual interface design, while UX encompasses the entire user experience.'
      },
      {
        id: '12',
        question: 'What is a wireframe?',
        options: ['Final design mockup', 'Low-fidelity layout sketch', 'Interactive prototype', 'Design system documentation'],
        correctIndex: 1,
        explanation: 'Wireframes are low-fidelity sketches showing basic layout and structure without visual design.'
      },
      {
        id: '13',
        question: 'What is the purpose of user personas?',
        options: ['To create fictional characters', 'To represent target user groups', 'To impress clients', 'To fill documentation'],
        correctIndex: 1,
        explanation: 'Personas represent different user types to guide design decisions based on user needs.'
      },
      {
        id: '14',
        question: 'What is A/B testing?',
        options: ['Testing two design versions', 'Testing accessibility', 'Testing browser compatibility', 'Testing load times'],
        correctIndex: 0,
        explanation: 'A/B testing compares two versions to determine which performs better with users.'
      },
      {
        id: '15',
        question: 'What is the purpose of a style guide?',
        options: ['To document design decisions', 'To showcase portfolio work', 'To train new designers', 'To impress stakeholders'],
        correctIndex: 0,
        explanation: 'Style guides document design standards, ensuring consistency across a product or brand.'
      },
      {
        id: '16',
        question: 'What is responsive design?',
        options: ['Fast-loading websites', 'Designs that adapt to screen sizes', 'Interactive animations', 'Voice-controlled interfaces'],
        correctIndex: 1,
        explanation: 'Responsive design ensures layouts adapt seamlessly to different screen sizes and devices.'
      },
      {
        id: '17',
        question: 'What is the purpose of prototyping?',
        options: ['To create final designs', 'To test interactions before development', 'To impress stakeholders', 'To document requirements'],
        correctIndex: 1,
        explanation: 'Prototypes allow testing of interactions and user flows before investing in development.'
      },
      {
        id: '18',
        question: 'What is accessibility in design?',
        options: ['Making designs easy to find', 'Ensuring usability for people with disabilities', 'Creating mobile-friendly designs', 'Optimizing load times'],
        correctIndex: 1,
        explanation: 'Accessibility ensures products are usable by people with various disabilities and abilities.'
      },
      {
        id: '19',
        question: 'What is the purpose of user testing?',
        options: ['To validate design assumptions', 'To find bugs', 'To train users', 'To create documentation'],
        correctIndex: 0,
        explanation: 'User testing validates design decisions by observing real users interacting with the product.'
      },
      {
        id: '20',
        question: 'What is the minimum touch target size for mobile?',
        options: ['32x32 px', '44x44 px', '56x56 px', '64x64 px'],
        correctIndex: 1,
        explanation: 'Apple and Google recommend minimum 44x44 px touch targets for accessibility.'
      }
    ],
    'fintech products': [
      {
        id: '1',
        question: 'What is a key trust signal in fintech UI design?',
        options: ['Bright colors', 'Security badges and encryption indicators', 'Large fonts', 'Animations'],
        correctIndex: 1,
        explanation: 'Security badges, SSL indicators, and compliance logos build user trust in financial applications.'
      },
      {
        id: '2',
        question: 'What color is commonly associated with financial growth?',
        options: ['Red', 'Green', 'Blue', 'Yellow'],
        correctIndex: 1,
        explanation: 'Green is universally associated with positive financial growth and gains.'
      },
      {
        id: '3',
        question: 'What is the purpose of transaction history in fintech apps?',
        options: ['To fill space', 'To provide transparency and control', 'To show off features', 'To collect data'],
        correctIndex: 1,
        explanation: 'Transaction history builds trust by providing users with complete transparency and control.'
      },
      {
        id: '4',
        question: 'What is two-factor authentication (2FA)?',
        options: ['Double password', 'Additional security layer', 'Backup login', 'Admin access'],
        correctIndex: 1,
        explanation: '2FA adds an extra security layer beyond passwords to protect user accounts.'
      },
      {
        id: '5',
        question: 'What is the purpose of spending insights in banking apps?',
        options: ['To shame users', 'To help users understand financial habits', 'To sell products', 'To collect data'],
        correctIndex: 1,
        explanation: 'Spending insights help users understand their financial behavior and make better decisions.'
      },
      {
        id: '6',
        question: 'What is KYC in fintech?',
        options: ['Key Your Code', 'Know Your Customer', 'Keep Your Cash', 'Kill Your Competition'],
        correctIndex: 1,
        explanation: 'KYC (Know Your Customer) is a regulatory requirement to verify user identity.'
      },
      {
        id: '7',
        question: 'What is the purpose of real-time notifications in fintech?',
        options: ['To annoy users', 'To provide immediate transaction alerts', 'To increase engagement', 'To collect data'],
        correctIndex: 1,
        explanation: 'Real-time notifications keep users informed of account activity and potential fraud.'
      },
      {
        id: '8',
        question: 'What is a digital wallet?',
        options: ['Online shopping cart', 'Electronic payment storage', 'Cryptocurrency', 'Banking app'],
        correctIndex: 1,
        explanation: 'Digital wallets store payment information electronically for convenient transactions.'
      },
      {
        id: '9',
        question: 'What is the purpose of biometric authentication?',
        options: ['To look futuristic', 'To provide secure, convenient access', 'To collect user data', 'To replace passwords'],
        correctIndex: 1,
        explanation: 'Biometric authentication (fingerprint, face ID) provides secure yet convenient access.'
      },
      {
        id: '10',
        question: 'What is PCI DSS compliance?',
        options: ['Payment Card Industry Data Security Standard', 'Personal Credit Information Display System', 'Public Card Index Database Service', 'Protected Customer ID Data Storage'],
        correctIndex: 0,
        explanation: 'PCI DSS is a security standard for organizations handling credit card information.'
      },
      {
        id: '11',
        question: 'What is the purpose of account aggregation?',
        options: ['To combine multiple accounts in one view', 'To merge bank accounts', 'To share data with third parties', 'To increase fees'],
        correctIndex: 0,
        explanation: 'Account aggregation allows users to view all their financial accounts in one place.'
      },
      {
        id: '12',
        question: 'What is a neobank?',
        options: ['New banking regulation', 'Digital-only bank', 'Bank for young people', 'Cryptocurrency exchange'],
        correctIndex: 1,
        explanation: 'Neobanks are digital-only banks that operate without physical branches.'
      },
      {
        id: '13',
        question: 'What is the purpose of spending limits in fintech apps?',
        options: ['To restrict users', 'To help users budget and control spending', 'To reduce transactions', 'To increase fees'],
        correctIndex: 1,
        explanation: 'Spending limits help users stay within budget and control their finances.'
      },
      {
        id: '14',
        question: 'What is open banking?',
        options: ['Banks with no fees', 'Sharing financial data via APIs', 'Banks open 24/7', 'Public banking records'],
        correctIndex: 1,
        explanation: 'Open banking allows third-party services to access financial data via secure APIs.'
      },
      {
        id: '15',
        question: 'What is the purpose of instant transfers?',
        options: ['To charge more fees', 'To provide immediate fund availability', 'To reduce security', 'To increase transactions'],
        correctIndex: 1,
        explanation: 'Instant transfers provide immediate fund availability, improving user experience.'
      },
      {
        id: '16',
        question: 'What is a robo-advisor?',
        options: ['Robot bank teller', 'Automated investment service', 'AI customer support', 'Trading bot'],
        correctIndex: 1,
        explanation: 'Robo-advisors provide automated, algorithm-driven financial planning services.'
      },
      {
        id: '17',
        question: 'What is the purpose of fraud detection in fintech?',
        options: ['To block users', 'To identify and prevent unauthorized transactions', 'To collect data', 'To increase security fees'],
        correctIndex: 1,
        explanation: 'Fraud detection systems identify suspicious activity to protect user accounts.'
      },
      {
        id: '18',
        question: 'What is a virtual card?',
        options: ['Digital business card', 'Temporary payment card number', 'Cryptocurrency wallet', 'Online banking login'],
        correctIndex: 1,
        explanation: 'Virtual cards are temporary card numbers used for secure online transactions.'
      },
      {
        id: '19',
        question: 'What is the purpose of financial literacy features?',
        options: ['To educate users about finance', 'To sell products', 'To collect data', 'To increase engagement'],
        correctIndex: 0,
        explanation: 'Financial literacy features help users understand and improve their financial knowledge.'
      },
      {
        id: '20',
        question: 'What is peer-to-peer (P2P) payment?',
        options: ['Bank transfer', 'Direct payment between individuals', 'Business payment', 'International transfer'],
        correctIndex: 1,
        explanation: 'P2P payments allow direct money transfers between individuals without intermediaries.'
      }
    ]
  };

  // Normalize category name
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, ' ').trim();

  // Try to find matching category
  const categoryQuestions = quizBank[normalizedCategory] || quizBank['fundamentals'];

  // Return exact number requested, repeat if necessary
  if (categoryQuestions.length >= count) {
    return categoryQuestions.slice(0, count);
  } else {
    // If we don't have enough, repeat questions to reach the count
    const repeated = [];
    while (repeated.length < count) {
      repeated.push(...categoryQuestions);
    }
    return repeated.slice(0, count);
  }
};
