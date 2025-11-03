// API-Football Integration Edge Function v6
// COMPREHENSIVE INTERNATIONAL TOURNAMENT COVERAGE - 65+ Competitions
// Fetches live international matches with FIFA SUM Elo calculations

import { 
  ALL_INTERNATIONAL_LEAGUE_IDS,
  getConfederation,
  getTournamentTier,
  getLogoUrl,
  getCoverageStats
} from '../_shared/tournament-registry.ts';

const APIFOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// ============================================================================
// FIFA SUM Elo Rating Calculator - Official FIFA Formula Implementation
// ============================================================================

function calculateExpectedResult(teamPoints: number, opponentPoints: number): number {
  const dr = teamPoints - opponentPoints;
  return 1 / (Math.pow(10, -dr / 600) + 1);
}

function isKnockoutStage(stage?: string): boolean {
  if (!stage) return false;
  const lower = stage.toLowerCase();
  return lower.includes('round of') || lower.includes('quarter') || 
         lower.includes('semi') || lower.includes('final') || 
         lower.includes('play-off') || lower.includes('playoff');
}

function isInIMCWindow(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  
  if (month === 2 && day >= 20) return true; // Late March
  if (month === 5 && day <= 15) return true; // Early June
  if (month === 8 && day <= 15) return true; // Early September
  if (month === 9 && day >= 10 && day <= 20) return true; // Mid October
  if (month === 10 && day >= 10 && day <= 25) return true; // Mid November
  
  return false;
}

/**
 * Get match importance multiplier (I) based on FIFA official values
 * Uses league ID from tournament registry for accurate classification
 */
function getMatchImportance(leagueId: number, leagueName: string, stage?: string, isIMC: boolean = true): number {
  const lowerName = leagueName.toLowerCase();
  const lowerStage = (stage || '').toLowerCase();
  
  // World Cup Finals
  if (leagueId === 1) {
    if (lowerStage.includes('quarter') || lowerStage.includes('semi') || 
        lowerStage.includes('final') || lowerStage.includes('third')) {
      return 60;
    }
    return 50;
  }
  
  // World Cup Qualifiers: 25
  if ([29, 30, 31, 32, 33, 34, 37].includes(leagueId)) {
    return 25;
  }
  
  // Confederation Finals (Euro, Copa America, AFCON, Asian Cup, Gold Cup, OFC Nations)
  if ([4, 9, 6, 7, 22, 806].includes(leagueId)) {
    if (lowerStage.includes('quarter') || lowerStage.includes('semi') || 
        lowerStage.includes('final') || lowerStage.includes('third')) {
      return 40;
    }
    return 35;
  }
  
  // Confederations Cup: 40
  if (leagueId === 21) {
    return 40;
  }
  
  // Nations League (UEFA: 5, CONCACAF: 536)
  if ([5, 536].includes(leagueId)) {
    if (lowerStage.includes('final') || lowerStage.includes('semi') || 
        lowerStage.includes('play-off') || lowerStage.includes('playoff')) {
      return 25;
    }
    return 15;
  }
  
  // Continental Qualifiers: 25
  if ([960, 36, 35, 858, 808].includes(leagueId)) {
    return 25;
  }
  
  // Olympics: 25
  if ([480, 881, 882, 883, 884, 885, 11].includes(leagueId)) {
    return 25;
  }
  
  // Youth Tournaments (U-20, U-17, U-21, U-19): 20-25
  if ([20, 23, 577, 578, 579, 38, 39, 40].includes(leagueId)) {
    return 20;
  }
  
  // Regional tournaments (CHAN, Gulf Cup, SAFF, ASEAN, Caribbean, Centroamericana): 15-20
  if ([19, 1163, 25, 28, 24, 1008, 26, 27, 804, 805, 807, 803].includes(leagueId)) {
    return 15;
  }
  
  // International Friendlies and invitational tournaments: 5-10
  if ([10, 669, 670, 671, 486].includes(leagueId)) {
    return isIMC ? 10 : 5;
  }
  
  // Default: friendly during IMC
  return 10;
}

function getActualResult(teamScore: number, opponentScore: number, isPSO: boolean): number {
  if (teamScore > opponentScore) {
    return isPSO ? 0.75 : 1.0;
  } else if (teamScore < opponentScore) {
    return isPSO ? 0.5 : 0.0;
  }
  return 0.5;
}

function calculateCompleteElo(
  teamPoints: number,
  opponentPoints: number,
  teamScore: number,
  opponentScore: number,
  leagueId: number,
  leagueName: string,
  stage?: string,
  isPSO: boolean = false,
  matchDate: Date = new Date()
) {
  const isIMC = isInIMCWindow(matchDate);
  const importance = getMatchImportance(leagueId, leagueName, stage, isIMC);
  const actualResult = getActualResult(teamScore, opponentScore, isPSO);
  const expectedResult = calculateExpectedResult(teamPoints, opponentPoints);
  const isKnockout = isKnockoutStage(stage);
  
  let rawChange = importance * (actualResult - expectedResult);
  let pointsChange = rawChange;
  let appliedProtection = false;
  
  if (isKnockout && rawChange < 0) {
    pointsChange = 0;
    appliedProtection = true;
  }
  
  pointsChange = Math.round(pointsChange * 10) / 10;
  
  return {
    pointsChange,
    pointsAfter: teamPoints + pointsChange,
    expectedResult,
    actualResult,
    importance,
    appliedKnockoutProtection: appliedProtection
  };
}

