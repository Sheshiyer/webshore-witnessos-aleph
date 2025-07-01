/**
 * Test Page for Consciousness Simulator
 * 
 * Debug and test the consciousness state simulator
 */

'use client';

import React from 'react';
import ConsciousnessSimulatorPanel from '@/components/debug/ConsciousnessSimulatorPanel';

export default function TestSimulatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">
            🧠 Consciousness Simulator Test
          </h1>
          <p className="text-gray-300 text-lg">
            Test and debug consciousness technology without requiring real biometric sensors.
            Simulate breath patterns, HRV, consciousness states, and gestures for development.
          </p>
        </div>

        <ConsciousnessSimulatorPanel 
          onSimulationDataChange={(data) => {
            console.log('Simulation data changed:', data);
          }}
        />
      </div>
    </div>
  );
} 