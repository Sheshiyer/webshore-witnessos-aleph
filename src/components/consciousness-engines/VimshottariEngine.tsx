/**
 * Vimshottari Engine 3D Visualization Component
 *
 * Timeline spiral navigation with fractal time dilation effects
 * Displays Vedic dasha periods as navigable 3D temporal spirals
 */

'use client';

import { createFractalGeometry } from '@/generators/fractal-noise';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { BirthData } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { CatmullRomCurve3, Color, Group, TubeGeometry, Vector3 } from 'three';

interface VimshottariEngineProps {
  birthData: BirthData;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: any) => void;
}

interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  duration: number; // years
  level: number; // 0=mahadasha, 1=antardasha, 2=pratyantardasha
  color: Color;
  position: Vector3;
  significance: string;
}

interface TimelineSpiral {
  curve: CatmullRomCurve3;
  geometry: TubeGeometry;
  periods: DashaPeriod[];
}

const PLANET_COLORS: Record<string, Color> = {
  Sun: new Color('#FFD700'), // Gold
  Moon: new Color('#C0C0C0'), // Silver
  Mars: new Color('#FF4500'), // Red-Orange
  Mercury: new Color('#32CD32'), // Green
  Jupiter: new Color('#4169E1'), // Royal Blue
  Venus: new Color('#FF69B4'), // Hot Pink
  Saturn: new Color('#8B4513'), // Saddle Brown
  Rahu: new Color('#800080'), // Purple
  Ketu: new Color('#A0522D'), // Sienna
};

const PLANET_YEARS: Record<string, number> = {
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Mercury: 17,
  Jupiter: 16,
  Venus: 20,
  Saturn: 19,
  Rahu: 18,
  Ketu: 7,
};

