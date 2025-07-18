-- SQL script to create the `results` table in Supabase

CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    competition_id UUID NOT NULL,
    division TEXT NOT NULL,
    placement INT NOT NULL,
    team TEXT NOT NULL,
    score FLOAT NOT NULL,
    province TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_competition_id ON results (competition_id);
CREATE INDEX idx_division ON results (division);
CREATE INDEX idx_placement ON results (placement);
