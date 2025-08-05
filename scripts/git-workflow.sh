#!/bin/bash

# Git Workflow Management Script for SaphenusPatientPortal
# This script helps manage the development workflow between testing and production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TESTING_BRANCH="develop"
PRODUCTION_BRANCH="main"
REMOTE_NAME="origin"

# Helper functions
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

check_git_status() {
    if [[ $(git status --porcelain) ]]; then
        print_warning "You have uncommitted changes. Please commit or stash them first."
        git status --short
        exit 1
    fi
}

# Main functions
init_repository() {
    print_status "Initializing Git repository for SaphenusPatientPortal-testing..."
    
    # Configure Git if not already configured
    if ! git config user.name > /dev/null 2>&1; then
        read -p "Enter your Git username: " username
        git config user.name "$username"
    fi
    
    if ! git config user.email > /dev/null 2>&1; then
        read -p "Enter your Git email: " email
        git config user.email "$email"
    fi
    
    # Create initial commit if repository is empty
    if ! git rev-parse HEAD > /dev/null 2>&1; then
        print_status "Creating initial commit..."
        git add .
        git commit -m "feat: initial commit - SaphenusPatientPortal testing environment"
        print_success "Initial commit created"
    fi
    
    # Create develop branch if it doesn't exist
    if ! git show-ref --verify --quiet refs/heads/$TESTING_BRANCH; then
        print_status "Creating $TESTING_BRANCH branch..."
        git checkout -b $TESTING_BRANCH
        print_success "$TESTING_BRANCH branch created"
    fi
    
    print_success "Git repository initialized successfully"
}

create_feature_branch() {
    local feature_name=$1
    if [[ -z "$feature_name" ]]; then
        read -p "Enter feature name (e.g., database-sync): " feature_name
    fi
    
    local branch_name="feature/$feature_name"
    
    check_git_status
    
    print_status "Creating feature branch: $branch_name"
    git checkout $TESTING_BRANCH
    git pull $REMOTE_NAME $TESTING_BRANCH 2>/dev/null || true
    git checkout -b $branch_name
    
    print_success "Feature branch $branch_name created and checked out"
    echo ""
    echo "Next steps:"
    echo "1. Make your changes"
    echo "2. Test thoroughly"
    echo "3. Run: $0 commit 'your commit message'"
    echo "4. Run: $0 push-feature"
}

commit_changes() {
    local commit_message=$1
    if [[ -z "$commit_message" ]]; then
        read -p "Enter commit message: " commit_message
    fi
    
    print_status "Staging and committing changes..."
    git add .
    git commit -m "$commit_message"
    
    print_success "Changes committed: $commit_message"
}

push_feature() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    if [[ ! $current_branch == feature/* ]]; then
        print_error "You must be on a feature branch to push changes"
        exit 1
    fi
    
    print_status "Pushing feature branch: $current_branch"
    git push -u $REMOTE_NAME $current_branch
    
    print_success "Feature branch pushed to remote"
    echo ""
    echo "Next steps:"
    echo "1. Create a pull request to merge into $TESTING_BRANCH"
    echo "2. After review and approval, run: $0 merge-to-testing"
}

merge_to_testing() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    check_git_status
    
    print_status "Merging $current_branch to $TESTING_BRANCH..."
    git checkout $TESTING_BRANCH
    git pull $REMOTE_NAME $TESTING_BRANCH 2>/dev/null || true
    git merge $current_branch
    git push $REMOTE_NAME $TESTING_BRANCH
    
    print_success "Changes merged to $TESTING_BRANCH"
    
    # Optionally delete feature branch
    read -p "Delete feature branch $current_branch? (y/N): " delete_branch
    if [[ $delete_branch =~ ^[Yy]$ ]]; then
        git branch -d $current_branch
        git push $REMOTE_NAME --delete $current_branch 2>/dev/null || true
        print_success "Feature branch $current_branch deleted"
    fi
}

deploy_to_production() {
    check_git_status
    
    print_warning "This will deploy changes to production. Are you sure?"
    read -p "Type 'YES' to continue: " confirmation
    
    if [[ "$confirmation" != "YES" ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
    
    print_status "Deploying to production..."
    git checkout $PRODUCTION_BRANCH
    git pull $REMOTE_NAME $PRODUCTION_BRANCH 2>/dev/null || true
    git merge $TESTING_BRANCH
    git push $REMOTE_NAME $PRODUCTION_BRANCH
    
    print_success "Changes deployed to production branch"
    echo ""
    echo "IMPORTANT: Now update your production environment:"
    echo "1. SSH/access your production server"
    echo "2. Run: git pull origin $PRODUCTION_BRANCH"
    echo "3. Restart your application services"
    echo "4. Verify deployment success"
}

sync_from_production() {
    print_status "Syncing latest changes from production..."
    
    check_git_status
    
    git checkout $PRODUCTION_BRANCH
    git pull $REMOTE_NAME $PRODUCTION_BRANCH
    
    git checkout $TESTING_BRANCH
    git pull $REMOTE_NAME $TESTING_BRANCH 2>/dev/null || true
    git merge $PRODUCTION_BRANCH
    
    print_success "Testing environment synced with production"
}

show_status() {
    print_status "Git Repository Status"
    echo ""
    echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "Remote URL: $(git remote get-url $REMOTE_NAME 2>/dev/null || echo 'Not set')"
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    echo ""
    echo "Branch information:"
    git branch -a
    echo ""
    if [[ $(git status --porcelain) ]]; then
        echo "Uncommitted changes:"
        git status --short
    else
        echo "Working directory clean"
    fi
}

# Main script logic
case ${1:-""} in
    "init")
        init_repository
        ;;
    "feature")
        create_feature_branch "$2"
        ;;
    "commit")
        commit_changes "$2"
        ;;
    "push-feature")
        push_feature
        ;;
    "merge-to-testing")
        merge_to_testing
        ;;
    "deploy")
        deploy_to_production
        ;;
    "sync")
        sync_from_production
        ;;
    "status")
        show_status
        ;;
    *)
        echo "SaphenusPatientPortal Git Workflow Manager"
        echo ""
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  init                    Initialize Git repository"
        echo "  feature <name>          Create new feature branch"
        echo "  commit '<message>'      Commit current changes"
        echo "  push-feature           Push feature branch to remote"
        echo "  merge-to-testing       Merge feature to testing branch"
        echo "  deploy                 Deploy testing to production"
        echo "  sync                   Sync from production to testing"
        echo "  status                 Show repository status"
        echo ""
        echo "Example workflow:"
        echo "  $0 init"
        echo "  $0 feature database-sync"
        echo "  # Make your changes..."
        echo "  $0 commit 'feat: add database synchronization'"
        echo "  $0 push-feature"
        echo "  $0 merge-to-testing"
        echo "  $0 deploy"
        ;;
esac