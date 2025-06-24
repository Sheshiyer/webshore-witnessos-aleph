/**
 * Touch-First Interaction System for WitnessOS Webshore
 * 
 * Intuitive touch controls for 3D navigation and consciousness interaction
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Group, Vector2, Vector3, Euler, Quaternion } from 'three';

interface TouchFirstInteractionProps {
  consciousness: ConsciousnessState;
  onConsciousnessInteraction?: (type: string, intensity: number) => void;
  onNavigationChange?: (position: Vector3, rotation: Euler) => void;
  enabled?: boolean;
  sensitivity?: number;
}

interface TouchPoint {
  id: number;
  startPosition: Vector2;
  currentPosition: Vector2;
  startTime: number;
  velocity: Vector2;
  pressure: number;
}

interface GestureState {
  type: 'none' | 'pan' | 'pinch' | 'rotate' | 'consciousness-touch';
  startDistance?: number;
  startRotation?: number;
  intensity: number;
}

interface NavigationState {
  position: Vector3;
  rotation: Euler;
  zoom: number;
  momentum: Vector3;
  rotationMomentum: Euler;
}

/**
 * Touch-First Interaction Component
 */
export const TouchFirstInteraction: React.FC<TouchFirstInteractionProps> = ({
  consciousness,
  onConsciousnessInteraction,
  onNavigationChange,
  enabled = true,
  sensitivity = 1.0,
}) => {
  const { camera, size, gl } = useThree();
  const groupRef = useRef<Group>(null);
  
  // Touch tracking state
  const [activeTouches, setActiveTouches] = useState<Map<number, TouchPoint>>(new Map());
  const [gestureState, setGestureState] = useState<GestureState>({ type: 'none', intensity: 0 });
  const [navigationState, setNavigationState] = useState<NavigationState>({
    position: new Vector3(0, 0, 5),
    rotation: new Euler(0, 0, 0),
    zoom: 1,
    momentum: new Vector3(0, 0, 0),
    rotationMomentum: new Euler(0, 0, 0),
  });
  
  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
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
        startPosition: position.clone(),
        currentPosition: position.clone(),
        startTime: Date.now(),
        velocity: new Vector2(0, 0),
        pressure: (touch as any).force || 1.0,
      });
    }
    
    setActiveTouches(newTouches);
    
    // Determine gesture type
    if (newTouches.size === 1) {
      setGestureState({ type: 'pan', intensity: 0 });
    } else if (newTouches.size === 2) {
      const touches = Array.from(newTouches.values());
      const distance = touches[0].currentPosition.distanceTo(touches[1].currentPosition);
      const angle = Math.atan2(
        touches[1].currentPosition.y - touches[0].currentPosition.y,
        touches[1].currentPosition.x - touches[0].currentPosition.x
      );
      
      setGestureState({
        type: 'pinch',
        startDistance: distance,
        startRotation: angle,
        intensity: 0,
      });
    } else if (newTouches.size >= 3) {
      setGestureState({ type: 'consciousness-touch', intensity: consciousness.awarenessLevel });
    }
  }, [enabled, activeTouches, size, consciousness.awarenessLevel]);
  
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    
    event.preventDefault();
    const newTouches = new Map(activeTouches);
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (!touch) continue;
      
      const touchPoint = newTouches.get(touch.identifier);
      if (!touchPoint) continue;
      
      const newPosition = new Vector2(
        (touch.clientX / size.width) * 2 - 1,
        -(touch.clientY / size.height) * 2 + 1
      );
      
      // Calculate velocity
      const deltaTime = (Date.now() - touchPoint.startTime) / 1000;
      const velocity = newPosition.clone().sub(touchPoint.currentPosition).divideScalar(deltaTime);
      
      touchPoint.currentPosition = newPosition;
      touchPoint.velocity = velocity;
      touchPoint.pressure = (touch as any).force || 1.0;
    }
    
    setActiveTouches(newTouches);
    
    // Process gestures
    processGestures(newTouches);
  }, [enabled, activeTouches, size]);
  
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    
    event.preventDefault();
    const newTouches = new Map(activeTouches);
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (!touch) continue;
      
      const touchPoint = newTouches.get(touch.identifier);
      if (touchPoint) {
        // Apply momentum based on final velocity
        const momentum = touchPoint.velocity.clone().multiplyScalar(0.1);
        setNavigationState(prev => ({
          ...prev,
          momentum: new Vector3(momentum.x, momentum.y, 0),
        }));
      }
      
      newTouches.delete(touch.identifier);
    }
    
    setActiveTouches(newTouches);
    
    // Reset gesture state if no touches remain
    if (newTouches.size === 0) {
      setGestureState({ type: 'none', intensity: 0 });
    }
  }, [enabled, activeTouches]);
  
  // Process different gesture types
  const processGestures = (touches: Map<number, TouchPoint>) => {
    const touchArray = Array.from(touches.values());
    
    switch (gestureState.type) {
      case 'pan':
        if (touchArray.length === 1) {
          const touch = touchArray[0];
          const delta = touch.currentPosition.clone().sub(touch.startPosition);
          
          // Apply consciousness-responsive sensitivity
          const responsiveness = 1 + consciousness.awarenessLevel * 2;
          const panSensitivity = sensitivity * responsiveness;
          
          // Update camera position
          setNavigationState(prev => ({
            ...prev,
            rotation: new Euler(
              prev.rotation.x - delta.y * panSensitivity * 0.01,
              prev.rotation.y - delta.x * panSensitivity * 0.01,
              prev.rotation.z
            ),
          }));
          
          // Consciousness interaction based on pressure
          const intensity = touch.pressure * consciousness.awarenessLevel;
          onConsciousnessInteraction?.('touch-navigation', intensity);
        }
        break;
        
      case 'pinch':
        if (touchArray.length === 2 && gestureState.startDistance) {
          const currentDistance = touchArray[0].currentPosition.distanceTo(touchArray[1].currentPosition);
          const scale = currentDistance / gestureState.startDistance;
          
          // Zoom with consciousness-responsive limits
          const maxZoom = 1 + consciousness.awarenessLevel * 3;
          const minZoom = 0.1;
          const newZoom = Math.max(minZoom, Math.min(maxZoom, navigationState.zoom * scale));
          
          setNavigationState(prev => ({
            ...prev,
            zoom: newZoom,
          }));
          
          // Rotation gesture
          if (gestureState.startRotation !== undefined) {
            const currentAngle = Math.atan2(
              touchArray[1].currentPosition.y - touchArray[0].currentPosition.y,
              touchArray[1].currentPosition.x - touchArray[0].currentPosition.x
            );
            const rotationDelta = currentAngle - gestureState.startRotation;
            
            setNavigationState(prev => ({
              ...prev,
              rotation: new Euler(
                prev.rotation.x,
                prev.rotation.y,
                prev.rotation.z + rotationDelta * sensitivity * 0.5
              ),
            }));
          }
          
          onConsciousnessInteraction?.('pinch-zoom', scale - 1);
        }
        break;
        
      case 'consciousness-touch':
        // Multi-touch consciousness interaction
        const avgPressure = touchArray.reduce((sum, touch) => sum + touch.pressure, 0) / touchArray.length;
        const intensity = avgPressure * consciousness.awarenessLevel * touchArray.length;
        
        onConsciousnessInteraction?.('consciousness-field', intensity);
        
        // Create consciousness field effect
        setGestureState(prev => ({ ...prev, intensity }));
        break;
    }
  };
  
  // Apply navigation state to camera
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Apply momentum
    if (navigationState.momentum.length() > 0.001) {
      setNavigationState(prev => ({
        ...prev,
        position: prev.position.clone().add(prev.momentum.clone().multiplyScalar(delta)),
        momentum: prev.momentum.clone().multiplyScalar(0.95), // Damping
      }));
    }
    
    // Apply rotation momentum
    if (navigationState.rotationMomentum.x !== 0 || navigationState.rotationMomentum.y !== 0) {
      setNavigationState(prev => ({
        ...prev,
        rotation: new Euler(
          prev.rotation.x + prev.rotationMomentum.x * delta,
          prev.rotation.y + prev.rotationMomentum.y * delta,
          prev.rotation.z + prev.rotationMomentum.z * delta
        ),
        rotationMomentum: new Euler(
          prev.rotationMomentum.x * 0.95,
          prev.rotationMomentum.y * 0.95,
          prev.rotationMomentum.z * 0.95
        ),
      }));
    }
    
    // Update camera
    camera.position.copy(navigationState.position);
    camera.rotation.copy(navigationState.rotation);
    camera.zoom = navigationState.zoom;
    camera.updateProjectionMatrix();
    
    // Notify parent of navigation changes
    onNavigationChange?.(navigationState.position, navigationState.rotation);
  });
  
  // Set up touch event listeners
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
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, gl.domElement]);
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef}>
      {/* Touch feedback visualization */}
      {Array.from(activeTouches.values()).map(touch => (
        <TouchFeedbackVisualization
          key={touch.id}
          touch={touch}
          gestureType={gestureState.type}
          consciousness={consciousness}
        />
      ))}
      
      {/* Consciousness field visualization for multi-touch */}
      {gestureState.type === 'consciousness-touch' && (
        <ConsciousnessFieldVisualization
          intensity={gestureState.intensity}
          touchCount={activeTouches.size}
          consciousness={consciousness}
        />
      )}
      
      {/* Navigation aids */}
      <NavigationAids
        navigationState={navigationState}
        consciousness={consciousness}
      />
    </group>
  );
};

