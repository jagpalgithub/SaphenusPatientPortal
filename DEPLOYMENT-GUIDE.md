# SaphenusPatientPortal Deployment Guide

## Overview
This guide explains how to manage changes between your testing environment (SaphenusPatientPortal-testing) and production environment (SaphenusPatientPortal) using Git version control.

## Current Setup Status
✅ Git repository already initialized in Replit  
✅ Enhanced .gitignore configured  
✅ Project documentation updated  
✅ Workflow scripts created  

## Manual Git Workflow (Recommended)

Since Replit has Git protections in place, follow these manual steps:

### 1. Initial Setup (One-time)

#### In Testing Environment (Current Project):
```bash
# Check current status
git status

# Configure Git user (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all current files
git add .
git commit -m "feat: initial testing environment setup"

# Create develop branch for ongoing development
git checkout -b develop

# Set up remote repository (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/saphenus-patient-portal.git
git push -u origin main
git push -u origin develop
```

#### In Production Environment:
```bash
# Clone the repository
git clone https://github.com/yourusername/saphenus-patient-portal.git
cd saphenus-patient-portal

# Checkout production branch
git checkout main
```

### 2. Development Workflow

#### Making Changes in Testing Environment:
```bash
# 1. Create feature branch
git checkout develop
git pull origin develop  # Get latest changes
git checkout -b feature/your-feature-name

# 2. Make your changes
# - Edit files
# - Test functionality
# - Verify everything works

# 3. Commit changes
git add .
git commit -m "feat: describe your changes"

# 4. Push feature branch
git push origin feature/your-feature-name
```

#### Testing and Validation:
- Run application: `npm run dev`
- Test all user workflows
- Check console for errors
- Validate database operations
- Verify UI functionality

#### Merging to Testing Branch:
```bash
# 1. Switch to develop branch
git checkout develop
git pull origin develop

# 2. Merge feature branch
git merge feature/your-feature-name
git push origin develop

# 3. Clean up feature branch (optional)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### 3. Production Deployment

#### Deploying to Production:
```bash
# In testing environment
git checkout main
git pull origin main
git merge develop
git push origin main
```

#### Updating Production Environment:
```bash
# In production environment
git pull origin main

# Install any new dependencies
npm install

# Run database migrations (if any)
npm run db:migrate

# Restart application
npm run dev
```

## Repository Structure

### Branches:
- `main`: Production-ready code
- `develop`: Integration branch for testing
- `feature/*`: Individual feature development
- `hotfix/*`: Critical production fixes

### Key Files to Track:
```
├── client/src/           # Frontend React application
├── server/              # Backend Express.js API
├── shared/schema.ts     # Database schema definitions
├── package.json         # Project dependencies
├── README.md           # Project documentation
├── DEPLOYMENT-GUIDE.md # This deployment guide
└── scripts/            # Automation scripts
```

## Pre-Deployment Checklist

### Testing Environment Validation:
- [ ] Application starts without errors
- [ ] All pages load correctly
- [ ] User authentication works
- [ ] Database operations function properly
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

### Production Deployment:
- [ ] All tests pass in testing environment
- [ ] Code reviewed and approved
- [ ] Database backup created
- [ ] Environment variables configured
- [ ] Dependencies updated
- [ ] Performance benchmarks met
- [ ] Security review completed

## Rollback Procedure

If issues occur in production:

```bash
# In production environment
git log --oneline -5  # Find last working commit
git reset --hard <commit-hash>
git push --force-with-lease origin main

# Or revert specific commit
git revert <problematic-commit-hash>
git push origin main
```

## Environment Configuration

### Testing Environment:
- Database: Development PostgreSQL
- Authentication: Test user accounts
- Logging: Debug level enabled
- Error reporting: Detailed stack traces

### Production Environment:
- Database: Production PostgreSQL
- Authentication: Real user accounts
- Logging: Error level only
- Error reporting: User-friendly messages

## Automated Synchronization (Future Enhancement)

For the database synchronization feature discussed earlier, implement after establishing stable Git workflow:

1. **Database Replication Setup**
2. **Data Masking Implementation**
3. **Monitoring and Alerting**

Estimated additional cost: $15-25/month as analyzed previously.

## Troubleshooting

### Common Issues:

1. **Merge Conflicts**
   ```bash
   git status  # Check conflicted files
   # Edit files to resolve conflicts
   git add .
   git commit -m "fix: resolve merge conflicts"
   ```

2. **Lost Changes**
   ```bash
   git reflog  # Find lost commits
   git checkout <commit-hash>
   git checkout -b recovery-branch
   ```

3. **Production Sync Issues**
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

## Next Steps

1. **Set up remote Git repository** (GitHub/GitLab)
2. **Configure SSH keys** for secure access
3. **Implement automated testing** (CI/CD pipeline)
4. **Set up monitoring** for production deployments
5. **Configure backup strategies** for both code and data

---

**Contact Information:**
- For Git workflow questions: Review this guide
- For deployment issues: Check troubleshooting section
- For emergency rollbacks: Follow rollback procedure above