/**
 * WitnessOS Authentication System
 *
 * Handles user registration, login, JWT token management, and session handling
 * Built for Cloudflare Workers with D1 database
 *
 * UPDATED: Now uses the `jose` library following Cloudflare's recommended patterns
 */

import * as jose from 'jose';

// D1Database type - simplified for compatibility
interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first(): Promise<any>;
  run(): Promise<{ success: boolean; meta: { last_row_id: number } }>;
}

// JWT Implementation using jose library (Cloudflare recommended)
const encoder = new TextEncoder();

interface JWTPayload {
  sub: string; // user ID
  email: string;
  iat: number; // issued at
  exp: number; // expires
  jti: string; // JWT ID for token revocation
  is_admin: boolean; // admin flag
}

interface User {
  id: number;
  email: string;
  password_hash: string;
  name?: string;
  created_at: string;
  verified: boolean;
  preferences: any;
  is_admin: boolean;
  has_completed_onboarding: boolean;
  // Tiered onboarding completion flags
  tier1_completed: boolean; // name, email, password
  tier2_completed: boolean; // birth data (DOB, location, time)
  tier3_completed: boolean; // preferences (cards, direction, etc)
  // Birth data fields
  birth_date?: string;
  birth_time?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  birth_timezone?: string;
}

interface Session {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: string;
  device_info?: any;
}

export class AuthService {
  constructor(private db: D1Database, private jwtSecret: string = 'witnessos-jwt-secret') {}

