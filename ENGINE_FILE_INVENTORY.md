# 📁 WitnessOS Engine File Inventory

## 🎯 **Complete File Reference for Engine Integration**

This document catalogs every file in the WitnessOS repository that contains engine lists, references, or configurations that must be updated when adding new consciousness engines to the Entrodrmia Engine collection.

## 🔧 **Backend Engine Files (Railway Python)**

### **Core Engine Registry**
- **`witnessos-engines/app.py`** - Main engine initialization and registry
  - Lines 92-103: Engine dictionary with all engine instances
  - Update: Add new engine import and initialization

### **Engine Implementation Structure**
```
witnessos-engines/engines/{engine_name}/
├── __init__.py                    # Engine module initialization
├── {engine_name}.py               # Main engine class (inherits BaseEngine)
├── {engine_name}_models.py        # Pydantic data models
└── data/                          # Engine-specific JSON data files
```

### **API Documentation**
- **`witnessos-engines/docs/api/README.md`**
  - Lines 30-40: Available engines list
  - Lines 167-175: Engine endpoint table
  - Update: Add new engine description and endpoint

- **`witnessos-engines/docs/api/specifications/openapi.yaml`**
  - Lines 9-10: Engine list in API description
  - Update: Add new engine to specification

### **Testing Scripts**
- **`witnessos-engines/scripts/test-api.sh`**
  - Line 79: engines array for metadata tests
  - Update: Add new engine to test array

## 🎨 **Frontend Engine Files (React/TypeScript)**

### **Component Registry**
- **`src/components/consciousness-engines/index.ts`**
  - Lines 9-20: Engine component imports
  - Lines 52-133: ENGINE_METADATA object
  - Lines 162-167: LAYER_ENGINES distribution
  - Lines 175-184: ENGINE_ELEMENTS groupings
  - Lines 187-199: Default export object
  - Update: Add new engine to all relevant sections

### **Engine Components**
- **`src/components/consciousness-engines/{EngineName}Engine.tsx`** (create new)
- **`src/components/consciousness-engines/ConsciousnessEnginePortal.tsx`**
  - Lines 126-153: ENGINE_DISPLAY_INFO object
  - Update: Add new engine display information

### **TypeScript Definitions**
- **`src/types/engines.ts`**
  - Add new engine input/output interfaces
  - Lines 509-511: EngineInput and EngineOutput union types
  - Lines 513-523: EngineName type
  - Update: Add new engine types to all unions

### **Engine Organization**
- **`src/utils/engine-tier-organization.ts`**
  - Lines 25-46: TIER_1_ENGINES
  - Lines 48-85: TIER_2_ENGINES  
  - Lines 87-124: TIER_3_ENGINES
  - Update: Add new engine to appropriate tier

### **Constants and Configuration**
- **`src/utils/consciousness-constants.ts`**
  - Lines 259-274: Engine color mappings
  - Update: Add new engine colors and frequencies

- **`src/utils/witnessos-ui-constants.ts`** (if exists)
  - Update: Add engine-specific UI constants

## 🌐 **API Integration Files (Cloudflare Workers)**

### **Main API Handlers**
- **`src/workers/api-handlers.ts`**
  - Add new engine calculation endpoint handler
  - Update engine list and metadata endpoints
  - Add to Raycast integration endpoints if applicable

### **Enhanced API Router**
- **`src/workers/enhanced-api-router.ts`**
  - Lines 1466-1477: Engine metadata definitions
  - Update: Add new engine metadata

### **Engine Proxy**
- **`src/workers/engine-proxy-worker.ts`**
  - Update: Add new engine to proxy configuration

### **Service Configuration**
- **`wrangler.toml`** - Main worker configuration
- **`wrangler-engine-service.toml`** - Engine service worker
- **`wrangler-ai-service.toml`** - AI service worker
  - Update: Add service bindings if needed

## 📚 **Documentation Files**

### **Project Documentation**
- **`README.md`** - Main project README
  - Update: Engine count and descriptions

- **`project-constants.md`** - Project constants and vision
  - Update: Engine-related constants and targets

### **Integration Documentation**
- **`docs/integrations/RAYCAST_INTEGRATION_COMPLETE.md`**
  - Lines 31-45: Available engines list
  - Lines 47-77: API endpoints status
  - Update: Add new engine to working engines list

- **`docs/integrations/ADMIN_CREDENTIALS_GUIDE.md`**
  - Update: Add new engine to testing examples

### **API Reference**
- **`docs/raycast-extension/docs/API_ENDPOINTS.md`**
  - Lines 470-477: Available engines in health response
  - Update: Add new engine to endpoint documentation

## 🎯 **Raycast Integration Files**

### **Extension Configuration**
- **`docs/raycast-extension/package.json`**
  - Lines 25-31: Keywords array
  - Lines 33-107: Commands array
  - Lines 42-49: Default engines preference
  - Update: Add new engine command and keywords

### **Integration Utilities**
- **`docs/raycast-extension/src/config/admin-profile.ts`** (if exists)
- **`docs/raycast-extension/src/utils/admin-integration.ts`** (if exists)
  - Update: Add new engine to integration helpers

## 🔍 **Configuration and Build Files**

### **TypeScript Configuration**
- **`tsconfig.json`**
  - May need updates for new engine types

### **Package Configuration**
- **`package.json`** - Main project dependencies
  - Update: Add new dependencies if needed

## 📊 **Testing and Validation Files**

### **Test Scripts**
- **`witnessos-engines/scripts/test-api.sh`**
  - Line 79: engines array
  - Update: Add new engine to test suite

### **Integration Tests**
- Any integration test files that reference engine lists
- Update: Add new engine to test coverage

## 🚨 **Critical Update Points**

### **Must Update for Every New Engine:**
1. **Backend Registry** - `witnessos-engines/app.py`
2. **Frontend Components** - `src/components/consciousness-engines/index.ts`
3. **TypeScript Types** - `src/types/engines.ts`
4. **API Handlers** - `src/workers/api-handlers.ts`
5. **Documentation** - All README and integration docs
6. **Raycast Config** - `docs/raycast-extension/package.json`

### **Tier-Specific Updates:**
- **Tier Organization** - `src/utils/engine-tier-organization.ts`
- **Discovery Layers** - Update layer assignments in component index
- **UI Constants** - Add engine-specific colors and metadata

### **Testing Updates:**
- **API Tests** - Add to test scripts and validation
- **Integration Tests** - Update test coverage
- **Documentation Tests** - Verify all docs are updated

---

**Usage**: Reference this inventory when adding new engines to ensure no files are missed in the update process. Each file listed contains engine-specific content that must be updated for proper integration.
