// API-Football Integration Edge Function
// Fetches live international matches with corrected FIFA SUM Elo calculations
// COMPREHENSIVE INTERNATIONAL COVERAGE - All confederations and competitions

const APIFOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// COMPREHENSIVE INTERNATIONAL LEAGUE IDs - ALL SENIOR MEN'S COMPETITIONS
const INTERNATIONAL_LEAGUES = [
  // FIFA World Cup
  1,    // World Cup Finals
  29,   // World Cup Qualification - Africa
  30,   // World Cup Qualification - Asia
  31,   // World Cup Qualification - CONCACAF
  32,   // World Cup Qualification - Europe
  33,   // World Cup Qualification - Oceania
  34,   // World Cup Qualification - South America
  37,   // World Cup Qualification - Intercontinental Play-offs
  21,   // Confederations Cup
  
  // UEFA (Europe)
  4,    // Euro Championship Finals
  960,  // Euro Championship Qualification
  5,    // UEFA Nations League
  
  // CAF (Africa)
  6,    // Africa Cup of Nations Finals
  36,   // Africa Cup of Nations Qualification
  19,   // African Nations Championship
  1163, // African Nations Championship Qualification
  
  // AFC (Asia)
  7,    // Asian Cup Finals
  35,   // Asian Cup Qualification
  803,  // Asian Games
  25,   // Gulf Cup of Nations
  28,   // SAFF Championship
  24,   // ASEAN Championship
  1008, // CAFA Nations Cup
  
  // CONCACAF (North/Central America & Caribbean)
  22,   // CONCACAF Gold Cup Finals
  858,  // CONCACAF Gold Cup Qualification
  536,  // CONCACAF Nations League
  808,  // CONCACAF Nations League Qualification
  804,  // Caribbean Cup
  805,  // Copa Centroamericana
  
  // CONMEBOL (South America)
  9,    // Copa America
  
  // OFC (Oceania)
  806,  // OFC Nations Cup
  
  // Olympics
  480,  // Olympics Men
  881,  // Olympics Men Qualification CONCACAF
  
  // Friendlies
  10    // International Friendlies
];

// ============================================================================
// FIFA SUM Elo Rating Calculator - Official FIFA Formula Implementation
// ============================================================================

/**
 * Calculate expected result: We = 1 / (10^(-dr/600) + 1)
 * where dr = teamPoints - opponentPoints
 */
function calculateExpectedResult(teamPoints: number, opponentPoints: number): number {
  const dr = teamPoints - opponentPoints;
  return 1 / (Math.pow(10, -dr / 600) + 1);
}

/**
 * Determine if match is in knockout stage
 */
function isKnockoutStage(stage?: string): boolean {
  if (!stage) return false;
  const lower = stage.toLowerCase();
  return lower.includes('round of') || lower.includes('quarter') || 
         lower.includes('semi') || lower.includes('final') || 
         lower.includes('play-off') || lower.includes('playoff');
}

/**
 * Check if date is in FIFA International Match Calendar window
 */
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
 * 
 * CORRECTED VALUES:
 * - 5: Friendlies outside IMC windows
 * - 10: Friendlies during IMC windows
 * - 15: Nations League group phase
 * - 25: Nations League play-offs/finals, Qualifiers
 * - 35: Confederation finals up to QF
 * - 40: Confederation finals from QF onwards, Confederations Cup
 * - 50: World Cup finals up to QF
 * - 60: World Cup finals from QF onwards
 */
function getMatchImportance(leagueName: string, stage?: string, isIMC: boolean = true): number {
  const lowerName = leagueName.toLowerCase();
  const lowerStage = (stage || '').toLowerCase();
  
  // World Cup Finals
  if (lowerName.includes('world cup') && !lowerName.includes('qualification')) {
    // QF onwards: 60
    if (lowerStage.includes('quarter') || lowerStage.includes('semi') || 
        lowerStage.includes('final') || lowerStage.includes('third')) {
      return 60;
    }
    // Group/R16: 50
    return 50;
  }
  
  // World Cup Qualifiers: 25
  if (lowerName.includes('world cup') && lowerName.includes('qualification')) {
    return 25;
  }
  
  // Confederation Finals (Euro, Copa America, AFCON, Asian Cup, Gold Cup, OFC Nations)
  if (lowerName.includes('euro') || lowerName.includes('copa america') || 
      lowerName.includes('african cup') || lowerName.includes('africa cup') ||
      lowerName.includes('asian cup') || lowerName.includes('afcon') ||
      lowerName.includes('gold cup') || lowerName.includes('ofc nations')) {
    // QF onwards: 40
    if (lowerStage.includes('quarter') || lowerStage.includes('semi') || 
        lowerStage.includes('final') || lowerStage.includes('third')) {
      return 40;
    }
    // Group/R16: 35
    return 35;
  }
  
  // Confederations Cup: 40
  if (lowerName.includes('confederations cup')) {
    return 40;
  }
  
  // UEFA Nations League, CONCACAF Nations League
  if (lowerName.includes('nations league')) {
    // Finals/Play-offs: 25
    if (lowerStage.includes('final') || lowerStage.includes('semi') || 
        lowerStage.includes('play-off') || lowerStage.includes('playoff')) {
      return 25;
    }
    // Group phase: 15
    return 15;
  }
  
  // Qualifiers (Euro, AFCON, Asian Cup, etc.): 25
  if (lowerName.includes('qualification') || lowerName.includes('qualifier')) {
    return 25;
  }
  
  // Olympics: 25 (treat as major tournament qualification level)
  if (lowerName.includes('olympic')) {
    return 25;
  }
  
  // Friendlies - CORRECTED: I=5 outside IMC, I=10 during IMC
  if (lowerName.includes('friend') || lowerName.includes('international')) {
    return isIMC ? 10 : 5; // CRITICAL FIX: I=5 (not 0.5) outside IMC
  }
  
  // Regional tournaments (Caribbean Cup, SAFF, Gulf Cup, etc.): 15
  if (lowerName.includes('caribbean') || lowerName.includes('saff') || 
      lowerName.includes('gulf cup') || lowerName.includes('asean') ||
      lowerName.includes('cafa') || lowerName.includes('copa centroamericana')) {
    return 15;
  }
  
  // Default (assume friendly during IMC): 10
  return 10;
}

