#!/bin/bash

# WitnessOS Backend Deployment Script
# Deploys the consciousness API to Cloudflare Workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
API_URL=""
VALID_ENVIRONMENTS=("development" "staging" "production")

echo -e "${PURPLE}🚀 WitnessOS Backend Deployment Script${NC}"
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo ""

# Validate environment
if [[ ! " ${VALID_ENVIRONMENTS[@]} " =~ " ${ENVIRONMENT} " ]]; then
    echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}Valid environments: ${VALID_ENVIRONMENTS[*]}${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Deploying to: ${ENVIRONMENT}${NC}"

# Set API URL based on environment
case $ENVIRONMENT in
    "development")
        API_URL="https://witnessos-backend-dev.your-subdomain.workers.dev"
        ;;
    "staging")
        API_URL="https://api-staging.witnessos.com"
        ;;
    "production")
        API_URL="https://api.witnessos.com"
        ;;
esac

echo -e "${BLUE}🌐 Target URL: ${API_URL}${NC}"
echo ""

# Pre-deployment checks
echo -e "${YELLOW}🔍 Pre-deployment checks...${NC}"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
echo -e "${BLUE}🔐 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Please run: wrangler login${NC}"
    exit 1
fi

# Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

# TypeScript type checking
echo -e "${YELLOW}🧮 Running TypeScript checks...${NC}"
npx tsc --noEmit

# Run tests if they exist
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    npm test
else
    echo -e "${YELLOW}⏭️  No tests found, skipping...${NC}"
fi

# Create KV namespaces if they don't exist
echo -e "${YELLOW}🗄️  Setting up KV namespaces...${NC}"

create_kv_namespace() {
    local name=$1
    local env_suffix=$2
    
    echo -e "${BLUE}Creating KV namespace: ${name}_${env_suffix}${NC}"
    
    # Check if namespace exists
    if ! wrangler kv:namespace list | grep -q "${name}_${env_suffix}"; then
        wrangler kv:namespace create "${name}_${env_suffix}"
        echo -e "${GREEN}✅ Created KV namespace: ${name}_${env_suffix}${NC}"
    else
        echo -e "${GREEN}✅ KV namespace already exists: ${name}_${env_suffix}${NC}"
    fi
}

# Create namespaces based on environment
if [ "$ENVIRONMENT" == "production" ]; then
    create_kv_namespace "ENGINE_DATA" "PROD"
    create_kv_namespace "USER_PROFILES" "PROD"
    create_kv_namespace "CACHE" "PROD"
elif [ "$ENVIRONMENT" == "staging" ]; then
    create_kv_namespace "ENGINE_DATA" "STAGING"
    create_kv_namespace "USER_PROFILES" "STAGING"
    create_kv_namespace "CACHE" "STAGING"
else
    create_kv_namespace "ENGINE_DATA" "DEV"
    create_kv_namespace "USER_PROFILES" "DEV"
    create_kv_namespace "CACHE" "DEV"
fi

# Upload engine data to KV
echo -e "${YELLOW}📤 Uploading engine data to KV...${NC}"

if [ -d "data/kv-migration" ]; then
    echo -e "${BLUE}Found migrated data, uploading to KV...${NC}"
    
    # Run the KV upload script
    if [ -f "scripts/upload-to-kv.sh" ]; then
        chmod +x scripts/upload-to-kv.sh
        ./scripts/upload-to-kv.sh
    else
        echo -e "${YELLOW}⚠️  KV upload script not found, you may need to upload data manually${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No migrated data found in data/kv-migration${NC}"
    echo -e "${YELLOW}Run: npm run migrate-data to prepare KV data${NC}"
fi

# Deploy to Cloudflare Workers
echo -e "${YELLOW}🚀 Deploying to Cloudflare Workers...${NC}"

if [ "$ENVIRONMENT" == "development" ]; then
    wrangler deploy --env development
elif [ "$ENVIRONMENT" == "staging" ]; then
    wrangler deploy --env staging
else
    echo -e "${YELLOW}⚠️  Deploying to production. Are you sure? (y/N)${NC}"
    read -r confirmation
    if [[ $confirmation =~ ^[Yy]$ ]]; then
        wrangler deploy --env production
    else
        echo -e "${RED}❌ Production deployment cancelled${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""

