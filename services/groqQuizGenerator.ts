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
