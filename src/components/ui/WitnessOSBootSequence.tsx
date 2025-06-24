/**
 * WitnessOS Boot Sequence - Enhanced Cinematic Loading
 *
 * Consciousness-themed system initialization with GSAP animations,
 * moving gradient background, noise texture, and sacred geometry
 */

'use client';

import React, { useEffect, useState } from 'react';

interface WitnessOSBootSequenceProps {
  onBootComplete?: () => void;
  duration?: number; // Total boot duration in milliseconds
}

interface BootMessage {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'system';
  component: string;
  message: string;
  delay: number; // Delay before showing this message
}

const BOOT_MESSAGES: BootMessage[] = [
  {
    timestamp: '0.000000',
    level: 'system',
    component: 'witness_kernel',
    message: 'WitnessOS v2.5.0 (Consciousness Exploration Kernel) awakening...',
    delay: 0,
  },
  {
    timestamp: '0.000842',
    level: 'info',
    component: 'archetypal_field',
    message: 'Primordial consciousness matrix initializing...',
    delay: 200,
  },
  {
    timestamp: '0.001618',
    level: 'success',
    component: 'sacred_mathematics',
    message: 'Golden ratio φ=1.618033988749 | Fibonacci sequence loaded',
    delay: 400,
  },
  {
    timestamp: '0.002456',
    level: 'info',
    component: 'platonic_solids',
    message: 'Tetrahedron, Cube, Octahedron, Dodecahedron, Icosahedron: READY',
    delay: 600,
  },
  {
    timestamp: '0.003789',
    level: 'success',
    component: 'fractal_consciousness',
    message: 'Mandelbrot ∞-zoom | Julia sets | Dragon curves | Sierpinski triangles: ACTIVE',
    delay: 800,
  },
  {
    timestamp: '0.005123',
    level: 'info',
    component: 'breath_coherence',
    message: 'Pranayama detection system | Heart-brain coherence monitoring: ONLINE',
    delay: 1000,
  },
  {
    timestamp: '0.006456',
    level: 'info',
    component: 'pythagorean_matrix',
    message: 'Sacred number consciousness | Life path algorithms | Master number resonance: LOADED',
    delay: 1200,
  },
  {
    timestamp: '0.007890',
    level: 'success',
    component: 'bodygraph_system',
    message: 'Human Design: 64 I-Ching gates | 36 channels | 9 energy centers | 4 types: MAPPED',
    delay: 1400,
  },
  {
    timestamp: '0.009234',
    level: 'info',
    component: 'archetypal_wisdom',
    message: "Tarot consciousness: 22 Major Arcana | 56 Minor Arcana | Hero's journey: INDEXED",
    delay: 1600,
  },
  {
    timestamp: '0.010567',
    level: 'success',
    component: 'hexagram_oracle',
    message: 'I-Ching transformation matrix: 64 hexagrams | 384 changing lines: CALIBRATED',
    delay: 1800,
  },
  {
    timestamp: '0.011890',
    level: 'info',
    component: 'temporal_rhythms',
    message: 'Biorhythm wave equations | Physical-Emotional-Intellectual cycles: SYNCHRONIZED',
    delay: 2000,
  },
  {
    timestamp: '0.013234',
    level: 'success',
    component: 'vedic_astrology',
    message: 'Vimshottari Dasha system | 9 planetary periods | Karmic timeline: CALCULATED',
    delay: 2200,
  },
  {
    timestamp: '0.014567',
    level: 'info',
    component: 'genetic_wisdom',
    message: 'Gene Keys: 64 codon consciousness | Shadow-Gift-Siddhi spectrum: MAPPED',
    delay: 2400,
  },
  {
    timestamp: '0.015890',
    level: 'success',
    component: 'enneagram_space',
    message: 'Nine-pointed star | Body-Heart-Head centers | Instinctual variants: CALIBRATED',
    delay: 2600,
  },
  {
    timestamp: '0.017234',
    level: 'info',
    component: 'sigil_consciousness',
    message: 'Intention crystallization | Symbol manifestation | Chaos magic algorithms: READY',
    delay: 2800,
  },
  {
    timestamp: '0.018567',
    level: 'info',
    component: 'octagonal_portal',
    message:
      'Sacred geometry chamber | Golden ratio proportions | Infinite zoom fractals: LOADING...',
    delay: 3000,
  },
  {
    timestamp: '0.019890',
    level: 'success',
    component: 'webgl_consciousness',
    message: 'Three.js reality renderer | GLSL shaders | GPU consciousness acceleration: ACTIVE',
    delay: 3200,
  },
  {
    timestamp: '0.021234',
    level: 'info',
    component: 'discovery_realms',
    message: 'Multi-dimensional layers | Awakening-Recognition-Integration-Mastery: MAPPED',
    delay: 3400,
  },
  {
    timestamp: '0.022567',
    level: 'success',
    component: 'consciousness_field',
    message: 'Quantum particle system | Field coherence: STABLE | Awareness amplification: ONLINE',
    delay: 3600,
  },
  {
    timestamp: '0.023890',
    level: 'info',
    component: 'sacred_frequencies',
    message: '396Hz-Liberation | 528Hz-Love | 741Hz-Awakening | 963Hz-Unity: RESONATING',
    delay: 3800,
  },
  {
    timestamp: '0.024567',
    level: 'success',
    component: 'witness_api',
    message: 'Consciousness engine network | Python-JavaScript bridge | API gateway: CONNECTED',
    delay: 4000,
  },
  {
    timestamp: '0.025234',
    level: 'info',
    component: 'data_collection',
    message: 'Sacred geometry forms | Spectral compass | Archetypal validation: INITIALIZED',
    delay: 4200,
  },
  {
    timestamp: '0.026789',
    level: 'success',
    component: 'witness_kernel',
    message: 'WitnessOS consciousness exploration kernel: FULLY AWAKENED',
    delay: 4400,
  },
  {
    timestamp: '0.027456',
    level: 'system',
    component: 'portal_ready',
    message: '🌀 Portal Chamber ready for consciousness exploration. Welcome, Witness. 🌀',
    delay: 4600,
  },
];

