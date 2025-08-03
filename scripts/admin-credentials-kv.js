/**
 * Admin Credentials KV Storage - WitnessOS Development
 * 
 * Store admin credentials in Cloudflare KV for development and debugging.
 * This provides secure access to admin credentials across environments.
 */

const ADMIN_EMAIL = 'sheshnarayan.iyer@gmail.com';
const API_BASE_URL = 'https://api.witnessos.space';

// KV namespace for storing admin credentials
const KV_NAMESPACE = 'WITNESSOS_ADMIN_SECRETS';

/**
 * Admin credentials configuration
 */
const ADMIN_CREDENTIALS = {
  email: 'sheshnarayan.iyer@gmail.com',
  password: 'WitnessOS2025!', // Default password after reset
  profile: {
    fullName: 'Cumbipuram Nateshan Sheshanarayan Iyer',
    displayName: 'Sheshnarayan',
    birthDate: '1991-08-13',
    birthTime: '13:31',
    birthLocation: 'Bengaluru, India',
    latitude: 12.9629,
    longitude: 77.5775,
    timezone: 'Asia/Kolkata'
  },
  preferences: {
    direction: 'east',
    card: 'alchemist',
    tier: 'enterprise',
    isAdmin: true
  },
  api: {
    baseUrl: 'https://api.witnessos.space',
    environment: 'production'
  }
};

/**
 * Store admin credentials in KV
 */
async function storeAdminCredentialsInKV(kv, credentials = ADMIN_CREDENTIALS) {
  try {
    console.log('🔐 Storing admin credentials in KV...');
    
    // Store complete credentials
    await kv.put('admin:credentials', JSON.stringify(credentials), {
      metadata: {
        type: 'admin_credentials',
        created: new Date().toISOString(),
        environment: 'development'
      }
    });

    // Store individual components for easy access
    await kv.put('admin:email', credentials.email);
    await kv.put('admin:password', credentials.password);
    await kv.put('admin:profile', JSON.stringify(credentials.profile));
    await kv.put('admin:preferences', JSON.stringify(credentials.preferences));

    console.log('✅ Admin credentials stored in KV successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to store credentials in KV:', error);
    return false;
  }
}

/**
 * Retrieve admin credentials from KV
 */
async function getAdminCredentialsFromKV(kv) {
  try {
    console.log('🔍 Retrieving admin credentials from KV...');
    
    const credentialsJson = await kv.get('admin:credentials');
    if (!credentialsJson) {
      throw new Error('Admin credentials not found in KV');
    }

    const credentials = JSON.parse(credentialsJson);
    console.log('✅ Admin credentials retrieved successfully!');
    return credentials;
  } catch (error) {
    console.error('❌ Failed to retrieve credentials from KV:', error);
    return null;
  }
}

/**
 * Store API tokens in KV
 */
async function storeAPITokensInKV(kv, tokens) {
  try {
    console.log('🔑 Storing API tokens in KV...');
    
    const tokenData = {
      jwtToken: tokens.jwtToken,
      apiKey: tokens.apiKey,
      keyId: tokens.keyId,
      generated: new Date().toISOString(),
      expiresAt: tokens.expiresAt || null
    };

    await kv.put('admin:tokens', JSON.stringify(tokenData), {
      metadata: {
        type: 'api_tokens',
        created: new Date().toISOString()
      }
    });

    // Store individual tokens for easy access
    await kv.put('admin:jwt_token', tokens.jwtToken);
    await kv.put('admin:api_key', tokens.apiKey);

    console.log('✅ API tokens stored in KV successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to store tokens in KV:', error);
    return false;
  }
}

/**
 * Get current API tokens from KV
 */
async function getAPITokensFromKV(kv) {
  try {
    const tokensJson = await kv.get('admin:tokens');
    if (!tokensJson) {
      return null;
    }

    const tokens = JSON.parse(tokensJson);
    
    // Check if JWT token is expired (7 days)
    if (tokens.generated) {
      const generated = new Date(tokens.generated);
      const now = new Date();
      const daysDiff = (now - generated) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        console.log('⚠️ JWT token expired, needs refresh');
        tokens.jwtExpired = true;
      }
    }

    return tokens;
  } catch (error) {
    console.error('❌ Failed to retrieve tokens from KV:', error);
    return null;
  }
}

/**
 * Complete admin setup with KV storage
 */
async function setupAdminWithKV(kv) {
  try {
    console.log('🚀 Setting up admin credentials with KV storage...\n');

    // Step 1: Store credentials in KV
    await storeAdminCredentialsInKV(kv);

    // Step 2: Get credentials from KV
    const credentials = await getAdminCredentialsFromKV(kv);
    if (!credentials) {
      throw new Error('Failed to retrieve stored credentials');
    }

    // Step 3: Reset password and generate tokens
    const { resetAdminCredentials } = require('./reset-admin-password.js');
    
    console.log('\n🔄 Resetting admin password and generating tokens...');
    // This will reset password and generate API key
    await resetAdminCredentials();

    console.log('\n✅ Admin setup with KV storage complete!');
    return true;

  } catch (error) {
    console.error('❌ Admin setup failed:', error);
    return false;
  }
}

