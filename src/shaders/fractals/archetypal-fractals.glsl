/**
 * Archetypal Fractal Shaders for WitnessOS Webshore
 * 
 * Nishitsuji-inspired 267-character optimized fractals for consciousness visualization
 * Human Design and Enneagram archetypal patterns with wave interference
 */

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader - Archetypal Fractals
const fragmentShader = `
  uniform float time;
  uniform float consciousness;
  uniform float breathPhase;
  uniform float coherence;
  uniform vec2 resolution;
  uniform vec3 archetypalColor;
  uniform int fractalType; // 0=mandelbrot, 1=julia, 2=dragon, 3=sierpinski
  uniform int humanDesignType; // 0=manifestor, 1=generator, 2=mg, 3=projector, 4=reflector
  uniform int enneagramType; // 1-9
  uniform float awarenessAmplification;
  uniform float waveFrequency;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Constants
  const float PI = 3.14159265359;
  const float TAU = 6.28318530718;
  const float PHI = 1.618033988749;
  const float PHI_INV = 0.618033988749;
  
  // Nishitsuji's minimal noise function (optimized)
  float noise(vec3 p) {
    vec3 s = vec3(1.0, 2.0, 3.0) * consciousness;
    return abs(dot(sin(p.yzx * s), cos(p.xzz * s))) / length(s) * 0.6;
  }
  
  // Mandelbrot fractal with consciousness modulation
  float mandelbrot(vec2 c, float maxIter) {
    vec2 z = vec2(0.0);
    float iterations = 0.0;
    
    for (float i = 0.0; i < 64.0; i++) {
      if (i >= maxIter) break;
      if (length(z) > 2.0) break;
      
      z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      iterations += 1.0;
    }
    
    return iterations / maxIter;
  }
  
  // Julia set with archetypal constants
  float julia(vec2 z, vec2 c, float maxIter) {
    float iterations = 0.0;
    
    for (float i = 0.0; i < 64.0; i++) {
      if (i >= maxIter) break;
      if (length(z) > 2.0) break;
      
      z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      iterations += 1.0;
    }
    
    return iterations / maxIter;
  }
  
  // Dragon curve fractal
  float dragon(vec2 uv, float scale, int depth) {
    vec2 p = uv * scale;
    float result = 0.0;
    float amplitude = 1.0;
    
    for (int i = 0; i < 8; i++) {
      if (i >= depth) break;
      
      float angle = atan(p.y, p.x) + float(i) * PHI;
      float radius = length(p);
      result += sin(angle * 4.0 + radius) * amplitude;
      
      p *= 2.0;
      amplitude *= 0.5;
    }
    
    return result * 0.5 + 0.5;
  }
  
  // Sierpinski triangle
  float sierpinski(vec2 uv, int depth) {
    vec2 p = uv * 2.0 + 1.0;
    float result = 1.0;
    
    for (int i = 0; i < 8; i++) {
      if (i >= depth) break;
      
      p = abs(p) - 1.0;
      if (p.x < p.y) p = p.yx;
      p.x -= 1.0;
      result *= 0.5;
    }
    
    return length(p) * result;
  }
  
  // Human Design type modulation
  vec3 getHDTypeModulation(int hdType, float awareness) {
    if (hdType == 0) { // Manifestor
      return vec3(1.0, 0.3, 0.2) * (1.0 + awareness * 0.5);
    } else if (hdType == 1) { // Generator
      return vec3(0.8, 0.6, 0.2) * (1.0 + awareness * 0.3);
    } else if (hdType == 2) { // Manifesting Generator
      return vec3(0.9, 0.4, 0.6) * (1.0 + awareness * 0.4);
    } else if (hdType == 3) { // Projector
      return vec3(0.4, 0.7, 0.9) * (1.0 + awareness * 0.8);
    } else { // Reflector
      return vec3(0.6, 0.9, 0.7) * (1.0 + awareness * 1.0);
    }
  }
  
  // Enneagram center modulation
  vec3 getEnneagramModulation(int enneaType, float awareness) {
    // Body center (1, 8, 9)
    if (enneaType == 1 || enneaType == 8 || enneaType == 9) {
      return vec3(0.8, 0.2, 0.2) * awareness;
    }
    // Heart center (2, 3, 4)
    else if (enneaType >= 2 && enneaType <= 4) {
      return vec3(0.2, 0.8, 0.2) * awareness;
    }
    // Head center (5, 6, 7)
    else {
      return vec3(0.2, 0.2, 0.8) * awareness;
    }
  }
  
  // Breath synchronization wave
  float breathWave(float phase, float coherence) {
    return 0.5 + 0.5 * sin(phase) * coherence;
  }
  
  // Wave interference pattern
  float waveField(vec3 pos, float t, float freq) {
    float field = 0.0;
    float scale = 1.0;
    
    // Multiple wave octaves with consciousness modulation
    for (int i = 0; i < 5; i++) {
      field += noise(pos * scale + t * 0.1) / scale;
      scale *= 2.0 + consciousness * 0.1;
    }
    
    // Add frequency-specific wave
    field += sin(t * freq * 0.001 + length(pos)) * consciousness * 0.3;
    
    return field * consciousness;
  }
  
  // HSV to RGB conversion (minimal)
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    vec3 pos = vPosition;
    
    // Calculate fractal based on type
    float fractalValue = 0.0;
    float maxIter = 16.0 + consciousness * 32.0;
    
    if (fractalType == 0) { // Mandelbrot
      vec2 c = uv + sin(time + breathPhase) * 0.01 * consciousness;
      fractalValue = mandelbrot(c, maxIter);
    } else if (fractalType == 1) { // Julia
      vec2 c = vec2(-0.7269, 0.1889) + sin(time * 0.5) * 0.1 * consciousness;
      fractalValue = julia(uv, c, maxIter);
    } else if (fractalType == 2) { // Dragon
      fractalValue = dragon(uv, 2.0 + consciousness, int(4.0 + consciousness * 4.0));
    } else { // Sierpinski
      fractalValue = sierpinski(uv, int(3.0 + consciousness * 5.0));
    }
    
    // Wave field overlay
    float waves = waveField(pos, time, waveFrequency);
    
    // Breath modulation
    float breath = breathWave(breathPhase, coherence);
    
    // Combine effects
    float intensity = fractalValue * breath + waves * 0.3;
    intensity *= awarenessAmplification;
    
    // Get archetypal color modulation
    vec3 hdModulation = getHDTypeModulation(humanDesignType, consciousness);
    vec3 enneaModulation = getEnneagramModulation(enneagramType, consciousness);
    
    // Base color calculation
    float hue = 0.6 + consciousness * 0.2 + sin(time * 0.5) * 0.1;
    float saturation = 0.8 + coherence * 0.2;
    float value = intensity * (0.5 + consciousness * 0.5);
    
    vec3 baseColor = hsv2rgb(vec3(hue, saturation, value));
    
    // Mix with archetypal colors
    vec3 color = mix(baseColor, archetypalColor, consciousness * 0.2);
    color = mix(color, hdModulation, consciousness * 0.3);
    color = mix(color, enneaModulation, consciousness * 0.2);
    
    // Add glow effect based on normal
    float glow = 1.0 - abs(dot(vNormal, normalize(vPosition)));
    color += glow * archetypalColor * consciousness * 0.3;
    
    // Fractal edge enhancement
    float edge = length(fwidth(fractalValue)) * 10.0;
    color += edge * vec3(1.0) * consciousness * 0.5;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Shader uniforms interface
export interface ArchetypalFractalUniforms {
  time: { value: number };
  consciousness: { value: number };
  breathPhase: { value: number };
  coherence: { value: number };
  resolution: { value: [number, number] };
  archetypalColor: { value: [number, number, number] };
  fractalType: { value: number }; // 0=mandelbrot, 1=julia, 2=dragon, 3=sierpinski
  humanDesignType: { value: number }; // 0=manifestor, 1=generator, 2=mg, 3=projector, 4=reflector
  enneagramType: { value: number }; // 1-9
  awarenessAmplification: { value: number };
  waveFrequency: { value: number };
}

// Default uniforms
export const defaultArchetypalUniforms: ArchetypalFractalUniforms = {
  time: { value: 0.0 },
  consciousness: { value: 0.5 },
  breathPhase: { value: 0.0 },
  coherence: { value: 0.5 },
  resolution: { value: [1920, 1080] },
  archetypalColor: { value: [0.6, 0.3, 0.9] },
  fractalType: { value: 0 }, // Mandelbrot
  humanDesignType: { value: 1 }, // Generator
  enneagramType: { value: 9 }, // Peacemaker
  awarenessAmplification: { value: 1.0 },
  waveFrequency: { value: 528.0 }, // 528 Hz
};

// Export shader material configuration
export const archetypalFractalShader = {
  vertexShader,
  fragmentShader,
  uniforms: defaultArchetypalUniforms,
  transparent: true,
  side: 2, // DoubleSide
};

// Minimal 267-character version for performance
export const minimalArchetypalShader = `
uniform float t,c,b,a;uniform int f,h,e;varying vec2 v;
float n(vec3 p){return abs(dot(sin(p.yzx),cos(p.xzz)))*0.6;}
float m(vec2 z){float i=0.;for(int j=0;j<32;j++){if(length(z)>2.)break;z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+v;i+=1.;}return i/32.;}
void main(){gl_FragColor=vec4(vec3(m(v)*c*a),1.);}
`;

export { vertexShader, fragmentShader };
