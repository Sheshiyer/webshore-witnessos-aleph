/**
 * Authentication Handler for WitnessOS API
 *
 * Handles user authentication, registration, password management,
 * and admin operations.
 */

import { BaseHandler, HandlerEnvironment, AuthResult } from '../base/base-handler';
import { AuthService } from '../../lib/auth';

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
  newPassword?: string;
  resetToken?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
  requestId: string;
}

export class AuthHandler extends BaseHandler {
  private authService: AuthService;

  constructor(env: HandlerEnvironment) {
    super(env);
    this.authService = new AuthService(env.DB);
  }

  /**
   * Main handler for authentication endpoints
   */
  async handle(request: Request, requestId?: string): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    const corsResponse = this.handleCORS(request);
    if (corsResponse) return corsResponse;

    // Route to specific auth handlers
    if (path === '/auth/register' && method === 'POST') {
      return await this.handleUserRegistration(request, requestId || this.generateRequestId());
    }

    if (path === '/auth/login' && method === 'POST') {
      return await this.handleUserLogin(request, requestId || this.generateRequestId());
    }

    if (path === '/auth/logout' && method === 'POST') {
      return await this.handleUserLogout(request, requestId || this.generateRequestId());
    }

    if (path === '/auth/me' && method === 'GET') {
      return await this.handleGetCurrentUser(request, requestId || this.generateRequestId());
    }

    if (path === '/auth/reset-password' && method === 'POST') {
      return await this.handlePasswordReset(request, requestId || this.generateRequestId());
    }

    if (path === '/auth/request-reset' && method === 'POST') {
      return await this.handlePasswordResetRequest(request, requestId || this.generateRequestId());
    }

    // Admin endpoints
    if (path.match(/^\/admin\/users\/[^\/]+$/) && method === 'DELETE') {
      const emailParam = path.split('/')[3];
      if (!emailParam) {
        return this.createErrorResponse(400, 'INVALID_EMAIL', 'Email parameter required', requestId || this.generateRequestId());
      }
      const email = decodeURIComponent(emailParam);
      return await this.handleAdminDeleteUser(email, request, requestId || this.generateRequestId());
    }

