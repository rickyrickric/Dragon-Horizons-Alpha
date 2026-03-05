-- Create events table for countdown timers
-- Stores upcoming events like patches, world resets, mystery events

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'patch', 'world_reset', 'mystery'
  description TEXT NOT NULL,
  
  -- Countdown
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Index for active events and sorting by time
CREATE INDEX IF NOT EXISTS idx_events_active_time ON events(is_active, event_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
