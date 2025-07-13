#!/usr/bin/env node

/**
 * Development Environment Setup Script for WitnessOS
 * 
 * This script sets up the complete development environment including:
 * - Database initialization
 * - KV namespace creation
 * - Basic configuration verification
 * 
 * Usage:
 *   npm run setup:dev
 *   node scripts/setup-dev-environment.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function execCommand(command, description) {
  try {
    log(`\nExecuting: ${command}`, 'yellow');
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (output.trim()) {
      console.log(output);
    }
    
    logSuccess(description);
    return output;
  } catch (error) {
    logError(`Failed: ${description}`);
    if (error.stdout) {
      console.log('Output:', error.stdout);
    }
    if (error.stderr) {
      console.log('Error:', error.stderr);
    }
    throw error;
  }
}

async function setupDevEnvironment() {
  try {
    log('🚀 WitnessOS Development Environment Setup', 'bright');
    log('==========================================\n', 'bright');

    // Step 1: Check prerequisites
    logStep('1', 'Checking prerequisites...');
    
    try {
      execCommand('node --version', 'Node.js version check');
      execCommand('npm --version', 'npm version check');
      execCommand('wrangler --version', 'Wrangler version check');
    } catch (error) {
      logError('Prerequisites check failed. Please ensure Node.js and Wrangler are installed.');
      log('\nInstallation instructions:', 'cyan');
      log('- Node.js: https://nodejs.org/', 'yellow');
      log('- Wrangler: npm install -g wrangler', 'yellow');
      process.exit(1);
    }

    // Step 2: Check Wrangler authentication
    logStep('2', 'Checking Wrangler authentication...');
    
    try {
      execCommand('wrangler whoami', 'Wrangler authentication check');
    } catch (error) {
      logWarning('Wrangler not authenticated. Please run: wrangler login');
      log('\nTo authenticate with Cloudflare:', 'cyan');
      log('  wrangler login', 'yellow');
      log('\nThen re-run this setup script.', 'cyan');
      process.exit(1);
    }

    // Step 3: Install dependencies
    logStep('3', 'Installing dependencies...');
    execCommand('npm install', 'Dependencies installation');

    // Step 4: Check if KV namespaces exist
    logStep('4', 'Checking KV namespaces...');
    
    let kvNamespaces;
    try {
      const kvOutput = execCommand('wrangler kv:namespace list', 'KV namespace listing');
      kvNamespaces = JSON.parse(kvOutput);
    } catch (error) {
      logWarning('Could not list KV namespaces. They may need to be created.');
      kvNamespaces = [];
    }

    // Check for required namespaces
    const requiredNamespaces = ['ENGINE_DATA', 'USER_PROFILES', 'CACHE', 'SECRETS'];
    const existingNamespaces = kvNamespaces.map(ns => ns.title);
    const missingNamespaces = requiredNamespaces.filter(ns => 
      !existingNamespaces.some(existing => existing.includes(ns))
    );

    if (missingNamespaces.length > 0) {
      logStep('5', 'Creating missing KV namespaces...');
      
      for (const namespace of missingNamespaces) {
        try {
          execCommand(
            `wrangler kv:namespace create "${namespace}"`,
            `Created ${namespace} namespace`
          );
          execCommand(
            `wrangler kv:namespace create "${namespace}" --preview`,
            `Created ${namespace} preview namespace`
          );
        } catch (error) {
          logWarning(`Could not create ${namespace} namespace. You may need to create it manually.`);
        }
      }
      
      logWarning('Please update wrangler.toml with the new KV namespace IDs.');
    } else {
      logSuccess('All required KV namespaces exist');
    }

    // Step 5: Initialize database
    logStep('6', 'Initializing database...');
    
    try {
      execCommand('node scripts/init-database.js', 'Database initialization');
    } catch (error) {
      logWarning('Database initialization failed. You may need to run it manually:');
      log('  npm run db:init', 'yellow');
    }

    // Step 6: Verify setup
    logStep('7', 'Verifying setup...');
    
    // Check if database tables exist
    try {
      const tables = execCommand(
        'wrangler d1 execute witnessos-db --local --command="SELECT name FROM sqlite_master WHERE type=\'table\';"',
        'Database table verification'
      );
      
      if (tables.includes('users')) {
        logSuccess('Database tables created successfully');
      } else {
        logWarning('Database tables may not be created properly');
      }
    } catch (error) {
      logWarning('Could not verify database tables');
    }

    // Step 7: Final instructions
    log('\n🎉 Setup Complete!', 'bright');
    log('==================\n', 'bright');
    
    log('Next steps:', 'cyan');
    log('1. Start the development server:', 'yellow');
    log('   npm run dev\n', 'green');
    
    log('2. Test user registration:', 'yellow');
    log('   curl -X POST http://localhost:8787/auth/register \\', 'green');
    log('     -H "Content-Type: application/json" \\', 'green');
    log('     -d \'{"email":"test@example.com","password":"password123","name":"Test User"}\'
', 'green');
    
    log('3. Set up AI integration (optional):', 'yellow');
    log('   npm run setup:ai\n', 'green');
    
    log('4. Run tests:', 'yellow');
    log('   npm run test:ai\n', 'green');
    
    log('📚 Documentation:', 'cyan');
    log('- Troubleshooting: docs/TROUBLESHOOTING.md', 'yellow');
    log('- OpenRouter Integration: docs/OPENROUTER_INTEGRATION.md', 'yellow');
    
    logSuccess('Development environment is ready! 🚀');
    
  } catch (error) {
    logError('Setup failed!');
    console.error(error.message);
    log('\n📚 For help, check:', 'cyan');
    log('- docs/TROUBLESHOOTING.md', 'yellow');
    log('- Run: npm run setup:dev --help', 'yellow');
    process.exit(1);
  }
}

// Show usage if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('WitnessOS Development Environment Setup', 'bright');
  log('=====================================\n', 'bright');
  log('This script sets up your complete development environment including:', 'cyan');
  log('- Prerequisites verification', 'yellow');
  log('- Dependency installation', 'yellow');
  log('- KV namespace creation', 'yellow');
  log('- Database initialization', 'yellow');
  log('- Setup verification\n', 'yellow');
  log('Usage:', 'cyan');
  log('  npm run setup:dev', 'yellow');
  log('  node scripts/setup-dev-environment.js\n', 'yellow');
  log('Options:', 'cyan');
  log('  --help, -h    Show this help message\n', 'yellow');
  process.exit(0);
}

// Run the setup
setupDevEnvironment();