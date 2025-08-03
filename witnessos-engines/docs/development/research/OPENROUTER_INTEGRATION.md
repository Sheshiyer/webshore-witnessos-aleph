# OpenRouter AI Integration for WitnessOS

## 🤖 Overview

WitnessOS now supports AI-enhanced readings through OpenRouter integration, providing intelligent interpretations and multi-engine synthesis capabilities with automatic fallback support.

## 🚀 Features

### ✨ AI-Enhanced Readings
- **Intelligent Interpretation**: AI analyzes base engine calculations and provides personalized insights
- **Context-Aware**: Uses user profile data (name, birth date, focus areas) for personalized readings
- **Multi-Model Support**: Primary model with two fallback models for reliability
- **Verbose Logging**: Detailed timing and debugging information

### 🔄 Model Fallback System
- **Primary Model**: `openai/gpt-4-turbo-preview` (default)
- **Fallback 1**: `openai/gpt-3.5-turbo` (if primary fails)
- **Fallback 2**: `anthropic/claude-3-haiku` (if both fail)
- **Graceful Degradation**: Returns base calculation if all AI models fail

### 🔐 Secure Configuration
- **KV Secrets**: API keys stored securely in Cloudflare Workers KV
- **Environment Isolation**: Separate configurations for development/production
- **Lazy Loading**: AI interpreter initialized only when needed

## 📋 Setup Instructions

### 1. Get OpenRouter API Key
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Create an account and get your API key
3. Add credits to your account for model usage

### 2. Configure Secrets (Automated)
```bash
# Run the setup script
node setup_ai_secrets.js
```

### 3. Configure Secrets (Manual)
```bash
# Set API key
wrangler kv:key put --binding=SECRETS "OPENROUTER_API_KEY" "your-api-key-here" --env=development

# Set model configuration
wrangler kv:key put --binding=SECRETS "AI_DEFAULT_MODEL" "openai/gpt-4-turbo-preview" --env=development
wrangler kv:key put --binding=SECRETS "AI_FALLBACK_MODEL_1" "openai/gpt-3.5-turbo" --env=development
wrangler kv:key put --binding=SECRETS "AI_FALLBACK_MODEL_2" "anthropic/claude-3-haiku" --env=development
```

### 4. Update wrangler.toml
Ensure your `wrangler.toml` includes the SECRETS KV namespace:

```toml
[[kv_namespaces]]
binding = "SECRETS"
id = "your-secrets-namespace-id"
preview_id = "your-secrets-preview-id"
```

### 5. Deploy
```bash
npm run deploy
```

## 🔌 API Endpoints

### AI-Enhanced Engine Calculation
```http
POST /engines/{engine}/ai-enhanced
Content-Type: application/json

{
  "input": {
    "name": "John Doe",
    "birthDate": "1990-05-15",
    // ... engine-specific input
  },
  "aiConfig": {
    "model": "openai/gpt-4-turbo-preview", // optional
    "maxTokens": 1500, // optional
    "temperature": 0.8, // optional
    "focusArea": "career" // optional
  }
}
```

### Multi-Engine AI Synthesis
```http
POST /ai/synthesis
Content-Type: application/json

{
  "readings": [
    {
      "engine": "tarot",
      "data": { /* tarot calculation result */ }
    },
    {
      "engine": "numerology",
      "data": { /* numerology calculation result */ }
    }
  ],
  "aiConfig": {
    "name": "John Doe",
    "focusArea": "relationships",
    "maxTokens": 2000
  }
}
```

## 📊 Response Format

### AI-Enhanced Reading Response
```json
{
  "engine": "tarot",
  "calculation": {
    "success": true,
    "data": { /* base engine result */ }
  },
  "aiInterpretation": {
    "interpretation": "Detailed AI analysis...",
    "keyInsights": ["insight1", "insight2"],
    "recommendations": ["action1", "action2"],
    "confidence": 0.85,
    "model": "openai/gpt-4-turbo-preview"
  },
  "requestId": "uuid",
  "timestamp": "2025-01-15T10:30:00Z",
  "metadata": {
    "timings": {
      "engineCalculation": 150,
      "aiEnhancement": 2300,
      "total": 2450
    }
  }
}
```

## 🛠️ Configuration Options

