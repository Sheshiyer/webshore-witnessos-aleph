# WitnessOS Raycast Extension Deployment Guide (2024 Enhanced)

Complete guide for deploying, testing, and maintaining the Bleach-inspired WitnessOS Raycast extension with AI features in production environments.

## 🗾 **Enhanced Pre-Deployment Checklist (2024)**

### Code Quality & AI Features
- [ ] **TypeScript Compilation**: No compilation errors with latest types
- [ ] **ESLint Validation**: All linting rules pass including AI-specific rules
- [ ] **AI Integration Testing**: useAI hook functionality verified
- [ ] **Code Coverage**: Minimum 85% test coverage including AI components
- [ ] **Performance Testing**: Load times under 1.5 seconds with AI streaming
- [ ] **Memory Usage**: No memory leaks in AI streaming components

### API Integration & AI Models
- [ ] **Authentication**: JWT token validation with AI model access
- [ ] **AI Model Access**: All selected AI models (Claude, GPT-4, etc.) accessible
- [ ] **Error Handling**: AI-specific errors handled gracefully
- [ ] **Rate Limiting**: AI API rate limits properly managed
- [ ] **Streaming Support**: AI response streaming working correctly
- [ ] **Caching**: AI responses cached appropriately
- [ ] **Offline Mode**: Graceful degradation when AI services unavailable

### User Experience & Bleach Aesthetics
- [ ] **Loading States**: All loading indicators with Bleach-inspired messaging
- [ ] **Error Messages**: User-friendly error messages with anime terminology
- [ ] **Keyboard Shortcuts**: All shortcuts functional including AI commands
- [ ] **Accessibility**: Screen reader compatibility with Japanese names
- [ ] **Performance**: Smooth AI streaming and Zanpakuto engine interactions
- [ ] **Visual Consistency**: Bleach-inspired icons and terminology throughout

## 🔧 Enhanced Build Configuration (2024)

### Production Build Script with AI Features

```bash
#!/bin/bash
# scripts/build-production.sh

set -e

echo "⚔️  Building WitnessOS Bleach-Inspired Raycast Extension for Production"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/

# Install dependencies with AI support
echo "📦 Installing dependencies with AI features..."
npm ci --production=false

# Verify AI model access
echo "🤖 Verifying AI model access..."
npm run test:ai-models

# Run comprehensive tests
echo "🧪 Running tests with AI coverage..."
npm run test

# Lint code
echo "🔍 Linting code..."
npm run lint

# Type check
echo "📝 Type checking..."
npm run type-check

# Test AI integration
echo "🤖 Testing AI integration..."
npm run test:ai-integration

# Build extension with AI optimization
echo "🔨 Building Bankai-powered extension..."
npm run build --optimize

# Validate build including AI extensions
echo "✅ Validating build with AI features..."
ray validate --ai

echo "🎉 Bankai-powered production build complete!"
```

## 🤖 **NEW: AI-Specific Deployment (2024)**

### AI Model Configuration

```typescript
// src/config/ai-models.ts
export const AI_MODEL_CONFIG = {
  production: {
    primary: "anthropic/claude-3-sonnet",
    fallback: "openai/gpt-4",
    creativity: {
      spiritual: 1.8,
      analytical: 0.7,
      creative: 2.0
    },
    rateLimit: {
      requestsPerMinute: 60,
      tokensPerMinute: 100000
    }
  },
  development: {
    primary: "anthropic/claude-3-haiku", // Faster for dev
    fallback: "openai/gpt-3.5-turbo",
    creativity: {
      spiritual: 1.5,
      analytical: 0.5,
      creative: 1.8
    }
  }
};
```

### AI Extension Deployment Script

```bash
#!/bin/bash
# scripts/deploy-ai-extension.sh

echo "👑 Deploying Ishiki no Ōja (AI Consciousness) Extension"

# Verify Raycast Pro subscription
echo "🔐 Verifying Raycast Pro access..."
ray auth verify --pro

# Test AI model connectivity
echo "🤖 Testing AI model connectivity..."
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     https://openrouter.ai/api/v1/models

# Deploy with AI features enabled
echo "🚀 Deploying with AI features..."
ray publish --ai-enabled --team witnessos

echo "✨ AI-powered extension deployed successfully!"
```

### Environment Configuration

```typescript
// src/config/environment.ts
interface Environment {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  version: string;
  buildDate: string;
}

export const environment: Environment = {
  apiBaseUrl: process.env.NODE_ENV === "production" 
    ? "https://api.witnessos.space"
    : "https://api-staging.witnessos.space",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  version: process.env.npm_package_version || "unknown",
  buildDate: new Date().toISOString(),
};

// Feature flags for gradual rollout
export const features = {
  aiForecasting: true,
  batchProcessing: true,
  backgroundRefresh: environment.isProduction,
  advancedEngines: true,
  betaFeatures: !environment.isProduction,
};
```

