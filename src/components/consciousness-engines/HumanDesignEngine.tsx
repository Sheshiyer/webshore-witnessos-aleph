/**
 * Human Design Engine 3D Visualization Component
 *
 * Gate-based fractal spatial layouts and energy center mandalas
 * Displays Human Design chart as interactive 3D consciousness map
 */

'use client';

import { createFractalGeometry } from '@/generators/fractal-noise';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useConsciousnessEngineAutoSave } from '@/hooks/useConsciousnessEngineAutoSave';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { BirthData } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { Color, Group, Vector3 } from 'three';

interface HumanDesignEngineProps {
  birthData: BirthData;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: unknown) => void;
}

interface EnergyCenter {
  name: string;
  position: Vector3;
  color: Color;
  defined: boolean;
  gates: number[];
}

interface Gate {
  number: number;
  position: Vector3;
  line: number;
  planet: string;
  color: Color;
}

const ENERGY_CENTERS: Omit<EnergyCenter, 'defined' | 'gates'>[] = [
  { name: 'Head', position: new Vector3(0, 3, 0), color: new Color('#FFD700') },
  { name: 'Ajna', position: new Vector3(0, 2, 0), color: new Color('#90EE90') },
  { name: 'Throat', position: new Vector3(0, 1, 0), color: new Color('#87CEEB') },
  { name: 'G', position: new Vector3(0, 0, 0), color: new Color('#FFB6C1') },
  { name: 'Heart', position: new Vector3(-1, 0, 0), color: new Color('#FF6347') },
  { name: 'Spleen', position: new Vector3(-1, -1, 0), color: new Color('#DDA0DD') },
  { name: 'Sacral', position: new Vector3(0, -2, 0), color: new Color('#FF4500') },
  { name: 'Solar Plexus', position: new Vector3(1, -1, 0), color: new Color('#F0E68C') },
  { name: 'Root', position: new Vector3(0, -3, 0), color: new Color('#8B4513') },
];

