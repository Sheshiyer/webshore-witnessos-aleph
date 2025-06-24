/**
 * Debug Navigation Panel for WitnessOS Webshore
 *
 * Floating debug interface for consciousness layer navigation and testing
 * Cyberpunk/myth-tech aesthetic with WitnessOS styling
 */

'use client';

import { ENGINE_METADATA } from '@/components/consciousness-engines';
import type { DiscoveryLayer } from '@/components/discovery-layers/DiscoveryLayerSystem';
import React from 'react';
import { useDebug } from './DebugContext';

interface LayerInfo {
  id: DiscoveryLayer;
  name: string;
  description: string;
  icon: string;
  color: string;
  engines: string[];
}

const LAYER_INFO: LayerInfo[] = [
  {
    id: 0,
    name: 'Portal',
    description: 'Breathing chamber and consciousness entry',
    icon: '🌀',
    color: 'from-purple-600 to-indigo-600',
    engines: [],
  },
  {
    id: 1,
    name: 'Awakening',
    description: 'Symbol garden and compass plaza',
    icon: '🧭',
    color: 'from-green-600 to-teal-600',
    engines: ['sacred_geometry', 'biorhythm'],
  },
  {
    id: 2,
    name: 'Recognition',
    description: 'System understanding spaces',
    icon: '🔍',
    color: 'from-blue-600 to-cyan-600',
    engines: ['numerology', 'vimshottari', 'tarot', 'iching'],
  },
  {
    id: 3,
    name: 'Integration',
    description: 'Archetype temples and mastery',
    icon: '⚡',
    color: 'from-orange-600 to-red-600',
    engines: ['human_design', 'gene_keys', 'enneagram', 'sigil_forge'],
  },
];

