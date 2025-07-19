-- Phase 1 Infrastructure Scaling: Performance Indexes Migration
-- Apply new performance indexes for readings, consciousness_profiles, and user_sessions tables
-- Target: >50% query performance improvement

-- Readings table performance indexes
CREATE INDEX IF NOT EXISTS idx_readings_user_created ON readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_user_type ON readings(user_id, reading_type);
CREATE INDEX IF NOT EXISTS idx_readings_engines_used ON readings(engines_used); -- For engine_type filtering
CREATE INDEX IF NOT EXISTS idx_readings_user_engines ON readings(user_id, engines_used);

-- Consciousness profiles performance indexes  
CREATE INDEX IF NOT EXISTS idx_consciousness_profiles_user_created ON consciousness_profiles(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consciousness_profiles_user_updated ON consciousness_profiles(user_id, updated_at DESC);

-- User sessions performance indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expires ON user_sessions(user_id, expires_at DESC);
-- Note: Removed partial index with datetime('now') due to SQLite non-deterministic function restriction
-- The expires_at index will still provide good performance for session cleanup queries

-- Reading history performance indexes for pagination
CREATE INDEX IF NOT EXISTS idx_reading_history_user_accessed ON reading_history(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_history_reading_accessed ON reading_history(reading_id, accessed_at DESC);

-- Analyze tables to update statistics after index creation
ANALYZE readings;
ANALYZE consciousness_profiles;
ANALYZE user_sessions;
ANALYZE reading_history;
