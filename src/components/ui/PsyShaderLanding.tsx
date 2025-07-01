import React, { useRef, useEffect } from 'react';

const vertexShaderSource = `#version 300 es
in vec2 aPosition;
out vec2 vUV;
void main() {
  vUV = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// User's "Quantum" GLSL code - optimized version
const fragmentShaderSource = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 fragColor;
uniform float uTime;
uniform vec2 uResolution;

mat2 rotate2D(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  float t = uTime;
  vec2 r = uResolution.xy;
  vec2 FC = gl_FragCoord.xy;
  vec4 o = vec4(0.0);
  
  vec3 p, q = vec3(0.0);
  for (float i = 1.0, j, z; i > 0.0; i -= 0.02) {
    z = p.z += sqrt(max(z = i - dot(p = vec3(FC.xy * 2.0 - r, 0.0) / r.y, p), -z / 1e6));
    p /= 2.0 + p.z;
    p.xz *= rotate2D(t);
    o += pow(z * z, 0.2) * i * pow(cos(j = cos(j) * dot(cos(q += p), sin(q.yzx)) / 0.3) * 0.5 + 0.5, 8.0) * (sin(i * 30.0 + vec4(0, 1, 2, 3)) + 1.0) / 8.0;
  }
  o *= o;
  fragColor = o;
}
`;

export default function PsyShaderLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let animationId: number;
    let uTime: WebGLUniformLocation | null = null;
    let uResolution: WebGLUniformLocation | null = null;
    let startTime = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    if (!gl) return;

    // Compile shaders
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        throw new Error(gl!.getShaderInfoLog(s) || 'Shader error');
      }
      return s;
    }
    const vs = compile(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Link error');
    }
    gl.useProgram(program);

    // Fullscreen quad
    const pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    uTime = gl.getUniformLocation(program, 'uTime');
    uResolution = gl.getUniformLocation(program, 'uResolution');

    function render() {
      if (!canvas || !gl) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uTime, (performance.now() - startTime) * 0.001);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    render();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block', width: '100vw', height: '100vh', zIndex: 0 }}
    />
  );
} 