// ============================================================================
// API-Football Integration
// ============================================================================

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { long: string; short: string; elapsed: number | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    round?: string;
  };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
  score?: { penalty?: { home: number | null; away: number | null } };
}

async function fetchLiveInternationalMatches(): Promise<ApiFootballFixture[]> {
  const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
    headers: { 'x-apisports-key': APIFOOTBALL_KEY }
  });
  
  const data = await response.json();
  if (!data.response) return [];
  
  // Filter for international matches using comprehensive registry
  return data.response.filter((f: ApiFootballFixture) => 
    ALL_INTERNATIONAL_LEAGUE_IDS.includes(f.league.id)
  );
}

function extractMatchStage(round?: string): string | undefined {
  if (!round) return undefined;
  const lower = round.toLowerCase();
  
  if (lower.includes('final') && !lower.includes('semi')) return 'Final';
  if (lower.includes('semi')) return 'Semi-finals';
  if (lower.includes('quarter')) return 'Quarter-finals';
  if (lower.includes('round of 16') || lower.includes('r16')) return 'Round of 16';
  if (lower.includes('group')) return 'Group';
  if (lower.includes('play-off') || lower.includes('playoff')) return 'Play-off';
  
  return undefined;
}

function isPenaltyShootout(fixture: ApiFootballFixture): boolean {
  if (!fixture.score?.penalty) return false;
  const ph = fixture.score.penalty.home;
  const pa = fixture.score.penalty.away;
  return ph !== null && pa !== null && ph !== pa;
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stats = getCoverageStats();
    console.log('========================================');
    console.log('COMPREHENSIVE INTERNATIONAL COVERAGE v6');
    console.log('========================================');
    console.log(`Total Tournaments: ${stats.total}`);
    console.log('By Confederation:', stats.byConfederation);
    console.log('By Tier:', stats.byTier);
    console.log('========================================');
    
    const liveMatches = await fetchLiveInternationalMatches();
    console.log(`Found ${liveMatches.length} live international matches`);

    if (liveMatches.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No live international matches at the moment',
          matchesUpdated: 0,
          tournamentsMonitored: stats.total,
          coverageStats: stats
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch teams
    const teamsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=id,team_name,current_points&gender=eq.men`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    const teams = await teamsResponse.json();
    const teamMap = new Map(teams.map((t: any) => [t.team_name.toLowerCase(), t]));

    // Clear existing live matches
    await fetch(`${SUPABASE_URL}/rest/v1/live_matches?match_status=eq.LIVE`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });

    const matchRecords = [];
    
    for (const match of liveMatches) {
      const homeTeam = teamMap.get(match.teams.home.name.toLowerCase());
      const awayTeam = teamMap.get(match.teams.away.name.toLowerCase());
      
      if (!homeTeam || !awayTeam) {
        console.log(`Skipping: ${match.teams.home.name} vs ${match.teams.away.name} (not in DB)`);
        continue;
      }

      const homeScore = match.goals.home || 0;
      const awayScore = match.goals.away || 0;
      const stage = extractMatchStage(match.league.round);
      const isPSO = isPenaltyShootout(match);
      const matchDate = new Date(match.fixture.date);
      
      let homeScoreForElo = homeScore;
      let awayScoreForElo = awayScore;
      if (isPSO && match.score?.penalty) {
        homeScoreForElo = match.score.penalty.home || homeScore;
        awayScoreForElo = match.score.penalty.away || awayScore;
      }
      
      const homeCalc = calculateCompleteElo(
        homeTeam.current_points, awayTeam.current_points,
        homeScoreForElo, awayScoreForElo,
        match.league.id, match.league.name, stage, isPSO, matchDate
      );
      
      const awayCalc = calculateCompleteElo(
        awayTeam.current_points, homeTeam.current_points,
        awayScoreForElo, homeScoreForElo,
        match.league.id, match.league.name, stage, isPSO, matchDate
      );

      const confederation = getConfederation(match.league.id);
      const tournamentTier = getTournamentTier(match.league.id);
      const logoUrl = getLogoUrl(match.league.id);

      matchRecords.push({
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        home_team_name: match.teams.home.name,
        away_team_name: match.teams.away.name,
        home_score: homeScore,
        away_score: awayScore,
        home_points_before: homeTeam.current_points,
        away_points_before: awayTeam.current_points,
        home_points_change: homeCalc.pointsChange,
        away_points_change: awayCalc.pointsChange,
        competition: match.league.name,
        importance_multiplier: homeCalc.importance,
        match_status: 'LIVE',
        match_minute: match.fixture.status.elapsed || 0,
        match_date: match.fixture.date,
        api_league_id: match.league.id,
        confederation: confederation,
        tournament_tier: tournamentTier,
        competition_logo_url: logoUrl
      });
      
      console.log(`[${confederation}] ${match.teams.home.name} ${homeScore}-${awayScore} ${match.teams.away.name}`);
      console.log(`  ${match.league.name} | Tier ${tournamentTier} | I=${homeCalc.importance}`);
      console.log(`  Home: ${homeCalc.pointsChange>0?'+':''}${homeCalc.pointsChange} | Away: ${awayCalc.pointsChange>0?'+':''}${awayCalc.pointsChange}`);
    }

    if (matchRecords.length > 0) {
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/live_matches`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(matchRecords)
      });

      if (!insertResponse.ok) {
        throw new Error(`Failed to insert: ${await insertResponse.text()}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${matchRecords.length} live matches with comprehensive tournament data`,
        matchesUpdated: matchRecords.length,
        totalFound: liveMatches.length,
        tournamentsMonitored: stats.total,
        coverageStats: stats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});