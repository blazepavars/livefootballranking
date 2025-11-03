-- Migration: create_get_distinct_historical_dates_function
-- Created at: 1762145006

CREATE OR REPLACE FUNCTION get_distinct_historical_dates()
RETURNS TABLE (rank_date DATE)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT historical_fifa_rankings.rank_date
  FROM historical_fifa_rankings
  ORDER BY historical_fifa_rankings.rank_date DESC;
$$;;