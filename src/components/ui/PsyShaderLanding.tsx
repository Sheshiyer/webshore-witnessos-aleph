import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CircularAudioVisualizer from './CircularAudioVisualizer';

// Audio-VS Aesthetic CSS Variables
const audioVSStyles = `
  :root {
    --bg-color: #12100f;
    --grid-color: rgba(255, 240, 230, 0.05);
    --text-primary: #f3ede9;
    --text-secondary: #c2b8b2;
    --text-highlight: #ff4e42;
    --accent-primary: #ff4e42;
    --accent-secondary: #c2362f;
    --accent-tertiary: #ffb3ab;
    --panel-bg: rgba(30, 26, 24, 0.7);
    --panel-border: rgba(255, 78, 66, 0.3);
    --panel-highlight: rgba(255, 78, 66, 0.1);
    --scanner-line: rgba(255, 78, 66, 0.7);
  }
`;

// Demo track URLs from the audio-vs example
const demoTracks = [
  { name: 'MERKABA', url: 'https://assets.codepen.io/7558/Merkaba.mp3' },
  { name: 'DHAMIKA', url: 'https://assets.codepen.io/7558/Dhamika.mp3' },
  { name: 'VACANT', url: 'https://assets.codepen.io/7558/Vacant.mp3' },
  { name: 'LXSTNGHT', url: 'https://assets.codepen.io/7558/lxstnght-back_1.mp3' }
];



// Audio analysis interface
interface AudioData {
  audioLevel: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
  frequencyData: Uint8Array;
}

// Audio analyzer hook
const useAudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<AudioData>({
    audioLevel: 0,
    bassLevel: 0,
    midLevel: 0,
    trebleLevel: 0,
    frequencyData: new Uint8Array(0)
  });
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [audioSensitivity, setAudioSensitivity] = useState(1.0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedElementRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  const initAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      setIsAudioInitialized(true);
      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      return false;
    }
  }, []);

  const connectAudioElement = useCallback((audioElement: HTMLAudioElement) => {
    if (!audioContextRef.current || !analyserRef.current) return false;

    try {
      // If this is the same audio element we're already connected to, just ensure connections
      if (connectedElementRef.current === audioElement && sourceRef.current) {
        // Reconnect if needed
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        return true;
      }

      // Disconnect previous source if it exists
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      // Only create a new MediaElementSource if we're connecting a different element
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      connectedElementRef.current = audioElement;

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      return true;
    } catch (error) {
      console.error('Failed to connect audio element:', error);
      return false;
    }
  }, []);

  const startAnalysis = useCallback(() => {
    if (!analyserRef.current) return;

    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);

    const analyze = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(frequencyData);

      // Calculate frequency band levels
      const bassEnd = Math.floor(frequencyData.length * 0.1);
      const midEnd = Math.floor(frequencyData.length * 0.4);

      let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;

      for (let i = 0; i < frequencyData.length; i++) {
        const value = frequencyData[i] / 255;
        totalSum += value;

        if (i < bassEnd) bassSum += value;
        else if (i < midEnd) midSum += value;
        else trebleSum += value;
      }

      setAudioData({
        audioLevel: (totalSum / frequencyData.length) * audioSensitivity,
        bassLevel: (bassSum / bassEnd) * audioSensitivity,
        midLevel: (midSum / (midEnd - bassEnd)) * audioSensitivity,
        trebleLevel: (trebleSum / (frequencyData.length - midEnd)) * audioSensitivity,
        frequencyData
      });

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  }, [audioSensitivity]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    audioData,
    isAudioInitialized,
    audioSensitivity,
    setAudioSensitivity,
    initAudio,
    connectAudioElement,
    startAnalysis,
    audioContextRef,
    analyserRef
  };
};

