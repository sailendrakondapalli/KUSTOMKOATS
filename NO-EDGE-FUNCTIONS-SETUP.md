# Payment Setup - Direct from .env (No Edge Functions)

## ✅ What I Changed

I've **removed all Edge Functions** and made everything work directly from your `.env` file.

### Changes Made:

1. **`src/services/orderService.js`**
   - `createRazorpayOrder()` - Now calls Razorpay API directly from frontend
   - `verifyRazorpayPayment()` - Now verifies signature in browser using Web Crypto API
   - No more Edge Function calls!

2. **`.env`** - Everything reads from here:
   ```bash
   VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
   VITE_RAZORPAY_KEY_SECRET=your_secret_key_here
   ```

## 🎯 What You Need To Do

**Just add your actual Razorpay secret key to `.env`:**

```bash
VITE_SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
VITE_RAZORPAY_KEY_SECRET=your_actual_secret_here  ← ADD THIS
VITE_ADMIN_EMAIL=sailendrakondapalli@gmail.com
```

Then restart your dev server:
```bash
npm run dev
```

## 🔄 How It Works Now

### Payment Flow:
1. User clicks "Pay" button
2. Frontend reads keys from `.env` 
3. Frontend calls Razorpay API directly (no Edge Function)
4. Razorpay creates order
5. Razorpay checkout opens
6. User completes payment
7. Frontend verifies signature using browser crypto
8. Frontend updates database

### No More Edge Functions:
- ❌ No `supabase functions invoke`
- ❌ No `create-razorpay-order` Edge Function
- ❌ No `verify-razorpay-payment` Edge Function
- ✅ Everything happens in the frontend

## ⚠️ Important Notes

### CORS (Cross-Origin):
Razorpay API should allow requests from your domain. If you get CORS errors:
- Contact Razorpay support to whitelist your domain
- Or use test mode which is usually more lenient

### Security:
- Your secret key is exposed in the frontend bundle
- This is OK for **testing only**
- For **production**, consider:
  - Using Razorpay webhooks
  - Or keeping Edge Functions with proper secret management

### Database Access:
Make sure your Supabase RLS policies allow updating orders:
- The user must be able to update their own pending orders
- Check `orders` table RLS policies

## 🚀 Testing

1. Add your secret key to `.env`
2. Restart dev server: `npm run dev`
3. Go to checkout page
4. Try making a test payment
5. Check browser console for any errors

## 🐛 Troubleshooting

**CORS Error:**
- Razorpay blocking your domain
- Solution: Use test mode or contact Razorpay

**Signature Verification Failed:**
- Wrong secret key in `.env`
- Solution: Double-check your Razorpay dashboard

**Database Update Failed:**
- RLS policy blocking update
- Solution: Check Supabase RLS policies for orders table

**Environment Variable Not Found:**
- Didn't restart dev server after changing `.env`
- Solution: Stop and restart `npm run dev`

---

**That's it! No Edge Functions needed. Everything from `.env`.**
