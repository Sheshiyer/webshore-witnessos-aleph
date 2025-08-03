#!/bin/bash

# Migration Script for WitnessOS Enhanced Architecture
# Switches from monolithic api-handlers.ts to enhanced microservice architecture

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_ENABLED=${2:-true}
ROLLBACK_ENABLED=${3:-true}

echo -e "${BLUE}🔄 WitnessOS Enhanced Architecture Migration${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Backup Enabled: ${BACKUP_ENABLED}${NC}"
echo -e "${BLUE}Rollback Enabled: ${ROLLBACK_ENABLED}${NC}"
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

# Function to create backup
create_backup() {
    if [ "$BACKUP_ENABLED" = "true" ]; then
        log "Creating backup of current configuration..."
        
        local backup_dir="backups/migration-$(date +'%Y%m%d-%H%M%S')"
        mkdir -p "$backup_dir"
        
        # Backup current worker entry point
        if [ -f "src/workers/index.ts" ]; then
            cp "src/workers/index.ts" "$backup_dir/index.ts.backup"
        fi
        
        # Backup current wrangler.toml
        if [ -f "wrangler.toml" ]; then
            cp "wrangler.toml" "$backup_dir/wrangler.toml.backup"
        fi
        
        # Backup package.json scripts
        if [ -f "package.json" ]; then
            cp "package.json" "$backup_dir/package.json.backup"
        fi
        
        echo "$backup_dir" > .migration-backup-path
        log "Backup created at: $backup_dir"
    else
        log "Backup disabled - skipping backup creation"
    fi
}

# Function to update worker entry point
update_worker_entry_point() {
    log "Updating worker entry point to enhanced architecture..."
    
    # Check if enhanced-api-router exists
    if [ ! -f "src/workers/enhanced-api-router.ts" ]; then
        error "Enhanced API router not found at src/workers/enhanced-api-router.ts"
        exit 1
    fi
    
    # Create new index.ts that uses enhanced-api-router
    cat > src/workers/index.ts << 'EOF'
/**
 * WitnessOS Enhanced API Worker Entry Point
 * 
 * Main entry point for the enhanced microservice architecture
 * using Cloudflare-native features including Workflows, Durable Objects,
 * and Service Bindings for optimal performance and reliability.
 */

import { EnhancedAPIRouter } from './enhanced-api-router';

// Export Durable Object classes
export { EngineCoordinator } from '../durable-objects/engine-coordinator';
export { ForecastSession } from '../durable-objects/forecast-session';

// Export Workflow classes
export { ConsciousnessWorkflow } from '../workflows/consciousness-workflow';
export { IntegrationWorkflow } from '../workflows/integration-workflow';

// Main fetch handler
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const router = new EnhancedAPIRouter(env);
    return await router.route(request);
  }
};
EOF
    
    log "Worker entry point updated to use enhanced architecture"
}

# Function to update wrangler configuration
update_wrangler_config() {
    log "Updating wrangler configuration..."
    
    # Check if enhanced wrangler config exists
    if [ ! -f "wrangler-enhanced.toml" ]; then
        error "Enhanced wrangler config not found at wrangler-enhanced.toml"
        exit 1
    fi
    
    # Backup current wrangler.toml if it exists
    if [ -f "wrangler.toml" ]; then
        mv "wrangler.toml" "wrangler-legacy.toml"
        log "Moved current wrangler.toml to wrangler-legacy.toml"
    fi
    
    # Copy enhanced config to main config
    cp "wrangler-enhanced.toml" "wrangler.toml"
    log "Enhanced wrangler configuration activated"
}

# Function to update package.json scripts
update_package_scripts() {
    log "Updating package.json scripts for enhanced architecture..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        warn "package.json not found - skipping script updates"
        return
    fi
    
    # Add enhanced architecture scripts
    local temp_file=$(mktemp)
    
    # Use jq to update package.json if available, otherwise manual update
    if command -v jq &> /dev/null; then
        jq '.scripts["deploy:enhanced"] = "./scripts/deploy-enhanced-architecture.sh production" |
            .scripts["deploy:enhanced:staging"] = "./scripts/deploy-enhanced-architecture.sh staging" |
            .scripts["deploy:enhanced:dev"] = "./scripts/deploy-enhanced-architecture.sh development" |
            .scripts["migrate:rollback"] = "./scripts/migrate-to-enhanced-architecture.sh rollback"' \
            package.json > "$temp_file" && mv "$temp_file" package.json
        
        log "Package.json scripts updated with enhanced architecture commands"
    else
        warn "jq not found - please manually add enhanced architecture scripts to package.json"
    fi
}

