/**
 * Forecast Types for WitnessOS Daily & Weekly Forecast System
 * 
 * Defines interfaces for forecast data structures, Raycast integration,
 * and predictive analytics features.
 */

export interface DailyForecast {
  date: string;
  energyProfile: EnergyProfile;
  guidance: ForecastGuidance;
  recommendations: string[];
  predictiveInsights?: PredictiveInsights;
  raycastOptimized?: RaycastDailyFormat;
}

export interface WeeklyForecast {
  weekStart: string;
  weekEnd: string;
  dominantThemes: string[];
  dailyForecasts: DailyForecast[];
  weeklyInsights: WeeklyInsights;
  challenges: string[];
  opportunities: string[];
  raycastOptimized?: RaycastWeeklyFormat;
}

export interface EnergyProfile {
  biorhythm: {
    physical: number;
    emotional: number;
    intellectual: number;
    overall_energy: number;
  } | null;
  overallEnergy: 'high' | 'medium' | 'low';
  criticalDays: string[];
  trend: 'ascending' | 'descending' | 'stable' | 'volatile';
  optimalTiming?: {
    bestHours: string[];
    avoidHours: string[];
    peakEnergy: string;
  };
}

export interface ForecastGuidance {
  iching?: {
    hexagram: any;
    interpretation: string;
    changingLines?: any[];
  };
  tarot?: {
    card: any;
    interpretation: string;
    focusArea: string;
  };
  synthesis: string;
  keyThemes: string[];
}

export interface PredictiveInsights {
  trendAnalysis: {
    direction: 'improving' | 'declining' | 'stable';
    confidence: number;
    timeframe: string;
  };
  criticalPeriods: {
    date: string;
    type: 'opportunity' | 'challenge' | 'transition';
    description: string;
  }[];
  optimalActions: {
    timing: string;
    action: string;
    reasoning: string;
  }[];
}

export interface WeeklyInsights {
  dominantEnergyPattern: string;
  keyTransitions: string[];
  weeklyTheme: string;
  focusAreas: string[];
  energyFlow: {
    day: string;
    energy: 'high' | 'medium' | 'low';
    focus: string;
  }[];
}

// Raycast Integration Types
export interface RaycastDailyFormat {
  title: string;
  subtitle: string;
  accessories: RaycastAccessory[];
  detail: RaycastDetail;
  actions: RaycastAction[];
}

export interface RaycastWeeklyFormat {
  title: string;
  subtitle: string;
  accessories: RaycastAccessory[];
  detail: RaycastDetail;
  actions: RaycastAction[];
  sections: RaycastSection[];
}

export interface RaycastAccessory {
  text: string;
  icon?: string;
  tooltip?: string;
}

export interface RaycastDetail {
  markdown: string;
  metadata?: Record<string, string>;
}

export interface RaycastAction {
  title: string;
  icon?: string;
  shortcut?: {
    modifiers: string[];
    key: string;
  };
  onAction?: string; // URL or action identifier
}

export interface RaycastSection {
  title: string;
  items: {
    title: string;
    subtitle?: string;
    accessories?: RaycastAccessory[];
  }[];
}

// Batch Processing Types
export interface ForecastBatchRequest {
  dates?: string[];
  days?: number; // Generate forecasts for next N days
  includeWeekly?: boolean;
  raycastOptimized?: boolean;
  userProfile: {
    birthDate: string;
    birthTime?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    preferences?: Record<string, any>;
  };
}

export interface ForecastBatchResponse {
  dailyForecasts: DailyForecast[];
  weeklyForecast?: WeeklyForecast;
  summary: {
    totalDays: number;
    energyTrend: string;
    keyInsights: string[];
  };
  cached: boolean;
  requestId: string;
  timestamp: string;
}

// Caching Types
export interface ForecastCacheEntry {
  forecast: DailyForecast | WeeklyForecast;
  userId: string;
  date: string;
  type: 'daily' | 'weekly';
  cachedAt: string;
  expiresAt: string;
}

// Analytics Types
export interface ForecastAnalytics {
  accuracyScore: number;
  userEngagement: {
    viewCount: number;
    actionsTaken: number;
    feedbackScore?: number;
  };
  trendPredictionAccuracy: number;
  mostUsedFeatures: string[];
}
