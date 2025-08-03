# WitnessOS Admin API Key System Design

## 🎯 Overview

Design and implementation plan for extending the existing WitnessOS API key system to support admin-specific functionality and elevated access patterns. This system will allow the backend to recognize admin API calls and provide appropriate elevated access.

## 🏗️ Current System Analysis

### **Existing API Key Infrastructure**
- **APIKeyManager Class:** Complete CRUD operations for API keys
- **Database Schema:** `api_keys` table with scopes, rate limits, and user association
- **Authentication:** JWT-based user authentication with admin validation
- **Scopes System:** Granular permissions for different engine access levels
- **Rate Limiting:** Configurable per-minute, per-hour, per-day limits

### **Current Admin Detection**
- **JWT Tokens:** Include `is_admin` boolean in payload
- **Database:** `users` table has admin status tracking
- **Auth Service:** `validateAdminToken()` method for admin verification
- **Admin User:** `sheshnarayan.iyer@gmail.com` with known admin status

## 🔧 Admin API Key System Design

### **1. Admin-Specific API Key Generation**

#### **Enhanced API Key Format**
```typescript
// Current format: wos_live_abc123... or wos_test_abc123...
// New admin format: wos_admin_live_abc123... or wos_admin_test_abc123...

interface AdminAPIKey extends APIKey {
  is_admin_key: boolean;
  admin_privileges: AdminPrivilege[];
  elevated_rate_limits: {
    per_minute: number;    // 5000 vs 1000 for regular users
    per_hour: number;      // 50000 vs 10000 for regular users
    per_day: number;       // 500000 vs 100000 for regular users
  };
}
```

#### **Admin Privilege Types**
```typescript
type AdminPrivilege = 
  | 'user:management:read'      // View all user profiles
  | 'user:management:write'     // Modify user accounts
  | 'analytics:system:read'     // System-wide analytics
  | 'engines:admin:access'      // Admin-only engine features
  | 'cache:management'          // Cache invalidation and warming
  | 'system:monitoring'         // Performance and health metrics
  | 'api:rate_limit:bypass'     // Bypass standard rate limits
  | 'debug:access'              // Debug endpoints and tools
  | 'forecast:admin'            // Admin forecast generation
  | 'integration:management';   // Manage external integrations
```

### **2. Database Schema Extensions**

#### **API Keys Table Updates**
```sql
-- Add admin-specific columns to existing api_keys table
ALTER TABLE api_keys ADD COLUMN is_admin_key BOOLEAN DEFAULT FALSE;
ALTER TABLE api_keys ADD COLUMN admin_privileges TEXT; -- JSON array
ALTER TABLE api_keys ADD COLUMN elevated_rate_limits TEXT; -- JSON object

-- Create index for admin key lookups
CREATE INDEX idx_api_keys_admin ON api_keys(is_admin_key, is_active);
```

#### **Admin API Key Audit Table**
```sql
CREATE TABLE admin_api_key_audit (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'created', 'used', 'privilege_granted', 'privilege_revoked'
    privilege TEXT,       -- Specific privilege if applicable
    endpoint TEXT,        -- API endpoint accessed
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,        -- JSON additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **3. APIKeyManager Extensions**

#### **Admin Key Creation Method**
```typescript
class APIKeyManager {
  /**
   * Create admin-specific API key with elevated privileges
   */
  async createAdminAPIKey(
    adminUserId: number,
    request: CreateAdminAPIKeyRequest
  ): Promise<CreateAPIKeyResponse> {
    // Verify user is admin
    const isAdmin = await this.verifyAdminStatus(adminUserId);
    if (!isAdmin) {
      return { success: false, error: 'Admin access required' };
    }

    // Generate admin key with special prefix
    const adminKey = this.generateAdminAPIKey(request.environment);
    
    // Create key with admin privileges
    const apiKey: AdminAPIKey = {
      ...baseAPIKey,
      is_admin_key: true,
      admin_privileges: request.privileges,
      elevated_rate_limits: {
        per_minute: 5000,
        per_hour: 50000,
        per_day: 500000
      }
    };

    // Audit log
    await this.logAdminKeyCreation(adminUserId, apiKey.id, request.privileges);
    
    return { success: true, key: adminKey, plainTextKey: adminKey };
  }

  /**
   * Generate admin API key with special prefix
   */
  private generateAdminAPIKey(environment: 'live' | 'test'): string {
    const prefix = environment === 'live' ? 'wos_admin_live_' : 'wos_admin_test_';
    const keyBody = this.generateSecureKeyBody();
    return `${prefix}${keyBody}`;
  }
}
```

### **4. Admin Key Validation Middleware**

#### **Enhanced Authentication Middleware**
```typescript
interface AdminAPIKeyValidation {
  isValid: boolean;
  isAdminKey: boolean;
  adminPrivileges: AdminPrivilege[];
  user: User;
  rateLimits: ElevatedRateLimits;
}

