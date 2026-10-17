# Razorpay Environment Setup Guide

## Overview
Your Razorpay integration has two parts:
1. **Frontend** - Uses public key to initialize Razorpay checkout
2. **Edge Functions** - Uses secret key to create/verify orders securely

## Setup Instructions

### 1. Main Application (.env)
Add these to your **root `.env` file** (already have most of these):

```bash
VITE_SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
VITE_ADMIN_EMAIL=sailendrakondapalli@gmail.com
```

### 2. Edge Functions Local Development (supabase/.env)
Create a **`supabase/.env`** file with:

```bash
RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
RAZORPAY_KEY_SECRET=your_secret_key_here
```

This file is used when running Edge Functions locally with:
```bash
supabase functions serve
```

### 3. Edge Functions Production (Supabase Secrets)
For deployed Edge Functions, you still need to set secrets in Supabase:

```bash
# Option A: Using Supabase CLI
supabase secrets set RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key_here

# Option B: Using Supabase Dashboard
# Go to: Project Settings > Edge Functions > Secrets
# Add: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
```

## How It Works

### Frontend Flow
1. User clicks "Pay" button
2. `CheckoutPage.jsx` reads `import.meta.env.VITE_RAZORPAY_KEY_ID` from your `.env`
3. Initializes Razorpay checkout with this public key

### Backend Flow
1. Edge Function `create-razorpay-order` reads `RAZORPAY_KEY_SECRET` from environment
2. Creates order with Razorpay API using secret key
3. Edge Function `verify-razorpay-payment` verifies payment signature using secret key

## Security Notes

- ✅ **VITE_** prefixed variables are safe in frontend (public)
- ⚠️ **Never** put `RAZORPAY_KEY_SECRET` in main `.env` with VITE_ prefix
- ⚠️ **Never** commit `supabase/.env` to git (already in .gitignore)
- ✅ Edge Functions run server-side, so secrets are safe there

## Files Modified
- `.env` - Main app environment variables (frontend)
- `supabase/.env` - Edge Functions local development (gitignored)
- `supabase/.env.example` - Template for team members
- `supabase/.gitignore` - Ensures .env is never committed

## Testing Locally

1. Make sure both `.env` files are populated
2. Start Supabase local development:
   ```bash
   supabase start
   ```
3. Serve Edge Functions:
   ```bash
   supabase functions serve
   ```
4. Run your app:
   ```bash
   npm run dev
   ```

## Deployment Checklist

- [ ] Set `RAZORPAY_KEY_ID` in Supabase secrets
- [ ] Set `RAZORPAY_KEY_SECRET` in Supabase secrets
- [ ] Deploy Edge Functions: `supabase functions deploy create-razorpay-order`
- [ ] Deploy Edge Functions: `supabase functions deploy verify-razorpay-payment`
- [ ] Verify environment variables in Supabase dashboard
