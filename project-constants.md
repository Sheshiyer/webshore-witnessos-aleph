# WitnessOS Project Constants & Vision

## 🎯 Project Vision & Mission

### **Core Mission**
WitnessOS is a consciousness exploration platform that bridges ancient wisdom with modern technology, providing users with deep insights through 11 consciousness engines while maintaining the highest standards of accuracy and user experience.

### **Macro Vision**
Create the world's most comprehensive consciousness technology platform that serves as a digital gateway for spiritual exploration, personal growth, and archetypal understanding through scientifically-grounded calculations and AI-powered synthesis.

### **Success Metrics**
- **User Engagement:** >80% user retention after first reading
- **Calculation Accuracy:** 100% astronomical accuracy for Human Design and Gene Keys
- **Performance:** <3s page load times, <100ms API responses
- **User Experience:** <5 minute onboarding with <10% drop-off rate

## 🏗️ Architecture Constants

### **Technology Stack**
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Three.js, Framer Motion
- **Backend:** Cloudflare Workers, D1 Database, KV Storage, R2 Buckets
- **Engines:** Python FastAPI on Railway with Swiss Ephemeris
- **AI:** OpenRouter API with Claude 3 Haiku for synthesis
- **Deployment:** Cloudflare Pages (Frontend), Cloudflare Workers (API), Railway (Engines)

### **System Boundaries**
- **Frontend Scope:** User interface, authentication, state management, visualizations
- **Backend Scope:** API orchestration, caching, user management, data persistence
- **Engine Scope:** Consciousness calculations, astronomical computations, data processing
- **AI Scope:** Result synthesis, interpretation, personalized insights

### **Performance Targets**
- **Page Load Time:** <3 seconds initial load
- **API Response Time:** <100ms cached, <2000ms calculated
- **Engine Calculation:** <5 seconds for complex calculations
- **Cache Hit Rate:** >80% for daily forecasts, >70% for engine results

## 🎨 Design System Constants

### **Color Palette (Cyberpunk Theme)**
- **Primary Cyan:** `#00FFFF` - Main accent, active states
- **Primary Magenta:** `#FF00FF` - Secondary accent, highlights
- **Primary Purple:** `#8A2BE2` - Tertiary accent, depth
- **Background Black:** `#000000` - Primary background
- **Text White:** `#FFFFFF` - Primary text
- **Glass Effect:** `rgba(255, 255, 255, 0.1)` - Glassmorphic elements

### **Typography**
- **Primary Font:** Geist Sans - Clean, modern, highly readable
- **Monospace Font:** Geist Mono - Code, technical displays
- **Heading Scale:** 3rem, 2.25rem, 1.875rem, 1.5rem, 1.25rem, 1rem
- **Body Text:** 1rem base, 1.125rem large, 0.875rem small

### **Animation Principles**
- **Duration:** 150ms micro, 300ms standard, 500ms complex
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design
- **Matrix Effects:** Character switching, glitch transitions
- **Sacred Geometry:** Golden ratio-based scaling and positioning

## 🔧 Development Constants

### **Environment Configuration**
- **Development:** Local Next.js + Production Railway engines
- **Staging:** Cloudflare staging + Production Railway engines
- **Production:** Cloudflare production + Railway production engines

### **API Endpoints**
- **Production API:** `https://api.witnessos.space`
- **Railway Engines:** `https://webshore-witnessos-aleph-production.up.railway.app`
- **Frontend:** `https://witnessos.space`

### **Database Schema**
- **Users Table:** id, email, name, created_at, verified, preferences, onboarding_status
- **Readings Table:** id, user_id, engine_name, input_data, result_data, created_at
- **API Keys Table:** id, user_id, key_hash, scopes, created_at, expires_at

## 🎮 User Experience Constants

### **Onboarding Tiers**
- **Tier 1:** Email, password registration
- **Tier 2:** Birth date, birth time, birth location (lat/long)
- **Tier 3:** Card selection, name, direction, preferences

### **Engine Organization**
- **Tier 1 Engines:** Numerology, Biorhythm, Tarot, I Ching
- **Tier 2 Engines:** Human Design, Gene Keys, Vimshottari, Enneagram
- **Tier 3 Engines:** Sacred Geometry, Sigil Forge

### **Admin User Configuration**
- **Email:** `sheshnarayan.iyer@gmail.com`
- **Name:** `Cumbipuram Nateshan Sheshnarayan`
- **Birth:** August 13, 1991, 13:31, Bangalore, India
- **Coordinates:** 12.9629°N, 77.5775°E
- **Preferences:** Direction: East, Card: Alchemist

## 🔒 Security Constants

### **Authentication**
- **JWT Expiry:** 7 days
- **Refresh Token Expiry:** 30 days
- **Password Requirements:** Minimum 6 characters
- **Rate Limiting:** 1000 requests/hour for authenticated users

### **API Security**
- **CORS Origins:** `*` (configured per environment)
- **API Key Format:** `wos_live_` or `wos_test_` + 32 character random string
- **Encryption:** AES-256 for sensitive data
- **HTTPS:** Enforced in production

## 📊 Business Constants

### **Consciousness Engines (11 Total)**
1. **Human Design** - Bodygraph, type, profile, authority
2. **Numerology** - Life path, expression, soul urge numbers
3. **Biorhythm** - Physical, emotional, intellectual cycles
4. **Vimshottari** - Planetary periods and sub-periods
5. **Tarot** - Card spreads and interpretations
6. **I Ching** - Hexagrams and changing lines
7. **Gene Keys** - Genetic codon activations
8. **Enneagram** - Personality types and wings
9. **Sacred Geometry** - Mandala and pattern generation
10. **Sigil Forge** - Intention-based sigil creation
11. **VedicClock-TCM** - Multi-dimensional consciousness optimization combining Vedic time cycles with TCM organ rhythms

### **Target Markets**
- **Primary:** Spiritual seekers, consciousness explorers
- **Secondary:** Astrology enthusiasts, personal development users
- **Tertiary:** Developers, API consumers, integration partners

## 🚀 Deployment Constants

### **Cloudflare Configuration**
- **Zone ID:** `cf14b78dd6490cd4e21cd91af1ac7cb7`
- **KV Namespaces:** Cache, User Profiles, Forecasts, Engine Data, Secrets
- **D1 Database:** `witnessos-db` (36b03146-4184-45cc-9ed6-a24f0747cdb5)
- **R2 Bucket:** `witnessos-reports`

### **Railway Configuration**
- **Service:** `witnessos-engines`
- **Runtime:** Python 3.11
- **Dependencies:** FastAPI, Swiss Ephemeris, Pydantic
- **Health Check:** `/health` endpoint

## 🔄 Maintenance Constants

### **Update Cycles**
- **Security Updates:** Immediate
- **Feature Updates:** Bi-weekly sprints
- **Documentation Updates:** Weekly
- **Performance Reviews:** Monthly

### **Monitoring Thresholds**
- **Error Rate:** <1% for critical endpoints
- **Response Time:** <100ms for cached, <2000ms for calculated
- **Uptime:** >99.9% for all services
- **Cache Hit Rate:** >70% for engine results

---

**Purpose:** This document serves as the single source of truth for all project-wide constants, preventing scope drift and ensuring consistency across all development streams.

**Maintenance:** Update this document whenever core project parameters change. All team members should reference these constants when making architectural or design decisions.

**Last Updated:** January 28, 2025 - Project consolidation phase
