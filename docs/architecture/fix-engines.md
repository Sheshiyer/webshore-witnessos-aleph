# Engine TypeScript Fixes Required

## Main Error Patterns:

### 1. Missing BaseEngine Method Implementations
**Engines affected:** GeneKeysEngine, SigilForgeEngine, VimshottariEngine
**Fix:** Add abstract method implementations that delegate to existing underscore methods

### 2. Undefined/Null Safety Issues
**Pattern:** `property.field` where `property` might be undefined
**Fix:** Use optional chaining or null coalescing: `property?.field` or `property || defaultValue`

### 3. Calculate Method Return Type Mismatch
**Pattern:** Methods return `EngineOutput` instead of `CalculationResult<EngineOutput>`
**Fix:** Wrap return in CalculationResult format

### 4. Index Signature Missing
**Pattern:** `BaseEngineInput` constraint violations
**Fix:** Add index signature to input interfaces

### 5. Array Type Mismatches
**Pattern:** `Type 'string | undefined' is not assignable to type 'string'`
**Fix:** Filter undefined values or provide defaults

## Quick Fix Strategy:
1. Fix missing method implementations first (prevents class errors)
2. Add null safety guards throughout
3. Fix return type wrappers for calculate methods
4. Add index signatures to input types
5. Handle array filtering and defaults

This is blocking our backend implementation - let's fix these systematically. 