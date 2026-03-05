-- Create mod_recommendations table for player-submitted mod suggestions
-- Allows players to recommend mods with approval workflow for admins

CREATE TABLE IF NOT EXISTS mod_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recommender info
  submitter_name VARCHAR(255) NOT NULL,
  submitter_discord VARCHAR(255) NOT NULL,
  
  -- Mod details
  mod_name VARCHAR(255) NOT NULL,
  mod_link TEXT NOT NULL,
  mod_category VARCHAR(100),
  
  -- Recommendation reason
  reason TEXT,
  
  -- Admin review
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  admin_comment TEXT,
  reviewer_note VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC'),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_mod_recommendations_status ON mod_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_mod_recommendations_created_at ON mod_recommendations(created_at DESC);

-- NOTE: RLS is NOT enabled because:
-- 1. Server uses service_role key which bypasses RLS
-- 2. Authorization is enforced at API layer (requireAdmin middleware)
-- 3. This reduces complexity and potential for RLS-related errors
-- Security is handled at the application layer via HTTP headers authentication.
