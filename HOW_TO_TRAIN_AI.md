# 📚 How to Train Refyna AI with Your Design Resources

## 🎯 Overview

Refyna AI can learn from **two sources**:
1. **Design Resources** (PDFs, style guides, brand guidelines)
2. **User Interactions** (every conversation, every feedback)

---

## 📁 **Method 1: Upload PDF Design Resources**

### Where to Put Your PDFs:

#### **Option A: Through the UI (Recommended)**
1. Run the app: `npm run dev`
2. Navigate to **"Design Resources"** in the sidebar
3. Click **"Upload New Resource"**
4. Select resource type:
   - Style Guide
   - Brand Guidelines
   - Design System
   - Reference Material
5. Add tags (optional): `colors, typography, spacing`
6. Click to upload or drag & drop your PDF
7. ✅ Done! AI will now use this in all analyses

#### **Option B: Manual Folder (For Developers)**
Place PDFs in: `design-resources/` folder

Then they'll be automatically loaded when the app starts.

---

## 🧠 **Method 2: Train Through Conversations**

### The AI Learns From:

#### **1. Every Question You Ask**
- When you chat with Refyna, it remembers the context
- Ask specific questions about your design
- The AI adapts its responses based on your focus areas

#### **2. Feedback You Provide**
- ⭐ Star ratings (1-5 stars)
- 👍 Thumbs up/down
- 💬 Comments explaining why
- ✅ Marking suggestions as "applied"

#### **3. Your Preferences**
- The AI tracks which suggestions you liked
- It avoids suggestions you marked as unhelpful
- It prioritizes topics you engage with most

---

## 📖 **What Can You Upload?**

### Supported File Types:
- ✅ **PDF** - Style guides, brand books, design systems
- ✅ **TXT** - Text-based guidelines
- ✅ **MD** - Markdown documentation

### Recommended Content:
1. **Brand Guidelines**
   - Logo usage
   - Color palettes
   - Typography rules
   - Voice & tone

2. **Style Guides**
   - Component specifications
   - Spacing systems
   - Grid layouts
   - Iconography

3. **Design Systems**
   - Component library docs
   - Design tokens
   - Accessibility standards
   - Best practices

4. **Reference Materials**
   - Competitor analysis
   - Design inspiration
   - User research findings
   - Accessibility checklists

---

## 🎓 **How the AI Uses Your Resources**

### When You Upload a PDF:

1. **Automatic Integration**
   - PDF content is extracted and stored
   - Added to AI's knowledge base
   - Referenced in every analysis

2. **Context-Aware Feedback**
   ```
   Example:
   Your PDF says: "Always use 16px spacing between elements"
   
   AI will suggest: "Increase spacing to 16px to match your 
   design system guidelines (reference: spacing-guide.pdf)"
   ```

3. **Brand Consistency**
   - AI checks suggestions against your brand guidelines
   - Ensures color choices match your palette
   - Validates typography against your standards

---

## 💡 **Best Practices**

### For Maximum Learning:

1. **Upload Comprehensive Resources**
   - Don't hold back - upload all relevant docs
   - More context = better suggestions

2. **Provide Detailed Feedback**
   - Use star ratings (not just thumbs up/down)
   - Add comments explaining your reasoning
   - Mark when you apply suggestions

3. **Be Consistent**
   - Regular feedback helps AI learn faster
   - Review multiple designs to build patterns

4. **Update Resources**
   - When guidelines change, upload new versions
   - Delete outdated resources

---

## 🔄 **Training Workflow**

### Initial Setup (One-Time):
```
1. Upload all design resources (PDFs, style guides)
2. Add relevant tags to each resource
3. Review the "Learning Analytics" dashboard
```

### Ongoing Training (Every Session):
```
1. Upload design for review
2. Read AI suggestions
3. Provide feedback:
   - Rate with stars
   - Select category (accuracy, usefulness, etc.)
   - Add comments
   - Mark if you applied it
4. AI learns and improves!
```

---

## 📊 **Track Learning Progress**

### View Analytics:
1. Go to **"Learning Analytics"** in sidebar
2. See metrics:
   - Total feedback provided
   - Positive ratio
   - Average star rating
   - AI confidence score
3. Review learning trends
4. Export feedback data

---

## 🚀 **Quick Start for Your Team**

### Step 1: Gather Resources
```
Collect all design-related PDFs:
- Brand guidelines
- Style guides  
- Design system docs
- Component libraries
```

### Step 2: Upload to Refyna
```
1. Open Refyna AI
2. Click "Design Resources"
3. Upload each PDF with appropriate type & tags
4. Verify upload in resources list
```

### Step 3: Start Using
```
1. Upload a design screenshot
2. Get AI feedback (now using your resources!)
3. Provide feedback on suggestions
4. Repeat and watch AI improve
```

---

## ❓ **FAQ**

### Q: How many PDFs can I upload?
**A:** No limit! Upload as many as you need. They're stored in your browser's localStorage.

### Q: Will the AI remember everything?
**A:** Yes! Every resource and every feedback is saved and used in future analyses.

### Q: Can I delete resources?
**A:** Yes, click the delete icon next to any resource in the "Design Resources" screen.

### Q: How long does training take?
**A:** The AI starts using resources immediately. Learning from feedback improves over time (typically 10-20 feedbacks show noticeable improvement).

### Q: Is my data private?
**A:** Yes! Everything is stored locally in your browser. Nothing is sent to external servers except when making API calls to Gemini.

### Q: Can multiple team members train the same AI?
**A:** Currently, each browser has its own training data. For team-wide learning, export feedback data and share resources.

---

## 🎯 **Example Training Session**

```
1. Upload "brand-guidelines.pdf"
   - Type: Brand Guidelines
   - Tags: colors, logo, typography

2. Upload design screenshot

3. AI analyzes and says:
   "The blue color (#0066FF) doesn't match your brand palette. 
   Use #0052CC instead (reference: brand-guidelines.pdf, page 12)"

4. You provide feedback:
   ⭐⭐⭐⭐⭐ (5 stars)
   Category: Accuracy
   Comment: "Perfect! Caught the color mismatch"
   ✅ Applied: Yes

5. Next time, AI prioritizes color accuracy even more!
```

---

## 📞 **Need Help?**

- Check `IMPLEMENTATION_PLAN.md` for technical details
- Review `PROGRESS_REPORT.md` for current features
- See `RATE_LIMITS.md` for API troubleshooting

---

**🎉 Your AI is now ready to learn from your team's design resources!**

Upload your PDFs and start training! 🚀
