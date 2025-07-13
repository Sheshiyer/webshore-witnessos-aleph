# WitnessOS Raycast Extension

A comprehensive Raycast extension that integrates with the WitnessOS Consciousness API to provide spiritual guidance, consciousness insights, and mystical calculations directly in your workflow.

## 🌟 Features

- **Daily Guidance**: Get personalized daily consciousness insights
- **Numerology Readings**: Calculate your numerology profile
- **Tarot Readings**: Receive tarot guidance for your questions
- **Biorhythm Tracking**: Monitor your physical, emotional, and intellectual cycles
- **I-Ching Wisdom**: Consult ancient Chinese wisdom
- **Multi-Engine Workflows**: Access comprehensive consciousness analysis
- **AI-Enhanced Interpretations**: Get personalized insights powered by LLM

## 🚀 Installation

### Prerequisites

1. **Raycast**: Install [Raycast](https://raycast.com/) on your Mac
2. **WitnessOS Account**: Register at [WitnessOS](https://witnessos.space) and obtain your API token
3. **Node.js**: Version 16 or higher

### Setup

1. **Clone or Download** this extension code
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Extension**:
   - Open Raycast
   - Go to Extensions → Import Extension
   - Select this folder
   - Configure your preferences (see Configuration section)

## ⚙️ Configuration

### Required Preferences

1. **API Token**: Your WitnessOS JWT token
   - Register at https://api.witnessos.space/auth/register
   - Login to get your JWT token
   - Copy the token to this field

2. **Full Name**: Your complete name for consciousness calculations

3. **Birth Date**: Your birth date in YYYY-MM-DD format

### Optional Preferences

4. **Birth Time**: Your birth time in HH:MM format (for Human Design)
5. **Birth Location**: Your birth location (for Human Design)
6. **API Base URL**: Custom API endpoint (defaults to production)

### Getting Your API Token

```bash
# Register for an account
curl -X POST https://api.witnessos.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "your_secure_password",
    "name": "Your Name"
  }'

# Login to get your JWT token
curl -X POST https://api.witnessos.space/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "your_secure_password"
  }'
```

Copy the `token` field from the login response.

## 🎯 Available Commands

### 1. Daily Guidance
**Command**: `Daily Guidance`

Get comprehensive daily consciousness insights combining:
- Biorhythm analysis (physical, emotional, intellectual cycles)
- I-Ching wisdom and guidance
- Tarot insights for the day
- AI-synthesized recommendations

**Features**:
- Visual biorhythm indicators
- Copyable insights and recommendations
- Detailed view with full analysis
- Refresh capability

### 2. Numerology Reading
**Command**: `Numerology Reading`

Calculate your complete numerology profile:
- Life Path Number
- Expression Number
- Soul Urge Number
- Personality Number
- Detailed interpretations

### 3. Tarot Reading
**Command**: `Tarot Reading`

Get personalized tarot guidance:
- Ask specific questions
- Multiple spread types (3-card, Celtic Cross)
- Card meanings and interpretations
- Overall message synthesis

### 4. Biorhythm Check
**Command**: `Biorhythm Check`

Monitor your current energy cycles:
- Physical energy levels
- Emotional state
- Intellectual clarity
- 7-day forecast
- Optimization recommendations

### 5. I-Ching Wisdom
**Command**: `I-Ching Wisdom`

Consult ancient Chinese wisdom:
- Ask questions for guidance
- Hexagram generation
- Changing lines analysis
- Traditional interpretations

## 🔧 Development

### Project Structure

```
src/
├── api/
│   └── witnessos-client.ts    # Main API client
├── daily-guidance.tsx         # Daily guidance command
├── numerology-reading.tsx     # Numerology command
├── tarot-reading.tsx          # Tarot command
├── biorhythm-check.tsx        # Biorhythm command
└── iching-wisdom.tsx          # I-Ching command
```

### API Client Features

The `WitnessOSAPI` client provides:

- **Authentication**: Automatic JWT token handling
- **Error Handling**: Comprehensive error management with user feedback
- **Caching**: Intelligent caching for repeated calculations
- **Rate Limiting**: Respects API rate limits
- **Type Safety**: Full TypeScript support
- **User Profile**: Automatic user profile management

### Key Methods

```typescript
// Individual engine calculations
api.calculateNumerology()
api.getTarotReading(question, spreadType)
api.calculateBiorhythm(targetDate)
api.consultIChing(question)
api.calculateHumanDesign()

// Multi-engine workflows
api.getDailyGuidance()
api.getNatalAnalysis()
api.getCareerGuidance()
api.getSpiritualGuidance()
api.getRelationshipInsights()

// AI-enhanced features
api.getAIEnhancedReading(engine, input, focusArea)
api.synthesizeResults(results, userContext)

// Batch processing
api.batchCalculate(calculations)
```

### Building and Testing

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run fix-lint
```

## 🎨 UI Components

### List Views
- **Biorhythm Indicators**: Color-coded energy levels
- **Insight Cards**: Structured consciousness insights
- **Action Items**: Copyable recommendations
- **Navigation**: Seamless command switching

### Detail Views
- **Markdown Reports**: Comprehensive analysis reports
- **Copy Actions**: Easy sharing of insights
- **Navigation**: Back/forward between views

### Error Handling
- **Toast Notifications**: User-friendly error messages
- **Retry Actions**: Automatic retry capabilities
- **Validation**: Input validation with helpful messages

## 🔐 Security

- **Token Storage**: Secure preference storage
- **HTTPS Only**: All API calls use HTTPS
- **No Data Persistence**: No local storage of sensitive data
- **Rate Limiting**: Respects API rate limits

## 🚀 Performance

- **Caching**: Intelligent caching reduces API calls
- **Parallel Processing**: Batch calculations when possible
- **Lazy Loading**: Components load data on demand
- **Error Recovery**: Graceful handling of network issues

## 📊 API Integration

### Supported Endpoints

| Endpoint | Purpose | Authentication |
|----------|---------|----------------|
| `/health` | API health check | No |
| `/engines` | List available engines | No |
| `/engines/{engine}/calculate` | Single engine calculation | Yes |
| `/engines/{engine}/ai-enhanced` | AI-enhanced calculation | Yes |
| `/workflows/{type}` | Multi-engine workflows | Yes |
| `/batch` | Batch calculations | Yes |
| `/ai/synthesis` | AI result synthesis | Yes |

### Response Format

All API responses follow this structure:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  processingTime?: number;
  cached?: boolean;
  requestId?: string;
}
```

## 🔄 Workflows

### Daily Guidance Workflow
1. **Biorhythm Calculation**: Current energy cycles
2. **I-Ching Consultation**: Daily wisdom
3. **Tarot Reading**: Daily guidance card
4. **AI Synthesis**: Personalized recommendations

### Natal Analysis Workflow
1. **Numerology**: Life path and core numbers
2. **Human Design**: Type, strategy, authority
3. **Vimshottari**: Current dasha period
4. **AI Integration**: Comprehensive life analysis

## 🎯 Use Cases

### Personal Development
- Daily consciousness check-ins
- Life purpose exploration
- Spiritual practice guidance
- Energy optimization

### Decision Making
- Career guidance
- Relationship insights
- Timing optimization
- Challenge navigation

### Spiritual Practice
- Meditation guidance
- Sacred geometry insights
- Archetypal exploration
- Shadow work support

## 🔧 Troubleshooting

### Common Issues

1. **"API Token Required"**
   - Ensure you've set your JWT token in preferences
   - Verify the token is valid by testing login

2. **"Profile Configuration Required"**
   - Set your full name and birth date in preferences
   - Ensure birth date is in YYYY-MM-DD format

3. **"Network Error"**
   - Check your internet connection
   - Verify API base URL is correct
   - Try refreshing the command

4. **"Rate Limit Exceeded"**
   - Wait for the rate limit to reset
   - Reduce frequency of API calls

### Debug Mode

Enable debug logging by setting:
```bash
export RAYCAST_DEBUG=1
```

## 📚 Resources

- **WitnessOS API Documentation**: [API Docs](../../../api/README.md)
- **OpenAPI Specification**: [openapi.yaml](../../../api/openapi.yaml)
- **Integration Guide**: [EXTERNAL_API_INTEGRATION.md](../../EXTERNAL_API_INTEGRATION.md)
- **Raycast Documentation**: [Raycast Docs](https://developers.raycast.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Support

For support and questions:
- **API Issues**: api@witnessos.space
- **Extension Issues**: Create an issue in the repository
- **Documentation**: https://docs.witnessos.space

---

**Experience consciousness technology directly in your workflow! ✨**