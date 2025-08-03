/**
 * Engine Discovery Map - WitnessOS Consciousness Engine Laboratory
 * 
 * Constellation-style navigation for exploring consciousness engines
 * with cyberpunk aesthetics and gamified progression system.
 */

'use client';

import React, { useState } from 'react';

interface ConsciousnessEngine {
  id: string;
  name: string;
  japaneseName: string;
  icon: string;
  description: string;
  tier: 'free' | 'pro' | 'enterprise';
  category: 'divination' | 'personality' | 'cycles' | 'sacred' | 'advanced';
  complexity: 'novice' | 'adept' | 'master';
  isUnlocked: boolean;
  masteryLevel: number; // 0-100
  achievements: string[];
}

interface EngineDiscoveryMapProps {
  userTier: 'free' | 'pro' | 'enterprise';
  onEngineSelect: (engineId: string) => void;
  selectedEngine?: string;
}

export function EngineDiscoveryMap({ 
  userTier, 
  onEngineSelect, 
  selectedEngine 
}: EngineDiscoveryMapProps) {
  const [hoveredEngine, setHoveredEngine] = useState<string | null>(null);

  const consciousnessEngines: ConsciousnessEngine[] = [
    // Tier 1 - Free Engines
    {
      id: 'numerology',
      name: 'Numerology Engine',
      japaneseName: 'Kazuhana',
      icon: '🌸',
      description: 'Sacred mathematics and vibrational number analysis',
      tier: 'free',
      category: 'divination',
      complexity: 'novice',
      isUnlocked: true,
      masteryLevel: 75,
      achievements: ['First Calculation', 'Life Path Master']
    },
    {
      id: 'biorhythm',
      name: 'Biorhythm Engine',
      japaneseName: 'Seimei no Rizumu',
      icon: '🌊',
      description: 'Life cycle analysis and energy pattern tracking',
      tier: 'free',
      category: 'cycles',
      complexity: 'novice',
      isUnlocked: true,
      masteryLevel: 60,
      achievements: ['Cycle Tracker']
    },
    {
      id: 'iching',
      name: 'I-Ching Oracle',
      japaneseName: 'Ekikyō no Koe',
      icon: '🔮',
      description: 'Ancient Chinese divination and wisdom guidance',
      tier: 'free',
      category: 'divination',
      complexity: 'adept',
      isUnlocked: true,
      masteryLevel: 40,
      achievements: ['Hexagram Reader']
    },

    // Tier 2 - Pro Engines
    {
      id: 'human_design',
      name: 'Human Design Matrix',
      japaneseName: 'Tamashii no Sekkei',
      icon: '🎯',
      description: 'Genetic matrix and consciousness blueprint analysis',
      tier: 'pro',
      category: 'personality',
      complexity: 'master',
      isUnlocked: userTier === 'pro' || userTier === 'enterprise',
      masteryLevel: userTier === 'free' ? 0 : 85,
      achievements: userTier === 'free' ? [] : ['Chart Generator', 'Type Master']
    },
    {
      id: 'tarot',
      name: 'Tarot Divination',
      japaneseName: 'Mirai no Kagami',
      icon: '🃏',
      description: 'Archetypal card readings and future insights',
      tier: 'pro',
      category: 'divination',
      complexity: 'adept',
      isUnlocked: userTier === 'pro' || userTier === 'enterprise',
      masteryLevel: userTier === 'free' ? 0 : 55,
      achievements: userTier === 'free' ? [] : ['Card Reader']
    },
    {
      id: 'gene_keys',
      name: 'Gene Keys Matrix',
      japaneseName: 'Idenshi no Kagi',
      icon: '🧬',
      description: 'Hologenetic profile and evolutionary guidance',
      tier: 'pro',
      category: 'personality',
      complexity: 'master',
      isUnlocked: userTier === 'pro' || userTier === 'enterprise',
      masteryLevel: userTier === 'free' ? 0 : 30,
      achievements: userTier === 'free' ? [] : ['Gene Decoder']
    },
    {
      id: 'enneagram',
      name: 'Enneagram Analysis',
      japaneseName: 'Kokoro no Chizu',
      icon: '🎭',
      description: 'Nine-type personality system and growth paths',
      tier: 'pro',
      category: 'personality',
      complexity: 'adept',
      isUnlocked: userTier === 'pro' || userTier === 'enterprise',
      masteryLevel: userTier === 'free' ? 0 : 70,
      achievements: userTier === 'free' ? [] : ['Type Identifier']
    },
    {
      id: 'vimshottari',
      name: 'Vimshottari Dasha',
      japaneseName: 'Jikan no Shisha',
      icon: '⏰',
      description: 'Vedic planetary periods and timing analysis',
      tier: 'pro',
      category: 'cycles',
      complexity: 'master',
      isUnlocked: userTier === 'pro' || userTier === 'enterprise',
      masteryLevel: userTier === 'free' ? 0 : 45,
      achievements: userTier === 'free' ? [] : ['Dasha Calculator']
    },
    {
      id: 'sacred_geometry',
      name: 'Sacred Geometry',
      japaneseName: 'Shinsei Kikagaku',
      icon: '🔺',
      description: 'Divine patterns and geometric consciousness',
      tier: 'pro',
      category: 'sacred',
      complexity: 'adept',
      isUnlocked: userTier === 'pro' || userTier === 'enterprise',
      masteryLevel: userTier === 'free' ? 0 : 25,
      achievements: userTier === 'free' ? [] : ['Pattern Weaver']
    },

    // Tier 3 - Enterprise Engines
    {
      id: 'sigil_forge',
      name: 'Sigil Forge',
      japaneseName: 'Shirushi no Kajiba',
      icon: '🔥',
      description: 'Intention-based symbol creation and manifestation',
      tier: 'enterprise',
      category: 'advanced',
      complexity: 'master',
      isUnlocked: userTier === 'enterprise',
      masteryLevel: userTier === 'enterprise' ? 90 : 0,
      achievements: userTier === 'enterprise' ? ['Sigil Master', 'Symbol Architect'] : []
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'text-green-400 border-green-500/30';
      case 'pro': return 'text-yellow-400 border-yellow-500/30';
      case 'enterprise': return 'text-purple-400 border-purple-500/30';
      default: return 'text-gray-400 border-gray-500/30';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'novice': return 'text-cyan-400';
      case 'adept': return 'text-purple-400';
      case 'master': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getMasteryBar = (level: number) => {
    const segments = 10;
    const filledSegments = Math.floor((level / 100) * segments);
    return Array.from({ length: segments }, (_, i) => (
      <span key={i} className={`inline-block w-1 h-2 mr-0.5 ${
        i < filledSegments ? 'bg-cyan-400' : 'bg-gray-700'
      }`} />
    ));
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 font-mono">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-cyan-400 text-lg font-bold mb-2">
          🧠 CONSCIOUSNESS ENGINE LABORATORY
        </div>
        <div className="text-gray-400 text-sm">
          Explore the depths of consciousness through mystical computation
        </div>
        <div className="mt-4 text-xs text-purple-300">
          Current Access Level: <span className={getTierColor(userTier)}>{userTier.toUpperCase()}</span>
        </div>
      </div>

      {/* Engine Constellation */}
      <div className="space-y-8">
        {/* Tier 1 - Free Engines */}
        <div>
          <div className="flex items-center mb-4">
            <span className="text-green-400 font-bold">⭐ TIER 1 ENGINES</span>
            <span className="ml-2 text-xs text-gray-500">(UNLOCKED)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {consciousnessEngines.filter(e => e.tier === 'free').map(engine => (
              <EngineCard
                key={engine.id}
                engine={engine}
                isSelected={selectedEngine === engine.id}
                isHovered={hoveredEngine === engine.id}
                onSelect={() => onEngineSelect(engine.id)}
                onHover={() => setHoveredEngine(engine.id)}
                onLeave={() => setHoveredEngine(null)}
                getTierColor={getTierColor}
                getComplexityColor={getComplexityColor}
                getMasteryBar={getMasteryBar}
              />
            ))}
          </div>
        </div>

        {/* Tier 2 - Pro Engines */}
        <div>
          <div className="flex items-center mb-4">
            <span className="text-yellow-400 font-bold">🔒 TIER 2 ENGINES</span>
            <span className="ml-2 text-xs text-gray-500">
              {userTier === 'free' ? '(PRO REQUIRED)' : '(UNLOCKED)'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {consciousnessEngines.filter(e => e.tier === 'pro').map(engine => (
              <EngineCard
                key={engine.id}
                engine={engine}
                isSelected={selectedEngine === engine.id}
                isHovered={hoveredEngine === engine.id}
                onSelect={() => engine.isUnlocked && onEngineSelect(engine.id)}
                onHover={() => setHoveredEngine(engine.id)}
                onLeave={() => setHoveredEngine(null)}
                getTierColor={getTierColor}
                getComplexityColor={getComplexityColor}
                getMasteryBar={getMasteryBar}
              />
            ))}
          </div>
        </div>

        {/* Tier 3 - Enterprise Engines */}
        <div>
          <div className="flex items-center mb-4">
            <span className="text-purple-400 font-bold">⚡ TIER 3 ENGINES</span>
            <span className="ml-2 text-xs text-gray-500">
              {userTier === 'enterprise' ? '(UNLOCKED)' : '(ENTERPRISE REQUIRED)'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {consciousnessEngines.filter(e => e.tier === 'enterprise').map(engine => (
              <EngineCard
                key={engine.id}
                engine={engine}
                isSelected={selectedEngine === engine.id}
                isHovered={hoveredEngine === engine.id}
                onSelect={() => engine.isUnlocked && onEngineSelect(engine.id)}
                onHover={() => setHoveredEngine(engine.id)}
                onLeave={() => setHoveredEngine(null)}
                getTierColor={getTierColor}
                getComplexityColor={getComplexityColor}
                getMasteryBar={getMasteryBar}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-cyan-400 font-bold mb-2">COMPLEXITY LEVELS</div>
            <div className="space-y-1">
              <div className="text-cyan-400">● Novice - Basic operations</div>
              <div className="text-purple-400">● Adept - Advanced features</div>
              <div className="text-pink-400">● Master - Expert integration</div>
            </div>
          </div>
          <div>
            <div className="text-cyan-400 font-bold mb-2">ACCESS TIERS</div>
            <div className="space-y-1">
              <div className="text-green-400">● Free - Core engines</div>
              <div className="text-yellow-400">● Pro - Advanced engines</div>
              <div className="text-purple-400">● Enterprise - All engines</div>
            </div>
          </div>
          <div>
            <div className="text-cyan-400 font-bold mb-2">MASTERY PROGRESS</div>
            <div className="space-y-1">
              <div className="text-gray-300">Progress bars show your</div>
              <div className="text-gray-300">experience with each engine</div>
              <div className="text-cyan-400">Complete quests to advance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Engine Card Component
interface EngineCardProps {
  engine: ConsciousnessEngine;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  getTierColor: (tier: string) => string;
  getComplexityColor: (complexity: string) => string;
  getMasteryBar: (level: number) => JSX.Element[];
}

function EngineCard({
  engine,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
  getTierColor,
  getComplexityColor,
  getMasteryBar
}: EngineCardProps) {
  return (
    <div
      className={`
        relative p-4 rounded-lg border transition-all duration-300 cursor-pointer
        ${engine.isUnlocked 
          ? 'bg-gray-900/50 border-gray-700/50 hover:border-cyan-500/50' 
          : 'bg-gray-900/20 border-gray-800/50 opacity-60'
        }
        ${isSelected ? 'border-cyan-400 bg-cyan-900/20' : ''}
        ${isHovered && engine.isUnlocked ? 'scale-105 shadow-lg shadow-cyan-500/20' : ''}
      `}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Lock Overlay */}
      {!engine.isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-xs text-gray-400">
              {engine.tier.toUpperCase()} REQUIRED
            </div>
          </div>
        </div>
      )}

      {/* Engine Icon & Name */}
      <div className="text-center mb-3">
        <div className="text-3xl mb-2">{engine.icon}</div>
        <div className="text-white font-bold text-sm">{engine.name}</div>
        <div className="text-cyan-400 text-xs">{engine.japaneseName}</div>
      </div>

      {/* Description */}
      <div className="text-gray-400 text-xs text-center mb-3">
        {engine.description}
      </div>

      {/* Metadata */}
      <div className="space-y-2">
        {/* Tier & Complexity */}
        <div className="flex justify-between text-xs">
          <span className={getTierColor(engine.tier)}>
            {engine.tier.toUpperCase()}
          </span>
          <span className={getComplexityColor(engine.complexity)}>
            {engine.complexity.toUpperCase()}
          </span>
        </div>

        {/* Mastery Progress */}
        {engine.isUnlocked && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Mastery</span>
              <span className="text-cyan-400">{engine.masteryLevel}%</span>
            </div>
            <div className="flex">
              {getMasteryBar(engine.masteryLevel)}
            </div>
          </div>
        )}

        {/* Achievements */}
        {engine.achievements.length > 0 && (
          <div className="text-xs">
            <div className="text-gray-400 mb-1">Achievements:</div>
            <div className="space-y-1">
              {engine.achievements.slice(0, 2).map((achievement, index) => (
                <div key={index} className="text-yellow-400">
                  🏆 {achievement}
                </div>
              ))}
              {engine.achievements.length > 2 && (
                <div className="text-gray-500">
                  +{engine.achievements.length - 2} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
