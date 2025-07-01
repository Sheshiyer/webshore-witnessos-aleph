/**
 * Consciousness Simulator Debug Panel
 * 
 * Real-time controls for simulating consciousness states, breath patterns, and biometric data
 * for debugging consciousness technology without requiring real biometric sensors
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ConsciousnessSimulatorEngine, 
  SIMULATION_SCENARIOS,
  type SimulationScenario,
  type BreathPatternType 
} from '@/engines/consciousness-simulator';

interface ConsciousnessSimulatorPanelProps {
  onSimulationDataChange?: (data: any) => void;
  className?: string;
}

export const ConsciousnessSimulatorPanel: React.FC<ConsciousnessSimulatorPanelProps> = ({
  onSimulationDataChange,
  className = ''
}) => {
  const [simulator] = useState(() => new ConsciousnessSimulatorEngine());
  const [currentScenario, setCurrentScenario] = useState<string>('baseline');
  const [coherenceLevel, setCoherenceLevel] = useState<number>(0.5);
  const [consciousnessLevel, setConsciousnessLevel] = useState<number>(0.5);
  const [breathPattern, setBreathPattern] = useState<BreathPatternType>('natural');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [simulationData, setSimulationData] = useState(simulator.getSimulationData());

  // Real-time simulation loop
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      const data = simulator.generateSimulationData();
      setSimulationData(data);
      onSimulationDataChange?.(data);
    }, 100); // 10 FPS for smooth real-time updates

    return () => clearInterval(interval);
  }, [isSimulationActive, simulator, onSimulationDataChange]);

  // Load scenario handler
  const handleLoadScenario = useCallback((scenarioKey: string) => {
    const scenario = SIMULATION_SCENARIOS[scenarioKey];
    if (scenario) {
      simulator.loadScenario(scenario);
      setCurrentScenario(scenarioKey);
      
      // Update UI with scenario initial values
      if (scenario.phases[0]?.consciousness?.level !== undefined) {
        setConsciousnessLevel(scenario.phases[0].consciousness.level);
      }
      if (scenario.phases[0]?.breath?.coherence !== undefined) {
        setCoherenceLevel(scenario.phases[0].breath.coherence);
      }
      if (scenario.phases[0]?.breath?.pattern) {
        setBreathPattern(scenario.phases[0].breath.pattern);
      }
    }
  }, [simulator]);

  // Control handlers
  const handleCoherenceChange = useCallback((level: number) => {
    setCoherenceLevel(level);
    simulator.setCoherenceLevel(level);
  }, [simulator]);

  const handleConsciousnessChange = useCallback((level: number) => {
    setConsciousnessLevel(level);
    simulator.setConsciousnessLevel(level);
  }, [simulator]);

  const handleBreathPatternChange = useCallback((pattern: BreathPatternType) => {
    setBreathPattern(pattern);
    simulator.setBreathPattern(pattern);
  }, [simulator]);

  const handleSimulationToggle = useCallback(() => {
    const newState = !isSimulationActive;
    setIsSimulationActive(newState);
    simulator.calculate({ enableRealTime: newState });
  }, [isSimulationActive, simulator]);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
    simulator.calculate({ simulationSpeed: speed });
  }, [simulator]);

  return (
    <div className={`consciousness-simulator-panel bg-gray-900 text-white p-6 rounded-lg border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400">🧠 Consciousness State Simulator</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSimulationToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSimulationActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSimulationActive ? '⏸️ Pause' : '▶️ Start'} Simulation
          </button>
          <div className="flex items-center gap-2">
            <label className="text-sm">Speed:</label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={simulationSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-8">{simulationSpeed}x</span>
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-cyan-300">📋 Scenario Selection</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(SIMULATION_SCENARIOS).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => handleLoadScenario(key)}
              className={`p-3 rounded-lg text-left transition-colors ${
                currentScenario === key
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{scenario.name}</div>
              <div className="text-sm opacity-75">{scenario.duration}s • {scenario.phases.length} phases</div>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Controls */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-cyan-300">🎛️ Real-time Controls</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="control-group">
            <label className="block text-sm font-medium mb-2">
              Coherence Level: {coherenceLevel.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={coherenceLevel}
              onChange={(e) => handleCoherenceChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Low (0.0)</span>
              <span>High (1.0)</span>
            </div>
          </div>

          <div className="control-group">
            <label className="block text-sm font-medium mb-2">
              Consciousness Level: {consciousnessLevel.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={consciousnessLevel}
              onChange={(e) => handleConsciousnessChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Dormant (0.0)</span>
              <span>Transcendence (1.0)</span>
            </div>
          </div>

          <div className="control-group">
            <label className="block text-sm font-medium mb-2">Breath Pattern</label>
            <select
              value={breathPattern}
              onChange={(e) => handleBreathPatternChange(e.target.value as BreathPatternType)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="natural">Natural</option>
              <option value="4-7-8">4-7-8 Breathing</option>
              <option value="box">Box Breathing</option>
              <option value="heart">Heart Coherence</option>
              <option value="triangle">Triangle</option>
              <option value="golden-ratio">Golden Ratio</option>
              <option value="wave">Wave</option>
              <option value="planetary">Planetary</option>
              <option value="dna">DNA</option>
              <option value="intention">Intention</option>
              <option value="bio-responsive">Bio-Responsive</option>
              <option value="irregular">Irregular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="data-card bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-green-400">🫁 Breath Data</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Pattern:</span>
              <span className="font-mono">{simulationData.breath.pattern}</span>
            </div>
            <div className="flex justify-between">
              <span>Phase:</span>
              <span className="font-mono capitalize">{simulationData.breath.phase}</span>
            </div>
            <div className="flex justify-between">
              <span>Rhythm:</span>
              <span className="font-mono">{simulationData.breath.rhythm.toFixed(1)} BPM</span>
            </div>
            <div className="flex justify-between">
              <span>Coherence:</span>
              <span className="font-mono">{simulationData.breath.coherence.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Count:</span>
              <span className="font-mono">{simulationData.breath.count}</span>
            </div>
          </div>
        </div>

        <div className="data-card bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-red-400">❤️ HRV Data</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Heart Rate:</span>
              <span className="font-mono">{simulationData.hrv.heartRate.toFixed(0)} BPM</span>
            </div>
            <div className="flex justify-between">
              <span>Variability:</span>
              <span className="font-mono">{simulationData.hrv.variability.toFixed(0)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>Coherence:</span>
              <span className="font-mono">{simulationData.hrv.coherence.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Stress Level:</span>
              <span className="font-mono">{simulationData.hrv.stressLevel.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="data-card bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-purple-400">🧠 Consciousness Data</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="font-mono">{simulationData.consciousness.level.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>State:</span>
              <span className="font-mono capitalize">{simulationData.consciousness.state}</span>
            </div>
            <div className="flex justify-between">
              <span>Coherence:</span>
              <span className="font-mono">{simulationData.consciousness.coherence.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Awareness:</span>
              <span className="font-mono">{simulationData.consciousness.awareness.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="data-card bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-yellow-400">👆 Gesture Data</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-mono capitalize">{simulationData.gesture.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence:</span>
              <span className="font-mono">{simulationData.gesture.confidence.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Position:</span>
              <span className="font-mono">
                ({simulationData.gesture.coordinates[0].toFixed(0)}, {simulationData.gesture.coordinates[1].toFixed(0)})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pattern:</span>
              <span className="font-mono text-xs truncate">{simulationData.gesture.pattern}</span>
            </div>
          </div>
        </div>

        <div className="data-card bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-blue-400">📊 Biometric Data</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Heart Rate:</span>
              <span className="font-mono">{simulationData.biometrics.heartRate.toFixed(0)} BPM</span>
            </div>
            <div className="flex justify-between">
              <span>Breath Rate:</span>
              <span className="font-mono">{simulationData.biometrics.breathRate.toFixed(1)} BPM</span>
            </div>
            <div className="flex justify-between">
              <span>Skin Conductance:</span>
              <span className="font-mono">{simulationData.biometrics.skinConductance.toFixed(1)} μS</span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span className="font-mono">{simulationData.biometrics.temperature.toFixed(1)}°C</span>
            </div>
          </div>
        </div>

        <div className="data-card bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-cyan-400">⚙️ Simulation Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-mono ${isSimulationActive ? 'text-green-400' : 'text-red-400'}`}>
                {isSimulationActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Speed:</span>
              <span className="font-mono">{simulationSpeed}x</span>
            </div>
            <div className="flex justify-between">
              <span>Scenario:</span>
              <span className="font-mono">{SIMULATION_SCENARIOS[currentScenario]?.name || 'Manual'}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Update:</span>
              <span className="font-mono text-xs">
                {new Date(simulationData.breath.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-cyan-300">⚡ Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleCoherenceChange(0.2)}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Low Coherence
          </button>
          <button
            onClick={() => handleCoherenceChange(0.5)}
            className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors"
          >
            Medium Coherence
          </button>
          <button
            onClick={() => handleCoherenceChange(0.8)}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            High Coherence
          </button>
          <button
            onClick={() => {
              handleConsciousnessChange(0.95);
              handleCoherenceChange(0.95);
            }}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
          >
            Transcendence
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ConsciousnessSimulatorPanel; 