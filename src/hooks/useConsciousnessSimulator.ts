/**
 * Consciousness Simulator Hook
 * 
 * Integrates the consciousness simulator with existing consciousness systems
 * Provides real-time simulation data for debugging and development
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ConsciousnessSimulatorEngine, 
  SIMULATION_SCENARIOS,
  type SimulationScenario,
  type SimulationData,
  type BreathPatternType 
} from '@/engines/consciousness-simulator';

interface UseConsciousnessSimulatorOptions {
  enableRealTime?: boolean;
  updateInterval?: number; // milliseconds
  onDataChange?: (data: SimulationData) => void;
  onScenarioChange?: (scenario: SimulationScenario) => void;
  onSimulationToggle?: (isActive: boolean) => void;
}

interface UseConsciousnessSimulatorReturn {
  // Simulator instance
  simulator: ConsciousnessSimulatorEngine;
  
  // State
  isSimulationMode: boolean;
  currentScenario?: SimulationScenario | undefined;
  simulationData: SimulationData;
  
  // Controls
  setIsSimulationMode: (enabled: boolean) => void;
  setCoherenceLevel: (level: number) => void;
  setConsciousnessLevel: (level: number) => void;
  setBreathPattern: (pattern: BreathPatternType) => void;
  setSimulationSpeed: (speed: number) => void;
  
  // Scenario management
  loadScenario: (scenarioKey: string) => void;
  getAvailableScenarios: () => Record<string, SimulationScenario>;
  
  // Real-time data
  startRealTimeSimulation: () => void;
  stopRealTimeSimulation: () => void;
  isRealTimeActive: boolean;
  
  // Utility
  resetSimulation: () => void;
  getSimulationStats: () => {
    totalUpdates: number;
    averageCoherence: number;
    consciousnessProgression: number;
    lastUpdate: Date;
  };
}

export const useConsciousnessSimulator = (
  options: UseConsciousnessSimulatorOptions = {}
): UseConsciousnessSimulatorReturn => {
  const {
    enableRealTime = false,
    updateInterval = 100, // 10 FPS default
    onDataChange,
    onScenarioChange,
    onSimulationToggle
  } = options;

  // Simulator instance
  const simulatorRef = useRef<ConsciousnessSimulatorEngine>();
  const [simulator] = useState(() => {
    const sim = new ConsciousnessSimulatorEngine();
    simulatorRef.current = sim;
    return sim;
  });

  // State
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [isRealTimeActive, setIsRealTimeActive] = useState<boolean>(enableRealTime);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario | undefined>();
  const [simulationData, setSimulationData] = useState<SimulationData>(simulator.getSimulationData());
  
  // Stats tracking
  const [totalUpdates, setTotalUpdates] = useState<number>(0);
  const [coherenceHistory, setCoherenceHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Real-time simulation loop
  useEffect(() => {
    if (!isRealTimeActive || !isSimulationMode) return;

    const interval = setInterval(() => {
      const data = simulator.generateSimulationData();
      setSimulationData(data);
      setTotalUpdates(prev => prev + 1);
      setLastUpdate(new Date());
      
      // Track coherence history for stats
      setCoherenceHistory(prev => {
        const newHistory = [...prev, data.consciousness.coherence];
        // Keep last 100 values for rolling average
        return newHistory.slice(-100);
      });
      
      onDataChange?.(data);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isRealTimeActive, isSimulationMode, simulator, updateInterval, onDataChange]);

  // Control handlers
  const handleSetSimulationMode = useCallback((enabled: boolean) => {
    setIsSimulationMode(enabled);
    simulator.calculate({ enableRealTime: enabled });
    onSimulationToggle?.(enabled);
  }, [simulator, onSimulationToggle]);

  const handleSetCoherenceLevel = useCallback((level: number) => {
    simulator.setCoherenceLevel(level);
    const data = simulator.getSimulationData();
    setSimulationData(data);
    onDataChange?.(data);
  }, [simulator, onDataChange]);

  const handleSetConsciousnessLevel = useCallback((level: number) => {
    simulator.setConsciousnessLevel(level);
    const data = simulator.getSimulationData();
    setSimulationData(data);
    onDataChange?.(data);
  }, [simulator, onDataChange]);

  const handleSetBreathPattern = useCallback((pattern: BreathPatternType) => {
    simulator.setBreathPattern(pattern);
    const data = simulator.getSimulationData();
    setSimulationData(data);
    onDataChange?.(data);
  }, [simulator, onDataChange]);

  const handleSetSimulationSpeed = useCallback((speed: number) => {
    simulator.calculate({ simulationSpeed: speed });
  }, [simulator]);

  // Scenario management
  const handleLoadScenario = useCallback((scenarioKey: string) => {
    const scenario = SIMULATION_SCENARIOS[scenarioKey];
    if (scenario) {
      simulator.loadScenario(scenario);
      setCurrentScenario(scenario);
      setSimulationData(simulator.getSimulationData());
      onScenarioChange?.(scenario);
      onDataChange?.(simulator.getSimulationData());
    }
  }, [simulator, onScenarioChange, onDataChange]);

  const getAvailableScenarios = useCallback(() => {
    return SIMULATION_SCENARIOS;
  }, []);

  // Real-time controls
  const startRealTimeSimulation = useCallback(() => {
    setIsRealTimeActive(true);
    handleSetSimulationMode(true);
  }, [handleSetSimulationMode]);

  const stopRealTimeSimulation = useCallback(() => {
    setIsRealTimeActive(false);
  }, []);

  // Utility functions
  const resetSimulation = useCallback(() => {
    setTotalUpdates(0);
    setCoherenceHistory([]);
    setLastUpdate(new Date());
    setCurrentScenario(undefined);
    setSimulationData(simulator.getSimulationData());
  }, [simulator]);

  const getSimulationStats = useCallback(() => {
    const averageCoherence = coherenceHistory.length > 0 
      ? coherenceHistory.reduce((sum, val) => sum + val, 0) / coherenceHistory.length 
      : 0;
    
    const consciousnessProgression = simulationData.consciousness.level;
    
    return {
      totalUpdates,
      averageCoherence,
      consciousnessProgression,
      lastUpdate
    };
  }, [totalUpdates, coherenceHistory, simulationData.consciousness.level, lastUpdate]);

  return {
    // Simulator instance
    simulator,
    
    // State
    isSimulationMode,
    currentScenario,
    simulationData,
    
    // Controls
    setIsSimulationMode: handleSetSimulationMode,
    setCoherenceLevel: handleSetCoherenceLevel,
    setConsciousnessLevel: handleSetConsciousnessLevel,
    setBreathPattern: handleSetBreathPattern,
    setSimulationSpeed: handleSetSimulationSpeed,
    
    // Scenario management
    loadScenario: handleLoadScenario,
    getAvailableScenarios,
    
    // Real-time data
    startRealTimeSimulation,
    stopRealTimeSimulation,
    isRealTimeActive,
    
    // Utility
    resetSimulation,
    getSimulationStats
  };
};

// Integration hook for existing consciousness systems
export const useConsciousnessSimulatorIntegration = () => {
  const {
    simulator,
    isSimulationMode,
    simulationData,
    setIsSimulationMode,
    setCoherenceLevel,
    setConsciousnessLevel,
    setBreathPattern,
    startRealTimeSimulation,
    stopRealTimeSimulation,
    isRealTimeActive
  } = useConsciousnessSimulator({
    enableRealTime: false,
    updateInterval: 100,
    onDataChange: (data) => {
      // Here you can integrate with existing consciousness hooks
      // For example, override real biometric data with simulation data
      console.log('Simulation data updated:', data);
    }
  });

  // Integration with existing consciousness systems
  const integrateWithConsciousness = useCallback(() => {
    if (isSimulationMode) {
      // Override real consciousness data with simulation data
      return {
        breath: simulationData.breath,
        hrv: simulationData.hrv,
        consciousness: simulationData.consciousness,
        gesture: simulationData.gesture,
        biometrics: simulationData.biometrics
      };
    }
    return null; // Use real data
  }, [isSimulationMode, simulationData]);

  return {
    // Simulator controls
    simulator,
    isSimulationMode,
    isRealTimeActive,
    simulationData,
    
    // Integration
    integrateWithConsciousness,
    
    // Controls
    setIsSimulationMode,
    setCoherenceLevel,
    setConsciousnessLevel,
    setBreathPattern,
    startRealTimeSimulation,
    stopRealTimeSimulation,
    
    // Quick presets
    setLowCoherence: () => setCoherenceLevel(0.2),
    setMediumCoherence: () => setCoherenceLevel(0.5),
    setHighCoherence: () => setCoherenceLevel(0.8),
    setTranscendence: () => {
      setConsciousnessLevel(0.95);
      setCoherenceLevel(0.95);
    }
  };
};

export default useConsciousnessSimulator; 