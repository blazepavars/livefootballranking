CREATE TABLE match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    opponent_name VARCHAR(255) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    competition VARCHAR(255) NOT NULL,
    result VARCHAR(10) NOT NULL,
    team_score INTEGER NOT NULL,
    opponent_score INTEGER NOT NULL,
    points_change DECIMAL(10, 2) NOT NULL,
    points_before DECIMAL(10, 2) NOT NULL,
    points_after DECIMAL(10, 2) NOT NULL,
    importance_multiplier INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);