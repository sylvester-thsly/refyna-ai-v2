# 🚀 GitHub Push Checklist

## ✅ **Pre-Push Security Checklist**

### **CRITICAL - Must Do Before Pushing:**

- [x] ✅ `.env` is in `.gitignore`
- [x] ✅ `.env.local` is in `.gitignore`
- [ ] ⚠️ **Check for API keys in code** (run command below)
- [ ] ⚠️ **Remove any hardcoded secrets**
- [ ] ⚠️ **Verify `.env` is not staged**

---

## 🔍 **Security Scan Commands:**

### **1. Check if `.env` is staged:**
```bash
git status
```
**Look for:** `.env` should NOT appear in "Changes to be committed"

### **2. Search for API keys in code:**
```bash
# Windows PowerShell:
Get-ChildItem -Recurse -File | Select-String -Pattern "AIza|sk-|VITE_GEMINI_API_KEY\s*=\s*['\"](?!your-)" | Select-Object Path, LineNumber, Line

# Or use grep (if installed):
grep -r "AIza\|sk-\|VITE_GEMINI_API_KEY.*=" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md"
```

### **3. Check git history for secrets:**
```bash
git log --all --full-history --source -- .env
```
**Should return:** Nothing (if .env was never committed)

---

## 📝 **What to Push:**

### **✅ Safe to Push:**
```
✅ All .ts/.tsx files
✅ All .md documentation files
✅ package.json
✅ tsconfig.json
✅ vite.config.ts
✅ index.html
✅ .gitignore
✅ .env.example (template only!)
✅ README.md
```

### **❌ Never Push:**
```
❌ .env (contains your API key!)
❌ .env.local
❌ node_modules/
❌ dist/
❌ Any file with real API keys
```

---

## 🎯 **Pre-Push Steps:**

### **Step 1: Clean Up Test Files**
```bash
# Remove test files (optional):
rm test-api-key.js
rm list-models.js
```

### **Step 2: Verify .env is Protected**
```bash
# This should show .env is ignored:
git check-ignore .env
# Output should be: .env
```

### **Step 3: Check What Will Be Committed**
```bash
git status
git diff --cached
```

### **Step 4: Stage Files**
```bash
# Stage all safe files:
git add .

# Verify .env is NOT staged:
git status
```

### **Step 5: Commit**
```bash
git commit -m "feat: Add self-learning AI with PDF training and token optimization

- Implemented PDF resource upload and analysis
- Added self-learning feedback system with analytics
- Created token-efficient AI training (99% savings)
- Built enhanced feedback form with star ratings
- Added learning analytics dashboard
- Comprehensive documentation (7 guides)
- Token monitoring and optimization
"
```

### **Step 6: Push**
```bash
git push origin main
```

---

## 🔒 **If You Accidentally Committed .env:**

### **Remove from Git History:**
```bash
# Remove .env from git cache:
git rm --cached .env

# Commit the removal:
git commit -m "chore: Remove .env from tracking"

# Push:
git push origin main
```

### **If .env is in History:**
```bash
# Use BFG Repo Cleaner or git filter-branch
# Better: Create new repo and copy files without .env
```

### **Rotate API Key:**
```
1. Go to https://aistudio.google.com/app/apikey
2. Delete old API key
3. Create new API key
4. Update .env with new key
```

---

## 📚 **Update README Before Pushing:**

Make sure README.md has:
- [x] Clear project description
- [x] Setup instructions
- [x] API key setup (using .env.example)
- [x] Features list
- [x] Documentation links
- [x] License
- [x] Contributing guidelines

---

## ✅ **Final Checklist:**

- [ ] `.env` is in `.gitignore`
- [ ] `.env` is NOT in git status
- [ ] No API keys in code
- [ ] README.md is updated
- [ ] .env.example exists
- [ ] Documentation is complete
- [ ] Test files removed (optional)
- [ ] Commit message is clear
- [ ] Ready to push!

---

## 🎉 **After Pushing:**

### **1. Verify on GitHub:**
```
- Check .env is NOT visible
- Check .env.example IS visible
- Check README renders correctly
- Check all docs are there
```

### **2. Test Clone:**
```bash
# Clone in a different folder:
cd /tmp
git clone https://github.com/yourusername/Refyna-AI.git
cd Refyna-AI

# Verify .env is missing (good!)
# Verify .env.example exists (good!)
```

### **3. Add Topics/Tags:**
```
On GitHub repo:
- ai
- design
- gemini
- machine-learning
- design-system
- ui-ux
- self-learning
- pdf-training
```

---

## 🚀 **You're Ready to Push!**

Run the commands above and you're good to go! 🎉
