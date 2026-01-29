-- Fix missing profiles issue
-- Run this in Supabase SQL Editor

-- Step 1: Create profiles for users that don't have one yet
INSERT INTO public.profiles (id, email, full_name, avatar_url, currency, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'ผู้ใช้'),
  au.raw_user_meta_data->>'avatar_url',
  'THB',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Step 2: Verify the fix
SELECT 
  au.id as user_id,
  au.email,
  p.id as profile_id,
  p.full_name,
  CASE 
    WHEN p.id IS NULL THEN 'Missing Profile ❌'
    ELSE 'Has Profile ✅'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id;

-- Step 3: Show summary
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profile,
  COUNT(*) - COUNT(p.id) as users_without_profile
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id;
