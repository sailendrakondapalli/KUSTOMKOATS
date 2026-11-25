-- Run this in Supabase SQL Editor to check if category_showcase table exists

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'category_showcase'
);

-- If table exists, check its structure
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'category_showcase'
ORDER BY ordinal_position;

-- Check if there are any rows
SELECT * FROM category_showcase;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'category_showcase';
