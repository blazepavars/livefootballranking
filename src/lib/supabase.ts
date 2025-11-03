import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bdpxvdahzjzqplgilxus.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcHh2ZGFoemp6cXBsZ2lseHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ2NDIsImV4cCI6MjA3NzY5MDY0Mn0.d1_narSo90KYl6rMwEAF2vQ-WG-HgJv_Ovt5LW6B7hU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface Team {
  id: string
  team_name: string
  gender: 'men' | 'women'
  continent: string | null
  current_rank: number
  current_points: number
  previous_rank: number | null
  change_indicator: string | null
  last_updated: string
  created_at: string
}

export interface Match {
  id: string
  api_match_id: string | null
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  home_score: number | null
  away_score: number | null
  match_result: string | null
  competition_type: string
  competition_stage: string | null
  importance_multiplier: number
  match_date: string
  status: string
  has_penalty_shootout: boolean
  penalty_winner: string | null
  processed: boolean
  created_at: string
  updated_at: string
}

export interface EloCalculation {
  id: string
  match_id: string
  team_id: string
  team_name: string
  points_before: number
  points_after: number
  expected_result: number
  actual_result: number
  importance_multiplier: number
  points_change: number
  is_knockout_protected: boolean
  calculation_timestamp: string
}

export interface Fixture {
  id: string
  team_id: string
  team_name: string
  opponent_team_id: string | null
  opponent_name: string
  match_date: string
  competition: string
  importance_level: number
  venue: string | null
  is_home_match: boolean | null
  status: string | null
  created_at: string
}

export interface MatchResult {
  id: string
  team_id: string
  team_name: string
  opponent_name: string
  match_date: string
  competition: string
  result: string
  team_score: number
  opponent_score: number
  points_change: number
  points_before: number | null
  points_after: number | null
  importance_multiplier: number | null
  created_at: string
}

export interface LiveMatch {
  id: string
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  home_score: number
  away_score: number
  home_points_before: number
  away_points_before: number
  home_points_change: number
  away_points_change: number
  competition: string
  importance_multiplier: number
  match_status: string
  match_minute: number
  match_date: string
  api_league_id?: number
  confederation?: string
  tournament_tier?: number
  competition_logo_url?: string | null
  created_at: string
  updated_at: string
}

export interface UpcomingMatch {
  id: string
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  match_date: string
  competition: string
  stage: string | null
  importance_multiplier: number
  home_points_before: number
  away_points_before: number
  home_expected_result: number
  away_expected_result: number
  potential_home_win_points: number
  potential_home_draw_points: number
  potential_home_loss_points: number
  potential_away_win_points: number
  potential_away_draw_points: number
  potential_away_loss_points: number
  api_league_id?: number
  confederation?: string
  tournament_tier?: number
  competition_logo_url?: string | null
  created_at: string
  updated_at: string
}

export interface RankingHistory {
  id: string
  team_id: string
  team_name: string
  rank: number
  points: number
  snapshot_date: string
  continent: string | null
  created_at: string
}

export interface FIFACalculatorResult {
  id: string
  team_a_id: string
  team_a_name: string
  team_b_id: string
  team_b_name: string
  competition_type: string
  competition_stage: string | null
  result: string
  importance_multiplier: number
  team_a_points_before: number
  team_b_points_before: number
  expected_result_a: number
  expected_result_b: number
  actual_result_a: number
  actual_result_b: number
  team_a_points_after: number
  team_b_points_after: number
  team_a_points_change: number
  team_b_points_change: number
  created_at: string
}

export interface HistoricalFIFARanking {
  id: string
  rank_position: number
  country_full: string
  country_abrv: string | null
  total_points: number
  previous_points: number | null
  rank_change: number | null
  confederation: string | null
  rank_date: string
  created_at: string
  updated_at: string
}