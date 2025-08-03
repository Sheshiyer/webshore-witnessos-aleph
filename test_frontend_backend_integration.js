#!/usr/bin/env node
/**
 * Frontend-Backend Integration Test
 * 
 * Tests all 13 consciousness engines via the frontend API client
 * Verifies Railway backend connectivity and engine functionality
 */

// Using built-in fetch (Node.js 18+)

const BACKEND_URL = 'https://witnessos-engines-production.up.railway.app';
const ENGINES = [
  'numerology', 'human_design', 'tarot', 'iching', 'enneagram',
  'sacred_geometry', 'biorhythm', 'vimshottari', 'gene_keys',
  'sigil_forge', 'vedicclock_tcm', 'face_reading', 'biofield'
];

// Test data for different engines
const TEST_DATA = {
  numerology: {
    birth_date: '1991-08-13',
    full_name: 'Test User'
  },
  human_design: {
    birth_date: '1991-08-13',
    birth_time: '13:31:00',
    birth_location: [12.9629, 77.5775],
    timezone: 'Asia/Kolkata'
  },
  tarot: {
    question: 'What should I focus on today?',
    spread_type: 'three_card'
  },
  iching: {
    question: 'What is the current situation?'
  },
  enneagram: {
    assessment_responses: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  sacred_geometry: {
    intention: 'Personal growth',
    geometric_focus: 'flower_of_life'
  },
  biorhythm: {
    birth_date: '1991-08-13'
  },
  vimshottari: {
    birth_date: '1991-08-13',
    birth_time: '13:31:00',
    birth_location: [12.9629, 77.5775],
    timezone: 'Asia/Kolkata'
  },
  gene_keys: {
    birth_date: '1991-08-13',
    birth_time: '13:31:00',
    birth_location: [12.9629, 77.5775],
    timezone: 'Asia/Kolkata'
  },
  sigil_forge: {
    intention: 'Manifest abundance',
    style: 'chaos_magic'
  },
  vedicclock_tcm: {
    birth_date: '1991-08-13',
    birth_time: '13:31:00',
    birth_location: [12.9629, 77.5775],
    timezone: 'Asia/Kolkata'
  },
  face_reading: {
    birth_date: '1991-08-13',
    birth_time: '13:31:00',
    birth_location: [12.9629, 77.5775],
    timezone: 'Asia/Kolkata',
    processing_consent: true
  },
  biofield: {
    birth_date: '1991-08-13',
    birth_time: '13:31:00',
    birth_location: [12.9629, 77.5775],
    timezone: 'Asia/Kolkata',
    biometric_consent: true
  }
};

async function testBackendConnectivity() {
  console.log('🧪 Testing Railway Backend Connectivity');
  console.log('=' * 50);
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📡 Backend Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log('✅ Backend is running (404 expected for root endpoint)');
      return true;
    } else if (response.ok) {
      const data = await response.text();
      console.log('✅ Backend is running and responding');
      console.log(`📄 Response: ${data.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`❌ Backend returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend connection failed: ${error.message}`);
    return false;
  }
}

async function testEngine(engineName) {
  console.log(`\n🧠 Testing ${engineName} engine...`);
  
  try {
    const testData = TEST_DATA[engineName];
    if (!testData) {
      console.log(`⚠️ No test data for ${engineName}`);
      return { success: false, error: 'No test data' };
    }
    
    const response = await fetch(`${BACKEND_URL}/calculate/${engineName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: testData }),
    });
    
    console.log(`📡 ${engineName} response: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${engineName} engine working`);
      console.log(`⏱️ Calculation time: ${result.data?.calculation_time || 'N/A'}s`);
      console.log(`🎯 Confidence: ${result.data?.confidence_score || 'N/A'}`);
      return { success: true, data: result };
    } else {
      const errorText = await response.text();
      console.log(`❌ ${engineName} failed: ${response.status}`);
      console.log(`📄 Error: ${errorText.substring(0, 200)}...`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ ${engineName} exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 WitnessOS Frontend-Backend Integration Test');
  console.log('=' * 60);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Testing ${ENGINES.length} consciousness engines`);
  console.log('=' * 60);
  
  // Test backend connectivity first
  const backendOk = await testBackendConnectivity();
  if (!backendOk) {
    console.log('\n❌ Backend connectivity failed - aborting engine tests');
    return;
  }
  
  // Test all engines
  const results = {};
  let successCount = 0;
  
  for (const engine of ENGINES) {
    const result = await testEngine(engine);
    results[engine] = result;
    if (result.success) successCount++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '=' * 60);
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' * 60);
  console.log(`✅ Successful: ${successCount}/${ENGINES.length} engines`);
  console.log(`❌ Failed: ${ENGINES.length - successCount}/${ENGINES.length} engines`);
  
  console.log('\n📋 Detailed Results:');
  for (const [engine, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    const error = result.error ? ` (${result.error.substring(0, 50)}...)` : '';
    console.log(`${status} ${engine}${error}`);
  }
  
  if (successCount === ENGINES.length) {
    console.log('\n🎉 ALL ENGINES OPERATIONAL!');
    console.log('🌟 WitnessOS frontend-backend integration is working perfectly!');
  } else if (successCount > 0) {
    console.log(`\n⚠️ Partial success: ${successCount} engines working`);
    console.log('🔧 Some engines need debugging');
  } else {
    console.log('\n❌ No engines working - check backend deployment');
  }
  
  console.log('\n🔗 Next steps:');
  console.log('1. Check browser console at http://localhost:3000');
  console.log('2. Test engines via frontend interface');
  console.log('3. Debug any failing engines');
  console.log('=' * 60);
}

// Run the tests
runAllTests().catch(console.error);
