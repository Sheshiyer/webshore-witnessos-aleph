/**
 * Raycast Integration Handlers Index
 *
 * Exports all Raycast integration handlers for easy importing and usage
 */

export { RaycastHandler } from './raycast-handler';

// Re-export types for convenience
export type {
  RaycastRequest,
  RaycastResponse
} from './raycast-handler';

// Factory function to create Raycast handler
import { HandlerEnvironment } from '../base/base-handler';
import { RaycastHandler } from './raycast-handler';

/**
 * Create a Raycast integration handler
 */
export function createRaycastHandler(env: HandlerEnvironment): RaycastHandler {
  return new RaycastHandler(env);
}

/**
 * Get available Raycast endpoints
 */
export function getRaycastEndpoints(): string[] {
  return [
    '/raycast/daily-forecast',
    '/raycast/quick-reading',
    '/raycast/daily-guidance'
  ];
}

/**
 * Check if a path is a Raycast endpoint
 */
export function isRaycastEndpoint(path: string): boolean {
  return getRaycastEndpoints().includes(path);
}
