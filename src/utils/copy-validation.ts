/**
 * WitnessOS Copy Validation Utility
 * 
 * Validates UI copy against banned terminology and provides WitnessOS-aligned alternatives
 * Prevents use of banned "consciousness" terminology in favor of project-specific language
 */

import { 
  BANNED_TERMS, 
  getWitnessOSReplacement,
  validateCopy as baseValidateCopy 
} from './witnessos-ui-constants';

export interface CopyValidationResult {
  isValid: boolean;
  violations: string[];
  suggestions: string[];
  cleanedText: string;
}

export interface CopyValidationOptions {
  strict?: boolean; // If true, fails on any banned term
  autoFix?: boolean; // If true, automatically replaces banned terms
  logWarnings?: boolean; // If true, logs warnings to console
}

/**
 * Comprehensive copy validation with suggestions and auto-fixing
 */
export function validateWitnessOSCopy(
  text: string, 
  options: CopyValidationOptions = {}
): CopyValidationResult {
  const { strict = true, autoFix = false, logWarnings = true } = options;
  
  const violations: string[] = [];
  const suggestions: string[] = [];
  let cleanedText = text;
  
  // Check for banned terms
  const lowerText = text.toLowerCase();
  
  for (const bannedTerm of BANNED_TERMS) {
    if (lowerText.includes(bannedTerm.toLowerCase())) {
      violations.push(bannedTerm);
      
      const replacement = getWitnessOSReplacement(bannedTerm);
      suggestions.push(`Replace "${bannedTerm}" with "${replacement}"`);
      
      if (autoFix) {
        const regex = new RegExp(bannedTerm, 'gi');
        cleanedText = cleanedText.replace(regex, replacement);
      }
    }
  }
  
  const isValid = violations.length === 0;
  
  // Log warnings in development
  if (!isValid && logWarnings && process.env.NODE_ENV === 'development') {
    console.group('🚨 WitnessOS Copy Validation Failed');
    console.warn('Text:', text);
    console.warn('Violations:', violations);
    console.warn('Suggestions:', suggestions);
    if (autoFix) {
      console.info('Auto-fixed text:', cleanedText);
    }
    console.groupEnd();
  }
  
  return {
    isValid,
    violations,
    suggestions,
    cleanedText,
  };
}

/**
 * Validate multiple text strings at once
 */
export function validateMultipleCopy(
  texts: string[], 
  options: CopyValidationOptions = {}
): CopyValidationResult[] {
  return texts.map(text => validateWitnessOSCopy(text, options));
}

/**
 * Validate an object containing copy text
 */
export function validateCopyObject(
  copyObject: Record<string, any>, 
  options: CopyValidationOptions = {}
): { [key: string]: CopyValidationResult } {
  const results: { [key: string]: CopyValidationResult } = {};
  
  function validateRecursive(obj: any, path: string = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        results[currentPath] = validateWitnessOSCopy(value, options);
      } else if (typeof value === 'object' && value !== null) {
        validateRecursive(value, currentPath);
      }
    }
  }
  
  validateRecursive(copyObject);
  return results;
}

/**
 * Get WitnessOS-aligned terminology suggestions for a given text
 */
export function getTerminologySuggestions(text: string): string[] {
  const suggestions: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Check for banned terms and provide suggestions
  for (const bannedTerm of BANNED_TERMS) {
    if (lowerText.includes(bannedTerm.toLowerCase())) {
      const replacement = getWitnessOSReplacement(bannedTerm);
      suggestions.push(`"${bannedTerm}" → "${replacement}"`);
    }
  }
  
  return suggestions;
}

/**
 * Clean text by replacing all banned terms with WitnessOS alternatives
 */
export function cleanCopyText(text: string): string {
  let cleanedText = text;
  
  for (const bannedTerm of BANNED_TERMS) {
    const replacement = getWitnessOSReplacement(bannedTerm);
    const regex = new RegExp(bannedTerm, 'gi');
    cleanedText = cleanedText.replace(regex, replacement);
  }
  
  return cleanedText;
}

/**
 * React hook for copy validation
 */
export function useCopyValidation(text: string, options: CopyValidationOptions = {}) {
  const validation = validateWitnessOSCopy(text, options);
  
  return {
    isValid: validation.isValid,
    violations: validation.violations,
    suggestions: validation.suggestions,
    cleanedText: validation.cleanedText,
    validate: (newText: string) => validateWitnessOSCopy(newText, options),
  };
}

/**
 * Development-only copy validation middleware
 */
export function validateComponentCopy(componentName: string, copyTexts: string[]): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const allText = copyTexts.join(' ');
  const validation = validateWitnessOSCopy(allText, { logWarnings: false });
  
  if (!validation.isValid) {
    console.group(`🔍 Copy Validation: ${componentName}`);
    console.warn('Banned terms found:', validation.violations);
    console.info('Suggestions:', validation.suggestions);
    console.groupEnd();
  }
}

// Export the base validation function for backward compatibility
export { baseValidateCopy as validateCopy };

// Export common validation patterns
export const COPY_VALIDATION_PATTERNS = {
  // Common WitnessOS terminology patterns
  WITNESS_TERMS: /\b(witness|archetypal|neural|sacred|spectral|portal|field)\b/gi,
  BANNED_TERMS: new RegExp(`\\b(${BANNED_TERMS.join('|')})\\b`, 'gi'),
  
  // File extensions and system terms
  SYSTEM_EXTENSIONS: /\.(exe|dll|sys|bat|cmd)$/i,
  WITNESSOS_PREFIXES: /^(WITNESS_|ARCHETYPAL_|NEURAL_|SACRED_|SPECTRAL_)/i,
} as const;
