-- For Google OAuth users, the email might be in a different format
-- Let's check all users first to find your exact email

-- Step 1: Find your user (check all OAuth users)
SELECT 
  id, 
  email, 
  raw_app_meta_data,
  raw_app_meta_data->>'provider' as provider,
  raw_app_meta_data->>'role' as current_role
FROM auth.users
WHERE email ILIKE '%sailendra%' 
   OR email ILIKE '%kondapalli%'
ORDER BY created_at DESC;

-- Step 2: If you found your user above, copy the EXACT email and use it here:
-- Replace 'YOUR_EXACT_EMAIL_HERE' with the email from Step 1
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'sailendrakondapalli@gmail.com';  -- Use EXACT email from Step 1

-- Step 3: Verify the update worked
SELECT 
  id, 
  email, 
  raw_app_meta_data,
  raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'sailendrakondapalli@gmail.com';

-- If Step 3 shows role = 'admin', you're good!
-- Now log out and log back in to get new JWT token
