# Simple Environment Setup - All Keys in .env

## ✅ What I Changed

I've modified your code so **all Razorpay keys come from your main `.env` file**.

### Files Modified:

1. **`.env`** - Add both keys here:
```bash
VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
VITE_RAZORPAY_KEY_SECRET=your_secret_key_here
```

2. **`supabase/functions/create-razorpay-order/index.ts`** 
   - Now accepts `keyId` and `keySecret` as parameters from frontend

3. **`supabase/functions/verify-razorpay-payment/index.ts`**
   - Now accepts `keySecret` as parameter from frontend

4. **`src/services/orderService.js`**
   - Passes keys from `.env` to Edge Functions

## 🎯 What You Need To Do

Just add your **actual secret key** to `.env`:

```bash
VITE_SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
VITE_RAZORPAY_KEY_SECRET=your_actual_secret_here  ← ADD YOUR SECRET HERE
VITE_ADMIN_EMAIL=sailendrakondapalli@gmail.com
```

## 🔄 How It Works Now

1. **Frontend** reads keys from `.env`:
   - `import.meta.env.VITE_RAZORPAY_KEY_ID`
   - `import.meta.env.VITE_RAZORPAY_KEY_SECRET`

2. **Frontend passes keys** to Edge Functions when making API calls

3. **Edge Functions** receive the keys and use them to:
   - Create Razorpay orders
   - Verify payment signatures

## ⚠️ Important Security Notes

**For Production:**
- This approach exposes your secret key in the frontend bundle
- It's okay for **testing** but not ideal for **production**
- For production, you should either:
  - Set secrets in Supabase dashboard
  - Or use backend API that doesn't expose secrets

**For Now (Testing):**
- ✅ This works fine for local testing
- ✅ All keys in one place (`.env`)
- ✅ Easy to manage

## 🚀 Testing

1. Add your secret key to `.env`
2. Restart your dev server: `npm run dev`
3. Test the payment flow
4. Check browser console for any errors

That's it! Everything now reads from your main `.env` file.
