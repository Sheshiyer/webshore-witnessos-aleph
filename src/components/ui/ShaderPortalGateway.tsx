/**
 * Shader Portal Gateway - Pure Shader-Based Portal
 * 
 * Replaces all geometric elements with dynamic shader background
 * Uses the compact raymarching shader for fluid, dynamic portal effects
 */

'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { DynamicPortalShader } from '@/components/shaders/DynamicPortalShader';
import { MatrixText } from '@/components/ui/MatrixText';
import type { ConsciousnessState } from '@/types';

interface ShaderPortalGatewayProps {
  onEnterGateway: () => void;
  consciousness?: ConsciousnessState;
}

export const ShaderPortalGateway: React.FC<ShaderPortalGatewayProps> = ({
  onEnterGateway,
  consciousness = {
    awarenessLevel: 0.7,
    coherenceLevel: 0.8,
    resonanceFrequency: 40,
    dimensionalPhase: 0.5,
    quantumEntanglement: 0.6,
    sacredGeometryAlignment: 0.9,
    breathCoherence: 0.75,
    heartRateVariability: 0.65,
    brainwaveCoherence: 0.8,
    auricFieldStrength: 0.7,
    chakraAlignment: 0.85,
    merkabahActivation: 0.6,
    crystallineGridConnection: 0.9,
    galacticAlignment: 0.4,
    solarPlexusActivation: 0.7,
    thirdEyeActivation: 0.8,
    crownChakraResonance: 0.9,
    kundaliniFlow: 0.6,
    lightBodyActivation: 0.75,
    dnaActivation: 0.8,
    cellularRegeneration: 0.7,
    energeticBoundaries: 0.85,
    psychicProtection: 0.9,
    spiritualConnection: 0.95,
    cosmicConsciousness: 0.8,
  }
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Full Viewport Dynamic Shader Background */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 1], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            {/* Dynamic Portal Shader - Full Viewport */}
            <DynamicPortalShader
              intensity={isHovering ? 1.8 : 1.2}
              speed={isHovering ? 1.2 : 0.8}
              color1={[0.0, 0.4, 1.0]} // Deep Blue
              color2={[1.0, 0.3, 0.0]} // Orange/Red
              color3={[0.0, 0.8, 1.0]} // Bright Cyan/Blue
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {/* Title */}
        <div className="text-center mb-12 pointer-events-none">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider font-mono">
            <span className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">&gt;</span>{' '}
            <MatrixText
              text="WITNESSOS_PORTAL.exe"
              className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
              delay={500}
            />
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-mono leading-relaxed max-w-2xl mx-auto">
            <MatrixText
              text="// Breath interface gateway to multidimensional witness exploration"
              delay={1500}
            />
          </p>
        </div>

        {/* Enter Gateway Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onEnterGateway}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`
              relative px-12 py-4 font-mono font-bold text-xl tracking-wider transition-all duration-500
              ${isHovering 
                ? 'text-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 scale-110 shadow-[0_0_30px_rgba(34,211,238,0.8)]' 
                : 'text-cyan-400 bg-black/50 border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              }
              backdrop-blur-xl
            `}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
            }}
          >
            <MatrixText
              text="ENTER_GATEWAY"
              delay={2500}
            />
          </button>
        </div>

        {/* Status Display */}
        <div className="absolute bottom-8 left-8 text-xs font-mono text-gray-400 pointer-events-none">
          <div className="space-y-1 bg-black/30 backdrop-blur-sm p-4 rounded border border-cyan-500/20">
            <div>[STATUS] PORTAL_ACTIVE | DIMENSIONAL_PHASE: {(consciousness.dimensionalPhase * 100).toFixed(1)}%</div>
            <div>[SYSTEM] WITNESS_FIELD: {(consciousness.awarenessLevel * 100).toFixed(1)}% | COHERENCE: {(consciousness.coherenceLevel * 100).toFixed(1)}%</div>
            <div>[BREATH] AWAITING_GATEWAY_AUTHORIZATION</div>
            <div>[SHADER] RAYMARCHING_ACTIVE | GRAIN_FIELD: ENABLED</div>
          </div>
        </div>

        {/* Version Info */}
        <div className="absolute bottom-8 right-8 text-xs font-mono text-gray-400 pointer-events-none">
          <div className="bg-black/30 backdrop-blur-sm p-4 rounded border border-cyan-500/20">
            <div>WITNESSOS v2.5.4</div>
            <div>SHADER_PORTAL_v1.0</div>
            <div>RAYMARCHING_ENGINE</div>
          </div>
        </div>

        {/* Witness Metrics Overlay */}
        <div className="absolute top-8 right-8 text-xs font-mono text-gray-400 pointer-events-none">
          <div className="bg-black/30 backdrop-blur-sm p-4 rounded border border-cyan-500/20 space-y-1">
            <div className="text-cyan-400 mb-2">[WITNESS_METRICS]</div>
            <div>AWARENESS: {(consciousness.awarenessLevel * 100).toFixed(0)}%</div>
            <div>COHERENCE: {(consciousness.coherenceLevel * 100).toFixed(0)}%</div>
            <div>RESONANCE: {consciousness.resonanceFrequency.toFixed(1)}Hz</div>
            <div>BREATH_SYNC: {(consciousness.quantumEntanglement * 100).toFixed(0)}%</div>
            <div>SACRED_GEOMETRY: {(consciousness.sacredGeometryAlignment * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Effects */}
      <style jsx>{`
        @keyframes portal-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
          }
        }

        .portal-glow {
          animation: portal-pulse 3s ease-in-out infinite;
        }

        /* Ensure full viewport coverage */
        canvas {
          width: 100vw !important;
          height: 100vh !important;
        }
      `}</style>
    </div>
  );
};

export default ShaderPortalGateway;