export const DebugNavigationPanel: React.FC = () => {
  const { debugState, setCurrentLayer, togglePanel, setOverride, resetDebugState } = useDebug();
  const { useConsciousnessProfile } = require('@/hooks/useConsciousnessProfile');
  const profileState = useConsciousnessProfile();

  if (!debugState.isEnabled || !debugState.isPanelVisible) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='fixed top-4 right-4 z-50 w-80 bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-2xl'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-cyan-500/20'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-cyan-400 rounded-full animate-pulse' />
          <span className='text-cyan-400 font-mono text-sm font-bold'>DEBUG_CONSOLE</span>
        </div>
        <button onClick={togglePanel} className='text-gray-400 hover:text-white transition-colors'>
          ✕
        </button>
      </div>

      {/* Current Layer Status */}
      <div className='p-4 border-b border-cyan-500/20'>
        <div className='text-xs text-gray-400 mb-2'>CURRENT_LAYER</div>
        <div className='flex items-center space-x-3'>
          <span className='text-2xl'>{LAYER_INFO[debugState.currentLayer]?.icon}</span>
          <div>
            <div className='text-white font-mono font-bold'>
              Layer {debugState.currentLayer}: {LAYER_INFO[debugState.currentLayer]?.name}
            </div>
            <div className='text-xs text-gray-400'>
              {LAYER_INFO[debugState.currentLayer]?.description}
            </div>
          </div>
        </div>
      </div>

      {/* Layer Navigation */}
      <div className='p-4 border-b border-cyan-500/20'>
        <div className='text-xs text-gray-400 mb-3'>LAYER_NAVIGATION</div>
        <div className='grid grid-cols-2 gap-2'>
          {LAYER_INFO.map(layer => (
            <button
              key={layer.id}
              onClick={() => setCurrentLayer(layer.id)}
              className={`
                relative p-3 rounded-md border transition-all duration-200
                ${
                  debugState.currentLayer === layer.id
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                    : 'border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white'
                }
              `}
            >
              <div className='flex items-center space-x-2'>
                <span className='text-lg'>{layer.icon}</span>
                <div className='text-left'>
                  <div className='text-xs font-mono font-bold'>L{layer.id}</div>
                  <div className='text-xs'>{layer.name}</div>
                </div>
              </div>
              {debugState.currentLayer === layer.id && (
                <div
                  className='absolute inset-0 bg-gradient-to-r opacity-10 rounded-md'
                  style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Debug Information */}
      <div className='p-4 border-b border-cyan-500/20'>
        <div className='text-xs text-gray-400 mb-3'>DEBUG_METRICS</div>
        <div className='space-y-2 text-xs font-mono'>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Time in Layer:</span>
            <span className='text-cyan-400'>
              {formatTime(debugState.debugInfo.layerMetrics.timeSpent)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Consciousness:</span>
            <span className='text-green-400'>
              {debugState.debugInfo.consciousness
                ? `${(debugState.debugInfo.consciousness.awarenessLevel * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Breath Coherence:</span>
            <span className='text-blue-400'>
              {debugState.debugInfo.breath
                ? `${(debugState.debugInfo.breath.coherence * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-400'>FPS:</span>
            <span className='text-yellow-400'>
              {debugState.debugInfo.performance.fps.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Active Engines */}
      <div className='p-4 border-b border-cyan-500/20'>
        <div className='text-xs text-gray-400 mb-3'>ACTIVE_ENGINES</div>
        <div className='space-y-1'>
          {LAYER_INFO[debugState.currentLayer]?.engines.map(engineKey => {
            const engine = ENGINE_METADATA[engineKey as keyof typeof ENGINE_METADATA];
            return (
              <div key={engineKey} className='flex items-center space-x-2 text-xs'>
                <div
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: engine?.color || '#666' }}
                />
                <span className='text-gray-300'>{engine?.name || engineKey}</span>
              </div>
            );
          })}
          {LAYER_INFO[debugState.currentLayer]?.engines.length === 0 && (
            <div className='text-xs text-gray-500 italic'>No engines active</div>
          )}
        </div>
      </div>

      {/* Debug Overrides */}
      <div className='p-4 border-b border-cyan-500/20'>
        <div className='text-xs text-gray-400 mb-3'>DEBUG_OVERRIDES</div>
        <div className='space-y-2'>
          <label className='flex items-center space-x-2 text-xs'>
            <input
              type='checkbox'
              checked={debugState.overrides.skipOnboarding || false}
              onChange={e => setOverride('skipOnboarding', e.target.checked)}
              className='w-3 h-3 text-cyan-400 bg-transparent border border-gray-600 rounded focus:ring-cyan-400'
            />
            <span className='text-gray-300'>Skip Onboarding</span>
          </label>
          <label className='flex items-center space-x-2 text-xs'>
            <input
              type='checkbox'
              checked={debugState.overrides.mockBreathData || false}
              onChange={e => setOverride('mockBreathData', e.target.checked)}
              className='w-3 h-3 text-cyan-400 bg-transparent border border-gray-600 rounded focus:ring-cyan-400'
            />
            <span className='text-gray-300'>Mock Breath Data</span>
          </label>
          <label className='flex items-center space-x-2 text-xs'>
            <input
              type='checkbox'
              checked={debugState.overrides.enhancedVisuals || false}
              onChange={e => setOverride('enhancedVisuals', e.target.checked)}
              className='w-3 h-3 text-cyan-400 bg-transparent border border-gray-600 rounded focus:ring-cyan-400'
            />
            <span className='text-gray-300'>Enhanced Visuals</span>
          </label>
        </div>
      </div>

      {/* Cache Management */}
      <div className='p-4 border-b border-cyan-500/20'>
        <div className='text-xs text-gray-400 mb-3'>CACHE_MANAGEMENT</div>
        <div className='space-y-2 text-xs'>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Profile Cached:</span>
            <span
              className={profileState.cacheInfo.profile?.exists ? 'text-green-400' : 'text-red-400'}
            >
              {profileState.cacheInfo.profile?.exists ? 'YES' : 'NO'}
            </span>
          </div>
          {profileState.cacheInfo.profile?.exists && (
            <div className='flex justify-between'>
              <span className='text-gray-400'>Profile Age:</span>
              <span className='text-cyan-400'>
                {Math.floor(profileState.profileAge / (24 * 60 * 60 * 1000))}d
              </span>
            </div>
          )}
          <div className='flex justify-between'>
            <span className='text-gray-400'>Progress Saved:</span>
            <span
              className={
                profileState.cacheInfo.progress?.exists ? 'text-green-400' : 'text-red-400'
              }
            >
              {profileState.cacheInfo.progress?.exists ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
        <div className='mt-3 space-y-1'>
          <button
            onClick={profileState.clearProfile}
            className='w-full px-2 py-1 bg-orange-600/20 border border-orange-600/50 text-orange-400 rounded text-xs hover:bg-orange-600/30 transition-colors'
          >
            Clear Profile
          </button>
          <button
            onClick={profileState.clearProgress}
            className='w-full px-2 py-1 bg-yellow-600/20 border border-yellow-600/50 text-yellow-400 rounded text-xs hover:bg-yellow-600/30 transition-colors'
          >
            Clear Progress
          </button>
          <button
            onClick={profileState.clearAllData}
            className='w-full px-2 py-1 bg-red-600/20 border border-red-600/50 text-red-400 rounded text-xs hover:bg-red-600/30 transition-colors'
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className='p-4'>
        <button
          onClick={resetDebugState}
          className='w-full px-3 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded-md hover:bg-red-600/30 transition-colors text-xs font-mono'
        >
          RESET_DEBUG_STATE
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className='p-4 pt-0'>
        <div className='text-xs text-gray-500'>
          <div>Ctrl+D: Toggle Panel</div>
          <div>0-3: Switch Layers</div>
          <div>Esc: Close Panel</div>
        </div>
      </div>
    </div>
  );
};

export default DebugNavigationPanel;
