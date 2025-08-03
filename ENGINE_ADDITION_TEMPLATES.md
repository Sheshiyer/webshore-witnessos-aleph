# 🔧 WitnessOS Engine Addition Templates

## 🎯 **Standardized Templates for New Engine Integration**

This document provides copy-paste templates and examples for adding new consciousness engines to the WitnessOS Entrodrmia Engine collection.

## 🐍 **Backend Templates (Railway Python)**

### **Engine Class Template**
```python
# witnessos-engines/engines/{engine_name}/{engine_name}.py
"""
{Engine Name} Engine for WitnessOS

Provides {brief description of engine functionality}
"""

from datetime import datetime
from typing import Dict, List, Any, Type, Optional

from shared.base.engine_interface import BaseEngine
from shared.base.data_models import BaseEngineInput, BaseEngineOutput
from shared.base.utils import load_json_data
from .{engine_name}_models import (
    {EngineNameInput}, {EngineNameOutput}, {EngineNameData}
)

class {EngineNameClass}(BaseEngine):
    """
    {Engine Name} Engine
    
    {Detailed description of engine functionality}
    """
    
    def __init__(self):
        super().__init__()
        self.engine_data: Optional[{EngineNameData}] = None
        self._load_engine_data()
    
    @property
    def engine_name(self) -> str:
        return "{Engine Name}"
    
    @property
    def description(self) -> str:
        return "{Engine description}"
    
    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return {EngineNameInput}
    
    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return {EngineNameOutput}
    
    def _load_engine_data(self):
        """Load engine-specific data files"""
        try:
            self.engine_data = load_json_data('engines/{engine_name}/data')
        except Exception as e:
            print(f"Warning: Could not load {engine_name} data: {e}")
    
    async def calculate(self, input_data: {EngineNameInput}) -> {EngineNameOutput}:
        """Main calculation method"""
        try:
            # Implement engine calculation logic here
            result = self._perform_calculation(input_data)
            
            return {EngineNameOutput}(
                engine_name=self.engine_name,
                calculation_time=0.001,  # Update with actual time
                confidence_score=1.0,
                field_signature=self._generate_field_signature(input_data),
                formatted_output=self._format_output(result),
                # Add engine-specific output fields
            )
            
        except Exception as e:
            raise Exception(f"{self.engine_name} calculation failed: {str(e)}")
    
    def _perform_calculation(self, input_data: {EngineNameInput}) -> Dict[str, Any]:
        """Core calculation logic"""
        # Implement specific calculation logic
        pass
    
    def _format_output(self, result: Dict[str, Any]) -> str:
        """Format calculation results for display"""
        # Implement output formatting
        pass
    
    def _generate_field_signature(self, input_data: {EngineNameInput}) -> str:
        """Generate unique field signature"""
        # Implement signature generation
        pass
```

### **App.py Registration Template**
```python
# Add to witnessos-engines/app.py

# Import (add to imports section)
from engines.{engine_name} import {EngineNameClass}

# Registration (add to engines dictionary around line 92-103)
engines = {
    # ... existing engines ...
    "{engine_name}": {EngineNameClass}(),
}
```

## ⚛️ **Frontend Templates (React/TypeScript)**

### **Engine Component Template**
```typescript
// src/components/consciousness-engines/{EngineNameEngine}.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { {EngineNameInput}, {EngineNameOutput} } from '../../types/engines';

interface {EngineNameEngine}Props {
  onCalculate?: (result: {EngineNameOutput}) => void;
  userProfile?: any;
}

const {EngineNameEngine}: React.FC<{EngineNameEngine}Props> = ({
  onCalculate,
  userProfile
}) => {
  const [input, setInput] = useState<Partial<{EngineNameInput}>>({});
  const [result, setResult] = useState<{EngineNameOutput} | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      // Implement calculation API call
      const response = await fetch('/api/engines/{engine_name}/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      
      const calculationResult = await response.json();
      setResult(calculationResult.data);
      onCalculate?.(calculationResult.data);
    } catch (error) {
      console.error('{Engine Name} calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <motion.div
      className="engine-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="engine-header">
        <h2>{Engine Name} Engine</h2>
        <p>{Engine description}</p>
      </div>

      <div className="engine-inputs">
        {/* Add input fields based on engine requirements */}
      </div>

      <button 
        onClick={handleCalculate}
        disabled={isCalculating}
        className="calculate-button"
      >
        {isCalculating ? 'Calculating...' : 'Calculate {Engine Name}'}
      </button>

      {result && (
        <div className="engine-results">
          <h3>Results</h3>
          <pre>{result.formatted_output}</pre>
        </div>
      )}
    </motion.div>
  );
};

export default {EngineNameEngine};
```

