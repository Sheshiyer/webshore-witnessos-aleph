/**
 * API Scopes Endpoint - WitnessOS Developer Platform
 * 
 * Provides available API scopes/permissions based on user tier
 * for API key creation and management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import type { APIKeyScope } from '@/types/api-keys';

/**
 * GET /api/developer/scopes - Get available API scopes for user's tier
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

    // Get user's tier (in production, this would come from the database)
    const userTier = getUserTier(user.id);
    
    // Get available scopes for the user's tier
    const availableScopes = getAvailableScopes(userTier);

    return NextResponse.json({
      success: true,
      data: {
        scopes: availableScopes,
        userTier,
        total: availableScopes.length
      }
    });

  } catch (error) {
    console.error('Failed to fetch API scopes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user's tier (mock implementation)
 * In production, this would query the user's tier from the database
 */
function getUserTier(userId: number): 'free' | 'pro' | 'enterprise' {
  // Mock implementation - in production, query from users table
  return 'free'; // Default to free tier for development
}

/**
 * Get available scopes based on user tier
 */
function getAvailableScopes(userTier: 'free' | 'pro' | 'enterprise'): APIKeyScope[] {
  const allScopes: APIKeyScope[] = [
    // Free tier scopes
    {
      id: 1,
      scope_name: 'engines:numerology:read',
      description: 'Access Numerology calculations and interpretations',
      tier_required: 'free'
    },
    {
      id: 2,
      scope_name: 'engines:biorhythm:read',
      description: 'Access Biorhythm calculations and cycle analysis',
      tier_required: 'free'
    },
    {
      id: 3,
      scope_name: 'engines:iching:read',
      description: 'Access I-Ching hexagram readings and interpretations',
      tier_required: 'free'
    },
    {
      id: 4,
      scope_name: 'user:profile:read',
      description: 'Read user profile data and birth information',
      tier_required: 'free'
    },

    // Pro tier scopes
    {
      id: 5,
      scope_name: 'engines:human_design:read',
      description: 'Access Human Design chart calculations and analysis',
      tier_required: 'pro'
    },
    {
      id: 6,
      scope_name: 'engines:gene_keys:read',
      description: 'Access Gene Keys profile and hologenetic analysis',
      tier_required: 'pro'
    },
    {
      id: 7,
      scope_name: 'engines:tarot:read',
      description: 'Access Tarot card readings and interpretations',
      tier_required: 'pro'
    },
    {
      id: 8,
      scope_name: 'engines:enneagram:read',
      description: 'Access Enneagram personality analysis',
      tier_required: 'pro'
    },
    {
      id: 9,
      scope_name: 'engines:sacred_geometry:read',
      description: 'Access Sacred Geometry pattern generation and analysis',
      tier_required: 'pro'
    },
    {
      id: 10,
      scope_name: 'engines:vimshottari:read',
      description: 'Access Vimshottari Dasha calculations and predictions',
      tier_required: 'pro'
    },
    {
      id: 11,
      scope_name: 'user:profile:write',
      description: 'Modify user profile data and preferences',
      tier_required: 'pro'
    },
    {
      id: 12,
      scope_name: 'analytics:usage:read',
      description: 'Access API usage analytics and statistics',
      tier_required: 'pro'
    },
    {
      id: 13,
      scope_name: 'webhooks:manage',
      description: 'Create and manage webhook endpoints',
      tier_required: 'pro'
    },
    {
      id: 14,
      scope_name: 'batch:calculate',
      description: 'Perform batch calculations across multiple engines',
      tier_required: 'pro'
    },

    // Enterprise tier scopes
    {
      id: 15,
      scope_name: 'engines:sigil_forge:read',
      description: 'Access Sigil Forge for intention-based symbol creation',
      tier_required: 'enterprise'
    },
    {
      id: 16,
      scope_name: 'engines:*:read',
      description: 'Access all consciousness engines (read permissions)',
      tier_required: 'enterprise'
    },
    {
      id: 17,
      scope_name: 'admin:users:read',
      description: 'Read user management data (enterprise admin)',
      tier_required: 'enterprise'
    },
    {
      id: 18,
      scope_name: 'admin:analytics:read',
      description: 'Access platform-wide analytics and insights',
      tier_required: 'enterprise'
    },
    {
      id: 19,
      scope_name: 'custom:integrations:manage',
      description: 'Create and manage custom integrations',
      tier_required: 'enterprise'
    }
  ];

  // Filter scopes based on user tier
  return allScopes.filter(scope => {
    if (userTier === 'enterprise') return true;
    if (userTier === 'pro') return scope.tier_required !== 'enterprise';
    return scope.tier_required === 'free';
  });
}

/**
 * Development mock implementation with enhanced data
 */
if (process.env.NODE_ENV === 'development') {
  // Override getUserTier for development testing
  const originalGetUserTier = getUserTier;
  
  getUserTier = (userId: number) => {
    // For development, you can test different tiers by changing this
    // or implementing logic based on userId
    return 'pro'; // Change to 'free', 'pro', or 'enterprise' for testing
  };

  // Add some additional development-specific scopes
  const originalGetAvailableScopes = getAvailableScopes;
  
  getAvailableScopes = (userTier: 'free' | 'pro' | 'enterprise') => {
    const baseScopes = originalGetAvailableScopes(userTier);
    
    // Add development-specific scopes
    const devScopes: APIKeyScope[] = [
      {
        id: 100,
        scope_name: 'dev:testing:read',
        description: 'Access development testing endpoints',
        tier_required: 'free'
      },
      {
        id: 101,
        scope_name: 'dev:debug:read',
        description: 'Access debug information and logs',
        tier_required: 'pro'
      }
    ];

    // Filter dev scopes based on tier and add to base scopes
    const filteredDevScopes = devScopes.filter(scope => {
      if (userTier === 'enterprise') return true;
      if (userTier === 'pro') return scope.tier_required !== 'enterprise';
      return scope.tier_required === 'free';
    });

    return [...baseScopes, ...filteredDevScopes];
  };
}
