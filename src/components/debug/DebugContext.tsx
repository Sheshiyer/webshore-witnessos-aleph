/**
 * Debug Context for WitnessOS Webshore Development
 *
 * Provides debug state management and layer navigation for development testing
 * Only active in development environment
 */

'use client';

import { LAYER_ENGINES } from '@/components/consciousness-engines';
import type { DiscoveryLayer } from '@/components/discovery-layers/DiscoveryLayerSystem';
import type { BreathState, ConsciousnessState } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface DebugState {
  isEnabled: boolean;
  isPanelVisible: boolean;
  currentLayer: DiscoveryLayer;
  layerHistory: DiscoveryLayer[];
  debugInfo: {
    consciousness: ConsciousnessState | null;
    breath: BreathState | null;
    performance: {
      fps: number;
      frameTime: number;
      triangleCount: number;
    };
    layerMetrics: {
      timeSpent: number;
      artifactsDiscovered: number;
      interactionCount: number;
    };
  };
  overrides: {
    forceLayer?: DiscoveryLayer;
    skipOnboarding?: boolean;
    mockBreathData?: boolean;
    enhancedVisuals?: boolean;
  };
}

export interface DebugContextType {
  debugState: DebugState;
  setCurrentLayer: (layer: DiscoveryLayer) => void;
  togglePanel: () => void;
  updateConsciousness: (consciousness: ConsciousnessState) => void;
  updateBreath: (breath: BreathState) => void;
  updatePerformance: (metrics: { fps: number; frameTime: number; triangleCount: number }) => void;
  setOverride: (key: keyof DebugState['overrides'], value: any) => void;
  resetDebugState: () => void;
  getLayerEngines: (layer: DiscoveryLayer) => string[];
  isDebugEnabled: () => boolean;
}

const DebugContext = createContext<DebugContextType | null>(null);

const initialDebugState: DebugState = {
  isEnabled: process.env.NODE_ENV === 'development',
  isPanelVisible: false,
  currentLayer: 0,
  layerHistory: [0],
  debugInfo: {
    consciousness: null,
    breath: null,
    performance: {
      fps: 0,
      frameTime: 0,
      triangleCount: 0,
    },
    layerMetrics: {
      timeSpent: 0,
      artifactsDiscovered: 0,
      interactionCount: 0,
    },
  },
  overrides: {},
};

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [debugState, setDebugState] = useState<DebugState>(initialDebugState);

  // Layer navigation
  const setCurrentLayer = useCallback(
    (layer: DiscoveryLayer) => {
      setDebugState(prev => {
        if (!prev.isEnabled) return prev;

        return {
          ...prev,
          currentLayer: layer,
          layerHistory: [...prev.layerHistory.slice(-9), layer], // Keep last 10 layers
          debugInfo: {
            ...prev.debugInfo,
            layerMetrics: {
              timeSpent: 0,
              artifactsDiscovered: 0,
              interactionCount: 0,
            },
          },
        };
      });
    },
    [] // No dependencies needed
  );

  // Panel visibility toggle
  const togglePanel = useCallback(() => {
    setDebugState(prev => {
      if (!prev.isEnabled) return prev;

      return {
        ...prev,
        isPanelVisible: !prev.isPanelVisible,
      };
    });
  }, []); // No dependencies needed

  // Update debug information
  const updateConsciousness = useCallback(
    (consciousness: ConsciousnessState) => {
      setDebugState(prev => {
        if (!prev.isEnabled) return prev;

        return {
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            consciousness,
          },
        };
      });
    },
    [] // No dependencies needed
  );

  const updateBreath = useCallback(
    (breath: BreathState) => {
      setDebugState(prev => {
        if (!prev.isEnabled) return prev;

        return {
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            breath,
          },
        };
      });
    },
    [] // No dependencies needed
  );

  const updatePerformance = useCallback(
    (metrics: { fps: number; frameTime: number; triangleCount: number }) => {
      setDebugState(prev => {
        if (!prev.isEnabled) return prev;

        return {
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            performance: metrics,
          },
        };
      });
    },
    [] // No dependencies needed
  );

  // Override management
  const setOverride = useCallback(
    (key: keyof DebugState['overrides'], value: any) => {
      setDebugState(prev => {
        if (!prev.isEnabled) return prev;

        return {
          ...prev,
          overrides: {
            ...prev.overrides,
            [key]: value,
          },
        };
      });
    },
    [] // No dependencies needed
  );

  // Reset debug state
  const resetDebugState = useCallback(() => {
    setDebugState(prev => {
      if (!prev.isEnabled) return prev;
      return initialDebugState;
    });
  }, []); // No dependencies needed

  // Get engines for a specific layer
  const getLayerEngines = useCallback((layer: DiscoveryLayer): string[] => {
    return LAYER_ENGINES[layer] || [];
  }, []);

  // Check if debug is enabled
  const isDebugEnabled = useCallback(() => {
    return debugState.isEnabled;
  }, [debugState.isEnabled]); // Keep this dependency as it's needed for the return value

  // Keyboard shortcuts
  useEffect(() => {
    if (!debugState.isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + D to toggle debug panel
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        togglePanel();
      }

      // Number keys 0-3 to switch layers (when panel is visible)
      if (debugState.isPanelVisible && event.key >= '0' && event.key <= '3') {
        event.preventDefault();
        const layer = parseInt(event.key) as DiscoveryLayer;
        setCurrentLayer(layer);
      }

      // Escape to close panel
      if (event.key === 'Escape' && debugState.isPanelVisible) {
        event.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugState.isEnabled, debugState.isPanelVisible]); // Removed callback dependencies to prevent re-renders

  // Update layer metrics timer
  useEffect(() => {
    if (!debugState.isEnabled) return;

    const interval = setInterval(() => {
      setDebugState(prev => ({
        ...prev,
        debugInfo: {
          ...prev.debugInfo,
          layerMetrics: {
            ...prev.debugInfo.layerMetrics,
            timeSpent: prev.debugInfo.layerMetrics.timeSpent + 1,
          },
        },
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [debugState.isEnabled]); // Removed debugState.currentLayer to prevent infinite re-renders

  const contextValue: DebugContextType = {
    debugState,
    setCurrentLayer,
    togglePanel,
    updateConsciousness,
    updateBreath,
    updatePerformance,
    setOverride,
    resetDebugState,
    getLayerEngines,
    isDebugEnabled,
  };

  return <DebugContext.Provider value={contextValue}>{children}</DebugContext.Provider>;
};

export const useDebug = (): DebugContextType => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

export default DebugContext;
