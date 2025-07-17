-- Create a new table named 'provinces'
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_province SERIAL UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);
