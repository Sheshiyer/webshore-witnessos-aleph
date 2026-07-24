/**
 * Engine Integration Testing Framework
 * 
 * Comprehensive testing system for WitnessOS consciousness engines
 * Tests real Railway backend integration with performance monitoring
 */

import { apiClient } from '@/utils/api-client';
import { DEFAULT_TEST_USER, getEngineTestInput, getAllEngineTestInputs, VALIDATION_METADATA } from '@/lib/validation-constants';
import type { EngineName } from '@/types/consciousness';

// Test Result Types
export interface EngineTestResult {
  engineName: string;
  success: boolean;
  executionTime: number;
  responseSize: number;
  error?: string;
  result?: any;
  validationPassed: boolean;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: string;
}

export interface TestSuiteResult {
  totalTests: number;
  passed: number;
  failed: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  results: EngineTestResult[];
  timestamp: string;
  testUser: typeof DEFAULT_TEST_USER;
}

export interface EngineValidationRule {
  name: string;
  validate: (result: any) => boolean;
  description: string;
}

// Performance Thresholds
const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 500,   // < 500ms = A
  GOOD: 1000,       // < 1s = B  
  ACCEPTABLE: 2000, // < 2s = C
  POOR: 5000,       // < 5s = D
  // > 5s = F
} as const;

// Engine-specific validation rules
const ENGINE_VALIDATION_RULES: Record<string, EngineValidationRule[]> = {
  numerology: [
    {
      name: 'has_formatted_output',
      validate: (result) => result?.data?.data?.formatted_output !== undefined,
      description: 'Result should contain formatted numerology output'
    },
    {
      name: 'has_life_path',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Life Path');
      },
      description: 'Result should contain Life Path information'
    },
    {
      name: 'has_expression_number',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Expression');
      },
      description: 'Result should contain Expression number'
    },
    {
      name: 'has_soul_urge',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Soul Urge');
      },
      description: 'Result should contain Soul Urge number'
    },
    {
      name: 'has_personality',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Personality');
      },
      description: 'Result should contain Personality number'
    },
    {
      name: 'has_personal_year',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Personal Year');
      },
      description: 'Result should contain Personal Year'
    },
    {
      name: 'has_recommendations',
      validate: (result) => {
        return Array.isArray(result?.data?.data?.recommendations) && result.data.data.recommendations.length > 0;
      },
      description: 'Result should contain recommendations array'
    }
  ],
  
  human_design: [
    {
      name: 'has_type',
      validate: (result) => result?.data?.data?.chart?.type_info !== undefined,
      description: 'Result should contain Human Design type'
    },
    {
      name: 'has_profile',
      validate: (result) => result?.data?.data?.chart?.profile !== undefined,
      description: 'Result should contain profile information'
    },
    {
      name: 'has_centers',
      validate: (result) => result?.data?.data?.chart?.centers && Object.keys(result.data.data.chart.centers).length > 0,
      description: 'Result should contain center definitions'
    }
  ],
  
  biorhythm: [
    {
      name: 'has_formatted_output',
      validate: (result) => result?.data?.data?.formatted_output !== undefined,
      description: 'Result should contain biorhythm formatted output'
    },
    {
      name: 'has_physical_cycle',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('PHYSICAL FIELD');
      },
      description: 'Result should contain physical cycle information'
    },
    {
      name: 'has_emotional_cycle',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('EMOTIONAL FIELD');
      },
      description: 'Result should contain emotional cycle information'
    },
    {
      name: 'has_intellectual_cycle',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('INTELLECTUAL FIELD');
      },
      description: 'Result should contain intellectual cycle information'
    }
  ],
  
  tarot: [
    {
      name: 'has_formatted_output',
      validate: (result) => result?.data?.data?.formatted_output !== undefined,
      description: 'Result should contain tarot formatted output'
    },
    {
      name: 'has_card_positions',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Position 1:') || output.includes('Position 2:') || output.includes('Position 3:');
      },
      description: 'Should contain card position information'
    },
    {
      name: 'has_card_meanings',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Past influences') || output.includes('Present situation') || output.includes('Future outcome');
      },
      description: 'Should contain card meaning interpretations'
    },
    {
      name: 'has_recommendations',
      validate: (result) => {
        const recommendations = result?.data?.data?.recommendations;
        return Array.isArray(recommendations) && recommendations.length > 0;
      },
      description: 'Should contain recommendations array'
    }
  ],
  
  iching: [
    {
      name: 'has_formatted_output',
      validate: (result) => result?.data?.data?.formatted_output !== undefined,
      description: 'Result should contain I Ching formatted output'
    },
    {
      name: 'has_hexagram_info',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Primary Hexagram') || output.includes('Hexagram #');
      },
      description: 'Should contain hexagram information'
    },
    {
      name: 'has_trigrams',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Trigrams:');
      },
      description: 'Should contain trigram information'
    },
    {
      name: 'has_judgment',
      validate: (result) => {
        const output = result?.data?.data?.formatted_output || '';
        return output.includes('Judgment:');
      },
      description: 'Should contain judgment text'
    }
  ],
  
  // Add more validation rules for other engines
  vimshottari: [
    {
      name: 'has_current_period',
      validate: (result) => result?.data?.data?.current_period !== undefined,
      description: 'Result should contain current dasha period'
    }
  ],
  
  gene_keys: [
    {
      name: 'has_activation_sequence',
      validate: (result) => result?.data?.data?.activation_sequence !== undefined,
      description: 'Result should contain Gene Keys activation sequence'
    }
  ],
  
  enneagram: [
    {
      name: 'has_type',
      validate: (result) => result?.data?.data?.type !== undefined,
      description: 'Result should contain Enneagram type'
    },
    {
      name: 'valid_type_range',
      validate: (result) => {
        const type = result?.data?.data?.type;
        return typeof type === 'number' && type >= 1 && type <= 9;
      },
      description: 'Enneagram type should be between 1-9'
    }
  ],
  
  sacred_geometry: [
    {
      name: 'has_pattern',
      validate: (result) => result?.data?.data?.pattern !== undefined,
      description: 'Result should contain sacred geometry pattern'
    }
  ],
  
  sigil_forge: [
    {
      name: 'has_sigil',
      validate: (result) => result?.data?.data?.sigil !== undefined,
      description: 'Result should contain generated sigil'
    }
  ]
};

