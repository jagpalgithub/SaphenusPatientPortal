# SaphenusPatientPortal - Testing Environment

## Project Overview
This is the testing environment for the Saphenus Medical Technology Patient Management System. This environment is used for development, testing, and validation before deploying changes to production.

**Developer**: Jagpal  
**Environment**: Testing  
**Last Updated**: August 6, 2025

## Git Workflow

### Current Environment
- **Repository**: SaphenusPatientPortal-testing
- **Purpose**: Development and testing
- **Branch Strategy**: feature branches -> develop -> main

### Development Process

1. **Make Changes in Testing Environment**
   ```bash
   # Create a new feature branch
   git checkout -b feature/your-feature-name
   
   # Make your changes and test thoroughly
   # Run tests, validate functionality
   
   # Stage and commit changes
   git add .
   git commit -m "feat: describe your changes"
   ```

2. **Test Changes**
   - Verify all functionality works as expected
   - Test user workflows
   - Validate data integrity
   - Check performance

3. **Push to Repository**
   ```bash
   # Push feature branch
   git push origin feature/your-feature-name
   
   # Create pull request to develop branch
   ```

4. **Deploy to Production**
   ```bash
   # After approval, merge to main
   git checkout main
   git merge develop
   git push origin main
   
   # In production environment, pull changes
   git pull origin main
   ```

### Branch Structure
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `hotfix/*`: Critical production fixes

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/updates
- `chore:` Maintenance tasks

## Environment Configuration

### Testing Environment
- Database: Development PostgreSQL instance
- Storage: In-memory with test data
- Auth: Local authentication with test users

### Production Environment
- Database: Production PostgreSQL instance
- Storage: Persistent database storage
- Auth: Production authentication system

## Key Files to Track
- `shared/schema.ts` - Database schema
- `server/` - Backend API
- `client/src/` - Frontend application
- `package.json` - Dependencies
- `replit.md` - Project documentation

## Deployment Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] Database migrations (if any)
- [ ] Environment variables configured
- [ ] Performance validated
- [ ] Security review completed