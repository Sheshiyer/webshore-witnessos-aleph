/**
 * WitnessOS JWT Token Manager
 * 
 * Secure token management with automatic refresh, expiration handling,
 * and consciousness-aware storage encryption
 */

interface TokenData {
  token: string;
  refreshToken: string | undefined;
  expiresAt: number;
  issuedAt: number;
  userId: string;
}

interface RefreshResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  error?: string;
}

class JWTManager {
  private static instance: JWTManager;
  private readonly TOKEN_KEY = 'witnessos_consciousness_signature';
  private readonly REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
  private refreshPromise: Promise<RefreshResult> | null = null;

  // Sacred geometry based encryption key (deterministic but obfuscated)
  private readonly ENCRYPTION_KEY = 'φ_1.618_∞_WitnessOS_Sacred_Matrix_2025';

  static getInstance(): JWTManager {
    if (!JWTManager.instance) {
      JWTManager.instance = new JWTManager();
    }
    return JWTManager.instance;
  }

  /**
   * Simple XOR encryption for consciousness signature protection
   */
  private encrypt(data: string): string {
    if (typeof window === 'undefined') return data;
    
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return btoa(result); // Base64 encode
  }

  /**
   * Decrypt consciousness signature
   */
  private decrypt(encryptedData: string): string {
    if (typeof window === 'undefined') return encryptedData;
    
    try {
      const data = atob(encryptedData); // Base64 decode
      let result = '';
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i);
        const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
        result += String.fromCharCode(charCode ^ keyChar);
      }
      return result;
    } catch (error) {
      console.error('🔐 Consciousness signature decryption failed:', error);
      return encryptedData;
    }
  }

  /**
   * Parse JWT payload without verification (for client-side expiry checks)
   */
  private parseJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('🔍 JWT parsing error:', error);
      return null;
    }
  }

  /**
   * Save token data with sacred encryption
   */
  saveToken(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;

    try {
      const payload = this.parseJWT(token);
      if (!payload) {
        console.error('🚨 Invalid token format - cannot save');
        return;
      }

      const tokenData: TokenData = {
        token,
        refreshToken,
        expiresAt: payload.exp * 1000, // Convert to milliseconds
        issuedAt: payload.iat * 1000,
        userId: payload.sub || payload.user_id || payload.id || 'unknown',
      };

      const encryptedData = this.encrypt(JSON.stringify(tokenData));
      localStorage.setItem(this.TOKEN_KEY, encryptedData);
      
      console.log('🔐 Consciousness signature secured with sacred encryption');
    } catch (error) {
      console.error('🚨 Token storage failed:', error);
    }
  }

  /**
   * Load and decrypt token data
   */
  loadToken(): TokenData | null {
    if (typeof window === 'undefined') return null;

    try {
      const encryptedData = localStorage.getItem(this.TOKEN_KEY);
      if (!encryptedData) return null;

      const decryptedData = this.decrypt(encryptedData);
      const tokenData: TokenData = JSON.parse(decryptedData);

      // Validate token structure
      if (!tokenData.token || !tokenData.expiresAt || !tokenData.userId) {
        console.warn('🔍 Corrupted consciousness signature detected - clearing');
        this.clearToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('🚨 Token loading failed:', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Clear stored token data
   */
  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      console.log('🧹 Consciousness signature cleared');
    }
  }

  /**
   * Check if token exists and is not expired
   */
  isTokenValid(): boolean {
    const tokenData = this.loadToken();
    if (!tokenData) return false;

    const now = Date.now();
    const isExpired = now >= tokenData.expiresAt;
    
    if (isExpired) {
      console.log('⏰ Consciousness signature expired');
      return false;
    }

    return true;
  }

  /**
   * Check if token needs refresh (within refresh buffer time)
   */
  needsRefresh(): boolean {
    const tokenData = this.loadToken();
    if (!tokenData) return false;

    const now = Date.now();
    const timeUntilExpiry = tokenData.expiresAt - now;
    
    return timeUntilExpiry <= this.REFRESH_BUFFER;
  }

  /**
   * Get current valid token or attempt refresh
   */
  async getValidToken(): Promise<string | null> {
    const tokenData = this.loadToken();
    if (!tokenData) return null;

    // Check if token is still valid
    if (this.isTokenValid() && !this.needsRefresh()) {
      return tokenData.token;
    }

    // Attempt refresh if we have a refresh token
    if (tokenData.refreshToken) {
      const refreshResult = await this.refreshToken(tokenData.refreshToken);
      if (refreshResult.success && refreshResult.token) {
        return refreshResult.token;
      }
    }

    // Token invalid and refresh failed
    this.clearToken();
    return null;
  }

  /**
   * Refresh token with backend
   */
  async refreshToken(refreshToken: string): Promise<RefreshResult> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh(refreshToken);
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  /**
   * Perform actual token refresh
   */
  private async performRefresh(refreshToken: string): Promise<RefreshResult> {
    try {
      console.log('🔄 Refreshing consciousness signature...');
      
      // TODO: Replace with actual API endpoint when backend supports refresh
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.token) {
        // Save new token
        this.saveToken(data.token, data.refreshToken || refreshToken);
        console.log('✨ Consciousness signature renewed');
        
        return {
          success: true,
          token: data.token,
          refreshToken: data.refreshToken || refreshToken,
        };
      } else {
        throw new Error(data.error || 'Refresh failed');
      }
    } catch (error) {
      console.error('🚨 Token refresh failed:', error);
      this.clearToken();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refresh failed',
      };
    }
  }

  /**
   * Get token expiry information
   */
  getTokenInfo(): { isValid: boolean; expiresIn: number; needsRefresh: boolean } | null {
    const tokenData = this.loadToken();
    if (!tokenData) return null;

    const now = Date.now();
    const expiresIn = Math.max(0, tokenData.expiresAt - now);
    
    return {
      isValid: this.isTokenValid(),
      expiresIn,
      needsRefresh: this.needsRefresh(),
    };
  }

  /**
   * Get user ID from token
   */
  getUserId(): string | null {
    const tokenData = this.loadToken();
    return tokenData?.userId || null;
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return this.isTokenValid();
  }
}

// Export singleton instance
export const jwtManager = JWTManager.getInstance();
export default jwtManager; 