async function validateAdminAPIKey(
  apiKey: string
): Promise<AdminAPIKeyValidation> {
  // Check if key has admin prefix
  const isAdminKey = apiKey.startsWith('wos_admin_');
  
  if (isAdminKey) {
    // Validate admin key and get privileges
    const keyData = await apiKeyManager.validateAPIKey(apiKey);
    
    if (keyData.valid && keyData.apiKey.is_admin_key) {
      // Log admin API usage
      await auditLogger.logAdminAPIUsage(keyData.apiKey.id, endpoint, request);
      
      return {
        isValid: true,
        isAdminKey: true,
        adminPrivileges: keyData.apiKey.admin_privileges,
        user: keyData.user,
        rateLimits: keyData.apiKey.elevated_rate_limits
      };
    }
  }
  
  // Fall back to regular key validation
  return await validateRegularAPIKey(apiKey);
}
```

### **5. Admin-Specific Endpoints**

#### **Admin API Routes**
```typescript
// New admin-only endpoints
app.get('/api/admin/users', requireAdminKey('user:management:read'), getUserList);
app.get('/api/admin/analytics', requireAdminKey('analytics:system:read'), getSystemAnalytics);
app.post('/api/admin/cache/invalidate', requireAdminKey('cache:management'), invalidateCache);
app.get('/api/admin/system/health', requireAdminKey('system:monitoring'), getSystemHealth);

// Enhanced existing endpoints with admin features
app.get('/api/engines/:engine', enhanceForAdmin, getEngineCalculation);
app.get('/api/forecast/generate', enhanceForAdmin, generateForecast);

/**
 * Middleware to require specific admin privilege
 */
function requireAdminKey(privilege: AdminPrivilege) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validation = await validateAdminAPIKey(req.headers.authorization);
    
    if (!validation.isAdminKey || !validation.adminPrivileges.includes(privilege)) {
      return res.status(403).json({
        error: 'Admin privilege required',
        required_privilege: privilege
      });
    }
    
    req.adminContext = validation;
    next();
  };
}
```

## 🚀 Implementation Plan

### **Phase 1: Database & Core Infrastructure (Week 1)**
1. **Database Schema Updates**
   - Add admin columns to `api_keys` table
   - Create `admin_api_key_audit` table
   - Add necessary indexes

2. **APIKeyManager Extensions**
   - Implement `createAdminAPIKey()` method
   - Add admin key validation logic
   - Create audit logging functions

### **Phase 2: Authentication & Middleware (Week 2)**
1. **Admin Key Validation**
   - Implement `validateAdminAPIKey()` function
   - Create admin privilege checking middleware
   - Add elevated rate limiting logic

2. **Security Enhancements**
   - Implement admin key audit logging
   - Add IP address and user agent tracking
   - Create admin key usage monitoring

### **Phase 3: Admin Endpoints & Features (Week 3)**
1. **Admin-Only Endpoints**
   - User management endpoints
   - System analytics endpoints
   - Cache management endpoints
   - System monitoring endpoints

2. **Enhanced Existing Endpoints**
   - Add admin context to engine calculations
   - Provide detailed debug information for admin keys
   - Enable admin-specific forecast features

### **Phase 4: Integration & Testing (Week 4)**
1. **Raycast Extension Integration**
   - Update admin key generation script
   - Test admin privileges in Raycast commands
   - Validate elevated rate limits

2. **Production Deployment**
   - Deploy admin key system to production
   - Generate admin API key for known admin user
   - Monitor admin key usage and performance

## 🔒 Security Considerations

### **Admin Key Protection**
- **Secure Generation:** Use cryptographically secure random generation
- **Audit Logging:** Log all admin key creation, usage, and privilege changes
- **Rate Limiting:** Even admin keys have elevated but not unlimited rate limits
- **Expiration:** Admin keys can have expiration dates for security

### **Privilege Escalation Prevention**
- **Explicit Privileges:** Admin keys must explicitly request specific privileges
- **Principle of Least Privilege:** Grant only necessary admin privileges
- **Regular Audits:** Monitor admin key usage for suspicious activity
- **Revocation:** Admin keys can be immediately revoked if compromised

## 📊 Success Metrics

### **Implementation Success**
- [ ] Admin API keys can be generated with specific privileges
- [ ] Admin keys are properly validated and provide elevated access
- [ ] Admin-only endpoints are accessible only with proper privileges
- [ ] Audit logging captures all admin key activities
- [ ] Raycast extension works with admin API key

### **Security Success**
- [ ] No privilege escalation vulnerabilities
- [ ] All admin activities are properly logged
- [ ] Rate limiting works correctly for admin keys
- [ ] Admin keys can be revoked and access immediately terminated

---

**Next Steps:** Begin Phase 1 implementation with database schema updates and APIKeyManager extensions.

**Timeline:** 4-week implementation with weekly milestones and continuous security review.

**Last Updated:** January 28, 2025 - Admin API key system design phase
