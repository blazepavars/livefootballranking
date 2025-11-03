CREATE TABLE api_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL UNIQUE,
    api_key_encrypted TEXT,
    last_request_timestamp TIMESTAMP,
    requests_today INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 7500,
    is_active BOOLEAN DEFAULT true,
    config_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);