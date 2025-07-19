/**
 * AI Service Worker for WitnessOS
 * 
 * Specialized Cloudflare Worker that handles all AI-powered operations
 * including synthesis, interpretation, and analysis via RPC interface.
 * Integrates with OpenRouter API for various AI models.
 */

import { WorkerEntrypoint } from 'cloudflare:workers';
import { createAIInterpreter, AIInterpreter } from '../lib/ai-interpreter';

// Environment interface for this service
interface AIServiceEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  KV_AI_CACHE: KVNamespace;
  OPENROUTER_API_KEY: string;
}

// RPC method parameter types
interface SynthesisParams {
  engineResults: Array<{
    engineName: string;
    data: any;
  }>;
  context: {
    userProfile?: any;
    date?: string;
    type?: 'daily' | 'weekly' | 'natal' | 'career' | 'spiritual';
    question?: string;
  };
  options?: {
    model?: string;
    useCache?: boolean;
    maxTokens?: number;
  };
}

interface ForecastSynthesisParams {
  biorhythm: any;
  iching: any;
  tarot: any;
  date: string;
  type: 'daily' | 'weekly';
  options?: {
    useCache?: boolean;
    includeGuidance?: boolean;
  };
}

interface WorkflowSynthesisParams {
  coreEngines: any[];
  workflowType: 'natal' | 'career' | 'spiritual';
  userProfile: any;
  options?: {
    useCache?: boolean;
    depth?: 'basic' | 'detailed' | 'comprehensive';
  };
}

// RPC response types
interface SynthesisResult {
  success: boolean;
  synthesis?: string;
  error?: string;
  metadata?: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    cached: boolean;
    timestamp: string;
  };
}

/**
 * AI Service Worker - RPC Entrypoint
 * 
 * Provides specialized AI-powered services via RPC interface.
 * This worker handles synthesis, interpretation, and analysis
 * using various AI models through OpenRouter API.
 */
export class AIService extends WorkerEntrypoint<AIServiceEnv> {
  private aiInterpreter?: AIInterpreter;

  /**
   * Required fetch handler (not used for RPC)
   */
  async fetch(): Promise<Response> {
    return new Response('AI Service - Use RPC methods', { status: 404 });
  }

  /**
   * Initialize AI interpreter lazily
   */
  private async getAIInterpreter(): Promise<AIInterpreter> {
    if (!this.aiInterpreter) {
      if (!this.env.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
      }

      this.aiInterpreter = await createAIInterpreter({
        apiKey: this.env.OPENROUTER_API_KEY,
        model: 'anthropic/claude-3-haiku',
        fallbackModel1: 'meta-llama/llama-3.1-8b-instruct:free',
        fallbackModel2: 'microsoft/wizardlm-2-8x22b'
      });
    }
    return this.aiInterpreter;
  }

