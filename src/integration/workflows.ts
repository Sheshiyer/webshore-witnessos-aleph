/**
 * Workflow Manager - Predefined Workflow Patterns
 * 
 * Provides predefined workflow patterns for common reading scenarios.
 */

import { EngineOrchestrator, EngineConfig, ComprehensiveReading } from './orchestrator';
import { ResultSynthesizer, SynthesisResult } from './synthesizer';
import type { EngineName } from '../types/engines';
import { BaseEngineInput } from '../engines/core/types';

export interface WorkflowDefinition {
  name: string;
  description: string;
  engines: EngineName[];
  executionMode: 'parallel' | 'sequential';
  options: WorkflowOptions;
}

export interface WorkflowOptions {
  includeDivination?: boolean;
  analysisDepth?: 'basic' | 'standard' | 'deep';
  format?: 'standard' | 'mystical' | 'witnessOS';
  focusArea?: string;
}

export interface WorkflowResult {
  workflowName: string;
  timestamp: string;
  inputData: Record<string, any>;
  engineResults: Record<string, any>;
  synthesis: SynthesisResult;
  recommendations: string[];
  nextSteps: string[];
  processingTime: number;
}

export class WorkflowManager {
  private orchestrator: EngineOrchestrator;
  private synthesizer: ResultSynthesizer;
  private workflows: Map<string, WorkflowDefinition>;

  constructor() {
    this.orchestrator = new EngineOrchestrator();
    this.synthesizer = new ResultSynthesizer();
    this.workflows = new Map();
    this.initializeWorkflows();
  }

  /**
   * Initialize predefined workflows
   */
  private initializeWorkflows(): void {
    // Complete Natal Reading
    this.workflows.set('complete_natal', {
      name: 'Complete Natal Analysis',
      description: 'Comprehensive natal chart analysis using all available engines',
      engines: ['numerology', 'human_design', 'vimshottari', 'gene_keys', 'biorhythm', 'enneagram', 'sacred_geometry'],
      executionMode: 'parallel',
      options: {
        includeDivination: false,
        analysisDepth: 'deep',
        format: 'witnessOS'
      }
    });

    // Relationship Compatibility
    this.workflows.set('relationship_compatibility', {
      name: 'Relationship Compatibility Analysis',
      description: 'Two-person compatibility analysis across multiple systems',
      engines: ['numerology', 'human_design', 'enneagram'],
      executionMode: 'parallel',
      options: {
        includeDivination: false,
        analysisDepth: 'standard',
        format: 'standard',
        focusArea: 'relationships'
      }
    });

    // Career Guidance
    this.workflows.set('career_guidance', {
      name: 'Career and Life Purpose Guidance',
      description: 'Career and life purpose guidance using purpose-oriented engines',
      engines: ['numerology', 'human_design', 'gene_keys', 'enneagram'],
      executionMode: 'sequential',
      options: {
        includeDivination: true,
        analysisDepth: 'deep',
        format: 'witnessOS',
        focusArea: 'career'
      }
    });

    // Spiritual Development
    this.workflows.set('spiritual_development', {
      name: 'Spiritual Development Path',
      description: 'Consciousness evolution and spiritual development guidance',
      engines: ['gene_keys', 'sacred_geometry', 'vimshottari', 'iching', 'enneagram'],
      executionMode: 'sequential',
      options: {
        includeDivination: true,
        analysisDepth: 'deep',
        format: 'mystical',
        focusArea: 'spirituality'
      }
    });

    // Life Transition Support
    this.workflows.set('life_transition', {
      name: 'Life Transition Support',
      description: 'Support for major life transitions and changes',
      engines: ['biorhythm', 'vimshottari', 'tarot', 'iching', 'enneagram'],
      executionMode: 'sequential',
      options: {
        includeDivination: true,
        analysisDepth: 'standard',
        format: 'witnessOS',
        focusArea: 'transition'
      }
    });

    // Daily Guidance
    this.workflows.set('daily_guidance', {
      name: 'Daily Energy Optimization',
      description: 'Daily energy optimization and guidance',
      engines: ['biorhythm', 'numerology', 'tarot'],
      executionMode: 'parallel',
      options: {
        includeDivination: true,
        analysisDepth: 'basic',
        format: 'standard'
      }
    });

    // Shadow Work
    this.workflows.set('shadow_work', {
      name: 'Shadow Integration Work',
      description: 'Shadow integration and healing guidance',
      engines: ['enneagram', 'gene_keys', 'tarot', 'human_design'],
      executionMode: 'sequential',
      options: {
        includeDivination: true,
        analysisDepth: 'deep',
        format: 'mystical',
        focusArea: 'shadow'
      }
    });

    // Manifestation Timing
    this.workflows.set('manifestation_timing', {
      name: 'Manifestation Timing Optimization',
      description: 'Optimal timing for manifestation and goal achievement',
      engines: ['vimshottari', 'biorhythm', 'numerology', 'sigil_forge'],
      executionMode: 'sequential',
      options: {
        includeDivination: false,
        analysisDepth: 'standard',
        format: 'witnessOS',
        focusArea: 'manifestation'
      }
    });
  }

