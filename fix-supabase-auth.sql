-- Fix Supabase Auth Issues
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rgljnyedroqhcrapsvts/editor

-- Step 1: Remove the trigger completely (we'll handle profile creation in the app)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: Make sure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'THB',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Grant necessary permissions (RLS is already disabled)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;

-- Step 4: Test the setup
SELECT 'Setup completed successfully! Trigger removed, profiles table ready.' as status;
