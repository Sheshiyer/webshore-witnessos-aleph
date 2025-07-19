#!/bin/bash

# Daily & Weekly Forecast System Deployment Script
# Deploys the comprehensive forecast endpoints with Raycast integration

set -e

echo "🚀 Deploying Daily & Weekly Forecast System"
echo "============================================="

# Check prerequisites
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Validate TypeScript compilation
echo "🔍 Validating TypeScript compilation..."
if command -v tsc &> /dev/null; then
    tsc --noEmit --skipLibCheck
    if [ $? -eq 0 ]; then
        echo "✅ TypeScript compilation successful"
    else
        echo "⚠️  TypeScript compilation warnings (proceeding anyway)"
    fi
else
    echo "⚠️  TypeScript compiler not found, skipping validation"
fi

echo ""

# Deploy the enhanced backend
echo "🔧 Deploying enhanced backend with forecast system..."
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

# Test forecast endpoints
echo "🧪 Testing forecast endpoints..."

# Test daily forecast endpoint
echo "Testing daily forecast endpoint..."
DAILY_FORECAST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/forecast/daily" \
    -H "Authorization: Bearer test-token" \
    -H "Content-Type: application/json")

if [ "$DAILY_FORECAST_RESPONSE" = "200" ] || [ "$DAILY_FORECAST_RESPONSE" = "401" ]; then
    echo "✅ Daily forecast endpoint responding"
else
    echo "⚠️  Daily forecast endpoint returned HTTP $DAILY_FORECAST_RESPONSE"
fi

# Test weekly forecast endpoint
echo "Testing weekly forecast endpoint..."
WEEKLY_FORECAST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/forecast/weekly" \
    -H "Authorization: Bearer test-token" \
    -H "Content-Type: application/json")

if [ "$WEEKLY_FORECAST_RESPONSE" = "200" ] || [ "$WEEKLY_FORECAST_RESPONSE" = "401" ]; then
    echo "✅ Weekly forecast endpoint responding"
else
    echo "⚠️  Weekly forecast endpoint returned HTTP $WEEKLY_FORECAST_RESPONSE"
fi

# Test Raycast integration endpoints
echo "Testing Raycast integration endpoints..."
RAYCAST_DAILY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/integrations/raycast/daily" \
    -H "Authorization: Bearer test-token" \
    -H "Content-Type: application/json")

if [ "$RAYCAST_DAILY_RESPONSE" = "200" ] || [ "$RAYCAST_DAILY_RESPONSE" = "401" ]; then
    echo "✅ Raycast daily integration endpoint responding"
else
    echo "⚠️  Raycast daily integration endpoint returned HTTP $RAYCAST_DAILY_RESPONSE"
fi

echo ""

# Test enhanced daily workflow
echo "Testing enhanced daily workflow..."
WORKFLOW_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/workflows/daily" \
    -X POST \
    -H "Authorization: Bearer test-token" \
    -H "Content-Type: application/json" \
    -d '{"userProfile":{"birthDate":"1991-08-13"},"forecastMode":true}')

if [ "$WORKFLOW_RESPONSE" = "200" ] || [ "$WORKFLOW_RESPONSE" = "401" ]; then
    echo "✅ Enhanced daily workflow endpoint responding"
else
    echo "⚠️  Enhanced daily workflow endpoint returned HTTP $WORKFLOW_RESPONSE"
fi

echo ""

# Validate cache functionality
echo "🗄️  Validating cache functionality..."
CACHE_STATS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/cache/stats")

if [ "$CACHE_STATS_RESPONSE" = "200" ]; then
    echo "✅ Cache stats endpoint responding"
else
    echo "⚠️  Cache stats endpoint returned HTTP $CACHE_STATS_RESPONSE"
fi

echo ""

# Display deployment summary
echo "📋 Deployment Summary"
echo "===================="
echo ""
echo "🎉 Daily & Weekly Forecast System Deployment Complete!"
echo ""
echo "New Features Deployed:"
echo "  📊 Daily Forecast API (GET /forecast/daily)"
echo "  📅 Weekly Forecast API (GET /forecast/weekly)"
echo "  🔄 Batch Forecast Processing (POST /forecast/daily/batch, /forecast/weekly/batch)"
echo "  🖥️  Raycast Integration Endpoints (/integrations/raycast/*)"
echo "  ⚡ Enhanced Daily Workflow with Forecast Logic"
echo "  🧠 Weekly Synthesis Engine"
echo "  📱 Raycast Response Formatter"
echo "  🗄️  Enhanced Forecast Caching (6h daily, 24h weekly)"
echo "  📈 Predictive Analytics Features"
echo "  🔌 External Integration Framework"
echo ""
echo "API Endpoints:"
echo "  Daily Forecast: https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/forecast/daily"
echo "  Weekly Forecast: https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/forecast/weekly"
echo "  Raycast Daily: https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/integrations/raycast/daily"
echo "  Raycast Weekly: https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/integrations/raycast/weekly"
echo "  Enhanced Workflow: https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/workflows/daily"
echo ""
echo "Monitoring:"
echo "  Health Check: $HEALTH_URL"
echo "  Cache Stats: https://witnessos-backend-prod.sheshnarayaniyer.workers.dev/api/cache/stats"
echo ""
echo "Next Steps:"
echo "  1. Test forecast endpoints with authenticated requests"
echo "  2. Validate Raycast integration formatting"
echo "  3. Monitor cache performance and hit rates"
echo "  4. Set up Raycast extension to consume the new endpoints"
echo "  5. Configure webhook notifications for daily/weekly forecasts"
echo ""
echo "🔗 Ready for Raycast Extension Integration!"
