-- Diagnostic Script for E-Way Bill pg_net Issues
-- Run this in Supabase SQL Editor to diagnose problems

-- 1. Check if pg_net extension is installed and enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';
-- Expected: Should return 1 row with pg_net details
-- If empty: pg_net is not installed

-- 2. Check permissions on net schema
SELECT 
  n.nspname as schema,
  r.rolname as role,
  has_schema_privilege(r.rolname, n.nspname, 'USAGE') as has_usage
FROM pg_namespace n
CROSS JOIN pg_roles r
WHERE n.nspname = 'net'
  AND r.rolname IN ('authenticated', 'anon', 'postgres');
-- Expected: authenticated should have USAGE = true

-- 3. Check if _http_response table exists and is accessible
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'net' 
  AND table_name = '_http_response'
) as http_response_table_exists;
-- Expected: true

-- 4. Check recent E-Way Bill requests
SELECT 
  id,
  action,
  status,
  created_at,
  updated_at,
  AGE(NOW(), created_at) as request_age,
  CASE 
    WHEN status = 'pending' AND AGE(NOW(), created_at) > INTERVAL '30 seconds' 
    THEN 'STUCK'
    ELSE 'OK'
  END as health_status
FROM eway_bill_requests
ORDER BY created_at DESC
LIMIT 10;
-- Look for STUCK requests - these indicate pg_net isn't processing

-- 5. Try to access pg_net response table directly
SELECT COUNT(*) as total_http_responses
FROM net._http_response;
-- If this fails with permission error, pg_net isn't properly configured

-- 6. Check pg_net worker status (may require superuser)
-- SELECT * FROM pg_stat_activity WHERE query LIKE '%pg_net%';

-- 7. Test a simple HTTP request
SELECT net.http_get(
  url := 'https://httpbin.org/get',
  headers := '{"Content-Type": "application/json"}'::jsonb
) as test_request_id;
-- This returns a request ID
-- Wait 2-3 seconds, then check:
-- SELECT * FROM net._http_response WHERE id = <request_id_from_above>;
-- If no response appears, pg_net is not working

-- FIXES if pg_net is not working:

-- Fix 1: Enable pg_net extension (if not installed)
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fix 2: Grant proper permissions
-- GRANT USAGE ON SCHEMA net TO authenticated;
-- GRANT SELECT ON net._http_response TO authenticated;

-- Fix 3: Clean up stuck requests
-- UPDATE eway_bill_requests 
-- SET status = 'failed', 
--     error = 'Request timeout - pg_net not responding',
--     updated_at = NOW()
-- WHERE status = 'pending' 
--   AND AGE(NOW(), created_at) > INTERVAL '30 seconds';
