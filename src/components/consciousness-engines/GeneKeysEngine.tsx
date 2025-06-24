/**
 * Gene Keys Engine 3D Visualization Component
 *
 * Codon-based consciousness mapping with DNA fractal structures
 * Displays Gene Keys profile as interactive 3D DNA consciousness helix
 */

'use client';

import { createFractalGeometry } from '@/generators/fractal-noise';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { BirthData } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CatmullRomCurve3, Color, Group, TubeGeometry, Vector3 } from 'three';

interface GeneKeysEngineProps {
  birthData: BirthData;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: unknown) => void;
}

interface GeneKey {
  gate: number;
  codon: string;
  aminoAcid: string;
  shadow: string;
  gift: string;
  siddhi: string;
  position: Vector3;
  color: Color;
  frequency: number;
  sphere: 'mental' | 'emotional' | 'physical';
}

interface DNAStrand {
  curve: CatmullRomCurve3;
  geometry: TubeGeometry;
  geneKeys: GeneKey[];
}

const SPHERE_COLORS: Record<string, Color> = {
  mental: new Color('#9370DB'), // Violet
  emotional: new Color('#FF69B4'), // Hot Pink
  physical: new Color('#32CD32'), // Lime Green
};

const CODON_FREQUENCIES: Record<string, number> = {
  UUU: 528,
  UUC: 594,
  UUA: 396,
  UUG: 417,
  UCU: 528,
  UCC: 639,
  UCA: 741,
  UCG: 852,
  UAU: 963,
  UAC: 174,
  UAA: 285,
  UAG: 396,
  UGU: 528,
  UGC: 639,
  UGA: 741,
  UGG: 852,
  // ... (simplified set for demo)
};

const AMINO_ACID_COLORS: Record<string, Color> = {
  Phe: new Color('#FF6B6B'),
  Leu: new Color('#4ECDC4'),
  Ser: new Color('#45B7D1'),
  Tyr: new Color('#96CEB4'),
  Cys: new Color('#FFEAA7'),
  Trp: new Color('#DDA0DD'),
  Pro: new Color('#98D8C8'),
  His: new Color('#F7DC6F'),
  Gln: new Color('#BB8FCE'),
  Arg: new Color('#85C1E9'),
  Ile: new Color('#F8C471'),
  Met: new Color('#82E0AA'),
  Thr: new Color('#F1948A'),
  Asn: new Color('#85C1E9'),
  Lys: new Color('#F7DC6F'),
  Val: new Color('#A9DFBF'),
  Ala: new Color('#D7BDE2'),
  Asp: new Color('#AED6F1'),
  Glu: new Color('#A3E4D7'),
  Gly: new Color('#FADBD8'),
};

