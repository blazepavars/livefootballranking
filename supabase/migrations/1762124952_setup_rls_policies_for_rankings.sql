-- Migration: setup_rls_policies_for_rankings
-- Created at: 1762124952

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE elo_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;

-- Teams table policies (public read, edge function write)
CREATE POLICY "Allow public read access to teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Allow edge function insert/update teams" ON teams
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Rankings history policies (public read, edge function write)
CREATE POLICY "Allow public read rankings_history" ON rankings_history
  FOR SELECT USING (true);

CREATE POLICY "Allow edge function insert rankings_history" ON rankings_history
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Matches table policies (public read, edge function write)
CREATE POLICY "Allow public read matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow edge function manage matches" ON matches
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Elo calculations policies (public read for transparency, edge function write)
CREATE POLICY "Allow public read elo_calculations" ON elo_calculations
  FOR SELECT USING (true);

CREATE POLICY "Allow edge function insert elo_calculations" ON elo_calculations
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- API config policies (edge function only)
CREATE POLICY "Allow edge function manage api_config" ON api_config
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));;