# WitnessOS Consolidated Consciousness Engines

Single Railway service containing all consciousness engines with integrated Swiss Ephemeris.

## Features

- **Integrated Swiss Ephemeris**: Direct pyswisseph integration for 100% accurate astronomical calculations
- **All Consciousness Engines**: Human Design, Numerology, Biorhythm, Vimshottari, Tarot, I-Ching, Gene Keys, Enneagram, Sacred Geometry, Sigil Forge
- **FastAPI Service**: Modern async API with automatic documentation
- **Production Ready**: Optimized for Railway deployment

## Endpoints

- `GET /health` - Health check
- `GET /engines` - List available engines
- `POST /swiss_ephemeris/calculate` - Swiss Ephemeris calculations
- `POST /engines/{engine_name}/calculate` - Engine calculations
- `GET /test/admin-user` - Test Swiss Ephemeris accuracy

## Deployment

Deploy to Railway using the Railway dashboard or CLI.

## Testing

Test Swiss Ephemeris accuracy with admin user birth data:
- Birth Date: 1991-08-13
- Birth Time: 08:01
- Location: 12.9716, 77.5946
- Expected: Accurate Human Design gates (not fallback data)
