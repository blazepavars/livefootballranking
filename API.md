# API Documentation

## Overview

FIFA LiveFootballRanking uses a combination of Supabase Edge Functions and client-side React to provide real-time FIFA ranking data and historical analysis.

## 🗄️ Database Schema

### Tables

#### `teams`
International football teams from all FIFA-affiliated countries.

```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    fifa_code VARCHAR(3) UNIQUE NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    confederation VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `fifa_rankings`
Current FIFA world rankings updated daily.

```sql
CREATE TABLE fifa_rankings (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    current_rank INTEGER NOT NULL,
    total_points DECIMAL(8,2) NOT NULL,
    previous_rank INTEGER,
    rank_change INTEGER,
    last_updated TIMESTAMP DEFAULT NOW()
);
```

#### `historical_fifa_rankings`
32 years of historical FIFA rankings (1992-2023).

```sql
CREATE TABLE historical_fifa_rankings (
    id SERIAL PRIMARY KEY,
    rank_date DATE NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    rank INTEGER NOT NULL,
    total_points DECIMAL(8,2) NOT NULL,
    confederation_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `tournaments`
Tournament configuration and importance levels.

```sql
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    confederation VARCHAR(10),
    importance_level INTEGER DEFAULT 1,
    api_league_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `matches`
Live and upcoming international fixtures.

```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    match_date TIMESTAMP,
    home_team VARCHAR(255),
    away_team VARCHAR(255),
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50),
    tournament_id INTEGER REFERENCES tournaments(id),
    api_fixture_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Edge Functions

### `fetch-live-international-matches`

Fetches live international match data from API-Football.

