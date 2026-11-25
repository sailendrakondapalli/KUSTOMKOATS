-- Check RLS policies on categories table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'categories';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'categories';
