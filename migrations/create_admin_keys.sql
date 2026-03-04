-- Create admin_keys table
-- Stores the 3 admin keys: event, maintenance, status
-- These are separate from HTTP authentication and control UI access

CREATE TABLE IF NOT EXISTS admin_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(50) NOT NULL UNIQUE,
  key_value VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only valid key names
  CONSTRAINT valid_key_name CHECK (key_name IN ('event', 'maintenance', 'status'))
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_keys_name ON admin_keys(key_name);

-- Set updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_keys_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_keys_update_timestamp ON admin_keys;
CREATE TRIGGER admin_keys_update_timestamp
BEFORE UPDATE ON admin_keys
FOR EACH ROW
EXECUTE FUNCTION update_admin_keys_timestamp();

-- Disable RLS for admin_keys (only accessible via authenticated server endpoints)
ALTER TABLE admin_keys DISABLE ROW LEVEL SECURITY;
