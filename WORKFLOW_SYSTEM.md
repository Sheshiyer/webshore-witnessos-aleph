# WitnessOS Workflow System

## Overview

The WitnessOS Workflow System provides sophisticated multi-engine orchestration for consciousness analysis and external integrations. Built on Cloudflare Workers, it offers scalable, durable workflow execution with AI synthesis integration.

## Architecture

### Specialized Workers

#### 1. Consciousness Workflow Worker (`consciousness-workflow-worker.ts`)
**Purpose**: Handles consciousness-based workflows (natal, career, spiritual development)

**Capabilities**:
- Multi-engine parallel execution
- AI synthesis integration
- Personalized recommendations
- Result caching and optimization

**Supported Workflows**:
- **Natal Chart Analysis**: Complete birth chart interpretation with personality insights
- **Career Guidance**: Professional path analysis using multiple consciousness engines
- **Spiritual Development**: Growth-oriented analysis with transformational insights

#### 2. Integration Workflow Worker (`integration-workflow-worker.ts`)
**Purpose**: Handles external integrations (Raycast, Slack, webhooks, APIs)

**Capabilities**:
- Data collection and processing
- Multi-format output generation
- External service delivery
- Integration state management

**Supported Integrations**:
- **Raycast**: Daily/weekly forecasts and quick insights
- **Slack**: Team consciousness insights and notifications
- **Webhooks**: Real-time data delivery to external systems
- **API Integrations**: Custom data exchange protocols

## API Endpoints

### Consciousness Workflows

#### POST `/workflows/natal`
Execute natal chart workflow with comprehensive birth chart analysis.

**Request Body**:
```json
{
  "userProfile": {
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthLocation": "New York, NY",
    "timezone": "America/New_York"
  },
  "options": {
    "includeTransits": true,
    "includePredictions": true,
    "detailLevel": "comprehensive"
  }
}
```

**Response**:
```json
{
  "workflowId": "natal_abc123",
  "status": "completed",
  "results": {
    "engineResults": {
      "humanDesign": { /* Human Design analysis */ },
      "numerology": { /* Numerology insights */ },
      "astrology": { /* Astrological interpretation */ }
    },
    "aiSynthesis": "Comprehensive personality analysis...",
    "insights": ["Key insight 1", "Key insight 2"],
    "recommendations": ["Action 1", "Action 2"]
  },
  "processingTime": 1250,
  "cached": false
}
```

#### POST `/workflows/career`
Execute career guidance workflow for professional development insights.

#### POST `/workflows/spiritual`
Execute spiritual development workflow for growth-oriented analysis.

### Integration Workflows

#### POST `/workflows/integration`
Execute integration workflow for external service delivery.

**Request Body**:
```json
{
  "integrationType": "raycast",
  "userProfile": {
    "userId": "user123",
    "preferences": {
      "forecastType": "daily",
      "engines": ["biorhythm", "numerology"]
    }
  },
  "integrationConfig": {
    "format": "markdown",
    "includeActions": true,
    "maxLength": 500
  }
}
```

### Workflow Status

#### GET `/workflows/{workflowId}/status`
Retrieve the current status and results of a workflow execution.

## Workflow Execution Process

### Consciousness Workflow Steps

1. **Input Validation**: Validate user profile and options
2. **Engine Selection**: Determine relevant engines based on workflow type
3. **Parallel Execution**: Execute multiple engines simultaneously
4. **AI Synthesis**: Generate comprehensive interpretation using AI
5. **Insights Generation**: Extract key insights and patterns
6. **Recommendations**: Create actionable recommendations
7. **Result Caching**: Cache results for future optimization

### Integration Workflow Steps

1. **Validation**: Validate integration type and configuration
2. **Data Collection**: Gather engine results and forecasts
3. **AI Synthesis**: Generate integration-specific content
4. **Format Processing**: Format data for target integration
5. **Delivery**: Send data to external service
6. **State Management**: Update integration status and cache

## Configuration

### Environment Variables

```bash
# Service Configuration
ENVIRONMENT=production
SERVICE_NAME=consciousness-workflow
ENABLE_CACHING=true

# Performance Settings
MAX_PARALLEL_ENGINES=5
WORKFLOW_TIMEOUT=30000
CACHE_TTL=3600
```

### Service Dependencies

- **ENGINE_SERVICE**: Core engine calculation service
- **AI_SERVICE**: AI synthesis and interpretation service
- **FORECAST_SERVICE**: Daily/weekly forecast generation (integration workflows)

