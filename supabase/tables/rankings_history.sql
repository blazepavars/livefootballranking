CREATE TABLE rankings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    rank_position INTEGER NOT NULL,
    points DECIMAL(10, 2) NOT NULL,
    change_from_previous INTEGER,
    official_update_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);