/**
 * Spiritual Development Workflow Handler for WitnessOS API
 *
 * Handles spiritual development workflows that combine multiple consciousness
 * engines to provide growth-oriented analysis and transformational insights.
 */

import { BaseWorkflowHandler, WorkflowRequest, WorkflowResult } from './workflow-handler';
import { HandlerEnvironment } from '../base/base-handler';
import type { EngineName } from '../../types/engines';

export class SpiritualHandler extends BaseWorkflowHandler {
  constructor(env: HandlerEnvironment) {
    super(env);
  }

  /**
   * Get the workflow type
   */
  getWorkflowType(): string {
    return 'spiritual';
  }

  /**
   * Get the engines used for spiritual development
   */
  getWorkflowEngines(): EngineName[] {
    return ['numerology', 'vimshottari', 'iching', 'gene_keys'];
  }

  /**
   * Handle spiritual workflow requests
   */
  async handle(request: Request, requestId?: string): Promise<Response> {
    const reqId = requestId || this.generateRequestId();

    // Handle CORS preflight
    const corsResponse = this.handleCORS(request);
    if (corsResponse) return corsResponse;

    // Only allow POST method
    if (request.method !== 'POST') {
      return this.createErrorResponse(405, 'METHOD_NOT_ALLOWED', 'Only POST method allowed for spiritual workflows', reqId);
    }

    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for spiritual workflows', reqId);
      }

      // Parse and validate request body
      const requestData = await this.parseJsonBody(request) as WorkflowRequest;

      // Validate required fields
      if (!requestData.userProfile) {
        return this.createErrorResponse(400, 'MISSING_USER_PROFILE', 'userProfile is required', reqId);
      }

      if (!requestData.userProfile.birthDate || !requestData.userProfile.birthTime || !requestData.userProfile.birthLocation) {
        return this.createErrorResponse(400, 'MISSING_BIRTH_DATA', 'Complete birth data (date, time, location) is required for spiritual analysis', reqId);
      }

      // Validate birth date format
      if (!this.isValidDate(requestData.userProfile.birthDate)) {
        return this.createErrorResponse(400, 'INVALID_BIRTH_DATE', 'Birth date must be in YYYY-MM-DD format', reqId);
      }

      // Set default options for spiritual development
      const options = {
        depth: 'comprehensive' as const,
        includeForecast: true,
        includeGuidance: true,
        saveResults: true,
        useCache: true,
        ...requestData.options
      };

      // Execute the spiritual workflow
      const workflowRequest: WorkflowRequest = {
        userProfile: requestData.userProfile,
        options
      };

      const result: WorkflowResult = await this.executeWorkflow(workflowRequest, reqId);

      return this.createResponse(200, {}, {
        success: true,
        workflow: result,
        requestId: reqId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${reqId}] Spiritual workflow error:`, error);
      return this.createErrorResponse(500, 'WORKFLOW_FAILED', 'Spiritual workflow execution failed', reqId);
    }
  }
}
