/**
 * API Key Management Types for WitnessOS Developer Platform
 * 
 * TypeScript interfaces for API key management, usage analytics,
 * and developer dashboard functionality.
 */

// Core API Key Types
export interface APIKey {
  id: string;
  user_id: number;
  key_hash: string;
  key_prefix: string; // 'wos_live_' or 'wos_test_'
  name: string;
  description?: string;
  scopes: string[];
  environment: 'live' | 'test';
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface APIKeyScope {
  id: number;
  scope_name: string;
  description: string;
  tier_required: 'free' | 'pro' | 'enterprise';
}

export interface APIKeyUsageLog {
  id: number;
  api_key_id?: string;
  user_id: number;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms?: number;
  request_size_bytes?: number;
  response_size_bytes?: number;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  engine_used?: string;
  error_message?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  api_key_id?: string;
  action: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// Developer Dashboard Types
export interface DeveloperTier {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  features: {
    engines: string[];
    webhooks: boolean;
    batchOperations: boolean;
    customRateLimits: boolean;
    prioritySupport: boolean;
    sla: boolean;
    whiteLabeling: boolean;
  };
  limits: {
    apiCallsPerMonth: number;
    rateLimitPerMinute: number;
    rateLimitPerHour: number;
    rateLimitPerDay: number;
    maxApiKeys: number;
    maxWebhooks: number;
    dataRetentionDays: number;
  };
}

export interface UsageStatistics {
  totalApiCalls: number;
  callsThisMonth: number;
  callsToday: number;
  successRate: number;
  averageResponseTime: number;
  topEngines: Array<{
    engine: string;
    calls: number;
    percentage: number;
  }>;
  errorBreakdown: Array<{
    statusCode: number;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    timestamp: string;
    calls: number;
    errors: number;
    avgResponseTime: number;
  }>;
}

export interface RateLimitStatus {
  perMinute: {
    limit: number;
    used: number;
    remaining: number;
    resetTime: string;
  };
  perHour: {
    limit: number;
    used: number;
    remaining: number;
    resetTime: string;
  };
  perDay: {
    limit: number;
    used: number;
    remaining: number;
    resetTime: string;
  };
}

// API Key Creation/Management Types
export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  scopes: string[];
  environment: 'live' | 'test';
  customRateLimits?: {
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  };
  expirationDate?: string;
}

export interface CreateAPIKeyResponse {
  success: boolean;
  data?: {
    apiKey: APIKey;
    plainTextKey: string; // Only returned once during creation
  };
  error?: string;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  description?: string;
  scopes?: string[];
  customRateLimits?: {
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  };
  expirationDate?: string;
  is_active?: boolean;
}

// Developer Dashboard State Types
export interface DeveloperDashboardState {
  user: {
    id: number;
    email: string;
    name?: string;
    developer_tier: 'free' | 'pro' | 'enterprise';
    api_calls_used: number;
    api_calls_limit: number;
    billing_customer_id?: string;
  };
  apiKeys: APIKey[];
  usage: UsageStatistics;
  rateLimits: RateLimitStatus;
  availableScopes: APIKeyScope[];
  tierInfo: DeveloperTier;
}

// UI Component Props Types
export interface APIKeyCardProps {
  apiKey: APIKey;
  usage?: {
    callsThisMonth: number;
    lastUsed?: string;
  };
  onEdit: (key: APIKey) => void;
  onRevoke: (keyId: string) => void;
  onRegenerate: (keyId: string) => void;
  onViewUsage: (keyId: string) => void;
}

export interface CreateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateKey: (request: CreateAPIKeyRequest) => Promise<CreateAPIKeyResponse>;
  availableScopes: APIKeyScope[];
  userTier: 'free' | 'pro' | 'enterprise';
  currentKeyCount: number;
  maxKeys: number;
}

export interface UsageChartProps {
  data: UsageStatistics['timeSeriesData'];
  timeRange: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void;
}

export interface DeveloperSettingsProps {
  user: DeveloperDashboardState['user'];
  tierInfo: DeveloperTier;
  onUpgradeTier: () => void;
  onUpdateProfile: (updates: Partial<DeveloperDashboardState['user']>) => void;
}

// API Response Types
export interface APIKeyListResponse {
  success: boolean;
  data?: {
    apiKeys: APIKey[];
    total: number;
  };
  error?: string;
}

export interface UsageAnalyticsResponse {
  success: boolean;
  data?: UsageStatistics;
  error?: string;
}

export interface RateLimitResponse {
  success: boolean;
  data?: RateLimitStatus;
  error?: string;
}

// Error Types
export interface APIKeyError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type APIKeyErrorCode = 
  | 'INVALID_KEY_FORMAT'
  | 'KEY_NOT_FOUND'
  | 'KEY_EXPIRED'
  | 'KEY_REVOKED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TIER_LIMIT_EXCEEDED'
  | 'INVALID_SCOPE'
  | 'DUPLICATE_KEY_NAME';

// Utility Types
export type APIKeyEnvironment = 'live' | 'test';
export type APIKeyStatus = 'active' | 'expired' | 'revoked';
export type DeveloperTierType = 'free' | 'pro' | 'enterprise';
