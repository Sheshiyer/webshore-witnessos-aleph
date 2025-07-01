/**
 * Debug Components for WitnessOS Webshore
 * 
 * Development-only debug interface for consciousness layer navigation and testing
 */

export { DebugProvider, useDebug } from './DebugContext';
export { UnifiedDebugSystem } from './UnifiedDebugSystem';

// Component exports
export { default as DebugToggleButton } from './DebugToggleButton';
export { default as DebugNavigationPanel } from './DebugNavigationPanel';
export { default as DebugContext } from './DebugContext';
export { default as BackendConnectionTest } from './BackendConnectionTest';
export { default as AdminDebugPanel } from './AdminDebugPanel';
export { default as AdminDebugPanelWrapper } from './AdminDebugPanelWrapper';
export { default as UnifiedAdminDebugSystem } from './UnifiedAdminDebugSystem';

// Re-export types
export type { DebugState, DebugContextType } from './DebugContext';
