import React, { useRef, useEffect } from 'react';

interface CircularAudioVisualizerProps {
  frequencyData: Uint8Array;
  audioLevel: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
  sensitivity: number;
}

export const CircularAudioVisualizer: React.FC<CircularAudioVisualizerProps> = ({
  frequencyData,
  audioLevel,
  bassLevel,
  midLevel,
  trebleLevel,
  sensitivity
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.3;

    ctx.clearRect(0, 0, width, height);

    if (frequencyData.length === 0) return;

    // Draw multiple rings for different frequency ranges
    const numRings = 3;
    const numPoints = 180;

    for (let ring = 0; ring < numRings; ring++) {
      const ringRadius = baseRadius * (0.6 + ring * 0.2);
      const opacity = 0.8 - ring * 0.2;

      // Calculate frequency range for this ring
      const freqRangeStart = Math.floor((ring * frequencyData.length) / (numRings * 1.5));
      const freqRangeEnd = Math.floor(((ring + 1) * frequencyData.length) / (numRings * 1.5));
      const freqRange = freqRangeEnd - freqRangeStart;

      ctx.beginPath();

      for (let i = 0; i < numPoints; i++) {
        // Calculate average frequency value for this segment
        const segmentSize = Math.floor(freqRange / numPoints);
        let sum = 0;
        
        for (let j = 0; j < segmentSize; j++) {
          const freqIndex = freqRangeStart + ((i * segmentSize + j) % freqRange);
          sum += frequencyData[freqIndex] || 0;
        }
        
        const value = sum / (segmentSize * 255);
        const adjustedValue = value * sensitivity;
        const dynamicRadius = ringRadius * (1 + adjustedValue * 0.5);

        const angle = (i / numPoints) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * dynamicRadius;
        const y = centerY + Math.sin(angle) * dynamicRadius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();

      // Create gradient based on ring and audio levels
      let gradient;
      if (ring === 0) {
        // Inner ring - bass frequencies (cyan to blue)
        gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${opacity * (1 + bassLevel)})`);
        gradient.addColorStop(1, `rgba(0, 150, 255, ${opacity * 0.7 * (1 + bassLevel)})`);
      } else if (ring === 1) {
        // Middle ring - mid frequencies (magenta to purple)
        gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2);
        gradient.addColorStop(0, `rgba(255, 0, 255, ${opacity * (1 + midLevel)})`);
        gradient.addColorStop(1, `rgba(150, 0, 255, ${opacity * 0.7 * (1 + midLevel)})`);
      } else {
        // Outer ring - treble frequencies (purple to cyan)
        gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2);
        gradient.addColorStop(0, `rgba(150, 50, 255, ${opacity * (1 + trebleLevel)})`);
        gradient.addColorStop(1, `rgba(0, 255, 255, ${opacity * 0.7 * (1 + trebleLevel)})`);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 + (numRings - ring);
      ctx.stroke();

      // Add glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = ring === 0 ? 'rgba(0, 255, 255, 0.7)' : 
                       ring === 1 ? 'rgba(255, 0, 255, 0.7)' : 
                                   'rgba(150, 50, 255, 0.7)';
    }

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw center pulse
    const pulseRadius = baseRadius * 0.1 * (1 + audioLevel * 2);
    const pulseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * (1 + audioLevel)})`);
    pulseGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = pulseGradient;
    ctx.fill();

  }, [frequencyData, audioLevel, bassLevel, midLevel, trebleLevel, sensitivity]);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-5">
      <canvas
        ref={canvasRef}
        className="w-96 h-96"
        style={{ width: '384px', height: '384px' }}
      />
    </div>
  );
};

export default CircularAudioVisualizer;
