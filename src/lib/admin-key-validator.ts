/**
 * Admin API Key Validation Middleware for WitnessOS
 * 
 * Provides enhanced validation for admin API keys with elevated privileges
 * and audit logging for admin actions.
 */

import { APIKeyManager } from './api-key-manager';

export interface AdminAPIKeyValidation {
  isValid: boolean;
  isAdminKey: boolean;
  adminPrivileges: string[];
  user: any;
  rateLimits: {
    per_minute: number;
    per_hour: number;
    per_day: number;
  };
  error?: string;
}

export interface AdminPrivilegeCheck {
  hasPrivilege: boolean;
  requiredPrivilege: string;
  userPrivileges: string[];
  error?: string;
}

/**
 * Admin privilege types for elevated access
 */
export type AdminPrivilege = 
  | 'admin:user_management:read'
  | 'admin:user_management:write'
  | 'admin:analytics:system:read'
  | 'admin:engines:admin:access'
  | 'admin:cache:management'
  | 'admin:system:monitoring'
  | 'admin:api:rate_limit:bypass'
  | 'admin:debug:access'
  | 'admin:forecast:admin'
  | 'admin:integration:management';

export class AdminKeyValidator {
  constructor(
    private db: D1Database,
    private kv: KVNamespace
  ) {}

  /**
   * Validate admin API key and return admin context
   */
  async validateAdminAPIKey(apiKey: string): Promise<AdminAPIKeyValidation> {
    try {
      // Check if key has admin prefix
      const isAdminKey = APIKeyManager.isAdminAPIKey(apiKey);
      
      if (!isAdminKey) {
        return {
          isValid: false,
          isAdminKey: false,
          adminPrivileges: [],
          user: null,
          rateLimits: { per_minute: 0, per_hour: 0, per_day: 0 },
          error: 'Not an admin API key'
        };
      }

      // Validate the admin key
      const keyHash = await APIKeyManager.hashKey(apiKey);
      const keyRecord = await this.db.prepare(`
        SELECT ak.*, u.id as user_id, u.email, u.is_admin 
        FROM api_keys ak 
        JOIN users u ON ak.user_id = u.id 
        WHERE ak.key_hash = ? AND ak.is_active = true
      `).bind(keyHash).first();

      if (!keyRecord) {
        return {
          isValid: false,
          isAdminKey: true,
          adminPrivileges: [],
          user: null,
          rateLimits: { per_minute: 0, per_hour: 0, per_day: 0 },
          error: 'Invalid admin API key'
        };
      }

      // Verify user is actually admin
      if (!keyRecord.is_admin) {
        return {
          isValid: false,
          isAdminKey: true,
          adminPrivileges: [],
          user: null,
          rateLimits: { per_minute: 0, per_hour: 0, per_day: 0 },
          error: 'User is not an admin'
        };
      }

      // Extract admin privileges from scopes
      const scopes = JSON.parse(keyRecord.scopes || '[]');
      const adminPrivileges = scopes.filter((scope: string) => scope.startsWith('admin:'));

      // Log admin API usage
      await this.logAdminAPIUsage(keyRecord.id, keyRecord.user_id, apiKey);

      return {
        isValid: true,
        isAdminKey: true,
        adminPrivileges,
        user: {
          id: keyRecord.user_id,
          email: keyRecord.email,
          is_admin: keyRecord.is_admin
        },
        rateLimits: {
          per_minute: keyRecord.rate_limit_per_minute || 5000,
          per_hour: keyRecord.rate_limit_per_hour || 50000,
          per_day: keyRecord.rate_limit_per_day || 500000
        }
      };

    } catch (error) {
      console.error('Admin API key validation error:', error);
      return {
        isValid: false,
        isAdminKey: false,
        adminPrivileges: [],
        user: null,
        rateLimits: { per_minute: 0, per_hour: 0, per_day: 0 },
        error: 'Validation failed'
      };
    }
  }

