/**
 * Responsive Consciousness Interface for WitnessOS Webshore
 * 
 * Mobile-first consciousness interface with adaptive layouts and orientation awareness
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useState, useEffect } from 'react';
import { Group, Vector3 } from 'three';

interface ResponsiveConsciousnessInterfaceProps {
  consciousness: ConsciousnessState;
  onConsciousnessChange?: (newState: Partial<ConsciousnessState>) => void;
  enabled?: boolean;
}

interface ScreenDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface InterfaceLayout {
  scale: number;
  position: Vector3;
  spacing: number;
  componentSize: number;
  textScale: number;
}

/**
 * Responsive Consciousness Interface Component
 */
export const ResponsiveConsciousnessInterface: React.FC<ResponsiveConsciousnessInterfaceProps> = ({
  consciousness,
  onConsciousnessChange,
  enabled = true,
}) => {
  const groupRef = useRef<Group>(null);
  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    deviceType: 'desktop',
  });
  
  // Detect device type and screen dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const orientation = width > height ? 'landscape' : 'portrait';
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (width <= 768) {
        deviceType = 'mobile';
      } else if (width <= 1024) {
        deviceType = 'tablet';
      }
      
      setScreenDimensions({
        width,
        height,
        aspectRatio,
        orientation,
        deviceType,
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);
  
  // Calculate adaptive layout based on screen dimensions
  const interfaceLayout: InterfaceLayout = React.useMemo(() => {
    const { deviceType, orientation, aspectRatio } = screenDimensions;
    
    let scale = 1;
    let spacing = 1;
    let componentSize = 1;
    let textScale = 1;
    let position = new Vector3(0, 0, 0);
    
    switch (deviceType) {
      case 'mobile':
        scale = orientation === 'portrait' ? 0.6 : 0.8;
        spacing = 0.8;
        componentSize = 0.7;
        textScale = 0.8;
        position = orientation === 'portrait' 
          ? new Vector3(0, -2, 0) 
          : new Vector3(2, 0, 0);
        break;
        
      case 'tablet':
        scale = 0.9;
        spacing = 1.0;
        componentSize = 0.9;
        textScale = 0.9;
        position = new Vector3(0, -1, 0);
        break;
        
      case 'desktop':
        scale = 1.2;
        spacing = 1.2;
        componentSize = 1.0;
        textScale = 1.0;
        position = new Vector3(0, 0, 0);
        break;
    }
    
    // Adjust for extreme aspect ratios
    if (aspectRatio > 2) {
      // Very wide screens
      scale *= 0.8;
      position.x += 3;
    } else if (aspectRatio < 0.6) {
      // Very tall screens
      scale *= 0.7;
      position.y -= 1;
    }
    
    return { scale, position, spacing, componentSize, textScale };
  }, [screenDimensions]);
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef} scale={interfaceLayout.scale} position={interfaceLayout.position}>
      {/* Consciousness Level Display */}
      <ConsciousnessLevelDisplay
        consciousness={consciousness}
        layout={interfaceLayout}
        screenDimensions={screenDimensions}
      />
      
      {/* Breath Synchronization Interface */}
      <BreathSyncInterface
        consciousness={consciousness}
        layout={interfaceLayout}
        screenDimensions={screenDimensions}
        onBreathChange={(breathPhase) => 
          onConsciousnessChange?.({ breathPhase })
        }
      />
      
      {/* Awareness Level Controls */}
      <AwarenessLevelControls
        consciousness={consciousness}
        layout={interfaceLayout}
        screenDimensions={screenDimensions}
        onAwarenessChange={(awarenessLevel) => 
          onConsciousnessChange?.({ awarenessLevel })
        }
      />
      
      {/* Mobile-Specific Quick Actions */}
      {screenDimensions.deviceType === 'mobile' && (
        <MobileQuickActions
          consciousness={consciousness}
          layout={interfaceLayout}
          screenDimensions={screenDimensions}
          onConsciousnessChange={onConsciousnessChange}
        />
      )}
      
      {/* Orientation-Aware Navigation */}
      <OrientationAwareNavigation
        consciousness={consciousness}
        layout={interfaceLayout}
        screenDimensions={screenDimensions}
      />
    </group>
  );
};

/**
 * Consciousness Level Display Component
 */
const ConsciousnessLevelDisplay: React.FC<{
  consciousness: ConsciousnessState;
  layout: InterfaceLayout;
  screenDimensions: ScreenDimensions;
}> = ({ consciousness, layout, screenDimensions }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Pulsing based on consciousness level
      const pulse = Math.sin(time * 2) * consciousness.awarenessLevel * 0.1 + 1;
      groupRef.current.scale.setScalar(pulse * layout.componentSize);
      
      // Color shifting based on awareness
      const hue = consciousness.awarenessLevel * 0.8;
      groupRef.current.children.forEach(child => {
        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.color) {
            material.color.setHSL(hue, 0.8, 0.6);
          }
        }
      });
    }
  });
  
  const displayPosition = screenDimensions.orientation === 'portrait' 
    ? new Vector3(0, 2, 0) 
    : new Vector3(-3, 1, 0);
  
  return (
    <group ref={groupRef} position={displayPosition}>
      {/* Main consciousness ring */}
      <mesh>
        <ringGeometry args={[0.8, 1.0, 32, 1, 0, consciousness.awarenessLevel * Math.PI * 2]} />
        <meshBasicMaterial
          color={0x00ffff}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Level indicators */}
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 1.2;
        const active = i < consciousness.awarenessLevel * 10;
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color={active ? 0xffffff : 0x333333}
              transparent
              opacity={active ? 0.9 : 0.3}
            />
          </mesh>
        );
      })}
      
      {/* Center consciousness indicator */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={consciousness.awarenessLevel}
          emissive={0xffffff}
          emissiveIntensity={consciousness.awarenessLevel * 0.5}
        />
      </mesh>
    </group>
  );
};

