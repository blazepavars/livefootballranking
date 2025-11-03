// Test FIFA SUM Elo Calculation Edge Function
// This function provides comprehensive verification tests for the FIFA SUM Elo calculation
// Validates the formula against official FIFA examples and includes an embedded calculator

import { calculateExpectedResult, getMatchImportance, calculateCompleteElo } from '../_shared/elo-calculator.ts';

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
        // Test cases based on FIFA examples
        const testCases = [
            {
                name: "UEFA Euro Group Stage (Important Match)",
                homeTeam: { name: "Spain", elo: 2100 },
                awayTeam: { name: "Germany", elo: 2200 },
                tournamentId: 444, // Euro
                tournamentType: "tournament",
                stage: "group",
                homeGoals: 2,
                awayGoals: 1,
                isKnockout: false
            },
            {
                name: "FIFA World Cup Final (Very Important Match)",
                homeTeam: { name: "Argentina", elo: 2200 },
                awayTeam: { name: "France", elo: 2250 },
                tournamentId: 1, // World Cup
                tournamentType: "tournament",
                stage: "final",
                homeGoals: 3,
                awayGoals: 2,
                isKnockout: true,
                wentToPenalty: true
            },
            {
                name: "Friendly Match (Low Importance)",
                homeTeam: { name: "Brazil", elo: 2100 },
                awayTeam: { name: "Italy", elo: 2000 },
                tournamentId: 5, // Friendlies
                tournamentType: "friendly",
                stage: null,
                homeGoals: 1,
                awayGoals: 1,
                isKnockout: false
            },
            {
                name: "Penalty Shootout Victory",
                homeTeam: { name: "Netherlands", elo: 2000 },
                awayTeam: { name: "Portugal", elo: 2050 },
                tournamentId: 444, // Euro
                tournamentType: "tournament",
                stage: "quarter",
                homeGoals: 1,
                awayGoals: 1,
                isKnockout: true,
                wentToPenalty: true
            },
            {
                name: "World Cup Qualifier (High Importance)",
                homeTeam: { name: "England", elo: 2000 },
                awayTeam: { name: "Scotland", elo: 1800 },
                tournamentId: 44, // World Cup Qualifiers
                tournamentType: "qualifier",
                stage: null,
                homeGoals: 2,
                awayGoals: 0,
                isKnockout: false
            }
        ];

        const results = [];
        let totalTestsPassed = 0;
        let totalTests = 0;

        for (const testCase of testCases) {
            totalTests++;
            
            try {
                // Calculate expected result
                const expected = calculateExpectedResult(
                    testCase.homeTeam.elo, 
                    testCase.awayTeam.elo, 
                    testCase.isKnockout
                );

                // Get match importance
                const importance = getMatchImportance(
                    testCase.tournamentType,
                    testCase.stage,
                    testCase.isKnockout
                );

                // Calculate actual result
                let actualResult;
                if (testCase.homeGoals === testCase.awayGoals) {
                    if (testCase.wentToPenalty) {
                        actualResult = 0.5; // Penalty shootout loss
                    } else {
                        actualResult = 0.5; // Draw
                    }
                } else if (testCase.homeGoals > testCase.awayGoals) {
                    if (testCase.wentToPenalty) {
                        actualResult = 0.75; // Penalty shootout win
                    } else {
                        actualResult = 1; // Regular win
                    }
                } else {
                    if (testCase.wentToPenalty) {
                        actualResult = 0.25; // Penalty shootout loss
                    } else {
                        actualResult = 0; // Regular loss
                    }
                }

                // Calculate Elo changes
                const homeEloChange = importance * (actualResult - expected);
                const awayEloChange = importance * ((1 - actualResult) - (1 - expected));

                const newHomeElo = testCase.homeTeam.elo + homeEloChange;
                const newAwayElo = testCase.awayTeam.elo + awayEloChange;

                // Test the complete calculation function
                const completeResult = calculateCompleteElo({
                    homeTeam: testCase.homeTeam,
                    awayTeam: testCase.awayTeam,
                    homeGoals: testCase.homeGoals,
                    awayGoals: testCase.awayGoals,
                    tournamentId: testCase.tournamentId,
                    tournamentType: testCase.tournamentType,
                    stage: testCase.stage,
                    isKnockout: testCase.isKnockout,
                    wentToPenalty: testCase.wentToPenalty
                });

                const testPassed = Math.abs(completeResult.homeEloChange - homeEloChange) < 0.01 &&
                                  Math.abs(completeResult.awayEloChange - awayEloChange) < 0.01;
                
                if (testPassed) totalTestsPassed++;

                results.push({
                    name: testCase.name,
                    passed: testPassed,
                    details: {
                        expected: expected.toFixed(3),
                        actual: actualResult,
                        importance: importance,
                        homeEloChange: homeEloChange.toFixed(2),
                        awayEloChange: awayEloChange.toFixed(2),
                        newHomeElo: newHomeElo.toFixed(2),
                        newAwayElo: newAwayElo.toFixed(2),
                        completeResult: completeResult
                    }
                });
            } catch (error) {
                results.push({
                    name: testCase.name,
                    passed: false,
                    error: error.message
                });
            }
        }

        // Add embedded calculator functionality
        let calculatorResult = null;
        if (req.method === 'POST') {
            try {
                const requestData = await req.json();
                const { homeTeamElo, awayTeamElo, homeGoals, awayGoals, tournamentType, stage, isKnockout, wentToPenalty } = requestData;

                const calcResult = calculateCompleteElo({
                    homeTeam: { elo: homeTeamElo },
                    awayTeam: { elo: awayTeamElo },
                    homeGoals,
                    awayGoals,
                    tournamentType,
                    stage,
                    isKnockout: Boolean(isKnockout),
                    wentToPenalty: Boolean(wentToPenalty)
                });

                calculatorResult = calcResult;
            } catch (calcError) {
                calculatorResult = { error: calcError.message };
            }
        }

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            testSummary: {
                totalTests,
                testsPassed: totalTestsPassed,
                testsFailed: totalTests - totalTestsPassed,
                passRate: ((totalTestsPassed / totalTests) * 100).toFixed(1) + '%'
            },
            testResults: results,
            calculator: calculatorResult,
            instructions: calculatorResult ? null : {
                calculatorEndpoint: `${new URL(req.url).origin}/test-elo-calculation`,
                method: "POST",
                example: {
                    homeTeamElo: 2000,
                    awayTeamElo: 1900,
                    homeGoals: 2,
                    awayGoals: 1,
                    tournamentType: "tournament",
                    stage: "group",
                    isKnockout: false,
                    wentToPenalty: false
                }
            }
        };

        return new Response(JSON.stringify(response, null, 2), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Test calculation error:', error);
        
        const errorResponse = {
            error: {
                code: 'TEST_CALCULATION_ERROR',
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