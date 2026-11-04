# FINAL Payment Setup Guide

## ❌ Why Direct `.env` Didn't Work

Browsers block direct API calls to Razorpay due to **CORS (Cross-Origin Resource Sharing)** security policy. This is why you got the "Failed to fetch" error.

**You MUST use Edge Functions** - they run server-side and avoid CORS issues.

## ✅ Solution: Edge Functions with Local .env

I've reverted to Edge Functions, but made it simple: **all keys come from files, no Supabase secrets needed for local development**.

### 📁 Two .env Files:

1. **Main `.env`** (root folder) - For frontend:
```bash
VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
```

2. **`supabase/.env`** - For Edge Functions:
```bash
RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
RAZORPAY_KEY_SECRET=your_secret_key_here  ← ADD YOUR SECRET HERE
```

## 🎯 What You Need To Do:

### Step 1: Add Your Secret Key
Edit **`supabase/.env`** and replace `your_secret_key_here` with your actual Razorpay secret key

### Step 2: Start Supabase Locally
```bash
supabase start
```

This starts the local Supabase services including Edge Functions

### Step 3: Start Your Dev Server
```bash
npm run dev
```

### Step 4: Test Payment
- Go to checkout page
- Try making a payment
- It should now work without CORS errors

## 🔄 How It Works:

```
Frontend                    Edge Functions              Razorpay
  ↓                              ↓                         ↓
Reads from                  Reads from               Receives API
.env                        supabase/.env            calls
(KEY_ID only)               (KEY_ID + SECRET)        (from server)
  ↓                              ↓                         ↓
Calls Edge                  Makes secure             Returns
Function                    API request              response
```

## 📝 File Structure:

```
KUSTOMKOATS/
├── .env                           ← Frontend vars (KEY_ID)
├── supabase/
│   ├── .env                       ← Edge Function vars (KEY_ID + SECRET)
│   ├── .gitignore                 ← Ensures .env not committed
│   └── functions/
│       ├── create-razorpay-order/
│       │   └── index.ts           ← Creates orders
│       └── verify-razorpay-payment/
│           └── index.ts           ← Verifies payments
└── src/
    └── services/
        └── orderService.js        ← Calls Edge Functions
```

## ⚠️ Important Notes:

### For Local Development:
- ✅ Add secret to `supabase/.env`
- ✅ Run `supabase start` before `npm run dev`
- ✅ Edge Functions read from `supabase/.env`

### For Production:
You'll still need to set secrets in Supabase:
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key
```

Or use the Supabase Dashboard → Project Settings → Edge Functions → Secrets

### Security:
- ✅ Secret key never exposed to browser
- ✅ Edge Functions run server-side
- ✅ CORS issues avoided
- ✅ `supabase/.env` is gitignored

## 🐛 Troubleshooting:

**Edge Function not found:**
- Run `supabase start` first
- Check `supabase status` to ensure services are running

**Still getting CORS error:**
- Make sure you're calling Edge Functions, not Razorpay API directly
- Check `orderService.js` - should use `supabase.functions.invoke()`

**Environment variables not working:**
- Restart Supabase: `supabase stop` then `supabase start`
- Check file is named exactly `supabase/.env`

**Payment verification failed:**
- Double-check your secret key in `supabase/.env`
- Make sure secret matches the key ID

## ✅ Final Checklist:

- [ ] Add secret key to `supabase/.env`
- [ ] Run `supabase start`
- [ ] Run `npm run dev`
- [ ] Test checkout flow
- [ ] Verify payment completes

That's it! Edge Functions are required due to browser CORS restrictions.
