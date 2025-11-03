// Update Upcoming Matches V6 Edge Function
// Enhanced version using tournament registry for comprehensive coverage

import { calculateExpectedResult, getMatchImportance } from '../_shared/elo-calculator.ts';
import { TOURNAMENT_REGISTRY, ALL_INTERNATIONAL_LEAGUE_IDS } from '../_shared/tournament-registry.ts';

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

        // Get date range for next 48 hours
        const now = new Date();
        const toDate = new Date(now);
        toDate.setHours(toDate.getHours() + 48);

        const todayStr = now.toISOString().split('T')[0];
        const toDateStr = toDate.toISOString().split('T')[0];

        console.log(`Fetching upcoming matches from ${todayStr} to ${toDateStr} using tournament registry`);

        let totalUpcoming = 0;
        let processedMatches = 0;
        const upcomingMatches = [];

        // Fetch upcoming matches for each league using tournament registry
        for (const leagueId of ALL_INTERNATIONAL_LEAGUE_IDS) {
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

                            // Get tournament information from registry
                            const tournamentInfo = TOURNAMENT_REGISTRY[leagueId] || {
                                name: fixture.league.name,
                                confederation: 'other',
                                tier: 3,
                                base_importance: 5,
                                type: 'friendly'
                            };

                            // Determine if it's a knockout match
                            const isKnockout = isKnockoutStage(fixture.league.round || '');
                            
                            // Calculate expected result
                            const expectedResult = calculateExpectedResult(
                                homeTeam.elo_rating, 
                                awayTeam.elo_rating, 
                                isKnockout
                            );

                            // Get match importance using enhanced logic
                            const importance = getMatchImportance(
                                tournamentInfo.type,
                                extractStage(fixture.league.round || ''),
                                isKnockout
                            );

                            // Calculate potential Elo changes with enhanced scenarios
                            const potentialChanges = calculateEnhancedPotentialChanges(
                                homeTeam, 
                                awayTeam, 
                                expectedResult, 
                                importance, 
                                isKnockout,
                                tournamentInfo
                            );

                            // Create enhanced match preview
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
                                tournament_type: tournamentInfo.type,
                                tournament_confederation: tournamentInfo.confederation,
                                tournament_tier: tournamentInfo.tier,
                                tournament_base_importance: tournamentInfo.base_importance,
                                stage: extractStage(fixture.league.round || ''),
                                hours_until_kickoff: Math.max(0, Math.floor((new Date(fixture.fixture.date).getTime() - now.getTime()) / (1000 * 60 * 60))),
                                match_significance: calculateMatchSignificance(tournamentInfo, isKnockout, extractStage(fixture.league.round || '')),
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

        // Sort matches by kickoff time and importance
        upcomingMatches.sort((a, b) => {
            // First sort by hours until kickoff
            if (a.hours_until_kickoff !== b.hours_until_kickoff) {
                return a.hours_until_kickoff - b.hours_until_kickoff;
            }
            // Then by importance multiplier (highest first)
            return b.importance_multiplier - a.importance_multiplier;
        });

        // Bulk upsert upcoming matches to database
        if (upcomingMatches.length > 0) {
            console.log(`Upserting ${upcomingMatches.length} enhanced upcoming matches into database`);
            
            const batchSize = 50;
            let upsertedCount = 0;

            for (let i = 0; i < upcomingMatches.length; i += batchSize) {
                const batch = upcomingMatches.slice(i, i + batchSize);
                
                const { error: upsertError } = await fetch(`${SUPABASE_URL}/rest/v1/upcoming_matches_v6`, {
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

            console.log(`Successfully upserted ${upsertedCount} enhanced upcoming matches`);
        }

        // Get enhanced summary statistics
        const summaryStats = {
            totalMatches: upcomingMatches.length,
            highImportanceMatches: upcomingMatches.filter(m => m.importance_multiplier >= 25).length,
            knockoutMatches: upcomingMatches.filter(m => m.is_knockout).length,
            avgImportance: upcomingMatches.length > 0 ? 
                (upcomingMatches.reduce((sum, m) => sum + m.importance_multiplier, 0) / upcomingMatches.length).toFixed(1) : 0,
            upcoming24h: upcomingMatches.filter(m => m.hours_until_kickoff <= 24).length,
            upcoming48h: upcomingMatches.filter(m => m.hours_until_kickoff <= 48).length,
            confederations: getConfederationStats(upcomingMatches),
            tournamentTypes: getTournamentTypeStats(upcomingMatches),
            mostSignificantMatches: upcomingMatches
                .filter(m => m.match_significance >= 80)
                .slice(0, 10)
        };

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            summary: {
                dateRange: {
                    from: todayStr,
                    to: toDateStr
                },
                leaguesProcessed: ALL_INTERNATIONAL_LEAGUE_IDS.length,
                totalUpcomingFound: totalUpcoming,
                processedMatches: processedMatches,
                upcomingMatchesInserted: upcomingMatches.length,
                summaryStats,
                tournamentRegistryUsed: true,
                registrySize: Object.keys(TOURNAMENT_REGISTRY).length
            },
            upcomingMatches: upcomingMatches.slice(0, 20), // Return first 20 matches
            previewStats: summaryStats,
            registryInfo: {
                totalTournaments: Object.keys(TOURNAMENT_REGISTRY).length,
                confederations: [...new Set(Object.values(TOURNAMENT_REGISTRY).map(t => t.confederation))],
                tournamentTypes: [...new Set(Object.values(TOURNAMENT_REGISTRY).map(t => t.type))]
            }
        };

        return new Response(JSON.stringify(response, null, 2), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update upcoming matches v6 error:', error);
        
        const errorResponse = {
            error: {
                code: 'UPDATE_UPCOMING_MATCHES_V6_ERROR',
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
    const knockoutKeywords = ['final', 'semi', 'quarter', 'round', 'knockout', 'playoff', 'elimination'];
    const stage = round.toLowerCase();
    return knockoutKeywords.some(keyword => stage.includes(keyword));
}

// Helper function to extract stage from round string
function extractStage(round: string): string | null {
    if (!round) return null;
    
    const stage = round.toLowerCase();
    if (stage.includes('group') || stage.includes('gr.')) return 'group';
    if (stage.includes('quarter') || stage.includes('qf')) return 'quarter';
    if (stage.includes('semi') || stage.includes('sf')) return 'semi';
    if (stage.includes('final')) return 'final';
    if (stage.includes('round') || stage.includes('r16') || stage.includes('r32')) return 'round';
    if (stage.includes('elimination')) return 'elimination';
    
    return null;
}

// Helper function to calculate match significance score (0-100)
function calculateMatchSignificance(tournamentInfo: any, isKnockout: boolean, stage: string | null): number {
    let significance = tournamentInfo.base_importance * 2; // Base score
    
    // Confederation bonuses
    const confederationBonuses = {
        'fifa': 20,
        'uefa': 15,
        'conmebol': 15,
        'concacaf': 12,
        'caf': 10,
        'afc': 10,
        'ofc': 8,
        'other': 5
    };
    significance += confederationBonuses[tournamentInfo.confederation] || confederationBonuses['other'];
    
    // Stage bonuses
    if (stage === 'final') significance += 25;
    else if (stage === 'semi') significance += 20;
    else if (stage === 'quarter') significance += 15;
    else if (stage === 'group') significance += 10;
    
    // Knockout bonus
    if (isKnockout) significance += 10;
    
    // Tournament type bonuses
    if (tournamentInfo.type === 'tournament') significance += 15;
    else if (tournamentInfo.type === 'qualifier') significance += 10;
    else if (tournamentInfo.type === 'friendly') significance -= 5;
    
    return Math.min(100, Math.max(0, significance));
}

// Helper function to calculate enhanced potential Elo changes
function calculateEnhancedPotentialChanges(homeTeam: any, awayTeam: any, expectedResult: number, importance: number, isKnockout: boolean, tournamentInfo: any) {
    const scenarios = [
        {
            result: 'home_win',
            homeScore: 1,
            awayScore: 0,
            homeChange: importance * (1 - expectedResult),
            awayChange: importance * (0 - (1 - expectedResult)),
            description: 'Home Win',
            probability: expectedResult < 0.5 ? 'unlikely' : expectedResult < 0.7 ? 'favored' : 'strongly favored'
        },
        {
            result: 'draw',
            homeScore: 0.5,
            awayScore: 0.5,
            homeChange: importance * (0.5 - expectedResult),
            awayChange: importance * (0.5 - (1 - expectedResult)),
            description: 'Draw',
            probability: 'balanced'
        },
        {
            result: 'away_win',
            homeScore: 0,
            awayScore: 1,
            homeChange: importance * (0 - expectedResult),
            awayChange: importance * (1 - (1 - expectedResult)),
            description: 'Away Win',
            probability: expectedResult > 0.5 ? 'unlikely' : expectedResult > 0.3 ? 'favored' : 'strongly favored'
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
                description: 'Penalty Shootout Win (Home)',
                probability: 'special'
            },
            {
                result: 'pso_away_win',
                homeScore: 0.25,
                awayScore: 0.75,
                homeChange: importance * (0.25 - expectedResult),
                awayChange: importance * (0.75 - (1 - expectedResult)),
                description: 'Penalty Shootout Win (Away)',
                probability: 'special'
            }
        );
    }

    return scenarios.map(scenario => ({
        ...scenario,
        homeEloAfter: homeTeam.elo_rating + scenario.homeChange,
        awayEloAfter: awayTeam.elo_rating + scenario.awayChange,
        eloGapChange: Math.abs((homeTeam.elo_rating + scenario.homeChange) - (awayTeam.elo_rating + scenario.awayChange)) - Math.abs(homeTeam.elo_rating - awayTeam.elo_rating),
        tournamentImpact: scenario.homeChange + scenario.awayChange,
        significance: calculateMatchSignificance(tournamentInfo, isKnockout, extractStage(''))
    }));
}

// Helper function to get confederation statistics
function getConfederationStats(matches: any[]): any {
    const stats: any = {};
    matches.forEach(match => {
        const confed = match.tournament_confederation || 'other';
        if (!stats[confed]) {
            stats[confed] = { count: 0, avgImportance: 0, totalImportance: 0 };
        }
        stats[confed].count++;
        stats[confed].totalImportance += match.importance_multiplier;
    });
    
    Object.keys(stats).forEach(confed => {
        stats[confed].avgImportance = (stats[confed].totalImportance / stats[confed].count).toFixed(1);
        delete stats[confed].totalImportance;
    });
    
    return stats;
}

// Helper function to get tournament type statistics
function getTournamentTypeStats(matches: any[]): any {
    const stats: any = {};
    matches.forEach(match => {
        const type = match.tournament_type || 'other';
        if (!stats[type]) {
            stats[type] = { count: 0, avgImportance: 0, totalImportance: 0 };
        }
        stats[type].count++;
        stats[type].totalImportance += match.importance_multiplier;
    });
    
    Object.keys(stats).forEach(type => {
        stats[type].avgImportance = (stats[type].totalImportance / stats[type].count).toFixed(1);
        delete stats[type].totalImportance;
    });
    
    return stats;
}