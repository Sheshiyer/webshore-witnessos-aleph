/**
 * Workflow Handlers Index
 *
 * Exports all workflow handlers for easy importing and usage
 */

export { BaseWorkflowHandler } from './workflow-handler';
export { NatalHandler } from './natal-handler';
export { CareerHandler } from './career-handler';
export { SpiritualHandler } from './spiritual-handler';

// Re-export types for convenience
export type {
  WorkflowRequest,
  WorkflowResult,
  EngineCalculationResult
} from './workflow-handler';

// Factory function to create workflow handlers
import { HandlerEnvironment } from '../base/base-handler';
import { NatalHandler } from './natal-handler';
import { CareerHandler } from './career-handler';
import { SpiritualHandler } from './spiritual-handler';

/**
 * Create a workflow handler based on the workflow type
 */
export function createWorkflowHandler(workflowType: string, env: HandlerEnvironment) {
  switch (workflowType.toLowerCase()) {
    case 'natal':
      return new NatalHandler(env);
    case 'career':
      return new CareerHandler(env);
    case 'spiritual':
      return new SpiritualHandler(env);
    default:
      throw new Error(`Unknown workflow type: ${workflowType}`);
  }
}

/**
 * Get all available workflow types
 */
export function getAvailableWorkflowTypes(): string[] {
  return ['natal', 'career', 'spiritual'];
}

/**
 * Check if a workflow type is supported
 */
export function isWorkflowTypeSupported(workflowType: string): boolean {
  return getAvailableWorkflowTypes().includes(workflowType.toLowerCase());
}
