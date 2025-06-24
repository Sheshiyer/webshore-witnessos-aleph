# WitnessOS Backend Migration & Integration Roadmap

## Scope
- Migrate all divination/consciousness engines (Numerology, Human Design, Vimshottari, Tarot, I-Ching, Gene Keys, Enneagram, Sacred Geometry, Biorhythm, Sigil Forge) from Python (in `/docs/reference/python-engines`) to TypeScript for Cloudflare Workers.
- Integrate all business logic, data, and engine details from `/docs/reference/python-engines`.
- Prioritize backend (engine logic, data, API) deployment to Cloudflare Workers KV.
- Defer frontend integration until backend is fully migrated, tested, and deployed.
- Ensure all engine outputs and API formats remain compatible with the existing frontend.

---

## Phases

### Phase 1: Analysis & Extraction
- [ ] Audit all Python engine logic, data models, and JSON data in `/docs/reference/python-engines`.
- [ ] Document engine-specific business logic, edge cases, and data dependencies.
- [ ] Identify all required data files (JSON, etc.) for each engine.

### Phase 2: TypeScript Engine Implementation
- [ ] For each engine:
    - [ ] Port business logic to TypeScript under `/src/engines/`
    - [ ] Migrate and adapt data files to TypeScript/JSON as needed
    - [ ] Ensure type safety and extensibility (use generics, interfaces)
    - [ ] Write unit tests for core calculations and edge cases
- [ ] Engines: Numerology, Human Design, Vimshottari, Tarot, I-Ching, Gene Keys, Enneagram, Sacred Geometry, Biorhythm, Sigil Forge

### Phase 3: Data Migration to Cloudflare Workers KV
- [ ] Design KV schema for engine data (static JSON, user profiles, etc.)
- [ ] Write migration scripts to move all required data to KV
- [ ] Implement data access layer in TypeScript for Workers
- [ ] Test data retrieval and update logic in Workers environment

### Phase 4: API Layer & Cloudflare Workers Deployment
- [ ] Implement unified API endpoints for all engines (REST/JSON)
- [ ] Integrate engine registry and orchestration logic
- [ ] Add error handling, validation, and logging
- [ ] Deploy backend to Cloudflare Workers
- [ ] Set up staging and production environments
- [ ] Smoke test all endpoints with real engine data

### Phase 5: Frontend Integration (Deferred)
- [ ] Update API client to point to new Workers backend
- [ ] Test all frontend engine integrations (UI, 3D, etc.)
- [ ] Fix any API/format mismatches
- [ ] End-to-end test: user flows, engine results, error states

### Phase 6: Documentation & Handover
- [ ] Update all docs for new backend architecture
- [ ] Write migration guide for other devs
- [ ] Document Cloudflare Workers deployment, KV schema, and troubleshooting

---

## Key Principles
- **Backend-first**: No frontend changes until backend is stable and deployed
- **Business logic parity**: All engine logic must match Python reference
- **Data integrity**: All static and dynamic data must be migrated and validated
- **Type safety**: Use TypeScript interfaces and generics throughout
- **Cloudflare-native**: Optimize for Workers/KV, stateless APIs, and edge deployment
- **Test coverage**: Unit and integration tests for all engines and endpoints

---

## Immediate Next Steps
1. Complete audit of `/docs/reference/python-engines` for all business logic and data
2. Begin porting engines to TypeScript, starting with those with least external dependencies
3. Design Cloudflare KV schema and migration scripts
4. Implement and deploy backend API to Workers
5. Only after backend is live: update frontend integration 