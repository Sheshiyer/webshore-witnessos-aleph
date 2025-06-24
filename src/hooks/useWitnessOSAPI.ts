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
import { DataTransformer, witnessOSAPI, WitnessOSAPIError } from '@/utils/api-client';
import { useCallback, useRef, useState } from 'react';

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

  // Utilities
  clearError: () => void;
  clearData: () => void;
  healthCheck: () => Promise<boolean>;

  // Status
  isConnected: boolean;
  availableEngines: EngineName[];
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

  // Error handling utility
  const handleError = useCallback(
    (error: unknown, engine?: string): ConsciousnessError => {
      let consciousnessError: ConsciousnessError;

      if (error instanceof WitnessOSAPIError) {
        consciousnessError = {
          code: `API_ERROR_${error.statusCode || 'UNKNOWN'}`,
          message: error.message,
          context: { engine, statusCode: error.statusCode },
          suggestions: [
            'Check your internet connection',
            'Verify the WitnessOS API is running',
            'Try again in a moment',
          ],
          timestamp: new Date().toISOString(),
        };
      } else if (error instanceof Error) {
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
        // Validate input
        if (!DataTransformer.validateEngineInput(engineName, input)) {
          throw new Error(`Invalid input data for ${engineName} engine`);
        }

        // Transform data if needed
        const transformedInput = autoTransform
          ? DataTransformer.typeScriptToPython<TInput>(input as unknown as Record<string, unknown>)
          : input;

        // Make API call
        const response = await witnessOSAPI.calculateEngine<TInput, TOutput>(
          engineName,
          transformedInput
        );

        if (response.success && response.data) {
          // Transform response data if needed
          const transformedData = autoTransform
            ? DataTransformer.pythonToTypeScript<TOutput>(
                response.data as unknown as Record<string, unknown>
              )
            : response.data;

          setState(prev => ({
            ...prev,
            data: transformedData,
            loading: false,
            error: null,
          }));

          if (onSuccess) {
            onSuccess(transformedData as EngineOutput);
          }

          return { ...response, data: transformedData };
        } else {
          throw new Error(response.error || 'Calculation failed');
        }
      } catch (error) {
        handleError(error, engineName);
        throw error;
      }
    },
    [autoTransform, onSuccess, handleError]
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
        const response = await witnessOSAPI.batchCalculate(requests);

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data as unknown as EngineOutput,
            loading: false,
          }));
        } else {
          throw new Error(response.error || 'Batch calculation failed');
        }

        return response;
      } catch (error) {
        handleError(error, 'batch');
        throw error;
      }
    },
    [handleError]
  );

  // Health check
  const healthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const response = await witnessOSAPI.healthCheck();
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

  // Utility functions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearData = useCallback(() => {
    setState(prev => ({ ...prev, data: null, lastCalculation: null }));
  }, []);

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

    // Utilities
    clearError,
    clearData,
    healthCheck,

    // Status
    isConnected,
    availableEngines,
  };
};

export default useWitnessOSAPI;