export const HumanDesignEngine: React.FC<HumanDesignEngineProps> = ({
  birthData,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateHumanDesign, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();
  
  // Auto-save hook for consciousness readings
  const { saveEngineResult, isAutoSaving, autoSaveCount } = useConsciousnessEngineAutoSave();

  // Calculate Human Design data
  useEffect(() => {
    if (birthData && visible) {
      const hdInput = {
        birth_date: birthData.date,
        birth_time: birthData.time,
        birth_location: birthData.location,
        include_transits: false,
        include_lines: true,
      };
      
      calculateHumanDesign(hdInput)
        .then(result => {
          if (result.success) {
            // Auto-save the reading
            saveEngineResult(
              'human_design',
              result.data,
              hdInput,
              {
                birthData,
                includeTransits: false,
                includeLines: true,
                consciousnessLevel,
              }
            );
            
            if (onCalculationComplete) {
              onCalculationComplete(result.data);
            }
          }
        })
        .catch(console.error);
    }
  }, [birthData, visible, calculateHumanDesign, onCalculationComplete, consciousnessLevel, saveEngineResult]);

  // Process Human Design data into 3D structures
  const { energyCenters, gates, channels } = useMemo(() => {
    if (!state.data) {
      return { energyCenters: [], gates: [], channels: [] };
    }

    const hdData = state.data as Record<string, unknown>; // Type assertion for engine-specific data

    // Create energy centers with definition status
    const centers: EnergyCenter[] = ENERGY_CENTERS.map(center => {
      const centerData = (hdData?.centers as Record<string, any>)?.[center.name.toLowerCase()];
      return {
        ...center,
        defined: centerData?.defined || false,
        gates: centerData?.gates || [],
      };
    });

    // Create gates from chart data
    const gateList: Gate[] = [];
    if (hdData?.gates) {
      Object.entries(hdData.gates as Record<string, unknown>).forEach(([gateNum, gateData]) => {
        const gateDataRecord = gateData as Record<string, unknown>;
        const centerName = gateDataRecord.center || 'G';
        const center = centers.find(c => c.name === centerName);
        if (center) {
          // Position gates around their center
          const angle = (parseInt(gateNum) / 64) * Math.PI * 2;
          const radius = 0.5;
          const gatePos = center.position
            .clone()
            .add(
              new Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.3,
                Math.sin(angle) * radius * 0.3
              )
            );

          gateList.push({
            number: parseInt(gateNum),
            position: gatePos,
            line: Number(gateDataRecord.line) || 1,
            planet: String(gateDataRecord.planet) || 'Earth',
            color: new Color().setHSL(parseInt(gateNum) / 64, 0.7, 0.6),
          });
        }
      });
    }

    // Create channels (connections between gates)
    const channelList: Array<{ from: Vector3; to: Vector3; color: Color }> = [];
    if (hdData?.channels) {
      (hdData.channels as Array<Record<string, unknown>>).forEach(channel => {
        const fromGate = gateList.find(g => g.number === channel.gate1);
        const toGate = gateList.find(g => g.number === channel.gate2);
        if (fromGate && toGate) {
          channelList.push({
            from: fromGate.position,
            to: toGate.position,
            color: new Color('#ffffff'),
          });
        }
      });
    }

    return { energyCenters: centers, gates: gateList, channels: channelList };
  }, [state.data]);

  // Generate fractal mandala for each defined center
  const centerMandalas = useMemo(() => {
    return energyCenters.map(center => {
      if (!center.defined) return null;

      return createFractalGeometry({
        type: 'mandala',
        iterations: 4,
        scale: 0.3,
        complexity: center.gates.length,
        seed: center.name.charCodeAt(0),
      });
    });
  }, [energyCenters]);

  // Animate the Human Design chart
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      // Rotate entire chart slowly
      groupRef.current.rotation.y += delta * 0.05 * consciousnessLevel;

      // Pulse with breath
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.05;
      groupRef.current.scale.setScalar(scale * breathScale);
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Energy Centers */}
      {energyCenters.map((center, index) => (
        <group key={center.name} position={center.position.toArray()}>
          {/* Center sphere */}
          <mesh>
            <sphereGeometry args={[center.defined ? 0.2 : 0.15, 16, 16]} />
            <meshStandardMaterial
              color={center.color}
              transparent
              opacity={center.defined ? 0.8 : 0.3}
              emissive={center.color}
              emissiveIntensity={center.defined ? 0.2 : 0.05}
            />
          </mesh>

          {/* Fractal mandala for defined centers */}
          {center.defined && centerMandalas[index] && (
            <mesh geometry={centerMandalas[index]}>
              <meshStandardMaterial color={center.color} transparent opacity={0.6} wireframe />
            </mesh>
          )}

          {/* Center name indicator */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color={center.color} />
          </mesh>
        </group>
      ))}

      {/* Gates */}
      {gates.map(gate => (
        <group key={gate.number} position={gate.position.toArray()}>
          {/* Gate crystal */}
          <mesh>
            <octahedronGeometry args={[0.08]} />
            <meshStandardMaterial
              color={gate.color}
              transparent
              opacity={0.7}
              emissive={gate.color}
              emissiveIntensity={0.1}
            />
          </mesh>

          {/* Line indicator */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.1]} />
            <meshBasicMaterial color={gate.color} />
          </mesh>
        </group>
      ))}

      {/* Channels (connections) */}
      {channels.map((channel, index) => {
        const direction = channel.to.clone().sub(channel.from);
        const length = direction.length();
        const midpoint = channel.from.clone().add(direction.clone().multiplyScalar(0.5));

        return (
          <mesh key={index} position={midpoint.toArray()}>
            <cylinderGeometry args={[0.02, 0.02, length]} />
            <meshStandardMaterial
              color={channel.color}
              transparent
              opacity={0.6}
              emissive={channel.color}
              emissiveIntensity={0.1}
            />
          </mesh>
        );
      })}

      {/* Bodygraph outline */}
      <mesh>
        <ringGeometry args={[2.5, 2.7, 32]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.1} side={2} />
      </mesh>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[1.5, 0.1, 8, 32]} />
          <meshBasicMaterial color='#ffffff' transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default HumanDesignEngine;
