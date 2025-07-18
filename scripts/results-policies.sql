-- SQL script to define policies for the `results` table in Supabase

-- Enable Row Level Security (RLS)
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserting into the `results` table
CREATE POLICY "Allow insert on results" ON results
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow selecting from the `results` table
CREATE POLICY "Allow select on results" ON results
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy to allow updating the `results` table
CREATE POLICY "Allow update on results" ON results
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow deleting from the `results` table
CREATE POLICY "Allow delete on results" ON results
FOR DELETE
USING (auth.role() = 'authenticated');
