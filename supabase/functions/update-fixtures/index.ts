// Update International Fixtures Edge Function
// Fetches upcoming international fixtures and populates the fixtures table

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

        // Supabase client
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

        // Get current date and calculate date range (3 months ahead)
        const now = new Date();
        const fromDate = new Date(now);
        const toDate = new Date(now);
        toDate.setMonth(toDate.getMonth() + 3);

        const fromDateStr = fromDate.toISOString().split('T')[0];
        const toDateStr = toDate.toISOString().split('T')[0];

        console.log(`Fetching fixtures from ${fromDateStr} to ${toDateStr}`);

        // Fetch fixtures for each league
        let totalFixtures = 0;
        let processedFixtures = 0;
        const allFixtures = [];

        for (const leagueId of INTERNATIONAL_LEAGUE_IDS) {
            try {
                const fixturesUrl = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&from=${fromDateStr}&to=${toDateStr}&status=NS-CANC-TBD`;
                
                const fixturesResponse = await fetch(fixturesUrl, {
                    headers: {
                        'X-RapidAPI-Key': API_FOOTBALL_KEY,
                        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
                    }
                });

                if (!fixturesResponse.ok) {
                    console.log(`Failed to fetch fixtures for league ${leagueId}: ${fixturesResponse.status}`);
                    continue;
                }

                const fixturesData = await fixturesResponse.json();
                
                if (fixturesData.response && fixturesData.response.length > 0) {
                    console.log(`Found ${fixturesData.response.length} fixtures for league ${leagueId}`);
                    totalFixtures += fixturesData.response.length;
                    
                    // Process fixtures
                    for (const fixture of fixturesData.response) {
                        try {
                            const fixtureData = {
                                external_fixture_id: fixture.fixture.id,
                                home_team_name: fixture.teams.home.name,
                                home_team_id: fixture.teams.home.id,
                                away_team_name: fixture.teams.away.name,
                                away_team_id: fixture.teams.away.id,
                                league_id: fixture.league.id,
                                league_name: fixture.league.name,
                                season: fixture.league.season,
                                round: fixture.league.round || '',
                                kickoff_time: fixture.fixture.date,
                                status: fixture.fixture.status.short,
                                venue_name: fixture.fixture.venue?.name || '',
                                venue_city: fixture.fixture.venue?.city || '',
                                referee: fixture.fixture.referee || '',
                                home_score: null,
                                away_score: null,
                                match_day: fixture.fixture.timestamp ? new Date(fixture.fixture.timestamp * 1000) : null,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            };

                            allFixtures.push(fixtureData);
                            processedFixtures++;
                        } catch (error) {
                            console.error(`Error processing fixture ${fixture.fixture.id}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching fixtures for league ${leagueId}:`, error);
            }
        }

        console.log(`Total fixtures to process: ${processedFixtures}`);

        // Bulk upsert fixtures to Supabase
        if (allFixtures.length > 0) {
            // Remove duplicates based on external_fixture_id
            const uniqueFixtures = allFixtures.filter((fixture, index, self) => 
                index === self.findIndex(f => f.external_fixture_id === fixture.external_fixture_id)
            );

            console.log(`Unique fixtures to insert: ${uniqueFixtures.length}`);

            // Split into batches to avoid payload limits
            const batchSize = 100;
            let insertedCount = 0;

            for (let i = 0; i < uniqueFixtures.length; i += batchSize) {
                const batch = uniqueFixtures.slice(i, i + batchSize);
                
                const { data: upsertData, error: upsertError } = await fetch(`${SUPABASE_URL}/rest/v1/fixtures`, {
                    method: 'POST',
                    headers: {
                        ...supabaseHeaders,
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify(batch)
                });

                if (upsertError) {
                    console.error('Supabase upsert error:', upsertError);
                } else {
                    insertedCount += batch.length;
                    console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(uniqueFixtures.length/batchSize)}`);
                }
            }

            console.log(`Successfully processed ${insertedCount} fixtures`);
        }

        // Get current fixture count from database
        const { data: fixtureCount, error: countError } = await fetch(`${SUPABASE_URL}/rest/v1/fixtures?select=count`, {
            headers: {
                ...supabaseHeaders,
                'Prefer': 'count=exact'
            }
        });

        let currentCount = 0;
        if (countError) {
            console.error('Error getting fixture count:', countError);
        } else {
            const countData = await countError.json().catch(() => null);
            currentCount = countData?.[0]?.count || 0;
        }

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            summary: {
                leaguesProcessed: INTERNATIONAL_LEAGUE_IDS.length,
                totalFixturesFound: totalFixtures,
                uniqueFixturesProcessed: allFixtures.length,
                duplicatesRemoved: totalFixtures - allFixtures.length,
                dateRange: {
                    from: fromDateStr,
                    to: toDateStr
                },
                currentDatabaseCount: currentCount,
                leagues: INTERNATIONAL_LEAGUE_IDS
            },
            leagues: INTERNATIONAL_LEAGUE_IDS
        };

        return new Response(JSON.stringify(response, null, 2), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update fixtures error:', error);
        
        const errorResponse = {
            error: {
                code: 'UPDATE_FIXTURES_ERROR',
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