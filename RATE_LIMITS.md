# Gemini API Rate Limits - Troubleshooting Guide

## 🚨 Current Issue: Rate Limit Exceeded (429 Error)

You're seeing this error because you've exceeded the **free tier quota** for the Gemini API.

### **What's Happening:**
The free tier has limits on:
- **Requests per minute**: 15 requests/minute
- **Requests per day**: 1,500 requests/day  
- **Tokens per minute**: 1 million tokens/minute

### **Solutions:**

#### **Option 1: Wait (Easiest)**
⏳ **Wait 1-2 minutes** between requests. The rate limit resets every minute.

#### **Option 2: Create a New API Key (Quick Fix)**
If you've hit the daily limit, you can:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a **new project** (important!)
3. Generate a new API key for that project
4. Update your `.env` file with the new key:
   ```
   VITE_GEMINI_API_KEY=your-new-api-key-here
   ```
5. Restart the dev server

#### **Option 3: Upgrade to Paid Tier**
For production use, consider upgrading to a paid plan:
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Enable billing for your project
- Get much higher rate limits

### **Best Practices to Avoid Rate Limits:**

1. **Don't spam requests** - Wait a few seconds between uploads
2. **Use caching** - Don't re-analyze the same image multiple times
3. **Implement debouncing** - Add delays between API calls
4. **Monitor usage** - Check [AI Studio Usage](https://ai.dev/usage?tab=rate-limit)

### **Current App Improvements:**

✅ The app now automatically tries multiple models if one is rate-limited
✅ Better error messages show which model failed and why
✅ Fallback system skips unavailable models automatically

---

**For now, just wait 1-2 minutes and try uploading an image again!** 🎨
