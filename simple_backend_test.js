#!/usr/bin/env node
/**
 * Simple Backend Test
 * Tests Railway backend connectivity
 */

const BACKEND_URL = 'https://witnessos-engines-production.up.railway.app';

async function testBackend() {
  console.log('🧪 Testing Railway Backend...');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Test root endpoint
    console.log('\n1. Testing root endpoint...');
    const rootResponse = await fetch(BACKEND_URL);
    console.log(`Root response: ${rootResponse.status} ${rootResponse.statusText}`);
    
    // Test numerology engine
    console.log('\n2. Testing numerology engine...');
    const engineResponse = await fetch(`${BACKEND_URL}/calculate/numerology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          birth_date: '1991-08-13',
          full_name: 'Test User'
        }
      }),
    });
    
    console.log(`Engine response: ${engineResponse.status} ${engineResponse.statusText}`);
    
    if (engineResponse.ok) {
      const result = await engineResponse.json();
      console.log('✅ Engine working!');
      console.log('Engine name:', result.data?.engine_name);
      console.log('Calculation time:', result.data?.calculation_time);
      console.log('Success:', result.success);
    } else {
      const errorText = await engineResponse.text();
      console.log('❌ Engine failed');
      console.log('Error:', errorText.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testBackend();
