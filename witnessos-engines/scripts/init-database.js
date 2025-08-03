#!/usr/bin/env node

/**
 * Database Initialization Script for WitnessOS
 * 
 * This script initializes the D1 database with the required tables
 * for user authentication, consciousness profiles, and readings.
 * 
 * Usage:
 *   node scripts/init-database.js [environment]
 * 
 * Examples:
 *   node scripts/init-database.js              # Initialize local database
 *   node scripts/init-database.js --remote     # Initialize remote database
 *   node scripts/init-database.js --env production  # Initialize production database
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const envIndex = args.indexOf('--env');
const environment = envIndex !== -1 ? args[envIndex + 1] : null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function initializeDatabase() {
  try {
    log('🚀 WitnessOS Database Initialization', 'bright');
    log('=====================================\n', 'bright');

    // Check if schema file exists
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      logError('Database schema file not found at: ' + schemaPath);
      process.exit(1);
    }

    logStep('1', 'Reading database schema...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    logSuccess('Schema file loaded successfully');

    // Determine the command to run
    let command;
    if (isRemote || environment) {
      const envFlag = environment ? `--env ${environment}` : '';
      command = `wrangler d1 execute witnessos-db --file=${schemaPath} ${envFlag}`.trim();
      logStep('2', `Initializing ${environment || 'remote'} database...`);
    } else {
      command = `wrangler d1 execute witnessos-db --local --file=${schemaPath}`;
      logStep('2', 'Initializing local database...');
    }

    log(`\nExecuting: ${command}\n`, 'yellow');

    // Execute the command
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (output) {
        log('Command output:', 'blue');
        console.log(output);
      }
      
      logSuccess('Database initialized successfully!');
      
    } catch (execError) {
      if (execError.stdout) {
        log('Command output:', 'blue');
        console.log(execError.stdout);
      }
      if (execError.stderr) {
        log('Command errors:', 'red');
        console.log(execError.stderr);
      }
      throw execError;
    }

    // Verify tables were created
    logStep('3', 'Verifying table creation...');
    
    const verifyCommand = isRemote || environment 
      ? `wrangler d1 execute witnessos-db --command="SELECT name FROM sqlite_master WHERE type='table';" ${environment ? `--env ${environment}` : ''}`.trim()
      : `wrangler d1 execute witnessos-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"`;
    
    try {
      const tables = execSync(verifyCommand, { encoding: 'utf8', stdio: 'pipe' });
      log('\nCreated tables:', 'blue');
      console.log(tables);
      logSuccess('Database verification completed!');
    } catch (verifyError) {
      logWarning('Could not verify table creation, but initialization may have succeeded');
    }

    // Next steps
    log('\n📋 Next Steps:', 'bright');
    log('=============\n', 'bright');
    
    if (!isRemote && !environment) {
      log('1. Start local development server:', 'cyan');
      log('   npm run dev\n', 'yellow');
      
      log('2. Test user registration:', 'cyan');
      log('   curl -X POST http://localhost:8787/auth/register \\', 'yellow');
      log('     -H "Content-Type: application/json" \\', 'yellow');
      log('     -d \'{\'"email"\': \'"test@example.com"\', \'"password"\': \'"password123"\', \'"name"\': \'"Test User"\'}\'\n', 'yellow');
    } else {
      log('1. Deploy your application:', 'cyan');
      log(`   wrangler deploy ${environment ? `--env ${environment}` : ''}\n`, 'yellow');
      
      log('2. Test the API endpoint:', 'cyan');
      const domain = environment === 'production' ? 'api.witnessos.space' : 'api-staging.witnessos.space';
      log(`   curl https://${domain}/health\n`, 'yellow');
    }
    
    log('3. Set up AI secrets (optional):', 'cyan');
    log('   npm run setup:ai\n', 'yellow');
    
    logSuccess('Database initialization complete! 🎉');
    
  } catch (error) {
    logError('Database initialization failed!');
    console.error(error.message);
    process.exit(1);
  }
}

// Show usage if help is requested
if (args.includes('--help') || args.includes('-h')) {
  log('WitnessOS Database Initialization Script', 'bright');
  log('=======================================\n', 'bright');
  log('Usage:', 'cyan');
  log('  node scripts/init-database.js [options]\n', 'yellow');
  log('Options:', 'cyan');
  log('  --local                Initialize local database (default)', 'yellow');
  log('  --remote               Initialize remote database', 'yellow');
  log('  --env <environment>    Initialize specific environment (production, staging)', 'yellow');
  log('  --help, -h             Show this help message\n', 'yellow');
  log('Examples:', 'cyan');
  log('  node scripts/init-database.js                    # Local database', 'yellow');
  log('  node scripts/init-database.js --remote           # Remote database', 'yellow');
  log('  node scripts/init-database.js --env production   # Production database', 'yellow');
  process.exit(0);
}

// Run the initialization
initializeDatabase();