// Update Upcoming Matches Edge Function
// Fetches upcoming international matches and calculates potential Elo changes

import { calculateExpectedResult, getMatchImportance } from '../_shared/elo-calculator.ts';

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

        // Get date range for next 48 hours
        const now = new Date();
        const toDate = new Date(now);
        toDate.setHours(toDate.getHours() + 48);

        const todayStr = now.toISOString().split('T')[0];
        const toDateStr = toDate.toISOString().split('T')[0];

        console.log(`Fetching upcoming matches from ${todayStr} to ${toDateStr}`);

        let totalUpcoming = 0;
        let processedMatches = 0;
        const upcomingMatches = [];

        // Fetch upcoming matches for each league
        for (const leagueId of INTERNATIONAL_LEAGUE_IDS) {
            try {
                const fixturesUrl = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&from=${todayStr}&to=${toDateStr}&status=NS-TBD`;
                
                const fixturesResponse = await fetch(fixturesUrl, {
                    headers: {
                        'X-RapidAPI-Key': API_FOOTBALL_KEY,
                        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
                    }
                });

                if (!fixturesResponse.ok) {
                    console.log(`Failed to fetch upcoming matches for league ${leagueId}: ${fixturesResponse.status}`);
                    continue;
                }

                const fixturesData = await fixturesResponse.json();
                
                if (fixturesData.response && fixturesData.response.length > 0) {
                    console.log(`Found ${fixturesData.response.length} upcoming matches for league ${leagueId}`);
                    totalUpcoming += fixturesData.response.length;
                    
                    // Process each upcoming match
                    for (const fixture of fixturesData.response) {
                        try {
                            processedMatches++;

                            // Get or create team records in database
                            let homeTeam = await getOrCreateTeam(fixture.teams.home.id, fixture.teams.home.name, supabaseHeaders, SUPABASE_URL);
                            let awayTeam = await getOrCreateTeam(fixture.teams.away.id, fixture.teams.away.name, supabaseHeaders, SUPABASE_URL);

                            // Determine if it's a knockout match
                            const isKnockout = isKnockoutStage(fixture.league.round || '');
                            
                            // Calculate expected result
                            const expectedResult = calculateExpectedResult(
                                homeTeam.elo_rating, 
                                awayTeam.elo_rating, 
                                isKnockout
                            );

                            // Get match importance
                            const importance = getMatchImportance(
                                getTournamentType(fixture.league.id),
                                extractStage(fixture.league.round || ''),
                                isKnockout
                            );

                            // Calculate potential Elo changes
                            const potentialChanges = calculatePotentialChanges(
                                homeTeam, 
                                awayTeam, 
                                expectedResult, 
                                importance, 
                                isKnockout
                            );

                            // Create match preview
                            const matchPreview = {
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
                                home_elo_rating: homeTeam.elo_rating,
                                away_elo_rating: awayTeam.elo_rating,
                                expected_home_score: expectedResult,
                                expected_away_score: 1 - expectedResult,
                                importance_multiplier: importance,
                                is_knockout: isKnockout,
                                potential_changes: potentialChanges,
                                tournament_type: getTournamentType(fixture.league.id),
                                stage: extractStage(fixture.league.round || ''),
                                hours_until_kickoff: Math.max(0, Math.floor((new Date(fixture.fixture.date).getTime() - now.getTime()) / (1000 * 60 * 60))),
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            };

                            upcomingMatches.push(matchPreview);
                        } catch (error) {
                            console.error(`Error processing upcoming match ${fixture.fixture.id}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching upcoming matches for league ${leagueId}:`, error);
            }
        }

        // Sort matches by kickoff time
        upcomingMatches.sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime());

        // Bulk upsert upcoming matches to database
        if (upcomingMatches.length > 0) {
            console.log(`Upserting ${upcomingMatches.length} upcoming matches into database`);
            
            const batchSize = 50;
            let upsertedCount = 0;

            for (let i = 0; i < upcomingMatches.length; i += batchSize) {
                const batch = upcomingMatches.slice(i, i + batchSize);
                
                const { error: upsertError } = await fetch(`${SUPABASE_URL}/rest/v1/upcoming_matches`, {
                    method: 'POST',
                    headers: {
                        ...supabaseHeaders,
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify(batch)
                });

                if (upsertError) {
                    console.error('Database upsert error:', upsertError);
                } else {
                    upsertedCount += batch.length;
                }
            }

            console.log(`Successfully upserted ${upsertedCount} upcoming matches`);
        }

        // Get summary statistics
        const summaryStats = {
            totalMatches: upcomingMatches.length,
            highImportanceMatches: upcomingMatches.filter(m => m.importance_multiplier >= 25).length,
            knockoutMatches: upcomingMatches.filter(m => m.is_knockout).length,
            avgImportance: upcomingMatches.length > 0 ? 
                (upcomingMatches.reduce((sum, m) => sum + m.importance_multiplier, 0) / upcomingMatches.length).toFixed(1) : 0,
            upcoming24h: upcomingMatches.filter(m => m.hours_until_kickoff <= 24).length,
            upcoming48h: upcomingMatches.filter(m => m.hours_until_kickoff <= 48).length
        };

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            summary: {
                dateRange: {
                    from: todayStr,
                    to: toDateStr
                },
                leaguesProcessed: INTERNATIONAL_LEAGUE_IDS.length,
                totalUpcomingFound: totalUpcoming,
                processedMatches: processedMatches,
                upcomingMatchesInserted: upcomingMatches.length,
                summaryStats
            },
            upcomingMatches: upcomingMatches.slice(0, 20), // Return first 20 matches
            previewStats: summaryStats
        };

        return new Response(JSON.stringify(response, null, 2), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update upcoming matches error:', error);
        
        const errorResponse = {
            error: {
                code: 'UPDATE_UPCOMING_MATCHES_ERROR',
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

// Helper function to determine if match is knockout
function isKnockoutStage(round: string): boolean {
    const knockoutKeywords = ['final', 'semi', 'quarter', 'round', 'knockout', 'playoff'];
    const stage = round.toLowerCase();
    return knockoutKeywords.some(keyword => stage.includes(keyword));
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

// Helper function to calculate potential Elo changes
function calculatePotentialChanges(homeTeam: any, awayTeam: any, expectedResult: number, importance: number, isKnockout: boolean) {
    const scenarios = [
        {
            result: 'home_win',
            homeScore: 1,
            awayScore: 0,
            homeChange: importance * (1 - expectedResult),
            awayChange: importance * (0 - (1 - expectedResult)),
            description: 'Home Win'
        },
        {
            result: 'draw',
            homeScore: 0.5,
            awayScore: 0.5,
            homeChange: importance * (0.5 - expectedResult),
            awayChange: importance * (0.5 - (1 - expectedResult)),
            description: 'Draw'
        },
        {
            result: 'away_win',
            homeScore: 0,
            awayScore: 1,
            homeChange: importance * (0 - expectedResult),
            awayChange: importance * (1 - (1 - expectedResult)),
            description: 'Away Win'
        }
    ];

    // Add penalty shootout scenarios for knockout matches
    if (isKnockout) {
        scenarios.push(
            {
                result: 'pso_home_win',
                homeScore: 0.75,
                awayScore: 0.25,
                homeChange: importance * (0.75 - expectedResult),
                awayChange: importance * (0.25 - (1 - expectedResult)),
                description: 'Penalty Shootout Win (Home)'
            },
            {
                result: 'pso_away_win',
                homeScore: 0.25,
                awayScore: 0.75,
                homeChange: importance * (0.25 - expectedResult),
                awayChange: importance * (0.75 - (1 - expectedResult)),
                description: 'Penalty Shootout Win (Away)'
            }
        );
    }

    return scenarios.map(scenario => ({
        ...scenario,
        homeEloAfter: homeTeam.elo_rating + scenario.homeChange,
        awayEloAfter: awayTeam.elo_rating + scenario.awayChange
    }));
}