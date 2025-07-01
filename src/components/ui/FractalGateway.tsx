import React, { useRef, useEffect, useState } from 'react';

interface FractalGatewayProps {
  onEnter: () => void;
}

const vertexShaderSource = `#version 300 es
in vec2 aPosition;
out vec2 vUV;
void main() {
  vUV = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// "Accretion" black hole shader by @XorDev, adapted for WebGL2
const fragmentShaderSource = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 fragColor;
uniform float uTime;
uniform vec2 uResolution;
uniform float uDissolve; // 0 = no dissolve, 1 = full dissolve

void main() {
    vec2 I = gl_FragCoord.xy;
    vec2 res = uResolution;
    vec2 uv = (I - 0.5 * res) / min(res.x, res.y);
    float z = 0.0, d, i = 0.0;
    vec4 O = vec4(0.0);
    for(O *= i; i++ < 20.0; ) {
        vec3 p = z * normalize(vec3(I + I, 0.0) - res.xyx) + 0.1;
        p = vec3(atan(p.y / 0.2, p.x) * 2.0, p.z / 3.0, length(p.xy) - 5.0 - z * 0.2);
        for(d = 0.0; d++ < 7.0; )
            p += sin(p.yzx * d + uTime + 0.3 * i) / d;
        z += d = length(vec4(0.4 * cos(p) - 0.4, p.z));
        O += (1.0 + cos(p.x + i * 0.4 + z + vec4(6, 1, 2, 0))) / d;
    }
    O = tanh(O * O / 400.0);

    // Black hole dissolve mask
    float mask = 1.0;
    if (uDissolve > 0.0) {
        float r = length(uv);
        float edge = mix(1.0, 0.0, smoothstep(0.0, 1.0, uDissolve));
        float hole = smoothstep(edge, edge + 0.04, r);
        O.rgb = mix(O.rgb, vec3(0.0), 1.0 - hole);
        mask = hole;
    }
    fragColor = vec4(O.rgb, 1.0);
}
`;

export default function FractalGateway({ onEnter }: FractalGatewayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [dissolve, setDissolve] = useState(0);
  const [dissolving, setDissolving] = useState(false);

  // Animate dissolve on button click
  useEffect(() => {
    if (!dissolving) return;
    let frame: number;
    let start: number | null = null;
    function animate(ts: number) {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 700; // 0.7s dissolve
      setDissolve(Math.min(1, elapsed));
      if (elapsed < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [dissolving]);

  // Call onEnter after dissolve completes
  useEffect(() => {
    if (dissolve >= 1) {
      setTimeout(() => onEnter(), 100);
    }
  }, [dissolve, onEnter]);

  useEffect(() => {
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let animationId: number;
    let uTime: WebGLUniformLocation | null = null;
    let uResolution: WebGLUniformLocation | null = null;
    let uDissolve: WebGLUniformLocation | null = null;
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
    uDissolve = gl.getUniformLocation(program, 'uDissolve');

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
      gl.uniform1f(uDissolve, dissolve);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    render();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dissolve]);

  // Fade in button after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleWarp = () => {
    setDissolving(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block', width: '100vw', height: '100vh' }}
      />
      {showButton && !dissolving && (
        <div className="relative z-10 flex flex-col items-center">
          <button
            onClick={handleWarp}
            className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/30 text-cyan-200 font-mono text-lg shadow-xl hover:bg-cyan-400/20 transition-all duration-300"
            style={{ letterSpacing: '0.08em' }}
          >
            ENTER THE GATEWAY
          </button>
          <div className="mt-4 text-cyan-100/80 text-sm font-mono text-center drop-shadow-lg">
            Breathe in. Breathe out. <span className="text-cyan-300">Ready?</span>
          </div>
        </div>
      )}
    </div>
  );
} 