// Update Match Results Edge Function
// Fetches completed international matches and calculates Elo rating changes

import { calculateCompleteElo } from '../_shared/elo-calculator.ts';

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Environment variables
        const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!API_FOOTBALL_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing required environment variables');
        }

        // Supabase headers
        const supabaseHeaders = {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
        };

        // International tournament IDs to monitor
        const INTERNATIONAL_LEAGUE_IDS = [
            1,    // FIFA World Cup
            2,    // FIFA World Cup Qualifiers
            3,    // Olympics
            5,    // Friendlies
            6,    // UEFA Nations League
            7,    // UEFA Nations League Qualifiers
            8,    // UEFA Nations League Finals
            10,   // UEFA Euro Qualifiers
            11,   // UEFA Euro
            12,   // UEFA Euro Finals
            15,   // CONMEBOL World Cup Qualifiers
            16,   // Copa America
            17,   // Copa America Qualifiers
            21,   // African Cup of Nations
            22,   // African Cup of Nations Qualifiers
            23,   // African Cup of Nations Nations Cup
            30,   // Asian Cup
            31,   // Asian Cup Qualifiers
            32,   // Asian Cup Qualifiers Final
            33,   // Asian Games
            34,   // OFC Nations Cup
            35,   // OFC Nations Cup Qualifiers
            39,   // CONCACAF Gold Cup
            40,   // CONCACAF Gold Cup Qualifiers
            41,   // CONCACAF Nations League
            42,   // CONCACAF Nations League Qualifiers
            43,   // CONCACAF Nations League Finals
            44,   // World Cup Qualifiers Asia
            45,   // World Cup Qualifiers Africa
            46,   // World Cup Qualifiers South America
            47,   // World Cup Qualifiers North America
            48,   // World Cup Qualifiers Europe
            49,   // World Cup Qualifiers Oceania
            50,   // Confederations Cup
            53,   // Arab Cup
            54,   // Arab Cup Qualifiers
            55,   // Gulf Cup
            56,   // Gulf Cup Qualifiers
            57,   // South Asian Football Federation Championship
            58,   // South Asian Football Federation Gold Cup
            59,   // ASEAN Football Championship
            60,   // AFC Asian Cup Qualifiers
            61,   // AFC Asian Cup Qualifiers Final
            62,   // Asian Cup (extended)
            63,   // Africa Cup of Nations Qualifiers (extended)
            64,   // World Cup Women
            65,   // World Cup Women Qualifiers
            71,   // U20 World Cup
            72,   // U20 World Cup Qualifiers
            73,   // U23 Olympic Games
            74,   // U23 Olympic Games Qualifiers
            75,   // U17 World Cup
            76,   // U17 World Cup Qualifiers
            78,   // U20 World Cup Women
            79,   // U20 World Cup Women Qualifiers
            80,   // U17 World Cup Women
            81    // U17 World Cup Women Qualifiers
        ];

        // Get current date and calculate date range (30 days back)
        const now = new Date();
        const fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 30);
        const toDate = new Date(now);

        const fromDateStr = fromDate.toISOString().split('T')[0];
        const toDateStr = toDate.toISOString().split('T')[0];

        console.log(`Fetching completed matches from ${fromDateStr} to ${toDateStr}`);

        let totalMatches = 0;
        let processedMatches = 0;
        let eloCalculations = 0;
        let databaseUpdates = 0;
        const matchResults = [];

        // Fetch matches for each league
        for (const leagueId of INTERNATIONAL_LEAGUE_IDS) {
            try {
                const fixturesUrl = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&from=${fromDateStr}&to=${toDateStr}&status=FT-AET-PEN`;
                
                const fixturesResponse = await fetch(fixturesUrl, {
                    headers: {
                        'X-RapidAPI-Key': API_FOOTBALL_KEY,
                        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
                    }
                });

                if (!fixturesResponse.ok) {
                    console.log(`Failed to fetch matches for league ${leagueId}: ${fixturesResponse.status}`);
                    continue;
                }

                const fixturesData = await fixturesResponse.json();
                
                if (fixturesData.response && fixturesData.response.length > 0) {
                    console.log(`Found ${fixturesData.response.length} completed matches for league ${leagueId}`);
                    totalMatches += fixturesData.response.length;
                    
                    // Process each match
                    for (const fixture of fixturesData.response) {
                        try {
                            // Only process if match has result and is a final result
                            if (fixture.fixture.status.short === 'FT' || 
                                fixture.fixture.status.short === 'AET' || 
                                fixture.fixture.status.short === 'PEN') {
                                
                                processedMatches++;

                                // Get or create team records in database
                                let homeTeam = await getOrCreateTeam(fixture.teams.home.id, fixture.teams.home.name, supabaseHeaders, SUPABASE_URL);
                                let awayTeam = await getOrCreateTeam(fixture.teams.away.id, fixture.teams.away.name, supabaseHeaders, SUPABASE_URL);

                                // Determine if it's a knockout match
                                const isKnockout = isKnockoutStage(fixture.league.round || '', fixture.fixture.status.short);
                                
                                // Check if went to penalty shootout
                                const wentToPenalty = fixture.fixture.status.short === 'PEN';
                                
                                // Calculate Elo rating changes
                                const eloResult = calculateCompleteElo({
                                    homeTeam,
                                    awayTeam,
                                    homeGoals: fixture.goals.home || 0,
                                    awayGoals: fixture.goals.away || 0,
                                    tournamentId: fixture.league.id,
                                    tournamentType: getTournamentType(fixture.league.id),
                                    stage: extractStage(fixture.league.round || ''),
                                    isKnockout,
                                    wentToPenalty
                                });

                                eloCalculations++;

                                // Store match result and Elo changes
                                const matchData = {
                                    external_fixture_id: fixture.fixture.id,
                                    home_team_id: homeTeam.id,
                                    away_team_id: awayTeam.id,
                                    home_team_name: fixture.teams.home.name,
                                    away_team_name: fixture.teams.away.name,
                                    league_id: fixture.league.id,
                                    league_name: fixture.league.name,
                                    season: fixture.league.season,
                                    round: fixture.league.round || '',
                                    kickoff_time: fixture.fixture.date,
                                    status: fixture.fixture.status.short,
                                    venue_name: fixture.fixture.venue?.name || '',
                                    venue_city: fixture.fixture.venue?.city || '',
                                    referee: fixture.fixture.referee || '',
                                    home_score: fixture.goals.home || 0,
                                    away_score: fixture.goals.away || 0,
                                    home_elo_before: homeTeam.elo_rating,
                                    away_elo_before: awayTeam.elo_rating,
                                    home_elo_after: homeTeam.elo_rating + eloResult.homeEloChange,
                                    away_elo_after: awayTeam.elo_rating + eloResult.awayEloChange,
                                    elo_change_home: eloResult.homeEloChange,
                                    elo_change_away: eloResult.awayEloChange,
                                    importance_multiplier: eloResult.importance,
                                    went_to_penalty: wentToPenalty,
                                    is_knockout: isKnockout,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                };

                                matchResults.push(matchData);

                                // Update team Elo ratings in database
                                await updateTeamElo(homeTeam.id, homeTeam.elo_rating + eloResult.homeEloChange, supabaseHeaders, SUPABASE_URL);
                                await updateTeamElo(awayTeam.id, awayTeam.elo_rating + eloResult.awayEloChange, supabaseHeaders, SUPABASE_URL);
                                
                                databaseUpdates += 2;
                            }
                        } catch (error) {
                            console.error(`Error processing match ${fixture.fixture.id}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching matches for league ${leagueId}:`, error);
            }
        }

        // Bulk insert match results
        if (matchResults.length > 0) {
            console.log(`Inserting ${matchResults.length} match results into database`);
            
            const batchSize = 50;
            let insertedCount = 0;

            for (let i = 0; i < matchResults.length; i += batchSize) {
                const batch = matchResults.slice(i, i + batchSize);
                
                const { error: insertError } = await fetch(`${SUPABASE_URL}/rest/v1/match_results`, {
                    method: 'POST',
                    headers: supabaseHeaders,
                    body: JSON.stringify(batch)
                });

                if (insertError) {
                    console.error('Database insert error:', insertError);
                } else {
                    insertedCount += batch.length;
                }
            }

            console.log(`Successfully inserted ${insertedCount} match results`);
        }

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            summary: {
                dateRange: {
                    from: fromDateStr,
                    to: toDateStr
                },
                leaguesProcessed: INTERNATIONAL_LEAGUE_IDS.length,
                totalMatchesFound: totalMatches,
                processedMatches: processedMatches,
                eloCalculations: eloCalculations,
                databaseUpdates: databaseUpdates,
                matchResultsInserted: matchResults.length
            }
        };

        return new Response(JSON.stringify(response, null, 2), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update match results error:', error);
        
        const errorResponse = {
            error: {
                code: 'UPDATE_MATCH_RESULTS_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to get or create team
async function getOrCreateTeam(teamId: number, teamName: string, headers: any, supabaseUrl: string) {
    // Try to get existing team
    const response = await fetch(`${supabaseUrl}/rest/v1/teams?external_team_id=eq.${teamId}`, {
        headers
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
        return data[0];
    }
    
    // Create new team if doesn't exist
    const newTeam = {
        external_team_id: teamId,
        name: teamName,
        elo_rating: 1500, // Initial Elo rating
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/teams`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newTeam)
    });
    
    if (createResponse.ok) {
        return { ...newTeam, id: Date.now() }; // Simple ID for new team
    }
    
    throw new Error(`Failed to create team: ${teamName}`);
}

