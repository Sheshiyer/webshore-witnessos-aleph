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
   * Log engine activity with verbose debugging support
   */
  protected log(level: 'info' | 'warn' | 'error' | 'debug' | 'verbose', message: string, data?: unknown): void {
    if (!this.config.enableLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      engine: this.engineName,
      level,
      message,
      data,
      requestId: this.config.requestId || 'unknown'
    };

    // Always log errors and warnings
    if (level === 'error') {
      console.error(`🔴 [${this.engineName.toUpperCase()}] ERROR:`, logEntry);
    } else if (level === 'warn') {
      console.warn(`🟡 [${this.engineName.toUpperCase()}] WARNING:`, logEntry);
    } else if (level === 'debug' || level === 'verbose') {
      // Only log debug/verbose in development or when explicitly enabled
      if (this.config.verboseLogging || process.env.NODE_ENV === 'development') {
        console.log(`🔍 [${this.engineName.toUpperCase()}] ${level.toUpperCase()}:`, logEntry);
      }
    } else {
      console.log(`ℹ️ [${this.engineName.toUpperCase()}] INFO:`, logEntry);
    }
  }

  /**
   * Log calculation step with timing
   */
  protected logStep(stepName: string, startTime: number, data?: unknown): void {
    const duration = Date.now() - startTime;
    this.log('verbose', `Step completed: ${stepName}`, {
      duration: `${duration}ms`,
      stepData: data
    });
  }

  /**
   * Log input validation details
   */
  protected logInputValidation(input: TInput, isValid: boolean, errors?: string[]): void {
    this.log('debug', 'Input validation', {
      inputKeys: Object.keys(input),
      isValid,
      errors: errors || [],
      inputSize: JSON.stringify(input).length
    });
  }

  /**
   * Log calculation results summary
   */
  protected logCalculationResults(results: Record<string, unknown>, processingTime: number): void {
    this.log('verbose', 'Calculation completed', {
      resultKeys: Object.keys(results),
      processingTime: `${processingTime}ms`,
      resultSize: JSON.stringify(results).length
    });
  }

  /**
   * Log calculation result summary (alias for compatibility)
   */
  protected logCalculationResult(results: Record<string, unknown>, processingTime: number): void {
    this.logCalculationResults(results, processingTime);
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