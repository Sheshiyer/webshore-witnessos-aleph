#!/bin/bash

# WitnessOS Consolidated Deployment Script
# Deploys all services with proper Railway Python engine integration

set -e

echo "🚀 WitnessOS Consolidated Deployment"
echo "====================================="
echo ""

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

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    print_error "Not in WitnessOS project directory. Please run from project root."
    exit 1
fi

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local config_file=$2
    local environment=${3:-production}
    
    print_status "Deploying $service_name ($environment)..."
    
    if [ -f "$config_file" ]; then
        wrangler deploy --config "$config_file" --env "$environment"
        if [ $? -eq 0 ]; then
            print_success "$service_name deployed successfully!"
        else
            print_error "Failed to deploy $service_name"
            return 1
        fi
    else
        print_warning "Config file $config_file not found, skipping $service_name"
    fi
}

# Function to deploy all environments for a service
deploy_all_environments() {
    local service_name=$1
    local config_file=$2
    
    print_status "Deploying $service_name to all environments..."
    
    # Deploy to development
    deploy_service "$service_name" "$config_file" "development"
    
    # Deploy to staging
    deploy_service "$service_name" "$config_file" "staging"
    
    # Deploy to production
    deploy_service "$service_name" "$config_file" "production"
}

# Main deployment sequence
echo "📋 Deployment Plan:"
echo "1. Engine Proxy (Railway integration)"
echo "2. AI Service"
echo "3. Engine Service"
echo "4. Forecast Service"
echo "5. Consciousness Workflow"
echo "6. Integration Workflow"
echo "7. Main API Router"
echo ""

# Check Railway Python engines status
print_status "Checking Railway Python engines status..."
if curl -s "https://webshore-witnessos-aleph-production.up.railway.app/health" > /dev/null; then
    print_success "Railway Python engines are online"
else
    print_warning "Railway Python engines may be offline - check Railway dashboard"
fi

echo ""
print_status "Starting deployment sequence..."

# Deploy services in dependency order
deploy_all_environments "Engine Proxy" "wrangler-engine-proxy.toml"
deploy_all_environments "AI Service" "wrangler-ai-service.toml"
deploy_all_environments "Engine Service" "wrangler-engine-service.toml"
deploy_all_environments "Forecast Service" "wrangler-forecast-service.toml"
deploy_all_environments "Consciousness Workflow" "wrangler-consciousness-workflow.toml"
deploy_all_environments "Integration Workflow" "wrangler-integration-workflow.toml"

# Deploy main API router last
print_status "Deploying main API router..."
deploy_all_environments "API Router" "wrangler.toml"

echo ""
print_success "🎉 All services deployed successfully!"
echo ""
echo "📊 Service Status:"
echo "- Railway Python Engines: https://webshore-witnessos-aleph-production.up.railway.app"
echo "- API Router (Production): https://api-v2.witnessos.space"
echo "- API Router (Staging): https://api-staging.witnessos.space"
echo ""
echo "🔧 Next Steps:"
echo "1. Set secrets: wrangler secret put JWT_SECRET"
echo "2. Set secrets: wrangler secret put OPENROUTER_API_KEY"
echo "3. Set secrets: wrangler secret put RAILWAY_API_KEY"
echo "4. Test endpoints with curl or Postman"
echo "5. Monitor logs: wrangler tail"
echo ""
print_success "Deployment complete! 🚀" 