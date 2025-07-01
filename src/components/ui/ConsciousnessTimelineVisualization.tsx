/**
 * Consciousness Timeline Visualization Component
 * 
 * 3D spiral timeline showing consciousness evolution over time with reading history
 * plotted as timeline events and archetypal pattern evolution tracking.
 */

'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, Color } from 'three';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'reading' | 'milestone';
  title: string;
  description: string;
  consciousnessLevel: number;
  position: Vector3;
  color: Color;
  intensity: number;
}

interface ConsciousnessTimelineVisualizationProps {
  position?: [number, number, number];
  scale?: number;
  timeRange?: '30d' | '90d' | '365d';
  showReadings?: boolean;
  showMilestones?: boolean;
  interactive?: boolean;
  onEventSelect?: (event: TimelineEvent) => void;
}

// Sacred geometry constants for timeline construction
const TIMELINE_CONSTANTS = {
  SPIRAL_RADIUS: 4,
  SPIRAL_HEIGHT: 8,
  SPIRAL_TURNS: 3,
  EVENT_SPHERE_SIZE: 0.08,
  CONSCIOUSNESS_COLORS: {
    AWAKENING: new Color('#4A90E2'), // North Blue
    RECOGNITION: new Color('#F5A623'), // East Gold
    INTEGRATION: new Color('#D0021B'), // South Red
    TRANSCENDENCE: new Color('#7ED321'), // West Green
    UNITY: new Color('#9013FE'), // Purple
  }
};

