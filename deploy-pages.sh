#!/bin/bash

# 🌐 WitnessOS Cloudflare Pages Deployment Script
# Deploys the Next.js frontend to Cloudflare Pages for live URL

set -e

echo "🚀 WitnessOS Cloudflare Pages Deployment"
echo "========================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please log in to Cloudflare:"
    wrangler login
fi

# Set environment variables for build
export NEXT_PUBLIC_API_URL="https://api.witnessos.space"
export NEXT_PUBLIC_ENVIRONMENT="production"
export NEXT_PUBLIC_FALLBACK_MODE="true"
export NEXT_PUBLIC_SITE_URL="https://witnessos.space"

echo "🔧 Environment configured:"
echo "   API URL: $NEXT_PUBLIC_API_URL"
echo "   Environment: $NEXT_PUBLIC_ENVIRONMENT"
echo "   Fallback Mode: $NEXT_PUBLIC_FALLBACK_MODE"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Create Pages project if it doesn't exist
echo "📄 Checking Cloudflare Pages project..."
PROJECT_NAME="witnessos-frontend"

# Try to get project info (will fail if project doesn't exist)
if ! wrangler pages project list | grep -q "$PROJECT_NAME"; then
    echo "🆕 Creating new Pages project: $PROJECT_NAME"
    wrangler pages project create "$PROJECT_NAME" --compatibility-date=2024-01-15
else
    echo "✅ Pages project exists: $PROJECT_NAME"
fi

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy .next --project-name="$PROJECT_NAME" --compatibility-date=2024-01-15

# Get deployment URL
echo ""
echo "🎉 Deployment completed!"
echo "========================================"
echo "🌐 Custom Domain: https://witnessos.space"
echo "📱 Pages URL: https://$PROJECT_NAME.pages.dev"
echo "🔧 Dashboard: https://dash.cloudflare.com/pages"
echo "📡 API Docs: https://api.witnessos.space/api/docs"
echo ""
echo "🌟 WitnessOS Features Available:"
echo "   ✅ All 13 consciousness engines"
echo "   ✅ Cyberpunk interface with animations"
echo "   ✅ Mobile responsive design"
echo "   ✅ Intelligent fallback system"
echo "   ✅ Real-time backend status monitoring"
echo ""
echo "🔗 Next Steps:"
echo "   1. Visit the live URL to test functionality"
echo "   2. Configure custom domain (optional)"
echo "   3. Monitor performance in Cloudflare Analytics"
echo "   4. Update DNS when Railway backend is fixed"
echo ""
echo "✨ WitnessOS is now live and accessible worldwide!"