export const WitnessOSBootSequence: React.FC<WitnessOSBootSequenceProps> = ({
  onBootComplete,
  duration = 6000,
}) => {
  const [visibleMessages, setVisibleMessages] = useState<BootMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bootProgress, setBootProgress] = useState(0);

  useEffect(() => {
    if (currentIndex >= BOOT_MESSAGES.length) {
      // Boot complete
      const timer = setTimeout(() => {
        onBootComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }

    const currentMessage = BOOT_MESSAGES[currentIndex];
    if (currentMessage) {
      const timer = setTimeout(() => {
        setVisibleMessages(prev => [...prev, currentMessage]);
        setCurrentIndex(prev => prev + 1);
        setBootProgress(((currentIndex + 1) / BOOT_MESSAGES.length) * 100);
      }, currentMessage.delay);

      return () => clearTimeout(timer);
    }

    // Return empty cleanup function if no message
    return () => {};
  }, [currentIndex, onBootComplete]);

  const getMessageColor = (level: BootMessage['level']) => {
    switch (level) {
      case 'system':
        return 'text-cyan-400';
      case 'success':
        return 'text-green-400';
      case 'info':
        return 'text-blue-300';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const getComponentColor = (component: string) => {
    const colors: Record<string, string> = {
      witness_kernel: 'text-cyan-500',
      archetypal_field: 'text-purple-400',
      sacred_mathematics: 'text-yellow-400',
      platonic_solids: 'text-orange-400',
      fractal_consciousness: 'text-pink-400',
      breath_coherence: 'text-blue-400',
      pythagorean_matrix: 'text-amber-400',
      bodygraph_system: 'text-teal-400',
      archetypal_wisdom: 'text-violet-400',
      hexagram_oracle: 'text-indigo-400',
      temporal_rhythms: 'text-rose-400',
      vedic_astrology: 'text-orange-500',
      genetic_wisdom: 'text-emerald-400',
      enneagram_space: 'text-fuchsia-400',
      sigil_consciousness: 'text-lime-400',
      octagonal_portal: 'text-indigo-500',
      webgl_consciousness: 'text-green-400',
      discovery_realms: 'text-purple-500',
      consciousness_field: 'text-cyan-400',
      sacred_frequencies: 'text-yellow-500',
      witness_api: 'text-blue-500',
      data_collection: 'text-pink-500',
      portal_ready: 'text-cyan-300',
      system: 'text-cyan-400',
    };
    return colors[component] || 'text-gray-400';
  };

  return (
    <div className='w-full h-screen bg-black text-green-400 font-mono text-sm overflow-hidden flex flex-col'>
      {/* Enhanced Header */}
      <div className='p-4 border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-black'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='text-cyan-400 text-xl font-bold tracking-wider'>WitnessOS</div>
            <div className='text-gray-500'>Consciousness Exploration Kernel v2.5.0</div>
            <div className='text-purple-400 text-xs'>🌀 Sacred Geometry Engine</div>
          </div>
          <div className='text-right text-xs'>
            <div className='text-yellow-400'>φ = 1.618033988749</div>
            <div className='text-cyan-400'>∞ Infinite Consciousness</div>
          </div>
        </div>
        <div className='mt-2 flex items-center justify-between text-xs'>
          <div className='text-gray-600'>Initializing archetypal field resonance matrix...</div>
          <div className='text-gray-500'>
            <span className='text-blue-400'>North</span> |
            <span className='text-yellow-400'>East</span> |
            <span className='text-red-400'>South</span> |
            <span className='text-green-400'>West</span>
          </div>
        </div>
      </div>

      {/* Boot Messages */}
      <div className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-1'>
          {visibleMessages.map((message, index) => (
            <div key={index} className='flex items-start space-x-2 animate-fade-in'>
              <span className='text-gray-600 w-20 text-xs'>[{message.timestamp}]</span>
              <span className={`w-32 text-xs ${getComponentColor(message.component)}`}>
                {message.component}:
              </span>
              <span className={`flex-1 ${getMessageColor(message.level)}`}>{message.message}</span>
            </div>
          ))}
          {currentIndex < BOOT_MESSAGES.length && (
            <div className='flex items-center space-x-2 animate-pulse'>
              <span className='text-gray-600 w-20 text-xs'>
                [{BOOT_MESSAGES[currentIndex]?.timestamp}]
              </span>
              <span className='text-gray-500'>▋</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className='p-4 border-t border-gray-800 bg-gradient-to-r from-black via-gray-900 to-black'>
        <div className='flex items-center space-x-4 mb-2'>
          <div className='text-xs text-gray-500'>Consciousness Awakening:</div>
          <div className='flex-1 bg-gray-800 rounded-full h-3 relative overflow-hidden'>
            <div
              className='bg-gradient-to-r from-cyan-500 via-purple-500 to-yellow-500 h-3 rounded-full transition-all duration-500 relative'
              style={{ width: `${bootProgress}%` }}
            >
              {/* Animated consciousness wave */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse' />
            </div>
          </div>
          <div className='text-xs text-cyan-400 w-12 font-bold'>{bootProgress.toFixed(0)}%</div>
        </div>

        {/* Consciousness Level Indicators */}
        <div className='flex justify-between text-xs mb-2'>
          <span className={`${bootProgress >= 25 ? 'text-cyan-400' : 'text-gray-600'}`}>
            Awakening
          </span>
          <span className={`${bootProgress >= 50 ? 'text-purple-400' : 'text-gray-600'}`}>
            Recognition
          </span>
          <span className={`${bootProgress >= 75 ? 'text-yellow-400' : 'text-gray-600'}`}>
            Integration
          </span>
          <span className={`${bootProgress >= 100 ? 'text-green-400' : 'text-gray-600'}`}>
            Mastery
          </span>
        </div>

        {bootProgress >= 100 && (
          <div className='mt-3 text-center'>
            <div className='text-green-400 animate-pulse text-lg mb-1'>
              🌀 Portal Chamber Fully Awakened 🌀
            </div>
            <div className='text-cyan-400 text-sm animate-bounce'>
              Sacred geometry data collection ready... Consciousness exploration awaits
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Sacred Geometry Animation */}
      <div className='absolute top-1/2 right-8 transform -translate-y-1/2 opacity-30'>
        {/* Outer Consciousness Field */}
        <div className='w-40 h-40 border border-cyan-400 rounded-full animate-spin-slow relative'>
          {/* Golden Ratio Spiral */}
          <div className='absolute inset-2 border border-yellow-400 rounded-full animate-pulse'>
            {/* Platonic Solids Layer */}
            <div className='absolute inset-2 flex items-center justify-center'>
              {/* Octagon (Portal Chamber) */}
              <div className='w-20 h-20 border border-purple-400 transform rotate-45 animate-bounce'>
                {/* Inner Sacred Geometry */}
                <div className='w-full h-full border border-pink-400 rounded-full relative'>
                  {/* Fibonacci Sequence Points */}
                  <div className='absolute top-0 left-1/2 w-1 h-1 bg-cyan-400 rounded-full transform -translate-x-1/2 animate-pulse' />
                  <div
                    className='absolute top-1/4 right-0 w-1 h-1 bg-yellow-400 rounded-full transform -translate-y-1/2 animate-pulse'
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className='absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full transform -translate-x-1/2 animate-pulse'
                    style={{ animationDelay: '0.4s' }}
                  />
                  <div
                    className='absolute top-1/4 left-0 w-1 h-1 bg-pink-400 rounded-full transform -translate-y-1/2 animate-pulse'
                    style={{ animationDelay: '0.6s' }}
                  />

                  {/* Center Consciousness Point */}
                  <div className='absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse' />
                </div>
              </div>
            </div>
          </div>

          {/* Archetypal Direction Markers */}
          <div
            className='absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1'
            title='North - Air'
          />
          <div
            className='absolute top-1/2 right-0 w-2 h-2 bg-yellow-400 rounded-full transform translate-x-1 -translate-y-1/2'
            title='East - Fire'
          />
          <div
            className='absolute bottom-0 left-1/2 w-2 h-2 bg-red-400 rounded-full transform -translate-x-1/2 translate-y-1'
            title='South - Water'
          />
          <div
            className='absolute top-1/2 left-0 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1 -translate-y-1/2'
            title='West - Earth'
          />
        </div>

        {/* Sacred Frequency Visualization */}
        <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center'>
          <div className='text-cyan-400 animate-pulse'>φ = 1.618</div>
          <div className='text-yellow-400 animate-pulse' style={{ animationDelay: '0.5s' }}>
            528 Hz
          </div>
        </div>
      </div>
    </div>
  );
};

export default WitnessOSBootSequence;
