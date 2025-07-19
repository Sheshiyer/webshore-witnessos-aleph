/**
 * Consciousness Workflow for WitnessOS
 * 
 * Cloudflare Workflow that orchestrates complex consciousness analysis
 * processes with durable execution, automatic retry logic, and state
 * persistence. Handles natal, career, and spiritual workflows.
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

// Environment interface for the workflow
interface WorkflowEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  ENGINE_SERVICE: any; // RPC binding to engine service
  AI_SERVICE: any; // RPC binding to AI service
  FORECAST_SERVICE: any; // RPC binding to forecast service
}

// Workflow parameters
interface WorkflowParams {
  workflowType: 'natal' | 'career' | 'spiritual';
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
  };
}

// Workflow result types
interface WorkflowResult {
  workflowType: string;
  userProfile: any;
  coreEngines: {
    numerology?: any;
    human_design?: any;
    vimshottari?: any;
    astrology?: any;
    gene_keys?: any;
  };
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

/**
 * Consciousness Workflow Entrypoint
 * 
 * Orchestrates complex consciousness analysis processes using
 * Cloudflare's durable execution engine with automatic retry
 * logic and state persistence.
 */
export class ConsciousnessWorkflow extends WorkflowEntrypoint<WorkflowEnv, WorkflowParams> {
  /**
   * Main workflow execution method
   */
  async run(
    event: WorkflowEvent<WorkflowParams>, 
    step: WorkflowStep
  ): Promise<WorkflowResult> {
    const { workflowType, userProfile, options = {} } = event.payload;
    const startTime = new Date().toISOString();
    
    console.log(`Starting ${workflowType} workflow for user ${userProfile.userId}`);

    // Step 1: Calculate core consciousness engines
    const coreEngines = await step.do('calculate-core-engines', {
      retries: { 
        limit: 3, 
        delay: '5 seconds', 
        backoff: 'exponential' 
      },
      timeout: '3 minutes'
    }, async () => {
      return await this.calculateCoreEngines(workflowType, userProfile, options);
    });

    // Step 2: Generate AI synthesis with state persistence
    const synthesis = await step.do('generate-synthesis', {
      retries: { 
        limit: 2, 
        delay: '10 seconds', 
        backoff: 'linear' 
      },
      timeout: '2 minutes'
    }, async () => {
      return await this.generateSynthesis(coreEngines, workflowType, userProfile, options);
    });

    // Step 3: Generate forecast if requested (can hibernate during processing)
    let forecast: any = undefined;
    if (options.includeForecast) {
      // Add a small delay to allow for processing
      await step.sleep('forecast-preparation', '10 seconds');
      
      forecast = await step.do('generate-forecast', {
        retries: { 
          limit: 2, 
          delay: '15 seconds', 
          backoff: 'exponential' 
        },
        timeout: '4 minutes'
      }, async () => {
        return await this.generateForecast(userProfile, coreEngines);
      });
    }

    // Step 4: Save results if requested
    if (options.saveResults) {
      await step.do('save-results', {
        retries: { 
          limit: 2, 
          delay: '5 seconds', 
          backoff: 'linear' 
        },
        timeout: '1 minute'
      }, async () => {
        return await this.saveWorkflowResults(
          event.id,
          workflowType,
          userProfile,
          coreEngines,
          synthesis,
          forecast
        );
      });
    }

    // Construct final result
    const completionTime = new Date().toISOString();
    const duration = Date.now() - new Date(startTime).getTime();

    const result: WorkflowResult = {
      workflowType,
      userProfile,
      coreEngines,
      synthesis,
      forecast,
      metadata: {
        workflowId: event.id,
        startTime,
        completionTime,
        duration,
        enginesProcessed: Object.keys(coreEngines),
        version: '2.0'
      }
    };

    console.log(`Completed ${workflowType} workflow for user ${userProfile.userId} in ${duration}ms`);
    
    return result;
  }

