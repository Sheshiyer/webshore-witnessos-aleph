/**
 * WitnessOS API Client for TypeScript Engine Integration
 *
 * Connects React Three Fiber frontend to TypeScript consciousness engines
 * Replaces Python FastAPI backend with pure TypeScript implementation
 */

import type {
  EngineAPIResponse,
  EngineInput,
  EngineName,
  EngineOutput,
  NumerologyInput,
  NumerologyOutput,
} from '@/types';

// Import the new TypeScript engine system
import { calculateEngine, healthCheck as engineHealthCheck, listEngines } from '@/engines';

// Import mock server for fallback
const { MockAPIServer } = require('./mock-api-server');

// API Configuration
const API_CONFIG = {
  USE_TYPESCRIPT_ENGINES: true, // Use new TypeScript engines instead of FastAPI
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  USE_MOCK_FALLBACK: process.env.NODE_ENV === 'development', // Use mock in development
} as const;

/**
 * Custom error class for API operations
 */
export class WitnessOSAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public engine?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'WitnessOSAPIError';
  }
}

/**
 * Main API client class
 */
export class WitnessOSAPIClient {
  /**
   * Generic engine calculation method
   */
  static async calculateEngine<TInput extends EngineInput, TOutput extends EngineOutput>(
    engineName: EngineName,
    input: TInput
  ): Promise<EngineAPIResponse<TOutput>> {
    const startTime = Date.now();

    try {
      if (API_CONFIG.USE_TYPESCRIPT_ENGINES) {
        // Use new TypeScript engines
        const result = await calculateEngine(engineName, input);
        
        if (result.success && result.data) {
          return {
            success: true,
            data: result.data as TOutput,
            timestamp: result.timestamp,
            processingTime: result.processingTime,
          };
        } else {
          throw new WitnessOSAPIError(
            result.error?.message || 'Calculation failed',
            undefined,
            engineName,
            result.error
          );
        }
      } else {
        // Fallback to mock server
        console.warn(`Using mock server for ${engineName} - TypeScript engines disabled`);
        return MockAPIServer.calculateEngine<TOutput>(engineName, input);
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Fallback to mock server if TypeScript engines fail and mock is enabled
      if (API_CONFIG.USE_TYPESCRIPT_ENGINES && API_CONFIG.USE_MOCK_FALLBACK) {
        console.warn(`TypeScript engine failed for ${engineName}, using mock server:`, error);
        return MockAPIServer.calculateEngine<TOutput>(engineName, input);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        processingTime,
      };
    }
  }

  /**
   * Numerology calculation
   */
  static async calculateNumerology(
    input: NumerologyInput
  ): Promise<EngineAPIResponse<NumerologyOutput>> {
    return this.calculateEngine<NumerologyInput, NumerologyOutput>('numerology', input);
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<EngineAPIResponse<{ status: string; engines: string[] }>> {
    const startTime = Date.now();

    try {
      if (API_CONFIG.USE_TYPESCRIPT_ENGINES) {
        const result = await engineHealthCheck();
        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
        };
      } else {
        return MockAPIServer.healthCheck();
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get available engines
   */
  static async getAvailableEngines(): Promise<EngineAPIResponse<{ engines: EngineName[] }>> {
    const startTime = Date.now();

    try {
      if (API_CONFIG.USE_TYPESCRIPT_ENGINES) {
        const engines = listEngines();
        return {
          success: true,
          data: { engines },
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
        };
      } else {
        return MockAPIServer.getAvailableEngines();
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get engines',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      };
    }
  }
}

/**
 * Data transformation utilities
 */
export class DataTransformer {
  /**
   * Convert Python-style data to TypeScript
   */
  static pythonToTypeScript<T>(data: Record<string, unknown>): T {
    // For now, just return as-is since we're using TypeScript engines
    return data as T;
  }

  /**
   * Convert TypeScript data to Python-style
   */
  static typeScriptToPython<T>(data: Record<string, unknown>): T {
    // For now, just return as-is since we're using TypeScript engines
    return data as T;
  }

  /**
   * Validate engine input
   */
  static validateEngineInput(engineName: EngineName, input: EngineInput): boolean {
    // Basic validation - engines will do their own validation
    return !!input && typeof input === 'object';
  }
}

// Export the main API client instance
export const witnessOSAPI = WitnessOSAPIClient;
