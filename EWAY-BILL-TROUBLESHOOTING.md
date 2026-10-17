# E-Way Bill Timeout Troubleshooting Guide

## Problem
E-Way Bill authentication and API calls timeout after 30 seconds with the error:
```
Error: Request timed out after 30 seconds
```

## Root Cause
The issue is with Supabase's `pg_net` extension, which handles async HTTP requests from PostgreSQL. Common causes:

1. **pg_net not enabled** - Extension must be enabled in Supabase
2. **pg_net not working** - Known issues on Supabase free tier
3. **Permission issues** - `authenticated` role needs access to `net` schema
4. **Response table not accessible** - Can't read from `net._http_response`

## Quick Diagnosis

### Step 1: Run Diagnostic Script
Execute `diagnose-eway-bill.sql` in Supabase SQL Editor to check:
- pg_net extension status
- Permissions on net schema
- Recent request statuses
- Test HTTP request

### Step 2: Check Error Message
After the fix, the error messages are more helpful:
- **"pg_net is not working"** → pg_net extension issue
- **"pg_net may not be enabled"** → Need to enable extension
- **"Request timeout after 25 seconds"** → pg_net not responding

## Solutions

### Solution 1: Enable pg_net (Preferred)
1. Go to Supabase Dashboard
2. Navigate to **Database > Extensions**
3. Search for `pg_net`
4. Click **Enable** for pg_net extension
5. Run this SQL to grant permissions:
```sql
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT SELECT ON net._http_response TO authenticated;
```
6. Test with the diagnostic script

### Solution 2: Use Supabase Edge Functions (Recommended Alternative)
If pg_net doesn't work on free tier, use Edge Functions instead:

1. Create Edge Function:
```bash
supabase functions new eway-bill-proxy
```

2. Implement in `supabase/functions/eway-bill-proxy/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { action, data } = await req.json()
    
    let apiUrl = ''
    let method = 'POST'
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // Determine endpoint based on action
    switch(action) {
      case 'authenticate':
        apiUrl = 'https://api.ewaybillgst.gov.in/authenticate'
        break
      case 'generate':
        apiUrl = 'https://api.ewaybillgst.gov.in/ewayapi/v1.03/ewayapi'
        headers['authtoken'] = data.authToken
        break
      case 'get':
        apiUrl = `https://api.ewaybillgst.gov.in/ewayapi/v1.03/ewayapi/getewaybill?ewbNo=${data.ewbNo}`
        headers['authtoken'] = data.authToken
        method = 'GET'
        break
      case 'cancel':
        apiUrl = 'https://api.ewaybillgst.gov.in/ewayapi/v1.03/ewayapi/cancewaybill'
        headers['authtoken'] = data.authToken
        break
    }
    
    const response = await fetch(apiUrl, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(data) : undefined
    })
    
    const result = await response.json()
    
    return new Response(
      JSON.stringify(result),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

3. Deploy:
```bash
supabase functions deploy eway-bill-proxy
```

4. Update `ewayBillService.js`:
```javascript
async callProxy(action, data) {
  const { data: result, error } = await supabase.functions.invoke('eway-bill-proxy', {
    body: { action, data }
  })
  
  if (error) throw new Error(error.message)
  return result
}
```

### Solution 3: Direct API Calls (Development Only)
For development/testing, you can make direct calls from the frontend:

```javascript
async callProxy(action, data) {
  // WARNING: This exposes API calls to the browser
  // Only use for development, not production
  
  let apiUrl = ''
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }
  
  switch(action) {
    case 'authenticate':
      apiUrl = 'https://api.ewaybillgst.gov.in/authenticate'
      options.body = JSON.stringify(data)
      break
    // ... other cases
  }
  
  const response = await fetch(apiUrl, options)
  return await response.json()
}
```

⚠️ **Note:** This bypasses the proxy and may expose credentials in browser.

## Clean Up Stuck Requests

If you have many stuck/pending requests in the database:

```sql
UPDATE eway_bill_requests 
SET status = 'failed', 
    error = 'Request timeout - cleaned up',
    updated_at = NOW()
WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '1 minute';
```

## Testing

After applying a fix, test with:

1. Open browser console
2. Try authenticating with E-Way Bill credentials
3. Check for detailed error messages
4. Verify requests complete within 5-10 seconds

## What Changed

### Fixed Files:
1. **eway-bill-proxy-function.sql**
   - Added timeout handling (20 seconds)
   - Better error messages for pg_net issues
   - Exception handling for inaccessible tables

2. **src/services/ewayBillService.js**
   - Reduced timeout from 30s to 25s
   - Better error messages with troubleshooting hints
   - Continue polling even if RPC call fails
   - Progress logging every 5 seconds

These changes make the error more informative but don't fix the underlying pg_net issue. You must enable pg_net or use Edge Functions.
