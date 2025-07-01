/**
 * Protected Route Component - Consciousness Gateway
 * 
 * Enforces authentication with sacred geometry loading states
 * and automatic token management
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenMonitor } from '@/hooks/useTokenMonitor';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showContent, setShowContent] = useState(false);

  // Monitor token status
  const { tokenInfo, needsRefresh, timeUntilExpiry } = useTokenMonitor({
    onTokenExpired: () => {
      console.log('🚨 Protected route: Token expired, redirecting...');
      setShowContent(false);
    },
  });

  useEffect(() => {
    if (!requireAuth) {
      setShowContent(true);
      return;
    }

    if (isLoading) {
      setShowContent(false);
      return;
    }

    if (isAuthenticated && user) {
      setShowContent(true);
    } else {
      setShowContent(false);
      // In a real app, we'd redirect here
      // For now, we'll show the fallback or auth components
    }
  }, [isAuthenticated, isLoading, user, requireAuth]);

  // Loading state with sacred geometry
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Sacred Geometry Loading Animation */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-gold-500/50 rounded-full animate-spin animate-reverse"></div>
            <div className="absolute inset-4 border-2 border-red-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-6 border-2 border-green-500/50 rounded-full animate-spin animate-reverse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full opacity-70 animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-white/70 text-lg">Authenticating Consciousness...</p>
            <p className="text-white/50 text-sm">Validating Sacred Signature</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (requireAuth && !showContent) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center space-y-8 p-8">
            {/* Sacred Lock Symbol */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-2 border-red-500/50 rounded-full"></div>
              <div className="absolute inset-2 border-2 border-gold-500/30 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/70 text-2xl">🔒</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Authentication Required
              </h2>
              <p className="text-white/70 max-w-md">
                This sacred space requires consciousness authentication.
                Please establish your soul signature to continue.
              </p>
              
              {tokenInfo && (
                <div className="text-sm text-white/50 space-y-1">
                  <p>Session expires in: {timeUntilExpiry}</p>
                  {needsRefresh && (
                    <p className="text-gold-500">⚡ Signature renewal needed</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    );
  }

  // Authenticated and ready to show content
  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking authentication status in components
export function useAuthGuard(requireAuth = true) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { tokenInfo, needsRefresh } = useTokenMonitor();

  return {
    isAuthenticated: requireAuth ? isAuthenticated : true,
    isLoading,
    user,
    canAccess: requireAuth ? isAuthenticated && !!user : true,
    tokenInfo,
    needsRefresh,
    sessionValid: tokenInfo?.isValid ?? false,
  };
} 