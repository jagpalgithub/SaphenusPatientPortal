# Git Workflow Tutorial for Beginners

## What You've Set Up
✅ Testing environment (this Replit project)  
✅ GitHub repository: https://github.com/jagpalgithub/saphenus-patient-portal.git  
✅ Documentation and helper scripts  

## Your First Practice Run

Let's practice with a simple change that won't break anything:

### **Step 1: Make a Small Change**

Edit the `README.md` file and add your name:

1. Click on `README.md` in the file list
2. Find the line that says "## Project Overview" 
3. Add a new line after it: `Created by: [Your Name]`
4. Save the file (Ctrl+S)

### **Step 2: Test Everything Still Works**

Your application should still be running. If not:
```bash
npm run dev
```

Check that the website loads properly in the webview.

### **Step 3: Use Git to Save Your Changes**

Open the **Shell** tab and run these commands:

```bash
# See what files you changed
git status

# Add your changes
git add README.md

# Save your changes with a message
git commit -m "docs: added creator name to README"

# Send changes to GitHub
git push origin main
```

### **Step 4: Check GitHub**

1. Go to https://github.com/jagpalgithub/saphenus-patient-portal
2. You should see your changes there!
3. Click on the commit message to see what changed

## Practice Development Workflow

Once you're comfortable, try this more advanced workflow:

### **Make a Feature Branch**
```bash
# Create a new branch for your work
git checkout -b feature/my-first-feature

# Make some changes (edit any file)
# Test your changes (npm run dev)

# Save your changes
git add .
git commit -m "feat: my first feature"

# Send to GitHub
git push origin feature/my-first-feature
```

### **Merge to Testing Branch**
```bash
# Switch to development branch
git checkout develop

# Combine your changes
git merge feature/my-first-feature

# Send to GitHub
git push origin develop
```

### **Deploy to Production**
```bash
# Switch to main branch (production)
git checkout main

# Combine tested changes
git merge develop

# Deploy to production
git push origin main
```

## Common Commands You'll Use

| Command | What It Does |
|---------|-------------|
| `git status` | Shows what files you changed |
| `git add .` | Prepares all changes for saving |
| `git commit -m "message"` | Saves changes with a description |
| `git push origin main` | Sends changes to GitHub |
| `git checkout -b feature/name` | Creates new work area |
| `git merge branch-name` | Combines changes from another branch |

## If Something Goes Wrong

### **Undo Last Commit**
```bash
git reset --soft HEAD~1
```

### **See What You Changed**
```bash
git diff
```

### **Get Help**
```bash
git --help
```

## Your Workflow Summary

1. **Make changes** in testing environment (Replit)
2. **Test thoroughly** - does everything work?
3. **Save with Git** - commit your changes
4. **Send to GitHub** - push to repository
5. **Deploy when ready** - merge to main branch

## Next Steps

After you're comfortable with basic Git:
1. Set up your production environment
2. Practice the full deployment workflow
3. Learn about database synchronization (we discussed earlier)

Remember: The testing environment is safe to experiment in. You can't break your live website from here!