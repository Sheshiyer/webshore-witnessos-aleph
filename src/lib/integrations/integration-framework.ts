/**
 * External Integration Framework for WitnessOS
 * 
 * Provides a modular API structure supporting Raycast and future external integrations
 * with plugin-style integration support and standardized response formats.
 */

import type { DailyForecast, WeeklyForecast } from '../../types/forecast';

// Base Integration Types
export interface IntegrationConfig {
  name: string;
  version: string;
  apiVersion: string;
  supportedFeatures: string[];
  responseFormat: 'raycast' | 'slack' | 'discord' | 'webhook' | 'standard';
  authentication?: {
    type: 'bearer' | 'api_key' | 'oauth' | 'none';
    required: boolean;
  };
}

export interface IntegrationRequest {
  type: string;
  parameters: Record<string, any>;
  userContext: {
    userId: string;
    preferences?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export interface IntegrationResponse {
  success: boolean;
  data: any;
  format: string;
  metadata: {
    integration: string;
    version: string;
    timestamp: string;
    requestId: string;
  };
  error?: string;
}

// Plugin Interface
export interface IntegrationPlugin {
  config: IntegrationConfig;
  initialize(): Promise<void>;
  processRequest(request: IntegrationRequest): Promise<IntegrationResponse>;
  formatResponse(data: any, format: string): any;
  validateRequest(request: IntegrationRequest): boolean;
}

// Integration Registry
export class IntegrationRegistry {
  private static plugins: Map<string, IntegrationPlugin> = new Map();

  static registerPlugin(name: string, plugin: IntegrationPlugin): void {
    this.plugins.set(name, plugin);
    console.log(`✅ Registered integration plugin: ${name}`);
  }

  static getPlugin(name: string): IntegrationPlugin | undefined {
    return this.plugins.get(name);
  }

  static getAllPlugins(): IntegrationPlugin[] {
    return Array.from(this.plugins.values());
  }

  static getSupportedIntegrations(): string[] {
    return Array.from(this.plugins.keys());
  }
}

// Base Integration Framework
export class IntegrationFramework {
  /**
   * Process integration request through the appropriate plugin
   */
  static async processIntegrationRequest(
    integrationName: string,
    request: IntegrationRequest,
    requestId: string
  ): Promise<IntegrationResponse> {
    const plugin = IntegrationRegistry.getPlugin(integrationName);
    
    if (!plugin) {
      return {
        success: false,
        data: null,
        format: 'error',
        metadata: {
          integration: integrationName,
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId
        },
        error: `Integration plugin '${integrationName}' not found`
      };
    }

    try {
      // Validate request
      if (!plugin.validateRequest(request)) {
        return {
          success: false,
          data: null,
          format: 'error',
          metadata: {
            integration: integrationName,
            version: plugin.config.version,
            timestamp: new Date().toISOString(),
            requestId
          },
          error: 'Invalid request format or parameters'
        };
      }

      // Process request through plugin
      const response = await plugin.processRequest(request);
      
      // Ensure metadata is properly set
      response.metadata = {
        ...response.metadata,
        requestId,
        timestamp: new Date().toISOString()
      };

      return response;

    } catch (error) {
      console.error(`Integration ${integrationName} failed:`, error);
      
      return {
        success: false,
        data: null,
        format: 'error',
        metadata: {
          integration: integrationName,
          version: plugin.config.version,
          timestamp: new Date().toISOString(),
          requestId
        },
        error: error instanceof Error ? error.message : 'Integration processing failed'
      };
    }
  }

  /**
   * Get integration capabilities and supported features
   */
  static getIntegrationCapabilities(): Record<string, IntegrationConfig> {
    const capabilities: Record<string, IntegrationConfig> = {};
    
    IntegrationRegistry.getAllPlugins().forEach(plugin => {
      capabilities[plugin.config.name] = plugin.config;
    });

    return capabilities;
  }

  /**
   * Validate integration request format
   */
  static validateIntegrationRequest(request: IntegrationRequest): boolean {
    return !!(
      request.type &&
      request.userContext &&
      request.userContext.userId &&
      typeof request.parameters === 'object'
    );
  }
}

// Standard Response Formatters
export class ResponseFormatters {
  /**
   * Format response for Raycast integration
   */
  static formatForRaycast(data: any, type: string): any {
    switch (type) {
      case 'daily_forecast':
        return this.formatDailyForecastForRaycast(data);
      case 'weekly_forecast':
        return this.formatWeeklyForecastForRaycast(data);
      case 'energy_check':
        return this.formatEnergyCheckForRaycast(data);
      case 'quick_summary':
        return this.formatQuickSummaryForRaycast(data);
      default:
        return this.formatGenericForRaycast(data);
    }
  }

  private static formatDailyForecastForRaycast(forecast: DailyForecast): any {
    const energyIcon = forecast.energyProfile.overallEnergy === 'high' ? '🔥' : 
                      forecast.energyProfile.overallEnergy === 'medium' ? '⚡' : '🔋';
    
    return {
      title: `Daily Forecast - ${forecast.date}`,
      subtitle: `${energyIcon} ${forecast.energyProfile.overallEnergy.toUpperCase()} energy`,
      accessories: [
        { text: forecast.energyProfile.overallEnergy, icon: energyIcon }
      ],
      detail: {
        markdown: this.generateDailyMarkdown(forecast)
      },
      actions: [
        { title: 'View Details', icon: '📊' },
        { title: 'Copy Summary', icon: '📋' }
      ]
    };
  }

  private static formatWeeklyForecastForRaycast(forecast: WeeklyForecast): any {
    return {
      title: `Weekly Forecast - ${forecast.weekStart}`,
      subtitle: forecast.weeklyInsights.weeklyTheme,
      accessories: [
        { text: forecast.dominantThemes[0] || 'Growth', icon: '🎯' }
      ],
      detail: {
        markdown: this.generateWeeklyMarkdown(forecast)
      },
      actions: [
        { title: 'View Daily Breakdown', icon: '📊' },
        { title: 'Copy Weekly Summary', icon: '📋' }
      ]
    };
  }

  private static formatEnergyCheckForRaycast(data: any): any {
    const energyLevel = data.energyProfile?.overallEnergy || 'medium';
    const energyIcon = energyLevel === 'high' ? '🔥' : energyLevel === 'medium' ? '⚡' : '🔋';
    
    return {
      title: `Energy Check: ${energyLevel.toUpperCase()}`,
      subtitle: data.summary || 'Current energy status',
      accessories: [
        { text: energyLevel, icon: energyIcon }
      ],
      detail: {
        markdown: `# Energy Check\n\n${data.details || 'Energy analysis not available'}`
      },
      actions: [
        { title: 'Optimal Timing', icon: '⏰' },
        { title: 'Energy Tips', icon: '💡' }
      ]
    };
  }

  private static formatQuickSummaryForRaycast(data: any): any {
    return {
      title: data.title || 'WitnessOS Summary',
      subtitle: data.subtitle || 'Daily guidance',
      accessories: data.accessories || [],
      detail: {
        markdown: data.markdown || '# Summary\n\nNo details available'
      },
      actions: data.actions || [
        { title: 'View Full Report', icon: '📊' }
      ]
    };
  }

  private static formatGenericForRaycast(data: any): any {
    return {
      title: data.title || 'WitnessOS',
      subtitle: data.subtitle || 'Consciousness insights',
      accessories: data.accessories || [],
      detail: {
        markdown: data.markdown || JSON.stringify(data, null, 2)
      },
      actions: [
        { title: 'View Details', icon: '📊' }
      ]
    };
  }

  /**
   * Format response for Slack integration
   */
  static formatForSlack(data: any, type: string): any {
    return {
      response_type: 'in_channel',
      text: data.title || 'WitnessOS Update',
      attachments: [
        {
          color: 'good',
          title: data.subtitle || 'Consciousness Insights',
          text: data.summary || 'Daily guidance and energy insights',
          fields: data.fields || [],
          footer: 'WitnessOS',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
  }

  /**
   * Format response for Discord integration
   */
  static formatForDiscord(data: any, type: string): any {
    return {
      embeds: [
        {
          title: data.title || 'WitnessOS Update',
          description: data.summary || 'Daily consciousness insights',
          color: 0x00ff00,
          fields: data.fields || [],
          footer: {
            text: 'WitnessOS',
            icon_url: 'https://witnessos.com/icon.png'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  /**
   * Format response for webhook integration
   */
  static formatForWebhook(data: any, type: string): any {
    return {
      event: type,
      data,
      timestamp: new Date().toISOString(),
      source: 'witnessos'
    };
  }

  // Helper methods for markdown generation
  private static generateDailyMarkdown(forecast: DailyForecast): string {
    let markdown = `# Daily Forecast - ${forecast.date}\n\n`;
    markdown += `**Energy Level:** ${forecast.energyProfile.overallEnergy.toUpperCase()}\n`;
    markdown += `**Trend:** ${forecast.energyProfile.trend}\n\n`;
    
    if (forecast.recommendations.length > 0) {
      markdown += `## Recommendations\n`;
      forecast.recommendations.slice(0, 3).forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }
    
    return markdown;
  }

  private static generateWeeklyMarkdown(forecast: WeeklyForecast): string {
    let markdown = `# Weekly Forecast\n\n`;
    markdown += `**Theme:** ${forecast.weeklyInsights.weeklyTheme}\n\n`;
    
    if (forecast.opportunities.length > 0) {
      markdown += `## Opportunities\n`;
      forecast.opportunities.forEach(opp => {
        markdown += `- ${opp}\n`;
      });
    }
    
    return markdown;
  }
}

// Webhook System (Future Implementation)
export interface WebhookConfig {
  url: string;
  events: string[];
  headers?: Record<string, string>;
  retryAttempts: number;
  timeout: number;
}

export class WebhookManager {
  private static webhooks: Map<string, WebhookConfig> = new Map();

  static registerWebhook(id: string, config: WebhookConfig): void {
    this.webhooks.set(id, config);
  }

  static async triggerWebhook(event: string, data: any): Promise<void> {
    const relevantWebhooks = Array.from(this.webhooks.entries())
      .filter(([_, config]) => config.events.includes(event));

    await Promise.all(
      relevantWebhooks.map(([id, config]) => 
        this.sendWebhook(id, config, event, data)
      )
    );
  }

  private static async sendWebhook(
    id: string, 
    config: WebhookConfig, 
    event: string, 
    data: any
  ): Promise<void> {
    try {
      const payload = ResponseFormatters.formatForWebhook(data, event);
      
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`Webhook ${id} failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Webhook ${id} error:`, error);
    }
  }
}

// Raycast Plugin Implementation
export class RaycastPlugin implements IntegrationPlugin {
  config: IntegrationConfig = {
    name: 'raycast',
    version: '1.0.0',
    apiVersion: '1.0',
    supportedFeatures: [
      'daily_forecast',
      'weekly_forecast',
      'energy_check',
      'optimal_timing',
      'quick_summary'
    ],
    responseFormat: 'raycast',
    authentication: {
      type: 'bearer',
      required: true
    }
  };

  async initialize(): Promise<void> {
    console.log('🚀 Raycast integration plugin initialized');
  }

  async processRequest(request: IntegrationRequest): Promise<IntegrationResponse> {
    const { type, parameters } = request;

    try {
      let data: any;

      switch (type) {
        case 'daily_forecast':
          data = await this.processDailyForecast(parameters);
          break;
        case 'weekly_forecast':
          data = await this.processWeeklyForecast(parameters);
          break;
        case 'energy_check':
          data = await this.processEnergyCheck(parameters);
          break;
        case 'optimal_timing':
          data = await this.processOptimalTiming(parameters);
          break;
        case 'quick_summary':
          data = await this.processQuickSummary(parameters);
          break;
        default:
          throw new Error(`Unsupported request type: ${type}`);
      }

      const formattedData = this.formatResponse(data, type);

      return {
        success: true,
        data: formattedData,
        format: 'raycast',
        metadata: {
          integration: this.config.name,
          version: this.config.version,
          timestamp: new Date().toISOString(),
          requestId: request.metadata?.requestId || 'unknown'
        }
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        format: 'error',
        metadata: {
          integration: this.config.name,
          version: this.config.version,
          timestamp: new Date().toISOString(),
          requestId: request.metadata?.requestId || 'unknown'
        },
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }

  formatResponse(data: any, type: string): any {
    return ResponseFormatters.formatForRaycast(data, type);
  }

  validateRequest(request: IntegrationRequest): boolean {
    return !!(
      request.type &&
      this.config.supportedFeatures.includes(request.type) &&
      request.userContext?.userId
    );
  }

  private async processDailyForecast(parameters: any): Promise<any> {
    // This would integrate with the actual forecast generation
    // For now, return a mock response structure
    return {
      date: parameters.date || new Date().toISOString().split('T')[0],
      energyProfile: {
        overallEnergy: 'high',
        trend: 'ascending'
      },
      recommendations: [
        'Take advantage of high energy for important tasks',
        'Schedule challenging activities during peak hours'
      ]
    };
  }

  private async processWeeklyForecast(parameters: any): Promise<any> {
    return {
      weekStart: parameters.weekStart || new Date().toISOString().split('T')[0],
      weeklyInsights: {
        weeklyTheme: 'Growth and Expansion'
      },
      dominantThemes: ['Energy Management', 'Personal Growth'],
      opportunities: ['High energy period for new projects']
    };
  }

  private async processEnergyCheck(parameters: any): Promise<any> {
    return {
      energyProfile: {
        overallEnergy: 'medium'
      },
      summary: 'Balanced energy with steady progress potential',
      details: 'Current biorhythm cycles support moderate activity levels'
    };
  }

  private async processOptimalTiming(parameters: any): Promise<any> {
    return {
      title: 'Optimal Timing',
      subtitle: 'Peak energy: Morning',
      bestHours: ['9:00-12:00', '14:00-16:00'],
      recommendations: ['Schedule important tasks during peak hours']
    };
  }

  private async processQuickSummary(parameters: any): Promise<any> {
    return {
      title: 'Daily Summary',
      subtitle: 'High energy day with growth potential',
      markdown: '# Daily Summary\n\nToday presents excellent opportunities for progress and achievement.',
      actions: [
        { title: 'View Full Forecast', icon: '📊' },
        { title: 'Energy Tips', icon: '💡' }
      ]
    };
  }
}

// Auto-register the Raycast plugin
IntegrationRegistry.registerPlugin('raycast', new RaycastPlugin());
