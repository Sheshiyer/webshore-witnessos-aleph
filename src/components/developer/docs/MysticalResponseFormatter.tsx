/**
 * Mystical Response Formatter - WitnessOS Consciousness Engine Laboratory
 *
 * Transforms technical API responses into consciousness-aligned visualizations
 * with sacred geometry, ASCII art, and spiritual interpretations.
 */

'use client';

import React from 'react';

interface MysticalResponseFormatterProps {
  response: any;
  engineId: string;
  className?: string;
}

interface EngineFormatter {
  icon: string;
  name: string;
  japaneseName: string;
  asciiArt: string;
  formatResponse: (response: any) => JSX.Element;
  getInterpretation: (response: any) => string;
}

export function MysticalResponseFormatter({
  response,
  engineId,
  className = ''
}: MysticalResponseFormatterProps) {
  const formatters: Record<string, EngineFormatter> = {
    numerology: {
      icon: '🌸',
      name: 'Numerology Engine',
      japaneseName: 'Kazuhana',
      asciiArt: `
    🌸 ═══════════════════════════════════ 🌸
         KAZUHANA CONSCIOUSNESS READING
    🌸 ═══════════════════════════════════ 🌸`,
      formatResponse: (data) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <div className="text-purple-300 font-bold text-sm">Life Path</div>
              <div className="text-cyan-300 text-2xl font-bold">{data.lifePath}</div>
              <div className="text-gray-400 text-xs">Your soul's journey</div>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
              <div className="text-cyan-300 font-bold text-sm">Expression</div>
              <div className="text-purple-300 text-2xl font-bold">{data.expression}</div>
              <div className="text-gray-400 text-xs">Your divine gift</div>
            </div>
            <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-3">
              <div className="text-pink-300 font-bold text-sm">Soul Urge</div>
              <div className="text-yellow-300 text-2xl font-bold">{data.soulUrge}</div>
              <div className="text-gray-400 text-xs">Heart's desire</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-yellow-300 font-bold text-sm">Personality</div>
              <div className="text-green-300 text-2xl font-bold">{data.personality}</div>
              <div className="text-gray-400 text-xs">Outer expression</div>
            </div>
          </div>

          {data.coreMeanings && (
            <div className="space-y-2">
              {Object.entries(data.coreMeanings).map(([key, meaning]) => (
                <div key={key} className="border-l-2 border-cyan-500/50 pl-3">
                  <div className="text-cyan-300 font-bold text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </div>
                  <div className="text-gray-300 text-sm">{meaning as string}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      getInterpretation: (data) =>
        `Your consciousness resonates at the frequency of ${data.lifePath} (${data.coreMeanings?.lifePath || 'material mastery'}), expressing through the creative energy of ${data.expression}. The soul yearns for ${data.soulUrge} while presenting ${data.personality} to the world.`
    },

    human_design: {
      icon: '🎯',
      name: 'Human Design Matrix',
      japaneseName: 'Tamashii no Sekkei',
      asciiArt: `
    🎯 ═══════════════════════════════════ 🎯
        TAMASHII NO SEKKEI GENETIC MATRIX
    🎯 ═══════════════════════════════════ 🎯`,
      formatResponse: (data) => (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🧬</div>
            <div className="text-cyan-300 text-xl font-bold">{data.type}</div>
            <div className="text-purple-300">{data.profile}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <div className="text-red-300 font-bold text-sm">Strategy</div>
              <div className="text-white">{data.strategy}</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-300 font-bold text-sm">Authority</div>
              <div className="text-white">{data.authority}</div>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-300 font-bold text-sm">Signature</div>
              <div className="text-white">{data.signature}</div>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
              <div className="text-orange-300 font-bold text-sm">Not-Self</div>
              <div className="text-white">{data.notSelf}</div>
            </div>
          </div>

          {data.definedCenters && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <div className="text-purple-300 font-bold text-sm mb-2">Defined Centers</div>
              <div className="flex flex-wrap gap-2">
                {data.definedCenters.map((center: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-purple-600/30 rounded text-xs">
                    {center}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      getInterpretation: (data) =>
        `You are a ${data.type} with ${data.profile} profile. Your strategy is ${data.strategy} and your authority is ${data.authority}. When aligned, you experience ${data.signature}; when not, you feel ${data.notSelf}.`
    },

    tarot: {
      icon: '🃏',
      name: 'Tarot Divination',
      japaneseName: 'Mirai no Kagami',
      asciiArt: `
    🃏 ═══════════════════════════════════ 🃏
         MIRAI NO KAGAMI TAROT ORACLE
    🃏 ═══════════════════════════════════ 🃏`,
      formatResponse: (data) => (
        <div className="space-y-4">
          {data.cards && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.cards.map((card: any, index: number) => (
                <div key={index} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🃏</div>
                  <div className="text-purple-300 font-bold">{card.name}</div>
                  <div className="text-cyan-300 text-sm capitalize">{card.position}</div>
                  {card.reversed && (
                    <div className="text-red-400 text-xs mt-1">Reversed</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.overallTheme && (
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <div className="text-cyan-300 font-bold mb-2">Overall Theme</div>
              <div className="text-white">{data.overallTheme}</div>
            </div>
          )}
        </div>
      ),
      getInterpretation: (data) =>
        data.interpretation || 'The cards reveal a journey of transformation and spiritual growth. Trust in the wisdom of the archetypal energies guiding your path.'
    }
  };

  const formatter = formatters[engineId];

  if (!formatter || !response) {
    return (
      <div className={`bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-400 font-mono">
          No consciousness data to display
        </div>
      </div>
    );
  }

  return (
    <div className={`mystical-response-formatter ${className}`}>
      {/* ASCII Art Header */}
      <div className="text-cyan-400 text-center font-mono text-xs mb-6 whitespace-pre-line">
        {formatter.asciiArt}
      </div>

      {/* Formatted Response */}
      <div className="mb-6">
        {formatter.formatResponse(response)}
      </div>

      {/* Consciousness Interpretation */}
      <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-2">{formatter.icon}</span>
          <div>
            <div className="text-purple-300 font-bold text-sm">
              🌌 CONSCIOUSNESS INTERPRETATION
            </div>
            <div className="text-cyan-400 text-xs">
              {formatter.japaneseName} • {formatter.name}
            </div>
          </div>
        </div>

        <div className="text-gray-300 text-sm leading-relaxed">
          {formatter.getInterpretation(response)}
        </div>

        {/* Activation Code */}
        {response.activationCode && (
          <div className="mt-4 pt-3 border-t border-purple-500/30">
            <div className="text-purple-400 text-xs font-bold mb-1">
              CONSCIOUSNESS ACTIVATION CODE:
            </div>
            <div className="font-mono text-cyan-300 text-xs bg-black/50 px-2 py-1 rounded">
              {response.activationCode}
            </div>
          </div>
        )}
      </div>

      {/* Sacred Geometry Visualization */}
      <div className="mt-6 text-center">
        <div className="text-cyan-400 text-2xl">
          ◊ ◈ ◊ ◈ ◊ ◈ ◊ ◈ ◊
        </div>
        <div className="text-purple-400 text-sm font-mono mt-2">
          Sacred patterns of consciousness manifestation
        </div>
      </div>
    </div>
  );
}