#!/bin/bash

# Enhanced Architecture Deployment Script for WitnessOS
# Deploys all service workers in the correct order with dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DRY_RUN=${2:-false}

echo -e "${BLUE}🚀 WitnessOS Enhanced Architecture Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Dry Run: ${DRY_RUN}${NC}"
echo ""

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Function to log warnings
warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Function to log errors
error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        error "Wrangler CLI not found. Please install it first:"
        echo "npm install -g wrangler"
        exit 1
    fi
    
    log "Wrangler CLI found: $(wrangler --version)"
}

# Function to check authentication
check_auth() {
    if ! wrangler whoami &> /dev/null; then
        error "Not authenticated with Cloudflare. Please run:"
        echo "wrangler login"
        exit 1
    fi
    
    log "Authenticated with Cloudflare: $(wrangler whoami)"
}

# Function to build the project
build_project() {
    log "Building project..."
    
    if [ "$DRY_RUN" = "false" ]; then
        npm run build
        if [ $? -eq 0 ]; then
            log "Build completed successfully"
        else
            error "Build failed"
            exit 1
        fi
    else
        log "DRY RUN: Would build project"
    fi
}

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local config_file=$2
    local description=$3
    
    log "Deploying ${service_name} (${description})..."
    
    if [ "$DRY_RUN" = "false" ]; then
        wrangler deploy --config "${config_file}" --env "${ENVIRONMENT}"
        if [ $? -eq 0 ]; then
            log "${service_name} deployed successfully"
        else
            error "Failed to deploy ${service_name}"
            exit 1
        fi
    else
        log "DRY RUN: Would deploy ${service_name} using ${config_file}"
    fi
    
    echo ""
}

# Function to check service health
check_service_health() {
    local service_name=$1
    local health_url=$2
    
    log "Checking health of ${service_name}..."
    
    if [ "$DRY_RUN" = "false" ]; then
        # Wait a moment for service to be ready
        sleep 5
        
        # Simple health check (you might want to make this more sophisticated)
        if curl -f -s "${health_url}" > /dev/null; then
            log "${service_name} is healthy"
        else
            warn "${service_name} health check failed - service may still be starting"
        fi
    else
        log "DRY RUN: Would check health of ${service_name}"
    fi
}

# Function to set secrets
set_secrets() {
    log "Setting up secrets..."
    
    if [ "$DRY_RUN" = "false" ]; then
        # Check if secrets are already set
        if [ -n "$OPENROUTER_API_KEY" ]; then
            echo "$OPENROUTER_API_KEY" | wrangler secret put OPENROUTER_API_KEY --config wrangler-ai-service.toml --env "$ENVIRONMENT"
            echo "$OPENROUTER_API_KEY" | wrangler secret put OPENROUTER_API_KEY --config wrangler-forecast-service.toml --env "$ENVIRONMENT"
            log "OpenRouter API key set for AI and Forecast services"
        else
            warn "OPENROUTER_API_KEY environment variable not set"
        fi
        
        if [ -n "$JWT_SECRET" ]; then
            echo "$JWT_SECRET" | wrangler secret put JWT_SECRET --config wrangler-enhanced.toml --env "$ENVIRONMENT"
            log "JWT secret set for main router"
        else
            warn "JWT_SECRET environment variable not set"
        fi
    else
        log "DRY RUN: Would set secrets"
    fi
}

# Function to create KV namespaces if they don't exist
setup_kv_namespaces() {
    log "Setting up KV namespaces..."
    
    if [ "$DRY_RUN" = "false" ]; then
        # This is a simplified version - in practice, you'd check if namespaces exist first
        log "KV namespaces should be created manually or via separate script"
        log "Required namespaces: KV_CACHE, KV_USER_PROFILES, KV_FORECASTS, KV_AI_CACHE"
    else
        log "DRY RUN: Would set up KV namespaces"
    fi
}

# Function to setup D1 database
setup_d1_database() {
    log "Setting up D1 database..."
    
    if [ "$DRY_RUN" = "false" ]; then
        log "D1 database should be created manually or via separate script"
        log "Required database: witnessos-db"
    else
        log "DRY RUN: Would set up D1 database"
    fi
}

# Main deployment function
main() {
    log "Starting enhanced architecture deployment..."
    
    # Pre-deployment checks
    check_wrangler
    check_auth
    
    # Setup infrastructure
    setup_kv_namespaces
    setup_d1_database
    
    # Build project
    build_project
    
    # Set secrets
    set_secrets
    
    # Deploy services in dependency order
    log "Deploying services in dependency order..."
    echo ""
    
    # 1. Deploy AI Service (no dependencies)
    deploy_service "AI Service" "wrangler-ai-service.toml" "AI synthesis and interpretation"
    
    # 2. Deploy Engine Service (depends on AI Service)
    deploy_service "Engine Service" "wrangler-engine-service.toml" "Consciousness engine calculations"
    
    # 3. Deploy Forecast Service (depends on Engine and AI Services)
    deploy_service "Forecast Service" "wrangler-forecast-service.toml" "Forecast generation"
    
    # 4. Deploy Main Router (orchestrates all services)
    deploy_service "Main API Router" "wrangler-enhanced.toml" "Main orchestration router"
    
    # Health checks
    log "Performing health checks..."
    echo ""
    
    # Note: Replace these URLs with your actual service URLs
    check_service_health "Main Router" "https://api.witnessos.com/health"
    
    log "Enhanced architecture deployment completed successfully!"
    echo ""
    
    # Display service information
    echo -e "${BLUE}📋 Deployed Services:${NC}"
    echo "• AI Service: witnessos-ai-service-${ENVIRONMENT}"
    echo "• Engine Service: witnessos-engine-service-${ENVIRONMENT}"
    echo "• Forecast Service: witnessos-forecast-service-${ENVIRONMENT}"
    echo "• Main Router: witnessos-api-router-${ENVIRONMENT}"
    echo ""
    
    echo -e "${BLUE}🔗 Service Architecture:${NC}"
    echo "Main Router → Engine Service → AI Service"
    echo "Main Router → Forecast Service → Engine Service + AI Service"
    echo "Main Router → Durable Objects (Engine Coordinator)"
    echo "Main Router → Workflows (Consciousness Workflow)"
    echo ""
    
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
}

# Handle script arguments
case "$1" in
    "development"|"staging"|"production")
        main
        ;;
    "dry-run")
        ENVIRONMENT="production"
        DRY_RUN="true"
        main
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment] [dry-run]"
        echo ""
        echo "Environments:"
        echo "  development  - Deploy to development environment"
        echo "  staging      - Deploy to staging environment"
        echo "  production   - Deploy to production environment (default)"
        echo ""
        echo "Options:"
        echo "  dry-run      - Show what would be deployed without actually deploying"
        echo "  help         - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 production"
        echo "  $0 staging"
        echo "  $0 development dry-run"
        ;;
    *)
        warn "Unknown environment: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
