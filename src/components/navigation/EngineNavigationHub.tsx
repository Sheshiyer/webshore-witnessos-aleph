/**
 * Engine Navigation Hub Component
 * 
 * Comprehensive navigation interface for all 13 WitnessOS consciousness engines
 * Tier-based organization with user access control and cyberpunk aesthetic
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EngineName } from '@/types/engines';

interface EngineInfo {
  name: EngineName;
  displayName: string;
  icon: string;
  description: string;
  tier: 1 | 2 | 3;
  requiresBirthData: boolean;
  requiresCamera: boolean;
  status: 'operational' | 'beta' | 'maintenance';
  category: 'divination' | 'astrology' | 'psychology' | 'biometric' | 'sacred' | 'timing';
}

interface EngineNavigationHubProps {
  userTier: 1 | 2 | 3;
  unlockedEngines: EngineName[];
  onEngineSelect: (engine: EngineName) => void;
  currentEngine?: EngineName | null | undefined;
  showCategories?: boolean;
}

const ENGINE_REGISTRY: EngineInfo[] = [
  // Tier 1 - Basic Access
  {
    name: 'numerology',
    displayName: 'Numerology',
    icon: '🔢',
    description: 'Sacred number analysis and life path insights',
    tier: 1,
    requiresBirthData: true,
    requiresCamera: false,
    status: 'operational',
    category: 'divination'
  },
  {
    name: 'tarot',
    displayName: 'Tarot',
    icon: '🃏',
    description: 'Archetypal card guidance and wisdom',
    tier: 1,
    requiresBirthData: false,
    requiresCamera: false,
    status: 'operational',
    category: 'divination'
  },
  {
    name: 'iching',
    displayName: 'I Ching',
    icon: '☯️',
    description: 'Ancient Chinese divination and timing',
    tier: 1,
    requiresBirthData: false,
    requiresCamera: false,
    status: 'operational',
    category: 'divination'
  },
  {
    name: 'biorhythm',
    displayName: 'Biorhythm',
    icon: '📊',
    description: 'Natural cycle tracking and optimization',
    tier: 1,
    requiresBirthData: true,
    requiresCamera: false,
    status: 'operational',
    category: 'timing'
  },

  // Tier 2 - Birth Data Required
  {
    name: 'human_design',
    displayName: 'Human Design',
    icon: '👤',
    description: 'Bodygraph analysis and type determination',
    tier: 2,
    requiresBirthData: true,
    requiresCamera: false,
    status: 'operational',
    category: 'astrology'
  },
  {
    name: 'gene_keys',
    displayName: 'Gene Keys',
    icon: '🧬',
    description: 'Archetypal transformation system',
    tier: 2,
    requiresBirthData: true,
    requiresCamera: false,
    status: 'operational',
    category: 'astrology'
  },
  {
    name: 'vimshottari',
    displayName: 'Vimshottari Dasha',
    icon: '⏰',
    description: 'Vedic planetary period analysis',
    tier: 2,
    requiresBirthData: true,
    requiresCamera: false,
    status: 'operational',
    category: 'astrology'
  },
  {
    name: 'vedicclock_tcm',
    displayName: 'VedicClock-TCM',
    icon: '🌅',
    description: 'Multi-dimensional time optimization',
    tier: 2,
    requiresBirthData: true,
    requiresCamera: false,
    status: 'operational',
    category: 'timing'
  },
  {
    name: 'face_reading',
    displayName: 'Face Reading',
    icon: '🎭',
    description: 'Constitutional analysis via physiognomy',
    tier: 2,
    requiresBirthData: true,
    requiresCamera: true,
    status: 'operational',
    category: 'biometric'
  },

  // Tier 3 - Advanced Access
  {
    name: 'enneagram',
    displayName: 'Enneagram',
    icon: '🎭',
    description: 'Personality type system and growth',
    tier: 3,
    requiresBirthData: false,
    requiresCamera: false,
    status: 'operational',
    category: 'psychology'
  },
  {
    name: 'sacred_geometry',
    displayName: 'Sacred Geometry',
    icon: '🔺',
    description: 'Universal pattern analysis',
    tier: 3,
    requiresBirthData: false,
    requiresCamera: false,
    status: 'operational',
    category: 'sacred'
  },
  {
    name: 'sigil_forge',
    displayName: 'Sigil Forge',
    icon: '🔮',
    description: 'Intention manifestation symbols',
    tier: 3,
    requiresBirthData: false,
    requiresCamera: false,
    status: 'operational',
    category: 'sacred'
  },
  {
    name: 'biofield',
    displayName: 'Biofield Analysis',
    icon: '⚡',
    description: 'Advanced PIP energy field assessment',
    tier: 3,
    requiresBirthData: true,
    requiresCamera: true,
    status: 'operational',
    category: 'biometric'
  }
];

const TIER_COLORS = {
  1: 'cyan',
  2: 'purple',
  3: 'orange'
} as const;

const CATEGORY_COLORS = {
  divination: 'blue',
  astrology: 'purple',
  psychology: 'green',
  biometric: 'red',
  sacred: 'yellow',
  timing: 'cyan'
} as const;

export const EngineNavigationHub: React.FC<EngineNavigationHubProps> = ({
  userTier,
  unlockedEngines,
  onEngineSelect,
  currentEngine,
  showCategories = true
}) => {
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getEnginesByTier = useCallback((tier: 1 | 2 | 3) => {
    return ENGINE_REGISTRY.filter(engine => engine.tier === tier);
  }, []);

  const getFilteredEngines = useCallback(() => {
    let engines = ENGINE_REGISTRY;

    if (selectedTier !== 'all') {
      engines = engines.filter(engine => engine.tier === selectedTier);
    }

    if (selectedCategory !== 'all') {
      engines = engines.filter(engine => engine.category === selectedCategory);
    }

    return engines;
  }, [selectedTier, selectedCategory]);

  const isEngineAccessible = useCallback((engine: EngineInfo) => {
    return userTier >= engine.tier && unlockedEngines.includes(engine.name);
  }, [userTier, unlockedEngines]);

  const getEngineStatusColor = useCallback((engine: EngineInfo) => {
    if (!isEngineAccessible(engine)) return 'gray';
    if (currentEngine === engine.name) return 'green';
    
    switch (engine.status) {
      case 'operational': return TIER_COLORS[engine.tier];
      case 'beta': return 'yellow';
      case 'maintenance': return 'red';
      default: return 'gray';
    }
  }, [isEngineAccessible, currentEngine]);

  const categories = Array.from(new Set(ENGINE_REGISTRY.map(e => e.category)));

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-black/90 backdrop-blur-sm border border-cyan-400/30 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">
          🧠 Consciousness Engine Hub
        </h1>
        <p className="text-gray-300 text-sm">
          Access all 13 consciousness engines • User Tier: {userTier} • {unlockedEngines.length}/13 engines unlocked
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Tier Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Tier:</span>
          <div className="flex space-x-1">
            {(['all', 1, 2, 3] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTier === tier
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tier === 'all' ? 'All' : `Tier ${tier}`}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {showCategories && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Category:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {getFilteredEngines().map((engine) => {
            const isAccessible = isEngineAccessible(engine);
            const statusColor = getEngineStatusColor(engine);
            const isSelected = currentEngine === engine.name;

            return (
              <motion.div
                key={engine.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isAccessible
                    ? `border-${statusColor}-400/50 bg-${statusColor}-900/20 hover:border-${statusColor}-400 hover:bg-${statusColor}-900/30`
                    : 'border-gray-600/30 bg-gray-900/20 cursor-not-allowed opacity-50'
                } ${isSelected ? `ring-2 ring-${statusColor}-400` : ''}`}
                onClick={() => isAccessible && onEngineSelect(engine.name)}
              >
                {/* Tier Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold bg-${TIER_COLORS[engine.tier]}-600 text-white`}>
                  T{engine.tier}
                </div>

                {/* Engine Icon & Name */}
                <div className="mb-3">
                  <div className="text-3xl mb-2">{engine.icon}</div>
                  <h3 className={`font-semibold ${isAccessible ? `text-${statusColor}-300` : 'text-gray-500'}`}>
                    {engine.displayName}
                  </h3>
                </div>

                {/* Description */}
                <p className={`text-sm mb-3 ${isAccessible ? 'text-gray-300' : 'text-gray-500'}`}>
                  {engine.description}
                </p>

                {/* Requirements */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {engine.requiresBirthData && (
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                      Birth Data
                    </span>
                  )}
                  {engine.requiresCamera && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-300 text-xs rounded">
                      Camera
                    </span>
                  )}
                  <span className={`px-2 py-1 bg-${CATEGORY_COLORS[engine.category]}-600/20 text-${CATEGORY_COLORS[engine.category]}-300 text-xs rounded capitalize`}>
                    {engine.category}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    isAccessible ? `text-${statusColor}-400` : 'text-gray-500'
                  }`}>
                    {engine.status.toUpperCase()}
                  </span>
                  
                  {!isAccessible && (
                    <span className="text-xs text-gray-500">
                      {userTier < engine.tier ? `Tier ${engine.tier} Required` : 'Locked'}
                    </span>
                  )}
                  
                  {isSelected && (
                    <span className="text-xs text-green-400 font-medium">
                      ACTIVE
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-cyan-900/20 border border-cyan-400/30 rounded-lg">
          <div className="text-2xl font-bold text-cyan-400">{ENGINE_REGISTRY.length}</div>
          <div className="text-sm text-gray-300">Total Engines</div>
        </div>
        <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{unlockedEngines.length}</div>
          <div className="text-sm text-gray-300">Unlocked</div>
        </div>
        <div className="p-3 bg-purple-900/20 border border-purple-400/30 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">{userTier}</div>
          <div className="text-sm text-gray-300">User Tier</div>
        </div>
        <div className="p-3 bg-orange-900/20 border border-orange-400/30 rounded-lg">
          <div className="text-2xl font-bold text-orange-400">
            {ENGINE_REGISTRY.filter(e => e.status === 'operational').length}
          </div>
          <div className="text-sm text-gray-300">Operational</div>
        </div>
      </div>
    </div>
  );
};

export default EngineNavigationHub;
