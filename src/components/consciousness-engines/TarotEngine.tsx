/**
 * Tarot Engine 3D Visualization Component
 *
 * Card-based symbolic environments with archetypal fractal signatures
 * Displays tarot spreads as immersive 3D symbolic landscapes
 */

'use client';

import { createFractalGeometry } from '@/generators/fractal-noise';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { QuestionInput } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { Color, Euler, Group, Vector3 } from 'three';

interface TarotEngineProps {
  question: QuestionInput;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: any) => void;
}

interface TarotCard {
  name: string;
  suit: string;
  number: number;
  position: Vector3;
  rotation: Euler;
  reversed: boolean;
  archetype: string;
  element: string;
  color: Color;
}

interface TarotSpread {
  name: string;
  positions: Array<{
    name: string;
    position: Vector3;
    meaning: string;
  }>;
}

const TAROT_SPREADS: Record<string, TarotSpread> = {
  three_card: {
    name: 'Past, Present, Future',
    positions: [
      { name: 'Past', position: new Vector3(-2, 0, 0), meaning: 'What has led to this moment' },
      { name: 'Present', position: new Vector3(0, 0, 0), meaning: 'Current situation' },
      { name: 'Future', position: new Vector3(2, 0, 0), meaning: 'Potential outcome' },
    ],
  },
  celtic_cross: {
    name: 'Celtic Cross',
    positions: [
      { name: 'Present', position: new Vector3(0, 0, 0), meaning: 'Current situation' },
      { name: 'Challenge', position: new Vector3(0, 0, 0.1), meaning: 'What crosses you' },
      { name: 'Past', position: new Vector3(0, -1, 0), meaning: 'Distant past' },
      { name: 'Future', position: new Vector3(0, 1, 0), meaning: 'Possible future' },
      { name: 'Above', position: new Vector3(0, 0, 1), meaning: 'Conscious thoughts' },
      { name: 'Below', position: new Vector3(0, 0, -1), meaning: 'Unconscious influences' },
      { name: 'Advice', position: new Vector3(3, -1, 0), meaning: 'Your approach' },
      { name: 'External', position: new Vector3(3, 0, 0), meaning: 'External influences' },
      { name: 'Hopes', position: new Vector3(3, 1, 0), meaning: 'Hopes and fears' },
      { name: 'Outcome', position: new Vector3(3, 2, 0), meaning: 'Final outcome' },
    ],
  },
};

const SUIT_COLORS: Record<string, Color> = {
  cups: new Color('#4A90E2'), // Water - Blue
  wands: new Color('#F5A623'), // Fire - Orange
  swords: new Color('#7ED321'), // Air - Yellow/Green
  pentacles: new Color('#D0021B'), // Earth - Red
  major: new Color('#9013FE'), // Major Arcana - Purple
};

const ELEMENT_FRACTALS: Record<string, string> = {
  water: 'julia',
  fire: 'dragon',
  air: 'sierpinski',
  earth: 'mandelbrot',
  spirit: 'mandala',
};

