/**
 * Integration Workflow for WitnessOS
 * 
 * Cloudflare Workflow that handles external integrations like Raycast,
 * webhooks, and third-party services with durable execution, retry logic,
 * and state persistence for reliable integration processing.
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

// Environment interface for the workflow
interface IntegrationWorkflowEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  KV_INTEGRATIONS: KVNamespace;
  FORECAST_SERVICE: any; // RPC binding to forecast service
  ENGINE_SERVICE: any; // RPC binding to engine service
  AI_SERVICE: any; // RPC binding to AI service
}

// Workflow parameters for different integration types
interface IntegrationWorkflowParams {
  integrationType: 'raycast' | 'webhook' | 'api_sync' | 'scheduled_report';
  userProfile: {
    userId: string;
    email?: string;
    preferences?: any;
  };
  integrationConfig: {
    // Raycast specific
    raycastUserId?: string;
    forecastType?: 'daily' | 'weekly';
    
    // Webhook specific
    webhookUrl?: string;
    webhookSecret?: string;
    eventType?: string;
    
    // API sync specific
    targetApi?: string;
    syncType?: 'full' | 'incremental';
    
    // Scheduled report specific
    reportType?: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
    format?: 'json' | 'pdf' | 'email';
  };
  options?: {
    retryOnFailure?: boolean;
    maxRetries?: number;
    notifyOnCompletion?: boolean;
    saveResults?: boolean;
  };
}

// Integration result types
interface IntegrationResult {
  integrationType: string;
  status: 'success' | 'partial' | 'failed';
  results: any;
  errors?: string[];
  metadata: {
    workflowId: string;
    startTime: string;
    completionTime: string;
    duration: number;
    retryCount: number;
    version: string;
  };
}

/**
 * Integration Workflow Entrypoint
 * 
 * Orchestrates external integrations with durable execution,
 * automatic retry logic, and comprehensive error handling.
 */
export class IntegrationWorkflow extends WorkflowEntrypoint<IntegrationWorkflowEnv, IntegrationWorkflowParams> {
  /**
   * Main workflow execution method
   */
  async run(
    event: WorkflowEvent<IntegrationWorkflowParams>, 
    step: WorkflowStep
  ): Promise<IntegrationResult> {
    const { integrationType, userProfile, integrationConfig, options = {} } = event.payload;
    const startTime = new Date().toISOString();
    let retryCount = 0;
    
    console.log(`Starting ${integrationType} integration workflow for user ${userProfile.userId}`);

    // Step 1: Validate integration configuration
    await step.do('validate-integration-config', {
      retries: { limit: 1, delay: '2 seconds' },
      timeout: '30 seconds'
    }, async () => {
      return await this.validateIntegrationConfig(integrationType, integrationConfig);
    });

    // Step 2: Prepare integration data
    const integrationData = await step.do('prepare-integration-data', {
      retries: { limit: 2, delay: '5 seconds', backoff: 'exponential' },
      timeout: '2 minutes'
    }, async () => {
      return await this.prepareIntegrationData(integrationType, userProfile, integrationConfig);
    });

    // Step 3: Execute integration with retry logic
    const integrationResults = await step.do('execute-integration', {
      retries: { 
        limit: options.maxRetries || 3, 
        delay: '10 seconds', 
        backoff: 'exponential' 
      },
      timeout: '5 minutes'
    }, async () => {
      retryCount++;
      return await this.executeIntegration(
        integrationType, 
        integrationData, 
        integrationConfig, 
        retryCount
      );
    });

    // Step 4: Process and format results
    const processedResults = await step.do('process-results', {
      retries: { limit: 2, delay: '5 seconds' },
      timeout: '1 minute'
    }, async () => {
      return await this.processIntegrationResults(
        integrationType, 
        integrationResults, 
        integrationConfig
      );
    });

    // Step 5: Save results if requested
    if (options.saveResults) {
      await step.do('save-integration-results', {
        retries: { limit: 2, delay: '3 seconds' },
        timeout: '30 seconds'
      }, async () => {
        return await this.saveIntegrationResults(
          event.id,
          integrationType,
          userProfile,
          processedResults
        );
      });
    }

    // Step 6: Send notifications if requested
    if (options.notifyOnCompletion) {
      await step.do('send-notifications', {
        retries: { limit: 2, delay: '5 seconds' },
        timeout: '1 minute'
      }, async () => {
        return await this.sendCompletionNotifications(
          integrationType,
          userProfile,
          processedResults,
          integrationConfig
        );
      });
    }

    // Construct final result
    const completionTime = new Date().toISOString();
    const duration = Date.now() - new Date(startTime).getTime();

    const result: IntegrationResult = {
      integrationType,
      status: this.determineOverallStatus(processedResults),
      results: processedResults,
      errors: this.extractErrors(processedResults),
      metadata: {
        workflowId: event.id,
        startTime,
        completionTime,
        duration,
        retryCount,
        version: '2.0'
      }
    };

    console.log(`Completed ${integrationType} integration workflow in ${duration}ms`);
    
    return result;
  }

