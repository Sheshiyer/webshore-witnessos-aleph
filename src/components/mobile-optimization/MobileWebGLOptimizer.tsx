/**
 * Mobile WebGL Optimizer for WitnessOS Webshore
 * 
 * Aggressive LOD system, device capability detection, and adaptive quality settings
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Group, LOD, Mesh, BufferGeometry } from 'three';

interface MobileWebGLOptimizerProps {
  consciousness: ConsciousnessState;
  enabled?: boolean;
  targetFPS?: number;
  children?: React.ReactNode;
}

interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  maxTextureSize: number;
  maxVertices: number;
  supportsFloatTextures: boolean;
  memoryLimit: number;
  gpuTier: 'low' | 'medium' | 'high';
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  quality: number;
}

interface QualitySettings {
  particleCount: number;
  geometryDetail: number;
  textureResolution: number;
  shadowQuality: number;
  effectsIntensity: number;
  renderDistance: number;
}

/**
 * Mobile WebGL Optimizer Component
 */
export const MobileWebGLOptimizer: React.FC<MobileWebGLOptimizerProps> = ({
  consciousness,
  enabled = true,
  targetFPS = 30,
  children,
}) => {
  const { gl, camera, scene } = useThree();
  const groupRef = useRef<Group>(null);
  
  // State management
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
    quality: 1.0,
  });
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>({
    particleCount: 1000,
    geometryDetail: 1.0,
    textureResolution: 1.0,
    shadowQuality: 1.0,
    effectsIntensity: 1.0,
    renderDistance: 100,
  });
  
  // Performance tracking
  const frameTimeHistory = useRef<number[]>([]);
  const lastFrameTime = useRef(performance.now());
  
  // Device capability detection
  useEffect(() => {
    const detectDeviceCapabilities = (): DeviceCapabilities => {
      const canvas = gl.domElement;
      const context = gl.getContext();
      
      // Basic device detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(navigator.userAgent);
      
      // WebGL capabilities
      const maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
      const maxVertexAttribs = context.getParameter(context.MAX_VERTEX_ATTRIBS);
      const floatTextureExt = context.getExtension('OES_texture_float');
      
      // Memory estimation
      const memoryInfo = (performance as any).memory;
      const estimatedMemory = memoryInfo ? memoryInfo.totalJSHeapSize : 100 * 1024 * 1024; // 100MB fallback
      
      // GPU tier estimation
      const renderer = context.getParameter(context.RENDERER);
      let gpuTier: 'low' | 'medium' | 'high' = 'medium';
      
      if (renderer.includes('Adreno') && (renderer.includes('3') || renderer.includes('4'))) {
        gpuTier = 'low';
      } else if (renderer.includes('Mali') || renderer.includes('PowerVR')) {
        gpuTier = 'low';
      } else if (renderer.includes('GeForce') || renderer.includes('Radeon')) {
        gpuTier = 'high';
      }
      
      // Low-end device detection
      const isLowEnd = isMobile && (
        maxTextureSize < 2048 ||
        maxVertexAttribs < 16 ||
        estimatedMemory < 200 * 1024 * 1024 ||
        gpuTier === 'low'
      );
      
      return {
        isMobile,
        isTablet,
        isLowEnd,
        maxTextureSize,
        maxVertices: maxVertexAttribs * 1000, // Rough estimation
        supportsFloatTextures: !!floatTextureExt,
        memoryLimit: estimatedMemory,
        gpuTier,
      };
    };
    
    setDeviceCapabilities(detectDeviceCapabilities());
  }, [gl]);
  
  // Adaptive quality settings based on device capabilities
  const adaptiveQualitySettings = useMemo(() => {
    if (!deviceCapabilities) return qualitySettings;
    
    const baseSettings = { ...qualitySettings };
    
    if (deviceCapabilities.isLowEnd) {
      return {
        particleCount: Math.floor(baseSettings.particleCount * 0.3),
        geometryDetail: 0.5,
        textureResolution: 0.5,
        shadowQuality: 0.3,
        effectsIntensity: 0.6,
        renderDistance: 50,
      };
    } else if (deviceCapabilities.isMobile) {
      return {
        particleCount: Math.floor(baseSettings.particleCount * 0.6),
        geometryDetail: 0.7,
        textureResolution: 0.7,
        shadowQuality: 0.6,
        effectsIntensity: 0.8,
        renderDistance: 75,
      };
    } else if (deviceCapabilities.gpuTier === 'high') {
      return {
        particleCount: Math.floor(baseSettings.particleCount * 1.5),
        geometryDetail: 1.2,
        textureResolution: 1.2,
        shadowQuality: 1.2,
        effectsIntensity: 1.2,
        renderDistance: 150,
      };
    }
    
    return baseSettings;
  }, [deviceCapabilities, qualitySettings]);
  
  // Performance monitoring and adaptive quality adjustment
  useFrame((state) => {
    if (!enabled || !deviceCapabilities) return;
    
    const currentTime = performance.now();
    const frameTime = currentTime - lastFrameTime.current;
    lastFrameTime.current = currentTime;
    
    // Update frame time history
    frameTimeHistory.current.push(frameTime);
    if (frameTimeHistory.current.length > 60) {
      frameTimeHistory.current.shift();
    }
    
    // Calculate average FPS
    const avgFrameTime = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length;
    const fps = 1000 / avgFrameTime;
    
    // Update performance metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      fps,
      frameTime: avgFrameTime,
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
    }));
    
    // Adaptive quality adjustment
    if (frameTimeHistory.current.length >= 30) {
      const targetFrameTime = 1000 / targetFPS;
      
      if (avgFrameTime > targetFrameTime * 1.2) {
        // Performance is poor, reduce quality
        setQualitySettings(prev => ({
          particleCount: Math.max(100, Math.floor(prev.particleCount * 0.9)),
          geometryDetail: Math.max(0.3, prev.geometryDetail * 0.95),
          textureResolution: Math.max(0.3, prev.textureResolution * 0.95),
          shadowQuality: Math.max(0.2, prev.shadowQuality * 0.9),
          effectsIntensity: Math.max(0.3, prev.effectsIntensity * 0.95),
          renderDistance: Math.max(30, prev.renderDistance * 0.95),
        }));
      } else if (avgFrameTime < targetFrameTime * 0.8 && fps > targetFPS * 1.2) {
        // Performance is good, can increase quality
        setQualitySettings(prev => ({
          particleCount: Math.min(2000, Math.floor(prev.particleCount * 1.05)),
          geometryDetail: Math.min(1.5, prev.geometryDetail * 1.02),
          textureResolution: Math.min(1.5, prev.textureResolution * 1.02),
          shadowQuality: Math.min(1.5, prev.shadowQuality * 1.05),
          effectsIntensity: Math.min(1.5, prev.effectsIntensity * 1.02),
          renderDistance: Math.min(200, prev.renderDistance * 1.02),
        }));
      }
    }
  });
  
  // LOD system for geometry optimization
  const createLODGeometry = (baseGeometry: BufferGeometry, lodLevel: number) => {
    // Simplified LOD implementation
    const positions = baseGeometry.attributes.position.array;
    const indices = baseGeometry.index?.array;
    
    if (!indices) return baseGeometry;
    
    // Reduce triangle count based on LOD level
    const reductionFactor = Math.pow(0.5, lodLevel);
    const targetTriangles = Math.floor(indices.length / 3 * reductionFactor);
    
    // Simple decimation (in real implementation, use proper mesh decimation)
    const newIndices = [];
    const step = Math.max(1, Math.floor(indices.length / 3 / targetTriangles));
    
    for (let i = 0; i < indices.length; i += step * 3) {
      if (i + 2 < indices.length) {
        newIndices.push(indices[i], indices[i + 1], indices[i + 2]);
      }
    }
    
    const newGeometry = baseGeometry.clone();
    newGeometry.setIndex(newIndices);
    
    return newGeometry;
  };
  
  if (!enabled) return <>{children}</>;
  
  return (
    <group ref={groupRef}>
      {children}
      
      {/* Performance Monitor Display */}
      <PerformanceMonitor
        metrics={performanceMetrics}
        deviceCapabilities={deviceCapabilities}
        qualitySettings={adaptiveQualitySettings}
        consciousness={consciousness}
      />
      
      {/* Quality Settings Visualizer */}
      <QualitySettingsVisualizer
        settings={adaptiveQualitySettings}
        consciousness={consciousness}
      />
    </group>
  );
};

