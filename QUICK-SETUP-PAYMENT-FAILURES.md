# Quick Setup: Payment Failure Tracking

Follow these steps to activate the payment failure tracking system:

## Step 1: Database Setup (5 minutes)

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open `database/migrations/migration034.sql`
4. Copy the entire content
5. Paste and execute in Supabase SQL Editor
6. Verify table created: Check "Table Editor" > "payment_failures"

```sql
-- Quick verify query
SELECT * FROM payment_failures LIMIT 1;
```

## Step 2: Deploy Webhook (2 minutes)

```bash
# Navigate to project root
cd c:\Users\saile\Desktop\huhu\KUSTOMKOATS

# Deploy updated webhook
cd supabase
supabase functions deploy razorpay-webhook

# Verify deployment
supabase functions list
```

## Step 3: Start Backend (1 minute)

```bash
# Open new terminal
cd c:\Users\saile\Desktop\huhu\KUSTOMKOATS
npm run dev:backend

# Backend should start on http://localhost:3000
# You should see: "KustomKoats Backend API Server" message
```

## Step 4: Start Frontend (1 minute)

```bash
# Open new terminal
cd c:\Users\saile\Desktop\huhu\KUSTOMKOATS
npm run dev

# Frontend should start on http://localhost:5173
```

## Step 5: Access Admin Panel

1. Open browser: http://localhost:5173
2. Log in as admin
3. Navigate to: **Admin Panel** > **Payment Failures**
4. You should see the payment failures dashboard

## Step 6: Test It Works

### Test Webhook Capture (Simulated)

Razorpay will automatically send payment failure webhooks when real payments fail. To test:

1. Make a test payment on your checkout page
2. Use a test card that fails (check Razorpay test cards)
3. Webhook will capture the failure automatically
4. Check admin panel to see the failure logged

### Test Client-Side Capture

1. Go to checkout page
2. Initiate a payment
3. Close the Razorpay modal (cancels payment)
4. The failure should be logged
5. Check admin panel

## Verification Checklist

- [ ] Migration executed successfully
- [ ] Webhook deployed
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access admin panel
- [ ] Can see "Payment Failures" in sidebar
- [ ] Page loads without errors
- [ ] Statistics cards display (may show 0 if no failures yet)

## Quick Access URLs

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **Payment Failures**: http://localhost:5173/admin/payment-failures
- **Backend API**: http://localhost:3000
- **Backend Health**: http://localhost:3000/health

## Troubleshooting

### "Table not found" error
→ Run migration034.sql in Supabase SQL Editor

### "Route not found" error
→ Make sure backend is running and routes are registered

### "Unauthorized" error in admin panel
→ Make sure you're logged in as admin user

### Backend not starting
```bash
cd backend
npm install
npm run dev
```

### Frontend not starting
```bash
cd frontend
npm install
npm run dev
```

### Webhook not capturing failures
→ Check Supabase function logs:
```bash
supabase functions logs razorpay-webhook
```

## Test Payment Failure

To generate a test failure for verification:

1. Go to checkout page
2. Add items to cart
3. Proceed to checkout
4. Click "Pay with Razorpay"
5. **Close the payment modal** (don't complete payment)
6. Failure will be logged as "Payment cancelled"
7. Check admin panel to verify

## What to Look For

### In Admin Panel

**Statistics should show**:
- Total failures count
- Total failed amount
- Average failure amount
- Top error codes

**Table should show**:
- Date/time of failures
- Customer information
- Error details
- Payment method
- Amount
- Review status

**Filters should work**:
- Search by email/phone
- Filter by status
- Filter by error code
- Filter by payment method
- Date range selection

### In Database

```sql
-- Check failures are being logged
SELECT 
  id, 
  customer_email, 
  error_code, 
  amount, 
  failed_at 
FROM payment_failures 
ORDER BY failed_at DESC 
LIMIT 10;
```

## Success Indicators

✅ Migration executed without errors
✅ Webhook deployed successfully  
✅ Admin panel loads payment failures page
✅ Can see statistics dashboard
✅ Table shows failures (if any exist)
✅ Filters work correctly
✅ Can view failure details
✅ Can mark as reviewed

## Next Steps

1. **Test with real payment**: Make a test payment that will fail
2. **Review admin panel**: Check if failure was captured
3. **Test filters**: Try different filter combinations
4. **Mark as reviewed**: Practice the review workflow
5. **Monitor regularly**: Check admin panel daily

## Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs in terminal
3. Check Supabase function logs
4. Verify database table exists
5. Verify user has admin role

## Production Deployment

When deploying to production:

1. ✅ Run migration on production database
2. ✅ Deploy webhook to production
3. ✅ Update environment variables
4. ✅ Test with Razorpay test mode first
5. ✅ Monitor first few days closely

---

**Estimated Setup Time**: 10-15 minutes

**Difficulty**: Easy 🟢

**Status**: Ready to Deploy ✅
