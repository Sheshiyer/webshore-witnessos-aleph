/**
 * Core Engine Types for WitnessOS
 * 
 * Base types and interfaces for all consciousness engines
 * Extracted from Python implementation for TypeScript compatibility
 */

export interface BaseEngineInput {
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface BaseEngineOutput {
  engineName: string;
  calculationTime: number;
  confidenceScore: number;
  formattedOutput: string;
  recommendations: string[];
  realityPatches: string[];
  archetypalThemes: string[];
  timestamp: string;
  rawData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BirthData {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
}

export interface PersonalData {
  fullName: string;
  name?: string; // Backward compatibility
  birthDate: string;
  currentYear?: number;
}

export interface QuestionInput {
  question?: string;
  intention?: string;
  focus?: string;
}

export interface EngineError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  suggestions?: string[];
  timestamp: string;
}

export interface EngineConfig {
  maxWorkers?: number;
  enableCaching?: boolean;
  cacheTTL?: number;
  enableLogging?: boolean;
}

export interface CalculationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: EngineError;
  processingTime: number;
  timestamp: string;
}

export interface EngineMetadata {
  name: string;
  description: string;
  version: string;
  supportedSystems: string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface OrchestrationRequest {
  engines: string[];
  input: BaseEngineInput;
  config?: EngineConfig;
  workflow?: string;
}

export interface OrchestrationResult {
  results: Record<string, CalculationResult>;
  synthesis?: Record<string, unknown>;
  fieldAnalysis?: Record<string, unknown>;
  processingTime: number;
  timestamp: string;
}

// Type guard to check if input is a specific engine input type
export function isEngineInput<T extends BaseEngineInput>(
  input: unknown,
  requiredFields: (keyof T)[]
): input is T {
  if (!input || typeof input !== 'object') return false;
  
  for (const field of requiredFields) {
    if (!(field in input)) return false;
  }
  
  return true;
}

// Helper to create engine input with proper typing
export function createEngineInput<T extends BaseEngineInput>(
  data: Partial<T> & { [key: string]: unknown }
): T {
  return data as T;
} 