# Production Deployment Guide

Since Docker is not running locally, you need to deploy directly to Supabase production.

## 🚀 Step-by-Step Production Deployment

### Step 1: Set Secrets in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **kustom (gozoxlueuwnyujvvafdl)**
3. Go to **Edge Functions** (in left sidebar)
4. Click **Manage secrets**
5. Add these secrets:

```
Name: RAZORPAY_KEY_ID
Value: rzp_live_XXXXXXXXXXXXX (your live key ID)

Name: RAZORPAY_KEY_SECRET
Value: your_live_secret_key (your live secret)
```

6. Click **Save**

### Step 2: Deploy Edge Functions via Dashboard

**Option A: Via Supabase CLI (Recommended)**

Make sure you're logged in:
```bash
supabase login
```

Then link your project:
```bash
supabase link --project-ref gozoxlueuwnyujvvafdl
```

Deploy both functions:
```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

**Option B: Via Dashboard (Manual)**

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **New function**
3. Create `create-razorpay-order`:
   - Copy content from `supabase/functions/create-razorpay-order/index.ts`
   - Paste and deploy
4. Create `verify-razorpay-payment`:
   - Copy content from `supabase/functions/verify-razorpay-payment/index.ts`
   - Paste and deploy

### Step 3: Update Frontend .env for Production

Your main `.env` should have:
```bash
VITE_SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX  # Your live key
VITE_ADMIN_EMAIL=sailendrakondapalli@gmail.com
```

### Step 4: Build and Deploy Frontend

Build your production app:
```bash
npm run build
```

Deploy to your hosting provider (Vercel/Netlify/etc):
- Make sure to set environment variables in your hosting platform
- Copy all variables from `.env`

### Step 5: Test Live Payment

1. Visit your production site
2. Add items to cart
3. Go to checkout
4. Try a small real payment (₹10-₹50)
5. Verify:
   - Payment completes
   - Order is created in database
   - You receive money in Razorpay account

## 🔧 Alternative: Run Without Docker Locally

If you want to test locally without Docker:

### Option 1: Skip Edge Functions Locally

You can test the frontend directly against production Edge Functions:
1. Make sure secrets are set in Supabase Dashboard
2. Make sure Edge Functions are deployed
3. Run: `npm run dev`
4. Your local frontend will call production Edge Functions

### Option 2: Install Docker

1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker
3. Run: `supabase start`
4. Run: `npm run dev`

## ✅ Production Checklist

Before accepting real payments:

- [ ] Live Razorpay keys added to Supabase secrets
- [ ] Edge Functions deployed to production
- [ ] Frontend `.env` has live key ID
- [ ] Frontend deployed with correct environment variables
- [ ] Test payment successful
- [ ] Order appears in database
- [ ] Payment appears in Razorpay dashboard
- [ ] SSL certificate active (HTTPS)
- [ ] Terms & conditions updated
- [ ] Privacy policy includes payment info
- [ ] Refund policy clearly stated
- [ ] Contact information visible

## 🔒 Security Notes

**Never commit to git:**
- `.env` (main folder)
- `supabase/.env`
- Any file containing live keys

**Always use:**
- Supabase Dashboard secrets for Edge Functions in production
- Environment variables in hosting platform for frontend
- HTTPS for your website

## 📊 Monitoring

After going live:

1. **Supabase Dashboard** → Edge Functions → Logs
   - Monitor function calls
   - Check for errors
   
2. **Razorpay Dashboard** → Payments
   - Track successful payments
   - Monitor failed payments
   - Set up email alerts

3. **Your Database** → Orders table
   - Verify orders are being created
   - Check payment status updates

## 🐛 Common Issues

**"Function not found" error:**
- Edge Functions not deployed
- Deploy via CLI or Dashboard

**"Invalid signature" error:**
- Wrong secret key in Supabase secrets
- Double-check the key matches your Key ID

**Payment succeeds but order not updated:**
- Check RLS policies in Supabase
- Verify service role key is correct

**CORS errors:**
- Edge Functions should handle CORS automatically
- Check function logs in Dashboard

## 📞 Need Help?

- Supabase Support: https://supabase.com/support
- Razorpay Support: support@razorpay.com
- Check Edge Function logs in Supabase Dashboard

---

**Current Setup:**
- Frontend calls production Edge Functions
- Edge Functions use secrets from Supabase Dashboard
- No Docker needed for production deployment
