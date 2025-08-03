/**
 * Documentation Dashboard - WitnessOS Consciousness Engine Laboratory
 * 
 * Main documentation interface combining engine discovery, interactive terminals,
 * code playgrounds, and mystical response visualization in a gamified experience.
 */

'use client';

import React, { useState } from 'react';
import { EngineDiscoveryMap } from './EngineDiscoveryMap';
import { EngineTerminal } from './EngineTerminal';
import { CodePlayground } from './CodePlayground';

interface DocumentationDashboardProps {
  userTier: 'free' | 'pro' | 'enterprise';
  apiKeys: Array<{ id: string; name: string; key_prefix: string; is_active: boolean }>;
  onUpgradeTier?: () => void;
  className?: string;
}

type ViewMode = 'discovery' | 'terminal' | 'playground' | 'guides';

export function DocumentationDashboard({ 
  userTier, 
  apiKeys, 
  onUpgradeTier,
  className = '' 
}: DocumentationDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('discovery');
  const [selectedEngine, setSelectedEngine] = useState<string>('numerology');
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');

  // Get active API key for playground
  const activeApiKey = apiKeys.find(key => key.is_active && key.id === selectedApiKey);
  const defaultApiKey = apiKeys.find(key => key.is_active);

  const handleEngineSelect = (engineId: string) => {
    setSelectedEngine(engineId);
    setViewMode('terminal');
  };

  const getEngineUnlockStatus = (engineId: string) => {
    const engineTiers: Record<string, 'free' | 'pro' | 'enterprise'> = {
      numerology: 'free',
      biorhythm: 'free',
      iching: 'free',
      human_design: 'pro',
      tarot: 'pro',
      gene_keys: 'pro',
      enneagram: 'pro',
      vimshottari: 'pro',
      sacred_geometry: 'pro',
      sigil_forge: 'enterprise'
    };

    const requiredTier = engineTiers[engineId] || 'enterprise';
    
    if (userTier === 'enterprise') return true;
    if (userTier === 'pro') return requiredTier !== 'enterprise';
    return requiredTier === 'free';
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'discovery': return '🗺️';
      case 'terminal': return '🖥️';
      case 'playground': return '🔬';
      case 'guides': return '📚';
      default: return '🧠';
    }
  };

  const getViewModeTitle = (mode: ViewMode) => {
    switch (mode) {
      case 'discovery': return 'Engine Discovery';
      case 'terminal': return 'Interactive Terminal';
      case 'playground': return 'Code Playground';
      case 'guides': return 'Consciousness Guides';
      default: return 'Documentation';
    }
  };

  return (
    <div className={`documentation-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyan-300 font-mono mb-2">
              🧠 CONSCIOUSNESS ENGINE DOCUMENTATION
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              Interactive laboratory for exploring mystical computation and consciousness APIs
            </p>
          </div>
          
          {/* Tier Badge */}
          <div className="text-right">
            <div className="text-sm text-gray-400 font-mono">Access Level</div>
            <div className={`text-lg font-bold font-mono ${
              userTier === 'enterprise' ? 'text-purple-400' :
              userTier === 'pro' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {userTier.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          {(['discovery', 'terminal', 'playground', 'guides'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 font-mono text-sm rounded transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
            >
              {getViewModeIcon(mode)} {getViewModeTitle(mode)}
            </button>
          ))}
        </div>

        {/* API Key Selector for Playground */}
        {viewMode === 'playground' && apiKeys.length > 0 && (
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-cyan-400 font-mono text-sm">API Key:</span>
            <select
              value={selectedApiKey || defaultApiKey?.id || ''}
              onChange={(e) => setSelectedApiKey(e.target.value)}
              className="px-3 py-1 bg-black/50 border border-cyan-500/30 rounded text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
            >
              {apiKeys.filter(key => key.is_active).map(key => (
                <option key={key.id} value={key.id}>
                  {key.name} ({key.key_prefix}***)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Engine Discovery Map */}
        {viewMode === 'discovery' && (
          <EngineDiscoveryMap
            userTier={userTier}
            onEngineSelect={handleEngineSelect}
            selectedEngine={selectedEngine}
          />
        )}

        {/* Interactive Terminal */}
        {viewMode === 'terminal' && (
          <div className="space-y-6">
            {/* Engine Selector */}
            <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-cyan-400 font-mono font-bold">
                  🖥️ SELECT CONSCIOUSNESS ENGINE
                </div>
                <button
                  onClick={() => setViewMode('discovery')}
                  className="text-purple-400 hover:text-purple-300 font-mono text-sm"
                >
                  🗺️ Back to Discovery
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {[
                  { id: 'numerology', name: 'Kazuhana', icon: '🌸', tier: 'free' },
                  { id: 'biorhythm', name: 'Seimei no Rizumu', icon: '🌊', tier: 'free' },
                  { id: 'iching', name: 'Ekikyō no Koe', icon: '🔮', tier: 'free' },
                  { id: 'human_design', name: 'Tamashii no Sekkei', icon: '🎯', tier: 'pro' },
                  { id: 'tarot', name: 'Mirai no Kagami', icon: '🃏', tier: 'pro' },
                  { id: 'gene_keys', name: 'Idenshi no Kagi', icon: '🧬', tier: 'pro' },
                  { id: 'enneagram', name: 'Kokoro no Chizu', icon: '🎭', tier: 'pro' },
                  { id: 'sigil_forge', name: 'Shirushi no Kajiba', icon: '🔥', tier: 'enterprise' }
                ].map(engine => {
                  const isUnlocked = getEngineUnlockStatus(engine.id);
                  return (
                    <button
                      key={engine.id}
                      onClick={() => setSelectedEngine(engine.id)}
                      disabled={!isUnlocked}
                      className={`p-2 rounded font-mono text-xs transition-all ${
                        selectedEngine === engine.id
                          ? 'bg-cyan-600 text-white'
                          : isUnlocked
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div>{engine.icon} {engine.name}</div>
                      {!isUnlocked && (
                        <div className="text-red-400 text-xs mt-1">
                          🔒 {engine.tier.toUpperCase()}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Engine Terminal */}
            <EngineTerminal
              engineId={selectedEngine}
              userTier={userTier}
              isUnlocked={getEngineUnlockStatus(selectedEngine)}
              onUpgrade={onUpgradeTier}
            />
          </div>
        )}

        {/* Code Playground */}
        {viewMode === 'playground' && (
          <div className="space-y-6">
            {/* Engine Selector for Playground */}
            <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-cyan-400 font-mono font-bold">
                  🔬 CODE LABORATORY - {selectedEngine.toUpperCase()}
                </div>
                <div className="flex space-x-2">
                  {[
                    { id: 'numerology', icon: '🌸' },
                    { id: 'human_design', icon: '🎯' },
                    { id: 'tarot', icon: '🃏' }
                  ].map(engine => (
                    <button
                      key={engine.id}
                      onClick={() => setSelectedEngine(engine.id)}
                      disabled={!getEngineUnlockStatus(engine.id)}
                      className={`px-3 py-1 rounded font-mono text-sm transition-all ${
                        selectedEngine === engine.id
                          ? 'bg-purple-600 text-white'
                          : getEngineUnlockStatus(engine.id)
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {engine.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Playground */}
            <CodePlayground
              engineId={selectedEngine}
              userTier={userTier}
              apiKey={activeApiKey?.key_prefix || defaultApiKey?.key_prefix}
            />
          </div>
        )}

        {/* Consciousness Guides */}
        {viewMode === 'guides' && (
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <div className="text-xl text-cyan-300 font-bold mb-2 font-mono">
                CONSCIOUSNESS GUIDES
              </div>
              <div className="text-gray-400 mb-6 font-mono">
                Comprehensive guides for consciousness engineering coming soon...
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-purple-300 font-bold mb-2">🌸 Numerology Mastery</div>
                  <div className="text-gray-400 text-sm">
                    Deep dive into sacred mathematics and vibrational analysis
                  </div>
                </div>
                
                <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-cyan-300 font-bold mb-2">🎯 Human Design Secrets</div>
                  <div className="text-gray-400 text-sm">
                    Unlock the genetic matrix and consciousness blueprints
                  </div>
                </div>
                
                <div className="bg-gray-900/50 border border-pink-500/30 rounded-lg p-4">
                  <div className="text-pink-300 font-bold mb-2">🔮 Multi-Engine Fusion</div>
                  <div className="text-gray-400 text-sm">
                    Advanced techniques for combining consciousness engines
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="text-gray-500 font-mono text-xs">
          🧠 WitnessOS Consciousness Engine Laboratory • Mystical Computation Platform
        </div>
        <div className="text-gray-600 font-mono text-xs mt-1">
          Explore the depths of consciousness through interactive documentation
        </div>
      </div>
    </div>
  );
}
