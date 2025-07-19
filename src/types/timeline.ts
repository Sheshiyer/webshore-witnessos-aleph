// Timeline Data Types for WitnessOS
// Tracks user's consciousness journey and reading history

export interface TimelineEntry {
  id: string;
  userId: string;
  timestamp: string; // ISO 8601 format
  type: TimelineEntryType;
  
  // Engine/Workflow Information
  engineName?: string;
  workflowType?: string;
  
  // Input and Output Data
  input: any;
  result: any;
  
  // Metadata
  metadata: TimelineMetadata;
  
  // Relationships
  linkedEntries?: string[]; // IDs of related timeline entries
  parentEntry?: string; // For entries that are part of a larger workflow
  childEntries?: string[]; // For workflows that spawn multiple calculations
}

export type TimelineEntryType = 
  | 'forecast_daily'
  | 'forecast_weekly' 
  | 'engine_calculation'
  | 'workflow_natal'
  | 'workflow_career'
  | 'workflow_daily'
  | 'workflow_spiritual'
  | 'workflow_shadow'
  | 'workflow_relationships'
  | 'workflow_custom'
  | 'synthesis'
  | 'raycast_integration';

export interface TimelineMetadata {
  confidence: number; // 0-100, confidence in the result
  cached: boolean; // Whether result was served from cache
  requestId: string; // Original request ID for debugging
  accuracy?: number; // 0-100, measured accuracy (for forecasts)
  tags?: string[]; // User-defined or auto-generated tags
  duration?: number; // Processing time in milliseconds
  modelUsed?: string; // AI model used for synthesis
  cacheHit?: boolean; // Whether this was a cache hit
  source?: 'api' | 'raycast' | 'web' | 'webhook'; // Source of the request
}

export interface TimelineQuery {
  userId: string;
  startDate?: string;
  endDate?: string;
  type?: TimelineEntryType;
  engineName?: string;
  workflowType?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'confidence' | 'accuracy';
  sortOrder?: 'asc' | 'desc';
}

export interface TimelineResponse {
  entries: TimelineEntry[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface TimelineStats {
  totalEntries: number;
  entriesByType: Record<TimelineEntryType, number>;
  entriesByEngine: Record<string, number>;
  averageConfidence: number;
  averageAccuracy?: number;
  mostUsedEngine: string;
  mostUsedWorkflow: string;
  streakDays: number; // Consecutive days with entries
  firstEntry: string; // ISO date of first entry
  lastEntry: string; // ISO date of last entry
}

export interface TimelinePattern {
  pattern: string;
  frequency: number;
  confidence: number;
  description: string;
  recommendations: string[];
}

export interface TimelineInsights {
  patterns: TimelinePattern[];
  trends: {
    engagement: 'increasing' | 'decreasing' | 'stable';
    accuracy: 'improving' | 'declining' | 'stable';
    preferences: string[]; // Most used engines/workflows
  };
  recommendations: string[];
  nextSuggestedReading: {
    type: TimelineEntryType;
    reason: string;
    confidence: number;
  };
}

// Timeline Index for efficient querying
export interface TimelineIndex {
  userId: string;
  date: string; // YYYY-MM-DD format
  entryIds: string[];
  entryCount: number;
  types: TimelineEntryType[];
  engines: string[];
}

// Timeline Cache Entry
export interface TimelineCacheEntry {
  key: string;
  data: any;
  timestamp: string;
  ttl: number;
  userId: string;
  type: 'entry' | 'query' | 'stats' | 'insights';
}

// Timeline Batch Operations
export interface TimelineBatchOperation {
  operation: 'create' | 'update' | 'delete';
  entry: TimelineEntry;
}

export interface TimelineBatchResult {
  successful: number;
  failed: number;
  errors: string[];
  processedIds: string[];
}
