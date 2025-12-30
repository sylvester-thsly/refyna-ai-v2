// Quick test to verify API key is loaded
import { config } from 'dotenv';
config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your-api-key-here') {
  console.log('❌ API key not configured properly');
  console.log('Please edit .env file and add your actual Gemini API key');
  process.exit(1);
}

// Check if it looks like a valid API key format
if (apiKey.length < 20) {
  console.log('⚠️  API key seems too short. Make sure you copied the entire key.');
  process.exit(1);
}

console.log('✅ API key is configured!');
console.log(`   Key length: ${apiKey.length} characters`);
console.log(`   Key starts with: ${apiKey.substring(0, 10)}...`);
console.log('\nYou can now use the Aura AI app!');
