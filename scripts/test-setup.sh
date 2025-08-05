#!/bin/bash

# Test Setup Verification Script
# Verifies that the SaphenusPatientPortal testing environment is properly configured

echo "🏥 SaphenusPatientPortal Testing Environment Verification"
echo "========================================================"

# Check Node.js and npm
echo "📋 Checking Node.js environment..."
node --version
npm --version

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules installed"
    else
        echo "❌ node_modules not found - run 'npm install'"
    fi
else
    echo "❌ package.json not found"
fi

# Check key project files
echo "📁 Checking project structure..."
files_to_check=(
    "shared/schema.ts"
    "server/index.ts"
    "server/routes.ts"
    "server/storage.ts"
    "client/index.html"
    "client/src/App.tsx"
    "drizzle.config.ts"
    "vite.config.ts"
    "tailwind.config.ts"
    "tsconfig.json"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
    fi
done

# Check Git status
echo "🔄 Checking Git status..."
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    
    # Check if there are any untracked files
    if git status --porcelain | grep -q "^??"; then
        echo "⚠️  Untracked files found:"
        git status --porcelain | grep "^??"
    else
        echo "✅ No untracked files"
    fi
    
    # Check current branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo "📍 Current branch: $current_branch"
    
    # Check for commits
    if git rev-parse HEAD > /dev/null 2>&1; then
        echo "✅ Repository has commits"
        echo "📝 Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
    else
        echo "⚠️  No commits found"
    fi
else
    echo "❌ Git repository not initialized"
fi

# Check for environment variables
echo "🔧 Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "ℹ️  No .env file (using defaults)"
fi

# Test server startup (quick check)
echo "🚀 Testing server startup..."
timeout 10s npm run dev > /dev/null 2>&1 &
server_pid=$!
sleep 3

if kill -0 $server_pid > /dev/null 2>&1; then
    echo "✅ Server starts successfully"
    kill $server_pid > /dev/null 2>&1
else
    echo "❌ Server failed to start"
fi

# Summary
echo ""
echo "📊 Setup Summary"
echo "=================="
echo "Project: SaphenusPatientPortal Testing Environment"
echo "Status: Ready for development"
echo ""
echo "Next steps:"
echo "1. Make your changes in the testing environment"
echo "2. Test thoroughly using 'npm run dev'"
echo "3. Commit changes following the Git workflow"
echo "4. Deploy to production when ready"
echo ""
echo "For detailed instructions, see:"
echo "- README.md (Project overview)"
echo "- DEPLOYMENT-GUIDE.md (Git workflow)"
echo "- replit.md (Technical documentation)"