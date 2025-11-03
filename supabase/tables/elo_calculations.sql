CREATE TABLE elo_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL,
    team_id UUID NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    points_before DECIMAL(10, 2) NOT NULL,
    points_after DECIMAL(10, 2) NOT NULL,
    expected_result DECIMAL(5, 4) NOT NULL,
    actual_result DECIMAL(3, 2) NOT NULL,
    importance_multiplier INTEGER NOT NULL,
    points_change DECIMAL(10, 2) NOT NULL,
    is_knockout_protected BOOLEAN DEFAULT false,
    calculation_timestamp TIMESTAMP DEFAULT NOW()
);