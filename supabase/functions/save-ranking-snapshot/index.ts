// Save Ranking Snapshot Edge Function
// Creates a historical snapshot of current FIFA rankings

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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
    // Get snapshot date from request or use current date
    const { snapshot_date } = await req.json().catch(() => ({ snapshot_date: null }));
    const snapshotDate = snapshot_date || new Date().toISOString().split('T')[0];
    
    console.log(`Creating ranking snapshot for date: ${snapshotDate}`);

    // Fetch current rankings
    const teamsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/teams?select=id,team_name,current_rank,previous_rank,current_points,continent&gender=eq.men&order=current_rank.asc`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );
    
    const teams = await teamsResponse.json();
    console.log(`Found ${teams.length} teams to snapshot`);

    // Create snapshot records
    const snapshotRecords = teams.map((team: any) => ({
      snapshot_date: snapshotDate,
      team_id: team.id,
      team_name: team.team_name,
      rank: team.current_rank,
      points: team.current_points,
      previous_rank: team.previous_rank,
      rank_change: team.previous_rank ? team.previous_rank - team.current_rank : 0,
      continent: team.continent
    }));

    // Delete existing snapshot for this date (if any)
    await fetch(`${SUPABASE_URL}/rest/v1/ranking_history?snapshot_date=eq.${snapshotDate}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });

    // Insert new snapshot
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/ranking_history`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(snapshotRecords)
    });

    if (!insertResponse.ok) {
      throw new Error(`Failed to insert snapshot: ${await insertResponse.text()}`);
    }

    console.log(`Successfully saved ranking snapshot for ${snapshotDate}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Saved ranking snapshot for ${snapshotDate}`,
        snapshotDate,
        teamsCount: snapshotRecords.length
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