export default function PsyShaderLanding() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);

  const {
    audioData,
    isAudioInitialized,
    audioSensitivity,
    setAudioSensitivity,
    initAudio,
    connectAudioElement,
    startAnalysis,
    audioContextRef,
    analyserRef
  } = useAudioAnalyzer();

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const anomalyRef = useRef<THREE.Group>();



  // Initialize Three.js scene for 3D anomaly object
  useEffect(() => {
    if (!threeContainerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    threeContainerRef.current.appendChild(renderer.domElement);

    // Create audio-reactive anomaly object
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioLevel: { value: 0 },
        bassLevel: { value: 0 },
        color: { value: new THREE.Color(0x00ffff) }
      },
      vertexShader: `
        uniform float time;
        uniform float audioLevel;
        uniform float bassLevel;
        varying vec3 vNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;

          // Audio-reactive distortion
          float distortion = 1.0 + audioLevel * 0.5 + bassLevel * 0.3;
          pos += normal * sin(time * 2.0 + position.x * 5.0) * 0.1 * distortion;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float audioLevel;
        varying vec3 vNormal;

        void main() {
          float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
          vec3 finalColor = color * (0.5 + audioLevel * 0.5);
          gl_FragColor = vec4(finalColor, fresnel * 0.8);
        }
      `,
      transparent: true,
      wireframe: true
    });

    const anomaly = new THREE.Mesh(geometry, material);
    scene.add(anomaly);
    anomalyRef.current = new THREE.Group();
    anomalyRef.current.add(anomaly);
    scene.add(anomalyRef.current);

    camera.position.z = 5;

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Animation loop
    let animationId: number;
    const animate = () => {
      if (anomalyRef.current && material) {
        material.uniforms.time.value = performance.now() * 0.001;
        material.uniforms.audioLevel.value = audioData.audioLevel;
        material.uniforms.bassLevel.value = audioData.bassLevel;

        anomalyRef.current.rotation.x += 0.01 * (1 + audioData.audioLevel);
        anomalyRef.current.rotation.y += 0.01 * (1 + audioData.bassLevel);
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (threeContainerRef.current && renderer.domElement) {
        threeContainerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [audioData]);



  // Audio file handling
  const handleAudioFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !audioRef.current) return;

    const url = URL.createObjectURL(file);
    audioRef.current.src = url;

    if (!isAudioInitialized) {
      initAudio().then(() => {
        if (audioRef.current) {
          connectAudioElement(audioRef.current);
          startAnalysis();
        }
      });
    } else {
      connectAudioElement(audioRef.current);
      startAnalysis();
    }
  }, [isAudioInitialized, initAudio, connectAudioElement, startAnalysis]);

  const loadDemoTrack = useCallback((url: string) => {
    if (!audioRef.current) return;

    audioRef.current.src = url;
    audioRef.current.crossOrigin = 'anonymous';

    if (!isAudioInitialized) {
      initAudio().then(() => {
        if (audioRef.current) {
          connectAudioElement(audioRef.current);
          startAnalysis();
          audioRef.current.play().catch(console.error);
        }
      });
    } else {
      connectAudioElement(audioRef.current);
      startAnalysis();
      audioRef.current.play().catch(console.error);
    }
  }, [isAudioInitialized, initAudio, connectAudioElement, startAnalysis]);

  const enableMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!isAudioInitialized) {
        await initAudio();
      }

      // Access the refs from the hook
      const audioContext = audioContextRef.current;
      const analyser = analyserRef.current;

      if (audioContext && analyser) {
        const micSource = audioContext.createMediaStreamSource(stream);
        micSource.connect(analyser);
        startAnalysis();
      }
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  }, [isAudioInitialized, initAudio, startAnalysis]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      if (!isAudioInitialized) {
        initAudio().then(() => {
          if (audioRef.current) {
            connectAudioElement(audioRef.current);
            startAnalysis();
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isAudioInitialized, initAudio, connectAudioElement, startAnalysis]);

  return (
    <>
      {/* Inject Audio-VS CSS Variables */}
      <style dangerouslySetInnerHTML={{ __html: audioVSStyles }} />

      <div className="absolute inset-0 w-full h-full" style={{
        backgroundColor: '#12100f', // Direct color instead of CSS variable
        color: '#f3ede9',
        fontFamily: '"TheGoodMonolith", monospace',
        textTransform: 'uppercase',
        fontSize: '1rem',
        overflow: 'hidden'
      }}>
        {/* Space Background */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url("https://assets.codepen.io/7558/space-bg-002.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.8,
            zIndex: 1
          }}
        />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 240, 230, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 240, 230, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            zIndex: 2
          }}
        />



        {/* Three.js 3D anomaly overlay */}
        <div
          ref={threeContainerRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 2 }}
        />

        {/* Circular audio visualizer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 3 }}>
          <CircularAudioVisualizer
            frequencyData={audioData.frequencyData}
            audioLevel={audioData.audioLevel}
            bassLevel={audioData.bassLevel}
            midLevel={audioData.midLevel}
            trebleLevel={audioData.trebleLevel}
            sensitivity={audioSensitivity}
          />
        </div>

        {/* Audio-VS Style Interface Container */}
        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 4, padding: '1.25rem' }}>
          {/* Header */}
          <div className="flex justify-between items-start" style={{ color: '#b8a99a', fontSize: '0.75rem' }}>
            <div></div>
            <div>WITNESSOS.AUDIO.REACTIVE<br />v2.5.4</div>
            <div id="timestamp">TIME: {new Date().toLocaleTimeString()}</div>
          </div>

          {/* Scanner Frame */}
          <div
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              border: '1px solid #ff6b35',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* Corner brackets */}
            <div style={{
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              width: '20px',
              height: '20px',
              borderTop: '2px solid #ff6b35',
              borderLeft: '2px solid #ff6b35'
            }} />
            <div style={{
              position: 'absolute',
              top: '-1px',
              right: '-1px',
              width: '20px',
              height: '20px',
              borderTop: '2px solid #ff6b35',
              borderRight: '2px solid #ff6b35'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              left: '-1px',
              width: '20px',
              height: '20px',
              borderBottom: '2px solid #ff6b35',
              borderLeft: '2px solid #ff6b35'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '20px',
              height: '20px',
              borderBottom: '2px solid #ff6b35',
              borderRight: '2px solid #ff6b35'
            }} />

            <div style={{
              position: 'absolute',
              bottom: '-30px',
              fontSize: '0.75rem',
              color: '#b8a99a'
            }}>
              WITNESSOS.AUDIO.REACTIVE({audioData.audioLevel.toFixed(2)})
            </div>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '0px',
              fontSize: '0.75rem',
              color: '#b8a99a'
            }}>
              FREQ.ANALYSIS(0x{Math.floor(audioData.bassLevel * 255).toString(16).toUpperCase().padStart(2, '0')})
            </div>
          </div>
        </div>

        {/* Data Panel - Top Left */}
        <div
          className="absolute pointer-events-auto"
          style={{
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(18, 16, 15, 0.9)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            padding: '1rem',
            fontSize: '0.75rem',
            zIndex: 5
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: '#f3ede9' }}>ANOMALY METRICS</span>
            <span style={{ color: '#ff6b35' }}>●</span>
          </div>
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: 'rgba(255, 78, 66, 0.2)',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: `${audioData.audioLevel * 100}%`,
              height: '100%',
              backgroundColor: '#ff6b35'
            }} />
          </div>
          <div style={{ color: '#b8a99a' }}>
            <div>STABILITY: {(audioData.audioLevel * 100).toFixed(0)}%</div>
            <div>BASS FREQ: {(audioData.bassLevel * 100).toFixed(0)}%</div>
            <div>MID FREQ: {(audioData.midLevel * 100).toFixed(0)}%</div>
            <div>HIGH FREQ: {(audioData.trebleLevel * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Audio Controls - Bottom */}
        <div
          className="absolute pointer-events-auto"
          style={{
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(18, 16, 15, 0.9)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            padding: '1rem',
            fontSize: '0.75rem',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Demo Tracks */}
          <div>
            <span style={{ color: '#b8a99a', marginRight: '1rem' }}>DEMO TRACKS:</span>
            {demoTracks.map((track, index) => (
              <button
                key={index}
                onClick={() => loadDemoTrack(track.url)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  color: '#f3ede9',
                  padding: '0.25rem 0.5rem',
                  marginRight: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {track.name}
              </button>
            ))}
          </div>

          {/* File Upload and Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioFile}
              style={{ display: 'none' }}
              id="audio-file-input"
            />
            <label
              htmlFor="audio-file-input"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                color: '#f3ede9',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'uppercase'
              }}
            >
              UPLOAD AUDIO FILE
            </label>

            <button
              onClick={handlePlayPause}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                color: '#f3ede9',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'uppercase'
              }}
            >
              PLAY/PAUSE
            </button>

            <button
              onClick={enableMicrophone}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                color: '#f3ede9',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'uppercase'
              }}
            >
              MIC INPUT
            </button>
          </div>

          {/* Sensitivity Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ color: '#b8a99a' }}>SENSITIVITY:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={audioSensitivity}
              onChange={(e) => setAudioSensitivity(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#f3ede9', minWidth: '2rem' }}>
              {audioSensitivity.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Terminal Panel - Bottom Right */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(18, 16, 15, 0.9)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            padding: '1rem',
            fontSize: '0.75rem',
            zIndex: 5,
            width: '300px',
            height: '150px',
            overflow: 'hidden'
          }}
        >
          <div style={{ color: '#b8a99a', marginBottom: '0.5rem' }}>
            SYSTEM TERMINAL
          </div>
          <div style={{
            color: '#f3ede9',
            fontFamily: 'monospace',
            fontSize: '0.6rem',
            lineHeight: '1.2'
          }}>
            <div>&gt; AUDIO ANALYSIS INITIALIZED</div>
            <div>&gt; FREQUENCY BANDS: BASS/MID/TREBLE</div>
            <div>&gt; SHADER REACTIVE MODE: ACTIVE</div>
            <div>&gt; SENSITIVITY: {audioSensitivity.toFixed(1)}x</div>
            <div>&gt; AUDIO LEVEL: {(audioData.audioLevel * 100).toFixed(0)}%</div>
            <div style={{ color: '#ff6b35' }}>
              &gt; STATUS: MONITORING...
            </div>
          </div>
        </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        className="hidden"
      />
    </div>
    </>
  );
}