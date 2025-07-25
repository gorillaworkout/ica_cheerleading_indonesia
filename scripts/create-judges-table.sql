-- Create judges table
CREATE TABLE public.judges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Certified Judge',
    specialization VARCHAR(255) NOT NULL,
    experience VARCHAR(100) NOT NULL,
    bio TEXT,
    location VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    image_url TEXT,
    philosophy TEXT,
    certifications TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    specialties TEXT[] DEFAULT '{}',
    competitions_judged INTEGER DEFAULT 0,
    years_experience INTEGER DEFAULT 0,
    certification_level VARCHAR(50) DEFAULT 'Level 1',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;

-- Create policies for judges table
-- Allow public read access for active judges
CREATE POLICY "Allow public read access for active judges"
ON public.judges
FOR SELECT
USING (is_active = true);

-- Allow authenticated users to read all judges
CREATE POLICY "Allow authenticated users to read all judges"
ON public.judges
FOR SELECT
TO authenticated
USING (true);

-- Allow admin users to insert judges
CREATE POLICY "Allow admin users to insert judges"
ON public.judges
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Allow admin users to update judges
CREATE POLICY "Allow admin users to update judges"
ON public.judges
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Allow admin users to delete judges
CREATE POLICY "Allow admin users to delete judges"
ON public.judges
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_judges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER judges_updated_at
    BEFORE UPDATE ON public.judges
    FOR EACH ROW
    EXECUTE FUNCTION update_judges_updated_at();

-- Insert sample data for judges
INSERT INTO public.judges (
    name, 
    title,
    specialization, 
    experience, 
    bio, 
    location, 
    email, 
    phone, 
    philosophy,
    certifications,
    achievements,
    specialties,
    competitions_judged,
    years_experience,
    certification_level,
    is_active,
    is_featured,
    sort_order
) VALUES 
(
    'Sarah Johnson',
    'Head Judge',
    'All-Star Cheerleading',
    '10+ years',
    'Experienced judge with a passion for fair and accurate scoring. Specialized in All-Star cheerleading competitions and safety protocols.',
    'Jakarta',
    'sarah.johnson@ica-indonesia.org',
    '+62-812-3456-7890',
    'Fair judging and athlete safety are my top priorities. Every team deserves accurate scoring and constructive feedback.',
    ARRAY['Level 4 Certified Judge', 'Safety Officer', 'International Judge'],
    ARRAY['Judge of the Year 2023', 'Perfect Score Record', '100+ Competitions Judged'],
    ARRAY['All-Star', 'Stunts', 'Tumbling', 'Safety'],
    95,
    10,
    'Level 4',
    true,
    true,
    1
),
(
    'Michael Chen',
    'Senior Judge',
    'School Cheerleading',
    '8+ years',
    'Dedicated to promoting school spirit and athletic excellence. Focuses on technical precision and team performance.',
    'Surabaya',
    'michael.chen@ica-indonesia.org',
    '+62-813-4567-8901',
    'School cheerleading builds character and teamwork. I judge with fairness while encouraging young athletes to reach their potential.',
    ARRAY['Level 3 Certified Judge', 'School Programs Specialist'],
    ARRAY['Regional Judge Champion', 'School Spirit Award'],
    ARRAY['School Cheer', 'Dance', 'Chant'],
    67,
    8,
    'Level 3',
    true,
    true,
    2
),
(
    'Diana Rahayu',
    'International Judge',
    'Dance & Performance',
    '12+ years',
    'International certified judge specializing in dance and performance elements. Brings global perspective to local competitions.',
    'Bandung',
    'diana.rahayu@ica-indonesia.org',
    '+62-814-5678-9012',
    'Dance is the soul of cheerleading. I focus on artistry, synchronization, and the emotional connection between team and audience.',
    ARRAY['International Judge Certification', 'Dance Specialist', 'Performance Arts'],
    ARRAY['World Championship Judge', 'Choreography Excellence Award'],
    ARRAY['Dance', 'Performance', 'Choreography', 'International'],
    120,
    12,
    'International',
    true,
    true,
    3
),
(
    'Robert Kim',
    'Technical Judge',
    'Stunts & Tumbling',
    '6+ years',
    'Technical specialist focusing on stunts and tumbling safety and execution. Ensures athletes perform at their best while staying safe.',
    'Medan',
    'robert.kim@ica-indonesia.org',
    '+62-815-6789-0123',
    'Technical excellence and safety go hand in hand. I help teams push boundaries while maintaining the highest safety standards.',
    ARRAY['Level 3 Judge', 'Stunts Specialist', 'Tumbling Expert'],
    ARRAY['Technical Excellence Award', 'Safety Innovation Recognition'],
    ARRAY['Stunts', 'Tumbling', 'Technical', 'Safety'],
    45,
    6,
    'Level 3',
    true,
    false,
    4
),
(
    'Lisa Pratiwi',
    'Regional Judge',
    'Youth Development',
    '5+ years',
    'Passionate about youth development and nurturing young talent in cheerleading. Specializes in junior and youth divisions.',
    'Yogyakarta',
    'lisa.pratiwi@ica-indonesia.org',
    '+62-816-7890-1234',
    'Every young athlete has potential. I judge with encouragement and constructive feedback to help them grow and improve.',
    ARRAY['Level 2 Judge', 'Youth Development Specialist'],
    ARRAY['Youth Coach of the Year', 'Community Impact Award'],
    ARRAY['Youth', 'Junior', 'Development', 'Mentoring'],
    38,
    5,
    'Level 2',
    true,
    false,
    5
);

-- Create indexes for better performance
CREATE INDEX idx_judges_active ON public.judges(is_active);
CREATE INDEX idx_judges_featured ON public.judges(is_featured);
CREATE INDEX idx_judges_sort_order ON public.judges(sort_order);
CREATE INDEX idx_judges_specialization ON public.judges(specialization);
CREATE INDEX idx_judges_location ON public.judges(location);
CREATE INDEX idx_judges_email ON public.judges(email);

-- Grant necessary permissions
GRANT ALL ON public.judges TO authenticated;
GRANT SELECT ON public.judges TO anon; 