#!/bin/bash

# Phase 1 Infrastructure Scaling Deployment Script
# Applies database migrations and deploys backend improvements

set -e

echo "🚀 Deploying Phase 1 Infrastructure Scaling Improvements"
echo "========================================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Apply database migrations
echo "📊 Applying database performance indexes..."
MIGRATION_FILE="database/migrations/phase1-performance-indexes-fixed.sql"

if [ -f "$MIGRATION_FILE" ]; then
    echo "Using migration file: $MIGRATION_FILE"

    # Test migration on local database first
    echo "🧪 Testing migration on local database..."
    if wrangler d1 execute witnessos-db --file="$MIGRATION_FILE" --local; then
        echo "✅ Local migration test successful"

        # Apply to remote database
        echo "🚀 Applying migration to remote database..."
        if wrangler d1 execute witnessos-db --file="$MIGRATION_FILE" --remote; then
            echo "✅ Remote database indexes applied successfully"
        else
            echo "❌ Remote database migration failed"
            echo "💡 Local migration succeeded, but remote failed. Check Cloudflare D1 console."
            exit 1
        fi
    else
        echo "❌ Local migration test failed"
        echo "💡 Please check the migration file for SQLite compatibility issues"
        exit 1
    fi
else
    echo "❌ Migration file not found: $MIGRATION_FILE"
    echo "Available migration files:"
    ls -la database/migrations/ || echo "No migrations directory found"
    exit 1
fi

echo ""

# Deploy the backend with improvements
echo "🔧 Deploying backend improvements..."
wrangler deploy --env production

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully"
else
    echo "❌ Backend deployment failed"
    exit 1
fi

echo ""

# Run health check
echo "🏥 Running health check..."
HEALTH_URL="https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/health"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $HEALTH_RESPONSE)"
    exit 1
fi

echo ""

# Run Phase 1 test suite
echo "🧪 Running Phase 1 test suite..."
if [ -f "scripts/test-phase1-improvements.js" ]; then
    node scripts/test-phase1-improvements.js
    
    if [ $? -eq 0 ]; then
        echo "✅ All Phase 1 tests passed"
    else
        echo "⚠️  Some tests failed, but deployment is complete"
    fi
else
    echo "⚠️  Test suite not found, skipping tests"
fi

echo ""
echo "🎉 Phase 1 Infrastructure Scaling Deployment Complete!"
echo ""
echo "Improvements deployed:"
echo "  📊 Database performance indexes"
echo "  📚 Reading history optimization"
echo "  🧠 Intelligent caching strategy"
echo "  👤 User profile persistence enhancement"
echo "  🔌 OpenRouter circuit breaker pattern"
echo "  🔮 AI synthesis caching"
echo ""
echo "Backend URL: https://witnessos-backend-prod.sheshnarayaniyer.workers.dev"
echo "Health Check: $HEALTH_URL"
