#!/usr/bin/env node

/**
 * Engine Validation Script for WitnessOS
 * 
 * Tests all engines with default user data for accuracy validation
 * Usage: node scripts/validate-engines.js [engine_name]
 */

const API_BASE_URL = process.env.API_URL || 'https://api.witnessos.space';

// Default test user details
const DEFAULT_TEST_USER = {
  fullName: 'Cumbipuram Nateshan Sheshnarayan',
  email: 'sheshnarayan.iyer@gmail.com',
  birthDate: '1991-08-13', // 13 August 1991
  birthTime: '13:31', // 1:31 PM
  birthLocation: {
    name: 'Bangalore, India',
    latitude: 12.971599,
    longitude: 77.594566,
    timezone: 'Asia/Kolkata'
  }
};

async function validateAllEngines() {
  console.log('🧠 WitnessOS Engine Validation');
  console.log('================================');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`👤 Test User: ${DEFAULT_TEST_USER.fullName}`);
  console.log(`📅 Birth Date: ${DEFAULT_TEST_USER.birthDate} at ${DEFAULT_TEST_USER.birthTime}`);
  console.log(`🌍 Location: ${DEFAULT_TEST_USER.birthLocation.name}`);
  console.log('');

  try {
    const response = await fetch(`${API_BASE_URL}/validate/engines`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Validation failed');
    }

    console.log('📊 Validation Summary:');
    console.log(`   Total Engines: ${data.summary.totalEngines}`);
    console.log(`   ✅ Successful: ${data.summary.successful}`);
    console.log(`   ❌ Failed: ${data.summary.failed}`);
    console.log('');

    // Display results for each engine
    for (const [engineName, result] of Object.entries(data.results)) {
      console.log(`🔮 ${engineName.toUpperCase()}`);
      console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (result.success) {
        console.log(`   Calculation Time: ${result.calculationTime}ms`);
        console.log(`   Result Keys: ${Object.keys(result.result.data || {}).join(', ')}`);
        
        // Show key result data
        if (result.result.data) {
          const data = result.result.data;
          
          switch (engineName) {
            case 'numerology':
              if (data.coreNumbers) {
                console.log(`   Life Path: ${data.coreNumbers.lifePath}`);
                console.log(`   Expression: ${data.coreNumbers.expression}`);
                console.log(`   Soul Urge: ${data.coreNumbers.soulUrge}`);
              }
              break;
              
            case 'human_design':
              if (data.type) {
                console.log(`   Type: ${data.type}`);
                console.log(`   Strategy: ${data.strategy}`);
                console.log(`   Authority: ${data.authority}`);
              }
              break;
              
            case 'biorhythm':
              if (data.cycles) {
                console.log(`   Physical: ${data.cycles.physical?.percentage?.toFixed(1)}%`);
                console.log(`   Emotional: ${data.cycles.emotional?.percentage?.toFixed(1)}%`);
                console.log(`   Intellectual: ${data.cycles.intellectual?.percentage?.toFixed(1)}%`);
              }
              break;
              
            case 'tarot':
              if (data.cards) {
                console.log(`   Cards Drawn: ${data.cards.length}`);
                console.log(`   Spread: ${data.spreadType}`);
              }
              break;
              
            case 'iching':
              if (data.hexagram) {
                console.log(`   Hexagram: ${data.hexagram.number} - ${data.hexagram.name}`);
              }
              break;
              
            default:
              // Show first few keys of result data
              const keys = Object.keys(data).slice(0, 3);
              if (keys.length > 0) {
                console.log(`   Data: ${keys.join(', ')}${keys.length < Object.keys(data).length ? '...' : ''}`);
              }
          }
        }
      } else {
        console.log(`   Error: ${result.error}`);
      }
      
      console.log('');
    }

    return data;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

async function validateSingleEngine(engineName) {
  console.log(`🔮 Validating ${engineName.toUpperCase()} Engine`);
  console.log('================================');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`👤 Test User: ${DEFAULT_TEST_USER.fullName}`);
  console.log('');

  try {
    const response = await fetch(`${API_BASE_URL}/validate/engines/${engineName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Engine validation failed');
    }

    console.log('📊 Engine Result:');
    console.log(`   Status: ✅ SUCCESS`);
    console.log(`   Calculation Time: ${data.calculationTime}ms`);
    console.log('');

    console.log('📥 Input Data:');
    console.log(JSON.stringify(data.input, null, 2));
    console.log('');

    console.log('📤 Output Data:');
    console.log(JSON.stringify(data.result, null, 2));

    return data;

  } catch (error) {
    console.error(`❌ ${engineName} validation failed:`, error.message);
    process.exit(1);
  }
}

async function main() {
  const engineName = process.argv[2];
  
  if (engineName) {
    await validateSingleEngine(engineName);
  } else {
    await validateAllEngines();
  }
}

// Run the validation
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  validateAllEngines,
  validateSingleEngine,
  DEFAULT_TEST_USER
};
