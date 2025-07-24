# PROJECT TODO - HYBRID ARCHITECTURE PIVOT

## In Progress

## Pending
- [ ] Update API documentation for new engine endpoints
- [ ] Update project constants with Railway production URL: webshore-witnessos-aleph-production.up.railway.app
- [ ] Restructure /docs/reference/python-engines/ to production services
- [ ] Test Human Design engine accuracy with Railway deployment
- [ ] Update project constants to reflect Railway architecture
- [ ] Fix remaining TypeScript compilation errors (600+ errors across multiple files)
- [ ] Update type definitions and imports throughout the codebase
- [ ] Resolve API handler and worker type mismatches
- [ ] Clean up engine types that are no longer needed
- [ ] Update validation constants to remove TypeScript engine references
- [ ] Test that Cloudflare workers still compile without TypeScript engines
- [ ] Verify Python engines on Railway are still working
- [ ] Update documentation to reflect Python-only engine architecture
## Completed (move to memory.md)
- [x] Implement FastAPI endpoints for all consciousness engines (10 engines: human_design, numerology, biorhythm, vimshottari, tarot, iching, gene_keys, enneagram, sacred_geometry, sigil_forge)
- [MOVED] Railway integration deployment and testing moved to memory.md
- [MOVED] Railway deployment tasks moved to memory.md
- [MOVED] Documentation cleanup tasks moved to memory.md
- [MOVED] Engine cleanup verification tasks moved to memory.md
- [MOVED] Import cleanup for broken engine type references moved to memory.md

---

**Goal**: Implement hybrid architecture with Cloudflare Workers + Railway Python engines, replacing deprecated TypeScript engines with proven Python implementations, eliminating confusion and reducing bundle size.