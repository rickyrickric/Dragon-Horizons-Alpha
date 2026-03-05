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

-- Create index for faster queries
CREATE INDEX idx_mod_recommendations_status ON mod_recommendations(status);
CREATE INDEX idx_mod_recommendations_created_at ON mod_recommendations(created_at DESC);

-- Set up RLS (Row-Level Security)
ALTER TABLE mod_recommendations ENABLE ROW LEVEL SECURITY;

-- Public can view approved recommendations only
CREATE POLICY "public_view_approved" ON mod_recommendations
  FOR SELECT USING (status = 'approved');

-- Public can insert (submit recommendations)
CREATE POLICY "public_insert" ON mod_recommendations
  FOR INSERT WITH CHECK (true);

-- Admins can view all recommendations
CREATE POLICY "admin_view_all" ON mod_recommendations
  USING (auth.jwt_matches_claim('role', 'admin'));

-- Admins can update recommendations
CREATE POLICY "admin_update" ON mod_recommendations
  FOR UPDATE USING (auth.jwt_matches_claim('role', 'admin'));
