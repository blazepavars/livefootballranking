CREATE TABLE fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    opponent_team_id UUID,
    opponent_name VARCHAR(255) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    competition VARCHAR(255) NOT NULL,
    importance_level INTEGER NOT NULL,
    venue VARCHAR(255),
    is_home_match BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW()
);