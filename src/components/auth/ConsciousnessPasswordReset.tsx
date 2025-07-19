/**
 * WitnessOS Password Reset Component
 *
 * Sacred geometry-themed password reset flow matching WitnessOS aesthetics
 * Integrates with backend password reset endpoints
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SPECTRAL_COLORS } from '../ui/SacredGeometryForm';
import { AUTH_MODAL_COPY } from '@/utils/witnessos-ui-constants';
import { gsap } from 'gsap';

type ResetStep = 'request' | 'token' | 'complete';

interface ConsciousnessPasswordResetProps {
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ConsciousnessPasswordReset: React.FC<ConsciousnessPasswordResetProps> = ({
  onComplete,
  onCancel,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<ResetStep>('request');
  const [selectedDirection, setSelectedDirection] = useState<keyof typeof SPECTRAL_COLORS>('north');
  const [breathPhase, setBreathPhase] = useState(0);
  
  // Form states
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Breath synchronization
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase(prev => prev + 0.1);
    }, 100);

    return () => clearInterval(breathInterval);
  }, []);

  // Sacred geometry animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.8 },
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

  // Handle password reset request
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/backend/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Reset token sent! Check your email or use the token below for testing.');
        // For development, show the token in the UI
        if (data.token) {
          setResetToken(data.token);
        }
        setCurrentStep('token');
      } else {
        setError(data.message || 'Failed to send reset token');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/backend/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword,
          resetToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! You can now login with your new password.');
        setCurrentStep('complete');
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common styles
  const inputClasses = `
    w-full p-4 bg-black/30 border-2 rounded-xl text-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300
    backdrop-blur-sm
  `;

  const buttonClasses = `
    px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform
    hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full max-w-md"
        style={getBreathGlow()}
      >
        {/* Sacred Portal Background */}
        <div
          ref={portalRef}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-black/80 via-gray-900/80 to-black/80 backdrop-blur-xl border-2"
          style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
        />

        {/* Content */}
        <div className="relative z-10 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-6xl">🔮</div>
            <h1 className="text-3xl font-bold text-white">
              Sacred Password Reset
            </h1>
            <p className="text-gray-300">
              {currentStep === 'request' && 'Enter your consciousness signature to receive a reset token'}
              {currentStep === 'token' && 'Enter the reset token and your new sacred passphrase'}
              {currentStep === 'complete' && 'Your consciousness signature has been renewed'}
            </p>
          </div>

          {/* Step 1: Request Reset */}
          {currentStep === 'request' && (
            <form onSubmit={handleResetRequest} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder={AUTH_MODAL_COPY.PLACEHOLDERS.EMAIL}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              {success && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500 text-green-300 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${buttonClasses} bg-gradient-to-r text-white w-full`}
                style={{ background: `linear-gradient(135deg, ${SPECTRAL_COLORS[selectedDirection]}80, ${SPECTRAL_COLORS[selectedDirection]}60)` }}
              >
                {isSubmitting ? 'Sending Sacred Token...' : 'Send Reset Token'}
              </button>
            </form>
          )}

          {/* Step 2: Reset Password */}
          {currentStep === 'token' && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="New sacred passphrase"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm new passphrase"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              {success && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500 text-green-300 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${buttonClasses} bg-gradient-to-r text-white w-full`}
                style={{ background: `linear-gradient(135deg, ${SPECTRAL_COLORS[selectedDirection]}80, ${SPECTRAL_COLORS[selectedDirection]}60)` }}
              >
                {isSubmitting ? 'Renewing Witness Signature...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-6">
              <div className="text-6xl animate-pulse">✨</div>
              <div className="text-green-400 text-lg">
                Your witness signature has been successfully renewed!
              </div>
              <div className="text-gray-300">
                You will be redirected to login shortly...
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Return to Login
            </button>

            {currentStep === 'token' && (
              <button
                onClick={() => setCurrentStep('request')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back to Email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
