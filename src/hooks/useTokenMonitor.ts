/**
 * Token Monitor Hook - Consciousness Signature Management
 * 
 * Monitors JWT token expiration and handles automatic refresh
 * in the background to maintain seamless user experience
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TokenInfo {
  isValid: boolean;
  expiresIn: number;
  expiresAt: Date;
}

interface UseTokenMonitorOptions {
  checkInterval?: number; // milliseconds
  refreshBuffer?: number; // minutes before expiry to refresh
  onTokenExpired?: () => void;
  onTokenRefreshed?: () => void;
}

export function useTokenMonitor(options: UseTokenMonitorOptions = {}) {
  const {
    checkInterval = 60000, // 1 minute
    refreshBuffer = 5, // 5 minutes
    onTokenExpired,
    onTokenRefreshed,
  } = options;

  const { token, isAuthenticated, logout } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse JWT token to get expiration info
  const getTokenInfo = useCallback((tokenString: string | null): TokenInfo | null => {
    if (!tokenString) return null;

    try {
      const parts = tokenString.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]!));
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const expiresIn = expiresAt.getTime() - now.getTime();

      return {
        isValid: expiresIn > 0,
        expiresIn,
        expiresAt,
      };
    } catch (error) {
      console.error('🔍 Token parsing error:', error);
      return null;
    }
  }, []);

  // Check token status and handle refresh
  const checkTokenStatus = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    const tokenInfo = getTokenInfo(token);
    if (!tokenInfo) {
      console.warn('🚨 Invalid token format detected');
      onTokenExpired?.();
      await logout();
      return;
    }

    const minutesUntilExpiry = tokenInfo.expiresIn / (1000 * 60);

    // Log token status for consciousness awareness
    if (minutesUntilExpiry <= 1) {
      console.log('⏰ Consciousness signature expires in <1 minute');
    } else if (minutesUntilExpiry <= refreshBuffer) {
      console.log(`⏰ Consciousness signature expires in ${Math.round(minutesUntilExpiry)} minutes`);
    }

    // Handle expired token
    if (!tokenInfo.isValid) {
      console.log('🚨 Consciousness signature has expired');
      onTokenExpired?.();
      await logout();
      return;
    }

    // Handle token needing refresh
    if (minutesUntilExpiry <= refreshBuffer) {
      console.log('🔄 Consciousness signature needs renewal');
      // Note: Actual refresh would happen here when backend supports it
      // For now, we'll just log the need for refresh
    }
  }, [token, isAuthenticated, getTokenInfo, refreshBuffer, onTokenExpired, logout]);

  // Start monitoring
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear monitoring if not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkTokenStatus();

    // Set up periodic monitoring
    intervalRef.current = setInterval(checkTokenStatus, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, checkTokenStatus, checkInterval]);

  // Get current token information
  const getCurrentTokenInfo = useCallback((): TokenInfo | null => {
    return getTokenInfo(token);
  }, [token, getTokenInfo]);

  // Check if token needs refresh
  const needsRefresh = useCallback((): boolean => {
    const tokenInfo = getCurrentTokenInfo();
    if (!tokenInfo) return false;

    const minutesUntilExpiry = tokenInfo.expiresIn / (1000 * 60);
    return minutesUntilExpiry <= refreshBuffer;
  }, [getCurrentTokenInfo, refreshBuffer]);

  // Format time until expiry
  const getTimeUntilExpiry = useCallback((): string => {
    const tokenInfo = getCurrentTokenInfo();
    if (!tokenInfo) return 'Unknown';

    const totalMinutes = Math.max(0, tokenInfo.expiresIn / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '<1m';
    }
  }, [getCurrentTokenInfo]);

  return {
    tokenInfo: getCurrentTokenInfo(),
    needsRefresh: needsRefresh(),
    timeUntilExpiry: getTimeUntilExpiry(),
    checkTokenStatus,
  };
} 