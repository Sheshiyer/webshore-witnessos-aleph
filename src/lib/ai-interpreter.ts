/**
 * AI-Enhanced Interpretation Service for WitnessOS
 * 
 * Provides intelligent, personalized interpretations for consciousness readings
 * using OpenRouter API with custom LLM models
 */

import type { EngineName } from '@/types/engines';
import type { BaseEngineOutput } from '@/engines/core/types';

export interface AIInterpretationConfig {
  model: string;
  fallbackModel1?: string;
  fallbackModel2?: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  userContext?: {
    name?: string;
    birthDate?: string;
    previousReadings?: any[];
    focusArea?: string;
  };
}

export interface AIModelConfig {
  defaultModel: string;
  fallbackModel1: string;
  fallbackModel2: string;
  apiKey: string;
}

export interface AIInterpretationResult {
  enhancedInterpretation: string;
  personalizedGuidance: string[];
  keyInsights: string[];
  practicalSteps: string[];
  integrationTips: string[];
  confidence: number;
  processingTime: number;
}

export class AIInterpreter {
  private modelConfig: AIModelConfig;
  private baseUrl = 'https://openrouter.ai/api/v1';
  
  constructor(modelConfig: AIModelConfig) {
    this.modelConfig = modelConfig;
  }

  /**
   * Create AIInterpreter with configuration from KV secrets
   */
  static async createFromSecrets(kvDataAccess: any): Promise<AIInterpreter | null> {
    try {
      const [apiKey, modelConfigStr] = await Promise.all([
        kvDataAccess.getSecret('OPENROUTER_API_KEY'),
        kvDataAccess.getSecret('AI_MODEL_CONFIG')
      ]);

      if (!apiKey) {
        console.warn('OpenRouter API key not found in secrets');
        return null;
      }

      let modelConfig: AIModelConfig;
      
      if (modelConfigStr) {
        try {
          const parsedConfig = JSON.parse(modelConfigStr);
          modelConfig = {
            apiKey,
            defaultModel: parsedConfig.default || 'google/gemma-3n-e2b-it:free',
            fallbackModel1: parsedConfig.fallback1 || 'deepseek/deepseek-v3-base:free',
            fallbackModel2: parsedConfig.fallback2 || 'deepseek/deepseek-v3-base:free'
          };
        } catch (parseError) {
          console.warn('Failed to parse AI model config, using defaults:', parseError);
          modelConfig = {
            apiKey,
            defaultModel: 'google/gemma-3n-e2b-it:free',
            fallbackModel1: 'deepseek/deepseek-v3-base:free',
            fallbackModel2: 'deepseek/deepseek-v3-base:free'
          };
        }
      } else {
        // Fallback to default configuration
        modelConfig = {
          apiKey,
          defaultModel: 'google/gemma-3n-e2b-it:free',
          fallbackModel1: 'deepseek/deepseek-v3-base:free',
          fallbackModel2: 'deepseek/deepseek-v3-base:free'
        };
      }

      console.log('AI Interpreter initialized with models:', {
        default: modelConfig.defaultModel,
        fallback1: modelConfig.fallbackModel1,
        fallback2: modelConfig.fallbackModel2
      });

      return new AIInterpreter(modelConfig);
    } catch (error) {
      console.error('Failed to create AI interpreter from secrets:', error);
      return null;
    }
  }