# Post-deployment health check
echo -e "${YELLOW}🏥 Running health check...${NC}"

sleep 5  # Wait for deployment to propagate

# Health check
health_response=$(curl -s -w "%{http_code}" "${API_URL}/health" -o /tmp/health_response.json)
http_code=${health_response: -3}

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    echo -e "${BLUE}Health Response:${NC}"
    cat /tmp/health_response.json | python3 -m json.tool 2>/dev/null || cat /tmp/health_response.json
    echo ""
else
    echo -e "${RED}❌ Health check failed (HTTP ${http_code})${NC}"
    echo -e "${RED}Response:${NC}"
    cat /tmp/health_response.json
    echo ""
fi

# Test engine endpoints
echo -e "${YELLOW}🧪 Testing engine endpoints...${NC}"

# Test engines list
engines_response=$(curl -s -w "%{http_code}" "${API_URL}/engines" -o /tmp/engines_response.json)
engines_http_code=${engines_response: -3}

if [ "$engines_http_code" == "200" ]; then
    echo -e "${GREEN}✅ Engines endpoint working!${NC}"
    engine_count=$(cat /tmp/engines_response.json | python3 -c "import sys, json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "unknown")
    echo -e "${BLUE}Available engines: ${engine_count}${NC}"
else
    echo -e "${RED}❌ Engines endpoint failed (HTTP ${engines_http_code})${NC}"
fi

# Test a simple calculation
echo -e "${YELLOW}🔮 Testing numerology calculation...${NC}"

numerology_payload='{"input": {"birth_date": "1990-01-15", "full_name": "Test User"}}'
calc_response=$(curl -s -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$numerology_payload" \
    "${API_URL}/engines/numerology/calculate" \
    -o /tmp/calc_response.json)
calc_http_code=${calc_response: -3}

if [ "$calc_http_code" == "200" ]; then
    echo -e "${GREEN}✅ Engine calculation working!${NC}"
    confidence=$(cat /tmp/calc_response.json | python3 -c "import sys, json; print(json.load(sys.stdin)['confidence'])" 2>/dev/null || echo "unknown")
    echo -e "${BLUE}Calculation confidence: ${confidence}${NC}"
else
    echo -e "${RED}❌ Engine calculation failed (HTTP ${calc_http_code})${NC}"
    cat /tmp/calc_response.json
fi

# Cleanup temp files
rm -f /tmp/health_response.json /tmp/engines_response.json /tmp/calc_response.json

echo ""
echo -e "${PURPLE}🎉 DEPLOYMENT SUMMARY${NC}"
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}API URL: ${API_URL}${NC}"
echo -e "${GREEN}Health Check: ${http_code == "200" && echo "✅ PASSED" || echo "❌ FAILED"}${NC}"
echo -e "${GREEN}Engines: ${engines_http_code == "200" && echo "✅ WORKING" || echo "❌ FAILED"}${NC}"
echo -e "${GREEN}Calculations: ${calc_http_code == "200" && echo "✅ WORKING" || echo "❌ FAILED"}${NC}"

if [ "$http_code" == "200" ] && [ "$engines_http_code" == "200" ] && [ "$calc_http_code" == "200" ]; then
    echo ""
    echo -e "${PURPLE}🌟 WITNESSORS CONSCIOUSNESS API IS LIVE! 🌟${NC}"
    echo -e "${BLUE}Ready to transform reality through spiritual technology! ✨${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "${BLUE}• Update frontend API endpoints to: ${API_URL}${NC}"
    echo -e "${BLUE}• Monitor performance and error rates${NC}"
    echo -e "${BLUE}• Set up alerts and monitoring${NC}"
    echo -e "${BLUE}• Document API for users${NC}"
else
    echo ""
    echo -e "${RED}⚠️  Deployment completed but some tests failed${NC}"
    echo -e "${YELLOW}Please check the logs and fix any issues${NC}"
fi

echo ""
echo -e "${PURPLE}The consciousness revolution begins now! 🚀${NC}" 