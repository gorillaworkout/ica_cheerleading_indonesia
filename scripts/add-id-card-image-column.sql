-- Add id_card_image column to profiles table
-- This script will add the new column for storing auto-generated ID card images

-- Add id_card_image column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'id_card_image'
    ) THEN 
        ALTER TABLE profiles ADD COLUMN id_card_image TEXT;
        
        -- Add comment to the column
        COMMENT ON COLUMN profiles.id_card_image IS 'Path to auto-generated ID card image in storage';
        
        RAISE NOTICE 'Column id_card_image added to profiles table successfully';
    ELSE 
        RAISE NOTICE 'Column id_card_image already exists in profiles table';
    END IF; 
END $$;

-- Optional: Create index for better performance if needed
-- CREATE INDEX IF NOT EXISTS idx_profiles_id_card_image ON profiles(id_card_image);
