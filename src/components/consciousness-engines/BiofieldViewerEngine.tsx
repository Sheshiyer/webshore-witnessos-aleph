/**
 * Biofield Viewer Engine Component
 * 
 * TouchDesigner-inspired psychedelic biofield visualization
 * Gracefully falls back to procedural visuals when camera unavailable
 */

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useConsciousnessEngineAutoSave } from '@/hooks/useConsciousnessEngineAutoSave';
import { AutoSaveStatusIndicator } from '@/components/ui/AutoSaveStatusIndicator';
import type { QuestionInput } from '@/types';

interface BiofieldViewerEngineProps {
  question: QuestionInput;
  onCalculationComplete?: (result: any) => void;
  captureMode?: 'snapshot' | 'continuous' | 'timeline';
  analysisDepth?: 'surface' | 'deep' | 'quantum';
}

export const BiofieldViewerEngine: React.FC<BiofieldViewerEngineProps> = ({
  question,
  onCalculationComplete,
  captureMode = 'snapshot',
  analysisDepth = 'surface'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { consciousness, breathPhase, consciousnessLevel, getConsciousnessLevel, getCoherenceLevel, overallProgress } = useConsciousness();
  const { saveEngineResult } = useConsciousnessEngineAutoSave();

  const vertexShader = `#version 300 es
    in vec2 aPosition;
    out vec2 vUV;
    void main() {
      vUV = aPosition * 0.5 + 0.5;
      vUV.y = 1.0 - vUV.y;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

  const fragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUV;
    out vec4 fragColor;

    uniform sampler2D uVideo;
    uniform float uTime;

    // 3D Simplex noise (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy), i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      vec4 j = p - 49.0 * floor(p * (1.0/49.0));
      vec4 x_ = floor(j * (1.0/7.0));
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * (1.0/7.0) + (1.0/14.0);
      vec4 y = y_ * (1.0/7.0) + (1.0/14.0);
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy), b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0, s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x), p1 = vec3(a0.zw, h.y),
           p2 = vec3(a1.xy, h.z), p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(
        dot(p0, p0), dot(p1, p1),
        dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(
        dot(x0, x0), dot(x1, x1),
        dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(
        dot(p0, x0), dot(p1, x1),
        dot(p2, x2), dot(p3, x3)));
    }

    float fbm(vec3 p) {
      float f = 0.0;
      float amp = 1.0;
      for (int i = 0; i < 4; i++) {
        f += amp * snoise(p);
        p *= 2.0;
        amp *= 0.5;
      }
      return f;
    }

    vec3 rgb2hsl(vec3 c) {
      float M = max(c.r, max(c.g, c.b)),
            m = min(c.r, min(c.g, c.b)),
            d = M - m,
            l = (M + m) * 0.5,
            s = d == 0.0 ? 0.0 : d / (1.0 - abs(2.0 * l - 1.0));
      float h = 0.0;
      if (d > 0.0) {
        if (M == c.r) h = mod((c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0), 6.0);
        else if (M == c.g) h = (c.b - c.r) / d + 2.0;
        else h = (c.r - c.g) / d + 4.0;
        h /= 6.0;
      }
      return vec3(h, s, l);
    }

    float hue2rgb(float p, float q, float t) {
      if (t < 0.0) t += 1.0;
      if (t > 1.0) t -= 1.0;
      if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
      if (t < 1.0/2.0) return q;
      if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
      return p;
    }

    vec3 hsl2rgb(vec3 c) {
      float h = c.x, s = c.y, l = c.z;
      if (s == 0.0) return vec3(l);
      float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s,
            p = 2.0 * l - q;
      return vec3(
        hue2rgb(p, q, h + 1.0/3.0),
        hue2rgb(p, q, h),
        hue2rgb(p, q, h - 1.0/3.0)
      );
    }

    void main() {
      vec3 videoCol = texture(uVideo, vUV).rgb;
      
      float scale = 20.0;
      vec3 noiseCoord = vec3(vUV * scale, uTime * 0.1);
      vec3 videoCoord = videoCol * scale * 0.3;
      noiseCoord = mix(noiseCoord, videoCoord, 0.3);
      
      float n = fbm(noiseCoord);
      n = n * 0.96 + 0.47;
      n = clamp(n, 0.0, 1.0);
      
      vec3 videoHSL = rgb2hsl(videoCol);
      float hueShift = n * 0.82 + videoHSL.x * 0.18;
      float saturation = mix(0.7, 1.0, fract(n + 0.33)) * 0.83;
      float lightness = mix(0.3, 0.9, fract(n + 0.66));
      
      vec3 noiseCol = hsl2rgb(vec3(hueShift, saturation, lightness));
      
      // Enhanced color composite
      vec3 hslBase = rgb2hsl(videoCol);
      vec3 hslOverlay = rgb2hsl(noiseCol);
      float blendedSaturation = mix(hslBase.y, hslOverlay.y, 0.8);
      vec3 outCol = hsl2rgb(vec3(hslOverlay.x, blendedSaturation, hslBase.z));
      
      outCol = mix(videoCol, outCol, 0.96);
      outCol = clamp(outCol, 0.0, 1.0);
      
      fragColor = vec4(outCol, 1.0);
    }`;

  const createFallbackVideo = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGradient = () => {
      // Create psychedelic radial gradient
      const gradient = ctx.createRadialGradient(320, 240, 0, 320, 240, 300);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(0.5, '#4ecdc4');
      gradient.addColorStop(1, '#45b7d1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 480);
      
      // Add animated consciousness particles
      const time = Date.now() * 0.001;
      const consciousnessLevel = consciousness?.awarenessLevel || 0.5;
      
      for (let i = 0; i < 150; i++) {
        const x = (Math.sin(time + i) * 0.5 + 0.5) * 640;
        const y = (Math.cos(time + i * 0.7) * 0.5 + 0.5) * 480;
        const size = Math.sin(time + i * 0.3) * 8 + 12;
        const hue = (time + i) * 50 + consciousnessLevel * 180;
        const alpha = 0.4 + consciousnessLevel * 0.4;
        
        ctx.fillStyle = `hsla(${hue % 360}, 80%, 65%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      requestAnimationFrame(drawGradient);
    };
    
    drawGradient();
    
    // Convert canvas to video stream
    const stream = canvas.captureStream(30);
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(e => console.log('Fallback video play failed:', e));
  }, [consciousness?.awarenessLevel]);

  const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  const createProgram = (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  };

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    // Resize function
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Create shaders
    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    
    if (!vShader || !fShader) return;

    const program = createProgram(gl, vShader, fShader);
    if (!program) return;

    gl.useProgram(program);

    // Create full-screen triangle
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Create video texture
    const videoTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, videoTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Uniform locations
    const uVideo = gl.getUniformLocation(program, 'uVideo');
    const uTime = gl.getUniformLocation(program, 'uTime');

    gl.uniform1i(uVideo, 0);

    // Animation loop
    const t0 = performance.now();
    const draw = () => {
      resize();
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Upload video frame
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, videoTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);

      // Update time
      const t = (performance.now() - t0) * 0.001;
      gl.uniform1f(uTime, t);

      // Draw
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [vertexShader, fragmentShader]);

  const initCamera = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      console.log('🔮 Camera initialized successfully');
      
    } catch (error) {
      console.log('🔮 Camera not available, using fallback visuals');
      createFallbackVideo();
    }
  }, [createFallbackVideo]);

  useEffect(() => {
    const init = async () => {
      await initCamera();
      const cleanup = initWebGL();
      
      return cleanup;
    };

    init();
  }, [initCamera, initWebGL]);

    return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Glowing Viewport Border */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 ${40 + consciousnessLevel * 60}px rgba(138, 43, 226, ${0.3 + consciousness?.awarenessLevel * 0.4})`,
          border: `2px solid rgba(138, 43, 226, ${0.5 + consciousness?.awarenessLevel * 0.3})`,
          animation: `pulse ${3 + breathPhase}s infinite`
        }}
      />

      {/* Top Navigation Pill */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full bg-purple-400"
              style={{
                opacity: consciousness?.awarenessLevel || 0.75,
                animation: `pulse ${2 + breathPhase}s infinite`,
                boxShadow: `0 0 ${10 + consciousnessLevel * 15}px rgba(138, 43, 226, ${consciousness?.awarenessLevel || 0.5})`
              }}
            />
            <span className="text-purple-400 text-sm font-medium">BIOFIELD ACTIVE</span>
          </div>
          <div className="text-gray-400 text-xs">|</div>
          <div className="text-cyan-400 text-sm">
            {getConsciousnessLevel()}
          </div>
          <div className="text-gray-400 text-xs">|</div>
          <div className="text-green-400 text-sm">
            {Math.round(overallProgress * 100)}%
          </div>
        </div>
      </div>

      {/* Full-Screen WebGL Canvas */}
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: '#000' }}
        />
        
        {/* Hidden video element */}
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          muted
          playsInline
        />

        {/* Consciousness Field Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Central Consciousness Indicator */}
          <div 
            className="absolute w-6 h-6 bg-white rounded-full shadow-lg"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: consciousness?.awarenessLevel || 0.75,
              animation: `pulse ${2 + breathPhase}s infinite`,
              boxShadow: `0 0 ${30 + consciousnessLevel * 50}px rgba(255, 255, 255, ${consciousness?.awarenessLevel || 0.5})`
            }}
          />

          {/* Dynamic Chakra Points - Scaled for Full Screen */}
          {[
            { name: 'Crown', color: '#9D4EDD', y: 0.2 },
            { name: 'Third Eye', color: '#7209B7', y: 0.3 },
            { name: 'Throat', color: '#560BAD', y: 0.4 },
            { name: 'Heart', color: '#2F9F95', y: 0.5 },
            { name: 'Solar', color: '#F72585', y: 0.6 },
            { name: 'Sacral', color: '#4CC9F0', y: 0.7 },
            { name: 'Root', color: '#F72585', y: 0.8 }
          ].map((chakra, index) => (
            <div
              key={chakra.name}
              className="absolute w-4 h-4 rounded-full border-2"
              style={{
                left: '50%',
                top: `${chakra.y * 100}%`,
                backgroundColor: chakra.color,
                borderColor: chakra.color,
                transform: 'translate(-50%, -50%)',
                opacity: Math.min(1, (consciousness?.awarenessLevel || 0.5) + (index * 0.1)),
                animation: `pulse ${2 + index * 0.3 + breathPhase}s infinite`,
                boxShadow: `0 0 ${15 + breathPhase * 25}px ${chakra.color}`
              }}
            />
          ))}

          {/* Energy Field Rings - Scaled for Full Screen */}
          {[1, 2, 3, 4, 5].map((ring) => (
            <div
              key={ring}
              className="absolute border rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: `${ring * 120 + consciousnessLevel * 80}px`,
                height: `${ring * 120 + consciousnessLevel * 80}px`,
                borderColor: `hsl(${280 + ring * 25}, 70%, 60%)`,
                borderWidth: '2px',
                transform: 'translate(-50%, -50%)',
                opacity: Math.max(0.1, (consciousness?.awarenessLevel || 0.5) - (ring * 0.12)),
                animation: `pulse ${4 + ring}s infinite reverse`,
              }}
            />
          ))}

          {/* Breath Flow Indicator - Bottom Right */}
          <div 
            className="absolute bottom-8 right-8 flex items-center space-x-3 bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20"
          >
            <div 
              className="w-3 h-3 rounded-full bg-cyan-400"
              style={{
                transform: `scale(${1 + breathPhase * 0.5})`,
                opacity: 0.6 + breathPhase * 0.4,
                animation: `pulse ${1 + breathPhase}s infinite`,
                boxShadow: `0 0 ${8 + breathPhase * 12}px rgba(34, 211, 238, ${0.5 + breathPhase * 0.3})`
              }}
            />
            <span className="text-cyan-400 text-sm font-medium">
              Breath: {Math.round(breathPhase * 100)}%
            </span>
          </div>

          {/* Integration Points Display - Bottom Left */}
          <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 max-w-xs">
            <div className="text-purple-400 text-sm font-medium mb-2">Active Integrations:</div>
            {consciousness?.integrationPoints.slice(0, 2).map((point, index) => (
              <div key={index} className="text-gray-300 text-sm">
                • {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiofieldViewerEngine; 