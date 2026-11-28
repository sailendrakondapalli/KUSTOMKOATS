# Migration 036: User and Address Table Restructuring

## Overview
This migration restructures the user management system by:
1. Creating a new simplified `addresses` table
2. Creating a new `users` table that extends `auth.users`
3. Migrating data from `profiles` to `users`
4. Updating all foreign key references
5. Preparing to deprecate the `profiles` table

## Changes Made

### New Tables

#### `users` Table
Extends `auth.users` with the following fields:
- `id` (UUID, primary key, references auth.users)
- `name` (TEXT)
- `email` (TEXT, unique)
- `role` (TEXT, default: 'customer', check: 'customer'|'admin'|'wholesaler')
- `mobile_number` (TEXT)
- `avatar` (TEXT) - moved from profiles.avatar_url
- `active_from` (TIMESTAMP WITH TIME ZONE)
- `is_active` (BOOLEAN, default: true)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### `addresses` Table
Simplified structure with:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users, not null)
- `address` (TEXT, not null)
- `is_active` (BOOLEAN, default: true)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### Data Migration
- All data from `profiles` table is migrated to `users` table
- Field mappings:
  - `profiles.full_name` → `users.name`
  - `profiles.avatar_url` → `users.avatar`
  - `profiles.role` → `users.role`
  - `profiles.email` → `users.email`

### Foreign Key Updates
- `payment_failures.user_id` now references `users(id)` instead of `profiles(id)`
- `payment_failures.reviewed_by` now references `users(id)` instead of `profiles(id)`

### RLS Policies Updated
All Row Level Security policies that referenced `profiles` table now reference `users` table:
- Address policies (view, insert, update, delete own addresses)
- User profile policies (view/update own profile)
- Admin policies (view/update all users and addresses)
- Payment failures policies (admin view/update)

## Backend API Changes

### Updated Routes: `/api/profile`

#### GET `/api/profile`
- Now queries `users` table instead of `profiles`
- Returns: `{ id, name, email, role, mobile_number, avatar, active_from, is_active, created_at, updated_at }`

#### PUT `/api/profile`
- Now updates `users` table instead of `profiles`
- Accepts: `{ name, mobile_number, avatar }`
- Changed from: `{ full_name, phone, avatar_url }`

#### GET `/api/profile/addresses`
- Returns simplified address structure: `{ id, user_id, address, is_active, created_at, updated_at }`
- Previously returned: `{ line1, line2, city, state, postal_code, country, phone, is_default }`

#### POST `/api/profile/addresses`
- Accepts: `{ address, is_active }`
- Previously accepted: `{ line1, line2, city, state, postal_code, country, phone, is_default }`

#### PUT `/api/profile/addresses/:id`
- Accepts: `{ address, is_active }`
- Previously accepted: `{ line1, line2, city, state, postal_code, country, phone, is_default }`

## Running the Migration

### Step 1: Run the Migration
```sql
-- In Supabase SQL Editor
\i migration036.sql
```

### Step 2: Verify the Migration
```sql
-- Check users table
SELECT COUNT(*) FROM users;
SELECT * FROM users LIMIT 5;

-- Check addresses table
SELECT COUNT(*) FROM addresses;
SELECT * FROM addresses LIMIT 5;

-- Verify data migration
SELECT 
  u.id, 
  u.name, 
  u.email, 
  u.role,
  COUNT(a.id) as address_count
FROM users u
LEFT JOIN addresses a ON a.user_id = u.id
GROUP BY u.id, u.name, u.email, u.role;
```

### Step 3: Test Backend APIs
```bash
# Test profile endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/profile

# Test addresses endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/profile/addresses
```

### Step 4: Drop Profiles Table (After Verification)
⚠️ **IMPORTANT**: Only run this after thorough testing!

Uncomment this line in migration036.sql:
```sql
DROP TABLE IF EXISTS profiles CASCADE;
```

## Breaking Changes

### Frontend Updates Required

1. **User Profile Field Names**
   ```javascript
   // OLD
   user.full_name
   user.avatar_url
   
   // NEW
   user.name
   user.avatar
   ```

2. **Address Structure**
   ```javascript
   // OLD
   address = {
     line1: "123 Main St",
     line2: "Apt 4B",
     city: "Mumbai",
     state: "Maharashtra",
     postal_code: "400001",
     country: "India",
     phone: "+91...",
     is_default: true
   }
   
   // NEW
   address = {
     address: "123 Main St, Apt 4B, Mumbai, Maharashtra 400001, India",
     is_active: true
   }
   ```

3. **API Request Updates**
   ```javascript
   // Update profile - OLD
   PUT /api/profile
   { full_name: "John", phone: "+91...", avatar_url: "url" }
   
   // Update profile - NEW
   PUT /api/profile
   { name: "John", mobile_number: "+91...", avatar: "url" }
   
   // Add address - OLD
   POST /api/profile/addresses
   { line1: "123 Main", city: "Mumbai", state: "MH", postal_code: "400001", country: "India" }
   
   // Add address - NEW
   POST /api/profile/addresses
   { address: "123 Main, Mumbai, MH 400001, India", is_active: true }
   ```

## Rollback Plan

If you need to rollback:

```sql
-- 1. Recreate profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Migrate data back
INSERT INTO profiles (id, full_name, email, role, avatar_url, created_at, updated_at)
SELECT id, name, email, role, avatar, created_at, updated_at
FROM users;

-- 3. Update foreign keys
ALTER TABLE payment_failures DROP CONSTRAINT payment_failures_user_id_fkey;
ALTER TABLE payment_failures ADD CONSTRAINT payment_failures_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Drop new tables
DROP TABLE addresses CASCADE;
DROP TABLE users CASCADE;

-- 5. Restore RLS policies (see migration034.sql and earlier)
```

## Testing Checklist

- [ ] Run migration036.sql successfully
- [ ] Verify users table has all data from profiles
- [ ] Verify addresses table exists and is empty (or populated if you had address data)
- [ ] Test GET /api/profile returns correct user data
- [ ] Test PUT /api/profile updates user correctly
- [ ] Test GET /api/profile/addresses returns addresses
- [ ] Test POST /api/profile/addresses creates new address
- [ ] Test PUT /api/profile/addresses/:id updates address
- [ ] Test DELETE /api/profile/addresses/:id deletes address
- [ ] Verify RLS policies work (users can only see own data)
- [ ] Verify admin users can see all data
- [ ] Update frontend to use new field names
- [ ] Update frontend to use new address structure
- [ ] Test complete user flow (signup, profile update, address management)
- [ ] Only after all tests pass: Drop profiles table

## Support

If you encounter issues:
1. Check Supabase logs for error details
2. Verify RLS policies are working correctly
3. Ensure auth.users table exists (created by Supabase Auth)
4. Check foreign key constraints are satisfied
5. Review the rollback plan above if needed
