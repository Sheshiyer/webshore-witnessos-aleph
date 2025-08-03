/**
 * API Keys Management Endpoints - WitnessOS Developer Platform
 * 
 * Handles CRUD operations for API keys with proper authentication
 * and rate limiting integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { APIKeyManager } from '@/lib/api-key-manager';
import { verifyJWT } from '@/lib/auth';
import type { CreateAPIKeyRequest } from '@/types/api-keys';

// Initialize API Key Manager (will be injected with D1 and KV in production)
let apiKeyManager: APIKeyManager;

// Mock initialization for development
if (!apiKeyManager) {
  // In production, these would be injected from Cloudflare Workers environment
  const mockDB = {} as D1Database;
  const mockKV = {} as KVNamespace;
  apiKeyManager = new APIKeyManager(mockDB, mockKV);
}

/**
 * GET /api/developer/keys - List user's API keys
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyJWT(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's API keys
    const apiKeys = await apiKeyManager.getUserAPIKeys(user.id);

    return NextResponse.json({
      success: true,
      data: {
        apiKeys,
        total: apiKeys.length
      }
    });

  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/developer/keys - Create new API key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyJWT(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const createRequest: CreateAPIKeyRequest = await request.json();

    // Validate required fields
    if (!createRequest.name || !createRequest.scopes || createRequest.scopes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name and scopes are required' },
        { status: 400 }
      );
    }

    // Create API key
    const result = await apiKeyManager.createAPIKey(user.id, createRequest);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Failed to create API key:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Development Mock Data
 * In production, this would connect to actual D1 database and KV storage
 */
const mockAPIKeys = [
  {
    id: 'key_1',
    user_id: 1,
    key_hash: 'hashed_key_1',
    key_prefix: 'wos_live_',
    name: 'Raycast Extension',
    description: 'API key for Raycast WitnessOS extension',
    scopes: ['engines:numerology:read', 'engines:biorhythm:read', 'user:profile:read'],
    environment: 'live' as const,
    rate_limit_per_minute: 60,
    rate_limit_per_hour: 1000,
    rate_limit_per_day: 10000,
    expires_at: null,
    last_used_at: '2025-01-28T10:30:00Z',
    created_at: '2025-01-20T14:22:00Z',
    updated_at: '2025-01-20T14:22:00Z',
    is_active: true
  },
  {
    id: 'key_2',
    user_id: 1,
    key_hash: 'hashed_key_2',
    key_prefix: 'wos_test_',
    name: 'Development Testing',
    description: 'Test key for development and debugging',
    scopes: ['engines:*:read', 'user:profile:write'],
    environment: 'test' as const,
    rate_limit_per_minute: 100,
    rate_limit_per_hour: 5000,
    rate_limit_per_day: 50000,
    expires_at: '2025-12-31T23:59:59Z',
    last_used_at: '2025-01-29T09:15:00Z',
    created_at: '2025-01-15T11:45:00Z',
    updated_at: '2025-01-15T11:45:00Z',
    is_active: true
  }
];

/**
 * Mock implementation for development
 * Replace with actual database calls in production
 */
if (process.env.NODE_ENV === 'development') {
  // Override API Key Manager methods for development
  apiKeyManager.getUserAPIKeys = async (userId: number) => {
    return mockAPIKeys.filter(key => key.user_id === userId);
  };

  apiKeyManager.createAPIKey = async (userId: number, request: CreateAPIKeyRequest) => {
    const newKey = {
      id: `key_${Date.now()}`,
      user_id: userId,
      key_hash: `hashed_${Date.now()}`,
      key_prefix: request.environment === 'live' ? 'wos_live_' : 'wos_test_',
      name: request.name,
      description: request.description,
      scopes: request.scopes,
      environment: request.environment,
      rate_limit_per_minute: 60,
      rate_limit_per_hour: 1000,
      rate_limit_per_day: 10000,
      expires_at: request.expirationDate || null,
      last_used_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };

    mockAPIKeys.push(newKey);

    return {
      success: true,
      data: {
        apiKey: newKey,
        plainTextKey: `${newKey.key_prefix}${Math.random().toString(36).substring(2, 34)}`
      }
    };
  };
}