  /**
   * Check if admin key has specific privilege
   */
  checkAdminPrivilege(
    validation: AdminAPIKeyValidation, 
    requiredPrivilege: AdminPrivilege
  ): AdminPrivilegeCheck {
    if (!validation.isValid || !validation.isAdminKey) {
      return {
        hasPrivilege: false,
        requiredPrivilege,
        userPrivileges: [],
        error: 'Invalid admin key'
      };
    }

    const hasPrivilege = validation.adminPrivileges.includes(requiredPrivilege);
    
    return {
      hasPrivilege,
      requiredPrivilege,
      userPrivileges: validation.adminPrivileges,
      error: hasPrivilege ? undefined : `Missing required privilege: ${requiredPrivilege}`
    };
  }

  /**
   * Log admin API key usage for audit trail
   */
  private async logAdminAPIUsage(
    keyId: string, 
    userId: number, 
    apiKey: string,
    endpoint?: string,
    action?: string
  ): Promise<void> {
    try {
      const auditLog = {
        timestamp: new Date().toISOString(),
        key_id: keyId,
        user_id: userId,
        key_prefix: apiKey.substring(0, 15) + '...',
        endpoint: endpoint || 'unknown',
        action: action || 'api_access',
        ip_address: 'unknown', // Would be populated by request context
        user_agent: 'unknown'  // Would be populated by request context
      };

      // Store in KV for quick access and D1 for permanent record
      await this.kv.put(
        `admin_audit:${keyId}:${Date.now()}`, 
        JSON.stringify(auditLog),
        { expirationTtl: 86400 * 30 } // 30 days
      );

      // Also log to console for immediate visibility
      console.log('🔐 Admin API Key Usage:', {
        user_id: userId,
        key_id: keyId,
        endpoint,
        timestamp: auditLog.timestamp
      });

    } catch (error) {
      console.error('Failed to log admin API usage:', error);
    }
  }

  /**
   * Get admin API usage statistics
   */
  async getAdminUsageStats(keyId: string, days: number = 7): Promise<any> {
    try {
      const keys = await this.kv.list({ prefix: `admin_audit:${keyId}:` });
      const logs = await Promise.all(
        keys.keys.map(async (key) => {
          const data = await this.kv.get(key.name);
          return data ? JSON.parse(data) : null;
        })
      );

      const validLogs = logs.filter(log => log !== null);
      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const recentLogs = validLogs.filter(log => new Date(log.timestamp) > cutoffDate);

      return {
        total_requests: recentLogs.length,
        unique_endpoints: [...new Set(recentLogs.map(log => log.endpoint))].length,
        first_request: recentLogs.length > 0 ? recentLogs[0].timestamp : null,
        last_request: recentLogs.length > 0 ? recentLogs[recentLogs.length - 1].timestamp : null,
        endpoints: recentLogs.reduce((acc, log) => {
          acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Failed to get admin usage stats:', error);
      return null;
    }
  }
}

/**
 * Middleware factory for requiring admin privileges
 */
export function requireAdminPrivilege(privilege: AdminPrivilege) {
  return async (request: Request, adminValidator: AdminKeyValidator) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        error: 'Missing authorization header',
        status: 401 
      };
    }

    const apiKey = authHeader.substring(7);
    const validation = await adminValidator.validateAdminAPIKey(apiKey);
    
    if (!validation.isValid) {
      return { 
        success: false, 
        error: validation.error || 'Invalid API key',
        status: 401 
      };
    }

    const privilegeCheck = adminValidator.checkAdminPrivilege(validation, privilege);
    if (!privilegeCheck.hasPrivilege) {
      return { 
        success: false, 
        error: privilegeCheck.error || 'Insufficient privileges',
        status: 403 
      };
    }

    return { 
      success: true, 
      adminContext: validation,
      privilegeCheck 
    };
  };
}
