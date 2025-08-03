#!/bin/bash

# WitnessOS Workflow Workers Deployment Script
# Deploys consciousness and integration workflow workers to Cloudflare

set -e

echo "🚀 Starting WitnessOS Workflow Workers Deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Cloudflare. Please run:"
    echo "   wrangler login"
    exit 1
fi

echo "✅ Wrangler CLI ready"

# Deploy Consciousness Workflow Worker
echo "📦 Deploying Consciousness Workflow Worker..."
wrangler deploy --config wrangler-consciousness-workflow.toml --env development
echo "✅ Consciousness Workflow Worker (dev) deployed"

wrangler deploy --config wrangler-consciousness-workflow.toml --env staging
echo "✅ Consciousness Workflow Worker (staging) deployed"

wrangler deploy --config wrangler-consciousness-workflow.toml --env production
echo "✅ Consciousness Workflow Worker (production) deployed"

# Deploy Integration Workflow Worker
echo "📦 Deploying Integration Workflow Worker..."
wrangler deploy --config wrangler-integration-workflow.toml --env development
echo "✅ Integration Workflow Worker (dev) deployed"

wrangler deploy --config wrangler-integration-workflow.toml --env staging
echo "✅ Integration Workflow Worker (staging) deployed"

wrangler deploy --config wrangler-integration-workflow.toml --env production
echo "✅ Integration Workflow Worker (production) deployed"

# Deploy Main API Router (to update service bindings)
echo "📦 Updating Main API Router with workflow service bindings..."
wrangler deploy --env development
echo "✅ Main API Router (dev) updated"

wrangler deploy --env staging
echo "✅ Main API Router (staging) updated"

wrangler deploy --env production
echo "✅ Main API Router (production) updated"

echo ""
echo "🎉 Workflow Workers Deployment Complete!"
echo ""
echo "📋 Deployed Services:"
echo "   • witnessos-consciousness-workflow (dev/staging/prod)"
echo "   • witnessos-integration-workflow (dev/staging/prod)"
echo "   • witnessos-api-router (updated with workflow bindings)"
echo ""
echo "🔗 Available Endpoints:"
echo "   • POST /workflows/natal - Natal chart workflow"
echo "   • POST /workflows/career - Career guidance workflow"
echo "   • POST /workflows/spiritual - Spiritual development workflow"
echo "   • POST /workflows/integration - External integration workflow"
echo ""
echo "📖 Next Steps:"
echo "   1. Test workflow endpoints with authentication"
echo "   2. Verify service bindings in Cloudflare dashboard"
echo "   3. Monitor worker logs for any deployment issues"
echo "   4. Update frontend to use new workflow endpoints"
echo ""
echo "🔍 Monitoring:"
echo "   wrangler tail --config wrangler-consciousness-workflow.toml"
echo "   wrangler tail --config wrangler-integration-workflow.toml"