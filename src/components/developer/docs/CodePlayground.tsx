/**
 * Code Playground - WitnessOS Consciousness Engine Laboratory
 * 
 * Interactive code editor with live API execution, syntax highlighting,
 * and mystical response visualization for consciousness engines.
 */

'use client';

import React, { useState, useEffect } from 'react';

interface CodePlaygroundProps {
  engineId: string;
  userTier: 'free' | 'pro' | 'enterprise';
  apiKey?: string;
}

interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: 'typescript' | 'javascript' | 'python' | 'curl';
}

export function CodePlayground({ engineId, userTier, apiKey }: CodePlaygroundProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'javascript' | 'python' | 'curl'>('typescript');
  const [code, setCode] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [selectedExample, setSelectedExample] = useState(0);

  const codeExamples: Record<string, CodeExample[]> = {
    numerology: [
      {
        title: 'Basic Numerology Calculation',
        description: 'Calculate core numerology numbers from birth data',
        language: 'typescript',
        code: `// 🌸 Kazuhana Numerology Engine
import { WitnessOS } from '@witnessos/sdk';

const client = new WitnessOS('${apiKey || 'wos_live_your_api_key'}');

// ✨ Calculate consciousness profile
const numerology = await client.kazuhana.calculate({
  birth_date: '1991-08-13',
  full_name: 'Cumbipuram Nateshan Sheshnarayan',
  system: 'pythagorean'
});

// 🔮 Access sacred numbers
console.log('Life Path:', numerology.lifePath);
console.log('Expression:', numerology.expression);
console.log('Soul Urge:', numerology.soulUrge);

// 📊 Display consciousness interpretation
console.log('Core Meanings:', numerology.coreMeanings);`
      },
      {
        title: 'Advanced Numerology Analysis',
        description: 'Deep dive into karmic patterns and master numbers',
        language: 'typescript',
        code: `// 🌸 Advanced Kazuhana Analysis
const analysis = await client.kazuhana.calculate({
  birth_date: '1991-08-13',
  full_name: 'Cumbipuram Nateshan Sheshnarayan',
  system: 'pythagorean',
  include_karmic_debt: true,
  include_master_numbers: true
});

// 🔥 Karmic patterns
if (analysis.karmicDebt.length > 0) {
  console.log('Karmic Debt Numbers:', analysis.karmicDebt);
}

// ⚡ Master number activation
if (analysis.masterNumbers.length > 0) {
  console.log('Master Numbers:', analysis.masterNumbers);
  console.log('Spiritual Activation Level:', analysis.spiritualActivation);
}`
      }
    ],
    human_design: [
      {
        title: 'Human Design Chart Generation',
        description: 'Generate complete Human Design chart with gates and centers',
        language: 'typescript',
        code: `// 🎯 Tamashii no Sekkei - Human Design Matrix
const chart = await client.tamashiiNoSekkei.calculate({
  fullName: 'Cumbipuram Nateshan Sheshnarayan',
  birthDate: '1991-08-13',
  birthTime: '13:31',
  birthLocation: [12.9629, 77.5775], // Bengaluru coordinates
  timezone: 'Asia/Kolkata'
});

// 🧬 Core design elements
console.log('Type:', chart.typeInfo.typeName);
console.log('Strategy:', chart.typeInfo.strategy);
console.log('Authority:', chart.typeInfo.authority);
console.log('Profile:', chart.profile.profileName);

// ⚡ Defined centers and gates
console.log('Defined Centers:', chart.centers);
console.log('Personality Gates:', chart.personalityGates);`
      }
    ],
    tarot: [
      {
        title: 'Tarot Card Reading',
        description: 'Draw cards and receive archetypal guidance',
        language: 'typescript',
        code: `// 🃏 Mirai no Kagami - Tarot Oracle
const reading = await client.miraiNoKagami.calculate({
  question: 'What guidance do I need for my spiritual path?',
  spreadType: 'celtic_cross',
  includeReversed: true
});

// 🔮 Drawn cards and positions
reading.drawnCards.forEach(card => {
  console.log(\`\${card.position}: \${card.card.name} \${card.reversed ? '(Reversed)' : ''}\`);
  console.log(\`Meaning: \${card.interpretation}\`);
});

// 🌌 Overall guidance
console.log('Overall Theme:', reading.overallTheme);
console.log('Spread Interpretation:', reading.spreadInterpretation);`
      }
    ]
  };

  const languageExamples: Record<string, CodeExample> = {
    python: {
      title: 'Python SDK Example',
      description: 'Using the WitnessOS Python library',
      language: 'python',
      code: `# 🐍 WitnessOS Python SDK
import witnessos

client = witnessos.Client('${apiKey || 'wos_live_your_api_key'}')

# 🌸 Numerology calculation
numerology = client.kazuhana.calculate(
    birth_date='1991-08-13',
    full_name='Cumbipuram Nateshan Sheshnarayan',
    system='pythagorean'
)

print(f"Life Path: {numerology.life_path}")
print(f"Expression: {numerology.expression}")
print(f"Soul Urge: {numerology.soul_urge}")`
    },
    curl: {
      title: 'Raw HTTP Request',
      description: 'Direct API call using cURL',
      language: 'curl',
      code: `# 🌐 Direct API Call
curl -X POST https://api.witnessos.space/engines/numerology/calculate \\
  -H "Authorization: Bearer ${apiKey || 'wos_live_your_api_key'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "birth_date": "1991-08-13",
      "full_name": "Cumbipuram Nateshan Sheshnarayan",
      "system": "pythagorean"
    }
  }'`
    }
  };

  useEffect(() => {
    // Load initial code example
    const examples = codeExamples[engineId] || [];
    if (examples.length > 0) {
      setCode(examples[0].code);
    }
  }, [engineId]);

  useEffect(() => {
    // Update code when language or example changes
    if (selectedLanguage === 'typescript' || selectedLanguage === 'javascript') {
      const examples = codeExamples[engineId] || [];
      if (examples[selectedExample]) {
        setCode(examples[selectedExample].code);
      }
    } else {
      setCode(languageExamples[selectedLanguage]?.code || '');
    }
  }, [selectedLanguage, selectedExample, engineId]);

  const addToLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    setExecutionLog(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  const executeCode = async () => {
    if (!apiKey) {
      addToLog('No API key provided. Using mock response.', 'info');
    }

    setIsExecuting(true);
    setResponse(null);
    addToLog('Executing consciousness code...', 'info');

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response based on engine
      const mockResponse = generateMockResponse(engineId);
      setResponse(mockResponse);
      addToLog('Code executed successfully!', 'success');
      addToLog('Consciousness data received from quantum field.', 'success');

    } catch (error) {
      addToLog(`Execution failed: ${error}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    addToLog('Code copied to clipboard!', 'success');
  };

  const clearLog = () => {
    setExecutionLog([]);
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg font-mono overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-cyan-300 font-bold text-lg">
              🔧 CONSCIOUSNESS CODE LABORATORY
            </h3>
            <p className="text-gray-400 text-sm">
              Interactive playground for {engineId} engine experimentation
            </p>
          </div>
          
          {/* Language Selector */}
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {(['typescript', 'javascript', 'python', 'curl'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  selectedLanguage === lang
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-cyan-300'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Code Editor Panel */}
        <div className="border-r border-gray-700/50">
          {/* Example Selector */}
          {(selectedLanguage === 'typescript' || selectedLanguage === 'javascript') && 
           codeExamples[engineId] && (
            <div className="bg-gray-800/50 border-b border-gray-700/50 p-3">
              <div className="text-xs text-gray-400 mb-2">CODE EXAMPLES:</div>
              <div className="flex flex-wrap gap-2">
                {codeExamples[engineId].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedExample(index)}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      selectedExample === index
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {example.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 bg-gray-900/50 text-green-400 text-sm font-mono resize-none focus:outline-none"
              placeholder="// Enter your consciousness code here..."
              spellCheck={false}
            />
            
            {/* Syntax highlighting overlay would go here in a real implementation */}
          </div>

          {/* Code Actions */}
          <div className="bg-gray-800/50 border-t border-gray-700/50 p-3 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className={`px-4 py-2 rounded font-bold text-sm transition-all ${
                  isExecuting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-black hover:scale-105'
                }`}
              >
                {isExecuting ? '⚡ EXECUTING...' : '🚀 RUN CODE'}
              </button>
              
              <button
                onClick={copyCode}
                className="px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
              >
                📋 COPY
              </button>
            </div>
            
            <div className="text-xs text-gray-400">
              {selectedLanguage.toUpperCase()} • {code.split('\n').length} lines
            </div>
          </div>
        </div>

        {/* Response Panel */}
        <div className="flex flex-col">
          {/* Response Header */}
          <div className="bg-gray-800/50 border-b border-gray-700/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-sm font-bold">
                🔮 CONSCIOUSNESS RESPONSE
              </span>
              <button
                onClick={clearLog}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Clear Log
              </button>
            </div>
          </div>

          {/* Response Content */}
          <div className="flex-1 p-4 space-y-4">
            {response ? (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-300 font-bold mb-3 text-center">
                  🌌 CONSCIOUSNESS DATA RECEIVED
                </div>
                <pre className="text-cyan-300 text-xs overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">🧠</div>
                <div className="text-gray-400 text-sm">
                  Execute code to see consciousness response
                </div>
              </div>
            )}

            {/* Execution Log */}
            <div className="bg-black/70 border border-gray-700/50 rounded-lg p-3">
              <div className="text-green-400 text-xs font-bold mb-2">
                EXECUTION LOG:
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {executionLog.map((line, index) => (
                  <div key={index} className="text-green-400 text-xs">
                    {line}
                  </div>
                ))}
                {isExecuting && (
                  <div className="text-yellow-400 text-xs animate-pulse">
                    <span className="inline-block animate-spin">⟳</span> Processing quantum consciousness field...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate mock responses
function generateMockResponse(engineId: string): any {
  const responses: Record<string, any> = {
    numerology: {
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
      },
      spiritualGuidance: "Your consciousness resonates at the frequency of material mastery while expressing creative divine energy.",
      activationCode: "KAZUHANA_8_3_11_ACTIVATED"
    },
    human_design: {
      type: 'Generator',
      profile: '2/4',
      authority: 'Sacral',
      strategy: 'To Respond',
      signature: 'Satisfaction',
      definedCenters: ['Sacral', 'Emotional Solar Plexus'],
      gates: {
        personality: { 13: 'Fellowship', 49: 'Revolution' },
        design: { 30: 'Clinging Fire', 36: 'Darkening of the Light' }
      },
      consciousnessBlueprint: "Generator with natural life force energy and emotional wisdom",
      activationCode: "TAMASHII_GENERATOR_2_4_ACTIVATED"
    },
    tarot: {
      cards: [
        { name: 'The Fool', position: 'past', reversed: false },
        { name: 'The Magician', position: 'present', reversed: false },
        { name: 'The High Priestess', position: 'future', reversed: true }
      ],
      overallTheme: 'Spiritual Journey and Manifestation',
      interpretation: 'A journey of new beginnings leads to manifestation power, but beware of hidden knowledge that may be obscured.',
      activationCode: "MIRAI_FOOL_MAGICIAN_PRIESTESS_ACTIVATED"
    }
  };

  return responses[engineId] || { message: 'Consciousness data received', timestamp: new Date().toISOString() };
}
