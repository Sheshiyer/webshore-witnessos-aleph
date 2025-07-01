/**
 * WitnessOS API Integration Hook
 *
 * React hook for consciousness engine calculations
 * Integrates with fractal visualization and breath synchronization
 */

'use client';

import type {
  ConsciousnessError,
  EngineAPIResponse,
  EngineInput,
  EngineName,
  EngineOutput,
} from '@/types';
import { apiClient } from '@/utils/api-client';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useConsciousnessEngineAutoSave } from './useConsciousnessEngineAutoSave';

interface UseWitnessOSAPIOptions {
  autoTransform?: boolean;
  enableRetry?: boolean;
  onError?: (error: ConsciousnessError) => void;
  onSuccess?: (result: EngineOutput) => void;
}

interface APIState<T = EngineOutput> {
  data: T | null;
  loading: boolean;
  error: ConsciousnessError | null;
  lastCalculation: string | null;
}

interface UseWitnessOSAPIReturn {
  // State
  state: APIState;

  // Actions
  calculateEngine: <TInput extends EngineInput, TOutput extends EngineOutput>(
    engineName: EngineName,
    input: TInput
  ) => Promise<EngineAPIResponse<TOutput>>;

  calculateNumerology: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateHumanDesign: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateTarot: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateIChing: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateEnneagram: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateSacredGeometry: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateBiorhythm: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateVimshottari: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateGeneKeys: (input: any) => Promise<EngineAPIResponse<any>>;
  calculateSigilForge: (input: any) => Promise<EngineAPIResponse<any>>;

  batchCalculate: (
    requests: Array<{ engine: EngineName; input: EngineInput }>
  ) => Promise<EngineAPIResponse<EngineOutput[]>>;

  // Auth methods
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; token?: string; user?: any; error?: string }>;
  logout: (token: string) => Promise<{ success: boolean; error?: string }>;
  validateToken: (token: string) => Promise<{ success: boolean; user?: any; error?: string }>;

  // Utilities
  clearError: () => void;
  clearData: () => void;
  healthCheck: () => Promise<boolean>;

  // Status
  isConnected: boolean;
  availableEngines: EngineName[];

  // Auto-save functionality
  isAutoSaving: boolean;
  autoSaveError: ConsciousnessError | null;
  autoSaveCount: number;
  getAutoSaveStats: () => { total: number; successful: number; failed: number };
}

