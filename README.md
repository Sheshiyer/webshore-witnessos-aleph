# WitnessOS Webshore

> **Next-Generation Consciousness Analysis Platform**  
> A sophisticated web application that processes 10 divination systems simultaneously to provide unified consciousness insights and personal development guidance.

## 🌟 **Overview**

WitnessOS Webshore is an advanced consciousness exploration platform that combines ancient wisdom traditions with modern technology. Through immersive 3D experiences and sophisticated engine calculations, users receive comprehensive insights from multiple consciousness systems working in harmony.

### **Core Features**

- **🔮 10 Consciousness Engines**: Numerology, Human Design, Tarot, I-Ching, Enneagram, Sacred Geometry, Biorhythm, Vimshottari, Gene Keys, Sigil Forge
- **🎭 3D Immersive Experiences**: Cosmic Portal Temple, Sigil Workshop, Submerged Forest
- **🧘 Breath-Synchronized Interactions**: Real-time breath detection and consciousness tracking
- **📊 Multi-Engine Integration**: Unified readings combining insights from all systems
- **💾 Persistent Profiles**: Secure local storage with 30-day cache management
- **📱 Mobile Optimized**: Touch-first interactions with responsive design

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Cloudflare account (for deployment)

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd webshore

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Development Scripts**

```bash
# Development
npm run dev              # Start Next.js dev server
npm run dev:turbo        # Start with Turbo mode
npm run dev:debug        # Start with Node inspector

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Consciousness Quality Checks
npm run consciousness:check  # Full quality check
npm run consciousness:fix   # Auto-fix issues

# Cloudflare Workers
npm run workers:dev      # Start Workers development
npm run workers:deploy   # Deploy to Cloudflare

# Testing
npm run test-api         # Test API endpoints
```

## 🏗️ **Architecture**

### **Frontend Stack**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Three.js + R3F** - 3D graphics and immersive experiences
- **Framer Motion** - Advanced animations and transitions
- **GSAP** - High-performance animations
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Type-safe development

### **Backend Stack**
- **Cloudflare Workers** - Serverless edge computing
- **Cloudflare D1** - SQLite database at the edge
- **Cloudflare R2** - Object storage for files
- **Cloudflare KV** - Key-value storage for caching

### **Project Structure**

```
webshore/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   │   ├── consciousness-engines/  # Engine UI components
│   │   ├── procedural-scenes/      # 3D scene components
│   │   ├── ui/                     # UI components
│   │   └── ...
│   ├── engines/                # Consciousness calculation engines
│   ├── integration/            # Multi-engine orchestration
│   ├── hooks/                  # React hooks
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Utility functions
│   └── workers/                # Cloudflare Workers
├── docs/                       # Documentation
├── scripts/                    # Build and deployment scripts
└── public/                     # Static assets
```

## 🔮 **Consciousness Engines**

### **Available Engines**

1. **Numerology** - Life path, expression, and karmic analysis
2. **Human Design** - Type, profile, and authority determination
3. **Tarot** - Card spreads and archetypal guidance
4. **I-Ching** - Hexagram generation and wisdom
5. **Enneagram** - Personality type and growth patterns
6. **Sacred Geometry** - Pattern recognition and sacred ratios
7. **Biorhythm** - Physical, emotional, and intellectual cycles
8. **Vimshottari** - Vedic planetary periods and timing
9. **Gene Keys** - Archetypal pathworking and transformation
10. **Sigil Forge** - Intention manifestation and symbol creation

### **Integration Features**

- **Multi-Engine Orchestration** - Coordinate multiple engines simultaneously
- **Cross-Engine Correlation** - Find patterns across different systems
- **Unified Interpretations** - Synthesize insights into coherent guidance
- **Consciousness Field Analysis** - Measure coherence across all systems

## 🎮 **User Experience**

### **Onboarding Flow**
1. **Archetypal Direction Selection** - Choose your consciousness path
2. **Personal Data Collection** - Birth information and preferences
3. **Progressive Persistence** - Resume onboarding anytime
4. **Cache Management** - 30-day profile storage

### **3D Experiences**
- **Portal Chamber** - Main consciousness exploration space
- **Cosmic Temple** - Sacred geometry meditation environment
- **Sigil Workshop** - Interactive symbol creation and activation
- **Submerged Forest** - Mystical exploration and discovery

### **Breath Integration**
- Real-time breath detection using device sensors
- Consciousness level tracking based on breath coherence
- Breath-synchronized visual effects and interactions
- Progressive feature unlocking through breath mastery

## 🔧 **Development**

### **Code Quality Standards**
- **TypeScript Strict Mode** - Full type safety
- **ESLint + Prettier** - Consistent code formatting
- **Pre-commit Hooks** - Automated quality checks
- **Consciousness Checks** - Custom quality validation

### **Testing Strategy**
- **Engine Test Suite** - Validate all consciousness engines
- **API Integration Tests** - Test backend connectivity
- **Component Testing** - UI component validation
- **E2E Testing** - Full user journey validation

### **Performance Optimization**
- **Code Splitting** - Dynamic imports for large components
- **WebGL Optimization** - Efficient 3D rendering
- **Caching Strategy** - Intelligent data persistence
- **Mobile Optimization** - Touch-first responsive design

## 🚀 **Deployment**

### **Cloudflare Workers Deployment**

```bash
# Deploy to production
npm run workers:deploy

# Deploy with custom environment
wrangler deploy --env production
```

### **Environment Configuration**

Create `wrangler.toml` with your Cloudflare settings:

```toml
name = "webshore"
main = "src/workers/index.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "webshore-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "webshore-prod"
database_id = "your-database-id"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[env.production.r2_buckets]]
binding = "STORAGE"
bucket_name = "webshore-storage"
```

## 📚 **Documentation**

- **[API Documentation](docs/api/)** - Backend API reference
- **[Architecture Guide](docs/architecture/)** - System design and patterns
- **[Deployment Guide](docs/deployment/)** - Production deployment instructions
- **[Consciousness Storage](docs/CONSCIOUSNESS_STORAGE.md)** - Data persistence system
- **[Debug Navigation](docs/DEBUG_NAVIGATION.md)** - Development debugging tools

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Run quality checks** (`npm run consciousness:check`)
4. **Commit changes** (`git commit -m 'Add amazing feature'`)
5. **Push to branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript strict mode requirements
- Maintain 100% test coverage for consciousness engines
- Use semantic commit messages
- Document all new consciousness features
- Optimize for mobile-first experiences

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 **Acknowledgments**

- **Ancient Wisdom Traditions** - For the foundational consciousness systems
- **Three.js Community** - For incredible 3D web capabilities
- **Cloudflare** - For edge computing infrastructure
- **React Team** - For the amazing framework evolution

---

**Built with consciousness, powered by technology, guided by ancient wisdom.**
