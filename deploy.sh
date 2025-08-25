#!/bin/bash

# 🚀 Lead Management System Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 Starting Lead Management System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    print_status "Building production bundle..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build completed successfully!"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
    
    cd ..
}

# Check if Supabase CLI is installed
check_supabase() {
    print_status "Checking Supabase CLI..."
    
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install supabase/tap/supabase
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -fsSL https://supabase.com/install.sh | sh
        else
            print_error "Unsupported OS. Please install Supabase CLI manually."
            exit 1
        fi
    fi
    
    print_success "Supabase CLI is available!"
}

# Deploy to Supabase
deploy_supabase() {
    print_status "Deploying to Supabase..."
    
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        print_error "SUPABASE_PROJECT_REF environment variable not set."
        print_status "Please set it to your Supabase project reference (e.g., abcdefghijklmnop)"
        exit 1
    fi
    
    # Link project if not already linked
    if [ ! -f "supabase/.temp/project_id" ]; then
        print_status "Linking to Supabase project..."
        supabase link --project-ref $SUPABASE_PROJECT_REF
    fi
    
    # Deploy database schema
    print_status "Deploying database schema..."
    supabase db push
    
    # Deploy edge functions (if any)
    print_status "Deploying edge functions..."
    supabase functions deploy
    
    print_success "Supabase deployment completed!"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    cd frontend
    
    # Check if already linked to Vercel
    if [ ! -f ".vercel/project.json" ]; then
        print_status "Linking to Vercel project..."
        vercel link
    fi
    
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_success "Vercel deployment completed!"
    cd ..
}

# Main deployment function
main() {
    echo "🎯 Lead Management System Deployment"
    echo "=================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Build frontend
    build_frontend
    
    # Check Supabase CLI
    check_supabase
    
    # Ask user what to deploy
    echo ""
    echo "What would you like to deploy?"
    echo "1) Supabase Backend & Database"
    echo "2) Vercel Frontend"
    echo "3) Both"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_supabase
            ;;
        2)
            deploy_vercel
            ;;
        3)
            deploy_supabase
            deploy_vercel
            ;;
        4)
            print_status "Exiting deployment..."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment completed successfully! 🎉"
    echo ""
    echo "Next steps:"
    echo "1) Test your deployed application"
    echo "2) Update environment variables if needed"
    echo "3) Configure CORS settings in Supabase"
    echo "4) Set up monitoring and alerts"
    echo ""
    echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"