export const GeneKeysEngine: React.FC<GeneKeysEngineProps> = ({
  birthData,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateGeneKeys, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Calculate Gene Keys profile
  useEffect(() => {
    if (birthData && visible) {
      calculateGeneKeys({
        birth_date: birthData.date,
        birth_time: birthData.time,
        birth_location: birthData.location,
        include_codons: true,
        include_amino_acids: true,
        include_spheres: true,
      })
        .then(result => {
          if (result.success && onCalculationComplete) {
            onCalculationComplete(result.data);
          }
        })
        .catch(console.error);
    }
  }, [birthData, visible, calculateGeneKeys, onCalculationComplete]);

  // Process Gene Keys data into 3D DNA structure
  const { dnaStrands, activationSequence, consciousnessLevels } = useMemo(() => {
    if (!state.data) {
      return { dnaStrands: [], activationSequence: [], consciousnessLevels: [] };
    }

    const geneKeysData = state.data as Record<string, unknown>; // Type assertion for engine-specific data
    const geneKeys: GeneKey[] = [];

    // Process core Gene Keys
    if (geneKeysData?.profile) {
      Object.entries(geneKeysData.profile as Record<string, unknown>).forEach(([, keyData], index) => {
        const keyDataRecord = keyData as Record<string, unknown>;
        const gate = keyDataRecord.gate || index + 1;
        const codon = keyDataRecord.codon || 'UUU';
        const aminoAcid = keyDataRecord.amino_acid || 'Phe';
        const sphere = keyDataRecord.sphere || 'physical';

        // Calculate position in DNA helix
        const angle = (index / 64) * Math.PI * 4; // 2 full rotations for 64 codons
        const radius = 1.5;
        const height = (index / 64) * 6 - 3; // Spread over 6 units height

        geneKeys.push({
          gate,
          codon,
          aminoAcid,
          shadow: keyData.shadow || 'Unknown',
          gift: keyData.gift || 'Unknown',
          siddhi: keyData.siddhi || 'Unknown',
          position: new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius),
          color: AMINO_ACID_COLORS[aminoAcid] || new Color('#FFFFFF'),
          frequency: CODON_FREQUENCIES[codon] || 528,
          sphere: sphere as 'mental' | 'emotional' | 'physical',
        });
      });
    }

    // Create DNA double helix strands
    const strand1Points: Vector3[] = [];
    const strand2Points: Vector3[] = [];

    geneKeys.forEach((geneKey, index) => {
      const angle = (index / geneKeys.length) * Math.PI * 4;
      const radius = 1.5;
      const height = geneKey.position.y;

      // First strand
      strand1Points.push(new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));

      // Second strand (opposite side)
      strand2Points.push(
        new Vector3(Math.cos(angle + Math.PI) * radius, height, Math.sin(angle + Math.PI) * radius)
      );
    });

    const strands: DNAStrand[] = [];

    if (strand1Points.length > 2) {
      const curve1 = new CatmullRomCurve3(strand1Points);
      const geometry1 = new TubeGeometry(curve1, 100, 0.05, 8, false);
      strands.push({
        curve: curve1,
        geometry: geometry1,
        geneKeys: geneKeys.filter((_, i) => i % 2 === 0),
      });

      const curve2 = new CatmullRomCurve3(strand2Points);
      const geometry2 = new TubeGeometry(curve2, 100, 0.05, 8, false);
      strands.push({
        curve: curve2,
        geometry: geometry2,
        geneKeys: geneKeys.filter((_, i) => i % 2 === 1),
      });
    }

    // Create activation sequence based on consciousness level
    const activations = geneKeys
      .filter(() => Math.random() < consciousnessLevel)
      .slice(0, Math.floor(consciousnessLevel * 10));

    // Create consciousness level indicators
    const levels = [
      { name: 'Shadow', height: -2, color: new Color('#8B0000'), opacity: 0.3 },
      { name: 'Gift', height: 0, color: new Color('#FFD700'), opacity: 0.6 },
      { name: 'Siddhi', height: 2, color: new Color('#FFFFFF'), opacity: 0.9 },
    ];

    return { dnaStrands: strands, activationSequence: activations, consciousnessLevels: levels };
  }, [state.data, consciousnessLevel]);

  // Generate codon fractal patterns
  const codonFractals = useMemo(() => {
    return activationSequence.map(geneKey => {
      return createFractalGeometry({
        type: 'dna_helix',
        iterations: 4,
        scale: 0.2,
        complexity: geneKey.gate,
        seed: geneKey.codon.charCodeAt(0),
      });
    });
  }, [activationSequence]);

  // Animate the DNA structure
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      const time = state.clock.elapsedTime;

      // Rotate DNA helix
      groupRef.current.rotation.y += delta * 0.05 * consciousnessLevel;

      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.04;
      groupRef.current.scale.setScalar(scale * breathScale);

      // Animate gene key activations
      groupRef.current.children.forEach(child => {
        if (child.userData.geneKey) {
          const geneKey = child.userData.geneKey as GeneKey;

          // Pulse based on codon frequency
          const freq = geneKey.frequency / 1000;
          const pulse = Math.sin(time * freq) * 0.1 + 1;
          child.scale.setScalar(pulse);

          // Consciousness-responsive glow
          if ('material' in child && child.material) {
            const material = child.material as THREE.Material & { emissiveIntensity?: number };
            if (material.emissiveIntensity !== undefined) {
              material.emissiveIntensity = 0.1 + consciousnessLevel * 0.3;
            }
          }
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* DNA Double Helix Strands */}
      {dnaStrands.map((strand, index) => (
        <mesh key={`strand-${index}`} geometry={strand.geometry}>
          <meshStandardMaterial
            color={index === 0 ? '#4ECDC4' : '#FF6B6B'}
            transparent
            opacity={0.7}
            emissive={index === 0 ? '#4ECDC4' : '#FF6B6B'}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Gene Key Codons */}
      {activationSequence.map((geneKey, index) => (
        <group key={`genekey-${geneKey.gate}`} position={geneKey.position.toArray()} userData={{ geneKey }}>
          {/* Codon sphere */}
          <mesh>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color={geneKey.color}
              emissive={geneKey.color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Amino acid indicator */}
          <mesh position={[0, 0.2, 0]}>
            <octahedronGeometry args={[0.05]} />
            <meshStandardMaterial color={geneKey.color} />
          </mesh>

          {/* Sphere indicator */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.03, 0.03, 0.03]} />
            <meshStandardMaterial color={SPHERE_COLORS[geneKey.sphere] || '#FFFFFF'} />
          </mesh>

          {/* Codon fractal pattern */}
          {codonFractals[index] && (
            <mesh geometry={codonFractals[index]} scale={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial color={geneKey.color} transparent opacity={0.4} wireframe />
            </mesh>
          )}
        </group>
      ))}

      {/* Consciousness Level Planes */}
      {consciousnessLevels.map(level => (
        <mesh key={level.name} position={[0, level.height, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshBasicMaterial color={level.color} transparent opacity={level.opacity * consciousnessLevel} />
        </mesh>
      ))}

      {/* Base pairs connections */}
      {dnaStrands.length === 2 &&
        dnaStrands[0]?.geneKeys.map((geneKey1, index) => {
          const geneKey2 = dnaStrands[1]?.geneKeys[index];
          if (!geneKey2) return null;

          const midpoint = geneKey1.position.clone().lerp(geneKey2.position, 0.5);
          const distance = geneKey1.position.distanceTo(geneKey2.position);

          return (
            <mesh key={`basepair-${index}`} position={midpoint.toArray()} scale={[distance, 0.02, 0.02]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color='#FFFFFF' transparent opacity={0.3} />
            </mesh>
          );
        })}

      {/* Central axis */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 6]} />
        <meshStandardMaterial color='#FFFFFF' transparent opacity={0.2} />
      </mesh>

      {/* Sphere indicators */}
      {Object.entries(SPHERE_COLORS).map(([sphere, color], index) => (
        <mesh key={sphere} position={[3, index - 1, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[2, 0.1, 8, 32]} />
          <meshBasicMaterial color='#4ECDC4' transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default GeneKeysEngine;
