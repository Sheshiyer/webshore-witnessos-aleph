#!/bin/bash

# WitnessOS Deployment Script
# Automated deployment to Cloudflare Pages and Workers

set -e  # Exit on any error

echo "🚀 WitnessOS Deployment Pipeline"
echo "================================"

# Environment configuration
ENVIRONMENT=${1:-production}
FRONTEND_PROJECT="witnessos-frontend"
BACKEND_PROJECT="witnessos-backend"

# API URLs by environment
if [[ "$ENVIRONMENT" == "staging" ]]; then
  API_URL="https://api-staging.witnessos.space"
elif [[ "$ENVIRONMENT" == "production" ]]; then
  API_URL="https://api.witnessos.space"
else
  API_URL="http://localhost:8787"
fi

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   API URL: $API_URL"
echo ""

# Step 1: Backend Deployment (Cloudflare Workers)
echo "🔧 Step 1: Deploying Backend (Cloudflare Workers)"
echo "================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Deploy backend
echo "📦 Building and deploying Workers..."
if [[ "$ENVIRONMENT" == "staging" ]]; then
  wrangler deploy --env staging
else
  wrangler deploy
fi

echo "✅ Backend deployed successfully!"
echo ""

# Step 2: Frontend Deployment (Cloudflare Pages)
echo "🎨 Step 2: Deploying Frontend (Cloudflare Pages)"  
echo "==============================================="

# Set API URL for frontend build
export NEXT_PUBLIC_API_URL="$API_URL"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
if [[ "$ENVIRONMENT" == "staging" ]]; then
  npx wrangler pages deploy dist --project-name "$FRONTEND_PROJECT" --compatibility-date=2024-12-01 --branch staging
else
  npx wrangler pages deploy dist --project-name "$FRONTEND_PROJECT" --compatibility-date=2024-12-01
fi

echo "✅ Frontend deployed successfully!"
echo ""

# Step 3: Post-deployment verification
echo "🔍 Step 3: Post-deployment Verification"
echo "======================================="

# Wait for deployment to propagate
echo "⏳ Waiting for deployment to propagate..."
sleep 10

# Test backend health
echo "🏥 Testing backend health..."
if curl -f "$API_URL/health" > /dev/null 2>&1; then
  echo "✅ Backend health check passed"
else
  echo "⚠️  Backend health check failed"
fi

# Test engine endpoint
echo "🧠 Testing engine endpoint..."
if curl -f "$API_URL/engines" > /dev/null 2>&1; then
  echo "✅ Engine endpoint accessible"
else
  echo "⚠️  Engine endpoint failed"
fi

# Display deployment URLs
echo ""
echo "🎉 Deployment Complete!"
echo "====================="
if [[ "$ENVIRONMENT" == "staging" ]]; then
  echo "🌐 Frontend: https://staging.witnessos.com"
  echo "🔗 Backend:  https://api-staging.witnessos.space"
elif [[ "$ENVIRONMENT" == "production" ]]; then
  echo "🌐 Frontend: https://witnessos.com" 
  echo "🔗 Backend:  https://api.witnessos.space"
else
  echo "🌐 Frontend: http://localhost:3000"
  echo "🔗 Backend:  http://localhost:8787"
fi

echo ""
echo "✨ WitnessOS is now live and ready for consciousness exploration!" 