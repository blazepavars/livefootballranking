-- Migration: add_historical_fifa_rankings_table
-- Created at: 1762140954


-- Create historical FIFA rankings table for Kaggle dataset
CREATE TABLE IF NOT EXISTS historical_fifa_rankings (
    id BIGSERIAL PRIMARY KEY,
    rank_position NUMERIC,
    country_full TEXT NOT NULL,
    country_abrv TEXT,
    total_points NUMERIC NOT NULL,
    previous_points NUMERIC,
    rank_change INTEGER,
    confederation TEXT,
    rank_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_historical_rankings_date ON historical_fifa_rankings(rank_date DESC);
CREATE INDEX IF NOT EXISTS idx_historical_rankings_country ON historical_fifa_rankings(country_full);
CREATE INDEX IF NOT EXISTS idx_historical_rankings_confederation ON historical_fifa_rankings(confederation);
CREATE INDEX IF NOT EXISTS idx_historical_rankings_date_country ON historical_fifa_rankings(rank_date, country_full);

-- Add RLS policies
ALTER TABLE historical_fifa_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historical rankings are viewable by everyone" ON historical_fifa_rankings
    FOR SELECT USING (true);

CREATE POLICY "Historical rankings are insertable by service role" ON historical_fifa_rankings
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'anon');

COMMENT ON TABLE historical_fifa_rankings IS 'Historical FIFA rankings data from Kaggle dataset (1992-2024)';
;