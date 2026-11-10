-- Migration 036: Create User and Address Tables
-- This migration:
-- 1. Drops and recreates users table extending auth.users
-- 2. Drops and recreates addresses table with simplified structure
-- 3. Migrates data from profiles (if exists)
-- 4. Sets up RLS policies
-- 5. Updates foreign key references

-- IMPORTANT: This will DROP existing users and addresses tables if they exist!
-- Back up your data first if needed!

-- Step 1: Drop existing tables (to avoid conflicts)
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table extending auth.users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'wholesaler')),
  mobile_number TEXT,
  avatar TEXT,
  active_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_mobile_number ON users(mobile_number);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Step 3: Create addresses table
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for addresses
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_active ON addresses(is_active);

-- Step 4: Migrate data from profiles to users (if profiles table exists)
DO $$
DECLARE
  profile_count INTEGER;
  sql_query TEXT;
  select_clause TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Build SELECT clause dynamically based on existing columns
    select_clause := 'p.id, ';
    
    -- Check and add full_name/name column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
      select_clause := select_clause || 'p.full_name, ';
    ELSE
      select_clause := select_clause || 'NULL, ';
    END IF;
    
    -- Check and add email column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
      select_clause := select_clause || 'COALESCE(p.email, au.email), ';
    ELSE
      select_clause := select_clause || 'au.email, ';
    END IF;
    
    -- Check and add role column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
      select_clause := select_clause || 'COALESCE(p.role, ''customer''), ';
    ELSE
      select_clause := select_clause || '''customer'', ';
    END IF;
    
    -- Check and add avatar_url column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
      select_clause := select_clause || 'p.avatar_url, ';
    ELSE
      select_clause := select_clause || 'NULL, ';
    END IF;
    
    -- Check and add created_at column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
      select_clause := select_clause || 'COALESCE(p.created_at, NOW()), ';
    ELSE
      select_clause := select_clause || 'NOW(), ';
    END IF;
    
    -- Check and add updated_at column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
      select_clause := select_clause || 'COALESCE(p.updated_at, NOW())';
    ELSE
      select_clause := select_clause || 'NOW()';
    END IF;
    
    -- Build and execute the full INSERT query
    sql_query := 'INSERT INTO users (id, name, email, role, avatar, created_at, updated_at) ' ||
                 'SELECT ' || select_clause || ' ' ||
                 'FROM profiles p ' ||
                 'LEFT JOIN auth.users au ON au.id = p.id ' ||
                 'ON CONFLICT (id) DO NOTHING';
    
    EXECUTE sql_query;
    
    GET DIAGNOSTICS profile_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % rows from profiles to users', profile_count;
  ELSE
    RAISE NOTICE 'No profiles table found - starting with empty users table';
  END IF;
END $$;

-- Step 5: Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile (for new signups)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      role IS NULL 
      OR NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
      OR role = (SELECT role FROM users WHERE id = auth.uid())
    )
  );

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update all users (including roles)
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Step 6: Enable RLS for addresses table
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all addresses
CREATE POLICY "Admins can manage all addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Step 7: Update foreign key references in payment_failures table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payment_failures'
  ) THEN
    -- Drop old constraints if they exist
    ALTER TABLE payment_failures DROP CONSTRAINT IF EXISTS payment_failures_user_id_fkey;
    ALTER TABLE payment_failures DROP CONSTRAINT IF EXISTS payment_failures_reviewed_by_fkey;
    
    -- Add new constraints pointing to users table
    ALTER TABLE payment_failures ADD CONSTRAINT payment_failures_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    
    ALTER TABLE payment_failures ADD CONSTRAINT payment_failures_reviewed_by_fkey 
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Updated payment_failures foreign keys to reference users table';
  END IF;
END $$;

-- Step 8: Update payment_failures RLS policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payment_failures'
  ) THEN
    DROP POLICY IF EXISTS "Admins can view all payment failures" ON payment_failures;
    DROP POLICY IF EXISTS "Admins can update payment failures" ON payment_failures;

    CREATE POLICY "Admins can view all payment failures"
      ON payment_failures FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role = 'admin'
        )
      );

    CREATE POLICY "Admins can update payment failures"
      ON payment_failures FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role = 'admin'
        )
      );
    
    RAISE NOTICE 'Updated payment_failures RLS policies';
  END IF;
END $$;

-- Step 9: Drop profiles table (ONLY after verifying everything works)
-- IMPORTANT: Uncomment the line below ONLY after:
-- 1. Verifying users table has all data
-- 2. Testing all API endpoints work correctly
-- 3. Confirming no other tables reference profiles
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Verification: Show what was created
DO $$
DECLARE
  user_count INTEGER;
  address_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO address_count FROM addresses;
  RAISE NOTICE 'Migration complete: users table has % rows, addresses table has % rows', user_count, address_count;
END $$;
