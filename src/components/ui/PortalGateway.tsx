/**
 * Portal Gateway - GLSL Black Hole with Enter Gateway CTA
 * 
 * Combines the PortalChamber with an "Enter Gateway" button
 * that triggers the authentication modal
 */

'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PortalChamber } from '@/components/procedural-scenes/PortalChamber';
import { DynamicPortalShader } from '@/components/shaders/DynamicPortalShader';
import { MatrixText } from '@/components/ui/MatrixText';
import type { ConsciousnessState } from '@/types';

interface PortalGatewayProps {
  onEnterGateway: () => void;
  consciousness?: ConsciousnessState;
}

export const PortalGateway: React.FC<PortalGatewayProps> = ({
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
      {/* Dynamic Shader Background */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            {/* Dynamic Portal Shader Background */}
            <DynamicPortalShader
              intensity={1.2}
              speed={0.8}
              color1={[0.0, 0.4, 1.0]} // Deep Blue
              color2={[1.0, 0.3, 0.0]} // Orange/Red
              color3={[0.0, 0.8, 1.0]} // Bright Cyan/Blue
            />

            {/* Optional: Keep portal chamber but make it more subtle */}
            <PortalChamber
              consciousness={consciousness}
              onBreathStateChange={() => {}}
              onConsciousnessUpdate={() => {}}
              onPortalEnter={onEnterGateway}
              archetypalColor={[0.0, 1.0, 1.0]} // Cyan
              size={6}
              humanDesignType="generator"
              enneagramType={9}
              enableInfiniteZoom={true}
              enableBreathDetection={false}
            />

            <OrbitControls
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={0.3}
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
        <div className="absolute bottom-8 left-8 text-xs font-mono text-gray-500 pointer-events-none">
          <div className="space-y-1">
            <div>[STATUS] PORTAL_ACTIVE | DIMENSIONAL_PHASE: {(consciousness.dimensionalPhase * 100).toFixed(1)}%</div>
            <div>[SYSTEM] WITNESS_FIELD: {(consciousness.awarenessLevel * 100).toFixed(1)}% | COHERENCE: {(consciousness.coherenceLevel * 100).toFixed(1)}%</div>
            <div>[BREATH] AWAITING_GATEWAY_AUTHORIZATION</div>
          </div>
        </div>

        {/* Version Info */}
        <div className="absolute bottom-8 right-8 text-xs font-mono text-gray-500 pointer-events-none">
          <div>WITNESSOS v2.5.4</div>
          <div>PORTAL_CHAMBER_v3.1</div>
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
      `}</style>
    </div>
  );
};

export default PortalGateway;