/**
 * Performance Monitor Display Component
 */
const PerformanceMonitor: React.FC<{
  metrics: PerformanceMetrics;
  deviceCapabilities: DeviceCapabilities | null;
  qualitySettings: QualitySettings;
  consciousness: ConsciousnessState;
}> = ({ metrics, deviceCapabilities, qualitySettings, consciousness }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      // Position based on consciousness level
      groupRef.current.position.y = 4 + consciousness.awarenessLevel * 2;
      
      // Opacity based on performance
      const opacity = metrics.fps < 30 ? 0.8 : 0.3;
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
    <group ref={groupRef} position={[5, 4, 0]}>
      {/* FPS Display */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial
          color={metrics.fps > 45 ? 0x00ff00 : metrics.fps > 25 ? 0xffff00 : 0xff0000}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Quality Indicator */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[qualitySettings.geometryDetail * 0.5, 0.2, 0.1]} />
        <meshBasicMaterial
          color={0x00ffff}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Device Capability Indicator */}
      {deviceCapabilities && (
        <mesh position={[0, -1.6, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color={
              deviceCapabilities.gpuTier === 'high' ? 0x00ff00 :
              deviceCapabilities.gpuTier === 'medium' ? 0xffff00 : 0xff0000
            }
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * Quality Settings Visualizer Component
 */
const QualitySettingsVisualizer: React.FC<{
  settings: QualitySettings;
  consciousness: ConsciousnessState;
}> = ({ settings, consciousness }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Rotate based on quality level
      groupRef.current.rotation.y = time * settings.geometryDetail * 0.5;
      
      // Scale based on effects intensity
      const scale = 0.5 + settings.effectsIntensity * 0.5;
      groupRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <group ref={groupRef} position={[-5, 2, 0]}>
      {/* Particle count visualization */}
      {Array.from({ length: Math.min(20, Math.floor(settings.particleCount / 50)) }, (_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial
            color={0x00ffff}
            transparent
            opacity={settings.effectsIntensity}
          />
        </mesh>
      ))}
      
      {/* Quality ring */}
      <mesh>
        <ringGeometry args={[0.8, 1.0, 16]} />
        <meshBasicMaterial
          color={0xffd700}
          transparent
          opacity={settings.geometryDetail}
        />
      </mesh>
    </group>
  );
};

export default MobileWebGLOptimizer;
