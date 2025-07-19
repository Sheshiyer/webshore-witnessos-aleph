/**
 * Connection Manager for WitnessOS
 *
 * Handles network connectivity issues gracefully during boot sequence
 * Provides fallback mechanisms and retry logic for API connections
 */

import { apiHealthChecker, type HealthCheckResult } from './api-health-checker';

export interface ConnectionState {
  isOnline: boolean;
  isBackendReachable: boolean;
  lastSuccessfulConnection: Date | null;
  retryCount: number;
  error: string | null;
  mode: 'production' | 'offline' | 'fallback';
}

export interface ConnectionManagerOptions {
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: number;
  enableOfflineMode: boolean;
}

class ConnectionManager {
  private state: ConnectionState = {
    isOnline: navigator.onLine,
    isBackendReachable: false,
    lastSuccessfulConnection: null,
    retryCount: 0,
    error: null,
    mode: 'production',
  };

  private options: ConnectionManagerOptions = {
    maxRetries: 3,
    retryDelay: 2000,
    healthCheckInterval: 30000,
    enableOfflineMode: true,
  };

  private listeners: Array<(state: ConnectionState) => void> = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(options?: Partial<ConnectionManagerOptions>) {
    this.options = { ...this.options, ...options };
    this.setupNetworkListeners();
  }

  // Setup browser network event listeners
  private setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  private handleOnline() {
    console.log('🌐 Browser came online');
    this.updateState({ isOnline: true, error: null });
    this.checkBackendConnection();
  }

  private handleOffline() {
    console.log('📴 Browser went offline');
    this.updateState({ 
      isOnline: false, 
      isBackendReachable: false,
      error: 'Browser is offline',
      mode: 'offline'
    });
  }

  // Update connection state and notify listeners
  private updateState(updates: Partial<ConnectionState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  }

  // Check backend connectivity with graceful failure
  async checkBackendConnection(silent: boolean = false): Promise<boolean> {
    if (!this.state.isOnline) {
      return false;
    }

    try {
      if (!silent) {
        console.log('🔍 Checking backend connection...');
      }

      // Use the health checker for better error analysis
      const healthResult: HealthCheckResult = await apiHealthChecker.checkHealth(5000);

      if (healthResult.isReachable) {
        this.updateState({
          isBackendReachable: true,
          lastSuccessfulConnection: new Date(),
          retryCount: 0,
          error: null,
          mode: 'production',
        });

        if (!silent) {
          console.log('✅ Backend connection successful');
        }

        return true;
      } else {
        throw new Error(healthResult.error || `Backend unhealthy: ${healthResult.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Only log connection failures in development or on first failure
      if (!silent && (process.env.NODE_ENV === 'development' || this.state.retryCount === 0)) {
        if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
          console.warn('⚠️ CORS policy blocking backend connection - using offline mode');
        } else if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
          console.warn('⚠️ Network error connecting to backend - using offline mode');
        } else {
          console.warn('⚠️ Backend connection failed:', errorMessage);
        }
      }

      // Only update error state if we haven't exceeded max retries
      if (this.state.retryCount < this.options.maxRetries) {
        this.updateState({
          isBackendReachable: false,
          retryCount: this.state.retryCount + 1,
          error: errorMessage,
          mode: this.options.enableOfflineMode ? 'offline' : 'fallback',
        });

        // Schedule retry
        this.scheduleRetry();
      } else {
        this.updateState({
          isBackendReachable: false,
          error: `Max retries exceeded: ${errorMessage}`,
          mode: this.options.enableOfflineMode ? 'offline' : 'fallback',
        });
      }

      return false;
    }
  }

  // Schedule a retry attempt
  private scheduleRetry() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    const delay = this.options.retryDelay * Math.pow(2, this.state.retryCount - 1); // Exponential backoff
    
    this.retryTimeout = setTimeout(() => {
      console.log(`🔄 Retrying backend connection (attempt ${this.state.retryCount + 1}/${this.options.maxRetries})`);
      this.checkBackendConnection();
    }, delay);
  }

  // Start periodic health checks
  startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.checkBackendConnection(true); // Silent health check
    }, this.options.healthCheckInterval);
  }

  // Stop periodic health checks
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Subscribe to connection state changes
  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current connection state
  getState(): ConnectionState {
    return { ...this.state };
  }

  // Force a connection check
  async forceCheck(): Promise<boolean> {
    this.updateState({ retryCount: 0, error: null });
    return this.checkBackendConnection();
  }

  // Reset connection state
  reset() {
    this.updateState({
      isBackendReachable: false,
      lastSuccessfulConnection: null,
      retryCount: 0,
      error: null,
      mode: 'production',
    });
  }

  // Cleanup
  destroy() {
    this.stopHealthChecks();
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }

    this.listeners = [];
  }

  // Check if we should show offline UI
  shouldShowOfflineMode(): boolean {
    return !this.state.isOnline || (!this.state.isBackendReachable && this.state.mode === 'offline');
  }

  // Check if we can make API requests
  canMakeRequests(): boolean {
    return this.state.isOnline && this.state.isBackendReachable;
  }

  // Get user-friendly status message
  getStatusMessage(): string {
    if (!this.state.isOnline) {
      return 'No internet connection';
    }
    
    if (!this.state.isBackendReachable) {
      if (this.state.retryCount > 0) {
        return `Backend offline (retrying ${this.state.retryCount}/${this.options.maxRetries})`;
      }
      return 'Backend temporarily unavailable';
    }
    
    return 'Connected';
  }
}

// Create singleton instance
export const connectionManager = new ConnectionManager({
  maxRetries: 3,
  retryDelay: 2000,
  healthCheckInterval: 30000,
  enableOfflineMode: true,
});

// Export types and utilities
export type { ConnectionState, ConnectionManagerOptions };
export default ConnectionManager;
