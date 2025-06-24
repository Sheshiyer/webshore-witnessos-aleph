/**
 * Base Engine Class for WitnessOS
 * 
 * Abstract base class that all consciousness engines extend
 * Provides common functionality and interface consistency
 */

import type { 
  BaseEngineInput, 
  BaseEngineOutput, 
  EngineConfig, 
  EngineError, 
  CalculationResult 
} from './types';

export abstract class BaseEngine<TInput extends BaseEngineInput = BaseEngineInput, TOutput extends BaseEngineOutput = BaseEngineOutput> {
  protected config: EngineConfig;
  protected engineName: string;
  protected description: string;

  constructor(engineName: string, description: string, config: EngineConfig = {}) {
    this.engineName = engineName;
    this.description = description;
    this.config = {
      enableCaching: true,
      cacheTTL: 3600, // 1 hour
      enableLogging: true,
      ...config
    };
  }

  /**
   * Main calculation method that all engines must implement
   */
  abstract calculate(input: TInput): Promise<CalculationResult<TOutput>>;

  /**
   * Validate input data
   */
  protected abstract validateInput(input: TInput): boolean;

  /**
   * Perform the core calculation logic
   */
  protected abstract performCalculation(input: TInput): Promise<Record<string, unknown>>;

  /**
   * Generate mystical interpretation
   */
  protected abstract generateInterpretation(results: Record<string, unknown>, input: TInput): string;

  /**
   * Generate recommendations
   */
  protected abstract generateRecommendations(results: Record<string, unknown>, input: TInput): string[];

  /**
   * Generate reality patches
   */
  protected abstract generateRealityPatches(results: Record<string, unknown>, input: TInput): string[];

  /**
   * Identify archetypal themes
   */
  protected abstract identifyArchetypalThemes(results: Record<string, unknown>, input: TInput): string[];

  /**
   * Calculate confidence score
   */
  protected abstract calculateConfidence(results: Record<string, unknown>, input: TInput): number;

  /**
   * Create engine error
   */
  protected createError(code: string, message: string, context?: Record<string, unknown>): EngineError {
    return {
      code,
      message,
      context: context || {},
      suggestions: [
        'Check your input data',
        'Ensure all required fields are provided',
        'Try again in a moment'
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Log engine activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    if (!this.config.enableLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      engine: this.engineName,
      level,
      message,
      data
    };

    if (level === 'error') {
      console.error('WitnessOS Engine Error:', logEntry);
    } else if (level === 'warn') {
      console.warn('WitnessOS Engine Warning:', logEntry);
    } else {
      console.log('WitnessOS Engine Info:', logEntry);
    }
  }

  /**
   * Get engine metadata
   */
  getMetadata() {
    return {
      name: this.engineName,
      description: this.description,
      version: '1.0.0',
      supportedSystems: this.getSupportedSystems(),
      inputSchema: this.getInputSchema(),
      outputSchema: this.getOutputSchema()
    };
  }

  /**
   * Get supported systems (to be overridden by engines)
   */
  protected getSupportedSystems(): string[] {
    return ['default'];
  }

  /**
   * Get input schema (to be overridden by engines)
   */
  protected getInputSchema(): Record<string, unknown> {
    return {};
  }

  /**
   * Get output schema (to be overridden by engines)
   */
  protected getOutputSchema(): Record<string, unknown> {
    return {};
  }
} 