  /**
   * Get list of available workflows
   */
  getAvailableWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow definition by name
   */
  getWorkflow(workflowName: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowName);
  }

  /**
   * Run a predefined workflow
   */
  async runWorkflow(
    workflowName: string,
    inputData: Record<string, any>,
    customOptions?: Partial<WorkflowOptions>
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Unknown workflow: ${workflowName}`);
    }

    // Merge custom options with workflow defaults
    const options = { ...workflow.options, ...customOptions };

    // Prepare engine configurations
    const engineConfigs: EngineConfig[] = workflow.engines.map(engineName => ({
      name: engineName,
      input: this.prepareWorkflowInput(inputData, engineName, options)
    }));

    // Add divination engines if requested
    if (options.includeDivination && !workflow.engines.includes('tarot')) {
      engineConfigs.push({
        name: 'tarot',
        input: this.prepareDivinationInput(inputData, 'tarot', options)
      });
    }

    // Execute workflow
    let engineResults;
    if (workflow.executionMode === 'parallel') {
      engineResults = await this.orchestrator.runParallelEngines(engineConfigs);
    } else {
      engineResults = await this.orchestrator.runSequentialEngines(engineConfigs);
    }

    // Synthesize results
    const synthesis = this.synthesizer.synthesizeReading(engineResults);

    // Generate workflow-specific recommendations
    const recommendations = this.generateWorkflowRecommendations(workflowName, synthesis, options);
    const nextSteps = this.generateNextSteps(workflowName, synthesis);

    const result: WorkflowResult = {
      workflowName,
      timestamp: new Date().toISOString(),
      inputData,
      engineResults,
      synthesis,
      recommendations,
      nextSteps,
      processingTime: Date.now() - startTime
    };

    return result;
  }

  /**
   * Prepare input for workflow engines
   */
  private prepareWorkflowInput(
    inputData: Record<string, any>,
    engineName: EngineName,
    options: WorkflowOptions
  ): BaseEngineInput {
    const baseInput = {
      birthDate: inputData.birthDate || inputData.date,
      birthTime: inputData.birthTime || inputData.time,
      birthLocation: inputData.birthLocation || inputData.location,
      fullName: inputData.fullName || inputData.name
    };

    // Engine-specific input preparation
    switch (engineName) {
      case 'enneagram':
        return {
          ...baseInput,
          identificationMethod: 'intuitive',
          behavioralDescription: `Person seeking ${options.focusArea || 'general'} guidance`,
          includeWings: options.analysisDepth !== 'basic',
          includeArrows: options.analysisDepth === 'deep',
          includeInstincts: options.analysisDepth === 'deep',
          focusArea: options.focusArea as any
        };

      case 'gene_keys':
        return {
          ...baseInput,
          focusSequence: options.focusArea === 'relationships' ? 'venus' : 
                        options.focusArea === 'career' ? 'pearl' : 'activation'
        };

      case 'sacred_geometry':
        return {
          ...baseInput,
          patternType: 'auto',
          includePersonalization: true,
          intention: `${options.focusArea || 'general'} guidance and support`
        };

      case 'sigil_forge':
        return {
          ...baseInput,
          intention: `Support for ${options.focusArea || 'personal development'}`,
          generationMethod: 'personal',
          includePersonalization: true
        };

      default:
        return baseInput;
    }
  }

  /**
   * Prepare divination input for workflows
   */
  private prepareDivinationInput(
    inputData: Record<string, any>,
    engineName: string,
    options: WorkflowOptions
  ): BaseEngineInput {
    const question = this.generateWorkflowQuestion(inputData, options);

    if (engineName === 'tarot') {
      return {
        question,
        spreadType: options.analysisDepth === 'deep' ? 'celtic_cross' : 'three_card',
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
   * Generate workflow-specific question
   */
  private generateWorkflowQuestion(inputData: Record<string, any>, options: WorkflowOptions): string {
    const name = inputData.fullName || inputData.name || 'this person';
    const focus = options.focusArea || 'life path';

    switch (options.focusArea) {
      case 'career':
        return `What guidance can you provide for ${name}'s career path and professional development?`;
      case 'relationships':
        return `What insights can you offer about ${name}'s relationship patterns and connections?`;
      case 'spirituality':
        return `What spiritual guidance and development opportunities are available for ${name}?`;
      case 'shadow':
        return `What shadow aspects and integration opportunities should ${name} be aware of?`;
      case 'transition':
        return `What guidance can you provide for ${name}'s current life transition?`;
      case 'manifestation':
        return `What is the optimal timing and approach for ${name}'s manifestation goals?`;
      default:
        return `What general life guidance and insights are available for ${name} at this time?`;
    }
  }

  /**
   * Generate workflow-specific recommendations
   */
  private generateWorkflowRecommendations(
    workflowName: string,
    synthesis: SynthesisResult,
    options: WorkflowOptions
  ): string[] {
    const baseRecommendations = synthesis.integrationGuidance.map(g => g.guidance);

    // Add workflow-specific recommendations
    const workflowSpecific: string[] = [];

    switch (workflowName) {
      case 'complete_natal':
        workflowSpecific.push(
          'Study your complete consciousness blueprint for deep self-understanding',
          'Focus on integrating insights from all systems for holistic growth',
          'Use this analysis as a foundation for ongoing self-development'
        );
        break;

      case 'career_guidance':
        workflowSpecific.push(
          'Align your career choices with your natural gifts and purpose',
          'Consider how your personality type influences your work style',
          'Look for opportunities that match your energy patterns'
        );
        break;

      case 'spiritual_development':
        workflowSpecific.push(
          'Establish a regular spiritual practice based on your blueprint',
          'Work with the identified growth edges for consciousness expansion',
          'Use sacred geometry and symbols for meditation and focus'
        );
        break;

      case 'shadow_work':
        workflowSpecific.push(
          'Approach shadow work with compassion and patience',
          'Use the identified patterns for conscious integration',
          'Consider working with a qualified guide for deep shadow work'
        );
        break;

      default:
        workflowSpecific.push(
          'Regular review and integration of insights is recommended',
          'Consider follow-up readings to track your evolution'
        );
    }

    return [...baseRecommendations.slice(0, 5), ...workflowSpecific];
  }

  /**
   * Generate next steps for the workflow
   */
  private generateNextSteps(workflowName: string, synthesis: SynthesisResult): string[] {
    const nextSteps: string[] = [];

    // Universal next steps
    nextSteps.push(
      'Reflect on the insights and correlations identified',
      'Choose 2-3 key recommendations to focus on initially'
    );

    // Workflow-specific next steps
    switch (workflowName) {
      case 'complete_natal':
        nextSteps.push(
          'Create a personal development plan based on your blueprint',
          'Consider specialized readings for specific life areas',
          'Schedule follow-up readings to track your evolution'
        );
        break;

      case 'career_guidance':
        nextSteps.push(
          'Research career paths that align with your identified gifts',
          'Network with people in fields that match your energy type',
          'Consider additional training or education in aligned areas'
        );
        break;

      case 'spiritual_development':
        nextSteps.push(
          'Begin or deepen your meditation practice',
          'Study the spiritual traditions that resonate with your blueprint',
          'Connect with like-minded spiritual communities'
        );
        break;

      case 'life_transition':
        nextSteps.push(
          'Use the timing insights to plan your transition phases',
          'Prepare for the challenges and opportunities identified',
          'Seek support during transition periods'
        );
        break;

      default:
        nextSteps.push(
          'Apply the insights to your daily life gradually',
          'Monitor your progress and adjust as needed'
        );
    }

    return nextSteps;
  }

  /**
   * Create custom workflow
   */
  createCustomWorkflow(
    name: string,
    engines: EngineName[],
    options: WorkflowOptions,
    executionMode: 'parallel' | 'sequential' = 'parallel'
  ): void {
    this.workflows.set(name, {
      name,
      description: `Custom workflow: ${name}`,
      engines,
      executionMode,
      options
    });
  }
}

export const workflowManager = new WorkflowManager();
export default workflowManager;
