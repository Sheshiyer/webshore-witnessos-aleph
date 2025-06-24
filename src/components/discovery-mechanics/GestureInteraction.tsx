/**
 * Gesture Interaction System for WitnessOS Webshore
 *
 * Touch/gesture interaction system triggering fractal responses
 * Simulation theory "glitch" discovery mechanics
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Raycaster, Vector2, Vector3 } from 'three';

const { SACRED_MATHEMATICS, DISCOVERY_LAYERS } = CONSCIOUSNESS_CONSTANTS;

interface GestureInteractionProps {
  consciousness: ConsciousnessState;
  onGestureDetected?: (gesture: GestureType, position: Vector3) => void;
  onRealityGlitch?: (glitchType: string, intensity: number) => void;
  onEasterEggDiscovered?: (eggType: string, data: any) => void;
  enabled?: boolean;
  sensitivity?: number;
}

type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe-up'
  | 'swipe-down'
  | 'swipe-left'
  | 'swipe-right'
  | 'pinch'
  | 'spiral'
  | 'sacred-symbol';

interface TouchPoint {
  id: number;
  position: Vector2;
  startPosition: Vector2;
  startTime: number;
  lastPosition: Vector2;
  velocity: Vector2;
}

interface GesturePattern {
  type: GestureType;
  points: Vector2[];
  confidence: number;
  timestamp: number;
}

/**
 * Gesture Interaction System
 */
