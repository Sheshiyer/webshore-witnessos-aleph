/**
 * Base Workflow Handler for WitnessOS API
 *
 * Provides common functionality for workflow handlers including
 * engine orchestration, AI synthesis, caching, and result persistence.
 * This serves as the foundation for natal, career, and spiritual workflow handlers.
 */

import { BaseHandler, HandlerEnvironment } from '../base/base-handler';
import { calculateEngine, isEngineAvailable } from '../../engines';
import type { EngineName } from '../../types/engines';
import { CloudflareKVDataAccess } from '../../lib/kv-data-access';

export interface WorkflowRequest {
  userProfile: {
    userId: string;
    fullName?: string;
    birthDate: string;
    birthTime: string;
    birthLocation: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    };
    email?: string;
  };
  options?: {
    depth?: 'basic' | 'detailed' | 'comprehensive';
    includeForecast?: boolean;
    includeGuidance?: boolean;
    saveResults?: boolean;
    useCache?: boolean;
  };
}

export interface WorkflowResult {
  workflowType: string;
  userProfile: any;
  coreEngines: Record<string, any>;
  synthesis: {
    aiAnalysis: string;
    keyInsights: string[];
    recommendations: string[];
    themes: string[];
  };
  forecast?: {
    daily?: any;
    weekly?: any;
  };
  metadata: {
    workflowId: string;
    startTime: string;
    completionTime: string;
    duration: number;
    enginesProcessed: string[];
    version: string;
  };
}

export interface EngineCalculationResult {
  engineName: string;
  data: any;
  error?: string;
  metadata?: any;
}

/**
 * Base class for workflow handlers
 * Provides common workflow execution logic and utilities
 */
export abstract class BaseWorkflowHandler extends BaseHandler {
  constructor(env: HandlerEnvironment) {
    super(env);
  }

  /**
   * Abstract method that each workflow handler must implement
   * Returns the workflow type (natal, career, spiritual)
   */
  abstract getWorkflowType(): string;

  /**
   * Abstract method that each workflow handler must implement
   * Returns the engines to use for this workflow type
   */
  abstract getWorkflowEngines(): EngineName[];

  /**
   * Execute a complete workflow
   */
  protected async executeWorkflow(
    request: WorkflowRequest,
    requestId: string
  ): Promise<WorkflowResult> {
    const startTime = new Date().toISOString();
    const workflowId = this.generateWorkflowId();
    const workflowType = this.getWorkflowType();

    console.log(`[${requestId}] Starting ${workflowType} workflow for user ${request.userProfile.userId}`);

    try {
      // Step 1: Calculate core engines
      const coreEngines = await this.calculateCoreEngines(
        request.userProfile,
        request.options || {},
        requestId
      );

      // Step 2: Generate AI synthesis
      const synthesis = await this.generateSynthesis(
        coreEngines,
        workflowType,
        request.userProfile,
        request.options || {},
        requestId
      );

      // Step 3: Generate forecast if requested
      let forecast: any = undefined;
      if (request.options?.includeForecast) {
        forecast = await this.generateForecast(request.userProfile, coreEngines, requestId);
      }

      // Step 4: Save results if requested
      if (request.options?.saveResults) {
        await this.saveWorkflowResults(
          workflowId,
          workflowType,
          request.userProfile,
          coreEngines,
          synthesis,
          forecast
        );
      }

      // Create timeline entry
      await this.createTimelineEntry(
        request.userProfile.userId,
        `${workflowType}_workflow`,
        request,
        { coreEngines, synthesis, forecast },
        { workflowId, workflowType }
      );

      const completionTime = new Date().toISOString();
      const duration = Date.now() - new Date(startTime).getTime();

      const result: WorkflowResult = {
        workflowType,
        userProfile: request.userProfile,
        coreEngines,
        synthesis,
        forecast,
        metadata: {
          workflowId,
          startTime,
          completionTime,
          duration,
          enginesProcessed: Object.keys(coreEngines),
          version: '2.0'
        }
      };

      console.log(`[${requestId}] Completed ${workflowType} workflow in ${duration}ms`);
      return result;

    } catch (error) {
      console.error(`[${requestId}] ${workflowType} workflow failed:`, error);
      throw error;
    }
  }

  /**
   * Calculate core consciousness engines for the workflow
   */
  private async calculateCoreEngines(
    userProfile: any,
    options: any,
    requestId: string
  ): Promise<Record<string, any>> {
    const engines: Record<string, any> = {};
    const requiredEngines = this.getWorkflowEngines();

    console.log(`[${requestId}] Calculating ${requiredEngines.length} engines: ${requiredEngines.join(', ')}`);

    // Calculate engines in parallel for better performance
    const enginePromises = requiredEngines.map(async (engineName) => {
      return await this.calculateSingleEngine(engineName, userProfile, options, requestId);
    });

    const engineResults = await Promise.all(enginePromises);

    // Organize results by engine name
    for (const result of engineResults) {
      if (result.data) {
        engines[result.engineName] = result.data;
      } else {
        console.warn(`[${requestId}] Engine ${result.engineName} failed:`, result.error);
        engines[result.engineName] = null;
      }
    }

    return engines;
  }

