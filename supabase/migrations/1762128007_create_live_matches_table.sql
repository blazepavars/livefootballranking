-- Migration: create_live_matches_table
-- Created at: 1762128007

-- Create live_matches table for displaying currently playing matches
CREATE TABLE IF NOT EXISTS live_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  home_team_name VARCHAR(255) NOT NULL,
  away_team_name VARCHAR(255) NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  home_points_before NUMERIC,
  away_points_before NUMERIC,
  home_points_change NUMERIC DEFAULT 0,
  away_points_change NUMERIC DEFAULT 0,
  competition VARCHAR(255),
  importance_multiplier INTEGER DEFAULT 10,
  match_status VARCHAR(50) DEFAULT 'LIVE',
  match_minute INTEGER,
  match_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE live_matches ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to live_matches"
  ON live_matches FOR SELECT
  TO anon
  USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to live_matches"
  ON live_matches FOR ALL
  TO service_role
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_live_matches_status ON live_matches(match_status);
CREATE INDEX IF NOT EXISTS idx_live_matches_date ON live_matches(match_date DESC);
;