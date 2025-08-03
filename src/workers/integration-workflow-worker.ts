/**
 * Integration Workflow Worker for WitnessOS
 * 
 * Specialized Cloudflare Worker that handles integration workflows
 * for external services like Raycast, Slack, and other platforms.
 */

import { WorkerEntrypoint } from 'cloudflare:workers';
import type { EngineName } from '../types/engines';

// Integration workflow environment interface
export interface IntegrationWorkflowEnv {
  ENGINE_SERVICE: Fetcher;
  AI_SERVICE: Fetcher;
  FORECAST_SERVICE: Fetcher;
  KV_CACHE: KVNamespace;
  KV_USER_PROFILES: KVNamespace;
  KV_INTEGRATIONS: KVNamespace;
}

// Workflow step interface (simplified)
interface WorkflowStep {
  do<T>(name: string, fn: () => Promise<T>): Promise<T>;
}

// Workflow event interface
interface WorkflowEvent<T> {
  payload: T;
}

// Integration workflow parameter types
interface IntegrationWorkflowParams {
  integrationType: 'raycast' | 'slack' | 'webhook' | 'api';
  userProfile: {
    name: string;
    birthDate: string;
    birthTime?: string;
    birthLocation?: string;
    timezone?: string;
    integrationSettings?: any;
    [key: string]: any;
  };
  integrationConfig: {
    endpoint?: string;
    apiKey?: string;
    webhookUrl?: string;
    format?: 'json' | 'markdown' | 'text';
    schedule?: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    engines?: EngineName[];
    [key: string]: any;
  };
  options: {
    includeAI?: boolean;
    includeForecasts?: boolean;
    customPrompt?: string;
    [key: string]: any;
  };
}

interface IntegrationResult {
  integrationType: string;
  userProfile: any;
  integrationConfig: any;
  data: any;
  deliveryStatus: {
    success: boolean;
    endpoint?: string;
    timestamp: string;
    error?: string;
  };
  timestamp: string;
  duration: number;
}

/**
 * Integration Workflow - Cloudflare Worker Implementation
 * 
 * Orchestrates data collection, processing, and delivery to external integrations
 * with support for various formats and delivery methods.
 */
export class IntegrationWorkflow extends WorkerEntrypoint<IntegrationWorkflowEnv> {
  