export const VimshottariEngine: React.FC<VimshottariEngineProps> = ({
  birthData,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateVimshottari, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Calculate Vimshottari dasha timeline
  useEffect(() => {
    if (birthData && visible) {
      calculateVimshottari({
        birth_date: birthData.date,
        birth_time: birthData.time,
        birth_location: birthData.location,
        include_antardashas: true,
        include_pratyantardashas: false,
        years_ahead: 50,
      })
        .then(result => {
          if (result.success && onCalculationComplete) {
            onCalculationComplete(result.data);
          }
        })
        .catch(console.error);
    }
  }, [birthData, visible, calculateVimshottari, onCalculationComplete]);

  // Process Vimshottari data into 3D timeline spiral
  const { timelineSpiral, currentPeriod, futurePeriods } = useMemo(() => {
    if (!state.data) {
      return { timelineSpiral: null, currentPeriod: null, futurePeriods: [] };
    }

    const vimshottariData = state.data as any; // Type assertion for engine-specific data
    const periods: DashaPeriod[] = [];
    const currentDate = new Date();

    // Process mahadashas
    if (vimshottariData?.mahadashas) {
      vimshottariData.mahadashas.forEach((maha: any, index: number) => {
        const startDate = new Date(maha.start_date);
        const endDate = new Date(maha.end_date);
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

        // Calculate spiral position
        const angle = (index / (vimshottariData.mahadashas?.length || 1)) * Math.PI * 4; // 2 full rotations
        const radius = 3 + index * 0.2;
        const height = index * 0.5;

        periods.push({
          planet: maha.planet,
          startDate,
          endDate,
          duration,
          level: 0,
          color: PLANET_COLORS[maha.planet] || new Color('#FFFFFF'),
          position: new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius),
          significance: maha.significance || `${maha.planet} period`,
        });
      });
    }

    // Process antardashas for current mahadasha
    if (vimshottariData?.current_antardasha) {
      vimshottariData.current_antardasha.forEach((antar: any, index: number) => {
        const startDate = new Date(antar.start_date);
        const endDate = new Date(antar.end_date);
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

        // Position antardashas around current mahadasha
        const currentMaha = periods.find(p => currentDate >= p.startDate && currentDate <= p.endDate);

        if (currentMaha) {
          const angle = (index / (vimshottariData.current_antardasha?.length || 1)) * Math.PI * 2;
          const radius = 1;

          periods.push({
            planet: antar.planet,
            startDate,
            endDate,
            duration,
            level: 1,
            color: PLANET_COLORS[antar.planet] || new Color('#FFFFFF'),
            position: currentMaha.position
              .clone()
              .add(new Vector3(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius)),
            significance: antar.significance || `${antar.planet} sub-period`,
          });
        }
      });
    }

    // Create spiral curve through mahadasha positions
    const spiralPoints: Vector3[] = [];
    const mahadashas = periods.filter(p => p.level === 0);

    mahadashas.forEach((period, index) => {
      spiralPoints.push(period.position);

      // Add intermediate points for smooth curve
      if (index < mahadashas.length - 1) {
        const nextPeriod = mahadashas[index + 1];
        if (nextPeriod) {
          const midPoint = period.position.clone().lerp(nextPeriod.position, 0.5);
          midPoint.y += 0.3; // Add some curve height
          spiralPoints.push(midPoint);
        }
      }
    });

    let spiral: TimelineSpiral | null = null;
    if (spiralPoints.length > 2) {
      const curve = new CatmullRomCurve3(spiralPoints);
      const geometry = new TubeGeometry(curve, 100, 0.05, 8, false);

      spiral = {
        curve,
        geometry,
        periods: mahadashas,
      };
    }

    // Find current period
    const current = periods.find(
      p => currentDate >= p.startDate && currentDate <= p.endDate && p.level === 0
    );

    // Get future periods
    const future = periods.filter(p => p.startDate > currentDate && p.level === 0).slice(0, 5);

    return { timelineSpiral: spiral, currentPeriod: current, futurePeriods: future };
  }, [state.data]);

  // Generate fractal time dilation effects
  const timeFractals = useMemo(() => {
    if (!futurePeriods.length) return [];

    return futurePeriods.map((period, index) => {
      return createFractalGeometry({
        type: 'julia',
        iterations: 3 + index,
        scale: 0.3,
        complexity: PLANET_YEARS[period.planet] || 10,
        seed: period.planet.charCodeAt(0),
      });
    });
  }, [futurePeriods]);

  // Animate the timeline
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      const time = state.clock.elapsedTime;

      // Rotate timeline slowly
      groupRef.current.rotation.y += delta * 0.02 * consciousnessLevel;

      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.03;
      groupRef.current.scale.setScalar(scale * breathScale);

      // Animate period markers
      groupRef.current.children.forEach((child, index) => {
        if (child.userData.period) {
          const period = child.userData.period as DashaPeriod;

          // Pulse based on planet's natural rhythm
          const planetFreq = PLANET_YEARS[period.planet] || 10;
          const pulse = Math.sin(time * (1 / planetFreq)) * 0.1 + 1;
          child.scale.setScalar(pulse);

          // Consciousness-responsive glow
          if ('material' in child && child.material) {
            const material = child.material as any;
            if (material.emissiveIntensity !== undefined) {
              material.emissiveIntensity = 0.1 + consciousnessLevel * 0.2;
            }
          }
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Timeline Spiral */}
      {timelineSpiral && (
        <mesh geometry={timelineSpiral.geometry}>
          <meshStandardMaterial
            color='#ffffff'
            transparent
            opacity={0.6}
            emissive='#ffffff'
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {/* Mahadasha Period Markers */}
      {timelineSpiral?.periods.map((period, index) => (
        <group
          key={`maha-${period.planet}-${index}`}
          position={period.position.toArray()}
          userData={{ period }}
        >
          {/* Planet sphere */}
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={period.color}
              emissive={period.color}
              emissiveIntensity={period === currentPeriod ? 0.3 : 0.1}
              transparent
              opacity={period === currentPeriod ? 1.0 : 0.7}
            />
          </mesh>

          {/* Period duration indicator */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, period.duration * 0.1]} />
            <meshStandardMaterial color={period.color} />
          </mesh>

          {/* Planet name indicator */}
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color={period.color} />
          </mesh>
        </group>
      ))}

      {/* Current Period Highlight */}
      {currentPeriod && (
        <group position={currentPeriod.position.toArray()}>
          <mesh>
            <ringGeometry args={[0.3, 0.4, 16]} />
            <meshBasicMaterial color={currentPeriod.color} transparent opacity={0.5} side={2} />
          </mesh>
        </group>
      )}

      {/* Future Period Fractals */}
      {futurePeriods.map(
        (period, index) =>
          timeFractals[index] && (
            <mesh
              key={`fractal-${period.planet}-${index}`}
              geometry={timeFractals[index]}
              position={period.position.toArray()}
              scale={[0.5, 0.5, 0.5]}
            >
              <meshStandardMaterial
                color={period.color}
                transparent
                opacity={0.4}
                wireframe
                emissive={period.color}
                emissiveIntensity={0.1}
              />
            </mesh>
          )
      )}

      {/* Time Flow Visualization */}
      <group>
        {Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 5;
          const height = i * 0.1;
          return (
            <mesh
              key={`time-particle-${i}`}
              position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
            >
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshBasicMaterial color='#ffffff' transparent opacity={0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Central Time Axis */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 10]} />
        <meshStandardMaterial color='#ffffff' transparent opacity={0.2} />
      </mesh>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[2, 0.1, 8, 32]} />
          <meshBasicMaterial color='#FFD700' transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default VimshottariEngine;