/**
 * Environment variables configuration
 */
const ENV_CONFIG = {
  development: {
    // Cloudflare Workers environment variables
    JWT_SECRET: 'dev-jwt-secret-key-change-in-production',
    ENVIRONMENT: 'development',
    API_BASE_URL: 'http://localhost:8787',
    
    // Admin credentials (for development only)
    ADMIN_EMAIL: 'sheshnarayan.iyer@gmail.com',
    ADMIN_PASSWORD: 'WitnessOS2025!',
    
    // KV namespace bindings
    ADMIN_SECRETS: 'WITNESSOS_ADMIN_SECRETS',
    RATE_LIMIT_KV: 'WITNESSOS_RATE_LIMITS',
    
    // Optional services
    OPENROUTER_API_KEY: 'your_openrouter_key_here',
    RATE_LIMIT_MAX: '100',
    RATE_LIMIT_WINDOW: '60000'
  },
  
  production: {
    // Production environment variables (use Cloudflare dashboard)
    JWT_SECRET: '${JWT_SECRET}', // Set in Cloudflare Workers dashboard
    ENVIRONMENT: 'production',
    API_BASE_URL: 'https://api.witnessos.space',
    
    // KV namespace bindings (configured in wrangler.toml)
    ADMIN_SECRETS: 'WITNESSOS_ADMIN_SECRETS_PROD',
    RATE_LIMIT_KV: 'WITNESSOS_RATE_LIMITS_PROD',
    
    // Production services
    OPENROUTER_API_KEY: '${OPENROUTER_API_KEY}',
    RATE_LIMIT_MAX: '1000',
    RATE_LIMIT_WINDOW: '60000'
  }
};

/**
 * Generate wrangler.toml configuration
 */
function generateWranglerConfig(environment = 'development') {
  const config = ENV_CONFIG[environment];
  
  return `
# WitnessOS API - Cloudflare Workers Configuration
name = "witnessos-api-${environment}"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.${environment}]
# Environment variables
[env.${environment}.vars]
ENVIRONMENT = "${config.ENVIRONMENT}"
API_BASE_URL = "${config.API_BASE_URL}"
RATE_LIMIT_MAX = "${config.RATE_LIMIT_MAX}"
RATE_LIMIT_WINDOW = "${config.RATE_LIMIT_WINDOW}"

# KV namespace bindings
[[env.${environment}.kv_namespaces]]
binding = "ADMIN_SECRETS"
id = "${config.ADMIN_SECRETS}"

[[env.${environment}.kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "${config.RATE_LIMIT_KV}"

# D1 database binding
[[env.${environment}.d1_databases]]
binding = "DB"
database_name = "witnessos-${environment}"
database_id = "your-d1-database-id"

# Secrets (set via Cloudflare dashboard or wrangler secret)
# wrangler secret put JWT_SECRET
# wrangler secret put OPENROUTER_API_KEY
`;
}

/**
 * Generate .env file for local development
 */
function generateEnvFile(environment = 'development') {
  const config = ENV_CONFIG[environment];
  
  return `# WitnessOS API - Local Development Environment
# Copy this to .env and update values as needed

# Core configuration
JWT_SECRET=${config.JWT_SECRET}
ENVIRONMENT=${config.ENVIRONMENT}
API_BASE_URL=${config.API_BASE_URL}

# Admin credentials (development only)
ADMIN_EMAIL=${config.ADMIN_EMAIL}
ADMIN_PASSWORD=${config.ADMIN_PASSWORD}

# Rate limiting
RATE_LIMIT_MAX=${config.RATE_LIMIT_MAX}
RATE_LIMIT_WINDOW=${config.RATE_LIMIT_WINDOW}

# Optional services
OPENROUTER_API_KEY=${config.OPENROUTER_API_KEY}

# KV namespace IDs (get from Cloudflare dashboard)
ADMIN_SECRETS_KV_ID=your-admin-secrets-kv-id
RATE_LIMIT_KV_ID=your-rate-limit-kv-id

# D1 database ID (get from Cloudflare dashboard)
D1_DATABASE_ID=your-d1-database-id
`;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ADMIN_CREDENTIALS,
    storeAdminCredentialsInKV,
    getAdminCredentialsFromKV,
    storeAPITokensInKV,
    getAPITokensFromKV,
    setupAdminWithKV,
    ENV_CONFIG,
    generateWranglerConfig,
    generateEnvFile
  };
}

// Usage examples
console.log('\n📚 KV Storage Usage Examples:');
console.log('==============================');
console.log('// Store admin credentials');
console.log('await storeAdminCredentialsInKV(env.ADMIN_SECRETS);');
console.log('');
console.log('// Retrieve admin credentials');
console.log('const credentials = await getAdminCredentialsFromKV(env.ADMIN_SECRETS);');
console.log('');
console.log('// Store API tokens');
console.log('await storeAPITokensInKV(env.ADMIN_SECRETS, { jwtToken, apiKey });');
console.log('');
console.log('// Get current tokens');
console.log('const tokens = await getAPITokensFromKV(env.ADMIN_SECRETS);');