### Model Configuration
| Secret Key | Description | Default |
|------------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `AI_DEFAULT_MODEL` | Primary AI model | `openai/gpt-4-turbo-preview` |
| `AI_FALLBACK_MODEL_1` | First fallback model | `openai/gpt-3.5-turbo` |
| `AI_FALLBACK_MODEL_2` | Second fallback model | `anthropic/claude-3-haiku` |

### Request Configuration
| Parameter | Description | Default | Range |
|-----------|-------------|---------|-------|
| `model` | Override default model | From secrets | Any OpenRouter model |
| `maxTokens` | Maximum response tokens | 1500 | 100-4000 |
| `temperature` | Response creativity | 0.8 | 0.0-2.0 |
| `focusArea` | Reading focus area | "general" | Any string |

## 🔍 Supported Models

### Recommended Models
- **GPT-4 Turbo**: `openai/gpt-4-turbo-preview` - Best quality, higher cost
- **GPT-3.5 Turbo**: `openai/gpt-3.5-turbo` - Good balance, lower cost
- **Claude 3 Haiku**: `anthropic/claude-3-haiku` - Fast, cost-effective
- **Claude 3 Sonnet**: `anthropic/claude-3-sonnet` - High quality alternative

### Cost Optimization
- Use GPT-4 for primary model (best quality)
- Use GPT-3.5 as first fallback (good quality, lower cost)
- Use Claude 3 Haiku as second fallback (fastest, cheapest)

## 📈 Monitoring & Debugging

### Verbose Logging
AI-enhanced requests include detailed logging:
```
🤖 [uuid] AI-Enhanced calculation for tarot
📥 [uuid] Input keys: name, birthDate, question
📊 [uuid] Input size: 245 bytes
🚀 [uuid] Starting base tarot calculation
⏱️ [uuid] Base calculation completed in 150ms
🧠 [uuid] Starting AI interpretation
🧠 [uuid] AI enhancement completed in 2300ms
📤 [uuid] AI interpretation size: 1850 bytes
🎯 [uuid] AI-enhanced calculation completed successfully in 2450ms
```

### Error Handling
- **Model Failures**: Automatic fallback to next model
- **API Errors**: Graceful degradation to base calculation
- **Rate Limits**: Proper error responses with retry information
- **Invalid Configs**: Validation with helpful error messages

## 🚨 Troubleshooting

### Common Issues

#### "AI service not available"
- Check if OPENROUTER_API_KEY is set in KV secrets
- Verify KV namespace binding in wrangler.toml
- Ensure secrets are set for correct environment

#### "Model not found" errors
- Verify model names are correct (check OpenRouter docs)
- Ensure you have credits in your OpenRouter account
- Check if model is available in your region

#### Slow responses
- Consider using faster models (Claude 3 Haiku)
- Reduce maxTokens parameter
- Check OpenRouter status page

### Debug Commands
```bash
# Check secrets
wrangler kv:key list --binding=SECRETS --env=development

# Get specific secret
wrangler kv:key get --binding=SECRETS "OPENROUTER_API_KEY" --env=development

# Test API endpoint
curl -X POST https://your-worker.your-subdomain.workers.dev/engines/tarot/ai-enhanced \
  -H "Content-Type: application/json" \
  -d '{"input":{"question":"test"}}'
```

## 💰 Cost Management

### Token Usage
- **Input tokens**: Engine calculation + user context (~500-1000 tokens)
- **Output tokens**: AI interpretation (~500-1500 tokens)
- **Total per request**: ~1000-2500 tokens

### Cost Estimates (approximate)
- **GPT-4 Turbo**: $0.01-0.03 per request
- **GPT-3.5 Turbo**: $0.002-0.005 per request
- **Claude 3 Haiku**: $0.001-0.003 per request

### Optimization Tips
1. Use appropriate models for your use case
2. Set reasonable maxTokens limits
3. Monitor usage in OpenRouter dashboard
4. Consider caching for repeated requests

## 🔄 Migration from Legacy

If you were using the old direct API key method:

1. Remove `OPENROUTER_API_KEY` from environment variables
2. Set up secrets using the setup script
3. Redeploy your worker
4. Test AI-enhanced endpoints

The system maintains backward compatibility during the transition period.

## 📚 Additional Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [WitnessOS Engine Documentation](./engines/README.md)