**Endpoint**: `POST /functions/v1/fetch-live-international-matches`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "fixture": {
        "id": 12345,
        "date": "2024-11-04T15:00:00+00:00",
        "status": {
          "short": "1H",
          "elapsed": 25
        }
      },
      "teams": {
        "home": {
          "name": "Brazil",
          "logo": "https://example.com/brazil.png"
        },
        "away": {
          "name": "Argentina", 
          "logo": "https://example.com/argentina.png"
        }
      },
      "goals": {
        "home": 1,
        "away": 0
      }
    }
  ]
}
```

### `update-upcoming-matches`

Updates upcoming international fixtures.

**Endpoint**: `POST /functions/v1/update-upcoming-matches`

**Response**:
```json
{
  "success": true,
  "upcoming_matches": [
    {
      "fixture": {
        "id": 12346,
        "date": "2024-11-05T20:00:00+00:00"
      },
      "teams": {
        "home": {
          "name": "Germany"
        },
        "away": {
          "name": "France"
        }
      }
    }
  ]
}
```

### `save-ranking-snapshot`

Saves current FIFA ranking snapshot.

**Endpoint**: `POST /functions/v1/save-ranking-snapshot`

**Response**:
```json
{
  "success": true,
  "snapshot_saved": true,
  "total_teams": 211,
  "timestamp": "2024-11-04T06:00:00Z"
}
```

## 🔧 Supabase RPC Functions

### `get_distinct_historical_dates`

Retrieves all available historical FIFA ranking dates.

**Usage**:
```sql
SELECT get_distinct_historical_dates();
```

**Response**:
```json
[
  {"rank_date": "1992-12-31"},
  {"rank_date": "1993-03-31"},
  {"rank_date": "1993-08-31"},
  ...
  {"rank_date": "2023-12-31"}
]
```

Returns 327 distinct dates spanning 32 years (1992-2023).

### `calculate_fifa_points`

Calculates FIFA points using official FIFA SUM formula.

**Usage**:
```sql
SELECT calculate_fifa_points(
  current_points,
  match_importance,
  actual_result,
  expected_result
);
```

**Parameters**:
- `current_points`: Current FIFA points
- `match_importance`: Tournament importance (1-4)
- `actual_result`: Match result (1=Win, 0.5=Draw, 0=Loss)
- `expected_result`: Expected result based on ranking difference

## 🔍 Client-Side APIs

### React Hooks

#### `useFifaRankings`
```typescript
interface UseFifaRankingsReturn {
  rankings: FifaRanking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const { rankings, loading, error, refetch } = useFifaRankings();
```

#### `useHistoricalRankings`
```typescript
interface HistoricalData {
  historicalRank: number;
  team: string;
  currentRank: number;
  rankChange: number;
}

const historicalData = useHistoricalRankings(selectedDate);
```

#### `useLiveMatches`
```typescript
interface LiveMatch {
  fixture: {
    id: number;
    date: string;
    status: string;
  };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: {
    home: number;
    away: number;
  };
}

const liveMatches = useLiveMatches();
```

### Components

#### `HistoricalRankingsModal`
```typescript
interface HistoricalRankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

<HistoricalRankingsModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
/>
```

#### `LiveMatchesTable`
```typescript
interface LiveMatchesTableProps {
  matches: LiveMatch[];
  loading: boolean;
}

<LiveMatchesTable
  matches={liveMatches}
  loading={matchesLoading}
/>
```

## 🔐 Authentication & Security

### Row Level Security (RLS)
All tables have RLS policies enabled:

```sql
-- Example RLS policy for fifa_rankings
CREATE POLICY "Public rankings are viewable by everyone" 
ON fifa_rankings 
FOR SELECT 
USING (true);

CREATE POLICY "Only service role can insert rankings" 
ON fifa_rankings 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');
```

### API Key Management
- Client-side: Only anon key (public)
- Server-side: Service role key (private)
- Never expose service keys in client code

## 📊 Data Flow

### Daily Update Process (6:00 AM UTC)
1. **Cron Job Trigger** → `fetch-live-international-matches`
2. **API Call** → Fetch live data from API-Football
3. **Data Processing** → Parse and validate match data
4. **Database Update** → Store in `matches` table
5. **Ranking Update** → Calculate FIFA point changes
6. **Snapshot Save** → Save current rankings

### Historical Data Query
1. **User Action** → Open historical modal
2. **Date Selection** → Choose from 327 available dates
3. **Database Query** → Fetch historical rankings for date
4. **Comparison** → Calculate rank changes vs current
5. **UI Update** → Display 4-column comparison table

## 🔄 Error Handling

### Client-Side
```typescript
try {
  const data = await supabase
    .from('fifa_rankings')
    .select('*');
    
  if (data.error) throw data.error;
  
  setRankings(data.data);
} catch (error) {
  setError(error.message);
  console.error('Failed to fetch rankings:', error);
}
```

### Edge Functions
```typescript
try {
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${Deno.env.get('API_FOOTBALL_KEY')}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return new Response(JSON.stringify({ success: true }));
} catch (error) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: error.message 
    }), 
    { status: 500 }
  );
}
```

## 📈 Rate Limits

### API-Football
- Free Tier: 100 requests/day
- Basic Plan: 500 requests/day
- Pro Plan: 1000 requests/day

### Supabase
- Free Tier: 2 requests/second
- Pro Tier: 1000 requests/second

### Optimization Strategy
- **Daily Updates**: Reduce API calls from 1,440/day to 2/day (99.86% reduction)
- **Caching**: Store results in Supabase for 24 hours
- **Smart Updates**: Only fetch when data is stale

## 🧪 Testing APIs

### Local Testing
```bash
# Test Supabase connection
supabase db ping

# Test edge functions locally
supabase functions serve

# Run function locally
curl -X POST 'http://localhost:54321/functions/v1/fetch-live-international-matches'
```

### Production Testing
```bash
# Test live endpoint
curl -X POST 'https://your-project.supabase.co/functions/v1/fetch-live-international-matches'

# Verify database connection
curl 'https://your-project.supabase.co/rest/v1/fifa_rankings?select=*&limit=5'
```

## 📚 Additional Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **API-Football Docs**: [api-football.com/documentation](https://api-football.com/documentation)
- **React Query**: [tanstack.com/query](https://tanstack.com/query)
- **FIFA Ranking System**: [fifa.com/technical-reports](https://fifa.com/technical-reports)

---

*For implementation examples, see the source code in `/src` directory*