### KV Storage

- **KV_CACHE**: Workflow result caching
- **KV_USER_PROFILES**: User profile and preference storage
- **KV_INTEGRATIONS**: Integration state and configuration (integration workflows)

## Deployment

### Prerequisites

1. Cloudflare Workers account with Workflows enabled
2. Wrangler CLI installed and authenticated
3. Required KV namespaces created
4. Service dependencies deployed

### Deployment Commands

```bash
# Deploy consciousness workflow worker
wrangler deploy --config wrangler-consciousness-workflow.toml

# Deploy integration workflow worker
wrangler deploy --config wrangler-integration-workflow.toml

# Deploy all workflows (using provided script)
./deploy-workflows.sh
```

### Environment-Specific Deployment

```bash
# Development
wrangler deploy --config wrangler-consciousness-workflow.toml --env development

# Staging
wrangler deploy --config wrangler-consciousness-workflow.toml --env staging

# Production
wrangler deploy --config wrangler-consciousness-workflow.toml --env production
```

## Monitoring and Debugging

### Log Monitoring

```bash
# Monitor consciousness workflow logs
wrangler tail --config wrangler-consciousness-workflow.toml

# Monitor integration workflow logs
wrangler tail --config wrangler-integration-workflow.toml

# Filter for errors only
wrangler tail --config wrangler-consciousness-workflow.toml --format json | grep ERROR
```

### Performance Metrics

- **Execution Time**: Target <2000ms for consciousness workflows
- **Cache Hit Rate**: Target >80% for repeated requests
- **Error Rate**: Target <1% for production workflows
- **Parallel Efficiency**: Target 70%+ time savings vs sequential execution

### Health Checks

```bash
# Check workflow service health
curl -X GET "https://api.witnessos.space/workflows/health"

# Check specific workflow status
curl -X GET "https://api.witnessos.space/workflows/{workflowId}/status"
```

## Integration Examples

### Frontend Integration

```typescript
// Execute natal workflow
const response = await fetch('/workflows/natal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userProfile: {
      birthDate: '1990-01-15',
      birthTime: '14:30',
      birthLocation: 'New York, NY',
      timezone: 'America/New_York'
    },
    options: {
      includeTransits: true,
      detailLevel: 'comprehensive'
    }
  })
});

const workflow = await response.json();
console.log('Workflow results:', workflow.results);
```

### Raycast Integration

```typescript
// Get daily forecast for Raycast
const response = await fetch('/workflows/integration', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    integrationType: 'raycast',
    userProfile: { userId: 'user123' },
    integrationConfig: {
      format: 'markdown',
      includeActions: true
    }
  })
});

const forecast = await response.json();
```

## Error Handling

### Common Error Codes

- **400**: Invalid request parameters or missing required fields
- **401**: Authentication required or invalid token
- **404**: Workflow not found or invalid workflow ID
- **429**: Rate limit exceeded
- **500**: Internal workflow execution error
- **503**: Service temporarily unavailable

### Error Response Format

```json
{
  "error": {
    "code": "WORKFLOW_EXECUTION_FAILED",
    "message": "Engine calculation timeout",
    "details": {
      "failedEngines": ["humanDesign"],
      "executionTime": 30000
    }
  },
  "workflowId": "natal_abc123",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

## Future Enhancements

### Planned Features

1. **Workflow Templates**: Pre-configured workflow templates for common use cases
2. **Custom Workflows**: User-defined workflow creation and execution
3. **Batch Processing**: Execute workflows for multiple users simultaneously
4. **Advanced Caching**: Intelligent caching based on user patterns and preferences
5. **Real-time Updates**: WebSocket support for real-time workflow progress updates
6. **Workflow Scheduling**: Scheduled execution for recurring analyses

### Performance Optimizations

1. **Engine Preloading**: Warm engine instances for faster execution
2. **Result Streaming**: Stream partial results as they become available
3. **Adaptive Timeouts**: Dynamic timeout adjustment based on workflow complexity
4. **Load Balancing**: Distribute workflows across multiple worker instances

## Support

For technical support or questions about the workflow system:

1. Check the logs using `wrangler tail`
2. Review the error response details
3. Verify service dependencies are healthy
4. Check KV namespace permissions and data
5. Validate authentication tokens and user permissions

The workflow system is designed to be resilient and self-healing, with comprehensive error handling and automatic retries for transient failures.