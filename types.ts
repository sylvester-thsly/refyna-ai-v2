

export enum Screen {
  DASHBOARD = 'DASHBOARD',
  TOKEN_INPUT = 'TOKEN_INPUT',
  REVIEW = 'REVIEW',
  LEARN = 'LEARN',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  ONBOARDING = 'ONBOARDING',
  FEEDBACK_ANALYTICS = 'FEEDBACK_ANALYTICS',
  DESIGN_DOJO = 'DESIGN_DOJO'
}

export interface UserProfile {
  name: string;
  role: string;
  goal: string;
}

export interface DesignToken {
  id: string;
  code: string;
  name: string;
  timestamp: Date;
  previewUrl?: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K'
}

export interface Annotation {
  label: string;
  suggestion: string;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] in percentages (0-100)
  confidenceScore?: number; // 0-100
  rating?: 'good' | 'bad';
  userFeedback?: string;
  stars?: number; // 1-5 star rating
  category?: 'accuracy' | 'usefulness' | 'clarity' | 'relevance';
  applied?: boolean; // Did user apply this suggestion?
}

export interface UserFeedback {
  id: string;
  annotationLabel: string;
  suggestion: string;
  rating: 'good' | 'bad';
  timestamp: number;
  userComment?: string;
  stars?: number; // 1-5
  category?: 'accuracy' | 'usefulness' | 'clarity' | 'relevance';
  applied?: boolean;
  designContext?: string; // What were they working on?
}

export interface ReviewSession {
  id: string;
  type: 'token' | 'image';
  content: string; // Token code or Base64 image string
  thumbnail?: string; // Small preview for history card
  timestamp: number;
  title: string;
  chatHistory: ChatMessage[];
  annotations: Annotation[];
}

export interface DesignResource {
  id: string;
  name: string;
  type: 'style_guide' | 'brand_guidelines' | 'design_system' | 'reference';
  content: string; // Parsed text content or base64 for PDFs
  uploadedAt: number;
  tags: string[];
  fileSize?: number;
  aiAnalysis?: string; // AI's understanding of the PDF content
}

export interface LearningMetrics {
  totalFeedback: number;
  positiveRatio: number;
  improvementTrend: number[]; // Confidence scores over time
  topPreferences: string[]; // Most liked suggestion types
  confidenceScore: number; // 0-100, overall AI confidence
  lastUpdated: number;
}