export const TarotEngine: React.FC<TarotEngineProps> = ({
  question,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateTarot, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Calculate Tarot reading
  useEffect(() => {
    if (question && visible) {
      calculateTarot({
        question: question.question,
        spread_type: (question.context as any)?.spread_type || 'three_card',
        focus_area: (question.context as any)?.focus_area || 'general',
        include_reversals: true,
        include_numerology: true,
      })
        .then(result => {
          if (result.success && onCalculationComplete) {
            onCalculationComplete(result.data);
          }
        })
        .catch(console.error);
    }
  }, [question, visible, calculateTarot, onCalculationComplete]);

  // Process tarot data into 3D card structures
  const { cards, spread, cardGeometries } = useMemo(() => {
    if (!state.data) {
      return { cards: [], spread: TAROT_SPREADS.three_card, cardGeometries: [] };
    }

    const tarotData = state.data as any; // Type assertion for engine-specific data
    const spreadType = tarotData?.spread_type || 'three_card';
    const currentSpread = TAROT_SPREADS[spreadType as keyof typeof TAROT_SPREADS] || TAROT_SPREADS.three_card;

    // Create card objects
    const cardList: TarotCard[] = [];
    const geometries: any[] = [];

    if (tarotData?.cards) {
      tarotData.cards.forEach((cardData: any, index: number) => {
        const spreadPosition = currentSpread?.positions[index];
        if (!spreadPosition) return;

        // Determine suit and color
        const suit = cardData.suit || 'major';
        const element = cardData.element || 'spirit';
        const color = SUIT_COLORS[suit as keyof typeof SUIT_COLORS] || SUIT_COLORS.major;

        const card: TarotCard = {
          name: cardData.name,
          suit: suit,
          number: cardData.number || 0,
          position: spreadPosition.position.clone(),
          rotation: new Euler(0, 0, cardData.reversed ? Math.PI : 0),
          reversed: cardData.reversed || false,
          archetype: cardData.archetype || 'unknown',
          element: element,
          color: color || new Color('#FFFFFF'),
        };

        cardList.push(card);

        // Create fractal geometry for card's archetypal energy
        const fractalType = ELEMENT_FRACTALS[element] || 'mandala';
        const geometry = createFractalGeometry({
          type: fractalType,
          iterations: 3 + Math.floor(consciousnessLevel * 3),
          scale: 0.5,
          complexity: cardData.number || 1,
          seed: cardData.name.charCodeAt(0),
        });

        geometries.push(geometry);
      });
    }

    return { cards: cardList, spread: currentSpread, cardGeometries: geometries };
  }, [state.data, consciousnessLevel]);

  // Animate the tarot spread
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      // Gentle rotation of the entire spread
      groupRef.current.rotation.y += delta * 0.02 * consciousnessLevel;

      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.03;
      groupRef.current.scale.setScalar(scale * breathScale);

      // Animate individual cards
      groupRef.current.children.forEach((child, index) => {
        if (child.type === 'Group') {
          // Subtle floating animation
          const time = state.clock.elapsedTime;
          const offset = index * 0.5;
          child.position.y += Math.sin(time + offset) * 0.001;

          // Consciousness-responsive glow
          child.children.forEach(cardChild => {
            if (cardChild.type === 'Mesh' && 'material' in cardChild) {
              const material = cardChild.material as any;
              if (material.emissiveIntensity !== undefined) {
                material.emissiveIntensity = 0.1 + consciousnessLevel * 0.2;
              }
            }
          });
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Tarot Cards */}
      {cards.map((card, index) => (
        <group
          key={`${card.name}-${index}`}
          position={card.position.toArray()}
          rotation={card.rotation.toArray()}
        >
          {/* Card base */}
          <mesh>
            <boxGeometry args={[1, 1.6, 0.05]} />
            <meshStandardMaterial
              color={card.color}
              transparent
              opacity={0.8}
              emissive={card.color}
              emissiveIntensity={0.1}
            />
          </mesh>

          {/* Card border */}
          <mesh>
            <boxGeometry args={[1.1, 1.7, 0.06]} />
            <meshStandardMaterial color='#ffffff' transparent opacity={0.3} />
          </mesh>

          {/* Archetypal fractal pattern */}
          {cardGeometries[index] && (
            <mesh geometry={cardGeometries[index]} position={[0, 0, 0.03]} scale={[0.8, 0.8, 0.1]}>
              <meshStandardMaterial
                color={card.color}
                transparent
                opacity={0.6}
                wireframe
                emissive={card.color}
                emissiveIntensity={0.2}
              />
            </mesh>
          )}

          {/* Suit symbol */}
          <mesh position={[0, -0.6, 0.03]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={card.color} />
          </mesh>

          {/* Reversed indicator */}
          {card.reversed && (
            <mesh position={[0.4, 0.7, 0.03]}>
              <coneGeometry args={[0.05, 0.1, 3]} />
              <meshStandardMaterial color='#ff0000' />
            </mesh>
          )}

          {/* Card energy field */}
          <mesh>
            <ringGeometry args={[0.8, 1.0, 16]} />
            <meshBasicMaterial color={card.color} transparent opacity={0.1} side={2} />
          </mesh>
        </group>
      ))}

      {/* Spread connection lines */}
      {spread?.positions &&
        spread.positions.length > 1 &&
        spread.positions.map((pos, index) => {
          if (index === 0) return null;
          const prevPos = spread.positions[index - 1];
          if (!prevPos) return null;

          const direction = pos.position.clone().sub(prevPos.position);
          const length = direction.length();
          const midpoint = prevPos.position.clone().add(direction.clone().multiplyScalar(0.5));

          return (
            <mesh key={`connection-${index}`} position={midpoint.toArray()}>
              <cylinderGeometry args={[0.01, 0.01, length]} />
              <meshBasicMaterial color='#ffffff' transparent opacity={0.2} />
            </mesh>
          );
        })}

      {/* Spread circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.2, 32]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.05} />
      </mesh>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[2, 0.1, 8, 32]} />
          <meshBasicMaterial color='#9013FE' transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default TarotEngine;
