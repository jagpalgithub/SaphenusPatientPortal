# Quick Deploy Reference

## For Testing Environment Changes

```bash
# 1. Create feature branch
git checkout -b feature/your-change

# 2. Make changes and test
npm run dev  # Test your changes

# 3. Commit changes
git add .
git commit -m "feat: describe your changes"

# 4. Merge to develop
git checkout develop
git merge feature/your-change
git push origin develop

# 5. Deploy to production
git checkout main
git merge develop
git push origin main
```

## For Production Environment

```bash
# Pull latest changes
git pull origin main

# Install dependencies (if changed)
npm install

# Restart application
npm run dev
```

## Emergency Rollback

```bash
# Find last working commit
git log --oneline -5

# Rollback to specific commit
git reset --hard <commit-hash>
git push --force-with-lease origin main
```

## Verification Commands

```bash
# Check application health
./scripts/test-setup.sh

# View Git status
git status
git log --oneline -5

# Test server startup
npm run dev
```