/**
 * Generate API Key for Admin User - WitnessOS
 * 
 * This script creates an API key for sheshnarayan.iyer@gmail.com
 * for use with the Raycast extension.
 */

const ADMIN_EMAIL = 'sheshnarayan.iyer@gmail.com';
const API_BASE_URL = 'https://api.witnessos.space';

/**
 * Generate API key using admin credentials
 */
async function generateAdminAPIKey() {
  console.log('🔐 WitnessOS Admin API Key Generator');
  console.log('=====================================\n');

  // Step 1: Get admin password
  const password = await getAdminPassword();
  
  try {
    // Step 2: Login to get JWT token
    console.log('🔑 Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: password
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Login failed: ${error}`);
    }

    const loginData = await loginResponse.json();
    const jwtToken = loginData.data.token;
    console.log('✅ Login successful!');

    // Step 3: Create API key
    console.log('🔧 Creating API key for Raycast extension...');
    const apiKeyResponse = await fetch(`${API_BASE_URL}/api/developer/keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Raycast Extension',
        description: 'API key for WitnessOS Raycast extension - Admin User',
        environment: 'live',
        scopes: [
          // Regular engine access
          'engines:numerology:read',
          'engines:human_design:read',
          'engines:tarot:read',
          'engines:biorhythm:read',
          'engines:iching:read',
          'engines:gene_keys:read',
          'engines:enneagram:read',
          'engines:vimshottari:read',
          'engines:sacred_geometry:read',
          'engines:sigil_forge:read',
          'user:profile:read',
          'analytics:usage:read',
          // Admin-specific scopes (triggers admin key generation)
          'admin:user_management:read',
          'admin:analytics:system:read',
          'admin:cache:management',
          'admin:system:monitoring',
          'admin:debug:access'
        ]
      })
    });

    if (!apiKeyResponse.ok) {
      const error = await apiKeyResponse.text();
      throw new Error(`API key creation failed: ${error}`);
    }

    const apiKeyData = await apiKeyResponse.json();
    const apiKey = apiKeyData.data.plainTextKey;

    // Step 4: Display results
    console.log('\n🎉 SUCCESS! API Key Generated');
    console.log('==============================');
    console.log(`API Key: ${apiKey}`);
    console.log(`Key ID: ${apiKeyData.data.apiKey.id}`);
    console.log(`Environment: ${apiKeyData.data.apiKey.environment}`);
    console.log(`Scopes: ${apiKeyData.data.apiKey.scopes.length} permissions`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Copy the API key above');
    console.log('2. Add it to your Raycast extension preferences');
    console.log('3. Test with a consciousness engine calculation');
    
    console.log('\n🔧 Raycast Configuration:');
    console.log(`API Token: ${apiKey}`);
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`User Profile: ${ADMIN_EMAIL}`);

    return apiKey;

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔄 Alternative Options:');
    console.log('1. Use the Developer Dashboard in the WitnessOS app');
    console.log('2. Generate a JWT token instead (7-day expiration)');
    console.log('3. Check your password and try again');
    return null;
  }
}

/**
 * Get admin password securely
 */
async function getAdminPassword() {
  // In Node.js environment
  if (typeof process !== 'undefined' && process.stdin) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`Enter password for ${ADMIN_EMAIL}: `, (password) => {
        rl.close();
        resolve(password);
      });
    });
  }
  
  // In browser environment
  return prompt(`Enter password for ${ADMIN_EMAIL}:`);
}

/**
 * Alternative: Generate JWT token (7-day expiration)
 */
async function generateJWTToken(password) {
  console.log('🔑 Generating JWT token (7-day expiration)...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: password
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    const token = data.data.token;

    console.log('\n🎉 JWT Token Generated');
    console.log('======================');
    console.log(`Token: ${token}`);
    console.log('Expires: 7 days from now');
    console.log('\n⚠️  Note: JWT tokens expire. API keys are recommended for long-term use.');

    return token;

  } catch (error) {
    console.error('❌ JWT generation failed:', error.message);
    return null;
  }
}

/**
 * Test API key functionality
 */
async function testAPIKey(apiKey) {
  console.log('\n🧪 Testing API key...');
  
  try {
    // Test with a simple numerology calculation
    const response = await fetch(`${API_BASE_URL}/engines/numerology/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          birth_date: '1991-08-13',
          full_name: 'Cumbipuram Nateshan Sheshanarayan Iyer'
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API key test successful!');
      console.log(`Life Path: ${result.data.calculation.life_path}`);
      return true;
    } else {
      console.log('❌ API key test failed:', response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ API key test error:', error.message);
    return false;
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = { generateAdminAPIKey, generateJWTToken, testAPIKey };
} else {
  // Browser
  window.WitnessOSAdmin = { generateAdminAPIKey, generateJWTToken, testAPIKey };
}

// Auto-run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  generateAdminAPIKey().then(apiKey => {
    if (apiKey) {
      testAPIKey(apiKey);
    }
  });
}

console.log('\n📚 Usage Instructions:');
console.log('======================');
console.log('Node.js: node scripts/generate-admin-api-key.js');
console.log('Browser: Open in browser console and call generateAdminAPIKey()');
console.log('Manual: Use the Developer Dashboard in WitnessOS app');