## 📊 Testing Strategy

### Unit Testing

```typescript
// src/__tests__/api/witnessos-api.test.ts
import { WitnessOSAPI } from "../api/witnessos-api";
import { APICache } from "../api/cache";

// Mock Raycast API
jest.mock("@raycast/api", () => ({
  getPreferenceValues: () => ({
    apiToken: "test-token",
    apiBaseUrl: "https://api-test.witnessos.space",
    fullName: "Test User",
    birthDate: "1990-01-01",
  }),
  showToast: jest.fn(),
  Toast: { Style: { Success: "success", Failure: "failure" } },
}));

describe("WitnessOSAPI", () => {
  let api: WitnessOSAPI;

  beforeEach(() => {
    api = new WitnessOSAPI();
    jest.clearAllMocks();
  });

  describe("calculateNumerology", () => {
    it("should return numerology results", async () => {
      const mockResponse = {
        success: true,
        data: {
          life_path: 7,
          expression: 3,
          soul_urge: 9,
          personality: 6,
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.calculateNumerology();
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        "https://api-test.witnessos.space/engines/numerology/calculate",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Authorization": "Bearer test-token",
          }),
        })
      );
    });

    it("should handle API errors gracefully", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: "Unauthorized" }),
      });

      await expect(api.calculateNumerology()).rejects.toThrow("Unauthorized");
    });
  });

  describe("caching", () => {
    it("should cache numerology results", async () => {
      const mockResponse = { success: true, data: { life_path: 7 } };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call
      await api.calculateNumerology();
      
      // Second call should use cache
      await api.calculateNumerology();
      
      // Fetch should only be called once
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Integration Testing

```typescript
// src/__tests__/integration/daily-guidance.test.ts
import { render, waitFor } from "@testing-library/react";
import DailyGuidance from "../commands/daily-guidance";

// Mock API responses
const mockGuidanceResponse = {
  success: true,
  data: {
    workflow_type: "daily",
    engines_used: ["biorhythm", "iching", "tarot"],
    results: {
      biorhythm: {
        physical: { value: 0.8, phase: "high", description: "High energy" },
        emotional: { value: 0.3, phase: "rising", description: "Improving mood" },
        intellectual: { value: -0.2, phase: "low", description: "Mental fatigue" },
      },
    },
    synthesis: {
      summary: "Today brings high physical energy with improving emotional state.",
      key_insights: ["Focus on physical activities", "Be patient with mental tasks"],
      recommendations: ["Exercise in the morning", "Take breaks for mental work"],
    },
  },
};

describe("DailyGuidance Integration", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGuidanceResponse),
    });
  });

  it("should load and display daily guidance", async () => {
    const { getByText, queryByText } = render(<DailyGuidance />);

    // Should show loading initially
    expect(queryByText("Loading...")).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(getByText("Today brings high physical energy")).toBeInTheDocument();
    });

    // Should display biorhythm data
    expect(getByText("Physical Energy")).toBeInTheDocument();
    expect(getByText("High energy")).toBeInTheDocument();

    // Should display insights
    expect(getByText("Focus on physical activities")).toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { getByText } = render(<DailyGuidance />);

    await waitFor(() => {
      expect(getByText("Error Loading Guidance")).toBeInTheDocument();
      expect(getByText("Network error")).toBeInTheDocument();
    });
  });
});
```

## 🔍 Quality Assurance

### Automated Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Test WitnessOS Raycast Extension

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Validate extension
        run: npx ray validate
      
      - name: Build extension
        run: npm run build

  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: Check for vulnerabilities
        run: npx audit-ci --high
```

### Manual Testing Checklist

#### Core Functionality
- [ ] **Daily Guidance**: Loads within 3 seconds
- [ ] **Engine Dashboard**: All engines display correctly
- [ ] **AI Forecasting**: Model selection works
- [ ] **Batch Processing**: Multiple engines calculate correctly
- [ ] **Error Handling**: Network errors handled gracefully

#### User Interface
- [ ] **Navigation**: All keyboard shortcuts work
- [ ] **Search**: Engine search functions properly
- [ ] **Actions**: Copy, save, share actions work
- [ ] **Loading States**: Appropriate loading indicators
- [ ] **Responsive**: UI adapts to different content sizes

#### Performance
- [ ] **Initial Load**: Extension loads under 2 seconds
- [ ] **API Calls**: Responses under 5 seconds
- [ ] **Memory Usage**: No memory leaks after extended use
- [ ] **Cache Performance**: Cached data loads instantly
- [ ] **Background Refresh**: Updates without blocking UI

