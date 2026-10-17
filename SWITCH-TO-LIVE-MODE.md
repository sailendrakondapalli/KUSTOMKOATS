# Switch from Test Mode to Live Mode

## 🎯 What You Need

Live API keys from Razorpay dashboard. Live keys start with `rzp_live_` instead of `rzp_test_`.

## 📋 Step-by-Step Guide

### Step 1: Get Live Keys from Razorpay

1. Go to **[Razorpay Dashboard](https://dashboard.razorpay.com/)**
2. **Switch to Live Mode** (toggle in top-right corner)
3. Go to **Settings** → **API Keys**
4. Click **Generate Key** or copy existing live keys
5. You'll get:
   - **Key ID**: `rzp_live_XXXXXXXXXXXXX`
   - **Key Secret**: `YYYYYYYYYYYYYYYYY`

**Important:** 
- Save these keys securely
- Never share them publicly
- Never commit them to git

### Step 2: Update `.env` (Root Folder)

Open `.env` and replace the test key ID with your live key ID:

```bash
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
```

### Step 3: Update `supabase/.env`

Open `supabase/.env` and add both live keys:

```bash
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_live_secret_here
```

### Step 4: Restart Everything

```bash
# Stop Supabase
supabase stop

# Start Supabase with new keys
supabase start

# In another terminal, restart your app
npm run dev
```

### Step 5: Test with Small Amount

Before going live, test with a small real payment (₹1 or ₹10) to ensure:
- Order creation works
- Payment completes successfully
- Order status updates correctly
- You receive money in your Razorpay account

## ⚠️ Before Going Live Checklist

- [ ] **Business verification complete** in Razorpay
- [ ] **Bank account linked** and verified
- [ ] **KYC documents submitted** and approved
- [ ] **Website/app details** added in Razorpay dashboard
- [ ] **Webhooks configured** (optional but recommended)
- [ ] **Test payment successful** with live keys
- [ ] **Refund policy** clear on your website
- [ ] **Terms & conditions** updated
- [ ] **Privacy policy** includes payment information

## 🔄 Switch Back to Test Mode

If you need to switch back to test mode:

**`.env`:**
```bash
VITE_RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
```

**`supabase/.env`:**
```bash
RAZORPAY_KEY_ID=rzp_test_Tdaa9U2WnDxRpz
RAZORPAY_KEY_SECRET=your_test_secret_here
```

Then restart services.

## 🔐 Security Best Practices

### For Production Deployment:

1. **Don't use `.env` for live keys in production**
2. **Use Supabase Secrets** instead:
   ```bash
   supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
   supabase secrets set RAZORPAY_KEY_SECRET=your_live_secret
   ```

3. **Set environment variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - AWS/GCP/Azure: Use their secrets management services

4. **Never commit** live keys to git:
   - Check `.gitignore` includes `.env`
   - Check `supabase/.gitignore` includes `.env`

## 📊 Monitor Payments

Once live:
1. Monitor Razorpay dashboard regularly
2. Check for failed payments
3. Handle customer refunds promptly
4. Review transaction reports
5. Set up email alerts in Razorpay for payment events

## 🐛 Troubleshooting

**Payment fails with "Key ID not found":**
- Make sure you copied the correct live key ID
- Restart Supabase and dev server

**Payment succeeds but order not updated:**
- Check RLS policies in Supabase
- Verify Edge Function logs in Supabase dashboard

**"Account not activated" error:**
- Complete KYC in Razorpay dashboard
- Wait for Razorpay team to activate your account

**Test cards work but real cards don't:**
- You're still using test keys
- Double-check both `.env` and `supabase/.env` have live keys

## 📞 Support

- **Razorpay Support**: support@razorpay.com
- **Razorpay Docs**: https://razorpay.com/docs/

---

**Remember**: Always test with small amounts first before processing large transactions!
