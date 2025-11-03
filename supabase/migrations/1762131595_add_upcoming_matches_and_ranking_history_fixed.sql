-- Migration: add_upcoming_matches_and_ranking_history_fixed
-- Created at: 1762131595

-- Create upcoming_matches table for fixtures in next 24-48 hours
CREATE TABLE IF NOT EXISTS upcoming_matches (
  id BIGSERIAL PRIMARY KEY,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  home_team_name TEXT NOT NULL,
  away_team_name TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  competition TEXT NOT NULL,
  stage TEXT,
  importance_multiplier INTEGER NOT NULL,
  home_points_before DECIMAL(10,1) NOT NULL,
  away_points_before DECIMAL(10,1) NOT NULL,
  home_expected_result DECIMAL(5,3) NOT NULL,
  away_expected_result DECIMAL(5,3) NOT NULL,
  potential_home_win_points DECIMAL(10,1),
  potential_home_draw_points DECIMAL(10,1),
  potential_home_loss_points DECIMAL(10,1),
  potential_away_win_points DECIMAL(10,1),
  potential_away_draw_points DECIMAL(10,1),
  potential_away_loss_points DECIMAL(10,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ranking_history table for historical snapshots
CREATE TABLE IF NOT EXISTS ranking_history (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  team_id UUID REFERENCES teams(id),
  team_name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  points DECIMAL(10,1) NOT NULL,
  previous_rank INTEGER,
  rank_change INTEGER,
  continent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date, team_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_upcoming_matches_date ON upcoming_matches(match_date);
CREATE INDEX IF NOT EXISTS idx_upcoming_matches_teams ON upcoming_matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_ranking_history_date ON ranking_history(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_ranking_history_team ON ranking_history(team_id);

-- Enable RLS
ALTER TABLE upcoming_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON upcoming_matches;
CREATE POLICY "Enable read access for all users" ON upcoming_matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON ranking_history;
CREATE POLICY "Enable read access for all users" ON ranking_history FOR SELECT USING (true);

-- Allow service role to insert/update/delete
DROP POLICY IF EXISTS "Enable all access for service role" ON upcoming_matches;
CREATE POLICY "Enable all access for service role" ON upcoming_matches FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Enable all access for service role" ON ranking_history;
CREATE POLICY "Enable all access for service role" ON ranking_history FOR ALL USING (auth.role() = 'service_role');;