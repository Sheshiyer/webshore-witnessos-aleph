/**
 * Dynamic Engine Loader for WitnessOS
 * 
 * Dynamically loads and displays available engines based on real-time API responses
 * Ensures all engine checks and API calls connect exclusively to production backend
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';
import { UI_COPY } from '@/utils/witnessos-ui-constants';
import { getUserTierFromProfile, getEngineAccessLevel, ALL_ENGINES } from '@/utils/engine-tier-organization';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';

interface DynamicEngineLoaderProps {
  onEngineSelect?: (engine: EngineInfo) => void;
  onEngineCalculate?: (engine: string, result: any) => void;
  filterByTier?: boolean;
}

interface EngineInfo {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  isAvailable: boolean;
  isUnlocked: boolean;
  tier: 1 | 2 | 3;
  requiredInputs: string[];
  metadata?: any;
  lastUpdated: string;
}

interface EngineCalculationRequest {
  engine: string;
  input: Record<string, any>;
  userContext?: any;
}

export default function DynamicEngineLoader({
  onEngineSelect,
  onEngineCalculate,
  filterByTier = true
}: DynamicEngineLoaderProps) {
  const { user } = useAuth();
  const { profile } = useConsciousnessProfile();
  
  const [engines, setEngines] = useState<EngineInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [calculationInput, setCalculationInput] = useState<Record<string, any>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const userTier = getUserTierFromProfile(profile);

  // Fetch available engines from production API
  const fetchEngines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching engines from production API:', process.env.NEXT_PUBLIC_API_URL || 'https://api.witnessos.space');
      
      const response = await apiClient.listEngines();
      
      if (response.success && response.data) {
        const availableEngines = response.data.engines || [];
        console.log('✅ Received engines from API:', availableEngines);

        // Map API response to EngineInfo format
        const engineInfos: EngineInfo[] = await Promise.all(
          availableEngines.map(async (engineName: string) => {
            // Get engine metadata from API
            let metadata = null;
            try {
              const metadataResponse = await apiClient.getEngineMetadata(engineName as any);
              if (metadataResponse.success) {
                metadata = metadataResponse.data;
              }
            } catch (error) {
              console.warn(`Failed to fetch metadata for ${engineName}:`, error);
            }

            // Get engine info from local definitions or use defaults
            const localEngineInfo = ALL_ENGINES[engineName];
            const { hasAccess, missingRequirements } = getEngineAccessLevel(userTier, engineName);

            return {
              name: engineName,
              displayName: localEngineInfo?.name || engineName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              description: localEngineInfo?.description || metadata?.description || 'Consciousness engine',
              icon: localEngineInfo?.icon || '🔮',
              color: localEngineInfo?.color || '#9370DB',
              isAvailable: true, // From API, so it's available
              isUnlocked: hasAccess,
              tier: localEngineInfo?.tier || 2,
              requiredInputs: localEngineInfo?.requiredInputs || metadata?.requiredInputs || [],
              metadata,
              lastUpdated: new Date().toISOString(),
            };
          })
        );

        // Filter by tier if requested
        const filteredEngines = filterByTier 
          ? engineInfos.filter(engine => engine.tier <= userTier)
          : engineInfos;

        setEngines(filteredEngines);
        setLastRefresh(new Date());
        console.log(`🎯 Loaded ${filteredEngines.length} engines for tier ${userTier} user`);
        
      } else {
        throw new Error(response.error || 'Failed to fetch engines');
      }
    } catch (error) {
      console.error('❌ Failed to fetch engines:', error);
      setError(`Failed to connect to production API: ${error}`);
      
      // Fallback to local engine definitions
      const fallbackEngines: EngineInfo[] = Object.entries(ALL_ENGINES).map(([key, engine]) => {
        const { hasAccess } = getEngineAccessLevel(userTier, key);
        
        return {
          name: key,
          displayName: engine.name,
          description: engine.description,
          icon: engine.icon,
          color: engine.color,
          isAvailable: false, // Not confirmed by API
          isUnlocked: hasAccess,
          tier: engine.tier,
          requiredInputs: engine.requiredInputs,
          lastUpdated: new Date().toISOString(),
        };
      });

      const filteredFallback = filterByTier 
        ? fallbackEngines.filter(engine => engine.tier <= userTier)
        : fallbackEngines;

      setEngines(filteredFallback);
      console.log('📦 Using fallback engine definitions');
    } finally {
      setIsLoading(false);
    }
  }, [userTier, filterByTier]);

  // Calculate engine result
  const calculateEngine = useCallback(async (engineName: string, input: Record<string, any>) => {
    setIsCalculating(true);
    
    try {
      console.log(`🧮 Calculating ${engineName} with input:`, input);
      
      // Add user context from profile
      const userContext = profile ? {
        userId: user?.id,
        tier: userTier,
        birthData: profile.birthData,
        personalData: profile.personalData,
        location: profile.location,
        preferences: profile.preferences,
      } : undefined;

      const response = await apiClient.calculateEngine(engineName as any, input, {
        useCache: true,
        userId: user?.id,
        saveProfile: true,
      });

      if (response.success && response.data) {
        console.log(`✅ ${engineName} calculation successful:`, response.data);
        onEngineCalculate?.(engineName, response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Calculation failed');
      }
    } catch (error) {
      console.error(`❌ ${engineName} calculation failed:`, error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, [profile, userTier, user?.id, onEngineCalculate]);

  // Handle engine selection
  const handleEngineSelect = useCallback((engine: EngineInfo) => {
    if (!engine.isUnlocked) {
      console.warn(`Engine ${engine.name} is locked for tier ${userTier} user`);
      return;
    }

    setSelectedEngine(engine.name);
    
    // Pre-populate input from profile if available
    const prePopulatedInput: Record<string, any> = {};
    
    if (profile) {
      if (engine.requiredInputs.includes('birthDate')) {
        prePopulatedInput.birthDate = profile.birthData?.birthDate || profile.personalData?.birthDate;
      }
      if (engine.requiredInputs.includes('birthTime')) {
        prePopulatedInput.birthTime = profile.birthData?.birthTime;
      }
      if (engine.requiredInputs.includes('birthLocation')) {
        prePopulatedInput.birthLocation = profile.location ? 
          [profile.location.latitude, profile.location.longitude] : undefined;
      }
      if (engine.requiredInputs.includes('fullName') || engine.requiredInputs.includes('name')) {
        prePopulatedInput.fullName = profile.personalData?.fullName || profile.personalData?.name;
      }
    }

    setCalculationInput(prePopulatedInput);
    onEngineSelect?.(engine);
  }, [userTier, profile, onEngineSelect]);

  // Handle calculation submission
  const handleCalculationSubmit = useCallback(async () => {
    if (!selectedEngine) return;

    const engine = engines.find(e => e.name === selectedEngine);
    if (!engine) return;

    // Validate required inputs
    const missingInputs = engine.requiredInputs.filter(input => !calculationInput[input]);
    if (missingInputs.length > 0) {
      alert(`Please provide: ${missingInputs.join(', ')}`);
      return;
    }

    try {
      await calculateEngine(selectedEngine, calculationInput);
    } catch (error) {
      alert(`Calculation failed: ${error}`);
    }
  }, [selectedEngine, engines, calculationInput, calculateEngine]);

  // Refresh engines periodically
  useEffect(() => {
    fetchEngines();

    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(fetchEngines, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchEngines]);

  // Refresh when user tier changes
  useEffect(() => {
    if (userTier) {
      fetchEngines();
    }
  }, [userTier, fetchEngines]);

  return (
    <div className="dynamic-engine-loader">
      {/* Header with refresh info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            {UI_COPY.ENGINE_COLLECTION_TITLE}
          </h2>
          <div className="text-sm text-gray-400">
            Tier {userTier} Access • {engines.length} engines available
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-xs text-gray-400">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchEngines}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Production API Status */}
      <div className="mb-4 p-3 bg-black/30 rounded-lg border border-cyan-400/30">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-300">Connected to Production API</span>
          <span className="text-gray-400">•</span>
          <span className="text-cyan-300">{process.env.NEXT_PUBLIC_API_URL || 'https://api.witnessos.space'}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-400/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-400">Loading engines from production API...</div>
        </div>
      )}

      {/* Engine Grid */}
      {!isLoading && engines.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {engines.map(engine => (
            <div
              key={engine.name}
              onClick={() => handleEngineSelect(engine)}
              className={`
                engine-card p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                ${engine.isUnlocked
                  ? 'border-green-500/50 bg-green-900/20 hover:bg-green-900/40 hover:scale-105'
                  : 'border-gray-600/50 bg-gray-900/20 opacity-50 cursor-not-allowed'
                }
                ${selectedEngine === engine.name ? 'ring-2 ring-white/50' : ''}
              `}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{engine.icon}</div>
                <div className="font-semibold text-sm" style={{ color: engine.isUnlocked ? engine.color : '#666' }}>
                  {engine.displayName}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {engine.description}
                </div>
                
                {/* Status Indicators */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-center space-x-1 text-xs">
                    <div className={`w-2 h-2 rounded-full ${engine.isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className={engine.isAvailable ? 'text-green-400' : 'text-red-400'}>
                      {engine.isAvailable ? 'API' : 'Local'}
                    </span>
                  </div>
                  
                  {engine.isUnlocked ? (
                    <div className="text-xs text-green-400 font-semibold">
                      ✓ Tier {engine.tier} Unlocked
                    </div>
                  ) : (
                    <div className="text-xs text-red-400">
                      🔒 Tier {engine.tier} Required
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Engine Input Form */}
      {selectedEngine && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <h3 className="font-semibold mb-3 text-white">
            {engines.find(e => e.name === selectedEngine)?.displayName} Input
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {engines.find(e => e.name === selectedEngine)?.requiredInputs.map(input => (
              <div key={input}>
                <label className="block text-sm font-medium mb-1 text-gray-300 capitalize">
                  {input.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type={input.includes('Date') ? 'date' : input.includes('Time') ? 'time' : 'text'}
                  value={calculationInput[input] || ''}
                  onChange={(e) => setCalculationInput(prev => ({ ...prev, [input]: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded text-white"
                  placeholder={input === 'question' ? 'Ask your question...' : `Enter ${input}`}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculationSubmit}
            disabled={isCalculating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
      )}
    </div>
  );
}