  /**
   * Enhance a consciousness reading with AI interpretation
   */
  async enhanceReading(
    engineName: EngineName,
    readingData: BaseEngineOutput,
    config: Partial<AIInterpretationConfig> = {}
  ): Promise<AIInterpretationResult & { modelUsed?: string; attemptedModels?: string[]; modelSwitches?: number }> {
    const startTime = Date.now();
    
    try {
      const fullConfig = this.buildConfig(engineName, config);
      const prompt = this.buildPrompt(engineName, readingData, fullConfig);
      
      console.log(`🎯 Starting AI enhancement for ${engineName} engine`);
      console.log(`📋 Available models: ${[fullConfig.model, fullConfig.fallbackModel1, fullConfig.fallbackModel2].filter(Boolean).join(', ')}`);
      
      const { response, modelUsed, attemptedModels, modelSwitches } = await this.callOpenRouterWithMetadata(prompt, fullConfig);
      const interpretation = this.parseAIResponse(response);
      
      const result = {
        ...interpretation,
        confidence: this.calculateConfidence(interpretation, readingData),
        processingTime: Date.now() - startTime,
        modelUsed,
        attemptedModels,
        modelSwitches
      };
      
      console.log(`✅ AI enhancement completed successfully`);
      console.log(`📊 Final model used: ${modelUsed}`);
      console.log(`⏱️ Total processing time: ${result.processingTime}ms`);
      console.log(`🔄 Model switches: ${modelSwitches}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ AI interpretation failed:', error);
      return this.createFallbackInterpretation(readingData, Date.now() - startTime);
    }
  }

  /**
   * Generate multi-engine synthesis with AI
   */
  async synthesizeMultipleReadings(
    readings: Array<{ engine: EngineName; data: BaseEngineOutput }>,
    config: Partial<AIInterpretationConfig> = {}
  ): Promise<AIInterpretationResult & { modelUsed?: string; attemptedModels?: string[]; modelSwitches?: number }> {
    const startTime = Date.now();
    
    try {
      const synthesisConfig = this.buildSynthesisConfig(config);
      const prompt = this.buildSynthesisPrompt(readings, synthesisConfig);
      
      console.log(`🔮 Starting AI synthesis for ${readings.length} engines: ${readings.map(r => r.engine).join(', ')}`);
      console.log(`📋 Available models: ${[synthesisConfig.model, synthesisConfig.fallbackModel1, synthesisConfig.fallbackModel2].filter(Boolean).join(', ')}`);
      
      const { response, modelUsed, attemptedModels, modelSwitches } = await this.callOpenRouterWithMetadata(prompt, synthesisConfig);
      const interpretation = this.parseAIResponse(response);
      
      const result = {
        ...interpretation,
        confidence: this.calculateSynthesisConfidence(interpretation, readings),
        processingTime: Date.now() - startTime,
        modelUsed,
        attemptedModels,
        modelSwitches
      };
      
      console.log(`✅ AI synthesis completed successfully`);
      console.log(`📊 Final model used: ${modelUsed}`);
      console.log(`⏱️ Total processing time: ${result.processingTime}ms`);
      console.log(`🔄 Model switches: ${modelSwitches}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ AI synthesis failed:', error);
      return this.createFallbackSynthesis(readings, Date.now() - startTime);
    }
  }

  private buildConfig(engineName: EngineName, config: Partial<AIInterpretationConfig>): AIInterpretationConfig {
    const baseConfig = {
      model: config.model || this.modelConfig.defaultModel,
      fallbackModel1: config.fallbackModel1 || this.modelConfig.fallbackModel1,
      fallbackModel2: config.fallbackModel2 || this.modelConfig.fallbackModel2,
      maxTokens: config.maxTokens || 1500,
      temperature: config.temperature || 0.7,
      systemPrompt: this.getSystemPrompt(engineName),
      userContext: config.userContext || {}
    };
    
    return { ...baseConfig, ...config };
  }

  private buildSynthesisConfig(config: Partial<AIInterpretationConfig>): AIInterpretationConfig {
    return {
      model: config.model || this.modelConfig.defaultModel,
      fallbackModel1: config.fallbackModel1 || this.modelConfig.fallbackModel1,
      fallbackModel2: config.fallbackModel2 || this.modelConfig.fallbackModel2,
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.8,
      systemPrompt: this.getSynthesisSystemPrompt(),
      userContext: config.userContext || {}
    };
  }

  private getSystemPrompt(engineName: EngineName): string {
    const basePrompt = `You are an expert consciousness guide and mystical interpreter specializing in ${engineName} readings. Your role is to provide profound, personalized insights that bridge ancient wisdom with modern psychology.

Core Principles:
- Speak as a wise, compassionate consciousness guide
- Avoid generic interpretations - make everything personal and specific
- Balance mystical depth with practical applicability
- Focus on growth, empowerment, and conscious evolution
- Use rich, evocative language that resonates with the soul
- Integrate psychological insights with spiritual wisdom

Response Structure:
1. Enhanced Interpretation: A flowing, narrative interpretation that weaves the reading data into a meaningful story
2. Personalized Guidance: Specific actionable guidance tailored to the individual
3. Key Insights: Core realizations and awarenesses
4. Practical Steps: Concrete actions to integrate the reading
5. Integration Tips: How to work with this information in daily life`;

    const engineSpecific: Record<string, string> = {
      numerology: `

For Numerology readings, focus on:
- Life path as soul curriculum and conscious evolution journey
- Numbers as archetypal frequencies and vibrational signatures
- Personal year as current life theme and optimization focus
- Master numbers as spiritual gifts and heightened responsibility
- Name vibrations as energetic interface with reality`,

      tarot: `

For Tarot readings, focus on:
- Cards as archetypal mirrors of the psyche
- Spreads as narrative journey and energy mapping
- Reversed cards as shadow work and integration opportunities
- Elemental balance as psychological and spiritual harmony
- Major arcana as life themes and soul lessons`,

      human_design: `

For Human Design readings, focus on:
- Type and strategy as authentic self-expression
- Authority as inner wisdom and decision-making guidance
- Centers as energy dynamics and consciousness operations
- Gates and channels as specific gifts and life themes
- Profile as life purpose and interaction style`,

      iching: `

For I-Ching readings, focus on:
- Hexagrams as cosmic timing and situational wisdom
- Changing lines as transformation opportunities
- Trigrams as elemental forces and energy dynamics
- Present moment awareness and flow with natural rhythms
- Ancient wisdom applied to modern situations`,

      enneagram: `

For Enneagram readings, focus on:
- Type as both gift and limitation pattern
- Wings as supporting energies and trait modulation
- Arrows as growth and stress directions
- Centers as core intelligence and processing style
- Integration as conscious personality work`,

      sacred_geometry: `

For Sacred Geometry readings, focus on:
- Patterns as consciousness structures and reality blueprints
- Sacred ratios as divine proportions and harmony principles
- Meditation points as consciousness access portals
- Energy flow as life force optimization
- Manifestation through geometric resonance`,

      biorhythm: `

For Biorhythm readings, focus on:
- Cycles as natural rhythms and energy optimization
- Phase awareness for peak performance timing
- Biological harmony and natural flow states
- Energy management and recovery patterns
- Synchronization with natural cycles`,

      vimshottari: `

For Vimshottari readings, focus on:
- Dasha periods as karmic timing and life themes
- Planetary influences and evolutionary lessons
- Temporal consciousness and cosmic rhythms
- Vedic wisdom and spiritual evolution
- Karmic timing and life purpose alignment`,

      gene_keys: `

For Gene Keys readings, focus on:
- Shadow to gift to siddhi transformation
- Archetypal patterns and consciousness evolution
- Life purpose and genetic wisdom
- Emotional intelligence and awareness
- Contemplative practice and realization`,

      sigil_forge: `

For Sigil Forge readings, focus on:
- Symbol creation as consciousness manifestation
- Sacred geometry and intentional design
- Activation processes and energetic alignment
- Personal symbolism and archetypal resonance
- Practical magic and reality creation`
    };

    return basePrompt + (engineSpecific[engineName] || '');
  }

  private getSynthesisSystemPrompt(): string {
    return `You are a master consciousness synthesizer who can weave multiple mystical traditions into unified wisdom. Your role is to find the golden threads connecting different consciousness systems and create a cohesive, empowering narrative.

Core Principles:
- Identify patterns and themes across different systems
- Create synthesis rather than just summary
- Look for complementary insights and confirming patterns
- Address apparent contradictions with higher-order integration
- Focus on the unified consciousness journey
- Provide practical integration guidance

Synthesis Structure:
1. Enhanced Interpretation: Unified story weaving all readings together
2. Personalized Guidance: Integrated action steps drawing from all systems
3. Key Insights: Core realizations from the synthesis
4. Practical Steps: How to work with the combined wisdom
5. Integration Tips: Living the integrated consciousness in daily life

Remember: You're creating a singular, coherent consciousness map from multiple perspectives.`;
  }

  private buildPrompt(engineName: EngineName, readingData: BaseEngineOutput, config: AIInterpretationConfig): string {
    const context = config.userContext;
    let prompt = `Please provide an enhanced interpretation for this ${engineName} reading:\n\n`;
    
    // Add user context if available
    if (context?.name) {
      prompt += `Person: ${context.name}\n`;
    }
    if (context?.birthDate) {
      prompt += `Birth Date: ${context.birthDate}\n`;
    }
    if (context?.focusArea) {
      prompt += `Focus Area: ${context.focusArea}\n`;
    }
    
    prompt += `\nReading Data:\n${JSON.stringify(readingData, null, 2)}\n\n`;
    
    prompt += `Please provide a profound, personalized interpretation that transforms this data into meaningful guidance for conscious evolution.`;
    
    return prompt;
  }

  private buildSynthesisPrompt(
    readings: Array<{ engine: EngineName; data: BaseEngineOutput }>,
    config: AIInterpretationConfig
  ): string {
    const context = config.userContext;
    let prompt = `Please synthesize these multiple consciousness readings into a unified interpretation:\n\n`;
    
    // Add user context
    if (context?.name) {
      prompt += `Person: ${context.name}\n`;
    }
    if (context?.birthDate) {
      prompt += `Birth Date: ${context.birthDate}\n`;
    }
    if (context?.focusArea) {
      prompt += `Focus Area: ${context.focusArea}\n`;
    }
    
    prompt += `\nReadings to Synthesize:\n`;
    
    readings.forEach(({ engine, data }, index) => {
      prompt += `\n${index + 1}. ${engine.toUpperCase()} READING:\n`;
      prompt += JSON.stringify(data, null, 2) + '\n';
    });
    
    prompt += `\nPlease create a unified consciousness map that weaves all these perspectives into a coherent, empowering narrative for conscious evolution.`;
    
    return prompt;
  }

  private async callOpenRouter(prompt: string, config: AIInterpretationConfig): Promise<string> {
    const result = await this.callOpenRouterWithMetadata(prompt, config);
    return result.response;
  }

  private async callOpenRouterWithMetadata(
    prompt: string, 
    config: AIInterpretationConfig
  ): Promise<{ response: string; modelUsed: string; attemptedModels: string[]; modelSwitches: number }> {
    const models = [config.model, config.fallbackModel1, config.fallbackModel2].filter(Boolean);
    const attemptedModels: string[] = [];
    let modelSwitches = 0;
    
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      if (!model) continue;
      
      attemptedModels.push(model);
      if (i > 0) {
        modelSwitches++;
        console.log(`🔄 Switching to fallback model #${i}: ${model}`);
      }
      
      try {
        const requestStart = Date.now();
        console.log(`🤖 [${i + 1}/${models.length}] Attempting AI interpretation with model: ${model}`);
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.modelConfig.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://witnessos.com',
            'X-Title': 'WitnessOS Consciousness Platform'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: config.systemPrompt
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          })
        });

        const requestTime = Date.now() - requestStart;
        console.log(`⏱️ Request to ${model} took ${requestTime}ms`);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`❌ Model ${model} failed: ${response.status} ${response.statusText} - ${errorText}`);
          
          if (i === models.length - 1) {
            throw new Error(`All AI models failed. Last error: ${response.status} ${response.statusText}`);
          }
          continue;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        
        if (content) {
          console.log(`✅ AI interpretation successful with model: ${model}`);
          console.log(`📊 Response length: ${content.length} characters`);
          console.log(`💰 Token usage: ${data.usage?.total_tokens || 'unknown'} tokens`);
          
          return {
            response: content,
            modelUsed: model,
            attemptedModels,
            modelSwitches
          };
        } else {
          console.warn(`⚠️ Model ${model} returned empty content`);
          if (i === models.length - 1) {
            throw new Error('All models returned empty content');
          }
          continue;
        }
        
      } catch (error) {
        console.error(`❌ Error with model ${model}:`, error);
        
        if (i === models.length - 1) {
          throw error;
        }
        continue;
      }
    }
    
    throw new Error('No valid models configured');
  }

  private parseAIResponse(response: string): Omit<AIInterpretationResult, 'confidence' | 'processingTime'> {
    // Try to parse structured response, fallback to simple parsing
    try {
      // Look for structured sections in the response
      const sections = this.extractSections(response);
      
      return {
        enhancedInterpretation: sections.interpretation || response,
        personalizedGuidance: sections.guidance || [],
        keyInsights: sections.insights || [],
        practicalSteps: sections.steps || [],
        integrationTips: sections.integration || []
      };
    } catch (error) {
      // Fallback to simple response
      return {
        enhancedInterpretation: response,
        personalizedGuidance: [],
        keyInsights: [],
        practicalSteps: [],
        integrationTips: []
      };
    }
  }

  private extractSections(response: string): any {
    const sections: any = {};
    
    // Try to extract different sections based on common patterns
    const interpretationMatch = response.match(/(?:Enhanced Interpretation|Interpretation):?\s*([\s\S]*?)(?=\n(?:Personalized Guidance|Key Insights|Practical Steps|$))/i);
    if (interpretationMatch && interpretationMatch[1]) {
      sections.interpretation = interpretationMatch[1].trim();
    }
    
    const guidanceMatch = response.match(/Personalized Guidance:?\s*([\s\S]*?)(?=\n(?:Key Insights|Practical Steps|Integration Tips|$))/i);
    if (guidanceMatch && guidanceMatch[1]) {
      sections.guidance = this.parseListItems(guidanceMatch[1]);
    }
    
    const insightsMatch = response.match(/Key Insights:?\s*([\s\S]*?)(?=\n(?:Practical Steps|Integration Tips|$))/i);
    if (insightsMatch && insightsMatch[1]) {
      sections.insights = this.parseListItems(insightsMatch[1]);
    }
    
    const stepsMatch = response.match(/Practical Steps:?\s*([\s\S]*?)(?=\n(?:Integration Tips|$))/i);
    if (stepsMatch && stepsMatch[1]) {
      sections.steps = this.parseListItems(stepsMatch[1]);
    }
    
    const integrationMatch = response.match(/Integration Tips:?\s*([\s\S]*?)$/i);
    if (integrationMatch && integrationMatch[1]) {
      sections.integration = this.parseListItems(integrationMatch[1]);
    }
    
    return sections;
  }

  private parseListItems(text: string): string[] {
    return text
      .split(/\n/)
      .map(line => line.replace(/^\s*[\-\*\d\.]\s*/, '').trim())
      .filter(line => line.length > 0 && !line.match(/^(Enhanced|Personalized|Key|Practical|Integration)/i));
  }

  private calculateConfidence(interpretation: any, readingData: BaseEngineOutput): number {
    // Base confidence on response completeness and reading confidence
    let confidence = readingData.confidenceScore || 0.7;
    
    if (interpretation.enhancedInterpretation?.length > 100) confidence += 0.1;
    if (interpretation.personalizedGuidance?.length > 0) confidence += 0.1;
    if (interpretation.keyInsights?.length > 0) confidence += 0.05;
    if (interpretation.practicalSteps?.length > 0) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  private calculateSynthesisConfidence(interpretation: any, readings: any[]): number {
    const avgConfidence = readings.reduce((sum, r) => sum + (r.data.confidenceScore || 0.7), 0) / readings.length;
    
    let synthesisBonus = 0;
    if (interpretation.enhancedInterpretation?.length > 200) synthesisBonus += 0.1;
    if (readings.length >= 3) synthesisBonus += 0.1;
    
    return Math.min(avgConfidence + synthesisBonus, 1.0);
  }

  private createFallbackInterpretation(readingData: BaseEngineOutput, processingTime: number): AIInterpretationResult {
    return {
      enhancedInterpretation: readingData.formattedOutput || 'Your consciousness reading contains valuable insights for your journey.',
      personalizedGuidance: readingData.recommendations || [],
      keyInsights: readingData.archetypalThemes || [],
      practicalSteps: [],
      integrationTips: ['Take time to reflect on these insights', 'Journal about your discoveries', 'Apply one insight this week'],
      confidence: 0.6,
      processingTime
    };
  }

  private createFallbackSynthesis(readings: any[], processingTime: number): AIInterpretationResult {
    const allRecommendations = readings.flatMap(r => r.data.recommendations || []);
    const allThemes = readings.flatMap(r => r.data.archetypalThemes || []);
    
    return {
      enhancedInterpretation: 'Your multi-layered consciousness reading reveals complementary insights across different wisdom traditions.',
      personalizedGuidance: allRecommendations.slice(0, 5),
      keyInsights: allThemes.slice(0, 5),
      practicalSteps: ['Integrate insights from multiple perspectives', 'Look for common themes', 'Apply complementary guidance'],
      integrationTips: ['Practice holistic awareness', 'Trust the unified message', 'Take aligned action'],
      confidence: 0.7,
      processingTime
    };
  }
}

