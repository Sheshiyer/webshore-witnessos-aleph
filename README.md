# 🧠 WitnessOS - Consciousness Technology Platform

> *Bridging ancient wisdom with modern technology through 13 consciousness engines*

## 🌟 Overview

WitnessOS is a comprehensive consciousness exploration platform that provides deep insights through scientifically-grounded calculations and AI-powered synthesis. Our platform combines traditional wisdom systems with cutting-edge technology to offer users personalized guidance and archetypal understanding.

## 🚀 Live Platform

- **Frontend**: [https://witnessos.space](https://witnessos.space) *(pending domain configuration)*
- **API**: [https://api.witnessos.space](https://api.witnessos.space)
- **Staging**: [https://784e625f.witnessos-frontend.pages.dev](https://784e625f.witnessos-frontend.pages.dev)

## 🔮 Consciousness Engines (13 Total)

### **Core Foundations**
1. **Numerology** - Life path, expression, and soul urge analysis
2. **Biorhythm** - Physical, emotional, and intellectual cycles
3. **Human Design** - Bodygraph, type, profile, and authority mapping

### **Divination & Guidance**
4. **Tarot** - Archetypal card spreads and symbolic interpretation
5. **I Ching** - Ancient hexagram wisdom and changing lines

### **Psychological & Personality**
6. **Enneagram** - Nine personality types and growth patterns
7. **Gene Keys** - Genetic codon activations and transformation paths

### **Advanced Systems**
8. **Vimshottari** - Vedic planetary periods and timing analysis
9. **Sacred Geometry** - Mandala generation and pattern recognition

### **Manifestation & Energy**
10. **Sigil Forge** - Intention-based symbol creation and manifestation
11. **VedicClock-TCM** - Multi-dimensional consciousness optimization
12. **Face Reading** - Constitutional analysis through physiognomy
13. **Biofield** - Energy field analysis and electromagnetic mapping

## 🏗️ Architecture

### **Frontend**
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with cyberpunk theme
- **3D Graphics**: Three.js and React Three Fiber
- **Animations**: Framer Motion
- **Deployment**: Cloudflare Pages

### **Backend API**
- **Platform**: Cloudflare Workers with RPC bindings
- **Database**: Cloudflare D1 + KV Storage
- **Caching**: Intelligent multi-layer caching
- **Authentication**: JWT with secure session management

### **Consciousness Engines**
- **Runtime**: Python FastAPI on Railway
- **Calculations**: Swiss Ephemeris for astronomical accuracy
- **AI Synthesis**: OpenRouter API with Claude 3 Haiku
- **Data Processing**: Real-time consciousness analysis

## 🎯 Key Features

- **🔐 Secure Authentication** - JWT-based with tier-based onboarding
- **⚡ Real-time Calculations** - Sub-second response times with caching
- **🎨 Cyberpunk UI** - Matrix-inspired design with sacred geometry
- **📱 Responsive Design** - Optimized for all devices
- **🤖 AI-Powered Synthesis** - Intelligent result interpretation
- **🔄 Auto-Save Readings** - Persistent consciousness journey tracking

## 🛠️ Development

### **Prerequisites**
- Node.js 18+
- Python 3.11+
- Cloudflare account
- Railway account

### **Local Setup**
```bash
# Clone repository
git clone https://github.com/Sheshiyer/webshore-witnessos-aleph.git
cd webshore-witnessos-aleph

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Configure your environment variables

# Start development server
npm run dev
```

### **Environment Variables**
```env
NEXT_PUBLIC_API_URL=https://api.witnessos.space
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_FALLBACK_MODE=false
```

## 📚 Documentation

- **[Project Constants](./project-constants.md)** - Core configuration and vision
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Engine Addition Workflow](./ENGINE_ADDITION_WORKFLOW.md)** - Adding new engines
- **[Deployment Guide](./DEPLOYMENT_SUMMARY.md)** - Production deployment

## 🔧 API Usage

### **Health Check**
```bash
curl https://api.witnessos.space/health
```

### **List Engines**
```bash
curl https://api.witnessos.space/engines
```

### **Calculate Numerology**
```bash
curl -X POST https://api.witnessos.space/calculate/numerology \
  -H "Content-Type: application/json" \
  -d '{"input": {"fullName": "John Doe", "birthDate": "1990-01-01"}}'
```

## 🎮 User Experience

### **Onboarding Tiers**
- **Tier 1**: Email and password registration
- **Tier 2**: Birth data (date, time, location coordinates)
- **Tier 3**: Preferences (card selection, direction, name)

### **Engine Access**
- **Tier 1 Engines**: Available after basic registration
- **Tier 2 Engines**: Require birth data for astronomical calculations
- **Tier 3 Engines**: Advanced features with full profile completion

## 🔒 Security & Privacy

- **Data Encryption**: AES-256 for sensitive information
- **Privacy First**: No biometric data retention
- **HTTPS Enforced**: All communications encrypted
- **Rate Limiting**: 1000 requests/hour for authenticated users

## 📊 Performance

- **Page Load**: <3 seconds initial load
- **API Response**: <100ms cached, <2000ms calculated
- **Uptime**: >99.9% across all services
- **Cache Hit Rate**: >80% for daily forecasts

## 🤝 Contributing

We welcome contributions! Please see our [contribution guidelines](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Swiss Ephemeris for astronomical calculations
- OpenRouter for AI synthesis capabilities
- Cloudflare for edge computing infrastructure
- Railway for Python engine hosting

---

**Built with ❤️ for consciousness explorers worldwide**

*Last Updated: August 3, 2025*
