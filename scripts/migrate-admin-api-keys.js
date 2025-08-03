/**
 * Database Migration Script for Admin API Keys
 * 
 * Adds admin-specific columns to the existing api_keys table
 * and creates audit logging infrastructure.
 */

const API_BASE_URL = 'https://api.witnessos.space';

/**
 * SQL migration for admin API key support
 */
const MIGRATION_SQL = `
-- Add admin-specific columns to existing api_keys table
ALTER TABLE api_keys ADD COLUMN is_admin_key BOOLEAN DEFAULT FALSE;
ALTER TABLE api_keys ADD COLUMN admin_privileges TEXT; -- JSON array
ALTER TABLE api_keys ADD COLUMN elevated_rate_limits TEXT; -- JSON object

-- Create index for admin key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_admin ON api_keys(is_admin_key, is_active);

-- Create admin API key audit table
CREATE TABLE IF NOT EXISTS admin_api_key_audit (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    api_key_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'created', 'used', 'privilege_granted', 'privilege_revoked'
    privilege TEXT,       -- Specific privilege if applicable
    endpoint TEXT,        -- API endpoint accessed
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,        -- JSON additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for audit lookups
CREATE INDEX IF NOT EXISTS idx_admin_audit_key ON admin_api_key_audit(api_key_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_user ON admin_api_key_audit(user_id, created_at);
`;

/**
 * Run database migration using Wrangler D1
 */
async function runMigration() {
  console.log('🔧 WitnessOS Admin API Key Migration');
  console.log('====================================\n');

  try {
    // Check if wrangler is available
    const { execSync } = require('child_process');
    
    console.log('📋 Migration SQL:');
    console.log(MIGRATION_SQL);
    console.log('\n🚀 Running migration...');

    // Write SQL to temporary file
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(__dirname, 'temp-admin-migration.sql');
    
    fs.writeFileSync(tempFile, MIGRATION_SQL);
    
    // Run migration using wrangler d1 execute
    const command = `wrangler d1 execute witnessos-db --file=${tempFile}`;
    console.log(`Executing: ${command}`);
    
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Migration completed successfully!');
    console.log('Result:', result);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const verifyCommand = `wrangler d1 execute witnessos-db --command="PRAGMA table_info(api_keys);"`;
    const tableInfo = execSync(verifyCommand, { encoding: 'utf8', stdio: 'pipe' });
    
    if (tableInfo.includes('is_admin_key')) {
      console.log('✅ Admin columns added successfully!');
    } else {
      console.log('⚠️  Admin columns may not have been added properly');
    }
    
    console.log('\n📊 Updated table structure:');
    console.log(tableInfo);
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n🔄 Manual Migration Instructions:');
    console.log('1. Copy the SQL above');
    console.log('2. Run: wrangler d1 execute witnessos-db --command="[SQL]"');
    console.log('3. Or use the Cloudflare Dashboard D1 console');
    return false;
  }
}

/**
 * Test admin API key generation after migration
 */
async function testAdminKeyGeneration() {
  console.log('\n🧪 Testing Admin API Key Generation');
  console.log('===================================');
  
  try {
    // Import the admin key generation script
    const { generateAdminAPIKey } = require('./generate-admin-api-key.js');
    
    console.log('🔧 Generating admin API key with new privileges...');
    const apiKey = await generateAdminAPIKey();
    
    if (apiKey && apiKey.startsWith('wos_admin_')) {
      console.log('✅ Admin API key generated successfully!');
      console.log(`Key prefix: ${apiKey.substring(0, 15)}...`);
      return true;
    } else {
      console.log('⚠️  Generated key may not have admin prefix');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Admin key generation test failed:', error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('Starting WitnessOS Admin API Key Migration...\n');
  
  // Step 1: Run database migration
  const migrationSuccess = await runMigration();
  
  if (!migrationSuccess) {
    console.log('\n❌ Migration failed. Please run manually.');
    process.exit(1);
  }
  
  // Step 2: Test admin key generation
  console.log('\n⏳ Waiting 5 seconds for database changes to propagate...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const testSuccess = await testAdminKeyGeneration();
  
  // Step 3: Summary
  console.log('\n📋 Migration Summary');
  console.log('===================');
  console.log(`Database Migration: ${migrationSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Admin Key Test: ${testSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (migrationSuccess && testSuccess) {
    console.log('\n🎉 Admin API Key System Ready!');
    console.log('Next steps:');
    console.log('1. Generate admin API key: node scripts/generate-admin-api-key.js');
    console.log('2. Test admin endpoints with elevated privileges');
    console.log('3. Configure Raycast extension with admin key');
  } else {
    console.log('\n⚠️  Migration completed with issues. Please review logs.');
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runMigration, testAdminKeyGeneration, MIGRATION_SQL };
}

// Auto-run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}
