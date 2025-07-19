/**
 * WitnessOS Enhanced API Worker Entry Point
 * 
 * Main entry point for the enhanced microservice architecture
 * using Cloudflare-native features including Workflows, Durable Objects,
 * and Service Bindings for optimal performance and reliability.
 */

import { EnhancedAPIRouter } from './enhanced-api-router';

// Export Durable Object classes
export { EngineCoordinator } from '../durable-objects/engine-coordinator';
export { ForecastSession } from '../durable-objects/forecast-session';

// Export Workflow classes
export { ConsciousnessWorkflow } from '../workflows/consciousness-workflow';
export { IntegrationWorkflow } from '../workflows/integration-workflow';

// Main fetch handler
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const router = new EnhancedAPIRouter(env);
    return await router.route(request);
  }
};
