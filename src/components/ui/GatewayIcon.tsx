/**
 * GatewayIcon.tsx
 * 
 * A sacred geometry-inspired animated icon for the Consciousness Gateway.
 * It uses CSS animations for performance and visual fidelity.
 */

import React from 'react';

interface GatewayIconProps {
  selectedColor: string;
}

export const GatewayIcon: React.FC<GatewayIconProps> = ({ selectedColor }) => {
  return (
    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
      {/* Pulsing Glow */}
      <style>
        {`
          @keyframes pulseGlow {
            0%, 100% {
              transform: scale(0.9);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
          }
          .pulse-glow {
            animation: pulseGlow 8s ease-in-out infinite;
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 15s linear infinite;
          }

          @keyframes spin-reverse-slow {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-spin-reverse-slow {
            animation: spin-reverse-slow 20s linear infinite;
          }
        `}
      </style>
      
      <div 
        className="absolute inset-0 rounded-full pulse-glow"
        style={{ 
          boxShadow: `0 0 40px ${selectedColor}60, 0 0 80px ${selectedColor}30`,
          backgroundColor: `${selectedColor}10`,
        }}
      />

      {/* Rotating Outer Ring */}
      <div 
        className="absolute inset-2 animate-spin-slow"
      >
        <div className="w-full h-full rounded-full border-2" style={{ borderColor: `${selectedColor}80` }}></div>
      </div>

      {/* Rotating Inner Ring */}
      <div 
        className="absolute inset-4 animate-spin-reverse-slow"
      >
        <div className="w-full h-full rounded-full border-2" style={{ borderColor: `${selectedColor}50`, borderStyle: 'dashed' }}></div>
      </div>
      
      {/* Central static element */}
      <div className="w-8 h-8 rounded-full" style={{ 
          backgroundColor: `${selectedColor}40`, 
          border: `2px solid ${selectedColor}`,
      }}>
      </div>
    </div>
  );
}; 