## 📈 Monitoring & Analytics

### Error Tracking

```typescript
// src/utils/error-tracking.ts
import { environment } from "../config/environment";

interface ErrorReport {
  message: string;
  stack?: string;
  context: {
    command: string;
    user: string;
    timestamp: string;
    version: string;
  };
}

export class ErrorTracker {
  static async reportError(error: Error, context: Partial<ErrorReport["context"]> = {}) {
    if (!environment.isProduction) {
      console.error("Error:", error);
      return;
    }

    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context: {
        command: context.command || "unknown",
        user: "anonymous", // Never send personal data
        timestamp: new Date().toISOString(),
        version: environment.version,
        ...context,
      },
    };

    try {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      await fetch("https://api.witnessos.space/telemetry/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  }
}

// Global error handler
window.addEventListener("unhandledrejection", (event) => {
  ErrorTracker.reportError(
    new Error(event.reason?.message || "Unhandled promise rejection"),
    { command: "global" }
  );
});
```

### Usage Analytics

```typescript
// src/utils/analytics.ts
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

export class Analytics {
  private static events: AnalyticsEvent[] = [];

  static track(event: string, properties: Record<string, any> = {}) {
    if (!environment.isProduction) {
      console.log("Analytics:", event, properties);
      return;
    }

    this.events.push({
      event,
      properties: {
        ...properties,
        version: environment.version,
        platform: "raycast",
      },
      timestamp: new Date().toISOString(),
    });

    // Batch send events
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  private static async flush() {
    if (this.events.length === 0) return;

    const events = [...this.events];
    this.events = [];

    try {
      await fetch("https://api.witnessos.space/telemetry/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error("Failed to send analytics:", error);
      // Re-add events to queue
      this.events.unshift(...events);
    }
  }

  // Track common events
  static trackEngineCalculation(engine: string, duration: number) {
    this.track("engine_calculation", { engine, duration });
  }

  static trackAIForecast(model: string, engines: string[], duration: number) {
    this.track("ai_forecast", { model, engines, duration });
  }

  static trackError(error: string, context: string) {
    this.track("error", { error, context });
  }
}
```

## 🚀 Deployment Process

### Staging Deployment

```bash
#!/bin/bash
# scripts/deploy-staging.sh

echo "🚀 Deploying to Staging Environment"

# Build for staging
NODE_ENV=staging npm run build

# Deploy to staging team
ray publish --team witnessos-staging

echo "✅ Staging deployment complete"
echo "🔗 Test at: raycast://extensions/witnessos-staging/daily-guidance"
```

### Production Deployment

```bash
#!/bin/bash
# scripts/deploy-production.sh

echo "🚀 Deploying to Production"

# Ensure we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Must be on main branch for production deployment"
  exit 1
fi

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working directory must be clean"
  exit 1
fi

# Run full test suite
npm run test:full

# Build for production
NODE_ENV=production npm run build

# Create release tag
VERSION=$(node -p "require('./package.json').version")
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"

# Deploy to Raycast Store
ray publish

echo "✅ Production deployment complete"
echo "🎉 Version $VERSION is now live!"
```

### Rollback Procedure

```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "❌ Please specify version to rollback to"
  echo "Usage: ./scripts/rollback.sh v1.2.3"
  exit 1
fi

echo "🔄 Rolling back to $PREVIOUS_VERSION"

# Checkout previous version
git checkout "$PREVIOUS_VERSION"

# Build and deploy
NODE_ENV=production npm run build
ray publish

echo "✅ Rollback to $PREVIOUS_VERSION complete"
```

## 📋 Post-Deployment Checklist

### Immediate Verification (0-15 minutes)
- [ ] **Extension Loads**: Verify extension appears in Raycast
- [ ] **Authentication**: API token validation works
- [ ] **Core Commands**: Daily guidance loads successfully
- [ ] **Error Handling**: Network errors display properly
- [ ] **Performance**: Initial load under 3 seconds

### Extended Verification (15-60 minutes)
- [ ] **All Engines**: Test each consciousness engine
- [ ] **AI Forecasting**: Generate forecast with different models
- [ ] **Batch Processing**: Multiple engine calculations
- [ ] **Caching**: Verify cached responses load quickly
- [ ] **Background Refresh**: Automatic data updates work

### Long-term Monitoring (1-24 hours)
- [ ] **Error Rates**: Monitor error tracking dashboard
- [ ] **Performance Metrics**: Check response times
- [ ] **User Feedback**: Review user reports and ratings
- [ ] **API Usage**: Monitor API call patterns
- [ ] **Memory Usage**: Check for memory leaks

---

*This deployment guide ensures reliable, monitored releases of the WitnessOS Raycast extension with proper testing, rollback procedures, and quality assurance.*
