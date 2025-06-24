/**
 * Mobile Optimization Components for WitnessOS Webshore
 * 
 * Phase 7 - Mobile WebGL optimization, touch-first interactions, and responsive design
 */

// Mobile WebGL Optimizer
export { default as MobileWebGLOptimizer } from './MobileWebGLOptimizer';

// Touch-First Interaction System
export { default as TouchFirstInteraction } from './TouchFirstInteraction';

// Responsive Consciousness Interface
export { default as ResponsiveConsciousnessInterface } from './ResponsiveConsciousnessInterface';

// Type definitions for mobile optimization
export interface MobileOptimizationConfig {
  webglOptimization: {
    enabled: boolean;
    targetFPS: number;
    aggressiveLOD: boolean;
    adaptiveQuality: boolean;
    memoryManagement: boolean;
  };
  touchInteraction: {
    enabled: boolean;
    sensitivity: number;
    gestureRecognition: boolean;
    hapticFeedback: boolean;
    consciousnessTouch: boolean;
  };
  responsiveInterface: {
    enabled: boolean;
    adaptiveLayout: boolean;
    orientationAware: boolean;
    mobileQuickActions: boolean;
    accessibilityFeatures: boolean;
  };
}

export const DEFAULT_MOBILE_CONFIG: MobileOptimizationConfig = {
  webglOptimization: {
    enabled: true,
    targetFPS: 30,
    aggressiveLOD: true,
    adaptiveQuality: true,
    memoryManagement: true,
  },
  touchInteraction: {
    enabled: true,
    sensitivity: 1.0,
    gestureRecognition: true,
    hapticFeedback: true,
    consciousnessTouch: true,
  },
  responsiveInterface: {
    enabled: true,
    adaptiveLayout: true,
    orientationAware: true,
    mobileQuickActions: true,
    accessibilityFeatures: true,
  },
};

// Device capability types
export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  maxTextureSize: number;
  maxVertices: number;
  supportsFloatTextures: boolean;
  memoryLimit: number;
  gpuTier: 'low' | 'medium' | 'high';
}

// Performance metrics
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  quality: number;
}

// Quality settings for adaptive rendering
export interface QualitySettings {
  particleCount: number;
  geometryDetail: number;
  textureResolution: number;
  shadowQuality: number;
  effectsIntensity: number;
  renderDistance: number;
}

// Touch gesture types
export type TouchGestureType = 
  | 'none' 
  | 'pan' 
  | 'pinch' 
  | 'rotate' 
  | 'consciousness-touch';

// Screen dimensions and orientation
export interface ScreenDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

// Interface layout configuration
export interface InterfaceLayout {
  scale: number;
  position: { x: number; y: number; z: number };
  spacing: number;
  componentSize: number;
  textScale: number;
}

// Mobile optimization metadata
export const MOBILE_OPTIMIZATION_METADATA = {
  webglOptimizer: {
    name: 'Mobile WebGL Optimizer',
    description: 'Aggressive LOD system and adaptive quality settings for mobile devices',
    features: [
      'Device capability detection',
      'Adaptive quality adjustment',
      'Performance monitoring',
      'Memory management',
      'GPU tier optimization',
    ],
  },
  touchInteraction: {
    name: 'Touch-First Interaction',
    description: 'Intuitive touch controls for 3D navigation and consciousness interaction',
    features: [
      'Multi-touch gesture recognition',
      'Consciousness-responsive touch feedback',
      'Momentum-based navigation',
      'Pressure-sensitive interactions',
      'Touch trail visualization',
    ],
  },
  responsiveInterface: {
    name: 'Responsive Consciousness Interface',
    description: 'Mobile-first consciousness interface with adaptive layouts',
    features: [
      'Orientation-aware design',
      'Device-specific layouts',
      'Adaptive component scaling',
      'Mobile quick actions',
      'Accessibility features',
    ],
  },
};

// Utility functions
export const detectDeviceCapabilities = (gl: WebGLRenderingContext): DeviceCapabilities => {
  const context = gl;
  
  // Basic device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(navigator.userAgent);
  
  // WebGL capabilities
  const maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
  const maxVertexAttribs = context.getParameter(context.MAX_VERTEX_ATTRIBS);
  const floatTextureExt = context.getExtension('OES_texture_float');
  
  // Memory estimation
  const memoryInfo = (performance as any).memory;
  const estimatedMemory = memoryInfo ? memoryInfo.totalJSHeapSize : 100 * 1024 * 1024;
  
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
    maxVertices: maxVertexAttribs * 1000,
    supportsFloatTextures: !!floatTextureExt,
    memoryLimit: estimatedMemory,
    gpuTier,
  };
};

export const getOptimalQualitySettings = (capabilities: DeviceCapabilities): QualitySettings => {
  const baseSettings: QualitySettings = {
    particleCount: 1000,
    geometryDetail: 1.0,
    textureResolution: 1.0,
    shadowQuality: 1.0,
    effectsIntensity: 1.0,
    renderDistance: 100,
  };
  
  if (capabilities.isLowEnd) {
    return {
      particleCount: Math.floor(baseSettings.particleCount * 0.3),
      geometryDetail: 0.5,
      textureResolution: 0.5,
      shadowQuality: 0.3,
      effectsIntensity: 0.6,
      renderDistance: 50,
    };
  } else if (capabilities.isMobile) {
    return {
      particleCount: Math.floor(baseSettings.particleCount * 0.6),
      geometryDetail: 0.7,
      textureResolution: 0.7,
      shadowQuality: 0.6,
      effectsIntensity: 0.8,
      renderDistance: 75,
    };
  } else if (capabilities.gpuTier === 'high') {
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
};

export const getResponsiveLayout = (screenDimensions: ScreenDimensions): InterfaceLayout => {
  const { deviceType, orientation, aspectRatio } = screenDimensions;
  
  let scale = 1;
  let spacing = 1;
  let componentSize = 1;
  let textScale = 1;
  let position = { x: 0, y: 0, z: 0 };
  
  switch (deviceType) {
    case 'mobile':
      scale = orientation === 'portrait' ? 0.6 : 0.8;
      spacing = 0.8;
      componentSize = 0.7;
      textScale = 0.8;
      position = orientation === 'portrait' 
        ? { x: 0, y: -2, z: 0 } 
        : { x: 2, y: 0, z: 0 };
      break;
      
    case 'tablet':
      scale = 0.9;
      spacing = 1.0;
      componentSize = 0.9;
      textScale = 0.9;
      position = { x: 0, y: -1, z: 0 };
      break;
      
    case 'desktop':
      scale = 1.2;
      spacing = 1.2;
      componentSize = 1.0;
      textScale = 1.0;
      position = { x: 0, y: 0, z: 0 };
      break;
  }
  
  // Adjust for extreme aspect ratios
  if (aspectRatio > 2) {
    scale *= 0.8;
    position.x += 3;
  } else if (aspectRatio < 0.6) {
    scale *= 0.7;
    position.y -= 1;
  }
  
  return { scale, position, spacing, componentSize, textScale };
};

export const createMobileOptimizationSystem = (config: Partial<MobileOptimizationConfig> = {}) => {
  return {
    ...DEFAULT_MOBILE_CONFIG,
    ...config,
  };
};