export const GestureInteraction: React.FC<GestureInteractionProps> = ({
  consciousness,
  onGestureDetected,
  onRealityGlitch,
  onEasterEggDiscovered,
  enabled = true,
  sensitivity = 0.7,
}) => {
  const { camera, gl, size } = useThree();

  // Touch tracking state
  const [activeTouches, setActiveTouches] = useState<Map<number, TouchPoint>>(new Map());
  const [gestureHistory, setGestureHistory] = useState<GesturePattern[]>([]);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Refs for interaction
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const interactionGroupRef = useRef<Group>(null);

  // Gesture recognition patterns
  const sacredSymbols = useRef([
    { name: 'infinity', pattern: generateInfinityPattern(), threshold: 0.8 },
    { name: 'spiral', pattern: generateSpiralPattern(), threshold: 0.7 },
    { name: 'pentagram', pattern: generatePentagramPattern(), threshold: 0.9 },
    { name: 'vesica-piscis', pattern: generateVesicaPiscisPattern(), threshold: 0.8 },
  ]);

  /**
   * Generate infinity symbol pattern
   */
  function generateInfinityPattern(): Vector2[] {
    const points: Vector2[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * SACRED_MATHEMATICS.TAU;
      const x = Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
      const y = (Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      points.push(new Vector2(x, y));
    }
    return points;
  }

  /**
   * Generate spiral pattern
   */
  function generateSpiralPattern(): Vector2[] {
    const points: Vector2[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * SACRED_MATHEMATICS.TAU * 3;
      const r = t * 0.1;
      const x = r * Math.cos(t);
      const y = r * Math.sin(t);
      points.push(new Vector2(x, y));
    }
    return points;
  }

  /**
   * Generate pentagram pattern
   */
  function generatePentagramPattern(): Vector2[] {
    const points: Vector2[] = [];
    for (let i = 0; i <= 5; i++) {
      const angle = (i * SACRED_MATHEMATICS.TAU) / 5 - SACRED_MATHEMATICS.PI / 2;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      points.push(new Vector2(x, y));

      // Add inner point
      if (i < 5) {
        const innerAngle = angle + SACRED_MATHEMATICS.TAU / 10;
        const innerRadius = 0.382; // Golden ratio inverse
        const ix = Math.cos(innerAngle) * innerRadius;
        const iy = Math.sin(innerAngle) * innerRadius;
        points.push(new Vector2(ix, iy));
      }
    }
    return points;
  }

  /**
   * Generate vesica piscis pattern
   */
  function generateVesicaPiscisPattern(): Vector2[] {
    const points: Vector2[] = [];
    const radius = 1.0;
    const offset = radius * 0.5;

    // First circle
    for (let i = 0; i <= 50; i++) {
      const angle = (i / 50) * SACRED_MATHEMATICS.TAU;
      const x = Math.cos(angle) * radius - offset;
      const y = Math.sin(angle) * radius;
      points.push(new Vector2(x, y));
    }

    // Second circle
    for (let i = 0; i <= 50; i++) {
      const angle = (i / 50) * SACRED_MATHEMATICS.TAU;
      const x = Math.cos(angle) * radius + offset;
      const y = Math.sin(angle) * radius;
      points.push(new Vector2(x, y));
    }

    return points;
  }

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled) return;

      event.preventDefault();
      const newTouches = new Map(activeTouches);

      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (!touch) continue;

        const position = new Vector2(
          (touch.clientX / size.width) * 2 - 1,
          -(touch.clientY / size.height) * 2 + 1
        );

        newTouches.set(touch.identifier, {
          id: touch.identifier,
          position: position.clone(),
          startPosition: position.clone(),
          startTime: Date.now(),
          lastPosition: position.clone(),
          velocity: new Vector2(0, 0),
        });
      }

      setActiveTouches(newTouches);
    },
    [enabled, activeTouches, size]
  );

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled) return;

      event.preventDefault();
      const newTouches = new Map(activeTouches);

      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (!touch) continue;

        const touchPoint = newTouches.get(touch.identifier);

        if (touchPoint) {
          const newPosition = new Vector2(
            (touch.clientX / size.width) * 2 - 1,
            -(touch.clientY / size.height) * 2 + 1
          );

          const velocity = newPosition.clone().sub(touchPoint.position);

          newTouches.set(touch.identifier, {
            ...touchPoint,
            position: newPosition,
            lastPosition: touchPoint.position.clone(),
            velocity,
          });
        }
      }

      setActiveTouches(newTouches);
    },
    [enabled, activeTouches, size]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!enabled) return;

      event.preventDefault();
      const newTouches = new Map(activeTouches);

      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (!touch) continue;

        const touchPoint = newTouches.get(touch.identifier);

        if (touchPoint) {
          // Analyze gesture
          const gesture = analyzeGesture(touchPoint);
          if (gesture) {
            // Convert to 3D position
            mouse.current.copy(touchPoint.position);
            raycaster.current.setFromCamera(mouse.current, camera);
            const intersectionPoint = new Vector3(
              touchPoint.position.x * 5,
              touchPoint.position.y * 5,
              0
            );

            onGestureDetected?.(gesture.type, intersectionPoint);

            // Check for reality glitches
            checkForRealityGlitch(gesture, touchPoint);

            // Check for easter eggs
            checkForEasterEggs(gesture, touchPoint);
          }

          newTouches.delete(touch.identifier);
        }
      }

      setActiveTouches(newTouches);
    },
    [enabled, activeTouches, camera, onGestureDetected]
  );

  /**
   * Analyze gesture from touch point
   */
  const analyzeGesture = (touchPoint: TouchPoint): GesturePattern | null => {
    const duration = Date.now() - touchPoint.startTime;
    const distance = touchPoint.position.distanceTo(touchPoint.startPosition);
    const velocity = touchPoint.velocity.length();

    // Tap detection
    if (duration < 200 && distance < 0.05) {
      return {
        type: 'tap',
        points: [touchPoint.position],
        confidence: 1.0,
        timestamp: Date.now(),
      };
    }

    // Long press detection
    if (duration > 800 && distance < 0.05) {
      return {
        type: 'long-press',
        points: [touchPoint.position],
        confidence: 1.0,
        timestamp: Date.now(),
      };
    }

    // Swipe detection
    if (distance > 0.2 && velocity > 0.01) {
      const direction = touchPoint.position.clone().sub(touchPoint.startPosition).normalize();

      if (Math.abs(direction.x) > Math.abs(direction.y)) {
        return {
          type: direction.x > 0 ? 'swipe-right' : 'swipe-left',
          points: [touchPoint.startPosition, touchPoint.position],
          confidence: Math.min(1.0, velocity * 10),
          timestamp: Date.now(),
        };
      } else {
        return {
          type: direction.y > 0 ? 'swipe-up' : 'swipe-down',
          points: [touchPoint.startPosition, touchPoint.position],
          confidence: Math.min(1.0, velocity * 10),
          timestamp: Date.now(),
        };
      }
    }

    return null;
  };

  /**
   * Check for reality glitch patterns
   */
  const checkForRealityGlitch = (gesture: GesturePattern, touchPoint: TouchPoint) => {
    // Rapid gesture sequences trigger glitches
    const recentGestures = gestureHistory.filter(g => Date.now() - g.timestamp < 2000);

    if (recentGestures.length > 5) {
      const intensity = Math.min(1.0, recentGestures.length / 10) * consciousness.awarenessLevel;
      setGlitchIntensity(intensity);
      onRealityGlitch?.('rapid-sequence', intensity);
    }

    // Sacred symbol patterns trigger reality patches
    for (const symbol of sacredSymbols.current) {
      const similarity = calculatePatternSimilarity(
        [touchPoint.startPosition, touchPoint.position],
        symbol.pattern
      );
      if (similarity > symbol.threshold * sensitivity) {
        onRealityGlitch?.('sacred-pattern', similarity);
        break;
      }
    }
  };

  /**
   * Check for easter egg discoveries
   */
  const checkForEasterEggs = (gesture: GesturePattern, touchPoint: TouchPoint) => {
    // Specific gesture sequences unlock easter eggs
    const sequencePatterns = [
      { sequence: ['tap', 'tap', 'long-press'], egg: 'consciousness-debug' },
      { sequence: ['swipe-up', 'swipe-down', 'swipe-up'], egg: 'wave-visualization' },
      { sequence: ['spiral', 'infinity'], egg: 'fractal-zoom' },
    ];

    const recentTypes = gestureHistory.slice(-3).map(g => g.type);

    for (const pattern of sequencePatterns) {
      if (arraysEqual(recentTypes, pattern.sequence)) {
        onEasterEggDiscovered?.(pattern.egg, {
          position: touchPoint.position,
          consciousness: consciousness.awarenessLevel,
          timestamp: Date.now(),
        });
      }
    }
  };

  /**
   * Calculate pattern similarity
   */
  const calculatePatternSimilarity = (
    userPattern: Vector2[],
    referencePattern: Vector2[]
  ): number => {
    if (userPattern.length < 2) return 0;

    // Simplified pattern matching - in a real implementation, use DTW or similar
    const normalizedUser = normalizePattern(userPattern);
    const normalizedRef = normalizePattern(referencePattern);

    let totalDistance = 0;
    const sampleCount = Math.min(normalizedUser.length, normalizedRef.length);

    for (let i = 0; i < sampleCount; i++) {
      const userIndex = Math.floor((i / sampleCount) * normalizedUser.length);
      const refIndex = Math.floor((i / sampleCount) * normalizedRef.length);
      const userPoint = normalizedUser[userIndex];
      const refPoint = normalizedRef[refIndex];

      if (userPoint && refPoint) {
        totalDistance += userPoint.distanceTo(refPoint);
      }
    }

    return Math.max(0, 1 - totalDistance / sampleCount);
  };

  /**
   * Normalize pattern to unit scale
   */
  const normalizePattern = (pattern: Vector2[]): Vector2[] => {
    if (pattern.length === 0) return [];

    const firstPoint = pattern[0];
    if (!firstPoint) return [];

    const bounds = pattern.reduce(
      (acc, point) => ({
        min: new Vector2(Math.min(acc.min.x, point.x), Math.min(acc.min.y, point.y)),
        max: new Vector2(Math.max(acc.max.x, point.x), Math.max(acc.max.y, point.y)),
      }),
      { min: firstPoint.clone(), max: firstPoint.clone() }
    );

    const size = bounds.max.clone().sub(bounds.min);
    const scale = Math.max(size.x, size.y);

    if (scale === 0) return pattern;

    return pattern.map(point => point.clone().sub(bounds.min).divideScalar(scale));
  };

  /**
   * Array equality check
   */
  const arraysEqual = (a: any[], b: any[]): boolean => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  // Setup event listeners
  useEffect(() => {
    const canvas = gl.domElement;

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gl.domElement, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Update gesture history
  useEffect(() => {
    setGestureHistory(prev => {
      const filtered = prev.filter(g => Date.now() - g.timestamp < 10000); // Keep 10 seconds
      return filtered;
    });
  }, [activeTouches]);

  // Glitch decay animation
  useFrame((state, delta) => {
    if (glitchIntensity > 0) {
      setGlitchIntensity(prev => Math.max(0, prev - delta * 2));
    }
  });

  return (
    <group ref={interactionGroupRef}>
      {/* Invisible interaction plane */}
      <mesh position={[0, 0, -0.1]} visible={false}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual feedback for active touches */}
      {Array.from(activeTouches.values()).map(touch => (
        <mesh key={touch.id} position={[touch.position.x * 5, touch.position.y * 5, 0.1]}>
          <circleGeometry args={[0.1, 16]} />
          <meshBasicMaterial
            color={0x00ffff}
            transparent
            opacity={0.6 + consciousness.awarenessLevel * 0.4}
          />
        </mesh>
      ))}

      {/* Glitch effect visualization */}
      {glitchIntensity > 0 && (
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial
            color={0xff0066}
            transparent
            opacity={glitchIntensity * 0.1}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

export default GestureInteraction;