  /**
   * Calculate core consciousness engines based on workflow type
   */
  private async calculateCoreEngines(
    workflowType: string,
    userProfile: any,
    options: any
  ): Promise<any> {
    const engines: Record<string, any> = {};
    
    // Define engine sets for different workflow types
    const engineSets = {
      natal: ['numerology', 'human_design', 'vimshottari', 'astrology'],
      career: ['numerology', 'human_design', 'gene_keys'],
      spiritual: ['numerology', 'vimshottari', 'iching', 'gene_keys']
    };

    const requiredEngines = engineSets[workflowType as keyof typeof engineSets] || ['numerology'];

    // Calculate engines in parallel for better performance
    const enginePromises = requiredEngines.map(async (engineName) => {
      try {
        const input = this.prepareEngineInput(engineName, userProfile);
        
        const result = await this.env.ENGINE_SERVICE.calculateEngine({
          engineName,
          input,
          options: {
            useCache: true,
            userId: userProfile.userId,
            saveProfile: options.saveResults
          }
        });

        if (result.success) {
          return { engineName, data: result.data, metadata: result.metadata };
        } else {
          console.warn(`Engine ${engineName} calculation failed:`, result.error);
          return { engineName, data: null, error: result.error };
        }
      } catch (error) {
        console.error(`Engine ${engineName} calculation error:`, error);
        return { 
          engineName, 
          data: null, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    // Wait for all engine calculations
    const engineResults = await Promise.all(enginePromises);

    // Organize results by engine name
    for (const result of engineResults) {
      engines[result.engineName] = result.data;
    }

    return engines;
  }

  /**
   * Generate AI synthesis of engine results
   */
  private async generateSynthesis(
    coreEngines: any,
    workflowType: string,
    userProfile: any,
    options: any
  ): Promise<any> {
    try {
      // Prepare engine results for AI synthesis
      const engineResults = Object.entries(coreEngines)
        .filter(([_, data]) => data !== null)
        .map(([engineName, data]) => ({ engineName, data }));

      if (engineResults.length === 0) {
        throw new Error('No successful engine calculations to synthesize');
      }

      // Generate AI synthesis
      const synthesisResult = await this.env.AI_SERVICE.synthesizeWorkflow({
        coreEngines: engineResults.map(r => r.data),
        workflowType,
        userProfile,
        options: {
          useCache: true,
          depth: options.depth || 'detailed'
        }
      });

      if (!synthesisResult.success) {
        throw new Error(synthesisResult.error || 'AI synthesis failed');
      }

      // Extract key insights and themes from the synthesis
      const keyInsights = this.extractKeyInsights(synthesisResult.synthesis);
      const recommendations = this.extractRecommendations(synthesisResult.synthesis);
      const themes = this.extractThemes(synthesisResult.synthesis);

      return {
        aiAnalysis: synthesisResult.synthesis,
        keyInsights,
        recommendations,
        themes,
        metadata: synthesisResult.metadata
      };

    } catch (error) {
      console.error('Synthesis generation error:', error);
      
      // Fallback synthesis if AI fails
      return {
        aiAnalysis: this.generateFallbackSynthesis(coreEngines, workflowType, userProfile),
        keyInsights: ['Analysis based on traditional interpretations'],
        recommendations: ['Consult with a qualified practitioner for detailed guidance'],
        themes: [workflowType.charAt(0).toUpperCase() + workflowType.slice(1) + ' exploration'],
        metadata: { fallback: true, error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Generate forecast if requested
   */
  private async generateForecast(userProfile: any, coreEngines: any): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = this.getWeekStartDate();

      // Generate both daily and weekly forecasts
      const [dailyResult, weeklyResult] = await Promise.allSettled([
        this.env.FORECAST_SERVICE.generateDailyForecast({
          userProfile,
          date: today,
          options: { useCache: true, includePredictive: true }
        }),
        this.env.FORECAST_SERVICE.generateWeeklyForecast({
          userProfile,
          startDate: weekStart,
          options: { useCache: true, includePredictive: true }
        })
      ]);

      const forecast: any = {};

      if (dailyResult.status === 'fulfilled' && dailyResult.value.success) {
        forecast.daily = dailyResult.value.data;
      }

      if (weeklyResult.status === 'fulfilled' && weeklyResult.value.success) {
        forecast.weekly = weeklyResult.value.data;
      }

      return forecast;

    } catch (error) {
      console.error('Forecast generation error:', error);
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
    forecast: any
  ): Promise<void> {
    try {
      // Save to database
      await this.env.DB.prepare(`
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

      console.log(`Saved workflow results for ${workflowId}`);

    } catch (error) {
      console.error('Failed to save workflow results:', error);
      // Don't throw - saving is not critical for workflow completion
    }
  }

  /**
   * Helper methods
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
          question: `Spiritual guidance for ${userProfile.fullName || 'this person'}`,
          method: 'random'
        };
      
      default:
        return baseInput;
    }
  }

  private extractKeyInsights(synthesis: string): string[] {
    // Simple extraction - in production, you might use more sophisticated NLP
    const insights: string[] = [];
    const lines = synthesis.split('\n');
    
    for (const line of lines) {
      if (line.includes('key insight') || line.includes('important') || line.includes('significant')) {
        insights.push(line.trim());
      }
    }
    
    return insights.slice(0, 5); // Limit to top 5 insights
  }

  private extractRecommendations(synthesis: string): string[] {
    const recommendations: string[] = [];
    const lines = synthesis.split('\n');
    
    for (const line of lines) {
      if (line.includes('recommend') || line.includes('suggest') || line.includes('consider')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private extractThemes(synthesis: string): string[] {
    // Extract common themes - this is a simplified implementation
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
    
    return themes.slice(0, 3); // Limit to top 3 themes
  }

  private generateFallbackSynthesis(
    coreEngines: any,
    workflowType: string,
    userProfile: any
  ): string {
    const engineNames = Object.keys(coreEngines).filter(name => coreEngines[name] !== null);
    
    return `${workflowType.charAt(0).toUpperCase() + workflowType.slice(1)} analysis for ${userProfile.fullName || 'this person'} based on ${engineNames.join(', ')}. ` +
           `This analysis combines insights from multiple consciousness systems to provide guidance and understanding. ` +
           `The calculations have been completed successfully, though detailed AI interpretation is currently unavailable. ` +
           `Please consult the individual engine results for specific insights.`;
  }

  private getWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    return startDate.toISOString().split('T')[0];
  }
}

// Export the workflow class
export default ConsciousnessWorkflow;