  /**
   * Validate integration configuration
   */
  private async validateIntegrationConfig(
    integrationType: string,
    config: any
  ): Promise<void> {
    switch (integrationType) {
      case 'raycast':
        if (!config.raycastUserId || !config.forecastType) {
          throw new Error('Raycast integration requires raycastUserId and forecastType');
        }
        break;
        
      case 'webhook':
        if (!config.webhookUrl || !config.eventType) {
          throw new Error('Webhook integration requires webhookUrl and eventType');
        }
        // Validate webhook URL format
        try {
          new URL(config.webhookUrl);
        } catch {
          throw new Error('Invalid webhook URL format');
        }
        break;
        
      case 'api_sync':
        if (!config.targetApi || !config.syncType) {
          throw new Error('API sync integration requires targetApi and syncType');
        }
        break;
        
      case 'scheduled_report':
        if (!config.reportType || !config.recipients?.length) {
          throw new Error('Scheduled report requires reportType and recipients');
        }
        break;
        
      default:
        throw new Error(`Unknown integration type: ${integrationType}`);
    }
  }

  /**
   * Prepare data for integration
   */
  private async prepareIntegrationData(
    integrationType: string,
    userProfile: any,
    config: any
  ): Promise<any> {
    const data: any = {
      userProfile,
      timestamp: new Date().toISOString()
    };

    switch (integrationType) {
      case 'raycast':
        // Generate forecast data for Raycast
        if (config.forecastType === 'daily') {
          const today = new Date().toISOString().split('T')[0];
          const forecast = await this.env.FORECAST_SERVICE.generateRaycastForecast({
            userProfile,
            type: 'daily',
            date: today
          });
          data.forecast = forecast;
        } else if (config.forecastType === 'weekly') {
          const weekStart = this.getWeekStartDate();
          const forecast = await this.env.FORECAST_SERVICE.generateRaycastForecast({
            userProfile,
            type: 'weekly',
            startDate: weekStart
          });
          data.forecast = forecast;
        }
        break;
        
      case 'webhook':
        // Prepare webhook payload based on event type
        data.eventType = config.eventType;
        if (config.eventType === 'forecast_ready') {
          // Include latest forecast
          const today = new Date().toISOString().split('T')[0];
          const forecast = await this.env.FORECAST_SERVICE.generateDailyForecast({
            userProfile,
            date: today,
            options: { useCache: true }
          });
          data.payload = forecast;
        }
        break;
        
      case 'api_sync':
        // Prepare data for API synchronization
        data.syncType = config.syncType;
        if (config.syncType === 'full') {
          // Get complete user profile and recent calculations
          data.fullProfile = await this.getUserFullProfile(userProfile.userId);
        }
        break;
        
      case 'scheduled_report':
        // Generate report data
        data.reportData = await this.generateReportData(
          userProfile,
          config.reportType
        );
        break;
    }

    return data;
  }

  /**
   * Execute the actual integration
   */
  private async executeIntegration(
    integrationType: string,
    data: any,
    config: any,
    retryCount: number
  ): Promise<any> {
    console.log(`Executing ${integrationType} integration (attempt ${retryCount})`);

    switch (integrationType) {
      case 'raycast':
        return await this.executeRaycastIntegration(data, config);
        
      case 'webhook':
        return await this.executeWebhookIntegration(data, config);
        
      case 'api_sync':
        return await this.executeApiSyncIntegration(data, config);
        
      case 'scheduled_report':
        return await this.executeScheduledReportIntegration(data, config);
        
      default:
        throw new Error(`Integration execution not implemented for: ${integrationType}`);
    }
  }

  /**
   * Execute Raycast integration
   */
  private async executeRaycastIntegration(data: any, config: any): Promise<any> {
    // Format data for Raycast extension
    const raycastData = {
      userId: config.raycastUserId,
      type: config.forecastType,
      forecast: data.forecast,
      timestamp: data.timestamp,
      metadata: {
        source: 'witnessos',
        version: '2.0'
      }
    };

    // Store in KV for Raycast extension to retrieve
    const cacheKey = `raycast:${config.raycastUserId}:${config.forecastType}`;
    await this.env.KV_INTEGRATIONS.put(
      cacheKey,
      JSON.stringify(raycastData),
      { expirationTtl: 86400 } // 24 hours
    );

    return {
      success: true,
      cacheKey,
      data: raycastData
    };
  }

  /**
   * Execute webhook integration
   */
  private async executeWebhookIntegration(data: any, config: any): Promise<any> {
    const webhookPayload = {
      eventType: config.eventType,
      userId: data.userProfile.userId,
      timestamp: data.timestamp,
      data: data.payload
    };

    // Add webhook signature if secret is provided
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'WitnessOS-Webhook/2.0'
    };

    if (config.webhookSecret) {
      const signature = await this.generateWebhookSignature(
        JSON.stringify(webhookPayload),
        config.webhookSecret
      );
      headers['X-WitnessOS-Signature'] = signature;
    }

