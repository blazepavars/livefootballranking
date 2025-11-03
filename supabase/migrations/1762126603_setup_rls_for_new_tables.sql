-- Migration: setup_rls_for_new_tables
-- Created at: 1762126603

-- Enable RLS on new tables
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Fixtures policies (public read, edge function write)
CREATE POLICY "Allow public read fixtures" ON fixtures
  FOR SELECT USING (true);

CREATE POLICY "Allow edge function manage fixtures" ON fixtures
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Match results policies (public read, edge function write)
CREATE POLICY "Allow public read match_results" ON match_results
  FOR SELECT USING (true);

CREATE POLICY "Allow edge function insert match_results" ON match_results
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));;