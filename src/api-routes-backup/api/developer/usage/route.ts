/**
 * Usage Analytics Endpoint - WitnessOS Developer Platform
 * 
 * Provides API usage statistics and analytics for developers
 * with time-series data and performance metrics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import type { UsageStatistics } from '@/types/api-keys';

/**
 * GET /api/developer/usage - Get user's API usage analytics
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
    const timeRange = url.searchParams.get('timeRange') || '30d';
    const apiKeyId = url.searchParams.get('apiKeyId'); // Optional filter by specific key

    // In production, this would query the actual database
    const usageStats = await generateUsageStatistics(user.id, timeRange, apiKeyId);

    return NextResponse.json({
      success: true,
      data: usageStats
    });

  } catch (error) {
    console.error('Failed to fetch usage analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate usage statistics (mock implementation for development)
 * In production, this would query the api_usage_logs table
 */
async function generateUsageStatistics(
  userId: number, 
  timeRange: string, 
  apiKeyId?: string | null
): Promise<UsageStatistics> {
  // Mock data generation for development
  const now = new Date();
  const days = timeRange === '24h' ? 1 : 
               timeRange === '7d' ? 7 : 
               timeRange === '30d' ? 30 : 90;

  // Generate time series data
  const timeSeriesData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic usage patterns
    const baseCallsPerDay = 50 + Math.random() * 100;
    const calls = Math.floor(baseCallsPerDay * (0.5 + Math.random()));
    const errors = Math.floor(calls * (0.01 + Math.random() * 0.05)); // 1-6% error rate
    const avgResponseTime = Math.floor(150 + Math.random() * 100); // 150-250ms

    timeSeriesData.push({
      timestamp: date.toISOString(),
      calls,
      errors,
      avgResponseTime
    });
  }

  // Calculate totals
  const totalCalls = timeSeriesData.reduce((sum, point) => sum + point.calls, 0);
  const totalErrors = timeSeriesData.reduce((sum, point) => sum + point.errors, 0);
  const avgResponseTime = Math.round(
    timeSeriesData.reduce((sum, point) => sum + point.avgResponseTime, 0) / timeSeriesData.length
  );

  // Calculate calls for different periods
  const callsToday = timeSeriesData[timeSeriesData.length - 1]?.calls || 0;
  const callsThisMonth = totalCalls;

  // Success rate
  const successRate = totalCalls > 0 ? (totalCalls - totalErrors) / totalCalls : 1;

  // Top engines (mock data)
  const topEngines = [
    { engine: 'numerology', calls: Math.floor(totalCalls * 0.35), percentage: 35 },
    { engine: 'biorhythm', calls: Math.floor(totalCalls * 0.25), percentage: 25 },
    { engine: 'human_design', calls: Math.floor(totalCalls * 0.20), percentage: 20 },
    { engine: 'tarot', calls: Math.floor(totalCalls * 0.15), percentage: 15 },
    { engine: 'iching', calls: Math.floor(totalCalls * 0.05), percentage: 5 }
  ];

  // Error breakdown (mock data)
  const errorBreakdown = [
    { statusCode: 400, count: Math.floor(totalErrors * 0.4), percentage: 40 },
    { statusCode: 401, count: Math.floor(totalErrors * 0.3), percentage: 30 },
    { statusCode: 429, count: Math.floor(totalErrors * 0.2), percentage: 20 },
    { statusCode: 500, count: Math.floor(totalErrors * 0.1), percentage: 10 }
  ];

  return {
    totalApiCalls: totalCalls,
    callsThisMonth,
    callsToday,
    successRate,
    averageResponseTime: avgResponseTime,
    topEngines,
    errorBreakdown,
    timeSeriesData
  };
}

/**
 * Mock implementation for specific time ranges
 */
function generateMockTimeSeriesData(days: number) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate realistic API usage patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseUsage = isWeekend ? 30 : 80; // Lower usage on weekends
    
    // Add some randomness and daily patterns
    const hourOfDay = date.getHours();
    const peakHourMultiplier = hourOfDay >= 9 && hourOfDay <= 17 ? 1.5 : 0.7;
    
    const calls = Math.floor(baseUsage * peakHourMultiplier * (0.7 + Math.random() * 0.6));
    const errors = Math.floor(calls * (0.01 + Math.random() * 0.04));
    const avgResponseTime = Math.floor(120 + Math.random() * 80 + (errors / calls) * 100);

    data.push({
      timestamp: date.toISOString(),
      calls,
      errors,
      avgResponseTime
    });
  }

  return data;
}

/**
 * Development-specific mock data
 */
if (process.env.NODE_ENV === 'development') {
  // Override with more realistic mock data for development
  const originalGenerateUsageStatistics = generateUsageStatistics;
  
  generateUsageStatistics = async (userId: number, timeRange: string, apiKeyId?: string | null) => {
    const days = timeRange === '24h' ? 1 : 
                 timeRange === '7d' ? 7 : 
                 timeRange === '30d' ? 30 : 90;

    const timeSeriesData = generateMockTimeSeriesData(days);
    
    const totalCalls = timeSeriesData.reduce((sum, point) => sum + point.calls, 0);
    const totalErrors = timeSeriesData.reduce((sum, point) => sum + point.errors, 0);
    const avgResponseTime = Math.round(
      timeSeriesData.reduce((sum, point) => sum + point.avgResponseTime, 0) / timeSeriesData.length
    );

    return {
      totalApiCalls: totalCalls,
      callsThisMonth: totalCalls,
      callsToday: timeSeriesData[timeSeriesData.length - 1]?.calls || 0,
      successRate: totalCalls > 0 ? (totalCalls - totalErrors) / totalCalls : 1,
      averageResponseTime: avgResponseTime,
      topEngines: [
        { engine: 'numerology', calls: Math.floor(totalCalls * 0.35), percentage: 35 },
        { engine: 'biorhythm', calls: Math.floor(totalCalls * 0.25), percentage: 25 },
        { engine: 'human_design', calls: Math.floor(totalCalls * 0.20), percentage: 20 },
        { engine: 'tarot', calls: Math.floor(totalCalls * 0.15), percentage: 15 },
        { engine: 'iching', calls: Math.floor(totalCalls * 0.05), percentage: 5 }
      ],
      errorBreakdown: [
        { statusCode: 400, count: Math.floor(totalErrors * 0.4), percentage: 40 },
        { statusCode: 401, count: Math.floor(totalErrors * 0.3), percentage: 30 },
        { statusCode: 429, count: Math.floor(totalErrors * 0.2), percentage: 20 },
        { statusCode: 500, count: Math.floor(totalErrors * 0.1), percentage: 10 }
      ],
      timeSeriesData
    };
  };
}