  async run(event: WorkflowEvent<IntegrationWorkflowParams>, step: WorkflowStep): Promise<IntegrationResult> {
    const startTime = Date.now();
    const { integrationType, userProfile, integrationConfig, options } = event.payload;
    
    // Step 1: Validate integration configuration
    const validatedConfig = await step.do('validate-integration', async () => {
      return this.validateIntegrationConfig(integrationType, integrationConfig);
    });
    
    // Step 2: Collect data based on integration requirements
    const collectedData = await step.do('collect-data', async () => {
      return this.collectIntegrationData(integrationType, userProfile, integrationConfig, options);
    });
    
    // Step 3: Format data for the target integration
    const formattedData = await step.do('format-data', async () => {
      return this.formatDataForIntegration(integrationType, collectedData, integrationConfig);
    });
    
    // Step 4: Deliver data to integration endpoint
    const deliveryStatus = await step.do('deliver-data', async () => {
      return this.deliverToIntegration(integrationType, formattedData, validatedConfig);
    });
    
    // Step 5: Cache integration result
    await step.do('cache-result', async () => {
      const cacheKey = `integration:${integrationType}:${this.generateUserHash(userProfile)}`;
      const result = {
        integrationType,
        userProfile,
        integrationConfig: validatedConfig,
        data: formattedData,
        deliveryStatus,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };
      
      await this.env.KV_CACHE.put(cacheKey, JSON.stringify(result), {
        expirationTtl: 3600 // 1 hour
      });
      
      return result;
    });
    
    return {
      integrationType,
      userProfile,
      integrationConfig: validatedConfig,
      data: formattedData,
      deliveryStatus,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Validate integration configuration
   */
  private validateIntegrationConfig(integrationType: string, config: any) {
    const validatedConfig = { ...config };
    
    switch (integrationType) {
      case 'raycast':
        // Raycast-specific validation
        validatedConfig.format = config.format || 'markdown';
        validatedConfig.engines = config.engines || ['numerology', 'biorhythm', 'iching'];
        break;
        
      case 'slack':
        // Slack-specific validation
        if (!config.webhookUrl) {
          throw new Error('Slack webhook URL is required');
        }
        validatedConfig.format = config.format || 'text';
        break;
        
      case 'webhook':
        // Generic webhook validation
        if (!config.endpoint) {
          throw new Error('Webhook endpoint is required');
        }
        validatedConfig.format = config.format || 'json';
        break;
        
      case 'api':
        // API integration validation
        if (!config.endpoint) {
          throw new Error('API endpoint is required');
        }
        validatedConfig.format = config.format || 'json';
        break;
        
      default:
        throw new Error(`Unsupported integration type: ${integrationType}`);
    }
    
    return validatedConfig;
  }
  
  /**
   * Collect data for integration
   */
  private async collectIntegrationData(integrationType: string, userProfile: any, config: any, options: any) {
    const data: any = {
      userProfile: {
        name: userProfile.name,
        birthDate: userProfile.birthDate
      },
      timestamp: new Date().toISOString()
    };
    
    // Collect engine data if specified
    if (config.engines && config.engines.length > 0) {
      data.engineResults = await this.collectEngineData(config.engines, userProfile);
    }
    
    // Collect forecast data if requested
    if (options.includeForecasts) {
      data.forecasts = await this.collectForecastData(userProfile);
    }
    
    // Generate AI synthesis if requested
    if (options.includeAI && data.engineResults) {
      data.aiSynthesis = await this.generateAISynthesis(data.engineResults, userProfile, options);
    }
    
    return data;
  }
  
  /**
   * Collect engine calculation data
   */
  private async collectEngineData(engines: EngineName[], userProfile: any) {
    const enginePromises = engines.map(async (engineName) => {
      try {
        const response = await this.env.ENGINE_SERVICE.fetch('/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engineName,
            inputData: {
              name: userProfile.name,
              birthDate: userProfile.birthDate,
              birthTime: userProfile.birthTime,
              birthLocation: userProfile.birthLocation,
              timezone: userProfile.timezone
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Engine ${engineName} failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        return {
          engineName,
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          engineName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    });
    
    return Promise.all(enginePromises);
  }
  
  /**
   * Collect forecast data
   */
  private async collectForecastData(userProfile: any) {
    try {
      const response = await this.env.FORECAST_SERVICE.fetch('/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          date: new Date().toISOString().split('T')[0]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Forecast service failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Forecast collection failed:', error);
      return null;
    }
  }
  
  /**
   * Generate AI synthesis
   */
  private async generateAISynthesis(engineResults: any[], userProfile: any, options: any) {
    try {
      const response = await this.env.AI_SERVICE.fetch('/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineResults,
          context: {
            userProfile: {
              name: userProfile.name,
              birthDate: userProfile.birthDate
            },
            customPrompt: options.customPrompt
          },
          options: {
            includeRecommendations: true
          }
        })
      });
      
      if (!response.ok) {
        console.warn('AI synthesis failed:', response.statusText);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.warn('AI synthesis error:', error);
      return null;
    }
  }
  
  /**
   * Format data for specific integration type
   */
  private formatDataForIntegration(integrationType: string, data: any, config: any) {
    switch (integrationType) {
      case 'raycast':
        return this.formatForRaycast(data, config);
        
      case 'slack':
        return this.formatForSlack(data, config);
        
      case 'webhook':
      case 'api':
        return this.formatForAPI(data, config);
        
      default:
        return data;
    }
  }
  
  /**
   * Format data for Raycast integration
   */
  private formatForRaycast(data: any, config: any) {
    if (config.format === 'markdown') {
      let markdown = `# Daily Consciousness Report\n\n`;
      markdown += `**Date:** ${new Date().toLocaleDateString()}\n`;
      markdown += `**Name:** ${data.userProfile.name}\n\n`;
      
      if (data.engineResults) {
        markdown += `## Engine Results\n\n`;
        data.engineResults.forEach((result: any) => {
          if (result.success) {
            markdown += `### ${result.engineName}\n`;
            markdown += `${JSON.stringify(result.data, null, 2)}\n\n`;
          }
        });
      }
      
      if (data.aiSynthesis) {
        markdown += `## AI Synthesis\n\n`;
        markdown += `${data.aiSynthesis.synthesis || 'No synthesis available'}\n\n`;
      }
      
      return { content: markdown, format: 'markdown' };
    }
    
    return data;
  }
  
  /**
   * Format data for Slack integration
   */
  private formatForSlack(data: any, config: any) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔮 Daily Consciousness Report'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Date:* ${new Date().toLocaleDateString()}\n*Name:* ${data.userProfile.name}`
        }
      }
    ];
    
    if (data.aiSynthesis && data.aiSynthesis.synthesis) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*AI Synthesis:*\n${data.aiSynthesis.synthesis}`
        }
      });
    }
    
    return { blocks };
  }
  
  /**
   * Format data for API/webhook integration
   */
  private formatForAPI(data: any, config: any) {
    return {
      timestamp: new Date().toISOString(),
      userProfile: data.userProfile,
      engineResults: data.engineResults,
      forecasts: data.forecasts,
      aiSynthesis: data.aiSynthesis,
      metadata: {
        integrationType: 'api',
        format: config.format || 'json'
      }
    };
  }
  
  /**
   * Deliver data to integration endpoint
   */
  private async deliverToIntegration(integrationType: string, data: any, config: any) {
    try {
      switch (integrationType) {
        case 'raycast':
          // For Raycast, we typically store in KV for the extension to fetch
          const raycastKey = `raycast:${this.generateUserHash(data.userProfile || {})}`;
          await this.env.KV_INTEGRATIONS.put(raycastKey, JSON.stringify(data), {
            expirationTtl: 86400 // 24 hours
          });
          
          return {
            success: true,
            endpoint: `KV:${raycastKey}`,
            timestamp: new Date().toISOString()
          };
          
        case 'slack':
          if (!config.webhookUrl) {
            throw new Error('Slack webhook URL not configured');
          }
          
          const slackResponse = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!slackResponse.ok) {
            throw new Error(`Slack delivery failed: ${slackResponse.statusText}`);
          }
          
          return {
            success: true,
            endpoint: config.webhookUrl,
            timestamp: new Date().toISOString()
          };
          
        case 'webhook':
        case 'api':
          if (!config.endpoint) {
            throw new Error('Endpoint not configured');
          }
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
          }
          
          const apiResponse = await fetch(config.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
          });
          
          if (!apiResponse.ok) {
            throw new Error(`API delivery failed: ${apiResponse.statusText}`);
          }
          
          return {
            success: true,
            endpoint: config.endpoint,
            timestamp: new Date().toISOString()
          };
          
        default:
          throw new Error(`Unsupported integration type: ${integrationType}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown delivery error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Generate a hash for user profile (for caching)
   */
  private generateUserHash(userProfile: any): string {
    const key = `${userProfile.name || 'unknown'}-${userProfile.birthDate || 'unknown'}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }
}

// Export for Cloudflare Workers
export default {
  async fetch(request: Request, env: IntegrationWorkflowEnv): Promise<Response> {
    return new Response('Integration Workflow Worker - Use via Workflow API', { status: 200 });
  }
};