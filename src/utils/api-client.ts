/**
 * WitnessOS API Client
 * 
 * Central API client for all consciousness engine calculations
 * Supports both TypeScript engines and remote API endpoints
 * Includes fallback mode for offline/disconnected operation
 */

import type { EngineName } from '@/types/engines';

// Environment-aware API configuration
const getApiBaseUrl = (): string => {
  const env = process.env.NODE_ENV;

  // For production builds, always use the production URL
  if (env === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.witnessos.space';
  }

  // For client-side rendering in development, always use the proxy
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }

  // For server-side rendering in development, use the direct worker URL
  return 'http://localhost:8787';
};

const API_BASE_URL = getApiBaseUrl();

// Enable TypeScript engines by default
const USE_TYPESCRIPT_ENGINES = process.env.USE_TYPESCRIPT_ENGINES !== 'false';

// Fallback mode for offline operation
let FALLBACK_MODE = false;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface EngineCalculationRequest {
  input: Record<string, any>;
  options?: {
    useCache?: boolean;
    userId?: string;
    saveProfile?: boolean;
  };
}

interface BatchCalculationRequest {
  calculations: Array<{
    engine: EngineName;
    input: Record<string, any>;
    options?: Record<string, any>;
  }>;
  options?: {
    parallel?: boolean;
    userId?: string;
  };
}

// Mock data generators for fallback mode
const generateMockEngineData = (engineName: EngineName, input: Record<string, any>): any => {
  const mockData: Record<EngineName, any> = {
    numerology: {
      lifePathNumber: Math.floor(Math.random() * 9) + 1,
      expressionNumber: Math.floor(Math.random() * 9) + 1,
      soulUrgeNumber: Math.floor(Math.random() * 9) + 1,
      personalityNumber: Math.floor(Math.random() * 9) + 1,
      interpretation: "Mock numerology reading - backend disconnected",
      metadata: { consciousnessLevel: 0.6 + Math.random() * 0.3 }
    },
    human_design: {
      type: ['Manifestor', 'Generator', 'Manifesting Generator', 'Projector', 'Reflector'][Math.floor(Math.random() * 5)],
      strategy: "Mock strategy",
      authority: "Mock authority",
      profile: `${Math.floor(Math.random() * 6) + 1}/${Math.floor(Math.random() * 6) + 1}`,
      interpretation: "Mock Human Design reading - backend disconnected",
      metadata: { consciousnessLevel: 0.5 + Math.random() * 0.4 }
    },
    tarot: {
      cards: [
        { name: "The Fool", position: "past", interpretation: "Mock card reading" },
        { name: "The Magician", position: "present", interpretation: "Mock card reading" },
        { name: "The High Priestess", position: "future", interpretation: "Mock card reading" }
      ],
      spread: "three-card",
      interpretation: "Mock tarot reading - backend disconnected",
      metadata: { consciousnessLevel: 0.4 + Math.random() * 0.5 }
    },
    iching: {
      hexagram: {
        number: Math.floor(Math.random() * 64) + 1,
        name: "Mock Hexagram",
        lines: Array(6).fill(0).map(() => Math.random() > 0.5)
      },
      changing_lines: [],
      interpretation: "Mock I-Ching reading - backend disconnected",
      metadata: { consciousnessLevel: 0.3 + Math.random() * 0.6 }
    },
    enneagram: {
      type: Math.floor(Math.random() * 9) + 1,
      wing: Math.floor(Math.random() * 2) + 1,
      tritypeCore: Math.floor(Math.random() * 9) + 1,
      interpretation: "Mock Enneagram reading - backend disconnected",
      metadata: { consciousnessLevel: 0.6 + Math.random() * 0.3 }
    },
    sacred_geometry: {
      primaryShape: 'dodecahedron',
      resonanceFrequency: 432 + Math.random() * 100,
      goldenRatioAlignment: Math.random(),
      interpretation: "Mock Sacred Geometry reading - backend disconnected",
      metadata: { consciousnessLevel: 0.7 + Math.random() * 0.3 }
    },
    biorhythm: {
      physical: Math.sin(Date.now() / 86400000 * Math.PI * 2 / 23),
      emotional: Math.sin(Date.now() / 86400000 * Math.PI * 2 / 28),
      intellectual: Math.sin(Date.now() / 86400000 * Math.PI * 2 / 33),
      interpretation: "Mock Biorhythm reading - backend disconnected",
      metadata: { consciousnessLevel: 0.5 + Math.random() * 0.4 }
    },
    vimshottari: {
      currentDasha: 'Venus',
      subPeriod: 'Mars',
      remainingYears: Math.floor(Math.random() * 10) + 1,
      interpretation: "Mock Vimshottari reading - backend disconnected",
      metadata: { consciousnessLevel: 0.4 + Math.random() * 0.5 }
    },
    gene_keys: {
      lifeWork: Math.floor(Math.random() * 64) + 1,
      evolution: Math.floor(Math.random() * 64) + 1,
      radiance: Math.floor(Math.random() * 64) + 1,
      purpose: Math.floor(Math.random() * 64) + 1,
      interpretation: "Mock Gene Keys reading - backend disconnected",
      metadata: { consciousnessLevel: 0.6 + Math.random() * 0.4 }
    },
    sigil_forge: {
      sigil: "Mock sigil pattern",
      intention: input.intention || "Mock intention",
      elements: ['fire', 'water', 'earth', 'air'][Math.floor(Math.random() * 4)],
      interpretation: "Mock Sigil Forge reading - backend disconnected",
      metadata: { consciousnessLevel: 0.5 + Math.random() * 0.4 }
    },
    nadabrahman: {
      primaryTone: "OM",
      resonance: Math.random(),
      harmonics: [1, 5, 8],
      interpretation: "Mock Nada Brahman reading - backend disconnected",
      metadata: { consciousnessLevel: 0.7 + Math.random() * 0.2 }
    }
  };

  return mockData[engineName] || { 
    result: "Mock reading", 
    interpretation: "Mock reading - backend disconnected",
    metadata: { consciousnessLevel: Math.random() }
  };
};

class WitnessOSAPIClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'WitnessOS-Frontend/1.0',
    };
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Check if we're in fallback mode
   */
  isInFallbackMode(): boolean {
    return FALLBACK_MODE;
  }

  /**
   * Enable/disable fallback mode
   */
  setFallbackMode(enabled: boolean): void {
    FALLBACK_MODE = enabled;
    console.log(`🔄 API Fallback Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Make HTTP request with error handling and automatic fallback
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // If in fallback mode, return mock data immediately
    if (FALLBACK_MODE) {
      console.log('🔄 Using fallback mode for:', endpoint);
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
      
      if (endpoint.includes('/engines/') && endpoint.includes('/calculate')) {
        const engineName = endpoint.split('/engines/')[1]?.split('/')[0] as EngineName;
        const mockData = generateMockEngineData(engineName, {});
        return { success: true, data: mockData as T };
      }
      
      return {
        success: true,
        data: { message: 'Fallback mode active' } as T,
      };
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('🌐 Making request to:', url);
      console.log('🔧 Request options:', { ...options, body: options.body ? '[BODY_PRESENT]' : undefined });
      console.log('🔧 Headers:', this.defaultHeaders);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send credentials for now
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Handle 401 Unauthorized - token expired
      if (response.status === 401 && this.defaultHeaders['Authorization']) {
        console.log('🔄 Token expired, attempting refresh...');
        // Clear invalid token
        delete this.defaultHeaders['Authorization'];
        // Trigger auth context to handle token refresh
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        
        return {
          success: false,
          error: 'Authentication expired',
          message: 'Please log in again',
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          message: errorData.message || 'Request failed',
        };
      }

      const data = await response.json();
      console.log('📦 Parsed response data:', data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('🚨 API Request failed:', error);
      console.error('🚨 Error type:', typeof error);
      console.error('🚨 Error name:', (error as Error)?.name);
      console.error('🚨 Error message:', (error as Error)?.message);
      
      // Detailed error analysis
      let errorMessage = 'Unknown error';
      let shouldRetryWithFallback = false;
      
      if (error instanceof TypeError) {
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection failed - check if backend is running on port 8787';
          shouldRetryWithFallback = true;
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error - browser blocked cross-origin request';
        } else {
          errorMessage = `Network error: ${error.message}`;
          shouldRetryWithFallback = true;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          shouldRetryWithFallback = true;
        }
      }
      
      // Auto-enable fallback mode on network errors
      if (!FALLBACK_MODE && shouldRetryWithFallback) {
        console.log('🔄 Network error detected, enabling fallback mode...');
        this.setFallbackMode(true);
        return this.makeRequest<T>(endpoint, options); // Retry with fallback
      }
      
      return {
        success: false,
        error: errorMessage,
        message: 'Network request failed',
      };
    }
  }

  /**
   * Calculate using a specific consciousness engine
   */
  async calculateEngine(
    engineName: EngineName,
    input: Record<string, any>,
    options?: {
      useCache?: boolean;
      userId?: string;
      saveProfile?: boolean;
    }
  ): Promise<ApiResponse<any>> {
    const request: EngineCalculationRequest = {
      input,
      ...(options && { options }),
    };

    return this.makeRequest(`/engines/${engineName}/calculate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get engine metadata and information
   */
  async getEngineMetadata(engineName: EngineName): Promise<ApiResponse<any>> {
    return this.makeRequest(`/engines/${engineName}/metadata`);
  }

  /**
   * List all available engines
   */
  async listEngines(): Promise<ApiResponse<any>> {
    return this.makeRequest('/engines');
  }

  /**
   * Perform batch calculations across multiple engines
   */
  async batchCalculate(
    calculations: Array<{
      engine: EngineName;
      input: Record<string, any>;
      options?: Record<string, any>;
    }>,
    options?: { parallel?: boolean; userId?: string }
  ): Promise<ApiResponse<any>> {
    const request: BatchCalculationRequest = {
      calculations,
      ...(options && { options }),
    };

    return this.makeRequest('/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Execute predefined workflow patterns
   */
  async executeWorkflow(
    workflowType: 'natal' | 'career' | 'spiritual' | 'shadow' | 'relationships' | 'daily' | 'custom',
    data: Record<string, any>
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(`/workflows/${workflowType}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * AI-enhanced engine calculation
   */
  async calculateEngineWithAI(
    engineName: EngineName,
    input: Record<string, any>,
    aiConfig?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      focusArea?: string;
    }
  ): Promise<ApiResponse<any>> {
    const request = {
      input,
      aiConfig,
    };

    return this.makeRequest(`/engines/${engineName}/ai-enhanced`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * AI synthesis of multiple engine results
   */
  async synthesizeWithAI(
    results: Array<{ engine: string; data: any }>,
    userContext?: Record<string, any>,
    aiConfig?: Record<string, any>
  ): Promise<ApiResponse<any>> {
    const request = {
      results,
      userContext,
      aiConfig,
    };

    return this.makeRequest('/ai/synthesis', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * User authentication
   */
  async register(email: string, password: string, name?: string): Promise<ApiResponse<any>> {
    console.log('🔐 Starting registration for:', email);
    console.log('🔄 API Base URL:', this.baseUrl);
    console.log('🔄 Fallback Mode:', FALLBACK_MODE);
    
    try {
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      console.log('📥 Registration response:', response);

      // Backend returns 201 for successful registration with { message, user, requestId }
      if (response.success && response.data) {
        console.log('✨ User registration successful:', response.data);
        
        const data = response.data as any;
        
        // Return normalized response for AuthContext
        return {
          success: true,
          data: {
            user: data.user,
            message: data.message || 'Registration successful'
          }
        };
      } else {
        console.error('🚨 Registration failed:', response.error);
        return {
          success: false,
          error: response.error || 'Registration failed',
          message: response.message || 'Unable to create account'
        };
      }
    } catch (error) {
      console.error('🚨 Registration request failed:', error);
      return {
        success: false,
        error: 'Network error during registration',
        message: 'Please check your connection and try again',
      };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        // Backend returns { message, token, user, requestId }
        const data = response.data as any;
        const { token, user } = data;
        
        if (token) {
          this.setAuthToken(token);
          console.log('🔐 Authentication successful, token set');
          
          // Return normalized response for AuthContext
          return {
            success: true,
            data: {
              token,
              user,
              message: data.message || 'Login successful'
            }
          };
        } else {
          console.error('🚨 Login response missing token');
          return {
            success: false,
            error: 'Invalid response format',
            message: 'Authentication response incomplete'
          };
        }
      } else {
        console.error('🚨 Login failed:', response.error || response.message);
        return {
          success: false,
          error: response.error || 'Login failed',
          message: response.message || 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('🚨 Login request failed:', error);
      return {
        success: false,
        error: 'Network error during login',
        message: 'Please check your connection and try again',
      };
    }
  }

  async logout(): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest('/auth/logout', {
        method: 'POST',
      });

      // Always clear auth token, even if backend request fails
      this.clearAuthToken();
      console.log('🚪 Authentication token cleared');

      if (response.success) {
        console.log('✨ Logout successful');
        return response;
      } else {
        console.warn('⚠️ Backend logout failed, but token cleared locally');
        // Return success since local token is cleared
        return {
          success: true,
          data: { message: 'Logged out locally' }
        };
      }
    } catch (error) {
      console.error('🚨 Logout request failed:', error);
      // Still clear token locally
      this.clearAuthToken();
      return {
        success: true,
        data: { message: 'Logged out locally' }
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest('/auth/me');

      if (response.success && response.data) {
        console.log('👤 Current user retrieved successfully');
        const data = response.data as any;
        return {
          success: true,
          data: data.user || data
        };
      } else {
        console.error('🚨 Failed to get current user:', response.error);
        return response;
      }
    } catch (error) {
      console.error('🚨 Get current user request failed:', error);
      return {
        success: false,
        error: 'Network error',
        message: 'Failed to validate authentication'
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.makeRequest('/health');
  }

  /**
   * Get API base URL for external use
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Reading History Management
  async saveReading(userId: string, reading: any): Promise<{ success: boolean; readingId?: string; error?: string }> {
    const response = await this.makeRequest('/api/readings', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        reading
      })
    });

    if (response.success && response.data) {
      return { success: true, readingId: (response.data as any).readingId };
    } else {
      return { 
        success: false, 
        error: response.error || 'Failed to save reading' 
      };
    }
  }

  async getReadingHistory(userId: string, options?: {
    limit?: number;
    timeRange?: string;
  }): Promise<{ success: boolean; readings?: any[]; total?: number; error?: string }> {
    const params = new URLSearchParams({
      userId,
      limit: (options?.limit || 10).toString(),
      timeRange: options?.timeRange || '30d'
    });

    const response = await this.makeRequest(`/api/readings/history?${params.toString()}`);

    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: data.success,
        readings: data.readings,
        total: data.total
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to get reading history'
      };
    }
  }

  async getReading(readingId: string): Promise<{ success: boolean; reading?: any; error?: string }> {
    const response = await this.makeRequest(`/api/readings/${readingId}`);

    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: data.success,
        reading: data.reading
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to get reading'
      };
    }
  }

  async deleteReading(readingId: string, authToken?: string): Promise<{ success: boolean; error?: string }> {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await this.makeRequest(`/api/readings/${readingId}`, {
      method: 'DELETE',
      headers
    });

    if (response.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to delete reading'
      };
    }
  }

  async toggleFavorite(readingId: string, authToken?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await this.makeRequest(`/api/readings/${readingId}/favorite`, {
      method: 'PUT',
      headers
    });

    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: true,
        message: data.message
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to toggle favorite'
      };
    }
  }

  // Correlation and Insights
  async getReadingCorrelations(userId: string, options?: {
    limit?: number;
    timeRange?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const params = new URLSearchParams({
      userId,
      limit: (options?.limit || 10).toString(),
      timeRange: options?.timeRange || '30d'
    });

    const response = await this.makeRequest(`/api/readings/correlation?${params.toString()}`);

    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: data.success,
        data: data.data
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to get reading correlations'
      };
    }
  }

  async getConsciousnessInsights(userId: string, options?: {
    type?: string;
    timeRange?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const params = new URLSearchParams({
      userId,
      type: options?.type || 'comprehensive',
      timeRange: options?.timeRange || '90d'
    });

    const response = await this.makeRequest(`/api/readings/insights?${params.toString()}`);

    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: data.success,
        data: data.data
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to get consciousness insights'
      };
    }
  }

  /**
   * Upload consciousness profile to cloud storage
   */
  async uploadConsciousnessProfile(profile: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/consciousness-profile', {
      method: 'POST',
      body: JSON.stringify({ profile }),
    });
  }

  /**
   * Download consciousness profile from cloud storage
   */
  async downloadConsciousnessProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/consciousness-profile');
  }

  /**
   * Delete consciousness profile from cloud storage
   */
  async deleteConsciousnessProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/consciousness-profile', {
      method: 'DELETE',
    });
  }

  /**
   * Test backend connection and authentication
   */
  async testConnection(): Promise<{ success: boolean; authenticated: boolean; error?: string }> {
    try {
      // Test basic connection
      const healthResponse = await this.healthCheck();
      if (!healthResponse.success) {
        return {
          success: false,
          authenticated: false,
          error: 'Backend connection failed'
        };
      }

      // Test authentication if token exists
      let authenticated = false;
      if (this.defaultHeaders['Authorization']) {
        const userResponse = await this.getCurrentUser();
        authenticated = userResponse.success;
      }

      console.log(`🔗 Backend connection: ${healthResponse.success ? 'OK' : 'FAILED'}`);
      console.log(`🔐 Authentication: ${authenticated ? 'VALID' : 'NONE/INVALID'}`);

      return {
        success: true,
        authenticated,
      };
    } catch (error) {
      console.error('🚨 Connection test failed:', error);
      return {
        success: false,
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const apiClient = new WitnessOSAPIClient();
export default apiClient;