  /**
   * Synthesize multiple engine results into coherent insights
   * 
   * @param params - Synthesis parameters
   * @returns Promise<SynthesisResult> - AI synthesis result
   */
  async synthesize(params: SynthesisParams): Promise<SynthesisResult> {
    const startTime = Date.now();
    const { engineResults, context, options = {} } = params;

    try {
      // Check cache if enabled
      if (options.useCache) {
        const cacheKey = this.generateCacheKey('synthesis', { engineResults, context });
        const cached = await this.env.KV_AI_CACHE.get(cacheKey);
        
        if (cached) {
          const cachedResult = JSON.parse(cached);
          return {
            success: true,
            synthesis: cachedResult.synthesis,
            metadata: {
              ...cachedResult.metadata,
              cached: true,
              processingTime: Date.now() - startTime
            }
          };
        }
      }

      const ai = await this.getAIInterpreter();

      // Prepare synthesis prompt
      const prompt = this.buildSynthesisPrompt(engineResults, context);

      // Generate synthesis
      const response = await ai.generateResponse(prompt, {
        maxTokens: options.maxTokens || 1000,
        model: options.model
      });

      if (!response.success) {
        throw new Error(response.error || 'AI synthesis failed');
      }

      const result: SynthesisResult = {
        success: true,
        synthesis: response.content,
        metadata: {
          model: response.model || 'unknown',
          tokensUsed: response.tokensUsed || 0,
          processingTime: Date.now() - startTime,
          cached: false,
          timestamp: new Date().toISOString()
        }
      };

      // Cache result if enabled
      if (options.useCache && result.synthesis) {
        const cacheKey = this.generateCacheKey('synthesis', { engineResults, context });
        await this.env.KV_AI_CACHE.put(
          cacheKey,
          JSON.stringify({
            synthesis: result.synthesis,
            metadata: result.metadata
          }),
          { expirationTtl: 3600 } // 1 hour cache
        );
      }

      return result;

    } catch (error) {
      console.error('AI synthesis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI synthesis error',
        metadata: {
          model: 'unknown',
          tokensUsed: 0,
          processingTime: Date.now() - startTime,
          cached: false,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Synthesize forecast data into readable insights
   * 
   * @param params - Forecast synthesis parameters
   * @returns Promise<SynthesisResult> - Forecast synthesis result
   */
  async synthesizeForecast(params: ForecastSynthesisParams): Promise<SynthesisResult> {
    const { biorhythm, iching, tarot, date, type, options = {} } = params;

    const engineResults = [
      { engineName: 'biorhythm', data: biorhythm },
      { engineName: 'iching', data: iching },
      { engineName: 'tarot', data: tarot }
    ].filter(result => result.data); // Only include successful results

    const context = {
      date,
      type,
      question: `Generate ${type} forecast insights for ${date}`
    };

    return await this.synthesize({
      engineResults,
      context,
      options: {
        ...options,
        maxTokens: type === 'weekly' ? 1500 : 800
      }
    });
  }

  /**
   * Synthesize workflow results for consciousness analysis
   * 
   * @param params - Workflow synthesis parameters
   * @returns Promise<SynthesisResult> - Workflow synthesis result
   */
  async synthesizeWorkflow(params: WorkflowSynthesisParams): Promise<SynthesisResult> {
    const { coreEngines, workflowType, userProfile, options = {} } = params;

    const engineResults = coreEngines.map((engine, index) => ({
      engineName: ['numerology', 'human_design', 'vimshottari'][index] || 'unknown',
      data: engine
    }));

    const context = {
      userProfile,
      type: workflowType,
      question: `Generate ${workflowType} consciousness analysis for ${userProfile.fullName || 'this person'}`
    };

    const maxTokens = {
      basic: 800,
      detailed: 1200,
      comprehensive: 2000
    }[options.depth || 'detailed'];

    return await this.synthesize({
      engineResults,
      context,
      options: {
        ...options,
        maxTokens
      }
    });
  }

  /**
   * Interpret single engine result with AI analysis
   * 
   * @param engineName - Name of the engine
   * @param engineData - Engine calculation result
   * @param context - Additional context for interpretation
   * @returns Promise<SynthesisResult> - AI interpretation result
   */
  async interpretEngine(
    engineName: string, 
    engineData: any, 
    context?: any
  ): Promise<SynthesisResult> {
    return await this.synthesize({
      engineResults: [{ engineName, data: engineData }],
      context: context || {},
      options: { maxTokens: 600 }
    });
  }

  /**
   * Generate personalized guidance based on multiple data points
   * 
   * @param userProfile - User profile data
   * @param engineResults - Multiple engine results
   * @param question - Specific question or focus area
   * @returns Promise<SynthesisResult> - Personalized guidance
   */
  async generateGuidance(
    userProfile: any,
    engineResults: Array<{ engineName: string; data: any }>,
    question?: string
  ): Promise<SynthesisResult> {
    const context = {
      userProfile,
      type: 'guidance',
      question: question || 'Provide personalized consciousness guidance'
    };

    return await this.synthesize({
      engineResults,
      context,
      options: { maxTokens: 1000 }
    });
  }

  /**
   * Health check for AI service
   * 
   * @returns Promise<any> - Health status
   */
  async healthCheck(): Promise<any> {
    try {
      const ai = await this.getAIInterpreter();
      
      // Simple test synthesis
      const testResponse = await ai.generateResponse(
        'Respond with "AI Service is healthy" if you can process this message.',
        { maxTokens: 50 }
      );

      return {
        status: testResponse.success ? 'healthy' : 'degraded',
        model: testResponse.model,
        timestamp: new Date().toISOString(),
        error: testResponse.error
      };

    } catch (error) {
      console.error('AI service health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Private helper methods
   */

  private buildSynthesisPrompt(
    engineResults: Array<{ engineName: string; data: any }>,
    context: any
  ): string {
    let prompt = `You are an expert consciousness analyst synthesizing insights from multiple divination and consciousness systems.\n\n`;

    // Add context
    if (context.userProfile?.fullName) {
      prompt += `User: ${context.userProfile.fullName}\n`;
    }
    if (context.date) {
      prompt += `Date: ${context.date}\n`;
    }
    if (context.type) {
      prompt += `Analysis Type: ${context.type}\n`;
    }
    if (context.question) {
      prompt += `Focus: ${context.question}\n`;
    }

    prompt += `\nEngine Results:\n`;

    // Add engine results
    for (const result of engineResults) {
      prompt += `\n${result.engineName.toUpperCase()}:\n`;
      prompt += JSON.stringify(result.data, null, 2);
      prompt += `\n`;
    }

    // Add synthesis instructions
    prompt += `\nPlease provide a coherent, insightful synthesis that:\n`;
    prompt += `1. Integrates the insights from all systems\n`;
    prompt += `2. Identifies key themes and patterns\n`;
    prompt += `3. Offers practical guidance and recommendations\n`;
    prompt += `4. Maintains a supportive and empowering tone\n`;
    prompt += `5. Avoids making definitive predictions about the future\n\n`;

    prompt += `Synthesis:`;

    return prompt;
  }

  private generateCacheKey(operation: string, params: any): string {
    // Create a stable cache key from parameters
    const paramsString = JSON.stringify(params, Object.keys(params).sort());
    const hash = this.simpleHash(paramsString);
    return `ai_${operation}_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Export the service as default
export default AIService;
