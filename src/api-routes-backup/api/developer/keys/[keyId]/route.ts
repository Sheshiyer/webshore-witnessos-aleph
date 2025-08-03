/**
 * Individual API Key Management Endpoints - WitnessOS Developer Platform
 * 
 * Handles operations on specific API keys including update, delete, and regenerate.
 */

import { NextRequest, NextResponse } from 'next/server';
import { APIKeyManager } from '@/lib/api-key-manager';
import { verifyJWT } from '@/lib/auth';
import type { UpdateAPIKeyRequest } from '@/types/api-keys';

// Initialize API Key Manager (will be injected with D1 and KV in production)
let apiKeyManager: APIKeyManager | undefined;

// Mock initialization for development
if (!apiKeyManager) {
  const mockDB = {} as D1Database;
  const mockKV = {} as KVNamespace;
  apiKeyManager = new APIKeyManager(mockDB, mockKV);
}

/**
 * GET /api/developer/keys/[keyId] - Get specific API key details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
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

    const keyId = params.keyId;

    if (!apiKeyManager) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const apiKey = await apiKeyManager.getAPIKeyById(keyId);

    if (!apiKey || apiKey.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { apiKey }
    });

  } catch (error) {
    console.error('Failed to fetch API key:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/developer/keys/[keyId] - Update API key
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
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

    const keyId = params.keyId;
    const updateRequest: UpdateAPIKeyRequest = await request.json();

    if (!apiKeyManager) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Update API key
    const result = await apiKeyManager.updateAPIKey(keyId, user.id, updateRequest);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Failed to update API key:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/developer/keys/[keyId] - Revoke API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
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

    const keyId = params.keyId;

    if (!apiKeyManager) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Revoke API key
    const result = await apiKeyManager.revokeAPIKey(keyId, user.id);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Development Mock Implementation
 */
if (process.env.NODE_ENV === 'development') {
  // Mock data from the main keys route
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

  // Override methods for development
  if (apiKeyManager) {
    apiKeyManager.getAPIKeyById = async (keyId: string) => {
    return mockAPIKeys.find(key => key.id === keyId) || null;
  };

  apiKeyManager.updateAPIKey = async (keyId: string, userId: number, updates: UpdateAPIKeyRequest) => {
    const keyIndex = mockAPIKeys.findIndex(key => key.id === keyId && key.user_id === userId);
    
    if (keyIndex === -1) {
      return { success: false, error: 'API key not found' };
    }

    // Apply updates
    if (updates.name !== undefined) mockAPIKeys[keyIndex].name = updates.name;
    if (updates.description !== undefined) mockAPIKeys[keyIndex].description = updates.description;
    if (updates.scopes !== undefined) mockAPIKeys[keyIndex].scopes = updates.scopes;
    if (updates.is_active !== undefined) mockAPIKeys[keyIndex].is_active = updates.is_active;
    
    mockAPIKeys[keyIndex].updated_at = new Date().toISOString();

    return { success: true };
  };

  apiKeyManager.revokeAPIKey = async (keyId: string, userId: number) => {
    const keyIndex = mockAPIKeys.findIndex(key => key.id === keyId && key.user_id === userId);
    
    if (keyIndex === -1) {
      return { success: false, error: 'API key not found' };
    }

    mockAPIKeys[keyIndex].is_active = false;
    mockAPIKeys[keyIndex].updated_at = new Date().toISOString();

    return { success: true };
    };
  }
}
