/**
 * Debug Components for WitnessOS Webshore
 * 
 * Development-only debug interface for consciousness layer navigation and testing
 */

export { DebugProvider, useDebug } from './DebugContext';
export { DebugNavigationPanel } from './DebugNavigationPanel';
export { DebugToggleButton } from './DebugToggleButton';

// Re-export types
export type { DebugState, DebugContextType } from './DebugContext';
