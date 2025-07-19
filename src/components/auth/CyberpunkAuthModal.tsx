/**
 * Cyberpunk Authentication Modal - WitnessOS Portal Gateway
 *
 * Themed popup modal for login, signup, and password reset
 * Uses WitnessOS-aligned terminology and cyberpunk aesthetic
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '@/contexts/AuthContext';
import { MatrixText } from '@/components/ui/MatrixText';
import {
  AUTH_MODAL_COPY,
  type AuthMode
} from '@/utils/witnessos-ui-constants';
import { validateComponentCopy } from '@/utils/copy-validation';

interface CyberpunkAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const CyberpunkAuthModal: React.FC<CyberpunkAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { login, register } = useAuth();

  // Validate copy on component mount (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const allCopyTexts: string[] = [];
      Object.values(AUTH_MODAL_COPY).forEach(section => {
        Object.values(section).forEach(text => allCopyTexts.push(text));
      });
      validateComponentCopy('CyberpunkAuthModal', allCopyTexts);
    }
  }, []);

  // Animate modal entrance/exit
  useEffect(() => {
    if (isOpen && modalRef.current && contentRef.current) {
      gsap.fromTo(modalRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(contentRef.current,
        { scale: 0.8, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && contentRef.current) {
      gsap.to(contentRef.current, {
        scale: 0.8,
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
      gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🔐 Starting ${authMode} process...`);

      if (authMode === 'login') {
        const result = await login(email, password);
        console.log('🔐 Login result:', { success: result.success, error: result.error });

        if (result.success) {
          setSuccess(AUTH_MODAL_COPY.SUCCESS_MESSAGES.LOGIN);
          setTimeout(() => {
            onAuthSuccess();
            handleClose();
          }, 1000);
        } else {
          // Provide more specific error messages
          const errorMessage = result.error || 'Authentication failed';
          console.error('🚨 Login failed:', errorMessage);
          setError(getErrorMessage(errorMessage));
        }
      } else if (authMode === 'signup') {
        const result = await register(email, password, name);
        console.log('🔐 Registration result:', { success: result.success, error: result.error });

        if (result.success) {
          setSuccess(AUTH_MODAL_COPY.SUCCESS_MESSAGES.SIGNUP);
          setTimeout(() => {
            onAuthSuccess();
            handleClose();
          }, 1000);
        } else {
          const errorMessage = result.error || 'Registration failed';
          console.error('🚨 Registration failed:', errorMessage);
          setError(getErrorMessage(errorMessage));
        }
      } else if (authMode === 'reset') {
        // TODO: Implement password reset
        setSuccess(AUTH_MODAL_COPY.SUCCESS_MESSAGES.RESET);
      }
    } catch (err) {
      console.error('🚨 Authentication error:', err);
      setError('System error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to provide user-friendly error messages
  const getErrorMessage = (error: string): string => {
    if (error.includes('Invalid response format')) {
      return 'Connection issue. Please try again or use demo login.';
    }
    if (error.includes('Network error')) {
      return 'Network connection failed. Please check your internet.';
    }
    if (error.includes('Invalid credentials')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (error.includes('Authentication expired')) {
      return 'Session expired. Please log in again.';
    }
    if (error.includes('User already exists')) {
      return 'Account already exists. Try logging in instead.';
    }
    // Return the original error if no specific mapping found
    return error;
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('🎯 Demo Admin Login - Connecting to production backend');
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);

      const result = await login('sheshnarayan.iyer@gmail.com', 'admin123');

      if (result.success) {
        setSuccess('Demo admin access granted! Welcome to WitnessOS.');
        setTimeout(() => {
          onAuthSuccess();
          handleClose();
        }, 1500);
      } else {
        console.error('🚨 Demo login failed:', result.error);
        setError(getErrorMessage(result.error || 'Demo login failed'));
      }
    } catch (error) {
      console.error('🚨 Demo login exception:', error);
      setError('Demo login connection failed. Please check backend status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login': return AUTH_MODAL_COPY.TITLES.LOGIN;
      case 'signup': return AUTH_MODAL_COPY.TITLES.SIGNUP;
      case 'reset': return AUTH_MODAL_COPY.TITLES.RESET;
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'login': return AUTH_MODAL_COPY.SUBTITLES.LOGIN;
      case 'signup': return AUTH_MODAL_COPY.SUBTITLES.SIGNUP;
      case 'reset': return AUTH_MODAL_COPY.SUBTITLES.RESET;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-xs sm:max-w-sm mx-auto max-h-[95vh] overflow-hidden"
      >
        {/* Neon Border */}
        <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500">
          <div className="w-full h-full rounded-lg bg-black/95 backdrop-blur-xl" />
        </div>

        {/* Modal Content - Fixed overflow issues */}
        <div className="relative z-10 p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-8 px-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 tracking-wider font-mono break-words leading-tight px-1">
              <span className="text-pink-500">&gt;</span>{' '}
              <MatrixText
                text={getTitle()}
                className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                delay={200}
              />
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-mono leading-relaxed mb-2 px-2">
              <MatrixText
                text={getSubtitle()}
                delay={800}
              />
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-4" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === 'signup' && (
              <div>
                <label className="block text-cyan-400 text-sm font-mono mb-2">
                  {AUTH_MODAL_COPY.LABELS.NAME}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                  placeholder={AUTH_MODAL_COPY.PLACEHOLDERS.NAME}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-cyan-400 text-sm font-mono mb-2">
                {AUTH_MODAL_COPY.LABELS.EMAIL}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder={AUTH_MODAL_COPY.PLACEHOLDERS.EMAIL}
                required
              />
            </div>

            {authMode !== 'reset' && (
              <div>
                <label className="block text-cyan-400 text-sm font-mono mb-2">
                  {AUTH_MODAL_COPY.LABELS.PASSWORD}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                  placeholder={AUTH_MODAL_COPY.PLACEHOLDERS.PASSWORD}
                  required
                />
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded px-3 py-2 text-red-400 text-sm font-mono text-center animate-pulse">
                <span className="text-red-500">[ERROR]</span> {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/20 border border-green-500/30 rounded px-3 py-2 text-green-400 text-sm font-mono text-center">
                <span className="text-green-500">[SUCCESS]</span> {success}
              </div>
            )}

            {/* Submit Button - Enhanced loading state */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full relative px-6 py-2 font-mono font-bold text-sm tracking-wider transition-all duration-300
                ${
                  !isSubmitting
                    ? 'text-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'text-gray-400 bg-gray-800 cursor-not-allowed animate-pulse'
                }
              `}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
              }}
            >
              {isSubmitting && (
                <span className="inline-block animate-spin mr-2">⟳</span>
              )}
              {isSubmitting ? 'CONNECTING...' :
               authMode === 'login' ? AUTH_MODAL_COPY.BUTTONS.LOGIN :
               authMode === 'signup' ? AUTH_MODAL_COPY.BUTTONS.SIGNUP : AUTH_MODAL_COPY.BUTTONS.RESET}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="mt-4 text-center space-y-2">
            {authMode === 'login' && (
              <>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-mono transition-colors"
                >
                  {AUTH_MODAL_COPY.LINK_TEXT.TO_SIGNUP}
                </button>
                <br />
                <button
                  onClick={() => setAuthMode('reset')}
                  className="text-purple-400 hover:text-purple-300 text-xs font-mono transition-colors"
                >
                  {AUTH_MODAL_COPY.LINK_TEXT.TO_RESET}
                </button>
              </>
            )}
            {authMode !== 'login' && (
              <button
                onClick={() => setAuthMode('login')}
                className="text-cyan-400 hover:text-cyan-300 text-xs font-mono transition-colors"
              >
                {AUTH_MODAL_COPY.LINK_TEXT.TO_LOGIN}
              </button>
            )}
          </div>

          {/* Demo Admin Login Button */}
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <button
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className={`
                w-full px-4 py-2 font-mono text-xs tracking-wider transition-all duration-300 transform
                ${
                  !isSubmitting
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed animate-pulse'
                }
              `}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)',
              }}
            >
              {isSubmitting && (
                <span className="inline-block animate-spin mr-2">⟳</span>
              )}
              {isSubmitting ? 'CONNECTING TO PROD...' : '🎯 DEMO_ADMIN.login'}
            </button>
            <p className="text-gray-400 text-xs font-mono mt-2 text-center">
              // Production admin: sheshnarayan.iyer@gmail.com
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xl font-mono">×</span>
          </button>
        </div>
      </div>

      {/* Cyberpunk Effects CSS */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default CyberpunkAuthModal;
