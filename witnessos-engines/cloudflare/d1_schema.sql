-- =====================================================
-- WitnessOS Consciousness Engines - Cloudflare D1 Schema
-- =====================================================
-- 
-- Database schema for all 12 consciousness engines
-- Optimized for Cloudflare D1 SQLite compatibility
-- Includes privacy compliance and data retention
--
-- =====================================================

-- ===== CORE TABLES =====

-- Users table for data ownership
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    privacy_level TEXT DEFAULT 'standard',
    data_retention_days INTEGER DEFAULT 365,
    biometric_consent BOOLEAN DEFAULT FALSE,
    admin_level BOOLEAN DEFAULT FALSE
);

-- Admin API keys table
CREATE TABLE IF NOT EXISTS admin_api_keys (
    id TEXT PRIMARY KEY,
    key_hash TEXT UNIQUE NOT NULL,
    admin_user_id TEXT NOT NULL,
    permissions TEXT NOT NULL, -- JSON array of permissions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    last_used_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

-- ===== ENGINE-SPECIFIC TABLES =====

-- 1. Human Design Engine
CREATE TABLE IF NOT EXISTS engine_human_design_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_location TEXT NOT NULL, -- JSON: [lat, lon]
    timezone TEXT NOT NULL,
    chart_data TEXT NOT NULL, -- JSON: complete chart calculation
    bodygraph_data TEXT, -- JSON: bodygraph visualization data
    type_profile TEXT, -- e.g., "Generator 2/4"
    authority TEXT,
    strategy TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. Gene Keys Engine
CREATE TABLE IF NOT EXISTS engine_gene_keys_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_location TEXT NOT NULL,
    archetypal_data TEXT NOT NULL, -- JSON: archetypal patterns
    activation_sequence TEXT, -- JSON: activation sequence
    venus_sequence TEXT, -- JSON: venus sequence
    pearl_sequence TEXT, -- JSON: pearl sequence
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Vimshottari Dasha Engine
CREATE TABLE IF NOT EXISTS engine_vimshottari_dasha_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_location TEXT NOT NULL,
    current_dasha TEXT NOT NULL, -- JSON: current dasha period
    dasha_sequence TEXT NOT NULL, -- JSON: complete dasha sequence
    planetary_periods TEXT, -- JSON: all planetary periods
    predictions TEXT, -- JSON: predictions and insights
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. I Ching Engine
CREATE TABLE IF NOT EXISTS engine_i_ching_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question TEXT,
    hexagram_primary INTEGER NOT NULL, -- 1-64
    hexagram_relating INTEGER, -- 1-64, optional
    changing_lines TEXT, -- JSON: array of changing line numbers
    interpretation TEXT NOT NULL, -- Full interpretation
    trigrams_data TEXT, -- JSON: trigram analysis
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. Numerology Engine
CREATE TABLE IF NOT EXISTS engine_numerology_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    life_path_number INTEGER,
    expression_number INTEGER,
    soul_urge_number INTEGER,
    personality_number INTEGER,
    numerology_data TEXT NOT NULL, -- JSON: complete analysis
    personal_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Tarot Engine
CREATE TABLE IF NOT EXISTS engine_tarot_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question TEXT,
    spread_type TEXT NOT NULL, -- e.g., "celtic_cross", "three_card"
    cards_drawn TEXT NOT NULL, -- JSON: array of card objects
    positions TEXT NOT NULL, -- JSON: position meanings
    interpretation TEXT NOT NULL, -- Full reading interpretation
    archetypal_themes TEXT, -- JSON: identified themes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. Enneagram Engine
CREATE TABLE IF NOT EXISTS engine_enneagram_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    primary_type INTEGER NOT NULL, -- 1-9
    wing TEXT, -- e.g., "1w2", "1w9"
    instinctual_variant TEXT, -- sp, sx, so
    tritype TEXT, -- e.g., "125", "468"
    assessment_data TEXT NOT NULL, -- JSON: complete assessment
    growth_recommendations TEXT, -- JSON: development guidance
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Biorhythm Engine
CREATE TABLE IF NOT EXISTS engine_biorhythm_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    birth_date DATE NOT NULL,
    target_date DATE NOT NULL,
    physical_cycle REAL NOT NULL,
    emotional_cycle REAL NOT NULL,
    intellectual_cycle REAL NOT NULL,
    intuitive_cycle REAL,
    cycle_data TEXT NOT NULL, -- JSON: detailed cycle analysis
    predictions TEXT, -- JSON: cycle predictions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. Sacred Geometry Engine
CREATE TABLE IF NOT EXISTS engine_sacred_geometry_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    birth_date DATE,
    geometry_type TEXT NOT NULL, -- e.g., "flower_of_life", "merkaba"
    pattern_data TEXT NOT NULL, -- JSON: geometric pattern data
    visualization_data TEXT, -- JSON: SVG or canvas data
    mathematical_properties TEXT, -- JSON: mathematical analysis
    spiritual_interpretation TEXT, -- Spiritual meaning
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. Sigil Forge Engine
CREATE TABLE IF NOT EXISTS engine_sigil_forge_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    intention TEXT NOT NULL,
    sigil_method TEXT NOT NULL, -- e.g., "austin_osman_spare", "chaos_magic"
    sigil_data TEXT NOT NULL, -- JSON: sigil generation data
    image_data TEXT, -- Base64 encoded sigil image
    activation_instructions TEXT, -- How to use the sigil
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 11. VedicClock-TCM Engine
CREATE TABLE IF NOT EXISTS engine_vedicclock_tcm_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_location TEXT NOT NULL,
    target_date DATE,
    target_time TIME,
    vedic_data TEXT NOT NULL, -- JSON: Vedic calculations
    tcm_data TEXT NOT NULL, -- JSON: TCM organ clock data
    integration_analysis TEXT NOT NULL, -- JSON: combined analysis
    optimization_recommendations TEXT, -- JSON: personalized guidance
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    privacy_level TEXT DEFAULT 'standard',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 12. Face Reading Engine (Special Privacy Handling)
CREATE TABLE IF NOT EXISTS engine_face_reading_readings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    birth_date DATE,
    birth_time TIME,
    birth_location TEXT,
    analysis_mode TEXT NOT NULL, -- photo, video, live
    biometric_consent BOOLEAN NOT NULL DEFAULT FALSE,
    facial_analysis TEXT NOT NULL, -- JSON: anonymized analysis results
    twelve_houses_data TEXT, -- JSON: 12 houses analysis
    five_elements_data TEXT, -- JSON: constitutional analysis
    age_points_data TEXT, -- JSON: age point mapping
    -- NOTE: No raw biometric data stored for privacy
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME DEFAULT (datetime('now', '+30 days')), -- Short retention
    privacy_level TEXT DEFAULT 'biometric',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===== INDEXES FOR PERFORMANCE =====

-- User-based queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_admin_keys_hash ON admin_api_keys(key_hash);

-- Engine reading queries (user_id is most common filter)
CREATE INDEX IF NOT EXISTS idx_human_design_user ON engine_human_design_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_gene_keys_user ON engine_gene_keys_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vimshottari_user ON engine_vimshottari_dasha_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_i_ching_user ON engine_i_ching_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_numerology_user ON engine_numerology_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tarot_user ON engine_tarot_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_enneagram_user ON engine_enneagram_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_biorhythm_user ON engine_biorhythm_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sacred_geometry_user ON engine_sacred_geometry_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sigil_forge_user ON engine_sigil_forge_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vedicclock_tcm_user ON engine_vedicclock_tcm_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_face_reading_user ON engine_face_reading_readings(user_id, created_at);

-- Expiration cleanup queries
CREATE INDEX IF NOT EXISTS idx_expires_at ON engine_human_design_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_gene_keys_expires ON engine_gene_keys_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_vimshottari_expires ON engine_vimshottari_dasha_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_i_ching_expires ON engine_i_ching_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_numerology_expires ON engine_numerology_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_tarot_expires ON engine_tarot_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_enneagram_expires ON engine_enneagram_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_biorhythm_expires ON engine_biorhythm_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_sacred_geometry_expires ON engine_sacred_geometry_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_sigil_forge_expires ON engine_sigil_forge_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_vedicclock_tcm_expires ON engine_vedicclock_tcm_readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_face_reading_expires ON engine_face_reading_readings(expires_at);

-- ===== DATA RETENTION TRIGGERS =====

-- Automatic cleanup of expired records
-- Note: These would be implemented as Cloudflare Workers cron jobs
-- rather than SQLite triggers for better control and monitoring
