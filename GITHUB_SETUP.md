# GitHub Setup - Compare Fields Plugin

## 🎉 Git Repository is Ready!

The local Git repository has been successfully initialized and the first commit has been created.

---

## 📋 Next Steps: Upload Repository to GitHub

### Step 1: Create Private Repository on GitHub

1. **Go to GitHub**: https://github.com
2. **Click "New repository"** (green button at top right or at https://github.com/new)
3. **Fill in the details**:
   - **Repository name**: `lexicon-plugin-compare-fields` (or a name of your choice)
   - **Description**: `Compare Fields Plugin for Lexicon DJ - v3.0.5`
   - **Visibility**: ✅ **Private** (important!)
   - **Initialize repository**: ❌ **DO NOT** check "Add a README file" (we already have files)
   - **Add .gitignore**: ❌ **DO NOT** select (we already have one)
   - **Choose a license**: Optional (recommended: MIT License)
4. **Click "Create repository"**

### Step 2: Add Remote and Push

After creating the repository on GitHub, GitHub will show you commands. You need these commands:

```bash
# Navigate to plugin directory
cd /Users/joelkuhn/Documents/Lexicon/Plugins/scholee.suite

# Add GitHub as remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/lexicon-plugin-compare-fields.git

# Push code to GitHub
git push -u origin main
```

**IMPORTANT**: Replace `USERNAME` with your GitHub username!

### Step 3: Authentication

When pushing for the first time, you'll be asked for your GitHub credentials:

**Option A: Personal Access Token (recommended)**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo` (full access to private repositories)
4. Generate token and copy it
5. Use token as password when Git prompts for credentials

**Option B: SSH Key (advanced)**
- See: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## 📝 Future Updates

When you make changes to the plugin:

```bash
# 1. Navigate to directory
cd /Users/joelkuhn/Documents/Lexicon/Plugins/scholee.suite

# 2. Check changed files
git status

# 3. Add changes
git add .

# 4. Commit with description
git commit -m "Description of change"

# 5. Push to GitHub
git push
```

### Example for Version Update:

```bash
# After changing version number to 3.0.6
git add compare.fields.js CHANGELOG.md README.md
git commit -m "Update to v3.0.6: Fix XYZ"
git push
```

---

## 🏷️ Git Tags for Versions (optional)

To mark versions:

```bash
# Create tag for current version
git tag -a v3.0.5 -m "Version 3.0.5 - Stable release"

# Push tag to GitHub
git push origin v3.0.5

# Show all tags
git tag
```

---

## 📊 Repository Structure on GitHub

After upload, your repository will look like this:

```
lexicon-plugin-compare-fields/
├── .gitignore
├── CHANGELOG.md
├── README.md
├── compare.fields.js
├── config.json
├── create.playlist.js
├── test.edge.cases.js
├── test.html
└── test.playlist.workflow.js
```

---

## ✅ Checklist

- [x] Git repository initialized
- [x] .gitignore created
- [x] Initial commit created
- [ ] GitHub repository created (private)
- [ ] Remote added
- [ ] Code pushed to GitHub
- [ ] Optional: Release tag v3.0.5 created

---

## 🆘 Help

If you encounter problems:

**Check remote:**
```bash
git remote -v
```

**Change remote:**
```bash
git remote set-url origin https://github.com/USERNAME/lexicon-plugin-compare-fields.git
```

**Show commit history:**
```bash
git log --oneline
```

**Discard local changes:**
```bash
git reset --hard HEAD
```

---

**Good luck! 🚀**
