# WitnessOS Verbose Logging Guide

## Overview

WitnessOS now includes comprehensive verbose logging capabilities designed to help developers debug engine calculations, API responses, and performance issues. The logging system provides detailed insights into every step of the calculation process.

## Features

### 🎯 Enhanced API Logging
- **Request tracking** with unique request IDs
- **Input/output size monitoring** for performance analysis
- **Timing measurements** for each calculation phase
- **Error tracking** with stack traces and context
- **Emoji indicators** for easy log scanning

### 🔧 Engine-Level Logging
- **Step-by-step calculation tracking**
- **Input validation logging**
- **Confidence score monitoring**
- **Memory usage insights**
- **Performance bottleneck identification**

### 🤖 AI Enhancement Logging
- **Base calculation vs AI enhancement timing**
- **Token usage tracking**
- **Model configuration logging**
- **User context analysis**

## Log Indicators

| Emoji | Meaning | Usage |
|-------|---------|-------|
| 🚀 | Starting process | Beginning of calculations |
| 📥 | Input received | Data input logging |
| 📤 | Output generated | Data output logging |
| ⏱️ | Timing info | Performance measurements |
| 📊 | Data metrics | Size, count, statistics |
| 🎯 | Completion | Successful completion |
| ✅ | Success | Successful operations |
| ❌ | Error | Failed operations |
| 🧠 | AI processing | AI-related operations |
| 🤖 | AI enhancement | AI enhancement processes |
| 👤 | User context | User-related information |
| ⚙️ | Configuration | Settings and config |
| 🔢 | Numerology | Numerology-specific logs |
| 🃏 | Tarot | Tarot-specific logs |

## Configuration

### Engine Configuration

Verbose logging is automatically enabled for all engine calculations through the API. You can also configure it manually:

```typescript
const engineConfig = {
  requestId: 'unique-request-id',
  verboseLogging: true,
  debugMode: true,
  enableLogging: true
};

const result = await calculateEngine('tarot', input, engineConfig);
```

### Environment Variables

- `NODE_ENV=development` - Enables debug mode automatically
- Verbose logging is enabled by default in all environments

## Log Examples

### Tarot Engine Calculation
```
🚀 [req_123] Starting Tarot calculation
📥 [req_123] Input keys: ["question", "spreadType", "deck"]
📊 [req_123] Input size: 156 bytes
⏱️ [req_123] Input validation completed in 2ms
🚀 [req_123] Starting core calculation
⏱️ [req_123] Core calculation completed in 45ms
⏱️ [req_123] Interpretation generation completed in 23ms
⏱️ [req_123] Recommendations generation completed in 12ms
🎯 [req_123] Confidence score: 0.87
✅ [req_123] Tarot calculation completed successfully in 89ms
```

### AI-Enhanced Calculation
```
🤖 [req_456] AI-Enhanced calculation for numerology
📥 [req_456] Input keys: ["fullName", "birthDate", "system"]
📊 [req_456] Input size: 98 bytes
⚙️ [req_456] AI Config: {"model": "gpt-3.5-turbo", "maxTokens": 1000}
🚀 [req_456] Starting base numerology calculation
⏱️ [req_456] Base calculation completed in 67ms
✅ [req_456] Base calculation successful, starting AI enhancement
🧠 [req_456] Starting AI interpretation
🧠 [req_456] AI enhancement completed in 1234ms
📤 [req_456] AI interpretation size: 2456 bytes
🎯 [req_456] AI-enhanced calculation completed successfully in 1301ms
```

### Error Logging
```
❌ [req_789] Numerology calculation failed
📊 [req_789] Error: Invalid birth date format
📊 [req_789] Processing time: 12ms
📥 [req_789] Input: {"fullName": "John Doe", "birthDate": "invalid"}
```

## Testing Verbose Logging

### Using the Test Script

Run the included test script to see verbose logging in action:

```bash
node test_verbose_logging.js
```

This will:
1. Test all available engines with sample data
2. Demonstrate AI-enhanced calculations
3. Show timing and performance metrics
4. Generate comprehensive log output

### Manual Testing

Make API calls to any engine endpoint:

```bash
curl -X POST https://your-api-url/engines/tarot/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "question": "What should I focus on?",
      "spreadType": "three_card"
    }
  }'
```

## Performance Monitoring

### Key Metrics Tracked

1. **Input Validation Time** - How long input validation takes
2. **Core Calculation Time** - Engine-specific calculation duration
3. **Interpretation Generation** - Time to generate human-readable output
4. **AI Enhancement Time** - Duration of AI processing (if enabled)
5. **Total Processing Time** - End-to-end request duration
6. **Memory Usage** - Input/output data sizes

### Performance Optimization

Use the logs to identify:
- **Slow calculations** - Look for high timing values
- **Large payloads** - Monitor input/output sizes
- **Validation bottlenecks** - Check validation timing
- **AI enhancement overhead** - Compare base vs enhanced timing

## Debugging Common Issues

### Input Validation Failures
Look for:
```
❌ [req_id] Input validation failed
📥 [req_id] Input: {...}
```

### Calculation Errors
Look for:
```
❌ [req_id] Engine calculation failed
📊 [req_id] Error: specific error message
📊 [req_id] Stack: error stack trace
```

### Performance Issues
Look for:
```
⏱️ [req_id] Calculation completed in 5000ms  # Unusually high
📊 [req_id] Input size: 50000 bytes          # Large input
```

## Best Practices

1. **Monitor Request IDs** - Use them to trace specific requests through logs
2. **Watch Timing Patterns** - Identify performance regressions
3. **Check Error Context** - Use detailed error logs for debugging
4. **Analyze Input Sizes** - Optimize large payloads
5. **Track Confidence Scores** - Monitor calculation quality

## Log Retention

- Logs are output to the console/stdout
- Configure your deployment environment for log retention
- Consider log aggregation services for production
- Filter by request ID for specific request tracing

## Security Considerations

- Sensitive data is not logged in detail
- Only data structure and sizes are logged
- Error messages may contain user input - review for sensitive data
- Consider log sanitization in production environments

---

*This verbose logging system is designed to make debugging WitnessOS engines as transparent and helpful as possible. The emoji indicators make it easy to scan logs quickly, while the detailed timing and context information helps identify issues and optimize performance.*