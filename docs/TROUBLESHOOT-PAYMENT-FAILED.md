# Troubleshoot "Payment Failed" Error

## 🔍 Quick Diagnosis

### Step 1: Open Browser Console

1. Open your app: http://localhost:5173
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Type: `testRazorpayIntegration()`
5. Press Enter

This will show you exactly where the problem is.

### Step 2: Check Console Output

Look for these errors:

**Error 1: "Function not found" or 404**
```
Edge Function 'create-razorpay-order' not found
```
**Solution:** Edge Functions not deployed
- Go to Supabase Dashboard → Edge Functions
- Deploy `create-razorpay-order` and `verify-razorpay-payment`

**Error 2: "Razorpay credentials not provided"**
```
Razorpay credentials not configured
```
**Solution:** Secrets not set in Supabase
- Go to Supabase Dashboard → Edge Functions → Secrets
- Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

**Error 3: "Invalid Key ID" or "Authentication failed"**
```
The api key/secret provided is invalid
```
**Solution:** Wrong keys or test/live mismatch
- Make sure you're using LIVE keys (both ID and secret)
- Both keys must be from the same Razorpay account
- Check for typos when copying keys

**Error 4: "Account not activated"**
```
Your account is not activated
```
**Solution:** Razorpay account not verified
- Complete KYC in Razorpay Dashboard
- Wait for account activation (can take 24-48 hours)
- Contact Razorpay support

## 🛠️ Common Fixes

### Fix 1: Deploy Edge Functions

Since you can't deploy via CLI, use Supabase Dashboard:

1. Go to https://supabase.com/dashboard/project/gozoxlueuwnyujvvafdl/functions
2. Click **New function**
3. Name: `create-razorpay-order`
4. Copy content from `supabase/functions/create-razorpay-order/index.ts`
5. Paste and click **Deploy**
6. Repeat for `verify-razorpay-payment`

### Fix 2: Set Secrets in Dashboard

1. Go to https://supabase.com/dashboard/project/gozoxlueuwnyujvvafdl/settings/functions
2. Click **Manage secrets** or **Secrets** tab
3. Add both secrets:
   - Name: `RAZORPAY_KEY_ID`, Value: `rzp_live_Tm8zdwG0mHgj7d`
   - Name: `RAZORPAY_KEY_SECRET`, Value: your live secret key
4. Click **Save**
5. **Restart Edge Functions** (redeploy them)

### Fix 3: Verify Keys Match

Your current setup:
- **Frontend .env**: `VITE_RAZORPAY_KEY_ID=rzp_live_Tm8zdwG0mHgj7d`
- **Supabase Secrets**: Must have same `RAZORPAY_KEY_ID` and matching `RAZORPAY_KEY_SECRET`

Both must be from the SAME Razorpay account!

### Fix 4: Check Razorpay Account Status

1. Go to https://dashboard.razorpay.com/
2. Switch to **Live Mode** (toggle at top)
3. Check if there's a banner saying "Account not activated"
4. If yes, complete KYC documents
5. Wait for Razorpay team approval

## 📋 Verification Checklist

Run through this checklist:

- [ ] Edge Functions deployed in Supabase Dashboard
- [ ] `RAZORPAY_KEY_ID` secret set in Supabase
- [ ] `RAZORPAY_KEY_SECRET` secret set in Supabase
- [ ] Both secrets are LIVE keys (start with `rzp_live_`)
- [ ] Key ID in `.env` matches Key ID in Supabase secrets
- [ ] Both keys are from the same Razorpay account
- [ ] Razorpay account is activated (KYC complete)
- [ ] Razorpay dashboard shows "Live Mode" active
- [ ] Browser console shows no 404 errors
- [ ] Test function `testRazorpayIntegration()` passes

## 🔬 Detailed Browser Console Check

After running `testRazorpayIntegration()`, you should see:

```
🔍 Testing Razorpay Integration...

1️⃣ Environment Variables:
   VITE_SUPABASE_URL: https://gozoxlueuwnyujvvafdl.supabase.co
   VITE_RAZORPAY_KEY_ID: rzp_live_Tm8zdwG0mHgj7d
   Key starts with rzp_live? true

2️⃣ Testing Edge Function...
   Calling create-razorpay-order...
   ✅ Edge Function Success!
   Order ID: order_XXXXXXXXXXXXX
   Amount: 100
   Currency: INR
```

If you see ✅ marks, payment integration is working!
If you see ❌ marks, follow the error message shown.

## 🆘 Still Not Working?

### Option 1: Share Console Error

1. Run `testRazorpayIntegration()` in browser console
2. Take a screenshot of the error
3. Share with me

### Option 2: Check Edge Function Logs

1. Go to Supabase Dashboard → Edge Functions
2. Click on `create-razorpay-order`
3. Check **Logs** tab
4. Look for recent errors

### Option 3: Test with Test Mode First

If live mode is not working, temporarily switch back to test mode:

**.env:**
```bash
VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
```

**Supabase Secrets:**
```
RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
RAZORPAY_KEY_SECRET=your_test_secret
```

Test mode should work immediately without KYC verification.

## 📞 Support Links

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Razorpay Integration Docs**: https://razorpay.com/docs/payments/
- **Razorpay Support**: support@razorpay.com

---

**Most Common Issue:** Edge Functions not deployed or secrets not set.
**Quick Fix:** Deploy functions and add secrets in Supabase Dashboard.
