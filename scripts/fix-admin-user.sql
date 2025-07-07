-- Fix admin user profile
-- Run this script to ensure the admin user is properly set up

-- 1. First, let's see what we have
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  u.created_at as auth_created,
  p.id as profile_id,
  p.email as profile_email,
  p.role as profile_role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'cheerleadingindonesiaweb@gmail.com';

-- 2. Delete any existing profile with wrong ID
DELETE FROM profiles WHERE email = 'cheerleadingindonesiaweb@gmail.com';

-- 3. Insert correct profile with matching ID from auth.users
INSERT INTO profiles (id, email, display_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  'admin',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'cheerleadingindonesiaweb@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = 'admin',
  updated_at = NOW();

-- 4. Verify the fix
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role as profile_role,
  CASE 
    WHEN u.id = p.id THEN '✅ IDs Match'
    ELSE '❌ IDs Mismatch'
  END as id_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'cheerleadingindonesiaweb@gmail.com';
