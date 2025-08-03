/**
 * Rate Limits Endpoint - WitnessOS Developer Platform
 * 
 * Provides current rate limit status for user's API keys
 * with real-time usage tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import type { RateLimitStatus } from '@/types/api-keys';

/**
 * GET /api/developer/rate-limits - Get current rate limit status
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

    // Parse query parameters
    const url = new URL(request.url);
    const apiKeyId = url.searchParams.get('apiKeyId'); // Optional filter by specific key

    // In production, this would query KV storage for rate limit buckets
    const rateLimitStatus = await getCurrentRateLimitStatus(user.id, apiKeyId);

    return NextResponse.json({
      success: true,
      data: rateLimitStatus
    });

  } catch (error) {
    console.error('Failed to fetch rate limit status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get current rate limit status (mock implementation for development)
 * In production, this would query KV storage for rate limit buckets
 */
async function getCurrentRateLimitStatus(
  userId: number, 
  apiKeyId?: string | null
): Promise<RateLimitStatus> {
  const now = new Date();
  
  // Calculate reset times
  const nextMinute = new Date(now);
  nextMinute.setMinutes(nextMinute.getMinutes() + 1, 0, 0);
  
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  
  const nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);

  // Mock current usage (in production, this would come from KV storage)
  const currentMinuteUsage = Math.floor(Math.random() * 30); // 0-30 out of 60
  const currentHourUsage = Math.floor(Math.random() * 500); // 0-500 out of 1000
  const currentDayUsage = Math.floor(Math.random() * 5000); // 0-5000 out of 10000

  // Get user tier limits (in production, this would come from user record)
  const tierLimits = getUserTierLimits(userId);

  return {
    perMinute: {
      limit: tierLimits.rateLimitPerMinute,
      used: currentMinuteUsage,
      remaining: tierLimits.rateLimitPerMinute - currentMinuteUsage,
      resetTime: nextMinute.toISOString()
    },
    perHour: {
      limit: tierLimits.rateLimitPerHour,
      used: currentHourUsage,
      remaining: tierLimits.rateLimitPerHour - currentHourUsage,
      resetTime: nextHour.toISOString()
    },
    perDay: {
      limit: tierLimits.rateLimitPerDay,
      used: currentDayUsage,
      remaining: tierLimits.rateLimitPerDay - currentDayUsage,
      resetTime: nextDay.toISOString()
    }
  };
}

/**
 * Get user tier limits (mock implementation)
 * In production, this would query the user's tier from the database
 */
function getUserTierLimits(userId: number) {
  // Mock user tier - in production, this would come from the database
  const userTier = 'free'; // Could be 'free', 'pro', or 'enterprise'
  
  const tierLimits = {
    free: {
      rateLimitPerMinute: 10,
      rateLimitPerHour: 100,
      rateLimitPerDay: 1000
    },
    pro: {
      rateLimitPerMinute: 100,
      rateLimitPerHour: 5000,
      rateLimitPerDay: 50000
    },
    enterprise: {
      rateLimitPerMinute: 1000,
      rateLimitPerHour: 50000,
      rateLimitPerDay: 500000
    }
  };
  
  return tierLimits[userTier as keyof typeof tierLimits] || tierLimits.free;
}

/**
 * Development mock implementation
 */
if (process.env.NODE_ENV === 'development') {
  // Override with more realistic development data
  const originalGetCurrentRateLimitStatus = getCurrentRateLimitStatus;
  
  getCurrentRateLimitStatus = async (userId: number, apiKeyId?: string | null) => {
    const now = new Date();
    
    // Calculate reset times
    const nextMinute = new Date(now);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1, 0, 0);
    
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    // Simulate realistic usage patterns
    const tierLimits = getUserTierLimits(userId);
    
    // Simulate current usage with some realistic patterns
    const timeOfDay = now.getHours();
    const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 17;
    const usageMultiplier = isBusinessHours ? 0.7 : 0.3;
    
    const currentMinuteUsage = Math.floor(tierLimits.rateLimitPerMinute * usageMultiplier * Math.random());
    const currentHourUsage = Math.floor(tierLimits.rateLimitPerHour * usageMultiplier * Math.random());
    const currentDayUsage = Math.floor(tierLimits.rateLimitPerDay * usageMultiplier * Math.random());

    return {
      perMinute: {
        limit: tierLimits.rateLimitPerMinute,
        used: currentMinuteUsage,
        remaining: Math.max(0, tierLimits.rateLimitPerMinute - currentMinuteUsage),
        resetTime: nextMinute.toISOString()
      },
      perHour: {
        limit: tierLimits.rateLimitPerHour,
        used: currentHourUsage,
        remaining: Math.max(0, tierLimits.rateLimitPerHour - currentHourUsage),
        resetTime: nextHour.toISOString()
      },
      perDay: {
        limit: tierLimits.rateLimitPerDay,
        used: currentDayUsage,
        remaining: Math.max(0, tierLimits.rateLimitPerDay - currentDayUsage),
        resetTime: nextDay.toISOString()
      }
    };
  };
}