  /**
   * Calculate a single engine
   */
  private async calculateSingleEngine(
    engineName: string,
    userProfile: any,
    options: any,
    requestId: string
  ): Promise<EngineCalculationResult> {
    try {
      if (!isEngineAvailable(engineName as EngineName)) {
        throw new Error(`Engine ${engineName} is not available`);
      }

      // Check cache first if enabled
      let cachedResult = null;
      if (options.useCache !== false) {
        const input = this.prepareEngineInput(engineName, userProfile);
        const inputHash = CloudflareKVDataAccess.createInputHash(input);
        cachedResult = await this.kvData.getCached(engineName, inputHash);

        if (cachedResult) {
          console.log(`[${requestId}] Cache hit for ${engineName}`);
          return {
            engineName,
            data: cachedResult.data,
            metadata: { cached: true, cachedAt: cachedResult.cachedAt }
          };
        }
      }

      // Calculate using engine
      const input = this.prepareEngineInput(engineName, userProfile);
      const result = await calculateEngine(engineName as EngineName, input, {
        requestId,
        verboseLogging: false,
        debugMode: false
      });

      if (result.success && result.data) {
        // Cache result if enabled
        if (options.useCache !== false) {
          const inputHash = CloudflareKVDataAccess.createInputHash(input);
          await this.kvData.setCached(engineName, inputHash, result);
        }

        return {
          engineName,
          data: result.data,
          metadata: { calculationTime: Date.now() }
        };
      } else {
        return {
          engineName,
          data: null,
          error: typeof result.error === 'string' ? result.error : 'Engine calculation failed'
        };
      }

    } catch (error) {
      console.error(`[${requestId}] Engine ${engineName} calculation error:`, error);
      return {
        engineName,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate AI synthesis of engine results
   */
  private async generateSynthesis(
    coreEngines: Record<string, any>,
    workflowType: string,
    userProfile: any,
    options: any,
    requestId: string
  ): Promise<any> {
    try {
      // Prepare engine results for AI synthesis
      const validEngines = Object.entries(coreEngines)
        .filter(([_, data]) => data !== null)
        .map(([engineName, data]) => ({ engineName, data }));

      if (validEngines.length === 0) {
        throw new Error('No successful engine calculations to synthesize');
      }

      // Use AI interpreter if available
      if (this.aiInterpreter) {
        try {
          // Use AI interpreter for synthesis
          const prompt = this.buildSynthesisPrompt(validEngines, workflowType, userProfile);
          const mockEngineOutput = {
            engineName: 'numerology',
            calculationTime: Date.now(),
            confidenceScore: 0.8,
            formattedOutput: 'Mock output for synthesis',
            recommendations: [],
            realityPatches: [],
            archetypalThemes: [],
            timestamp: new Date().toISOString()
          };
          const aiResult = await this.aiInterpreter.enhanceReading('numerology', mockEngineOutput, {
            userContext: userProfile
          });

          // Extract the synthesis text from AI result
          const synthesisText = typeof aiResult === 'string' ? aiResult :
            (aiResult as any).interpretation || (aiResult as any).analysis || JSON.stringify(aiResult);

          return {
            aiAnalysis: synthesisText,
            keyInsights: this.extractKeyInsights(synthesisText),
            recommendations: this.extractRecommendations(synthesisText),
            themes: this.extractThemes(synthesisText),
            metadata: { aiGenerated: true }
          };
        } catch (aiError) {
          console.warn(`[${requestId}] AI synthesis failed, using fallback:`, aiError);
        }
      }

      // Fallback synthesis if AI is not available
      return this.generateFallbackSynthesis(coreEngines, workflowType, userProfile);

    } catch (error) {
      console.error(`[${requestId}] Synthesis generation error:`, error);
      return this.generateFallbackSynthesis(coreEngines, workflowType, userProfile);
    }
  }

  /**
   * Generate forecast for the user
   */
  private async generateForecast(
    userProfile: any,
    coreEngines: any,
    requestId: string
  ): Promise<any> {
    try {
      // This would integrate with the forecast service
      // For now, return a placeholder
      console.log(`[${requestId}] Forecast generation not yet implemented`);
      return {
        note: 'Forecast generation will be implemented in future update',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[${requestId}] Forecast generation error:`, error);
      return {
        error: error instanceof Error ? error.message : 'Forecast generation failed'
      };
    }
  }

  /**
   * Save workflow results to database
   */
  private async saveWorkflowResults(
    workflowId: string,
    workflowType: string,
    userProfile: any,
    coreEngines: any,
    synthesis: any,
    forecast: any,
    requestId?: string
  ): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO workflow_results (
          workflow_id, user_id, workflow_type, core_engines,
          synthesis, forecast, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        workflowId,
        userProfile.userId,
        workflowType,
        JSON.stringify(coreEngines),
        JSON.stringify(synthesis),
        JSON.stringify(forecast),
        new Date().toISOString()
      ).run();

      if (requestId) {
        console.log(`[${requestId}] Saved workflow results for ${workflowId}`);
      } else {
        console.log(`Saved workflow results for ${workflowId}`);
      }
    } catch (error) {
      if (requestId) {
        console.error(`[${requestId}] Failed to save workflow results:`, error);
      } else {
        console.error(`Failed to save workflow results:`, error);
      }
      // Don't throw - saving is not critical for workflow completion
    }
  }

  /**
   * Prepare input for a specific engine
   */
  private prepareEngineInput(engineName: string, userProfile: any): any {
    const baseInput = {
      birth_date: userProfile.birthDate,
      birth_time: userProfile.birthTime,
      birth_location: userProfile.birthLocation,
      full_name: userProfile.fullName
    };

    // Engine-specific input preparation
    switch (engineName) {
      case 'numerology':
        return {
          full_name: userProfile.fullName || 'Unknown',
          birth_date: userProfile.birthDate
        };

      case 'human_design':
        return {
          birth_date: userProfile.birthDate,
          birth_time: userProfile.birthTime,
          birth_location: userProfile.birthLocation
        };

      case 'vimshottari':
        return {
          birth_date: userProfile.birthDate,
          birth_time: userProfile.birthTime,
          birth_location: userProfile.birthLocation
        };

      case 'astrology':
        return {
          birth_date: userProfile.birthDate,
          birth_time: userProfile.birthTime,
          birth_location: userProfile.birthLocation
        };

      case 'gene_keys':
        return {
          birth_date: userProfile.birthDate,
          birth_time: userProfile.birthTime,
          birth_location: userProfile.birthLocation
        };

      case 'iching':
        return {
          question: `Guidance for ${userProfile.fullName || 'this person'}`,
          method: 'random'
        };

      default:
        return baseInput;
    }
  }

  /**
   * Extract key insights from synthesis text
   */
  private extractKeyInsights(synthesis: string): string[] {
    const insights: string[] = [];
    const lines = synthesis.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes('key insight') ||
          line.toLowerCase().includes('important') ||
          line.toLowerCase().includes('significant')) {
        insights.push(line.trim());
      }
    }

    return insights.slice(0, 5);
  }

  /**
   * Extract recommendations from synthesis text
   */
  private extractRecommendations(synthesis: string): string[] {
    const recommendations: string[] = [];
    const lines = synthesis.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') ||
          line.toLowerCase().includes('suggest') ||
          line.toLowerCase().includes('consider')) {
        recommendations.push(line.trim());
      }
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Extract themes from synthesis text
   */
  private extractThemes(synthesis: string): string[] {
    const themes: string[] = [];
    const commonThemes = [
      'transformation', 'growth', 'balance', 'purpose', 'creativity',
      'relationships', 'career', 'spirituality', 'healing', 'manifestation'
    ];

    const lowerSynthesis = synthesis.toLowerCase();

    for (const theme of commonThemes) {
      if (lowerSynthesis.includes(theme)) {
        themes.push(theme.charAt(0).toUpperCase() + theme.slice(1));
      }
    }

    return themes.slice(0, 3);
  }

  /**
   * Generate fallback synthesis when AI is not available
   */
  private generateFallbackSynthesis(
    coreEngines: Record<string, any>,
    workflowType: string,
    userProfile: any
  ): any {
    const engineNames = Object.keys(coreEngines).filter(name => coreEngines[name] !== null);

    return {
      aiAnalysis: `${workflowType.charAt(0).toUpperCase() + workflowType.slice(1)} analysis for ${userProfile.fullName || 'this person'} based on ${engineNames.join(', ')}. This analysis combines insights from multiple consciousness systems to provide guidance and understanding.`,
      keyInsights: ['Analysis based on traditional interpretations'],
      recommendations: ['Consult with a qualified practitioner for detailed guidance'],
      themes: [workflowType.charAt(0).toUpperCase() + workflowType.slice(1) + ' exploration'],
      metadata: { fallback: true }
    };
  }

  /**
   * Build synthesis prompt for AI
   */
  private buildSynthesisPrompt(
    validEngines: Array<{ engineName: string; data: any }>,
    workflowType: string,
    userProfile: any
  ): string {
    const engineSummaries = validEngines.map(engine =>
      `${engine.engineName}: ${JSON.stringify(engine.data).substring(0, 200)}...`
    ).join('\n');

    return `Please provide a comprehensive ${workflowType} analysis for ${userProfile.fullName || 'this person'} based on the following consciousness engine results:

${engineSummaries}

Please structure your response to include:
1. Key insights from the combination of these systems
2. Main themes and patterns that emerge
3. Practical recommendations for ${userProfile.fullName || 'this person'}
4. Any important considerations or warnings

Focus on synthesizing the information from multiple perspectives to provide holistic guidance.`;
  }

  /**
   * Generate unique workflow ID
   */
  private generateWorkflowId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
