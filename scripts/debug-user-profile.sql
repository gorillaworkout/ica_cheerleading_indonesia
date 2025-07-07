-- Debug script to check user and profile relationship

-- 1. Check auth.users table
SELECT id, email, created_at FROM auth.users WHERE email = 'cheerleadingindonesiaweb@gmail.com';

-- 2. Check profiles table
SELECT id, email, role FROM profiles WHERE email = 'cheerleadingindonesiaweb@gmail.com';

-- 3. Check if IDs match
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'cheerleadingindonesiaweb@gmail.com';

-- 4. If profile doesn't exist or ID mismatch, fix it:
-- First, get the correct user ID from auth.users
-- Then update or insert the profile with correct ID

-- Delete existing profile if ID mismatch
DELETE FROM profiles WHERE email = 'cheerleadingindonesiaweb@gmail.com';

-- Insert new profile with correct ID from auth.users
INSERT INTO profiles (id, email, display_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  'admin'
FROM auth.users 
WHERE email = 'cheerleadingindonesiaweb@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = 'admin',
  updated_at = NOW();
