-- Migration 036 Pre-Check: Check existing tables
-- Run this FIRST to see what tables exist

-- Check if users table exists
SELECT 
  'users table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END as status;

-- Check if profiles table exists
SELECT 
  'profiles table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
    THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END as status;

-- Check if addresses table exists
SELECT 
  'addresses table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'addresses')
    THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END as status;

-- If users table exists, show its columns
SELECT 
  'Existing users columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- If profiles table exists, show its columns
SELECT 
  'Existing profiles columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- If addresses table exists, show its columns
SELECT 
  'Existing addresses columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'addresses'
ORDER BY ordinal_position;
