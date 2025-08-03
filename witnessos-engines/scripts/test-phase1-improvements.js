#!/usr/bin/env node

/**
 * Phase 1 Infrastructure Scaling Test Suite
 * 
 * Tests all Phase 1 improvements:
 * 1. Database performance indexes
 * 2. Reading history optimization
 * 3. Intelligent caching strategy
 * 4. User profile persistence enhancement
 * 5. OpenRouter circuit breaker pattern
 * 6. AI synthesis caching
 */

const API_BASE_URL = process.env.API_URL || 'https://witnessos-backend-prod.sheshnarayaniyer.workers.dev';
const TEST_USER_EMAIL = 'sheshnarayan.iyer@gmail.com';
const TEST_USER_PASSWORD = 'admin123';

class Phase1TestSuite {
  constructor() {
    this.token = null;
    this.userId = null;
    this.testResults = {
      databasePerformance: { passed: 0, failed: 0, tests: [] },
      readingHistory: { passed: 0, failed: 0, tests: [] },
      intelligentCaching: { passed: 0, failed: 0, tests: [] },
      userProfilePersistence: { passed: 0, failed: 0, tests: [] },
      circuitBreaker: { passed: 0, failed: 0, tests: [] },
      aiSynthesisCaching: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Phase 1 Infrastructure Scaling Test Suite\n');
    
    try {
      // Authenticate
      await this.authenticate();
      
      // Run test suites
      await this.testDatabasePerformance();
      await this.testReadingHistoryOptimization();
      await this.testIntelligentCaching();
      await this.testUserProfilePersistence();
      await this.testCircuitBreakerPattern();
      await this.testAISynthesisCaching();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async authenticate() {
    console.log('🔐 Authenticating test user...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.token = data.token;
    this.userId = data.user.id;
    
    console.log('✅ Authentication successful\n');
  }

  async testDatabasePerformance() {
    console.log('📊 Testing Database Performance Indexes...');
    
    // Test reading history query performance
    const startTime = Date.now();
    const response = await this.makeRequest('/api/readings/history', {
      method: 'GET',
      params: { userId: this.userId, limit: 100, timeRange: '90d' }
    });
    const queryTime = Date.now() - startTime;
    
    this.recordTest('databasePerformance', 'Reading history query performance', 
      queryTime < 100, `Query took ${queryTime}ms (target: <100ms)`);
    
    console.log(`  ⏱️  Reading history query: ${queryTime}ms\n`);
  }

  async testReadingHistoryOptimization() {
    console.log('📚 Testing Reading History Optimization...');
    
    // Test paginated reading history
    const response = await this.makeRequest('/api/readings/history', {
      method: 'GET',
      params: { 
        userId: this.userId, 
        limit: 20, 
        offset: 0,
        timeRange: '30d',
        sortBy: 'created_at',
        sortOrder: 'DESC'
      }
    });
    
    this.recordTest('readingHistory', 'Paginated reading history', 
      response.success && Array.isArray(response.readings), 
      `Returned ${response.readings?.length || 0} readings`);
    
    this.recordTest('readingHistory', 'Reading history metadata', 
      response.hasOwnProperty('total') && response.hasOwnProperty('hasMore'), 
      'Includes pagination metadata');
    
    console.log(`  📖 Retrieved ${response.readings?.length || 0} readings with pagination\n`);
  }

  async testIntelligentCaching() {
    console.log('🧠 Testing Intelligent Caching Strategy...');
    
    // Test engine calculation with caching
    const engineName = 'numerology';
    const testInput = {
      birthDate: '1991-08-13',
      name: 'Test User'
    };
    
    // First calculation (cache miss)
    const startTime1 = Date.now();
    const response1 = await this.makeRequest(`/api/engines/${engineName}/calculate`, {
      method: 'POST',
      body: testInput
    });
    const time1 = Date.now() - startTime1;
    
    // Second calculation (should be cache hit)
    const startTime2 = Date.now();
    const response2 = await this.makeRequest(`/api/engines/${engineName}/calculate`, {
      method: 'POST',
      body: testInput
    });
    const time2 = Date.now() - startTime2;
    
    this.recordTest('intelligentCaching', 'Cache performance improvement', 
      time2 < time1 * 0.5, `First: ${time1}ms, Second: ${time2}ms`);
    
    this.recordTest('intelligentCaching', 'Confidence-based caching', 
      response1.success && response2.success, 
      'Both calculations successful');
    
    console.log(`  ⚡ Cache performance: ${time1}ms → ${time2}ms\n`);
  }

  async testUserProfilePersistence() {
    console.log('👤 Testing User Profile Persistence Enhancement...');
    
    // Test optimized profile storage
    const profileData = {
      birthDate: '1991-08-13',
      birthTime: '13:31',
      latitude: 12.9629,
      longitude: 77.5775,
      preferences: { theme: 'cyberpunk', notifications: true }
    };
    
    const startTime = Date.now();
    const response = await this.makeRequest('/api/user/profile', {
      method: 'POST',
      body: profileData
    });
    const saveTime = Date.now() - startTime;
    
    this.recordTest('userProfilePersistence', 'Profile save performance', 
      saveTime < 50, `Profile saved in ${saveTime}ms (target: <50ms)`);
    
    this.recordTest('userProfilePersistence', 'Profile save success', 
      response.success, 'Profile saved successfully');
    
    console.log(`  💾 Profile saved in ${saveTime}ms\n`);
  }

  async testCircuitBreakerPattern() {
    console.log('🔌 Testing OpenRouter Circuit Breaker Pattern...');
    
    // Test AI-enhanced calculation
    const response = await this.makeRequest('/api/engines/numerology/ai-enhanced', {
      method: 'POST',
      body: {
        birthDate: '1991-08-13',
        name: 'Test User',
        focusArea: 'career'
      }
    });
    
    this.recordTest('circuitBreaker', 'AI enhancement with circuit breaker', 
      response.success, 'AI enhancement completed');
    
    this.recordTest('circuitBreaker', 'Circuit breaker metadata', 
      response.metadata?.ai?.circuitBreakerStats !== undefined, 
      'Circuit breaker stats included');
    
    console.log(`  🤖 AI enhancement: ${response.success ? 'Success' : 'Failed'}\n`);
  }

  async testAISynthesisCaching() {
    console.log('🔮 Testing AI Synthesis Caching...');
    
    const synthesisInput = {
      readings: [
        { engine: 'numerology', data: { lifePathNumber: 7, expression: 3 } },
        { engine: 'biorhythm', data: { physical: 0.8, emotional: 0.6, intellectual: 0.9 } }
      ],
      aiConfig: {
        model: 'anthropic/claude-3-haiku',
        temperature: 0.7,
        focusArea: 'personal_growth'
      },
      useCache: true
    };
    
    // First synthesis (cache miss)
    const startTime1 = Date.now();
    const response1 = await this.makeRequest('/api/ai/synthesis', {
      method: 'POST',
      body: synthesisInput
    });
    const time1 = Date.now() - startTime1;
    
    // Second synthesis (should be cache hit)
    const startTime2 = Date.now();
    const response2 = await this.makeRequest('/api/ai/synthesis', {
      method: 'POST',
      body: synthesisInput
    });
    const time2 = Date.now() - startTime2;
    
    this.recordTest('aiSynthesisCaching', 'AI synthesis caching', 
      response2.fromCache === true, 'Second request served from cache');
    
    this.recordTest('aiSynthesisCaching', 'Cache performance improvement', 
      time2 < time1 * 0.3, `First: ${time1}ms, Second: ${time2}ms`);
    
    console.log(`  🎯 AI synthesis caching: ${time1}ms → ${time2}ms (cached: ${response2.fromCache})\n`);
  }

  async makeRequest(endpoint, options = {}) {
    const { method = 'GET', body, params } = options;
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchOptions);
    return await response.json();
  }

  recordTest(category, testName, passed, details) {
    const test = { name: testName, passed, details };
    this.testResults[category].tests.push(test);
    
    if (passed) {
      this.testResults[category].passed++;
      console.log(`  ✅ ${testName}: ${details}`);
    } else {
      this.testResults[category].failed++;
      console.log(`  ❌ ${testName}: ${details}`);
    }
  }

  generateReport() {
    console.log('\n📋 Phase 1 Infrastructure Scaling Test Report');
    console.log('='.repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const [category, results] of Object.entries(this.testResults)) {
      const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`\n${categoryName}:`);
      console.log(`  ✅ Passed: ${results.passed}`);
      console.log(`  ❌ Failed: ${results.failed}`);
      
      totalPassed += results.passed;
      totalFailed += results.failed;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total Tests: ${totalPassed + totalFailed}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All Phase 1 infrastructure improvements are working correctly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new Phase1TestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = Phase1TestSuite;
