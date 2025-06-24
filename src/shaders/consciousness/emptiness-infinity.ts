/**
 * "Emptiness, your infinity" - Consciousness Portal Shader
 * 
 * Inspired by Yohei Nishitsuji's minimal fractal approach
 * 267-character challenge adaptation for consciousness visualization
 */

// Vertex Shader
export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader - Consciousness Portal
export const fragmentShader = `
  uniform float time;
  uniform float consciousness;
  uniform float breathPhase;
  uniform float coherence;
  uniform vec2 resolution;
  uniform vec3 archetypalColor;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Nishitsuji's minimal noise function
  float noise(vec3 p) {
    vec3 s = vec3(1.0, 2.0, 3.0);
    return abs(dot(sin(p.yzx * s), cos(p.xzz * s))) / length(s) * 0.6;
  }
  
  // Consciousness-responsive fractal
  float consciousnessFractal(vec2 uv, float t) {
    vec2 z = uv;
    float iterations = 0.0;
    float maxIter = 32.0 + consciousness * 32.0;
    
    for (float i = 0.0; i < 64.0; i++) {
      if (i >= maxIter) break;
      if (length(z) > 2.0) break;
      
      // Mandelbrot with consciousness modulation
      vec2 c = vec2(-0.7269, 0.1889) + sin(t + breathPhase) * 0.01 * consciousness;
      z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      iterations += 1.0;
    }
    
    return iterations / maxIter;
  }
  
  // Wave interference pattern
  float waveField(vec3 pos, float t) {
    float field = 0.0;
    float scale = 1.0;
    
    // Multiple wave octaves
    for (int i = 0; i < 5; i++) {
      field += noise(pos * scale + t * 0.1) / scale;
      scale *= 2.0 + consciousness * 0.1;
    }
    
    return field * consciousness;
  }
  
  // Breath synchronization
  float breathModulation(float phase) {
    return 0.5 + 0.5 * sin(phase * 3.14159) * coherence;
  }
  
  // HSV to RGB conversion
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    vec3 pos = vPosition;
    
    // Fractal portal calculation
    float fractal = consciousnessFractal(uv, time);
    
    // Wave field overlay
    float waves = waveField(pos, time);
    
    // Breath modulation
    float breath = breathModulation(breathPhase);
    
    // Combine effects
    float intensity = fractal * breath + waves * 0.3;
    
    // Color based on consciousness level and archetype
    float hue = 0.6 + consciousness * 0.2 + sin(time * 0.5) * 0.1;
    float saturation = 0.8 + coherence * 0.2;
    float value = intensity * (0.5 + consciousness * 0.5);
    
    vec3 color = hsv2rgb(vec3(hue, saturation, value));
    
    // Mix with archetypal color
    color = mix(color, archetypalColor, consciousness * 0.3);
    
    // Add glow effect
    float glow = 1.0 - length(uv) * 0.5;
    color += glow * archetypalColor * consciousness * 0.2;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Shader uniforms interface
export interface ConsciousnessShaderUniforms {
  time: { value: number };
  consciousness: { value: number };
  breathPhase: { value: number };
  coherence: { value: number };
  resolution: { value: [number, number] };
  archetypalColor: { value: [number, number, number] };
}

// Default uniforms
export const defaultUniforms: ConsciousnessShaderUniforms = {
  time: { value: 0.0 },
  consciousness: { value: 0.5 },
  breathPhase: { value: 0.0 },
  coherence: { value: 0.5 },
  resolution: { value: [1920, 1080] },
  archetypalColor: { value: [0.6, 0.3, 0.9] }, // Purple
};

// Export shader material configuration
export const consciousnessPortalShader = {
  vertexShader,
  fragmentShader,
  uniforms: defaultUniforms,
  transparent: true,
  side: 2, // DoubleSide
};

// Minimal 267-character version (Nishitsuji challenge)
export const minimalConsciousnessShader = `
uniform float t,c,b;varying vec2 v;
float n(vec3 p){return abs(dot(sin(p.yzx),cos(p.xzz)))*0.6;}
void main(){
vec2 z=v;float i=0.;
for(int j=0;j<32;j++){
if(length(z)>2.)break;
z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+vec2(-.7269,.1889);
i+=1.;
}
gl_FragColor=vec4(vec3(i/32.*c),1.);
}
`;