  // Hashing for session tokens
  async hashToken(token: string): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(token));
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  // Password hashing using WebCrypto API
  private async hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // derive 256 bits (32 bytes)
    );
    
    const hashBytes = new Uint8Array(hashBuffer);
    
    // Combine salt and hash
    const combined = new Uint8Array(salt.length + hashBytes.length);
    combined.set(salt);
    combined.set(hashBytes, salt.length);
    
    // Robust Base64 encoding
    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  }

  private async verifyPassword(password: string, storedHashString: string): Promise<boolean> {
    try {
      // Robust Base64 decoding
      const binaryString = atob(storedHashString);
      const combined = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i);
      }

      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256 // derive 256 bits
      );
      
      const newHashBytes = new Uint8Array(hashBuffer);

      // Constant-time comparison for security
      if (newHashBytes.length !== storedHash.length) {
        return false;
      }
      let diff = 0;
      for (let i = 0; i < newHashBytes.length; i++) {
        diff |= newHashBytes[i] ^ storedHash[i];
      }
      return diff === 0;

    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // JWT token creation using jose library (Cloudflare recommended)
  private async createJWT(payload: JWTPayload): Promise<string> {
    // Import the secret key for HMAC signing
    const secret = encoder.encode(this.jwtSecret);

    // Create and sign JWT using jose library
    const jwt = await new jose.SignJWT({
      sub: payload.sub,
      email: payload.email,
      jti: payload.jti,
      is_admin: payload.is_admin
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(new Date(payload.exp * 1000)) // Convert Unix timestamp to Date
      .sign(secret);

    return jwt;
  }

  async verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
      // Import the secret key for HMAC verification
      const secret = encoder.encode(this.jwtSecret);

      // Verify and decode JWT using jose library
      const { payload } = await jose.jwtVerify(token, secret, {
        algorithms: ['HS256']
      });

      return payload as JWTPayload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }

  // User registration
  async register(email: string, password: string, name?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 AuthService.register called for email:', email);
      console.log('📊 Database available:', !!this.db);
      
      // Check if user already exists
      console.log('🔍 Checking if user already exists...');
      let existingUser;
      try {
        existingUser = await this.db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        console.log('✅ User existence check completed. Existing user:', !!existingUser);
      } catch (dbError) {
        console.error('❌ Database error during user existence check:', dbError);
        return { success: false, error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}` };
      }
      
      if (existingUser) {
        console.log('⚠️ User already exists:', email);
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      console.log('🔒 Hashing password...');
      let passwordHash;
      try {
        passwordHash = await this.hashPassword(password);
        console.log('✅ Password hashed successfully');
      } catch (hashError) {
        console.error('❌ Password hashing error:', hashError);
        return { success: false, error: 'Password hashing failed' };
      }

      // Create user
      console.log('👤 Creating user in database...');
      let result;
      try {
        result = await this.db.prepare(`
          INSERT INTO users (email, password_hash, name, verified, preferences)
          VALUES (?, ?, ?, ?, ?)
        `).bind(email, passwordHash, name || null, false, '{}').run();
        console.log('📝 User creation result:', { success: result.success, lastRowId: result.meta?.last_row_id });
      } catch (insertError) {
        console.error('❌ Database error during user creation:', insertError);
        return { success: false, error: `User creation failed: ${insertError instanceof Error ? insertError.message : 'Unknown database error'}` };
      }

      if (!result.success) {
        console.error('❌ User creation failed - database returned success: false');
        return { success: false, error: 'Failed to create user' };
      }

      // Get created user
      console.log('📖 Fetching created user...');
      let user;
      try {
        if (!result.meta?.last_row_id) {
          console.error('❌ No user ID returned from database');
          return { success: false, error: 'User created but no ID returned' };
        }
        user = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(result.meta.last_row_id).first() as User;
        console.log('✅ User fetched successfully:', { id: user?.id, email: user?.email });
      } catch (fetchError) {
        console.error('❌ Error fetching created user:', fetchError);
        return { success: false, error: 'User created but failed to fetch user data' };
      }
      
      console.log('🎉 User registration completed successfully for:', email);
      return { success: true, user };
    } catch (error) {
      console.error('💥 Unexpected registration error:', error);
      console.error('📍 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return { success: false, error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // User login
  async login(email: string, password: string, deviceInfo?: any): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      // Get user
      const user = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as User;
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Create JWT
      const jwtId = crypto.randomUUID();
      const payload: JWTPayload = {
        sub: user.id.toString(),
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
        jti: jwtId,
        is_admin: !!(this.isHardcodedAdmin(user.email) || user.is_admin)
      };
      
      const token = await this.createJWT(payload);

      // Create session record
      const tokenHash = await this.hashToken(token);
      const expiresAt = new Date(payload.exp * 1000).toISOString();

      console.log(`Creating session for user ${user.id}, tokenHash: ${tokenHash.substring(0, 20)}..., expires: ${expiresAt}`);

      try {
        const sessionResult = await this.db.prepare(
          'INSERT INTO user_sessions (user_id, token_hash, expires_at, device_info) VALUES (?, ?, ?, ?)'
        ).bind(user.id, tokenHash, expiresAt, JSON.stringify(deviceInfo || {})).run();

        console.log(`Session creation result:`, sessionResult);

        if (!sessionResult.success) {
          console.error('Session creation failed:', sessionResult);
          return { success: false, error: 'Failed to create session' };
        }
      } catch (sessionError) {
        console.error('Session creation error:', sessionError);
        return { success: false, error: 'Session creation failed' };
      }

      // Omit password_hash from the returned user object
      const { password_hash, ...safeUser } = user;
      
      return { success: true, token, user: safeUser as User };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Internal server error during login' };
    }
  }

  // Token validation
  async validateToken(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    const payload = await this.verifyJWT(token);
    if (!payload) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    // Check against session database
    const tokenHash = await this.hashToken(token);
    const session = await this.db.prepare('SELECT * FROM user_sessions WHERE token_hash = ?').bind(tokenHash).first();
    if (!session) {
      return { valid: false, error: 'Session not found' };
    }
    
    // Get user from database
    const user = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(payload.sub).first() as User;
    if (!user) {
      return { valid: false, error: 'User not found' };
    }
    
    const { password_hash, ...safeUser } = user;
    return { valid: true, user: safeUser as User };
  }

  // Update User Profile with Tiered Onboarding Support
  async updateUserProfile(userId: string, profileData: any): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const {
        personalData,
        birthData,
        preferences,
        hasCompletedOnboarding,
        tier1Data,
        tier2Data,
        tier3Data
      } = profileData;

      // Ensure we have something to update
      if (!personalData && !birthData && !preferences && !tier1Data && !tier2Data && !tier3Data && hasCompletedOnboarding === undefined) {
        return { success: false, error: 'No profile data provided for update' };
      }

      // Dynamically build the SET part of the query
      const fieldsToUpdate: string[] = [];
      const valuesToBind: any[] = [];

      // Handle Tier 1 data (name, email - email is immutable after registration)
      if (tier1Data?.fullName || personalData?.fullName) {
        const fullName = tier1Data?.fullName || personalData?.fullName;
        fieldsToUpdate.push('name = ?');
        valuesToBind.push(fullName);

        // Store tier1_completed in preferences since database column doesn't exist yet
        const existingResult: { preferences: string | null } | null = await this.db.prepare('SELECT preferences FROM users WHERE id = ?').bind(userId).first();
        let existingPrefs = {};
        if (existingResult && typeof existingResult.preferences === 'string') {
          existingPrefs = JSON.parse(existingResult.preferences);
        }
        existingPrefs.tier1_completed = true;

        fieldsToUpdate.push('preferences = ?');
        valuesToBind.push(JSON.stringify(existingPrefs));
      }

      // Handle Tier 2 data (birth information) - store in preferences for now
      if (tier2Data || birthData) {
        const birthInfo = tier2Data || birthData;

        // Fetch existing preferences and merge with birth data
        const existingResult: { preferences: string | null } | null = await this.db.prepare('SELECT preferences FROM users WHERE id = ?').bind(userId).first();
        let existingPrefs = {};
        if (existingResult && typeof existingResult.preferences === 'string') {
          existingPrefs = JSON.parse(existingResult.preferences);
        }

        // Add birth data to preferences
        const birthData = {
          birthDate: birthInfo.birthDate || birthInfo.date,
          birthTime: birthInfo.birthTime || birthInfo.time,
          birthLocation: birthInfo.birthLocation || birthInfo.location,
          timezone: birthInfo.timezone || 'UTC'
        };

        const newPrefs = JSON.stringify({
          ...existingPrefs,
          birthData,
          tier2_completed: true
        });

        fieldsToUpdate.push('preferences = ?');
        valuesToBind.push(newPrefs);
      }

      // Handle Tier 3 data (preferences)
      if (tier3Data || preferences) {
        const prefs = tier3Data || preferences;

        // Fetch existing preferences and merge
        const existingResult: { preferences: string | null } | null = await this.db.prepare('SELECT preferences FROM users WHERE id = ?').bind(userId).first();
        let existingPrefs = {};
        if (existingResult && typeof existingResult.preferences === 'string') {
          existingPrefs = JSON.parse(existingResult.preferences);
        }
        const newPrefs = JSON.stringify({ ...existingPrefs, ...prefs, tier3_completed: true });

        fieldsToUpdate.push('preferences = ?');
        valuesToBind.push(newPrefs);
      }

      // Handle legacy onboarding completion
      if (hasCompletedOnboarding !== undefined) {
        fieldsToUpdate.push('has_completed_onboarding = ?');
        valuesToBind.push(hasCompletedOnboarding ? 1 : 0);

        // If marking as completed, also mark all tiers as completed in preferences
        if (hasCompletedOnboarding) {
          const existingResult: { preferences: string | null } | null = await this.db.prepare('SELECT preferences FROM users WHERE id = ?').bind(userId).first();
          let existingPrefs = {};
          if (existingResult && typeof existingResult.preferences === 'string') {
            existingPrefs = JSON.parse(existingResult.preferences);
          }
          existingPrefs.tier1_completed = true;
          existingPrefs.tier2_completed = true;
          existingPrefs.tier3_completed = true;

          fieldsToUpdate.push('preferences = ?');
          valuesToBind.push(JSON.stringify(existingPrefs));
        }
      }

      if (fieldsToUpdate.length === 0) {
        return { success: false, error: 'No valid fields to update.' };
      }

      // Add updated_at timestamp
      fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');

      const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      valuesToBind.push(userId);

      const result = await this.db.prepare(sql).bind(...valuesToBind).run();

      if (!result.success) {
        return { success: false, error: 'Database update failed' };
      }

      // Return the updated user object
      const updatedUser = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first() as User;
      const { password_hash, ...safeUser } = updatedUser;

      return { success: true, user: safeUser as User };

    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Internal server error during profile update' };
    }
  }

  // User logout
  async logout(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const tokenHash = await this.hashToken(token);

      const result = await this.db.prepare('DELETE FROM user_sessions WHERE token_hash = ?').bind(tokenHash).run();
      
      if (!result || !result.success) {
        return { success: false, error: 'Failed to logout' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  // Password reset token generation
  async generatePasswordResetToken(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const user = await this.db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (!user) {
        // For development: return error when user doesn't exist
        return { success: false, error: 'User not found' };
      }

      const token = crypto.randomUUID();
      const tokenHash = await crypto.subtle.digest('SHA-256', encoder.encode(token));
      const tokenHashB64 = btoa(String.fromCharCode(...new Uint8Array(tokenHash)));

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      await this.db.prepare(`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
      `).bind((user as any).id, tokenHashB64, expiresAt).run();

      return { success: true, token };
    } catch (error) {
      console.error('Password reset token generation error:', error);
      return { success: false, error: 'Failed to generate reset token' };
    }
  }

  // Password reset
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const tokenHash = await crypto.subtle.digest('SHA-256', encoder.encode(token));
      const tokenHashB64 = btoa(String.fromCharCode(...new Uint8Array(tokenHash)));

      const resetToken = await this.db.prepare(`
        SELECT * FROM password_reset_tokens 
        WHERE token_hash = ? AND expires_at > ? AND used = FALSE
      `).bind(tokenHashB64, new Date().toISOString()).first();

      if (!resetToken) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const passwordHash = await this.hashPassword(newPassword);

      // Update password
      const updateResult = await this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .bind(passwordHash, (resetToken as any).user_id)
        .run();

      if (!updateResult || !updateResult.success) {
        return { success: false, error: 'Failed to update password' };
      }

      // Mark token as used
      await this.db.prepare('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?')
        .bind((resetToken as any).id)
        .run();

      // Invalidate all sessions for this user
      await this.db.prepare('DELETE FROM user_sessions WHERE user_id = ?')
        .bind((resetToken as any).user_id)
        .run();

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }

  // Session cleanup (remove expired sessions)
  // Note: Optimized for Cloudflare D1 without partial indexes using datetime()
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Use the expires_at index for efficient cleanup
      // The idx_user_sessions_user_expires index will help with this query
      await this.db.prepare('DELETE FROM user_sessions WHERE expires_at < ?')
        .bind(now)
        .run();

      await this.db.prepare('DELETE FROM password_reset_tokens WHERE expires_at < ?')
        .bind(now)
        .run();

      await this.db.prepare('DELETE FROM email_verification_tokens WHERE expires_at < ?')
        .bind(now)
        .run();

      console.log('✅ Expired sessions cleaned up successfully');
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  // Get active sessions count (optimized without partial index)
  async getActiveSessionsCount(userId?: string): Promise<number> {
    try {
      const now = new Date().toISOString();
      let query = 'SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > ?';
      const params = [now];

      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      const result = await this.db.prepare(query).bind(...params).first() as { count: number };
      return result?.count || 0;
    } catch (error) {
      console.error('Get active sessions count error:', error);
      return 0;
    }
  }

  // Admin functionality
  private isHardcodedAdmin(email: string): boolean {
    const adminEmails = ['sheshnarayan.iyer@gmail.com'];
    return adminEmails.includes(email.toLowerCase());
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.db.prepare('SELECT email, is_admin FROM users WHERE id = ?')
        .bind(userId)
        .first();
      
      if (!user) return false;
      
      // Check hardcoded admin or database admin flag
      return this.isHardcodedAdmin(user.email) || user.is_admin === 1;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async validateAdminToken(token: string): Promise<{ valid: boolean; user?: User; isAdmin: boolean; error?: string }> {
    const validation = await this.validateToken(token);
    
    if (!validation.valid || !validation.user) {
      return { valid: false, isAdmin: false, ...(validation.error && { error: validation.error }) };
    }

    const isAdmin = await this.isUserAdmin(validation.user.id.toString());
    
    return {
      valid: true,
      user: validation.user,
      isAdmin,
      ...(isAdmin ? {} : { error: 'Admin access required' })
    };
  }

  async promoteToAdmin(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.db.prepare('UPDATE users SET is_admin = TRUE WHERE email = ?')
        .bind(email)
        .run();
      
      return { success: result.success };
    } catch (error) {
      return { success: false, error: 'Failed to promote user to admin' };
    }
  }

  async revokeAdmin(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Prevent revoking hardcoded admin
      if (this.isHardcodedAdmin(email)) {
        return { success: false, error: 'Cannot revoke hardcoded admin privileges' };
      }

      const result = await this.db.prepare('UPDATE users SET is_admin = FALSE WHERE email = ?')
        .bind(email)
        .run();
      
      return { success: result.success };
    } catch (error) {
      return { success: false, error: 'Failed to revoke admin privileges' };
    }
  }

  async deleteUser(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Prevent deleting hardcoded admin
      if (this.isHardcodedAdmin(email)) {
        return { success: false, error: 'Cannot delete hardcoded admin account' };
      }

      // Get user ID first
      const user = await this.db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const userId = (user as any).id;

      // Delete related data in order (foreign key constraints)
      await this.db.prepare('DELETE FROM user_sessions WHERE user_id = ?').bind(userId).run();
      await this.db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').bind(userId).run();
      await this.db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').bind(userId).run();
      await this.db.prepare('DELETE FROM reading_history WHERE user_id = ?').bind(userId).run();
      await this.db.prepare('DELETE FROM readings WHERE user_id = ?').bind(userId).run();
      await this.db.prepare('DELETE FROM consciousness_profiles WHERE user_id = ?').bind(userId).run();
      
      // Finally delete the user
      const result = await this.db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
      
      return { success: result.success };
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: 'Failed to delete user account' };
    }
  }

  // Phase 1: Reading History Optimization
  // Paginated reading history with efficient filtering for 1000+ readings per user
  async getUserReadingHistory(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      timeRange?: string; // '7d', '30d', '90d', 'all'
      engineFilter?: string;
      readingType?: string;
      sortBy?: 'created_at' | 'accessed_at';
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<{
    success: boolean;
    readings?: any[];
    total?: number;
    hasMore?: boolean;
    error?: string;
  }> {
    try {
      const {
        limit = 20,
        offset = 0,
        timeRange = '30d',
        engineFilter,
        readingType,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      // Build WHERE clause conditions
      const conditions: string[] = ['r.user_id = ?'];
      const params: any[] = [userId];

      // Add time range filter
      if (timeRange !== 'all') {
        const days = parseInt(timeRange.replace('d', ''));
        conditions.push('r.created_at >= datetime("now", "-' + days + ' days")');
      }

      // Add engine filter
      if (engineFilter) {
        conditions.push('r.engines_used LIKE ?');
        params.push(`%"${engineFilter}"%`);
      }

      // Add reading type filter
      if (readingType) {
        conditions.push('r.reading_type = ?');
        params.push(readingType);
      }

      const whereClause = conditions.join(' AND ');

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM readings r
        WHERE ${whereClause}
      `;

      const countResult = await this.db.prepare(countQuery).bind(...params).first() as { total: number };
      const total = countResult?.total || 0;

      // Get paginated results with optimized query using indexes
      const dataQuery = `
        SELECT
          r.id,
          r.reading_type,
          r.engines_used,
          r.input_data,
          r.results,
          r.created_at,
          r.shared,
          r.share_token,
          MAX(rh.accessed_at) as last_accessed
        FROM readings r
        LEFT JOIN reading_history rh ON r.id = rh.reading_id
        WHERE ${whereClause}
        GROUP BY r.id
        ORDER BY r.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      params.push(limit, offset);
      const readings = await this.db.prepare(dataQuery).bind(...params).all();

      const hasMore = offset + limit < total;

      return {
        success: true,
        readings: readings || [],
        total,
        hasMore
      };

    } catch (error) {
      console.error('Get user reading history error:', error);
      return {
        success: false,
        error: 'Failed to retrieve reading history'
      };
    }
  }

  // Get reading statistics for dashboard
  async getUserReadingStats(userId: string): Promise<{
    success: boolean;
    stats?: {
      totalReadings: number;
      readingsThisMonth: number;
      favoriteEngines: string[];
      recentActivity: any[];
    };
    error?: string;
  }> {
    try {
      // Total readings count
      const totalResult = await this.db.prepare(
        'SELECT COUNT(*) as total FROM readings WHERE user_id = ?'
      ).bind(userId).first() as { total: number };

      // Readings this month
      const monthlyResult = await this.db.prepare(
        'SELECT COUNT(*) as total FROM readings WHERE user_id = ? AND created_at >= datetime("now", "start of month")'
      ).bind(userId).first() as { total: number };

      // Most used engines (top 5)
      const engineStats = await this.db.prepare(`
        SELECT engines_used, COUNT(*) as usage_count
        FROM readings
        WHERE user_id = ?
        GROUP BY engines_used
        ORDER BY usage_count DESC
        LIMIT 5
      `).bind(userId).all();

      // Recent activity (last 10 readings)
      const recentActivity = await this.db.prepare(`
        SELECT reading_type, engines_used, created_at
        FROM readings
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `).bind(userId).all();

      // Extract favorite engines from usage stats
      const favoriteEngines = engineStats.map((stat: any) => {
        try {
          const engines = JSON.parse(stat.engines_used);
          return Array.isArray(engines) ? engines[0] : engines;
        } catch {
          return stat.engines_used;
        }
      }).filter(Boolean);

      return {
        success: true,
        stats: {
          totalReadings: totalResult?.total || 0,
          readingsThisMonth: monthlyResult?.total || 0,
          favoriteEngines,
          recentActivity: recentActivity || []
        }
      };

    } catch (error) {
      console.error('Get user reading stats error:', error);
      return {
        success: false,
        error: 'Failed to retrieve reading statistics'
      };
    }
  }
}