// Helper function to update team Elo rating
async function updateTeamElo(teamId: number, newElo: number, headers: any, supabaseUrl: string) {
    const { error } = await fetch(`${supabaseUrl}/rest/v1/teams?id=eq.${teamId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            elo_rating: newElo,
            updated_at: new Date().toISOString()
        })
    });
    
    if (error) {
        console.error(`Failed to update Elo for team ${teamId}:`, error);
    }
}

// Helper function to determine if match is knockout
function isKnockoutStage(round: string, status: string): boolean {
    const knockoutKeywords = ['final', 'semi', 'quarter', 'round', 'knockout', 'playoff'];
    const stage = round.toLowerCase();
    return knockoutKeywords.some(keyword => stage.includes(keyword)) || status === 'PEN';
}

// Helper function to determine tournament type
function getTournamentType(leagueId: number): string {
    const friendlyLeagues = [5]; // Friendlies
    const qualifierLeagues = [2, 7, 10, 17, 22, 32, 40, 42, 44, 45, 46, 47, 48, 49, 65, 72, 74, 76, 79, 81];
    const tournamentLeagues = [1, 3, 6, 8, 11, 15, 16, 21, 30, 34, 39, 41, 43, 50, 53, 55, 57, 58, 59, 64, 71, 73, 75, 78, 80];
    
    if (friendlyLeagues.includes(leagueId)) return 'friendly';
    if (qualifierLeagues.includes(leagueId)) return 'qualifier';
    if (tournamentLeagues.includes(leagueId)) return 'tournament';
    return 'other';
}

// Helper function to extract stage from round string
function extractStage(round: string): string | null {
    if (!round) return null;
    
    const stage = round.toLowerCase();
    if (stage.includes('group') || stage.includes('gr.')) return 'group';
    if (stage.includes('quarter')) return 'quarter';
    if (stage.includes('semi')) return 'semi';
    if (stage.includes('final')) return 'final';
    if (stage.includes('round')) return 'round';
    
    return null;
}