// Quick script to list available Gemini models
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Manual .env reading
const envPath = path.resolve('.env');
let apiKey = process.env.VITE_GEMINI_API_KEY;

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const match = envConfig.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

if (!apiKey) {
    console.error("❌ No API key found. Make sure VITE_GEMINI_API_KEY is set in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

console.log("🔍 Fetching available models...\n");

try {
    const response = await ai.models.list();

    // Check for different response structures
    let models = [];
    if (Array.isArray(response)) {
        models = response;
    } else if (response && Array.isArray(response.models)) {
        models = response.models;
    } else if (response && Array.isArray(response.pageInternal)) {
        // Handle internal pagination structure
        models = response.pageInternal;
    } else {
        console.log("Unknown response structure:", JSON.stringify(response, null, 2));
    }

    console.log("✅ Available models:\n");

    for (const model of models) {
        // Strip the 'models/' prefix for display if present
        const name = model.name.replace('models/', '');
        console.log(`📦 ${name}`);
        console.log(`   Full Name: ${model.name}`);
        if (model.displayName) console.log(`   Display: ${model.displayName}`);
        console.log("");
    }

    console.log(`\n✅ Total models found: ${models.length}`);
} catch (error) {
    console.error("❌ Error fetching models:", error);
}