/**
 * Engine Integration Testing Framework
 */
export class EngineTestingFramework {
  private results: EngineTestResult[] = [];
  private isRunning = false;
  
  /**
   * Test a single engine with validation
   */
  async testEngine(engineName: EngineName): Promise<EngineTestResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    try {
      console.log(`🧪 Testing ${engineName} engine...`);
      
      // Get test input for this engine
      const testInput = getEngineTestInput(engineName);
      
      // Execute engine calculation
      const result = await apiClient.calculateEngine(engineName, testInput);
      
      const executionTime = Date.now() - startTime;
      const responseSize = JSON.stringify(result).length;
      
      // Validate result
      const validationPassed = this.validateEngineResult(engineName, result);
      
      // Calculate performance grade
      const performanceGrade = this.calculatePerformanceGrade(executionTime);
      
      const testResult: EngineTestResult = {
        engineName,
        success: true,
        executionTime,
        responseSize,
        result,
        validationPassed,
        performanceGrade,
        timestamp
      };
      
      console.log(`✅ ${engineName}: ${executionTime}ms (${performanceGrade}) - Validation: ${validationPassed ? '✅' : '❌'}`);
      
      this.results.push(testResult);
      return testResult;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const testResult: EngineTestResult = {
        engineName,
        success: false,
        executionTime,
        responseSize: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        validationPassed: false,
        performanceGrade: 'F',
        timestamp
      };
      
      console.error(`❌ ${engineName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      this.results.push(testResult);
      return testResult;
    }
  }
  
  /**
   * Test all available engines
   */
  async testAllEngines(): Promise<TestSuiteResult> {
    if (this.isRunning) {
      throw new Error('Test suite is already running');
    }
    
    this.isRunning = true;
    this.results = [];
    
    const startTime = Date.now();
    const engines = [...VALIDATION_METADATA.expectedEngines] as EngineName[];
    
    console.log(`🚀 Starting comprehensive engine test suite (${engines.length} engines)`);
    console.log(`📊 Test User: ${DEFAULT_TEST_USER.fullName}`);
    console.log(`📍 Location: ${DEFAULT_TEST_USER.birthLocation.name}`);
    console.log(`🎂 Birth: ${DEFAULT_TEST_USER.birthDate} at ${DEFAULT_TEST_USER.birthTime}`);
    console.log('─'.repeat(80));
    
    // Test each engine sequentially
    for (const engineName of engines) {
      await this.testEngine(engineName);
      // Small delay between tests to avoid overwhelming the backend
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalExecutionTime = Date.now() - startTime;
    const passed = this.results.filter(r => r.success && r.validationPassed).length;
    const failed = this.results.length - passed;
    const averageExecutionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length;
    
    const suiteResult: TestSuiteResult = {
      totalTests: this.results.length,
      passed,
      failed,
      averageExecutionTime,
      totalExecutionTime,
      performanceGrade: this.calculatePerformanceGrade(averageExecutionTime),
      results: [...this.results],
      timestamp: new Date().toISOString(),
      testUser: DEFAULT_TEST_USER
    };
    
    this.isRunning = false;
    
    // Print summary
    this.printTestSummary(suiteResult);
    
    return suiteResult;
  }
  
  /**
   * Test specific engines by name
   */
  async testEngines(engineNames: EngineName[]): Promise<TestSuiteResult> {
    if (this.isRunning) {
      throw new Error('Test suite is already running');
    }
    
    this.isRunning = true;
    this.results = [];
    
    const startTime = Date.now();
    
    console.log(`🎯 Testing specific engines: ${engineNames.join(', ')}`);
    console.log('─'.repeat(80));
    
    for (const engineName of engineNames) {
      await this.testEngine(engineName);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalExecutionTime = Date.now() - startTime;
    const passed = this.results.filter(r => r.success && r.validationPassed).length;
    const failed = this.results.length - passed;
    const averageExecutionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length;
    
    const suiteResult: TestSuiteResult = {
      totalTests: this.results.length,
      passed,
      failed,
      averageExecutionTime,
      totalExecutionTime,
      performanceGrade: this.calculatePerformanceGrade(averageExecutionTime),
      results: [...this.results],
      timestamp: new Date().toISOString(),
      testUser: DEFAULT_TEST_USER
    };
    
    this.isRunning = false;
    this.printTestSummary(suiteResult);
    
    return suiteResult;
  }
  
  /**
   * Validate engine result against known rules
   */
  private validateEngineResult(engineName: string, result: any): boolean {
    const rules = ENGINE_VALIDATION_RULES[engineName] || [];
    
    if (rules.length === 0) {
      // No validation rules defined, consider it passed if result exists
      return result !== null && result !== undefined;
    }
    

    
    // All rules must pass
    for (const rule of rules) {
      try {
        if (!rule.validate(result)) {
          console.warn(`⚠️  Validation failed for ${engineName}: ${rule.description}`);
          return false;
        }
      } catch (error) {
        console.warn(`⚠️  Validation error for ${engineName} (${rule.name}): ${error}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Calculate performance grade based on execution time
   */
  private calculatePerformanceGrade(executionTime: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (executionTime < PERFORMANCE_THRESHOLDS.EXCELLENT) return 'A';
    if (executionTime < PERFORMANCE_THRESHOLDS.GOOD) return 'B';
    if (executionTime < PERFORMANCE_THRESHOLDS.ACCEPTABLE) return 'C';
    if (executionTime < PERFORMANCE_THRESHOLDS.POOR) return 'D';
    return 'F';
  }
  
  /**
   * Print comprehensive test summary
   */
  private printTestSummary(result: TestSuiteResult): void {
    console.log('\n' + '═'.repeat(80));
    console.log('🧠 CONSCIOUSNESS ENGINE TEST SUITE RESULTS');
    console.log('═'.repeat(80));
    
    // Overall stats
    console.log(`📊 Total Tests: ${result.totalTests}`);
    console.log(`✅ Passed: ${result.passed} (${Math.round(result.passed / result.totalTests * 100)}%)`);
    console.log(`❌ Failed: ${result.failed} (${Math.round(result.failed / result.totalTests * 100)}%)`);
    console.log(`⏱️  Average Time: ${Math.round(result.averageExecutionTime)}ms (Grade: ${result.performanceGrade})`);
    console.log(`🕐 Total Time: ${Math.round(result.totalExecutionTime)}ms`);
    
    // Performance breakdown
    const gradeCount = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    result.results.forEach(r => gradeCount[r.performanceGrade]++);
    
    console.log('\n📈 Performance Distribution:');
    console.log(`   A (< 500ms): ${gradeCount.A} engines`);
    console.log(`   B (< 1s):    ${gradeCount.B} engines`);
    console.log(`   C (< 2s):    ${gradeCount.C} engines`);
    console.log(`   D (< 5s):    ${gradeCount.D} engines`);
    console.log(`   F (> 5s):    ${gradeCount.F} engines`);
    
    // Individual results
    console.log('\n🔍 Individual Engine Results:');
    result.results.forEach(r => {
      const status = r.success && r.validationPassed ? '✅' : '❌';
      const grade = r.performanceGrade;
      const time = `${r.executionTime}ms`;
      const validation = r.validationPassed ? '✅' : '❌';
      
      console.log(`   ${status} ${r.engineName.padEnd(15)} | ${time.padEnd(8)} | Grade: ${grade} | Validation: ${validation}`);
      
      if (r.error) {
        console.log(`      Error: ${r.error}`);
      }
    });
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    const slowEngines = result.results.filter(r => r.performanceGrade === 'D' || r.performanceGrade === 'F');
    const failedEngines = result.results.filter(r => !r.success || !r.validationPassed);
    
    if (slowEngines.length > 0) {
      console.log(`   ⚡ Optimize performance for: ${slowEngines.map(r => r.engineName).join(', ')}`);
    }
    
    if (failedEngines.length > 0) {
      console.log(`   🔧 Fix issues with: ${failedEngines.map(r => r.engineName).join(', ')}`);
    }
    
    if (result.passed === result.totalTests) {
      console.log('   🎉 All engines are working perfectly! Consciousness technology is ready.');
    }
    
    console.log('\n' + '═'.repeat(80));
  }
  
  /**
   * Get current test results
   */
  getResults(): EngineTestResult[] {
    return [...this.results];
  }
  
  /**
   * Clear test results
   */
  clearResults(): void {
    this.results = [];
  }
  
  /**
   * Check if tests are currently running
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const engineTestingFramework = new EngineTestingFramework();

// Convenience functions
export const testEngine = (engineName: EngineName) => engineTestingFramework.testEngine(engineName);
export const testAllEngines = () => engineTestingFramework.testAllEngines();
export const testEngines = (engineNames: EngineName[]) => engineTestingFramework.testEngines(engineNames);

// Export for CLI usage
export { PERFORMANCE_THRESHOLDS, ENGINE_VALIDATION_RULES };

// CLI Implementation
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];
  const engineName = args[1] as EngineName;

  async function runCLI() {
    try {
      switch (command) {
        case 'test':
          if (engineName) {
            console.log(`🧪 Testing ${engineName} engine...`);
            const result = await testEngine(engineName);
            console.log(`\n✅ Test completed: ${result.success ? 'PASSED' : 'FAILED'}`);
            console.log(`⏱️  Execution time: ${result.executionTime}ms`);
            console.log(`📊 Performance grade: ${result.performanceGrade}`);
            if (result.error) {
              console.error(`❌ Error: ${result.error}`);
            }
          } else {
            console.log('🧪 Testing all engines...');
            await testAllEngines();
          }
          break;
        
        case 'list':
          console.log('🔧 Available engines:');
          VALIDATION_METADATA.expectedEngines.forEach(engine => {
            console.log(`  - ${engine}`);
          });
          break;
        
        case 'validate':
          if (engineName) {
            console.log(`🔍 Validating ${engineName} engine configuration...`);
            const testInput = getEngineTestInput(engineName);
            console.log(`✅ Test input generated for ${engineName}:`, JSON.stringify(testInput, null, 2));
          } else {
            console.log('❌ Please specify an engine name for validation');
          }
          break;
        
        default:
          console.log('🚀 WitnessOS Engine Testing Framework');
          console.log('\nUsage:');
          console.log('  npx tsx engine-integration-test-framework.ts test [engine_name]');
          console.log('  npx tsx engine-integration-test-framework.ts list');
          console.log('  npx tsx engine-integration-test-framework.ts validate <engine_name>');
          console.log('\nExamples:');
          console.log('  npx tsx engine-integration-test-framework.ts test numerology');
          console.log('  npx tsx engine-integration-test-framework.ts test  # Test all engines');
          console.log('  npx tsx engine-integration-test-framework.ts list');
          break;
      }
    } catch (error) {
      console.error('❌ CLI Error:', error);
      process.exit(1);
    }
  }

  runCLI();
}