/**
 * Breath Sync Interface Component
 */
const BreathSyncInterface: React.FC<{
  consciousness: ConsciousnessState;
  layout: InterfaceLayout;
  screenDimensions: ScreenDimensions;
  onBreathChange: (breathPhase: number) => void;
}> = ({ consciousness, layout, screenDimensions, onBreathChange }) => {
  const groupRef = useRef<Group>(null);
  const [breathPhase, setBreathPhase] = useState(0);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Auto breath cycle
      const newBreathPhase = (breathPhase + delta * 0.2) % 1;
      setBreathPhase(newBreathPhase);
      onBreathChange(newBreathPhase);
      
      // Visual breath feedback
      const breathScale = 1 + Math.sin(newBreathPhase * Math.PI * 2) * 0.3;
      groupRef.current.scale.setScalar(breathScale * layout.componentSize);
    }
  });
  
  const breathPosition = screenDimensions.orientation === 'portrait'
    ? new Vector3(0, 0, 0)
    : new Vector3(0, 1, 0);
  
  return (
    <group ref={groupRef} position={breathPosition}>
      {/* Breath visualization circle */}
      <mesh>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial
          color={0x00ff00}
          transparent
          opacity={0.3 + Math.sin(breathPhase * Math.PI * 2) * 0.2}
        />
      </mesh>
      
      {/* Breath guide ring */}
      <mesh>
        <ringGeometry args={[0.7, 0.8, 32]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Breath phase indicator */}
      <mesh position={[
        Math.cos(breathPhase * Math.PI * 2) * 0.75,
        Math.sin(breathPhase * Math.PI * 2) * 0.75,
        0.1
      ]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial
          color={0xffd700}
          emissive={0xffd700}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

/**
 * Awareness Level Controls Component
 */
const AwarenessLevelControls: React.FC<{
  consciousness: ConsciousnessState;
  layout: InterfaceLayout;
  screenDimensions: ScreenDimensions;
  onAwarenessChange: (level: number) => void;
}> = ({ consciousness, layout, screenDimensions, onAwarenessChange }) => {
  const groupRef = useRef<Group>(null);
  
  const controlPosition = screenDimensions.orientation === 'portrait'
    ? new Vector3(0, -2, 0)
    : new Vector3(3, 0, 0);
  
  return (
    <group ref={groupRef} position={controlPosition}>
      {/* Awareness slider visualization */}
      <mesh>
        <boxGeometry args={[2, 0.1, 0.05]} />
        <meshBasicMaterial
          color={0x666666}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Current level indicator */}
      <mesh position={[
        (consciousness.awarenessLevel - 0.5) * 2,
        0,
        0.1
      ]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Level markers */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          position={[(i - 2) * 0.5, -0.3, 0]}
        >
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshBasicMaterial
            color={i <= consciousness.awarenessLevel * 4 ? 0xffffff : 0x333333}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Mobile Quick Actions Component
 */
const MobileQuickActions: React.FC<{
  consciousness: ConsciousnessState;
  layout: InterfaceLayout;
  screenDimensions: ScreenDimensions;
  onConsciousnessChange?: (newState: Partial<ConsciousnessState>) => void;
}> = ({ consciousness, layout, screenDimensions, onConsciousnessChange }) => {
  const groupRef = useRef<Group>(null);
  
  const actionPosition = screenDimensions.orientation === 'portrait'
    ? new Vector3(1.5, 0, 0)
    : new Vector3(0, -2, 0);
  
  const quickActions = [
    { name: 'Reset', color: 0xff6b6b, action: () => onConsciousnessChange?.({ awarenessLevel: 0.5 }) },
    { name: 'Boost', color: 0x00ff00, action: () => onConsciousnessChange?.({ awarenessLevel: Math.min(1, consciousness.awarenessLevel + 0.1) }) },
    { name: 'Calm', color: 0x4ecdc4, action: () => onConsciousnessChange?.({ awarenessLevel: Math.max(0, consciousness.awarenessLevel - 0.1) }) },
  ];
  
  return (
    <group ref={groupRef} position={actionPosition}>
      {quickActions.map((action, index) => (
        <mesh
          key={action.name}
          position={[0, (index - 1) * 0.8, 0]}
        >
          <circleGeometry args={[0.2, 16]} />
          <meshBasicMaterial
            color={action.color}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Orientation-Aware Navigation Component
 */
const OrientationAwareNavigation: React.FC<{
  consciousness: ConsciousnessState;
  layout: InterfaceLayout;
  screenDimensions: ScreenDimensions;
}> = ({ consciousness, layout, screenDimensions }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Rotate navigation based on orientation
      const rotationSpeed = screenDimensions.orientation === 'portrait' ? 0.5 : 1.0;
      groupRef.current.rotation.z = time * rotationSpeed * consciousness.awarenessLevel;
    }
  });
  
  const navPosition = screenDimensions.orientation === 'portrait'
    ? new Vector3(-1.5, 0, 0)
    : new Vector3(0, 2, 0);
  
  return (
    <group ref={groupRef} position={navPosition}>
      {/* Compass rose for navigation */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.8;
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0
            ]}
          >
            <boxGeometry args={[0.05, 0.2, 0.02]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? 0xffffff : 0x666666}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
      
      {/* Center navigation indicator */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial
          color={0xffd700}
          emissive={0xffd700}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

export default ResponsiveConsciousnessInterface;
