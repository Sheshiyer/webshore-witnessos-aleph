-- Migration: Add tiered onboarding system to users table
-- This adds support for 3-tier progressive onboarding

-- Add tiered onboarding completion flags
ALTER TABLE users ADD COLUMN tier1_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN tier2_completed BOOLEAN DEFAULT FALSE; 
ALTER TABLE users ADD COLUMN tier3_completed BOOLEAN DEFAULT FALSE;

-- Add birth data fields for tier 2
ALTER TABLE users ADD COLUMN birth_date TEXT;
ALTER TABLE users ADD COLUMN birth_time TEXT;
ALTER TABLE users ADD COLUMN birth_latitude REAL;
ALTER TABLE users ADD COLUMN birth_longitude REAL;
ALTER TABLE users ADD COLUMN birth_timezone TEXT;

-- Update existing users to have tier1 completed if they have name and email
UPDATE users SET tier1_completed = TRUE WHERE name IS NOT NULL AND email IS NOT NULL;

-- Update existing users to have tier2 completed if they have birth data in consciousness profiles
-- This will be handled by the application logic since birth data is currently in JSON

-- Update existing users to have tier3 completed if they have completed onboarding
UPDATE users SET tier3_completed = TRUE WHERE has_completed_onboarding = TRUE;

-- Create index for faster tier-based queries
CREATE INDEX IF NOT EXISTS idx_users_tiers ON users(tier1_completed, tier2_completed, tier3_completed);
CREATE INDEX IF NOT EXISTS idx_users_birth_data ON users(birth_date, birth_latitude, birth_longitude);
