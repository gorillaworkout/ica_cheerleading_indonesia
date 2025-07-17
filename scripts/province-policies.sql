-- Enable Row Level Security (RLS) for the provinces table
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow SELECT on the provinces table
CREATE POLICY select_provinces ON provinces
    FOR SELECT
    USING (true);

-- Create a policy to allow INSERT on the provinces table
CREATE POLICY insert_provinces ON provinces
    FOR INSERT
    WITH CHECK (true);

-- Create a policy to allow UPDATE on the provinces table
CREATE POLICY update_provinces ON provinces
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create a policy to allow DELETE on the provinces table
CREATE POLICY delete_provinces ON provinces
    FOR DELETE
    USING (true);
