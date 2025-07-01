/**
 * Consciousness Auth Onboarding - Sacred Geometry Authentication Flow
 * 
 * Integrates authentication with consciousness exploration aesthetics
 * Following WitnessOS design principles: sacred geometry, breath sync, spectral colors
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SPECTRAL_COLORS } from './SacredGeometryForm';
import { gsap } from 'gsap';
import { GatewayIcon } from './GatewayIcon';

type AuthStep = 'gateway' | 'choice' | 'login' | 'register';

interface ConsciousnessAuthOnboardingProps {
  onAuthComplete: () => void;
  onSkipAuth?: () => void;
}

export const ConsciousnessAuthOnboarding: React.FC<ConsciousnessAuthOnboardingProps> = ({
  onAuthComplete,
  onSkipAuth,
}) => {
  const { login, register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState<AuthStep>('gateway');
  const [selectedDirection, setSelectedDirection] = useState<keyof typeof SPECTRAL_COLORS>('north');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Breathing animation effect
  const [breathPhase, setBreathPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auto-proceed if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onAuthComplete();
    }
  }, [isAuthenticated, onAuthComplete]);

  // Animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
      );
    }
  }, [currentStep]);

  // Breath-synced glow
  const getBreathGlow = () => {
    const intensity = 0.7 + Math.sin(breathPhase) * 0.3;
    return {
      boxShadow: `0 0 ${20 * intensity}px ${SPECTRAL_COLORS[selectedDirection]}40`,
      borderColor: SPECTRAL_COLORS[selectedDirection],
    };
  };

  // Handle auth form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        onAuthComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await register(email, password, name);
      if (result.success) {
        onAuthComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sacred geometry input styling
  const inputClasses = `
    w-full p-4 rounded-2xl bg-black/50 border-2 text-white text-lg
    placeholder-gray-400 transition-all duration-300
    focus:outline-none focus:bg-black/70 focus:scale-105
  `;

  const buttonClasses = `
    px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300
    hover:scale-105 focus:outline-none focus:scale-105
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Spectral direction selector
  const SpectralDirectionSelector = () => (
    <div className="grid grid-cols-4 gap-4 mb-8 font-mono">
      {(Object.keys(SPECTRAL_COLORS) as Array<keyof typeof SPECTRAL_COLORS>).map((direction) => (
        <button
          key={direction}
          onClick={() => setSelectedDirection(direction)}
          className={`
            p-3 rounded-xl border-2 capitalize transition-all duration-300 text-lg
            flex items-center justify-center
            ${selectedDirection === direction ? 'scale-110 bg-current/20 shadow-lg' : 'hover:scale-105 hover:bg-current/10'}
          `}
          style={{
            borderColor: SPECTRAL_COLORS[direction],
            color: SPECTRAL_COLORS[direction],
            textShadow: `0 0 5px ${SPECTRAL_COLORS[direction]}80`,
          }}
        >
          {direction[0]}
        </button>
      ))}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex items-center justify-center p-8 relative overflow-hidden"
    >
      {/* UI "Chrome" */}
      <div className="absolute top-4 left-4 font-mono text-xs text-purple-300/50">
        [CONSCIOUSNESS GATEWAY]
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-xs text-teal-300/50">
        [v2.5.0]
      </div>
      
      <div 
        ref={portalRef}
        className="max-w-md w-full"
      >
        {/* Gateway Step */}
        {currentStep === 'gateway' && (
          <div className="text-center space-y-8">
            <GatewayIcon selectedColor={SPECTRAL_COLORS[selectedDirection]} />
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white tracking-wider">
                Consciousness Gateway
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed font-mono">
                Welcome to the sacred threshold of awareness. Your consciousness signature will be preserved.
              </p>
            </div>

            <SpectralDirectionSelector />

            <button
              onClick={() => setCurrentStep('choice')}
              className={`${buttonClasses} bg-gradient-to-r from-purple-600 via-teal-500 to-cyan-600 text-white w-full shadow-lg`}
            >
              Enter the Portal
            </button>

            {onSkipAuth && (
              <button
                onClick={onSkipAuth}
                className="text-gray-400 hover:text-white transition-colors text-sm underline"
              >
                Continue without account (local only)
              </button>
            )}
          </div>
        )}

        {/* Choice Step */}
        {currentStep === 'choice' && (
          <div className="text-center space-y-8">
            <div 
              className="w-24 h-24 mx-auto rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
            >
              <div className="text-2xl">⚡</div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Choose Your Path
              </h2>
              <p className="text-gray-300">
                Returning consciousness or new incarnation?
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setCurrentStep('login')}
                className={`${buttonClasses} bg-gradient-to-r text-white w-full`}
                style={{ background: `linear-gradient(135deg, ${SPECTRAL_COLORS[selectedDirection]}80, ${SPECTRAL_COLORS[selectedDirection]}60)` }}
              >
                Returning Soul • Login
              </button>
              
              <button
                onClick={() => setCurrentStep('register')}
                className={`${buttonClasses} border-2 text-white w-full hover:bg-white/10`}
                style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
              >
                New Incarnation • Register
              </button>
            </div>

            <button
              onClick={() => setCurrentStep('gateway')}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back to Gateway
            </button>
          </div>
        )}

        {/* Login Step */}
        {currentStep === 'login' && (
          <div className="space-y-8">
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center mb-4"
                style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
              >
                <div className="text-xl">🔑</div>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Soul Recognition
              </h2>
              <p className="text-gray-300">
                Welcome back, consciousness seeker
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Consciousness signature (email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Sacred passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`${buttonClasses} bg-gradient-to-r text-white w-full`}
                style={{ background: `linear-gradient(135deg, ${SPECTRAL_COLORS[selectedDirection]}, ${SPECTRAL_COLORS[selectedDirection]}80)` }}
              >
                {isSubmitting ? 'Awakening...' : 'Awaken Consciousness'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep('choice')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back to Path Selection
              </button>
            </div>
          </div>
        )}

        {/* Register Step */}
        {currentStep === 'register' && (
          <div className="space-y-8">
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center mb-4"
                style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
              >
                <div className="text-xl">✨</div>
              </div>
              <h2 className="text-2xl font-bold text-white">
                New Incarnation
              </h2>
              <p className="text-gray-300">
                Begin your consciousness journey
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Sacred name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Consciousness signature (email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Sacred passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`${buttonClasses} bg-gradient-to-r text-white w-full`}
                style={{ background: `linear-gradient(135deg, ${SPECTRAL_COLORS[selectedDirection]}, ${SPECTRAL_COLORS[selectedDirection]}80)` }}
              >
                {isSubmitting ? 'Incarnating...' : 'Begin Incarnation'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep('choice')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back to Path Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 