# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| v2.x    | :white_check_mark: |
| v1.0    | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an e-mail to security@refyna.ai. All security vulnerability reports will be promptly addressed.

## Known Security Architecture & Limitations

### Client-Side API Keys
This application is designed as a serverless Single Page Application (SPA). To provide AI functionality without a backend server, API keys (Gemini, Groq, OpenAI, Anthropic) are used directly in the client-side code.

**Risk:** API keys included in the build bundle may be visible to users who inspect the application source code.

**Mitigation Strategies:**
1.  **Restrict API Keys:** We strongly recommend configuring your API keys with strict usage limits (quotas) and HTTP referer restrictions (e.g., only allow requests from `https://your-domain.vercel.app`) in the respective provider consoles (Google Cloud Console, Groq Console, etc.).
2.  **Budget Alerts:** Set up budget alerts to notify you of any unexpected usage spikes.
3.  **Environment Variables:** Never commit API keys to the Git repository. Always use `.env` files (which are gitignored) and configure environment variables in your deployment platform (e.g., Vercel).

### Cross-Site Scripting (XSS)
We have implemented input sanitization for all user-generated content, particularly in the "Export Report" functionality, to prevent XSS attacks.

## Security Best Practices
- Keep your dependencies up to date (`npm audit`).
- Do not expose administrative features to the public internet.
- Regularly rotate your API keys.
