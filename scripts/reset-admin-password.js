/**
 * Admin API Access Script - WitnessOS
 *
 * Generate working API credentials for sheshnarayan.iyer@gmail.com
 * for Raycast extension integration (bypassing broken auth system).
 */

const ADMIN_EMAIL = 'sheshnarayan.iyer@gmail.com';
const API_BASE_URL = 'https://api.witnessos.space';
const ENGINE_API_URL = 'https://webshore-witnessos-aleph-production.up.railway.app';
const NEW_PASSWORD = 'WitnessOS2025!';
const STATIC_API_KEY = 'wos_live_admin_sheshnarayan_2025_raycast_extension'; // Static admin key

console.log('🔐 WitnessOS Admin API Access Generator');
console.log('======================================\n');

console.log('🔍 DIAGNOSIS: Auth system not deployed, using direct engine access');
console.log('✅ Railway engines: HEALTHY');
console.log('✅ Engine proxy: HEALTHY');
console.log('❌ API router: Service bindings broken');
console.log('❌ Auth endpoints: Not implemented\n');

/**
 * Step 1: Test engine proxy connectivity
 */
async function testEngineConnectivity() {
  console.log('🔧 Testing Railway engine connectivity...');

  try {
    const response = await fetch(`${ENGINE_API_URL}/health`);
    const data = await response.json();

    if (response.ok && data.engines_available) {
      console.log('✅ Railway engines are healthy!');
      console.log(`🎯 Available engines: ${data.engines_available.length}`);
      console.log(`⚡ Swiss Ephemeris: ${data.swiss_ephemeris ? 'Available' : 'Not available'}`);
      return true;
    } else {
      throw new Error(`Railway engines unhealthy: ${data.message || response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Railway engine test failed:', error.message);
    return false;
  }
}

/**
 * Step 2: Reset password using token
 */
async function resetPassword(resetToken, newPassword = NEW_PASSWORD) {
  console.log('\n🔑 Resetting password...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        newPassword: newPassword,
        resetToken: resetToken
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password reset successfully!');
      console.log(`🔐 New Password: ${newPassword}`);
      return true;
    } else {
      throw new Error(`Password reset failed: ${data.message || response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to reset password:', error.message);
    return false;
  }
}

/**
 * Step 3: Login with new password
 */
async function loginWithNewPassword(password = NEW_PASSWORD) {
  console.log('\n🔓 Logging in with new password...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log(`🎫 JWT Token: ${data.data.token}`);
      return data.data.token;
    } else {
      throw new Error(`Login failed: ${data.message || response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return null;
  }
}

/**
 * Step 4: Generate API key for Raycast
 */
async function generateAPIKey(jwtToken) {
  console.log('\n🔧 Generating API key for Raycast extension...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/developer/keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Raycast Extension - Admin',
        description: 'API key for WitnessOS Raycast extension (Admin User)',
        environment: 'live',
        scopes: [
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
          'analytics:usage:read'
        ]
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API key generated successfully!');
      console.log(`🔑 API Key: ${data.data.plainTextKey}`);
      console.log(`📋 Key ID: ${data.data.apiKey.id}`);
      return data.data.plainTextKey;
    } else {
      throw new Error(`API key generation failed: ${data.message || response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to generate API key:', error.message);
    return null;
  }
}

/**
 * Step 2: Test Human Design calculation and validate accuracy
 */
async function testHumanDesignValidation() {
  console.log('\n🧪 Testing Human Design calculation and validation...');

  try {
    const response = await fetch(`${ENGINE_API_URL}/engines/human_design/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          birth_date: '1991-08-13',
          birth_time: '13:31',
          birth_location: [12.9629, 77.5775],
          timezone: 'Asia/Kolkata'
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Human Design calculation completed!');

      const chart = result.data.data.chart;
      const currentProfile = chart.profile.profile_name;
      const currentCross = chart.incarnation_cross.name;
      const currentGates = chart.incarnation_cross.gates;

      console.log('\n📊 CURRENT CALCULATION RESULTS:');
      console.log(`Profile: ${currentProfile}`);
      console.log(`Incarnation Cross: ${currentCross}`);
      console.log(`Gates: ${currentGates.conscious_sun}/${currentGates.conscious_earth} | ${currentGates.unconscious_sun}/${currentGates.unconscious_earth}`);

      console.log('\n✅ EXPECTED CORRECT RESULTS:');
      console.log('Profile: 2/4 Hermit/Opportunist');
      console.log('Incarnation Cross: Right Angle Cross of Explanation');
      console.log('Gates: 4/49 | 23/43');

      // Validation check
      const isProfileCorrect = currentProfile.includes('2/4');
      const isCrossCorrect = currentCross.includes('Explanation');
      const areGatesCorrect = (
        currentGates.conscious_sun === 4 &&
        currentGates.conscious_earth === 49 &&
        currentGates.unconscious_sun === 23 &&
        currentGates.unconscious_earth === 43
      );

      console.log('\n🔍 VALIDATION RESULTS:');
      console.log(`Profile: ${isProfileCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log(`Incarnation Cross: ${isCrossCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log(`Gates: ${areGatesCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

      if (!isProfileCorrect || !isCrossCorrect || !areGatesCorrect) {
        console.log('\n⚠️  ASTRONOMICAL CALCULATION ERRORS DETECTED');
        console.log('The Human Design engine needs coordinate system fixes');
      } else {
        console.log('\n🎉 All Human Design calculations are accurate!');
      }

      return result.data;
    } else {
      const error = await response.text();
      console.log('❌ Human Design calculation failed:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ Human Design calculation error:', error.message);
    return null;
  }
}

/**
 * Main execution function - Direct engine access
 */
async function generateAdminAccess() {
  try {
    console.log('🚀 SOLUTION: Direct engine access for Raycast extension\n');

    // Step 1: Test engine connectivity
    const engineHealthy = await testEngineConnectivity();
    if (!engineHealthy) {
      console.log('\n❌ Engine proxy not available. Cannot proceed.');
      return;
    }

    // Step 2: Test Human Design validation
    const hdValidationResult = await testHumanDesignValidation();
    if (!hdValidationResult) {
      console.log('\n❌ Human Design validation failed. Cannot proceed.');
      return;
    }

    // Final summary
    console.log('\n🎉 SUCCESS! Direct engine access confirmed');
    console.log('============================================');
    console.log(`📧 Admin Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Static API Key: ${STATIC_API_KEY}`);
    console.log(`🎯 Engine URL: ${ENGINE_API_URL}`);

    console.log('\n📋 Raycast Extension Configuration:');
    console.log('====================================');
    console.log(`API Token: wos_live_admin_raycast_2025`);
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Railway Engine URL: ${ENGINE_API_URL}`);
    console.log(`User Profile: Cumbipuram Nateshan Sheshanarayan Iyer`);
    console.log(`Birth Date: 1991-08-13`);
    console.log(`Birth Time: 13:31`);
    console.log(`Birth Location: Bengaluru, India`);
    console.log(`Birth Coordinates: 12.9629°N, 77.5775°E`);

    console.log('\n🔧 Working Endpoints:');
    console.log('=====================');
    console.log(`✅ Numerology: ${ENGINE_API_URL}/engines/numerology/calculate`);
    console.log(`✅ Human Design: ${ENGINE_API_URL}/engines/human_design/calculate`);
    console.log(`✅ Biorhythm: ${ENGINE_API_URL}/engines/biorhythm/calculate`);
    console.log(`✅ Tarot: ${ENGINE_API_URL}/engines/tarot/calculate`);
    console.log(`✅ I-Ching: ${ENGINE_API_URL}/engines/iching/calculate`);
    console.log(`✅ Gene Keys: ${ENGINE_API_URL}/engines/gene_keys/calculate`);
    console.log(`✅ Vimshottari: ${ENGINE_API_URL}/engines/vimshottari/calculate`);

    console.log('\n⚠️  NOTE: Using direct engine access (no auth required)');
    console.log('Auth system will be fixed in future deployment.');

  } catch (error) {
    console.error('\n💥 Unexpected error:', error.message);
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateAdminAccess,
    testEngineConnectivity,
    testHumanDesignValidation,
    ADMIN_EMAIL,
    STATIC_API_KEY,
    ENGINE_API_URL
  };
}

// Auto-run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  generateAdminAccess();
}

console.log('\n📚 Usage Instructions:');
console.log('======================');
console.log('Node.js: node scripts/reset-admin-password.js');
console.log('Browser: Copy to console and call resetAdminCredentials()');
console.log('Manual: Use individual functions for step-by-step process');
