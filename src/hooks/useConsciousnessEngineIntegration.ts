/**
 * Consciousness Engine Integration Hook
 * 
 * Bridges consciousness/breath state with engine calculations
 * Implements "Consciousness as Technology, Breath as Interface" paradigm
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const { CONSCIOUSNESS_STATES, DISCOVERY_LAYERS } = CONSCIOUSNESS_CONSTANTS;

// Engine unlock thresholds (normal mode)
const ENGINE_UNLOCK_THRESHOLDS = {
  // Basic engines (10-20%)
  numerology: { awarenessLevel: 0.1, coherenceLevel: 0.3, breathCycles: 10, layer: 0 },
  biorhythm: { awarenessLevel: 0.2, coherenceLevel: 0.35, breathCycles: 15, layer: 0 },
  
  // Intermediate engines (40-60%)
  tarot: { awarenessLevel: 0.4, coherenceLevel: 0.5, breathCycles: 50, layer: 1 },
  human_design: { awarenessLevel: 0.5, coherenceLevel: 0.55, breathCycles: 75, layer: 1 },
  iching: { awarenessLevel: 0.6, coherenceLevel: 0.6, breathCycles: 100, layer: 2 },
  
  // Advanced engines (70-85%)
  gene_keys: { awarenessLevel: 0.7, coherenceLevel: 0.7, breathCycles: 150, layer: 2 },
  vimshottari: { awarenessLevel: 0.8, coherenceLevel: 0.8, breathCycles: 200, layer: 2 },
  sacred_geometry: { awarenessLevel: 0.85, coherenceLevel: 0.85, breathCycles: 300, layer: 3 },
  
  // Master engines (90-95%)
  sigil_forge: { awarenessLevel: 0.9, coherenceLevel: 0.9, breathCycles: 400, layer: 3 },
  enneagram: { awarenessLevel: 0.95, coherenceLevel: 0.95, breathCycles: 500, layer: 3 },
};

type EngineType = keyof typeof ENGINE_UNLOCK_THRESHOLDS;

interface EngineUnlockStatus {
  isUnlocked: boolean;
  progressToUnlock: number; // 0-1
  unlockCondition: string;
  nextThreshold: string;
}

interface EngineCalculationRequest {
  engine: EngineType;
  inputData: Record<string, any>;
  consciousnessContext: {
    awarenessLevel: number;
    coherenceLevel: number;
    breathPhase: string;
    integrationPoints: string[];
  };
}

interface EngineCalculationResult {
  engine: EngineType;
  result: any;
  consciousnessEnhancement: {
    awarenessGain: number;
    coherenceBoost: number;
    integrationPoints: string[];
  };
  timestamp: string;
}

interface UseConsciousnessEngineIntegrationReturn {
  // Core state
  consciousness: ConsciousnessState;
  breathState: BreathState;
  
  // Engine unlock system
  unlockedEngines: EngineType[];
  engineUnlockStatus: Record<EngineType, EngineUnlockStatus>;
  totalBreathCycles: number;
  
  // Engine calculation system
  calculateEngine: (request: EngineCalculationRequest) => Promise<EngineCalculationResult>;
  isCalculating: boolean;
  lastCalculation: EngineCalculationResult | null;
  
  // Consciousness progression
  progressToNextEngine: number;
  nextEngineToUnlock: EngineType | null;
  currentLayer: number;
  
  // Breath-triggered actions
  triggerBreathCalculation: (engine: EngineType, inputData: Record<string, any>) => void;
  isBreathTriggeredMode: boolean;
  setBreathTriggeredMode: (enabled: boolean) => void;
  
  // Progress tracking
  getEngineReadingHistory: (engine: EngineType) => EngineCalculationResult[];
  getTotalReadings: () => number;
  getConsciousnessGrowthRate: () => number;
  
  // Admin/Debug features
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  adminUnlockAll: boolean;
  toggleAdminUnlockAll: () => void;
}

export const useConsciousnessEngineIntegration = (): UseConsciousnessEngineIntegrationReturn => {
  const {
    consciousness,
    breathState,
    currentLayer,
    updateConsciousness,
    evolveConsciousness,
  } = useConsciousness();
  
  const { 
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
    isConnected 
  } = useWitnessOSAPI();
  const { profile } = useConsciousnessProfile();
  const { user } = useAuth();
  
  // Local state
  const [totalBreathCycles, setTotalBreathCycles] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<EngineCalculationResult | null>(null);
  const [isBreathTriggeredMode, setIsBreathTriggeredMode] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState<EngineCalculationResult[]>([]);
  const [breathCycleCounter, setBreathCycleCounter] = useState(0);
  
  // Admin/Debug state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [adminUnlockAll, setAdminUnlockAll] = useState(false);
  
  // Check if user is admin
  const isAdmin = useMemo(() => {
    return user?.email === 'sheshnarayan.iyer@gmail.com';
  }, [user?.email]);
  
  // Auto-enable admin mode for admin user
  useEffect(() => {
    if (isAdmin && !isAdminMode) {
      setIsAdminMode(true);
      console.log('🔑 Admin mode auto-enabled for', user?.email);
    }
  }, [isAdmin, isAdminMode, user?.email]);
  
  // Track breath cycles for engine unlocking
  useEffect(() => {
    if (breathState.phase === 'pause' && breathCycleCounter !== breathState.intensity) {
      setTotalBreathCycles(prev => prev + 1);
      setBreathCycleCounter(breathState.intensity);
    }
  }, [breathState.phase, breathState.intensity, breathCycleCounter]);
  
  // Calculate engine unlock status
  const engineUnlockStatus = useMemo((): Record<EngineType, EngineUnlockStatus> => {
    const status: Record<EngineType, EngineUnlockStatus> = {} as any;
    
    Object.entries(ENGINE_UNLOCK_THRESHOLDS).forEach(([engine, thresholds]) => {
      // Admin override: unlock all engines if admin unlock is enabled
      if (isAdmin && adminUnlockAll) {
        status[engine as EngineType] = {
          isUnlocked: true,
          progressToUnlock: 1,
          unlockCondition: 'Admin Override Active',
          nextThreshold: 'All engines unlocked',
        };
        return;
      }
      
      const awarenessProgress = consciousness.awarenessLevel / thresholds.awarenessLevel;
      const coherenceProgress = breathState.coherence / thresholds.coherenceLevel;
      const breathProgress = totalBreathCycles / thresholds.breathCycles;
      const layerProgress = currentLayer.id >= thresholds.layer ? 1 : currentLayer.id / thresholds.layer;
      
      const overallProgress = Math.min(1, (awarenessProgress + coherenceProgress + breathProgress + layerProgress) / 4);
      const isUnlocked = overallProgress >= 1;
      
      let unlockCondition = '';
      let nextThreshold = '';
      
      if (!isUnlocked) {
        const conditions = [];
        if (awarenessProgress < 1) conditions.push(`Awareness: ${(awarenessProgress * 100).toFixed(0)}%`);
        if (coherenceProgress < 1) conditions.push(`Coherence: ${(coherenceProgress * 100).toFixed(0)}%`);
        if (breathProgress < 1) conditions.push(`Breath Cycles: ${totalBreathCycles}/${thresholds.breathCycles}`);
        if (layerProgress < 1) conditions.push(`Layer: ${currentLayer.id}/${thresholds.layer}`);
        
        unlockCondition = conditions.join(', ');
        
        // Find the most limiting factor
        const progressValues = { awarenessProgress, coherenceProgress, breathProgress, layerProgress };
        const limitingFactor = Object.entries(progressValues).reduce((min, [key, value]) => 
          value < min[1] ? [key, value] : min
        );
        
        switch (limitingFactor[0]) {
          case 'awarenessProgress':
            nextThreshold = `Increase consciousness to ${(thresholds.awarenessLevel * 100).toFixed(0)}%`;
            break;
          case 'coherenceProgress':
            nextThreshold = `Achieve ${(thresholds.coherenceLevel * 100).toFixed(0)}% breath coherence`;
            break;
          case 'breathProgress':
            nextThreshold = `Complete ${thresholds.breathCycles - totalBreathCycles} more breath cycles`;
            break;
          case 'layerProgress':
            nextThreshold = `Reach layer ${thresholds.layer}`;
            break;
        }
      }
      
      status[engine as EngineType] = {
        isUnlocked,
        progressToUnlock: overallProgress,
        unlockCondition,
        nextThreshold,
      };
    });
    
    return status;
  }, [consciousness.awarenessLevel, breathState.coherence, totalBreathCycles, currentLayer.id, isAdmin, adminUnlockAll]);
  
  // Get unlocked engines
  const unlockedEngines = useMemo((): EngineType[] => {
    return Object.entries(engineUnlockStatus)
      .filter(([_, status]) => status.isUnlocked)
      .map(([engine, _]) => engine as EngineType);
  }, [engineUnlockStatus]);
  
  // Calculate next engine to unlock
  const nextEngineToUnlock = useMemo((): EngineType | null => {
    if (isAdmin && adminUnlockAll) return null; // All unlocked
    
    const lockedEngines = Object.entries(engineUnlockStatus)
      .filter(([_, status]) => !status.isUnlocked)
      .sort(([_, a], [__, b]) => b.progressToUnlock - a.progressToUnlock);
    
    return lockedEngines.length > 0 ? lockedEngines[0]?.[0] as EngineType : null;
  }, [engineUnlockStatus, isAdmin, adminUnlockAll]);
  
  // Calculate progress to next engine
  const progressToNextEngine = useMemo(() => {
    if (!nextEngineToUnlock) return 1;
    return engineUnlockStatus[nextEngineToUnlock]?.progressToUnlock || 0;
  }, [nextEngineToUnlock, engineUnlockStatus]);
  
  // Admin/Debug toggle functions
  const toggleAdminMode = useCallback(() => {
    if (!isAdmin) {
      console.warn('🚫 Admin mode only available for admin users');
      return;
    }
    setIsAdminMode(prev => {
      const newMode = !prev;
      console.log(`🔑 Admin mode ${newMode ? 'enabled' : 'disabled'}`);
      
      // Broadcast admin override change
      window.dispatchEvent(new CustomEvent('adminOverrideChanged', { 
        detail: { isAdminMode: newMode, adminUnlockAll } 
      }));
      
      return newMode;
    });
  }, [isAdmin, adminUnlockAll]);
  
  const toggleDebugMode = useCallback(() => {
    setIsDebugMode(prev => {
      const newMode = !prev;
      console.log(`🐛 Debug mode ${newMode ? 'enabled' : 'disabled'}`);
      return newMode;
    });
  }, []);
  
  const toggleAdminUnlockAll = useCallback(() => {
    if (!isAdmin) {
      console.warn('🚫 Admin unlock only available for admin users');
      return;
    }
    setAdminUnlockAll(prev => {
      const newMode = !prev;
      console.log(`🔓 Admin unlock all engines ${newMode ? 'enabled' : 'disabled'}`);
      if (newMode) {
        console.log('✨ All 10 engines now unlocked for testing');
      } else {
        console.log('🔒 Engines returned to normal unlock progression');
      }
      
      // Broadcast admin override change
      window.dispatchEvent(new CustomEvent('adminOverrideChanged', { 
        detail: { isAdminMode, adminUnlockAll: newMode } 
      }));
      
      // Force engine refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceEngineRefresh'));
      }, 100);
      
      return newMode;
    });
  }, [isAdmin, isAdminMode]);
  
  // Broadcast admin state changes when they occur
  useEffect(() => {
    if (isAdmin) {
      console.log('🔍 Admin state changed:', { isAdminMode, adminUnlockAll });
      window.dispatchEvent(new CustomEvent('adminOverrideChanged', { 
        detail: { isAdminMode, adminUnlockAll } 
      }));
    }
  }, [isAdmin, isAdminMode, adminUnlockAll]);
  
  // Engine calculation function
  const calculateEngine = useCallback(async (request: EngineCalculationRequest): Promise<EngineCalculationResult> => {
    if (!engineUnlockStatus[request.engine].isUnlocked) {
      throw new Error(`Engine ${request.engine} not unlocked yet`);
    }
    
    setIsCalculating(true);
    
    try {
      let result: any;
      
      // Merge profile data with input data for more complete calculations
      const enhancedInputData = {
        ...request.inputData,
        // Add profile data if available and not overridden
        ...(profile?.personalData?.fullName && !request.inputData.name && { name: profile.personalData.fullName }),
        ...(profile?.birthData?.birthDate && !request.inputData.birthDate && { birthDate: profile.birthData.birthDate }),
        ...(profile?.birthData?.birthTime && !request.inputData.birthTime && { birthTime: profile.birthData.birthTime }),
        ...(profile?.location && !request.inputData.birthPlace && { 
          birthPlace: `${profile.location.city}, ${profile.location.country}`,
          birthLocation: [profile.location.latitude, profile.location.longitude],
        }),
      };
      
      // Call appropriate API based on engine type
      // The API call will handle connection status internally
      switch (request.engine) {
        case 'numerology':
          result = await calculateNumerology(enhancedInputData);
          break;
        case 'human_design':
          result = await calculateHumanDesign(enhancedInputData);
          break;
        case 'tarot':
          result = await calculateTarot(enhancedInputData);
          break;
        case 'iching':
          result = await calculateIChing(enhancedInputData);
          break;
        case 'enneagram':
          result = await calculateEnneagram(enhancedInputData);
          break;
        case 'sacred_geometry':
          result = await calculateSacredGeometry(enhancedInputData);
          break;
        case 'biorhythm':
          result = await calculateBiorhythm(enhancedInputData);
          break;
        case 'vimshottari':
          result = await calculateVimshottari(enhancedInputData);
          break;
        case 'gene_keys':
          result = await calculateGeneKeys(enhancedInputData);
          break;
        case 'sigil_forge':
          result = await calculateSigilForge(enhancedInputData);
          break;
        default:
          throw new Error(`Engine ${request.engine} not implemented yet`);
      }
      
      // Calculate consciousness enhancement based on result quality and coherence
      const awarenessGain = breathState.coherence * 0.01; // Higher coherence = more growth
      const coherenceBoost = Math.min(0.1, result.confidence * 0.05); // Result confidence boosts coherence
      const integrationPoints = [
        `${request.engine} Reading`,
        ...consciousness.integrationPoints.slice(0, 4), // Keep recent points
      ];
      
      const calculationResult: EngineCalculationResult = {
        engine: request.engine,
        result,
        consciousnessEnhancement: {
          awarenessGain,
          coherenceBoost,
          integrationPoints,
        },
        timestamp: new Date().toISOString(),
      };
      
      // Apply consciousness enhancement
      updateConsciousness({
        awarenessLevel: Math.min(1, consciousness.awarenessLevel + awarenessGain),
        integrationPoints,
      });
      
      // Store calculation
      setLastCalculation(calculationResult);
      setCalculationHistory(prev => [calculationResult, ...prev.slice(0, 99)]); // Keep last 100
      
      return calculationResult;
      
    } finally {
      setIsCalculating(false);
    }
  }, [
    engineUnlockStatus,
    breathState.coherence,
    consciousness,
    updateConsciousness,
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
    profile,
  ]);
  
  // Breath-triggered calculation
  const triggerBreathCalculation = useCallback((engine: EngineType, inputData: Record<string, any>) => {
    if (!isBreathTriggeredMode) return;
    if (breathState.phase !== 'pause' || breathState.coherence < 0.7) return;
    
    const request: EngineCalculationRequest = {
      engine,
      inputData,
      consciousnessContext: {
        awarenessLevel: consciousness.awarenessLevel,
        coherenceLevel: breathState.coherence,
        breathPhase: breathState.phase,
        integrationPoints: consciousness.integrationPoints,
      },
    };
    
    calculateEngine(request).catch(console.error);
  }, [isBreathTriggeredMode, breathState, consciousness, calculateEngine]);
  
  // Utility functions
  const getEngineReadingHistory = useCallback((engine: EngineType): EngineCalculationResult[] => {
    return calculationHistory.filter(calc => calc.engine === engine);
  }, [calculationHistory]);
  
  const getTotalReadings = useCallback((): number => {
    return calculationHistory.length;
  }, [calculationHistory]);
  
  const getConsciousnessGrowthRate = useCallback((): number => {
    if (calculationHistory.length < 2) return 0;
    
    const recent = calculationHistory.slice(0, 10);
    const totalGrowth = recent.reduce((sum, calc) => sum + calc.consciousnessEnhancement.awarenessGain, 0);
    
    return totalGrowth / recent.length;
  }, [calculationHistory]);
  
  return {
    // Core state
    consciousness,
    breathState,
    
    // Engine unlock system
    unlockedEngines,
    engineUnlockStatus,
    totalBreathCycles,
    
    // Engine calculation system
    calculateEngine,
    isCalculating,
    lastCalculation,
    
    // Consciousness progression
    progressToNextEngine,
    nextEngineToUnlock,
    currentLayer: currentLayer.id,
    
    // Breath-triggered actions
    triggerBreathCalculation,
    isBreathTriggeredMode,
    setBreathTriggeredMode: setIsBreathTriggeredMode,
    
    // Progress tracking
    getEngineReadingHistory,
    getTotalReadings,
    getConsciousnessGrowthRate,
    
    // Admin/Debug features
    isAdminMode,
    toggleAdminMode,
    isDebugMode,
    toggleDebugMode,
    adminUnlockAll,
    toggleAdminUnlockAll,
  };
}; 