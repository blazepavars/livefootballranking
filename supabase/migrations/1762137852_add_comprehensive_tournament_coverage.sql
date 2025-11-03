-- Migration: add_comprehensive_tournament_coverage
-- Created at: 1762137852

-- Migration: Add comprehensive tournament coverage fields
-- Purpose: Support 65+ international competitions with proper categorization

-- Add confederation and tournament categorization to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS api_league_id INTEGER,
ADD COLUMN IF NOT EXISTS confederation VARCHAR(20),
ADD COLUMN IF NOT EXISTS tournament_tier INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS competition_logo_url TEXT;

-- Add confederation and tournament categorization to upcoming_matches table
ALTER TABLE public.upcoming_matches
ADD COLUMN IF NOT EXISTS api_league_id INTEGER,
ADD COLUMN IF NOT EXISTS confederation VARCHAR(20),
ADD COLUMN IF NOT EXISTS tournament_tier INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS competition_logo_url TEXT;

-- Add confederation and tournament categorization to live_matches table
ALTER TABLE public.live_matches
ADD COLUMN IF NOT EXISTS api_league_id INTEGER,
ADD COLUMN IF NOT EXISTS confederation VARCHAR(20),
ADD COLUMN IF NOT EXISTS tournament_tier INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS competition_logo_url TEXT;

-- Add confederation and tournament categorization to fixtures table
ALTER TABLE public.fixtures
ADD COLUMN IF NOT EXISTS api_league_id INTEGER,
ADD COLUMN IF NOT EXISTS confederation VARCHAR(20),
ADD COLUMN IF NOT EXISTS tournament_tier INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS competition_logo_url TEXT;

-- Create indexes for efficient filtering by confederation and tournament tier
CREATE INDEX IF NOT EXISTS idx_matches_confederation ON public.matches(confederation);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_tier ON public.matches(tournament_tier);
CREATE INDEX IF NOT EXISTS idx_matches_api_league_id ON public.matches(api_league_id);

CREATE INDEX IF NOT EXISTS idx_upcoming_matches_confederation ON public.upcoming_matches(confederation);
CREATE INDEX IF NOT EXISTS idx_upcoming_matches_tournament_tier ON public.upcoming_matches(tournament_tier);
CREATE INDEX IF NOT EXISTS idx_upcoming_matches_api_league_id ON public.upcoming_matches(api_league_id);

CREATE INDEX IF NOT EXISTS idx_live_matches_confederation ON public.live_matches(confederation);
CREATE INDEX IF NOT EXISTS idx_live_matches_api_league_id ON public.live_matches(api_league_id);

CREATE INDEX IF NOT EXISTS idx_fixtures_confederation ON public.fixtures(confederation);
CREATE INDEX IF NOT EXISTS idx_fixtures_api_league_id ON public.fixtures(api_league_id);

-- Add comments for documentation
COMMENT ON COLUMN public.matches.confederation IS 'FIFA confederation: FIFA, UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC, ALL';
COMMENT ON COLUMN public.matches.tournament_tier IS 'Tournament hierarchy: 1=Global, 2=Continental Finals, 3=Qualifiers, 4=Nations League, 5=Sub-Regional, 6=Youth, 7=Friendlies';
COMMENT ON COLUMN public.matches.api_league_id IS 'API-Football league ID for tournament identification';
COMMENT ON COLUMN public.matches.competition_logo_url IS 'URL to competition logo for UI display';

COMMENT ON COLUMN public.upcoming_matches.confederation IS 'FIFA confederation: FIFA, UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC, ALL';
COMMENT ON COLUMN public.upcoming_matches.tournament_tier IS 'Tournament hierarchy: 1=Global, 2=Continental Finals, 3=Qualifiers, 4=Nations League, 5=Sub-Regional, 6=Youth, 7=Friendlies';
COMMENT ON COLUMN public.upcoming_matches.api_league_id IS 'API-Football league ID for tournament identification';

COMMENT ON COLUMN public.live_matches.confederation IS 'FIFA confederation: FIFA, UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC, ALL';
COMMENT ON COLUMN public.live_matches.tournament_tier IS 'Tournament hierarchy: 1=Global, 2=Continental Finals, 3=Qualifiers, 4=Nations League, 5=Sub-Regional, 6=Youth, 7=Friendlies';
COMMENT ON COLUMN public.live_matches.api_league_id IS 'API-Football league ID for tournament identification';

COMMENT ON COLUMN public.fixtures.confederation IS 'FIFA confederation: FIFA, UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC, ALL';
COMMENT ON COLUMN public.fixtures.tournament_tier IS 'Tournament hierarchy: 1=Global, 2=Continental Finals, 3=Qualifiers, 4=Nations League, 5=Sub-Regional, 6=Youth, 7=Friendlies';
COMMENT ON COLUMN public.fixtures.api_league_id IS 'API-Football league ID for tournament identification';;