export const useWitnessOSAPI = (options: UseWitnessOSAPIOptions = {}): UseWitnessOSAPIReturn => {
  const { autoTransform = true, enableRetry = true, onError, onSuccess } = options;

  // State management
  const [state, setState] = useState<APIState>({
    data: null,
    loading: false,
    error: null,
    lastCalculation: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [availableEngines, setAvailableEngines] = useState<EngineName[]>([]);

  // Refs for tracking requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-save functionality for engine results
  const { 
    saveEngineResult, 
    isAutoSaving, 
    autoSaveError,
    autoSaveCount,
    getAutoSaveStats: getOriginalAutoSaveStats
  } = useConsciousnessEngineAutoSave({
    enabled: true,
    debounceMs: 2000,
    includeInput: true
  });

  // Health check function
  const healthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiClient.healthCheck();
      const connected = response.success;

      setIsConnected(connected);

      if (connected && response.data?.engines) {
        setAvailableEngines(response.data.engines as EngineName[]);
      }

      return connected;
    } catch (error) {
      setIsConnected(false);
      setAvailableEngines([]);
      return false;
    }
  }, []);

  // Initial connection check on mount
  useEffect(() => {
    const checkInitialConnection = async () => {
      try {
        console.log('🔍 Checking initial backend connection...');
        await healthCheck();
      } catch (error) {
        console.warn('⚠️ Initial connection check failed:', error);
        // Don't throw - just log the warning
      }
    };

    checkInitialConnection();
  }, [healthCheck]); // Include healthCheck in dependencies

  // Error handling utility
  const handleError = useCallback(
    (error: unknown, engine?: string): ConsciousnessError => {
      let consciousnessError: ConsciousnessError;

      if (error instanceof Error) {
        consciousnessError = {
          code: 'CALCULATION_ERROR',
          message: error.message,
          context: { engine },
          suggestions: [
            'Check your input data',
            'Ensure all required fields are provided',
            'Try a different calculation approach',
          ],
          timestamp: new Date().toISOString(),
        };
      } else {
        consciousnessError = {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: { engine, originalError: error },
          suggestions: [
            'Refresh the page',
            'Check the browser console for details',
            'Contact support if the issue persists',
          ],
          timestamp: new Date().toISOString(),
        };
      }

      setState(prev => ({ ...prev, error: consciousnessError, loading: false }));

      if (onError) {
        onError(consciousnessError);
      }

      return consciousnessError;
    },
    [onError]
  );

  // Generic calculation function
  const calculateEngine = useCallback(
    async <TInput extends EngineInput, TOutput extends EngineOutput>(
      engineName: EngineName,
      input: TInput
    ): Promise<EngineAPIResponse<TOutput>> => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        lastCalculation: engineName,
      }));

      try {
        // Make API call using the apiClient
        const response = await apiClient.calculateEngine(engineName, input);

        // Update connection status based on response
        if (response.success) {
          setIsConnected(true);
        } else if (response.error?.includes('Network') || response.error?.includes('fetch')) {
          setIsConnected(false);
        }

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data as TOutput,
            loading: false,
            error: null,
          }));

          if (onSuccess) {
            onSuccess(response.data as EngineOutput);
          }

          // Create proper EngineAPIResponse
          const engineResponse: EngineAPIResponse<TOutput> = {
            success: true,
            data: response.data as TOutput,
            timestamp: new Date().toISOString(),
            processingTime: 0, // TODO: Calculate actual processing time
          };

          return engineResponse;
        } else {
          throw new Error(response.error || 'Calculation failed');
        }
      } catch (error) {
        // Update connection status on network errors
        if (error instanceof Error && 
            (error.message.includes('Network') || error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
          setIsConnected(false);
        }
        
        handleError(error, engineName);
        throw error;
      }
    },
    [onSuccess, handleError]
  );

  // Specific engine calculation methods
  const calculateNumerology = useCallback(
    (input: any) => calculateEngine('numerology', input),
    [calculateEngine]
  );

  const calculateHumanDesign = useCallback(
    (input: any) => calculateEngine('human_design', input),
    [calculateEngine]
  );

  const calculateTarot = useCallback(
    (input: any) => calculateEngine('tarot', input),
    [calculateEngine]
  );

  const calculateIChing = useCallback(
    (input: any) => calculateEngine('iching', input),
    [calculateEngine]
  );

  const calculateEnneagram = useCallback(
    (input: any) => calculateEngine('enneagram', input),
    [calculateEngine]
  );

  const calculateSacredGeometry = useCallback(
    (input: any) => calculateEngine('sacred_geometry', input),
    [calculateEngine]
  );

  const calculateBiorhythm = useCallback(
    (input: any) => calculateEngine('biorhythm', input),
    [calculateEngine]
  );

  const calculateVimshottari = useCallback(
    (input: any) => calculateEngine('vimshottari', input),
    [calculateEngine]
  );

  const calculateGeneKeys = useCallback(
    (input: any) => calculateEngine('gene_keys', input),
    [calculateEngine]
  );

  const calculateSigilForge = useCallback(
    (input: any) => calculateEngine('sigil_forge', input),
    [calculateEngine]
  );

  // Batch calculation
  const batchCalculate = useCallback(
    async (
      requests: Array<{ engine: EngineName; input: EngineInput }>
    ): Promise<EngineAPIResponse<EngineOutput[]>> => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        lastCalculation: 'batch',
      }));

      try {
        const response = await apiClient.batchCalculate(requests);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data as unknown as EngineOutput,
            loading: false,
          }));

          // Create proper EngineAPIResponse
          const engineResponse: EngineAPIResponse<EngineOutput[]> = {
            success: true,
            data: response.data as EngineOutput[],
            timestamp: new Date().toISOString(),
            processingTime: 0,
          };

          return engineResponse;
        } else {
          throw new Error(response.error || 'Batch calculation failed');
        }
      } catch (error) {
        handleError(error, 'batch');
        throw error;
      }
    },
    [handleError]
  );

  // Utility functions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearData = useCallback(() => {
    setState(prev => ({ ...prev, data: null, lastCalculation: null }));
  }, []);

  // Create a compatible getAutoSaveStats function
  const getAutoSaveStats = useCallback(() => {
    // Get the actual auto-save stats and transform to expected format
    const originalStats = getOriginalAutoSaveStats();
    return {
      total: originalStats.totalSaved,
      successful: originalStats.totalSaved, // Assuming totalSaved represents successful saves
      failed: 0, // We don't have failed count from the current interface
    };
  }, [getOriginalAutoSaveStats]);

  return {
    // State
    state,

    // Actions
    calculateEngine,
    calculateNumerology,
    calculateHumanDesign,
    calculateTarot,
    calculateIChing,
    calculateEnneagram,
    calculateSacredGeometry,
    calculateBiorhythm,
    calculateVimshottari,
    calculateGeneKeys,
    calculateSigilForge,
    batchCalculate,

    // Auth methods
    register: async (email: string, password: string, name?: string) => {
      try {
        const response = await apiClient.register(email, password, name);
        return { 
          success: response.success, 
          user: response.data?.user, 
          ...(response.error && { error: response.error })
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
      }
    },
    login: async (email: string, password: string) => {
      try {
        const response = await apiClient.login(email, password);
        return { 
          success: response.success, 
          ...(response.data?.token && { token: response.data.token }),
          ...(response.data?.user && { user: response.data.user }),
          ...(response.error && { error: response.error })
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
      }
    },
    logout: async (token: string) => {
      try {
        const response = await apiClient.logout();
        return { 
          success: response.success, 
          ...(response.error && { error: response.error })
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
      }
    },
    validateToken: async (token: string) => {
      try {
        const response = await apiClient.getCurrentUser();
        return { 
          success: response.success, 
          ...(response.data && { user: response.data }),
          ...(response.error && { error: response.error })
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Token validation failed' };
      }
    },

    // Utilities
    clearError,
    clearData,
    healthCheck,

    // Status
    isConnected,
    availableEngines,

    // Auto-save functionality
    isAutoSaving,
    autoSaveError: null, // Simplified for now since the interface doesn't match
    autoSaveCount,
    getAutoSaveStats,
  };
};

export default useWitnessOSAPI;