/**
 * Touch Feedback Visualization Component
 */
const TouchFeedbackVisualization: React.FC<{
  touch: TouchPoint;
  gestureType: string;
  consciousness: ConsciousnessState;
}> = ({ touch, gestureType, consciousness }) => {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Position at touch location
      meshRef.current.position.set(
        touch.currentPosition.x * 5,
        touch.currentPosition.y * 5,
        1
      );
      
      // Scale based on pressure and consciousness
      const scale = touch.pressure * (1 + consciousness.awarenessLevel) * 0.5;
      meshRef.current.scale.setScalar(scale);
      
      // Color based on gesture type
      const color = gestureType === 'consciousness-touch' ? 0xffffff :
                   gestureType === 'pinch' ? 0x00ffff :
                   gestureType === 'pan' ? 0xff6b6b : 0xcccccc;
      
      meshRef.current.material.color.setHex(color);
      
      // Pulsing effect
      const pulse = Math.sin(time * 10) * 0.1 + 1;
      meshRef.current.material.opacity = touch.pressure * pulse * 0.8;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <circleGeometry args={[0.2, 16]} />
      <meshBasicMaterial
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

/**
 * Consciousness Field Visualization Component
 */
const ConsciousnessFieldVisualization: React.FC<{
  intensity: number;
  touchCount: number;
  consciousness: ConsciousnessState;
}> = ({ intensity, touchCount, consciousness }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Scale based on intensity and touch count
      const scale = 1 + intensity * touchCount * 0.5;
      groupRef.current.scale.setScalar(scale);
      
      // Rotation based on consciousness level
      groupRef.current.rotation.z = time * consciousness.awarenessLevel;
      
      // Pulsing opacity
      const pulse = Math.sin(time * 5) * 0.3 + 0.7;
      groupRef.current.children.forEach(child => {
        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.opacity !== undefined) {
            material.opacity = pulse * intensity;
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      <mesh>
        <ringGeometry args={[2, 3, 32]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Inner consciousness rings */}
      {Array.from({ length: touchCount }, (_, i) => (
        <mesh key={i} position={[0, 0, i * 0.1]}>
          <ringGeometry args={[1 + i * 0.5, 1.2 + i * 0.5, 16]} />
          <meshBasicMaterial
            color={0x00ffff}
            transparent
            opacity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Navigation Aids Component
 */
const NavigationAids: React.FC<{
  navigationState: NavigationState;
  consciousness: ConsciousnessState;
}> = ({ navigationState, consciousness }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      // Position aids based on navigation state
      groupRef.current.position.copy(navigationState.position);
      groupRef.current.rotation.copy(navigationState.rotation);
      
      // Visibility based on consciousness level
      const opacity = consciousness.awarenessLevel * 0.5;
      groupRef.current.children.forEach(child => {
        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.opacity !== undefined) {
            material.opacity = opacity;
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {/* Zoom indicator */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[0.5, 0.6, 16]} />
        <meshBasicMaterial
          color={0xffd700}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Momentum indicators */}
      {navigationState.momentum.length() > 0.01 && (
        <mesh position={[navigationState.momentum.x * 10, navigationState.momentum.y * 10, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color={0x00ff00}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
};

export default TouchFirstInteraction;