    // Send webhook
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      status: response.status,
      response: await response.text()
    };
  }

  /**
   * Execute API sync integration
   */
  private async executeApiSyncIntegration(data: any, config: any): Promise<any> {
    // This is a placeholder - implement based on specific API requirements
    console.log(`API sync to ${config.targetApi} not yet implemented`);
    
    return {
      success: false,
      error: 'API sync integration not yet implemented'
    };
  }

  /**
   * Execute scheduled report integration
   */
  private async executeScheduledReportIntegration(data: any, config: any): Promise<any> {
    const report = {
      reportType: config.reportType,
      userId: data.userProfile.userId,
      generatedAt: data.timestamp,
      data: data.reportData,
      format: config.format || 'json'
    };

    // Store report
    const reportKey = `report:${data.userProfile.userId}:${config.reportType}:${Date.now()}`;
    await this.env.KV_INTEGRATIONS.put(
      reportKey,
      JSON.stringify(report),
      { expirationTtl: 2592000 } // 30 days
    );

    // Send to recipients (placeholder - implement email/notification service)
    const deliveryResults = [];
    for (const recipient of config.recipients) {
      deliveryResults.push({
        recipient,
        status: 'pending', // Would be 'sent' or 'failed' in real implementation
        message: 'Email delivery not yet implemented'
      });
    }

    return {
      success: true,
      reportKey,
      deliveryResults
    };
  }

  /**
   * Process integration results
   */
  private async processIntegrationResults(
    integrationType: string,
    results: any,
    config: any
  ): Promise<any> {
    // Add processing timestamp and metadata
    const processedResults = {
      ...results,
      processedAt: new Date().toISOString(),
      integrationType,
      config: {
        // Include safe config data (no secrets)
        ...config,
        webhookSecret: config.webhookSecret ? '[REDACTED]' : undefined
      }
    };

    // Integration-specific post-processing
    switch (integrationType) {
      case 'raycast':
        // Add Raycast-specific metadata
        processedResults.raycastMetadata = {
          cacheExpiry: new Date(Date.now() + 86400000).toISOString(),
          refreshUrl: `https://api.witnessos.com/integrations/raycast/${config.raycastUserId}/refresh`
        };
        break;
        
      case 'webhook':
        // Validate webhook response
        if (results.success && results.status >= 200 && results.status < 300) {
          processedResults.validated = true;
        } else {
          processedResults.validated = false;
          processedResults.warning = 'Webhook may not have been processed successfully';
        }
        break;
    }

    return processedResults;
  }

  /**
   * Save integration results
   */
  private async saveIntegrationResults(
    workflowId: string,
    integrationType: string,
    userProfile: any,
    results: any
  ): Promise<void> {
    try {
      await this.env.DB.prepare(`
        INSERT INTO integration_results (
          workflow_id, user_id, integration_type, results, created_at
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        workflowId,
        userProfile.userId,
        integrationType,
        JSON.stringify(results),
        new Date().toISOString()
      ).run();

      console.log(`Saved integration results for workflow ${workflowId}`);
    } catch (error) {
      console.error('Failed to save integration results:', error);
      // Don't throw - saving is not critical
    }
  }

  /**
   * Send completion notifications
   */
  private async sendCompletionNotifications(
    integrationType: string,
    userProfile: any,
    results: any,
    config: any
  ): Promise<void> {
    // Placeholder for notification implementation
    console.log(`Would send ${integrationType} completion notification to ${userProfile.email}`);
  }

  /**
   * Helper methods
   */

  private async getUserFullProfile(userId: string): Promise<any> {
    // Get complete user profile from database
    const profile = await this.env.DB.prepare(`
      SELECT * FROM user_profiles WHERE user_id = ?
    `).bind(userId).first();

    return profile;
  }

  private async generateReportData(userProfile: any, reportType: string): Promise<any> {
    // Generate report data based on type
    const reportData: any = {
      userProfile,
      reportType,
      generatedAt: new Date().toISOString()
    };

    if (reportType === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      const forecast = await this.env.FORECAST_SERVICE.generateDailyForecast({
        userProfile,
        date: today,
        options: { useCache: true }
      });
      reportData.forecast = forecast;
    }

    return reportData;
  }

  private async generateWebhookSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `sha256=${hashHex}`;
  }

  private determineOverallStatus(results: any): 'success' | 'partial' | 'failed' {
    if (results.success) {
      return 'success';
    } else if (results.warning) {
      return 'partial';
    } else {
      return 'failed';
    }
  }

  private extractErrors(results: any): string[] | undefined {
    const errors: string[] = [];
    
    if (results.error) {
      errors.push(results.error);
    }
    
    if (results.deliveryResults) {
      for (const delivery of results.deliveryResults) {
        if (delivery.status === 'failed') {
          errors.push(`Delivery failed for ${delivery.recipient}: ${delivery.message}`);
        }
      }
    }
    
    return errors.length > 0 ? errors : undefined;
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
export default IntegrationWorkflow;