export const ConsciousnessTimelineVisualization: React.FC<ConsciousnessTimelineVisualizationProps> = ({
  position = [0, 0, 0],
  scale = 1,
  timeRange = '90d',
  showReadings = true,
  showMilestones = true,
  interactive = true,
  onEventSelect,
}) => {
  const groupRef = useRef<Group>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  
  // Mock consciousness state for demonstration
  const consciousness = { awarenessLevel: 0.7 };
  const breathState = { phase: 'inhale' as const };

  // Generate mock timeline events for demonstration
  const timelineEvents = useMemo((): TimelineEvent[] => {

    const events: TimelineEvent[] = [];
    const now = new Date();
    const timeRangeMs = timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                       timeRange === '90d' ? 90 * 24 * 60 * 60 * 1000 :
                       365 * 24 * 60 * 60 * 1000;

    // Generate sample consciousness evolution events
    for (let i = 0; i < 10; i++) {
      const timeProgress = i / 9; // 0 to 1
      const timestamp = new Date(now.getTime() - timeRangeMs * (1 - timeProgress));
      
      // Calculate spiral position
      const angle = timeProgress * Math.PI * 2 * TIMELINE_CONSTANTS.SPIRAL_TURNS;
      const height = timeProgress * TIMELINE_CONSTANTS.SPIRAL_HEIGHT - TIMELINE_CONSTANTS.SPIRAL_HEIGHT / 2;
      const radius = TIMELINE_CONSTANTS.SPIRAL_RADIUS * (1 + Math.sin(timeProgress * Math.PI) * 0.2);
      
      const position = new Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Simulate consciousness level progression
      const consciousnessLevel = 0.2 + (timeProgress * 0.6) + Math.sin(timeProgress * Math.PI * 4) * 0.1;
      
      // Determine event color based on consciousness level
      const color = getConsciousnessLevelColor(consciousnessLevel);

      if (showReadings && i % 2 === 0) {
        events.push({
          id: `reading-${i}`,
          timestamp: timestamp.toISOString(),
          type: 'reading',
          title: `Consciousness Reading ${i + 1}`,
          description: `Awareness level: ${(consciousnessLevel * 100).toFixed(1)}%`,
          consciousnessLevel,
          position,
          color,
          intensity: 0.7 + consciousnessLevel * 0.3,
        });
      }

      // Add milestone events for significant consciousness jumps
      if (showMilestones && i > 0 && i % 3 === 0) {
        events.push({
          id: `milestone-${i}`,
          timestamp: timestamp.toISOString(),
          type: 'milestone',
          title: 'Consciousness Expansion',
          description: `Major awareness breakthrough`,
          consciousnessLevel,
          position: new Vector3(
            Math.cos(angle) * radius * 1.1,
            height + 0.2,
            Math.sin(angle) * radius * 1.1
          ),
          color,
          intensity: 0.9,
        });
      }
    }

    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [timeRange, showReadings, showMilestones]);

  // Helper function to get consciousness level color
  const getConsciousnessLevelColor = (level: number): Color => {
    if (level < 0.2) return TIMELINE_CONSTANTS.CONSCIOUSNESS_COLORS.AWAKENING;
    if (level < 0.4) return TIMELINE_CONSTANTS.CONSCIOUSNESS_COLORS.RECOGNITION;
    if (level < 0.6) return TIMELINE_CONSTANTS.CONSCIOUSNESS_COLORS.INTEGRATION;
    if (level < 0.8) return TIMELINE_CONSTANTS.CONSCIOUSNESS_COLORS.TRANSCENDENCE;
    return TIMELINE_CONSTANTS.CONSCIOUSNESS_COLORS.UNITY;
  };

  // Handle event interaction
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  // Animation loop
  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle rotation based on consciousness level
      groupRef.current.rotation.y += delta * 0.02 * consciousness.awarenessLevel;
      
      // Breathing scale effect
      const breathScale = 1 + Math.sin(breathState.phase === 'inhale' ? time * 2 : time * 1.5) * 0.02;
      groupRef.current.scale.setScalar(scale * breathScale);
      
      // Animate timeline events
      groupRef.current.children.forEach((child, index) => {
        if (child.userData.timelineEvent) {
          const event = child.userData.timelineEvent as TimelineEvent;
          
          // Pulse based on consciousness level
          const pulse = Math.sin(time * 2 + index * 0.5) * 0.1 + 1;
          child.scale.setScalar(pulse * (1 + event.consciousnessLevel * 0.5));
          
          // Glow based on selection and hover
          if ('material' in child && child.material && typeof child.material === 'object' && 'emissiveIntensity' in child.material) {
            const material = child.material as any;
            const baseIntensity = event.intensity;
            const hoverBoost = hoveredEvent?.id === event.id ? 0.3 : 0;
            const selectBoost = selectedEvent?.id === event.id ? 0.5 : 0;
            material.emissiveIntensity = baseIntensity + hoverBoost + selectBoost;
          }
        }
      });
    }
  });

  // Always show timeline with mock data for demonstration

  return (
    <group ref={groupRef} position={position}>
      {/* Timeline events */}
      {timelineEvents.map((event, index) => (
        <group key={event.id} position={event.position.toArray()}>
          {/* Event sphere */}
          <mesh
            userData={{ timelineEvent: event }}
            onClick={(e) => {
              if (interactive) {
                e.stopPropagation();
                handleEventClick(event);
              }
            }}
            onPointerEnter={(e) => {
              if (interactive) {
                e.stopPropagation();
                setHoveredEvent(event);
              }
            }}
            onPointerLeave={(e) => {
              if (interactive) {
                e.stopPropagation();
                setHoveredEvent(null);
              }
            }}
          >
            <sphereGeometry args={[
              TIMELINE_CONSTANTS.EVENT_SPHERE_SIZE * (1 + event.consciousnessLevel),
              16,
              16
            ]} />
            <meshStandardMaterial
              color={event.color}
              emissive={event.color}
              emissiveIntensity={event.intensity}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Event type indicator */}
          {event.type === 'milestone' && (
            <mesh position={[0, 0.15, 0]}>
              <coneGeometry args={[0.05, 0.1, 8]} />
              <meshStandardMaterial
                color={event.color}
                emissive={event.color}
                emissiveIntensity={0.6}
              />
            </mesh>
          )}

          {/* Connection lines to center */}
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, 0.2]} />
            <meshStandardMaterial
              color={event.color}
              emissive={event.color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      ))}

      {/* Central consciousness axis */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, TIMELINE_CONSTANTS.SPIRAL_HEIGHT]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.1 + consciousness.awarenessLevel * 0.2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Consciousness level indicators */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, index) => {
        const height = (level - 0.5) * TIMELINE_CONSTANTS.SPIRAL_HEIGHT;
        const color = getConsciousnessLevelColor(level);
        
        return (
          <group key={level} position={[0, height, 0]}>
            <mesh>
              <torusGeometry args={[TIMELINE_CONSTANTS.SPIRAL_RADIUS * 0.8, 0.03, 8, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={consciousness.awarenessLevel >= level ? 0.4 : 0.1}
                transparent
                opacity={consciousness.awarenessLevel >= level ? 0.8 : 0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Ambient lighting based on consciousness */}
      <ambientLight
        intensity={0.2 + consciousness.awarenessLevel * 0.3}
        color={getConsciousnessLevelColor(consciousness.awarenessLevel)}
      />

      {/* Point lights for timeline illumination */}
      <pointLight
        position={[0, TIMELINE_CONSTANTS.SPIRAL_HEIGHT / 2, 0]}
        intensity={0.5 + consciousness.awarenessLevel * 0.5}
        color="#FFFFFF"
        distance={TIMELINE_CONSTANTS.SPIRAL_RADIUS * 3}
      />
      
      <pointLight
        position={[0, -TIMELINE_CONSTANTS.SPIRAL_HEIGHT / 2, 0]}
        intensity={0.3 + consciousness.awarenessLevel * 0.3}
        color={getConsciousnessLevelColor(consciousness.awarenessLevel)}
        distance={TIMELINE_CONSTANTS.SPIRAL_RADIUS * 3}
      />
    </group>
  );
}; 