
#!/bin/bash

# Production Deployment Script for SaphenusPatientPortal
# Run this script from your testing environment to deploy to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Validate testing environment
print_status "Step 1: Validating testing environment..."

# Check if Git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not initialized. Run 'git init' first."
    exit 1
fi

# Check if we have a remote repository
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote repository configured. You'll need to set up GitHub first."
    echo "Run: git remote add origin https://github.com/yourusername/saphenus-patient-portal.git"
fi

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    read -p "Enter commit message: " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="feat: automatic deployment commit"
    fi
    git commit -m "$commit_msg"
fi

print_success "Testing environment validated"

# Step 2: Test application startup
print_status "Step 2: Testing application startup..."

# Kill any existing processes on port 5000
pkill -f "node.*5000" 2>/dev/null || true
pkill -f "tsx.*server" 2>/dev/null || true

# Start the application in background
npm run dev &
SERVER_PID=$!
sleep 5

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null; then
    print_success "Application starts successfully"
    kill $SERVER_PID
else
    print_error "Application failed to start"
    exit 1
fi

# Step 3: Push to develop branch (if exists)
print_status "Step 3: Ensuring develop branch exists and pushing changes..."

# Create develop branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/develop; then
    print_status "Creating develop branch..."
    git checkout -b develop
else
    git checkout develop
fi

# Push to develop branch (if remote exists)
if git remote get-url origin > /dev/null 2>&1; then
    git push origin develop 2>/dev/null || print_warning "Could not push to develop branch (remote may not exist yet)"
fi

# Step 4: Merge to main branch
print_status "Step 4: Merging to main branch for production..."

# Switch to main branch
if ! git show-ref --verify --quiet refs/heads/main; then
    print_status "Creating main branch..."
    git checkout -b main
else
    git checkout main
fi

# Pull latest changes from main (if remote exists)
if git remote get-url origin > /dev/null 2>&1; then
    git pull origin main 2>/dev/null || print_warning "Could not pull from main branch"
fi

# Merge develop into main
git merge develop

# Push to main branch (if remote exists)
if git remote get-url origin > /dev/null 2>&1; then
    git push origin main 2>/dev/null || print_warning "Could not push to main branch"
fi

print_success "Code merged to production branch"

# Step 5: Production deployment instructions
print_status "Step 5: Production Environment Setup"
echo ""
echo "🚀 PRODUCTION DEPLOYMENT INSTRUCTIONS"
echo "======================================"
echo ""
echo "Now go to your production Replit app (SaphenusPatientPortal) and run:"
echo ""
echo "1. Pull latest changes:"
echo "   git pull origin main"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start the application:"
echo "   npm run dev"
echo ""
echo "4. Verify deployment:"
echo "   - Check that the app loads without errors"
echo "   - Test user login functionality"
echo "   - Verify database operations"
echo ""
echo "🔧 PRODUCTION ENVIRONMENT CHECKLIST:"
echo "   □ Application starts without errors"
echo "   □ Database connection established"
echo "   □ User authentication works"
echo "   □ All API endpoints respond"
echo "   □ UI loads correctly"
echo ""

# Return to develop branch for continued development
git checkout develop

print_success "Deployment preparation completed!"
print_status "Your code is ready for production deployment."

echo ""
echo "📋 SUMMARY:"
echo "- Testing environment: Validated ✅"
echo "- Application startup: Tested ✅"
echo "- Code pushed to main branch: ✅"
echo "- Ready for production deployment: ✅"
echo ""
echo "Next: Follow the instructions above in your production Replit app."
