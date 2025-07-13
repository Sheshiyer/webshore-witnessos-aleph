/**
 * Quick test script to validate the engine validation system
 * Run with: node test-validation.js
 */

const API_URL = process.env.API_URL || 'https://api.witnessos.space';

async function testValidationEndpoints() {
  console.log('🧪 Testing WitnessOS Engine Validation System');
  console.log('==============================================');
  console.log(`API URL: ${API_URL}`);
  console.log('');

  // Test 1: Get default test user info
  console.log('📋 Test 1: Get Default Test User Info');
  try {
    const response = await fetch(`${API_URL}/validate/user`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ SUCCESS');
      console.log(`   Name: ${data.testUser.fullName}`);
      console.log(`   Birth: ${data.testUser.birthDate} at ${data.testUser.birthTime}`);
      console.log(`   Location: ${data.testUser.birthLocation.name}`);
      console.log(`   Available Engines: ${data.availableEngines.length}`);
    } else {
      console.log('❌ FAILED:', data.error);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  console.log('');

  // Test 2: Validate a single engine (numerology)
  console.log('🔢 Test 2: Validate Numerology Engine');
  try {
    const response = await fetch(`${API_URL}/validate/engines/numerology`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ SUCCESS');
      console.log(`   Calculation Time: ${data.calculationTime}ms`);
      console.log(`   Engine: ${data.engine}`);
      
      if (data.result && data.result.data && data.result.data.coreNumbers) {
        const core = data.result.data.coreNumbers;
        console.log(`   Life Path: ${core.lifePath}`);
        console.log(`   Expression: ${core.expression}`);
        console.log(`   Soul Urge: ${core.soulUrge}`);
      }
    } else {
      console.log('❌ FAILED:', data.error);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  console.log('');

  // Test 3: Validate all engines (summary only)
  console.log('🌟 Test 3: Validate All Engines (Summary)');
  try {
    const response = await fetch(`${API_URL}/validate/engines`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ SUCCESS');
      console.log(`   Total Engines: ${data.summary.totalEngines}`);
      console.log(`   Successful: ${data.summary.successful}`);
      console.log(`   Failed: ${data.summary.failed}`);
      
      // Show which engines succeeded/failed
      const successful = [];
      const failed = [];
      
      for (const [engineName, result] of Object.entries(data.results)) {
        if (result.success) {
          successful.push(`${engineName} (${result.calculationTime}ms)`);
        } else {
          failed.push(`${engineName}: ${result.error}`);
        }
      }
      
      if (successful.length > 0) {
        console.log(`   ✅ Successful: ${successful.join(', ')}`);
      }
      
      if (failed.length > 0) {
        console.log(`   ❌ Failed: ${failed.join(', ')}`);
      }
    } else {
      console.log('❌ FAILED:', data.error);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  console.log('');

  console.log('🎯 Validation Testing Complete!');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Deploy the backend: npm run deploy:backend');
  console.log('2. Run full validation: node scripts/validate-engines.js');
  console.log('3. Test individual engines: node scripts/validate-engines.js numerology');
}

// Run the test
testValidationEndpoints().catch(console.error);