### **TypeScript Interface Template**
```typescript
// Add to src/types/engines.ts

// ===== {ENGINE_NAME} ENGINE =====
export interface {EngineNameInput} extends BaseEngineInput {
  // Add engine-specific input fields
  [key: string]: unknown;
}

export interface {EngineNameOutput} extends BaseEngineOutput {
  // Add engine-specific output fields
  [key: string]: unknown;
}

// Update union types (add to existing unions)
export type EngineInput = 
  | NumerologyInput 
  | HumanDesignInput 
  | {EngineNameInput}  // Add this line
  | /* ... other engines ... */;

export type EngineOutput = 
  | NumerologyOutput 
  | HumanDesignOutput 
  | {EngineNameOutput}  // Add this line
  | /* ... other engines ... */;

export type EngineName =
  | 'numerology'
  | 'human_design'
  | '{engine_name}'  // Add this line
  | /* ... other engines ... */;
```

### **Component Index Registration Template**
```typescript
// Add to src/components/consciousness-engines/index.ts

// Import (add to imports section)
import {EngineNameEngine}Component from './{EngineNameEngine}';

// Component array (add to ENGINE_COMPONENTS)
export const ENGINE_COMPONENTS = [
  // ... existing components ...
  '{engine_name}',
] as const;

// Metadata (add to ENGINE_METADATA)
export const ENGINE_METADATA = {
  // ... existing engines ...
  {engine_name}: {
    name: '{Engine Display Name}',
    description: '{Engine description}',
    layer: 2, // Choose appropriate layer (1-3)
    color: '#HEX_COLOR',
    frequency: 528, // Choose appropriate frequency
    element: 'element_name',
  },
} as const;

// Layer assignment (add to LAYER_ENGINES)
export const LAYER_ENGINES = {
  1: ['sacred_geometry', 'biorhythm'],
  2: ['numerology', 'vimshottari', 'tarot', 'iching', '{engine_name}'], // Add here
  3: ['human_design', 'gene_keys', 'enneagram', 'sigil_forge'],
} as const;

// Element grouping (add to ENGINE_ELEMENTS)
export const ENGINE_ELEMENTS = {
  // ... existing elements ...
  element_name: ['{engine_name}'], // Add appropriate element
} as const;

// Default export (add to default export)
export default {
  // ... existing engines ...
  {EngineNameEngine}: {EngineNameEngine}Component,
};
```

## 🌐 **API Handler Template**

### **API Endpoint Template**
```typescript
// Add to src/workers/api-handlers.ts

// Route handler (add to routing section)
if (path === '/engines/{engine_name}/calculate' && method === 'POST') {
  return await this.handleEngineCalculation(request, requestId, '{engine_name}');
}

// Metadata (add to getEngineMetadata method)
const metadata = {
  // ... existing engines ...
  {engine_name}: {
    name: "{Engine Display Name}",
    description: "{Engine description}",
    version: "1.0.0",
    inputs: {
      // Define input schema
    },
    outputs: ["result", "formatted_output", "confidence"],
    calculation_time: "< 2 seconds",
    accuracy: "High precision"
  }
};
```

## 📚 **Documentation Templates**

### **README Update Template**
```markdown
<!-- Add to witnessos-engines/docs/api/README.md -->

### Available Engines

| Engine | Endpoint | Description |
|--------|----------|-------------|
| **{Engine Name}** | `/engines/{engine_name}/calculate` | {Engine description} |
```

### **Raycast Command Template**
```json
// Add to docs/raycast-extension/package.json commands array
{
  "name": "{engine-name}-engine",
  "title": "{Engine Name} Engine",
  "description": "{Engine description for Raycast}",
  "mode": "view",
  "keywords": ["{engine_name}", "keyword1", "keyword2", "consciousness"]
}
```

## 🧪 **Testing Template**

### **Test Script Update**
```bash
# Add to witnessos-engines/scripts/test-api.sh
engines=("numerology" "human_design" "tarot" "iching" "enneagram" "sacred_geometry" "biorhythm" "vimshottari" "gene_keys" "sigil_forge" "{engine_name}")
```

---

**Usage**: Copy and customize these templates when adding new engines. Replace all placeholder values (in {braces}) with actual engine-specific information.
