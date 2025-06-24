/**
 * Compass Sigil Interface for WitnessOS Webshore
 *
 * 4-direction navigation interface with sacred geometry and spectral colors
 * Implements breath-synchronized transitions and archetypal visualization
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import React, { useRef, useState } from 'react';
import { SPECTRAL_COLORS } from './SacredGeometryForm';

export type CompassDirection = 'north' | 'east' | 'south' | 'west';

export interface CompassSigilProps {
  onDirectionSelect: (direction: CompassDirection) => void;
  onCenterActivate?: () => void;
  currentDirection?: CompassDirection;
  size?: number;
  className?: string;
  showLabels?: boolean;
  enableBreathSync?: boolean;
}

// Direction metadata with archetypal associations
const DIRECTION_METADATA = {
  north: {
    element: 'Air',
    archetype: 'Mind',
    symbol: '△',
    angle: 0,
    description: 'Mental clarity and wisdom',
  },
  east: {
    element: 'Fire',
    archetype: 'Spirit',
    symbol: '◇',
    angle: 90,
    description: 'Spiritual awakening and transformation',
  },
  south: {
    element: 'Water',
    archetype: 'Emotion',
    symbol: '◯',
    angle: 180,
    description: 'Emotional depth and intuition',
  },
  west: {
    element: 'Earth',
    archetype: 'Body',
    symbol: '□',
    angle: 270,
    description: 'Physical grounding and manifestation',
  },
} as const;

export const CompassSigilInterface: React.FC<CompassSigilProps> = ({
  onDirectionSelect,
  onCenterActivate,
  currentDirection = 'north',
  size = 200,
  className = '',
  showLabels = true,
  enableBreathSync = true,
}) => {
  const { breathPhase, consciousnessLevel } = useConsciousness();
  const compassRef = useRef<HTMLDivElement>(null);
  const [hoveredDirection, setHoveredDirection] = useState<CompassDirection | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [centerPulse, setCenterPulse] = useState(false);

  // Calculate breath-synchronized scaling
  const getBreathScale = () => {
    if (!enableBreathSync) return 1;
    return 1 + Math.sin(breathPhase) * 0.1 * consciousnessLevel;
  };

  // Calculate breath-synchronized glow intensity
  const getBreathGlow = () => {
    if (!enableBreathSync) return 0.5;
    return 0.3 + Math.sin(breathPhase) * 0.4;
  };

  // Get direction color with breath modulation
  const getDirectionColor = (direction: CompassDirection, isActive: boolean = false) => {
    const baseColor = SPECTRAL_COLORS[direction];
    const opacity = isActive ? 1 : hoveredDirection === direction ? 0.8 : 0.6;
    return `${baseColor}${Math.floor(opacity * 255)
      .toString(16)
      .padStart(2, '0')}`;
  };

  // Handle direction selection
  const handleDirectionClick = (direction: CompassDirection) => {
    setIsActivated(true);
    onDirectionSelect(direction);

    // Clear any hover state
    setHoveredDirection(null);

    // Start center pulse to guide user
    setCenterPulse(true);

    // Reset activation state after animation
    setTimeout(() => setIsActivated(false), 300);
  };

  // Handle center activation
  const handleCenterClick = () => {
    setIsActivated(true);
    setCenterPulse(false); // Stop pulsing
    onCenterActivate?.();

    // Reset activation state after animation
    setTimeout(() => setIsActivated(false), 300);
  };

  // Calculate position for direction buttons
  const getDirectionPosition = (direction: CompassDirection) => {
    const metadata = DIRECTION_METADATA[direction];
    const radius = size * 0.35;
    const angle = (metadata.angle - 90) * (Math.PI / 180); // Adjust for top = north

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div
      ref={compassRef}
      className={`compass-sigil-interface relative ${className}`}
      style={{
        width: size,
        height: size,
        transform: `scale(${getBreathScale()})`,
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Outer Sacred Circle */}
      <div
        className='absolute inset-0 rounded-full border-2'
        style={{
          borderColor: getDirectionColor(currentDirection),
          boxShadow: `0 0 ${20 * getBreathGlow()}px ${getDirectionColor(currentDirection)}`,
          transition: 'all 0.3s ease',
        }}
      />

      {/* Inner Sacred Geometry Pattern */}
      <div
        className='absolute inset-4 rounded-full border'
        style={{
          borderColor: getDirectionColor(currentDirection, true),
          opacity: 0.3,
          transform: `rotate(${breathPhase * 57.3}deg)`, // Convert radians to degrees
          transition: 'transform 0.1s ease',
        }}
      />

      {/* Center Activation Point */}
      <button
        onClick={handleCenterClick}
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 hover:scale-110 z-20 ${
          centerPulse ? 'animate-pulse' : ''
        }`}
        style={{
          backgroundColor: isActivated ? getDirectionColor(currentDirection) : 'transparent',
          borderColor: getDirectionColor(currentDirection),
          color: isActivated ? '#000' : getDirectionColor(currentDirection),
          boxShadow: centerPulse
            ? `0 0 ${20 * getBreathGlow()}px ${getDirectionColor(currentDirection)}, 0 0 ${40 * getBreathGlow()}px ${getDirectionColor(currentDirection)}`
            : `0 0 ${10 * getBreathGlow()}px ${getDirectionColor(currentDirection)}`,
        }}
      >
        ⊕
      </button>

      {/* Direction Buttons */}
      {(Object.keys(DIRECTION_METADATA) as CompassDirection[]).map(direction => {
        const position = getDirectionPosition(direction);
        const metadata = DIRECTION_METADATA[direction];
        const isActive = currentDirection === direction;
        const isHovered = hoveredDirection === direction;

        return (
          <div
            key={direction}
            className='absolute'
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            }}
          >
            {/* Direction Button */}
            <button
              onClick={() => handleDirectionClick(direction)}
              onMouseEnter={() => setHoveredDirection(direction)}
              onMouseLeave={() => setHoveredDirection(null)}
              className='w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110'
              style={{
                backgroundColor: isHovered ? getDirectionColor(direction) : 'transparent',
                borderColor: getDirectionColor(direction),
                borderWidth: isActive ? '3px' : '2px', // Thicker border for selected
                color: isHovered ? '#000' : getDirectionColor(direction),
                boxShadow: isActive
                  ? `0 0 ${12 * getBreathGlow()}px ${getDirectionColor(direction)}`
                  : `0 0 ${8 * getBreathGlow()}px ${getDirectionColor(direction)}`,
                opacity: isActive ? 0.8 : 1, // Slightly dimmed when selected
              }}
            >
              <div className='text-xl font-bold'>{metadata.symbol}</div>
              {showLabels && <div className='text-xs uppercase tracking-wider'>{direction}</div>}
            </button>

            {/* Direction Label and Description - Only show on hover */}
            {showLabels && isHovered && (
              <div
                className='absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded p-2 text-center min-w-max z-10'
                style={{
                  borderColor: getDirectionColor(direction),
                  color: getDirectionColor(direction),
                }}
              >
                <div className='font-bold text-sm'>{metadata.element}</div>
                <div className='text-xs opacity-80'>{metadata.archetype}</div>
                <div className='text-xs mt-1 max-w-32'>{metadata.description}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Sacred Geometry Overlay Lines */}
      <svg
        className='absolute inset-0 pointer-events-none'
        width={size}
        height={size}
        style={{ opacity: 0.2 }}
      >
        {/* Cross lines connecting opposite directions */}
        <line
          x1={size / 2}
          y1={size * 0.15}
          x2={size / 2}
          y2={size * 0.85}
          stroke={getDirectionColor(currentDirection)}
          strokeWidth='1'
        />
        <line
          x1={size * 0.15}
          y1={size / 2}
          x2={size * 0.85}
          y2={size / 2}
          stroke={getDirectionColor(currentDirection)}
          strokeWidth='1'
        />

        {/* Diagonal lines for sacred geometry */}
        <line
          x1={size * 0.25}
          y1={size * 0.25}
          x2={size * 0.75}
          y2={size * 0.75}
          stroke={getDirectionColor(currentDirection)}
          strokeWidth='0.5'
        />
        <line
          x1={size * 0.75}
          y1={size * 0.25}
          x2={size * 0.25}
          y2={size * 0.75}
          stroke={getDirectionColor(currentDirection)}
          strokeWidth='0.5'
        />
      </svg>

      {/* Instruction Text */}
      {centerPulse && (
        <div
          className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 text-center animate-pulse'
          style={{ color: getDirectionColor(currentDirection) }}
        >
          <div className='text-sm font-bold'>Click the center ⊕ to proceed</div>
        </div>
      )}

      {/* Consciousness Level Indicator */}
      <div
        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full text-center ${centerPulse ? 'mt-12' : 'mt-4'}`}
        style={{ color: getDirectionColor(currentDirection) }}
      >
        <div className='text-xs opacity-60'>Consciousness Level</div>
        <div className='text-sm font-bold'>{Math.round(consciousnessLevel * 100)}%</div>
      </div>
    </div>
  );
};

export default CompassSigilInterface;