/**
 * Get actual result (W) with penalty shootout special handling
 */
function getActualResult(teamScore: number, opponentScore: number, isPSO: boolean): number {
  if (teamScore > opponentScore) {
    return isPSO ? 0.75 : 1.0; // PSO win: 0.75, Regular win: 1.0
  } else if (teamScore < opponentScore) {
    return isPSO ? 0.5 : 0.0; // PSO loss: 0.5, Regular loss: 0.0
  }
  return 0.5; // Draw: 0.5
}

/**
 * Calculate complete Elo change with all FIFA SUM rules
 * Formula: P = Pbefore + I × (W - We)
 * With knockout protection: teams don't lose points if (W - We) < 0
 */
function calculateCompleteElo(
  teamPoints: number,
  opponentPoints: number,
  teamScore: number,
  opponentScore: number,
  leagueName: string,
  stage?: string,
  isPSO: boolean = false,
  matchDate: Date = new Date()
) {
  const isIMC = isInIMCWindow(matchDate);
  const importance = getMatchImportance(leagueName, stage, isIMC);
  const actualResult = getActualResult(teamScore, opponentScore, isPSO);
  const expectedResult = calculateExpectedResult(teamPoints, opponentPoints);
  const isKnockout = isKnockoutStage(stage);
  
  let rawChange = importance * (actualResult - expectedResult);
  let pointsChange = rawChange;
  let appliedProtection = false;
  
  // Knockout protection: don't lose points when expected to lose
  if (isKnockout && rawChange < 0) {
    pointsChange = 0;
    appliedProtection = true;
  }
  
  // Round to 1 decimal
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
  
  // Filter for international matches - matches from our comprehensive league list
  return data.response.filter((f: ApiFootballFixture) => 
    INTERNATIONAL_LEAGUES.includes(f.league.id)
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
    console.log('Fetching live international matches (COMPREHENSIVE COVERAGE)...');
    console.log(`Monitoring ${INTERNATIONAL_LEAGUES.length} international competitions worldwide`);
    
    const liveMatches = await fetchLiveInternationalMatches();
    console.log(`Found ${liveMatches.length} live international matches`);

    if (liveMatches.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No live international matches at the moment',
          matchesUpdated: 0,
          leaguesMonitored: INTERNATIONAL_LEAGUES.length
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
      
      // For PSO: use penalty scores for Elo calculation (W value)
      let homeScoreForElo = homeScore;
      let awayScoreForElo = awayScore;
      if (isPSO && match.score?.penalty) {
        homeScoreForElo = match.score.penalty.home || homeScore;
        awayScoreForElo = match.score.penalty.away || awayScore;
      }
      
      // Calculate using FIFA SUM formula
      const homeCalc = calculateCompleteElo(
        homeTeam.current_points, awayTeam.current_points,
        homeScoreForElo, awayScoreForElo,
        match.league.name, stage, isPSO, matchDate
      );
      
      const awayCalc = calculateCompleteElo(
        awayTeam.current_points, homeTeam.current_points,
        awayScoreForElo, homeScoreForElo,
        match.league.name, stage, isPSO, matchDate
      );

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
        match_date: match.fixture.date
      });
      
      console.log(`${match.teams.home.name} ${homeScore}-${awayScore} ${match.teams.away.name} [${match.league.name}]`);
      console.log(`  I=${homeCalc.importance}, PSO=${isPSO}, Home=${homeCalc.pointsChange>0?'+':''}${homeCalc.pointsChange}, Away=${awayCalc.pointsChange>0?'+':''}${awayCalc.pointsChange}`);
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
        message: `Updated ${matchRecords.length} live matches with FIFA SUM calculations`,
        matchesUpdated: matchRecords.length,
        totalFound: liveMatches.length,
        leaguesMonitored: INTERNATIONAL_LEAGUES.length
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