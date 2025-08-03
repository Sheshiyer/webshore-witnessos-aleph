-- WitnessOS Database Schema
-- Core tables for user authentication, consciousness profiles, and readings

-- Users table for authentication and profile management
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    preferences TEXT DEFAULT '{}', -- JSON string for user preferences
    is_admin BOOLEAN DEFAULT FALSE, -- Admin flag for user roles
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    -- Developer tier and API usage tracking
    developer_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    api_calls_used INTEGER DEFAULT 0,
    api_calls_limit INTEGER DEFAULT 1000,
    billing_customer_id TEXT,
    webhook_url TEXT,
    -- Birth data for consciousness engines
    birth_date TEXT,
    birth_time TEXT,
    birth_latitude REAL,
    birth_longitude REAL,
    birth_timezone TEXT,
    -- Tiered onboarding completion flags
    tier1_completed BOOLEAN DEFAULT FALSE, -- name, email, password
    tier2_completed BOOLEAN DEFAULT FALSE, -- birth data (DOB, location, time)
    tier3_completed BOOLEAN DEFAULT FALSE  -- preferences (cards, direction, etc)
);

-- Consciousness profiles for storing complete user archetype data
CREATE TABLE IF NOT EXISTS consciousness_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_data TEXT NOT NULL, -- JSON string with all consciousness data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Readings table for storing individual engine calculations and combined readings
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reading_type TEXT NOT NULL, -- 'single', 'comprehensive', 'workflow'
    engines_used TEXT NOT NULL, -- JSON array of engine names
    input_data TEXT NOT NULL, -- JSON string of input parameters
    results TEXT NOT NULL, -- JSON string of calculation results
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    shared BOOLEAN DEFAULT FALSE,
    share_token TEXT UNIQUE, -- For public sharing
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reading history for tracking user access patterns
CREATE TABLE IF NOT EXISTS reading_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reading_id INTEGER NOT NULL,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT, -- JSON string with device/browser info
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE
);

-- User sessions for distributed session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,  -- Hashed JWT token
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT, -- JSON string with device/browser info
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API Keys table for developer access management
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY, -- UUID
    user_id INTEGER NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the actual key
    key_prefix TEXT NOT NULL, -- 'wos_live_' or 'wos_test_'
    name TEXT NOT NULL, -- User-friendly name
    description TEXT,
    scopes TEXT NOT NULL, -- JSON array of permissions
    environment TEXT NOT NULL DEFAULT 'live', -- 'live' or 'test'
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    expires_at DATETIME,
    last_used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API Key Scopes/Permissions definitions
CREATE TABLE IF NOT EXISTS api_key_scopes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope_name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    tier_required TEXT NOT NULL DEFAULT 'free' -- 'free', 'pro', 'enterprise'
);

-- API Usage Analytics for tracking and billing
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id TEXT,
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    engine_used TEXT,
    error_message TEXT,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit Logs for security and compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    api_key_id TEXT,
    action TEXT NOT NULL, -- 'key_created', 'key_revoked', 'permission_changed'
    details TEXT, -- JSON with additional context
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_consciousness_profiles_user_id ON consciousness_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_profiles_active ON consciousness_profiles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at);
CREATE INDEX IF NOT EXISTS idx_readings_shared ON readings(shared, share_token);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_reading_id ON reading_history(reading_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);

-- Phase 1 Performance Indexes for Infrastructure Scaling
-- Composite indexes for common query patterns

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

-- Reading history performance indexes for pagination
CREATE INDEX IF NOT EXISTS idx_reading_history_user_accessed ON reading_history(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_history_reading_accessed ON reading_history(reading_id, accessed_at DESC);

-- API Key performance indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active ON api_keys(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_timestamp ON api_usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_timestamp ON api_usage_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Initial API Key Scopes
INSERT OR IGNORE INTO api_key_scopes (scope_name, description, tier_required) VALUES
('engines:numerology:read', 'Access Numerology calculations', 'free'),
('engines:biorhythm:read', 'Access Biorhythm calculations', 'free'),
('engines:iching:read', 'Access I-Ching calculations', 'free'),
('engines:human_design:read', 'Access Human Design calculations', 'pro'),
('engines:gene_keys:read', 'Access Gene Keys calculations', 'pro'),
('engines:tarot:read', 'Access Tarot readings', 'pro'),
('engines:enneagram:read', 'Access Enneagram analysis', 'pro'),
('engines:sacred_geometry:read', 'Access Sacred Geometry', 'pro'),
('engines:vimshottari:read', 'Access Vimshottari calculations', 'pro'),
('engines:sigil_forge:read', 'Access Sigil Forge', 'enterprise'),
('engines:*:read', 'Access all engines (read)', 'enterprise'),
('user:profile:read', 'Read user profile data', 'free'),
('user:profile:write', 'Modify user profile data', 'pro'),
('analytics:usage:read', 'Access usage analytics', 'pro'),
('webhooks:manage', 'Manage webhook endpoints', 'pro'),
('batch:calculate', 'Batch engine calculations', 'pro');