CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('men', 'women')),
    continent VARCHAR(50),
    current_rank INTEGER NOT NULL,
    current_points DECIMAL(10, 2) NOT NULL DEFAULT 1000,
    previous_rank INTEGER,
    change_indicator VARCHAR(10),
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);