# Deploy E-Way Bill Edge Function

The E-Way Bill API cannot be called directly from the browser due to CORS restrictions. We need to deploy a Supabase Edge Function that acts as a proxy.

## Prerequisites

1. Supabase CLI installed
2. Supabase project linked

## Installation Steps

### Step 1: Install Supabase CLI

```bash
# Windows (using npm)
npm install -g supabase

# Or using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
cd c:\Users\saile\Desktop\huhu\KUSTOMKOATS
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in:
- Supabase Dashboard → Settings → General → Reference ID

### Step 4: Deploy the Edge Function

```bash
supabase functions deploy eway-bill-proxy
```

### Step 5: Set Environment Variables (if needed)

The function automatically uses these Supabase environment variables:
- `SUPABASE_URL` - Automatically available
- `SUPABASE_ANON_KEY` - Automatically available

No manual configuration needed!

## Verify Deployment

1. Go to Supabase Dashboard → Edge Functions
2. You should see `eway-bill-proxy` listed
3. Status should show "Active"

## Testing the Function

```bash
# Test authentication
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/eway-bill-proxy \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "authenticate",
    "data": {
      "username": "your_eway_username",
      "password": "your_eway_password"
    }
  }'
```

## Function URL

Once deployed, your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/eway-bill-proxy
```

The app is already configured to use this URL automatically!

## Troubleshooting

### Error: "Supabase CLI not found"
- Reinstall using: `npm install -g supabase`

### Error: "Project not linked"
- Run: `supabase link --project-ref YOUR_PROJECT_REF`

### Error: "Authentication failed"
- Run: `supabase login` again

### Function not working after deployment
- Check logs: `supabase functions logs eway-bill-proxy`
- View in Dashboard: Edge Functions → eway-bill-proxy → Logs

## Local Testing (Optional)

```bash
# Start Edge Functions locally
supabase functions serve eway-bill-proxy

# Test locally
curl -X POST http://localhost:54321/functions/v1/eway-bill-proxy \
  -H "Content-Type: application/json" \
  -d '{"action":"authenticate","data":{"username":"test","password":"test"}}'
```

## Production Notes

- ✅ Edge Function handles CORS automatically
- ✅ User authentication is verified
- ✅ API credentials are never exposed to frontend
- ✅ Token management handled server-side
- ✅ Automatically scales with Supabase

## Cost

- Edge Functions: Free tier includes 500,000 invocations/month
- Your E-Way Bill usage will be well within limits

---

**After deployment, test the E-Way Bill generation in your admin panel!**
