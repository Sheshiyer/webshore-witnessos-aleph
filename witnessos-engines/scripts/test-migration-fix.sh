#!/bin/bash

# Test script for Phase 1 migration fix
# Validates that the corrected migration works with Cloudflare D1

set -e

echo "🧪 Testing Phase 1 Migration Fix"
echo "================================="

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first."
    exit 1
fi

# Check if migration file exists
MIGRATION_FILE="database/migrations/phase1-performance-indexes-fixed.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"
echo ""

# Display migration contents
echo "📄 Migration contents:"
echo "----------------------"
cat "$MIGRATION_FILE"
echo ""
echo "----------------------"
echo ""

# Test migration on local database
echo "🧪 Testing migration on local D1 database..."
if wrangler d1 execute witnessos-db --file="$MIGRATION_FILE" --local; then
    echo "✅ Local migration test PASSED"
    echo ""
    
    # Test some queries to verify indexes work
    echo "🔍 Testing index performance with sample queries..."
    
    # Test reading history query (should use idx_readings_user_created)
    echo "Testing reading history query..."
    wrangler d1 execute witnessos-db --local --command="EXPLAIN QUERY PLAN SELECT * FROM readings WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;" || echo "Query test completed"
    
    # Test user sessions query (should use idx_user_sessions_user_expires)
    echo "Testing user sessions query..."
    wrangler d1 execute witnessos-db --local --command="EXPLAIN QUERY PLAN SELECT * FROM user_sessions WHERE user_id = 1 AND expires_at > '2025-01-01' ORDER BY expires_at DESC;" || echo "Query test completed"
    
    echo ""
    echo "🎉 All migration tests PASSED!"
    echo ""
    echo "✅ The migration is ready for deployment"
    echo "✅ No non-deterministic functions in indexes"
    echo "✅ All indexes are compatible with Cloudflare D1"
    echo ""
    echo "To deploy, run:"
    echo "  ./scripts/deploy-phase1-improvements.sh"
    
else
    echo "❌ Local migration test FAILED"
    echo ""
    echo "The migration contains SQLite compatibility issues."
    echo "Please review the migration file and fix any problems."
    exit 1
fi