export const createAIInterpreter = (modelConfig: AIModelConfig) => new AIInterpreter(modelConfig);

/**
 * Legacy function for backward compatibility
 */
export const createAIInterpreterLegacy = (apiKey: string) => {
  const modelConfig: AIModelConfig = {
    apiKey,
    defaultModel: 'openai/gpt-4-turbo-preview',
    fallbackModel1: 'openai/gpt-3.5-turbo',
    fallbackModel2: 'anthropic/claude-3-haiku'
  };
  return new AIInterpreter(modelConfig);
};

/**
 * Setup AI secrets in KV store
 */
export async function setupAISecrets(
  kvDataAccess: any,
  config: {
    apiKey: string;
    defaultModel?: string;
    fallbackModel1?: string;
    fallbackModel2?: string;
  }
): Promise<void> {
  await Promise.all([
    kvDataAccess.setSecret('OPENROUTER_API_KEY', config.apiKey),
    kvDataAccess.setSecret('AI_DEFAULT_MODEL', config.defaultModel || 'openai/gpt-4-turbo-preview'),
    kvDataAccess.setSecret('AI_FALLBACK_MODEL_1', config.fallbackModel1 || 'openai/gpt-3.5-turbo'),
    kvDataAccess.setSecret('AI_FALLBACK_MODEL_2', config.fallbackModel2 || 'anthropic/claude-3-haiku')
  ]);
  
  console.log('✅ AI secrets configured successfully');
}