# Function to validate migration
validate_migration() {
    log "Validating migration..."
    
    # Check if all required files exist
    local required_files=(
        "src/workers/enhanced-api-router.ts"
        "src/workers/engine-service-worker.ts"
        "src/workers/forecast-service-worker.ts"
        "src/workers/ai-service-worker.ts"
        "src/durable-objects/engine-coordinator.ts"
        "src/durable-objects/forecast-session.ts"
        "src/workflows/consciousness-workflow.ts"
        "src/workflows/integration-workflow.ts"
        "wrangler.toml"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        error "Migration validation failed - missing files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    # Check TypeScript compilation
    log "Checking TypeScript compilation..."
    if command -v npm &> /dev/null; then
        if npm run build &> /dev/null; then
            log "TypeScript compilation successful"
        else
            error "TypeScript compilation failed - please fix errors before proceeding"
            exit 1
        fi
    else
        warn "npm not found - skipping TypeScript compilation check"
    fi
    
    log "Migration validation completed successfully"
}

# Function to perform rollback
perform_rollback() {
    log "Performing rollback to previous configuration..."
    
    if [ ! -f ".migration-backup-path" ]; then
        error "No backup path found - cannot perform rollback"
        exit 1
    fi
    
    local backup_dir=$(cat .migration-backup-path)
    
    if [ ! -d "$backup_dir" ]; then
        error "Backup directory not found: $backup_dir"
        exit 1
    fi
    
    # Restore files from backup
    if [ -f "$backup_dir/index.ts.backup" ]; then
        cp "$backup_dir/index.ts.backup" "src/workers/index.ts"
        log "Restored worker entry point"
    fi
    
    if [ -f "$backup_dir/wrangler.toml.backup" ]; then
        cp "$backup_dir/wrangler.toml.backup" "wrangler.toml"
        log "Restored wrangler configuration"
    fi
    
    if [ -f "$backup_dir/package.json.backup" ]; then
        cp "$backup_dir/package.json.backup" "package.json"
        log "Restored package.json"
    fi
    
    # Clean up
    rm -f ".migration-backup-path"
    
    log "Rollback completed successfully"
}

# Function to deploy enhanced architecture
deploy_enhanced_architecture() {
    log "Deploying enhanced architecture..."
    
    if [ -f "scripts/deploy-enhanced-architecture.sh" ]; then
        chmod +x scripts/deploy-enhanced-architecture.sh
        ./scripts/deploy-enhanced-architecture.sh "$ENVIRONMENT"
    else
        error "Enhanced architecture deployment script not found"
        exit 1
    fi
}

# Function to show migration summary
show_migration_summary() {
    echo ""
    echo -e "${BLUE}📋 Migration Summary:${NC}"
    echo "• Worker entry point: src/workers/index.ts → Enhanced API Router"
    echo "• Configuration: wrangler.toml → Enhanced configuration with service bindings"
    echo "• Architecture: Monolithic → Microservice with Durable Objects & Workflows"
    echo ""
    
    echo -e "${BLUE}🚀 New Architecture Components:${NC}"
    echo "• Service Workers: Engine, Forecast, AI services with RPC communication"
    echo "• Durable Objects: Engine Coordinator, Forecast Session for stateful operations"
    echo "• Workflows: Consciousness Workflow, Integration Workflow for durable execution"
    echo "• Enhanced Router: Intelligent service orchestration and load balancing"
    echo ""
    
    echo -e "${BLUE}🔧 Available Commands:${NC}"
    echo "• npm run deploy:enhanced - Deploy to production"
    echo "• npm run deploy:enhanced:staging - Deploy to staging"
    echo "• npm run deploy:enhanced:dev - Deploy to development"
    echo "• npm run migrate:rollback - Rollback to previous architecture"
    echo ""
    
    if [ "$ROLLBACK_ENABLED" = "true" ]; then
        echo -e "${YELLOW}💡 Rollback Information:${NC}"
        echo "• Backup created and rollback is available"
        echo "• Run './scripts/migrate-to-enhanced-architecture.sh rollback' to revert changes"
        echo ""
    fi
    
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
}

# Main migration function
main() {
    case "$1" in
        "rollback")
            perform_rollback
            ;;
        "production"|"staging"|"development"|"")
            log "Starting migration to enhanced architecture..."
            
            # Pre-migration steps
            create_backup
            validate_migration
            
            # Migration steps
            update_worker_entry_point
            update_wrangler_config
            update_package_scripts
            
            # Post-migration validation
            validate_migration
            
            # Optional deployment
            if [ "$ENVIRONMENT" != "" ]; then
                read -p "Deploy enhanced architecture to $ENVIRONMENT? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    deploy_enhanced_architecture
                fi
            fi
            
            show_migration_summary
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [environment] [backup] [rollback]"
            echo ""
            echo "Environments:"
            echo "  production   - Migrate for production deployment"
            echo "  staging      - Migrate for staging deployment"
            echo "  development  - Migrate for development deployment"
            echo ""
            echo "Options:"
            echo "  backup       - Enable/disable backup creation (default: true)"
            echo "  rollback     - Enable/disable rollback capability (default: true)"
            echo ""
            echo "Special Commands:"
            echo "  rollback     - Rollback to previous architecture"
            echo "  help         - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 production"
            echo "  $0 staging false false"
            echo "  $0 rollback"
            ;;
        *)
            error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
