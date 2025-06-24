/**
 * Engine Orchestrator - Multi-Engine Workflow System
 * 
 * Coordinates multiple divination engines to create comprehensive readings
 * and consciousness field analysis.
 */

import { BaseEngineInput, BaseEngineOutput, CalculationResult } from '../engines/core/types';
import { getEngine, listEngines } from '../engines/index';
import type { EngineName } from '../types/engines';

export interface EngineConfig {
  name: EngineName;
  input: BaseEngineInput;
  config?: Record<string, any>;
}

export interface ComprehensiveReading {
  timestamp: string;
  birthData?: Record<string, any>;
  enginesUsed: EngineName[];
  results: Record<string, CalculationResult<BaseEngineOutput>>;
  synthesis?: any; // Will be filled by ResultSynthesizer
  processingTime: number;
}

export interface WorkflowResult {
  workflowName: string;
  timestamp: string;
  results: Record<string, CalculationResult<BaseEngineOutput>>;
  synthesis: any;
  recommendations: string[];
  processingTime: number;
}

export class EngineOrchestrator {
  private maxWorkers: number;
  private activeEngines: Map<EngineName, any> = new Map();
  private workflowCache: Map<string, WorkflowResult> = new Map();

  constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * Load and cache an engine instance
   */
  private loadEngine(engineName: EngineName): any {
    if (!this.activeEngines.has(engineName)) {
      try {
        const engine = getEngine(engineName);
        this.activeEngines.set(engineName, engine);
        console.log(`Loaded engine: ${engineName}`);
      } catch (error) {
        throw new Error(`Failed to load engine ${engineName}: ${error}`);
      }
    }
    return this.activeEngines.get(engineName);
  }

  /**
   * Run a single engine with input data
   */
  async runSingleEngine(
    engineName: EngineName, 
    inputData: BaseEngineInput, 
    config?: Record<string, any>
  ): Promise<CalculationResult<BaseEngineOutput>> {
    const engine = this.loadEngine(engineName);
    return engine.calculate(inputData);
  }

  /**
   * Run multiple engines in parallel
   */
  async runParallelEngines(engineConfigs: EngineConfig[]): Promise<Record<string, CalculationResult<BaseEngineOutput>>> {
    const results: Record<string, CalculationResult<BaseEngineOutput>> = {};
    
    // Create promises for all engine calculations
    const enginePromises = engineConfigs.map(async (config) => {
      try {
        const result = await this.runSingleEngine(config.name, config.input, config.config);
        return { name: config.name, result };
      } catch (error) {
        console.error(`Engine ${config.name} failed:`, error);
        return { 
          name: config.name, 
          result: {
            success: false,
            error: {
              code: 'ENGINE_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
              context: { input: config.input },
              suggestions: ['Check input parameters'],
              timestamp: new Date().toISOString()
            },
            processingTime: 0,
            timestamp: new Date().toISOString()
          } as CalculationResult<BaseEngineOutput>
        };
      }
    });

    // Wait for all engines to complete
    const engineResults = await Promise.all(enginePromises);
    
    // Organize results by engine name
    engineResults.forEach(({ name, result }) => {
      results[name] = result;
    });

    return results;
  }

  /**
   * Run engines sequentially, allowing later engines to use earlier results
   */
  async runSequentialEngines(engineConfigs: EngineConfig[]): Promise<Record<string, CalculationResult<BaseEngineOutput>>> {
    const results: Record<string, CalculationResult<BaseEngineOutput>> = {};
    
    for (const config of engineConfigs) {
      try {
        // Allow input to reference previous results
        const enhancedInput = {
          ...config.input,
          previousResults: results
        };
        
        const result = await this.runSingleEngine(config.name, enhancedInput, config.config);
        results[config.name] = result;
        console.log(`Completed sequential engine: ${config.name}`);
      } catch (error) {
        console.error(`Sequential engine ${config.name} failed:`, error);
        results[config.name] = {
          success: false,
          error: {
            code: 'ENGINE_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            context: { input: config.input },
            suggestions: ['Check input parameters'],
            timestamp: new Date().toISOString()
          },
          processingTime: 0,
          timestamp: new Date().toISOString()
        };
        // Continue with other engines even if one fails
      }
    }
    
    return results;
  }

