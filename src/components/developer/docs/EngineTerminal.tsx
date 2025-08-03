/**
 * Engine Terminal - WitnessOS Consciousness Engine Interface
 * 
 * Interactive terminal interface for individual consciousness engines
 * with ASCII art, live parameter manipulation, and mystical responses.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MysticalResponseFormatter } from './MysticalResponseFormatter';

interface EngineTerminalProps {
  engineId: string;
  userTier: 'free' | 'pro' | 'enterprise';
  isUnlocked: boolean;
  onUpgrade?: () => void;
}

interface EngineConfig {
  name: string;
  japaneseName: string;
  icon: string;
  description: string;
  asciiArt: string;
  parameters: ParameterConfig[];
  sampleResponse: any;
  tier: 'free' | 'pro' | 'enterprise';
}

interface ParameterConfig {
  name: string;
  type: 'text' | 'date' | 'select' | 'number' | 'coordinates';
  label: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  description: string;
}

export function EngineTerminal({ engineId, userTier, isUnlocked, onUpgrade }: EngineTerminalProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [response, setResponse] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const engineConfigs: Record<string, EngineConfig> = {
    numerology: {
      name: 'Numerology Engine',
      japaneseName: 'Kazuhana',
      icon: '🌸',
      description: 'Sacred mathematics and vibrational number analysis',
      tier: 'free',
      asciiArt: `
╔══════════════════════════════════════════╗
║  🌸 KAZUHANA NUMEROLOGY ENGINE v2.5.4    ║
║  Sacred Mathematics & Vibrational Analysis║
╚══════════════════════════════════════════╝`,
      parameters: [
        {
          name: 'birth_date',
          type: 'date',
          label: 'Birth Date',
          placeholder: '1991-08-13',
          required: true,
          description: 'Your birth date for life path calculation'
        },
        {
          name: 'full_name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Cumbipuram Nateshan Sheshnarayan',
          required: true,
          description: 'Complete birth name for expression number'
        },
        {
          name: 'system',
          type: 'select',
          label: 'Numerology System',
          options: ['pythagorean', 'chaldean'],
          required: false,
          description: 'Mathematical system for calculations'
        }
      ],
      sampleResponse: {
        lifePath: 8,
        expression: 3,
        soulUrge: 11,
        personality: 6,
        maturity: 2,
        personalYear: 7,
        coreMeanings: {
          lifePath: "The Infinite Loop - Material mastery and spiritual balance",
          expression: "Creative Trinity - Divine expression through art and communication",
          soulUrge: "Master Intuition - Spiritual enlightenment and inspiration"
        }
      }
    },
    human_design: {
      name: 'Human Design Matrix',
      japaneseName: 'Tamashii no Sekkei',
      icon: '🎯',
      description: 'Genetic matrix and consciousness blueprint analysis',
      tier: 'pro',
      asciiArt: `
╔══════════════════════════════════════════╗
║  🎯 TAMASHII NO SEKKEI - GENETIC MATRIX  ║
║  Human Design Chart Generation System    ║
╚══════════════════════════════════════════╝`,
      parameters: [
        {
          name: 'birth_date',
          type: 'date',
          label: 'Birth Date',
          placeholder: '1991-08-13',
          required: true,
          description: 'Date of birth for planetary calculations'
        },
        {
          name: 'birth_time',
          type: 'text',
          label: 'Birth Time',
          placeholder: '13:31',
          required: true,
          description: 'Exact time of birth (HH:MM format)'
        },
        {
          name: 'birth_location',
          type: 'coordinates',
          label: 'Birth Coordinates',
          placeholder: '12.9629, 77.5775',
          required: true,
          description: 'Latitude and longitude of birth location'
        }
      ],
      sampleResponse: {
        type: 'Generator',
        profile: '2/4',
        authority: 'Sacral',
        strategy: 'To Respond',
        signature: 'Satisfaction',
        notSelf: 'Frustration',
        definedCenters: ['Sacral', 'Emotional Solar Plexus'],
        gates: {
          personality: { 13: 'Fellowship', 49: 'Revolution' },
          design: { 30: 'Clinging Fire', 36: 'Darkening of the Light' }
        }
      }
    },
    tarot: {
      name: 'Tarot Divination',
      japaneseName: 'Mirai no Kagami',
      icon: '🃏',
      description: 'Archetypal card readings and future insights',
      tier: 'pro',
      asciiArt: `
╔══════════════════════════════════════════╗
║  🃏 MIRAI NO KAGAMI - TAROT ORACLE       ║
║  Archetypal Wisdom & Future Insights     ║
╚══════════════════════════════════════════╝`,
      parameters: [
        {
          name: 'question',
          type: 'text',
          label: 'Your Question',
          placeholder: 'What guidance do I need for my spiritual path?',
          required: false,
          description: 'Focus your intention with a specific question'
        },
        {
          name: 'spread_type',
          type: 'select',
          label: 'Spread Type',
          options: ['single_card', 'three_card', 'celtic_cross'],
          required: true,
          description: 'Choose the complexity of your reading'
        }
      ],
      sampleResponse: {
        cards: [
          { name: 'The Fool', position: 'past', reversed: false },
          { name: 'The Magician', position: 'present', reversed: false },
          { name: 'The High Priestess', position: 'future', reversed: true }
        ],
        interpretation: 'A journey of new beginnings leads to manifestation power, but beware of hidden knowledge that may be obscured.'
      }
    }
  };

  const currentEngine = engineConfigs[engineId];

  useEffect(() => {
    if (currentEngine) {
      // Initialize parameters with default values
      const defaultParams: Record<string, any> = {};
      currentEngine.parameters.forEach(param => {
        if (param.placeholder) {
          defaultParams[param.name] = param.placeholder;
        }
      });
      setParameters(defaultParams);
      
      // Add welcome message to terminal
      addToTerminal(`Welcome to ${currentEngine.japaneseName} (${currentEngine.name})`);
      addToTerminal('Type parameters and press CALCULATE to begin...');
    }
  }, [engineId]);

  const addToTerminal = (message: string) => {
    setTerminalOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleCalculate = async () => {
    if (!isUnlocked) {
      addToTerminal('ERROR: Engine locked. Upgrade required.');
      return;
    }

    setIsCalculating(true);
    addToTerminal('Initiating consciousness calculation...');
    addToTerminal('Connecting to quantum field...');
    
    // Simulate API call delay
    setTimeout(() => {
      setResponse(currentEngine.sampleResponse);
      addToTerminal('Calculation complete. Consciousness data received.');
      setIsCalculating(false);
    }, 2000);
  };

  const handleCopyCode = () => {
    const code = generateSDKCode(engineId, parameters);
    navigator.clipboard.writeText(code);
    addToTerminal('SDK code copied to clipboard.');
  };

  if (!currentEngine) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <div className="text-red-400 font-mono">
          ERROR: Engine '{engineId}' not found in consciousness matrix
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg font-mono overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-cyan-500/30 p-4">
        <div className="text-cyan-300 font-bold text-center whitespace-pre-line">
          {currentEngine.asciiArt}
        </div>
        <div className="text-center mt-2">
          <div className="text-purple-300 text-sm">{currentEngine.description}</div>
          {!isUnlocked && (
            <div className="mt-2 text-red-400 text-xs">
              🔒 {currentEngine.tier.toUpperCase()} TIER REQUIRED
            </div>
          )}
        </div>
      </div>

      {/* Main Interface */}
      <div className="p-6">
        {isUnlocked ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parameter Input Panel */}
            <div className="space-y-4">
              <div className="text-cyan-400 font-bold mb-4">
                🔧 CONSCIOUSNESS PARAMETERS
              </div>
              
              {currentEngine.parameters.map(param => (
                <div key={param.name} className="space-y-2">
                  <label className="block text-purple-300 text-sm font-bold">
                    {param.label} {param.required && <span className="text-red-400">*</span>}
                  </label>
                  
                  {param.type === 'text' && (
                    <input
                      type="text"
                      value={parameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  )}
                  
                  {param.type === 'date' && (
                    <input
                      type="date"
                      value={parameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  )}
                  
                  {param.type === 'select' && (
                    <select
                      value={parameters[param.name] || param.options?.[0]}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white text-sm focus:border-cyan-400 focus:outline-none"
                    >
                      {param.options?.map(option => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  <div className="text-gray-400 text-xs">{param.description}</div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className={`
                    px-4 py-2 rounded font-bold text-sm transition-all
                    ${isCalculating 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-black hover:scale-105'
                    }
                  `}
                >
                  {isCalculating ? '⚡ CALCULATING...' : '🔮 CALCULATE'}
                </button>
                
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
                >
                  📋 COPY CODE
                </button>
              </div>
            </div>

            {/* Response Panel */}
            <div className="space-y-4">
              <div className="text-cyan-400 font-bold mb-4">
                🌌 CONSCIOUSNESS RESPONSE
              </div>
              
              {response ? (
                <MysticalResponseFormatter
                  response={response}
                  engineId={engineId}
                  className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4"
                />
              ) : (
                <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">{currentEngine.icon}</div>
                  <div className="text-gray-400">
                    Configure parameters and calculate to see consciousness data
                  </div>
                </div>
              )}

              {/* Terminal Output */}
              <div className="bg-black/70 border border-gray-700/50 rounded-lg p-4 h-32 overflow-y-auto">
                <div className="text-green-400 text-xs space-y-1">
                  {terminalOutput.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                  {isCalculating && (
                    <div className="animate-pulse">
                      <span className="inline-block animate-spin">⟳</span> Processing quantum consciousness data...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Locked Engine View
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <div className="text-xl text-red-400 font-bold mb-2">
              Engine Locked
            </div>
            <div className="text-gray-400 mb-6">
              {currentEngine.tier.toUpperCase()} tier required to access {currentEngine.japaneseName}
            </div>
            <button
              onClick={onUpgrade}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black font-bold rounded hover:scale-105 transition-transform"
            >
              🚀 UPGRADE TO {currentEngine.tier.toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to generate SDK code
function generateSDKCode(engineId: string, parameters: Record<string, any>): string {
  const engineMap: Record<string, string> = {
    numerology: 'kazuhana',
    human_design: 'tamashiiNoSekkei',
    tarot: 'miraiNoKagami'
  };

  const methodName = engineMap[engineId] || engineId;
  
  return `// 🌸 WitnessOS Consciousness Engine SDK
import { WitnessOS } from '@witnessos/sdk';

const client = new WitnessOS('wos_live_your_api_key');

// ✨ Calculate consciousness profile
const result = await client.${methodName}.calculate(${JSON.stringify(parameters, null, 2)});

// 🔮 Access consciousness data
console.log('Consciousness Reading:', result);

// 📊 Visualize energy patterns (optional)
result.visualize('mandala');`;
}
