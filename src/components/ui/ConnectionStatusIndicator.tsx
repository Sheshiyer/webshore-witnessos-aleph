/**
 * Connection Status Indicator for WitnessOS
 * 
 * Shows connection status during boot sequence and throughout the app
 * Provides graceful handling of network failures
 */

'use client';

import React, { useState, useEffect } from 'react';
import { connectionManager, type ConnectionState } from '@/utils/connection-manager';
import { UI_COPY } from '@/utils/witnessos-ui-constants';

interface ConnectionStatusIndicatorProps {
  showDuringBoot?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  onConnectionRestored?: () => void;
  onConnectionLost?: () => void;
}

export default function ConnectionStatusIndicator({
  showDuringBoot = true,
  position = 'top-right',
  onConnectionRestored,
  onConnectionLost
}: ConnectionStatusIndicatorProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>(connectionManager.getState());
  const [isVisible, setIsVisible] = useState(false);
  const [lastConnectionState, setLastConnectionState] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure this only renders on client to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((state) => {
      setConnectionState(state);
      
      // Show indicator when connection changes or during boot
      if (showDuringBoot || state.isBackendReachable !== lastConnectionState) {
        setIsVisible(true);
        
        // Auto-hide after successful connection (unless during boot)
        if (state.isBackendReachable && !showDuringBoot) {
          setTimeout(() => setIsVisible(false), 3000);
        }
      }

      // Trigger callbacks
      if (state.isBackendReachable && !lastConnectionState) {
        onConnectionRestored?.();
      } else if (!state.isBackendReachable && lastConnectionState) {
        onConnectionLost?.();
      }

      setLastConnectionState(state.isBackendReachable);
    });

    // Start health checks
    connectionManager.startHealthChecks();

    // Initial connection check
    connectionManager.checkBackendConnection();

    return () => {
      unsubscribe();
      connectionManager.stopHealthChecks();
    };
  }, [showDuringBoot, lastConnectionState, onConnectionRestored, onConnectionLost]);

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  // Don't render if not visible
  if (!isVisible && !showDuringBoot) {
    return null;
  }

  // Get status display info
  const getStatusInfo = () => {
    if (!connectionState.isOnline) {
      return {
        icon: '📴',
        text: 'Offline',
        subtext: 'No internet connection',
        color: 'text-red-400',
        bgColor: 'bg-red-900/30',
        borderColor: 'border-red-400/50',
      };
    }

    if (connectionState.isBackendReachable) {
      return {
        icon: '🟢',
        text: 'Connected',
        subtext: 'Backend online',
        color: 'text-green-400',
        bgColor: 'bg-green-900/30',
        borderColor: 'border-green-400/50',
      };
    }

    if (connectionState.retryCount > 0) {
      return {
        icon: '🔄',
        text: 'Reconnecting',
        subtext: `Attempt ${connectionState.retryCount}/3`,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-400/50',
      };
    }

    return {
      icon: '🔴',
      text: 'Backend Offline',
      subtext: 'Running in offline mode',
      color: 'text-red-400',
      bgColor: 'bg-red-900/30',
      borderColor: 'border-red-400/50',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-auto`}>
      <div className={`
        ${statusInfo.bgColor} ${statusInfo.borderColor} 
        backdrop-blur-md border rounded-lg p-3 text-white
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        max-w-xs
      `}>
        <div className="flex items-center space-x-3">
          {/* Status Icon */}
          <div className="text-xl">
            {statusInfo.icon}
          </div>
          
          {/* Status Text */}
          <div className="flex-1">
            <div className={`font-semibold text-sm ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
            <div className="text-xs text-gray-300">
              {statusInfo.subtext}
            </div>
            
            {/* Additional info during connection issues */}
            {connectionState.error && connectionState.retryCount === 0 && (
              <div className="text-xs text-gray-400 mt-1">
                {connectionState.error.length > 50 
                  ? connectionState.error.substring(0, 50) + '...'
                  : connectionState.error
                }
              </div>
            )}
          </div>

          {/* Retry Button */}
          {!connectionState.isBackendReachable && connectionState.isOnline && (
            <button
              onClick={() => connectionManager.forceCheck()}
              className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-xs transition-colors"
              disabled={connectionState.retryCount > 0}
            >
              {connectionState.retryCount > 0 ? 'Retrying...' : 'Retry'}
            </button>
          )}
        </div>

        {/* Progress bar for retries */}
        {connectionState.retryCount > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(connectionState.retryCount / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Last successful connection time */}
        {connectionState.lastSuccessfulConnection && !connectionState.isBackendReachable && (
          <div className="text-xs text-gray-400 mt-2">
            Last connected: {connectionState.lastSuccessfulConnection.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for using connection state in components
export function useConnectionState() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(connectionManager.getState());

  useEffect(() => {
    const unsubscribe = connectionManager.subscribe(setConnectionState);
    return unsubscribe;
  }, []);

  return {
    connectionState,
    isOnline: connectionState.isOnline,
    isBackendReachable: connectionState.isBackendReachable,
    canMakeRequests: connectionManager.canMakeRequests(),
    shouldShowOfflineMode: connectionManager.shouldShowOfflineMode(),
    statusMessage: connectionManager.getStatusMessage(),
    forceCheck: () => connectionManager.forceCheck(),
    reset: () => connectionManager.reset(),
  };
}

// Offline mode banner component
export function OfflineModeBanner() {
  const { shouldShowOfflineMode, statusMessage, forceCheck } = useConnectionState();
  const [isClient, setIsClient] = useState(false);

  // Ensure this only renders on client to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  if (!shouldShowOfflineMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-900/90 backdrop-blur-md border-b border-yellow-400/50 p-2">
      <div className="flex items-center justify-center space-x-4 text-yellow-200">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400">⚠️</span>
          <span className="text-sm font-medium">
            {statusMessage} - Some features may be limited
          </span>
        </div>
        <button
          onClick={forceCheck}
          className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
