-- Admin API Key Migration for WitnessOS Production Database
-- Add admin-specific columns to existing api_keys table
ALTER TABLE api_keys ADD COLUMN is_admin_key BOOLEAN DEFAULT FALSE;
ALTER TABLE api_keys ADD COLUMN admin_privileges TEXT; -- JSON array
ALTER TABLE api_keys ADD COLUMN elevated_rate_limits TEXT; -- JSON object

-- Create index for admin key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_admin ON api_keys(is_admin_key, is_active);

-- Create admin API key audit table
CREATE TABLE IF NOT EXISTS admin_api_key_audit (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    api_key_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'created', 'used', 'privilege_granted', 'privilege_revoked'
    privilege TEXT,       -- Specific privilege if applicable
    endpoint TEXT,        -- API endpoint accessed
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,        -- JSON additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for audit lookups
CREATE INDEX IF NOT EXISTS idx_admin_audit_key ON admin_api_key_audit(api_key_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_user ON admin_api_key_audit(user_id, created_at);