  /**
   * Create a comprehensive reading using multiple engines
   */
  async createComprehensiveReading(
    birthData: Record<string, any>, 
    engines?: EngineName[]
  ): Promise<ComprehensiveReading> {
    const startTime = Date.now();
    
    if (!engines) {
      engines = ['numerology', 'biorhythm', 'human_design', 'vimshottari', 
                 'gene_keys', 'tarot', 'iching', 'enneagram', 'sacred_geometry'];
    }

    // Prepare engine configurations
    const engineConfigs: EngineConfig[] = [];
    
    for (const engineName of engines) {
      let inputData: BaseEngineInput;
      
      if (['numerology', 'biorhythm'].includes(engineName)) {
        // Basic birth data engines
        inputData = this.prepareBasicInput(birthData, engineName);
      } else if (['human_design', 'vimshottari'].includes(engineName)) {
        // Astronomical calculation engines
        inputData = this.prepareAstroInput(birthData, engineName);
      } else if (['gene_keys'].includes(engineName)) {
        // Gene Keys uses Human Design foundation
        inputData = this.prepareGeneKeysInput(birthData);
      } else if (['tarot', 'iching'].includes(engineName)) {
        // Divination engines
        inputData = this.prepareDivinationInput(birthData, engineName);
      } else if (['enneagram'].includes(engineName)) {
        // Personality assessment engines
        inputData = this.preparePersonalityInput(birthData, engineName);
      } else if (['sacred_geometry', 'sigil_forge'].includes(engineName)) {
        // Symbolic/geometric engines
        inputData = this.prepareSymbolicInput(birthData, engineName);
      } else {
        continue;
      }
      
      engineConfigs.push({
        name: engineName as EngineName,
        input: inputData
      });
    }

    // Run engines in parallel for independent calculations
    const results = await this.runParallelEngines(engineConfigs);
    
    const reading: ComprehensiveReading = {
      timestamp: new Date().toISOString(),
      birthData,
      enginesUsed: engines as EngineName[],
      results,
      synthesis: null, // Will be filled by ResultSynthesizer
      processingTime: Date.now() - startTime
    };
    
    return reading;
  }

  /**
   * Prepare input for basic engines (numerology, biorhythm)
   */
  private prepareBasicInput(birthData: Record<string, any>, engineName: string): BaseEngineInput {
    return {
      birthDate: birthData.birthDate || birthData.date,
      fullName: birthData.fullName || birthData.name,
      birthTime: birthData.birthTime || birthData.time,
      birthLocation: birthData.birthLocation || birthData.location
    };
  }

  /**
   * Prepare input for astronomical engines
   */
  private prepareAstroInput(birthData: Record<string, any>, engineName: string): BaseEngineInput {
    return {
      birthDate: birthData.birthDate || birthData.date,
      birthTime: birthData.birthTime || birthData.time || '12:00',
      birthLocation: birthData.birthLocation || birthData.location || 'New York, NY',
      fullName: birthData.fullName || birthData.name
    };
  }

  /**
   * Prepare input for Gene Keys engine
   */
  private prepareGeneKeysInput(birthData: Record<string, any>): BaseEngineInput {
    return {
      birthDate: birthData.birthDate || birthData.date,
      birthTime: birthData.birthTime || birthData.time || '12:00',
      birthLocation: birthData.birthLocation || birthData.location || 'New York, NY',
      focusSequence: 'activation'
    };
  }

  /**
   * Prepare input for divination engines
   */
  private prepareDivinationInput(birthData: Record<string, any>, engineName: string): BaseEngineInput {
    const question = `Life guidance for ${birthData.fullName || birthData.name || 'this person'}`;
    
    if (engineName === 'tarot') {
      return {
        question,
        spreadType: 'three_card',
        includeReversed: true
      };
    } else if (engineName === 'iching') {
      return {
        question,
        method: 'coins'
      };
    }
    
    return { question };
  }

  /**
   * Prepare input for personality engines
   */
  private preparePersonalityInput(birthData: Record<string, any>, engineName: string): BaseEngineInput {
    if (engineName === 'enneagram') {
      return {
        identificationMethod: 'intuitive',
        behavioralDescription: `Person seeking comprehensive personality analysis`,
        includeWings: true,
        includeArrows: true,
        includeInstincts: true
      };
    }
    
    return {};
  }

  /**
   * Prepare input for symbolic engines
   */
  private prepareSymbolicInput(birthData: Record<string, any>, engineName: string): BaseEngineInput {
    if (engineName === 'sacred_geometry') {
      return {
        birthDate: birthData.birthDate || birthData.date,
        patternType: 'auto',
        includePersonalization: true
      };
    } else if (engineName === 'sigil_forge') {
      return {
        intention: `Manifestation support for ${birthData.fullName || birthData.name}`,
        generationMethod: 'personal',
        includePersonalization: true
      };
    }
    
    return {};
  }

  /**
   * Get list of available engines
   */
  getAvailableEngines(): EngineName[] {
    return listEngines();
  }

  /**
   * Clear engine cache
   */
  clearCache(): void {
    this.activeEngines.clear();
    this.workflowCache.clear();
  }
}

export const orchestrator = new EngineOrchestrator();
export default orchestrator;