    return this.createErrorResponse(404, 'ENDPOINT_NOT_FOUND', 'Auth endpoint not found', requestId || this.generateRequestId());
  }

  /**
   * Handle user registration
   */
  private async handleUserRegistration(request: Request, requestId: string): Promise<Response> {
    try {
      console.log(`[${requestId}] Starting user registration`);

      // Parse request body
      let body: AuthRequest;
      try {
        body = await this.parseJsonBody(request) as AuthRequest;
        console.log(`[${requestId}] Request body parsed:`, {
          email: body.email ? 'provided' : 'missing',
          password: body.password ? 'provided' : 'missing',
          name: body.name ? 'provided' : 'missing'
        });
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse request body:`, parseError);
        return this.createErrorResponse(400, 'INVALID_JSON', 'Invalid JSON in request body', requestId);
      }

      const { email, password, name } = body;

      // Validate required fields
      if (!email || !password) {
        console.log(`[${requestId}] Missing required fields - email: ${!!email}, password: ${!!password}`);
        return this.createErrorResponse(400, 'MISSING_FIELDS', 'Email and password are required', requestId);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log(`[${requestId}] Invalid email format: ${email}`);
        return this.createErrorResponse(400, 'INVALID_EMAIL', 'Invalid email format', requestId);
      }

      // Validate password length
      if (password.length < 6) {
        console.log(`[${requestId}] Password too short: ${password.length} characters`);
        return this.createErrorResponse(400, 'WEAK_PASSWORD', 'Password must be at least 6 characters long', requestId);
      }

      console.log(`[${requestId}] Calling authService.register for email: ${email}`);

      // Attempt registration
      const result = await this.authService.register(email, password, name);

      console.log(`[${requestId}] Registration result:`, {
        success: result.success,
        error: result.error,
        hasUser: !!result.user
      });

      if (!result.success) {
        console.error(`[${requestId}] Registration failed:`, result.error);
        return this.createErrorResponse(400, 'REGISTRATION_FAILED', result.error || 'Registration failed', requestId);
      }

      console.log(`[${requestId}] User registered successfully: ${email}`);
      return this.createResponse(201, {}, {
        message: 'User registered successfully',
        user: result.user,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Registration error:`, error);
      console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      return this.createErrorResponse(500, 'REGISTRATION_ERROR', 'Registration failed', requestId);
    }
  }

  /**
   * Handle user login
   */
  private async handleUserLogin(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await this.parseJsonBody(request) as AuthRequest;
      const { email, password } = body;

      if (!email || !password) {
        return this.createErrorResponse(400, 'MISSING_CREDENTIALS', 'Email and password are required', requestId);
      }

      const userAgent = request.headers.get('User-Agent');
      const deviceInfo = {
        userAgent,
        ip: request.headers.get('CF-Connecting-IP'),
        timestamp: new Date().toISOString()
      };

      const result = await this.authService.login(email, password, deviceInfo);

      if (!result.success) {
        return this.createErrorResponse(401, 'LOGIN_FAILED', result.error || 'Invalid credentials', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Login successful',
        token: result.token,
        user: result.user,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Login error:`, error);
      return this.createErrorResponse(500, 'LOGIN_ERROR', 'Login failed', requestId);
    }
  }

  /**
   * Handle user logout
   */
  private async handleUserLogout(request: Request, requestId: string): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'MISSING_TOKEN', 'Authorization token required', requestId);
      }

      const token = authHeader.slice(7);
      const result = await this.authService.logout(token);

      if (!result.success) {
        return this.createErrorResponse(400, 'LOGOUT_FAILED', result.error || 'Logout failed', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Logout successful',
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Logout error:`, error);
      return this.createErrorResponse(500, 'LOGOUT_ERROR', 'Logout failed', requestId);
    }
  }

  /**
   * Handle get current user
   */
  private async handleGetCurrentUser(request: Request, requestId: string): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'MISSING_TOKEN', 'Authorization token required', requestId);
      }

      const token = authHeader.slice(7);
      const result = await this.authService.validateToken(token);

      if (!result.valid) {
        return this.createErrorResponse(401, 'INVALID_TOKEN', result.error || 'Invalid token', requestId);
      }

      return this.createResponse(200, {}, {
        user: result.user,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Get current user error:`, error);
      return this.createErrorResponse(500, 'AUTH_ERROR', 'Authentication failed', requestId);
    }
  }

  /**
   * Handle password reset request
   */
  private async handlePasswordResetRequest(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await this.parseJsonBody(request) as AuthRequest;
      const { email } = body;

      if (!email) {
        return this.createErrorResponse(400, 'MISSING_EMAIL', 'Email is required', requestId);
      }

      const result = await this.authService.generatePasswordResetToken(email);

      if (!result.success) {
        return this.createErrorResponse(400, 'RESET_REQUEST_FAILED', result.error || 'Failed to generate reset token', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Password reset token generated',
        token: result.token || 'Token generated but not returned for security',
        timestamp: new Date().toISOString(),
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Password reset request error:`, error);
      return this.createErrorResponse(500, 'RESET_REQUEST_FAILED', 'Password reset request failed', requestId);
    }
  }

  /**
   * Handle password reset
   */
  private async handlePasswordReset(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await this.parseJsonBody(request) as AuthRequest;
      const { email, newPassword, resetToken } = body;

      if (!email || !newPassword || !resetToken) {
        return this.createErrorResponse(400, 'MISSING_FIELDS', 'Email, new password, and reset token are required', requestId);
      }

      const result = await this.authService.resetPassword(resetToken, newPassword);

      if (!result) {
        return this.createErrorResponse(400, 'INVALID_TOKEN', 'Invalid or expired reset token', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Password reset successfully',
        timestamp: new Date().toISOString(),
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Password reset failed:`, error);
      return this.createErrorResponse(500, 'PASSWORD_RESET_FAILED', 'Password reset failed', requestId);
    }
  }

  /**
   * Handle admin delete user
   */
  private async handleAdminDeleteUser(email: string, request: Request, requestId: string): Promise<Response> {
    try {
      // Check admin authentication
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Admin authentication required', requestId);
      }

      const token = authHeader.slice(7);
      const adminValidation = await this.authService.validateAdminToken(token);

      if (!adminValidation.valid || !adminValidation.isAdmin) {
        return this.createErrorResponse(403, 'FORBIDDEN', 'Admin access required', requestId);
      }

      if (!email) {
        return this.createErrorResponse(400, 'MISSING_EMAIL', 'Email is required', requestId);
      }

      const result = await this.authService.deleteUser(email);

      if (!result.success) {
        return this.createErrorResponse(400, 'DELETE_FAILED', result.error || 'User deletion failed', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'User deleted successfully',
        email,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Admin delete user error:`, error);
      return this.createErrorResponse(500, 'DELETE_ERROR', 'User deletion failed', requestId);
    }
  }
}
