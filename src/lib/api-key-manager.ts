/**
 * API Key Management Service for WitnessOS Developer Platform
 * 
 * Handles API key generation, validation, and management operations
 * with secure key storage and rate limiting integration.
 */

import type {
  APIKey,
  CreateAPIKeyRequest,
  CreateAPIKeyResponse,
  UpdateAPIKeyRequest,
  APIKeyScope,
  UsageStatistics,
  RateLimitStatus,
  APIKeyError
} from '@/types/api-keys';

export class APIKeyManager {
  constructor(
    private db: D1Database,
    private kv: KVNamespace
  ) {}

  /**
   * Generate a secure API key with proper format
   */
  static generateAPIKey(environment: 'live' | 'test', isAdminKey: boolean = false): string {
    const prefix = isAdminKey
      ? (environment === 'live' ? 'wos_admin_live_' : 'wos_admin_test_')
      : (environment === 'live' ? 'wos_live_' : 'wos_test_');

    // Generate 32 bytes of random data
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);

    // Convert to base64 and make URL-safe
    const keyBody = btoa(String.fromCharCode(...randomBytes))
      .replace(/[+/=]/g, '')
      .substring(0, 32);

    return `${prefix}${keyBody}`;
  }

  /**
   * Check if API key has admin prefix
   */
  static isAdminAPIKey(apiKey: string): boolean {
    return apiKey.startsWith('wos_admin_live_') || apiKey.startsWith('wos_admin_test_');
  }

  /**
   * Check if user is admin
   */
  private async isUserAdmin(userId: number): Promise<boolean> {
    try {
      const user = await this.db.prepare('SELECT is_admin FROM users WHERE id = ?').bind(userId).first();
      return user?.is_admin === 1 || user?.is_admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Hash API key for secure storage
   */
  static async hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray));
  }

  /**
   * Validate API key format
   */
  static validateKeyFormat(key: string): boolean {
    return /^wos_(live|test)_[A-Za-z0-9]{32}$/.test(key);
  }

  /**
   * Create a new API key
   */
  async createAPIKey(
    userId: number,
    request: CreateAPIKeyRequest
  ): Promise<CreateAPIKeyResponse> {
    try {
      // Check if user has reached their key limit
      const userTier = await this.getUserTier(userId);
      const currentKeyCount = await this.getUserKeyCount(userId);
      const tierLimits = this.getTierLimits(userTier);

      if (currentKeyCount >= tierLimits.maxApiKeys) {
        return {
          success: false,
          error: `Maximum API keys reached for ${userTier} tier (${tierLimits.maxApiKeys})`
        };
      }

      // Validate scopes against user tier
      const validationResult = await this.validateScopes(request.scopes, userTier);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Check if user is admin for potential admin key creation
      const isAdmin = await this.isUserAdmin(userId);
      const isAdminKey = isAdmin && request.scopes.some(scope => scope.startsWith('admin:'));

      // Generate API key (admin or regular)
      const plainTextKey = APIKeyManager.generateAPIKey(request.environment, isAdminKey);
      const keyHash = await APIKeyManager.hashKey(plainTextKey);
      const keyId = crypto.randomUUID();

      // Set rate limits (elevated for admin keys)
      const rateLimits = isAdminKey ? {
        perMinute: 5000,
        perHour: 50000,
        perDay: 500000
      } : (request.customRateLimits || {
        perMinute: tierLimits.rateLimitPerMinute,
        perHour: tierLimits.rateLimitPerHour,
        perDay: tierLimits.rateLimitPerDay
      });

      // Create API key record
      const apiKey: Omit<APIKey, 'created_at' | 'updated_at'> = {
        id: keyId,
        user_id: userId,
        key_hash: keyHash,
        key_prefix: isAdminKey
          ? (request.environment === 'live' ? 'wos_admin_live_' : 'wos_admin_test_')
          : (request.environment === 'live' ? 'wos_live_' : 'wos_test_'),
        name: request.name,
        description: request.description,
        scopes: request.scopes,
        environment: request.environment,
        rate_limit_per_minute: rateLimits.perMinute || tierLimits.rateLimitPerMinute,
        rate_limit_per_hour: rateLimits.perHour || tierLimits.rateLimitPerHour,
        rate_limit_per_day: rateLimits.perDay || tierLimits.rateLimitPerDay,
        expires_at: request.expirationDate,
        last_used_at: null,
        is_active: true
      };

      // Insert into database
      await this.db.prepare(`
        INSERT INTO api_keys (
          id, user_id, key_hash, key_prefix, name, description, scopes,
          environment, rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day,
          expires_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        keyId, userId, keyHash, apiKey.key_prefix, apiKey.name,
        apiKey.description, JSON.stringify(apiKey.scopes), apiKey.environment,
        apiKey.rate_limit_per_minute, apiKey.rate_limit_per_hour, apiKey.rate_limit_per_day,
        apiKey.expires_at, apiKey.is_active
      ).run();

      // Log audit event
      await this.logAuditEvent(userId, keyId, 'key_created', {
        name: request.name,
        environment: request.environment,
        scopes: request.scopes
      });

      // Get the created key with timestamps
      const createdKey = await this.getAPIKeyById(keyId);
      if (!createdKey) {
        throw new Error('Failed to retrieve created API key');
      }

      return {
        success: true,
        data: {
          apiKey: createdKey,
          plainTextKey // Only returned once during creation
        }
      };

    } catch (error) {
      console.error('Failed to create API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create API key'
      };
    }
  }

  /**
   * Get API key by ID
   */
  async getAPIKeyById(keyId: string): Promise<APIKey | null> {
    const result = await this.db.prepare(`
      SELECT * FROM api_keys WHERE id = ?
    `).bind(keyId).first();

    if (!result) return null;

    return {
      ...result,
      scopes: JSON.parse(result.scopes as string)
    } as APIKey;
  }

  /**
   * Get all API keys for a user
   */
  async getUserAPIKeys(userId: number): Promise<APIKey[]> {
    const results = await this.db.prepare(`
      SELECT * FROM api_keys 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all();

    return results.results.map(row => ({
      ...row,
      scopes: JSON.parse(row.scopes as string)
    })) as APIKey[];
  }

  /**
   * Update API key
   */
  async updateAPIKey(
    keyId: string,
    userId: number,
    updates: UpdateAPIKeyRequest
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify ownership
      const existingKey = await this.getAPIKeyById(keyId);
      if (!existingKey || existingKey.user_id !== userId) {
        return { success: false, error: 'API key not found' };
      }

      // Validate scopes if provided
      if (updates.scopes) {
        const userTier = await this.getUserTier(userId);
        const validationResult = await this.validateScopes(updates.scopes, userTier);
        if (!validationResult.valid) {
          return { success: false, error: validationResult.error };
        }
      }

      // Build update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(updates.name);
      }
      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(updates.description);
      }
      if (updates.scopes !== undefined) {
        updateFields.push('scopes = ?');
        updateValues.push(JSON.stringify(updates.scopes));
      }
      if (updates.customRateLimits?.perMinute !== undefined) {
        updateFields.push('rate_limit_per_minute = ?');
        updateValues.push(updates.customRateLimits.perMinute);
      }
      if (updates.customRateLimits?.perHour !== undefined) {
        updateFields.push('rate_limit_per_hour = ?');
        updateValues.push(updates.customRateLimits.perHour);
      }
      if (updates.customRateLimits?.perDay !== undefined) {
        updateFields.push('rate_limit_per_day = ?');
        updateValues.push(updates.customRateLimits.perDay);
      }
      if (updates.expirationDate !== undefined) {
        updateFields.push('expires_at = ?');
        updateValues.push(updates.expirationDate);
      }
      if (updates.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(updates.is_active);
      }

      if (updateFields.length === 0) {
        return { success: false, error: 'No updates provided' };
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(keyId);

      await this.db.prepare(`
        UPDATE api_keys 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).bind(...updateValues).run();

      // Log audit event
      await this.logAuditEvent(userId, keyId, 'key_updated', updates);

      return { success: true };

    } catch (error) {
      console.error('Failed to update API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update API key'
      };
    }
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(
    keyId: string,
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify ownership
      const existingKey = await this.getAPIKeyById(keyId);
      if (!existingKey || existingKey.user_id !== userId) {
        return { success: false, error: 'API key not found' };
      }

      // Deactivate the key
      await this.db.prepare(`
        UPDATE api_keys 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(keyId).run();

      // Clear any cached rate limit data
      await this.clearRateLimitCache(keyId);

      // Log audit event
      await this.logAuditEvent(userId, keyId, 'key_revoked', {
        name: existingKey.name
      });

      return { success: true };

    } catch (error) {
      console.error('Failed to revoke API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke API key'
      };
    }
  }

  /**
   * Helper methods
   */
  private async getUserTier(userId: number): Promise<'free' | 'pro' | 'enterprise'> {
    const user = await this.db.prepare(`
      SELECT developer_tier FROM users WHERE id = ?
    `).bind(userId).first();
    
    return (user?.developer_tier as 'free' | 'pro' | 'enterprise') || 'free';
  }

  private async getUserKeyCount(userId: number): Promise<number> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count FROM api_keys 
      WHERE user_id = ? AND is_active = true
    `).bind(userId).first();
    
    return result?.count as number || 0;
  }

  private getTierLimits(tier: 'free' | 'pro' | 'enterprise') {
    const limits = {
      free: {
        maxApiKeys: 2,
        rateLimitPerMinute: 10,
        rateLimitPerHour: 100,
        rateLimitPerDay: 1000
      },
      pro: {
        maxApiKeys: 10,
        rateLimitPerMinute: 100,
        rateLimitPerHour: 5000,
        rateLimitPerDay: 50000
      },
      enterprise: {
        maxApiKeys: 50,
        rateLimitPerMinute: 1000,
        rateLimitPerHour: 50000,
        rateLimitPerDay: 500000
      }
    };
    
    return limits[tier];
  }

  private async validateScopes(
    scopes: string[],
    userTier: 'free' | 'pro' | 'enterprise'
  ): Promise<{ valid: boolean; error?: string }> {
    // Get available scopes for user tier
    const availableScopes = await this.db.prepare(`
      SELECT scope_name FROM api_key_scopes 
      WHERE tier_required = ? OR tier_required IN (
        CASE 
          WHEN ? = 'enterprise' THEN 'pro,free'
          WHEN ? = 'pro' THEN 'free'
          ELSE ''
        END
      )
    `).bind(userTier, userTier, userTier).all();

    const validScopeNames = new Set(
      availableScopes.results.map(row => row.scope_name as string)
    );

    for (const scope of scopes) {
      if (!validScopeNames.has(scope)) {
        return {
          valid: false,
          error: `Scope '${scope}' is not available for ${userTier} tier`
        };
      }
    }

    return { valid: true };
  }

  private async logAuditEvent(
    userId: number,
    apiKeyId: string,
    action: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await this.db.prepare(`
      INSERT INTO audit_logs (user_id, api_key_id, action, details)
      VALUES (?, ?, ?, ?)
    `).bind(userId, apiKeyId, action, JSON.stringify(details)).run();
  }

  private async clearRateLimitCache(keyId: string): Promise<void> {
    // Clear rate limit buckets for this key
    const windows = ['minute', 'hour', 'day'];
    for (const window of windows) {
      await this.kv.delete(`rate_limit:${keyId}:${window}`);
    }
  }
}
