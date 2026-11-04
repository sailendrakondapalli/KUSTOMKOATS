# Razorpay Webhook Setup Guide

## Problem
Payments made via QR code or outside the Razorpay modal are not being recognized because your system only verifies payments when the user completes the checkout modal successfully.

## Solution
Set up a Razorpay webhook to automatically receive payment notifications.

---

## Step 1: Add Webhook Secret to Environment

### 1.1 Update `supabase/.env`

Add this line:
```bash
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**How to get the webhook secret:**
- You'll create this in Step 2
- For now, use a temporary placeholder: `temp_webhook_secret_123`

---

## Step 2: Deploy the Webhook Function

```bash
cd supabase
supabase functions deploy razorpay-webhook
```

After deployment, you'll get a URL like:
```
https://your-project-ref.supabase.co/functions/v1/razorpay-webhook
```

**Copy this URL** - you'll need it in Step 3.

---

## Step 3: Configure Razorpay Webhook

### 3.1 Login to Razorpay Dashboard
Go to: https://dashboard.razorpay.com/

### 3.2 Navigate to Webhooks
1. Go to **Settings** → **Webhooks**
2. Click **+ Create New Webhook**

### 3.3 Configure Webhook
Fill in these details:

**Webhook URL:**
```
https://your-project-ref.supabase.co/functions/v1/razorpay-webhook
```
(Use the URL from Step 2)

**Secret:**
- Generate a strong random string (or use the one Razorpay provides)
- Copy this secret

**Events to subscribe:**
- ✅ `payment.captured` (REQUIRED)
- ✅ `payment.failed` (RECOMMENDED)
- ✅ `payment.authorized` (OPTIONAL)

**Active:** ✅ Yes

Click **Create Webhook**

### 3.4 Update Environment Variable
1. Copy the webhook secret from Razorpay
2. Update `supabase/.env`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
3. Redeploy the function:
   ```bash
   supabase functions deploy razorpay-webhook
   ```

---

## Step 4: Test the Webhook

### 4.1 Test with Razorpay Dashboard
1. In Razorpay Dashboard → Webhooks
2. Click on your webhook
3. Click **Send Test Webhook**
4. Select `payment.captured` event
5. Click **Send**

### 4.2 Check Logs
```bash
supabase functions logs razorpay-webhook
```

You should see:
```
Webhook received: payment.captured
Order XXX updated successfully
```

---

## Step 5: Make a Real Test Payment

1. Go to your website checkout
2. Create an order
3. Use Razorpay test mode:
   - **Test UPI ID:** `success@razorpay`
   - **Test Card:** 4111 1111 1111 1111
4. Complete payment
5. Check your orders table - it should update automatically!

---

## How It Works

### Before (Old Flow):
```
User → Razorpay Modal → Payment → Modal Closes
                                    ↓
                              Payment Lost ❌
```

### After (With Webhook):
```
User → Razorpay → Payment → Webhook Notification
                               ↓
                         Order Auto-Updated ✅
```

---

## Troubleshooting

### Webhook not receiving events?

**Check 1: Verify webhook is active**
- Razorpay Dashboard → Webhooks → Check "Active" toggle

**Check 2: Check webhook logs**
```bash
supabase functions logs razorpay-webhook --limit 50
```

**Check 3: Verify signature**
- Make sure `RAZORPAY_WEBHOOK_SECRET` matches exactly in:
  - `supabase/.env`
  - Razorpay Dashboard webhook settings

**Check 4: Test webhook delivery**
- Razorpay Dashboard → Webhooks → Your webhook → Logs
- Should show "200 OK" responses

### Order still showing "pending"?

**Check 1: razorpay_order_id field**
```sql
SELECT id, razorpay_order_id, payment_status 
FROM orders 
WHERE payment_status = 'pending' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check 2: Manually update order**
If you know the payment was successful:
```sql
UPDATE orders 
SET payment_status = 'paid', 
    order_status = 'confirmed' 
WHERE razorpay_order_id = 'order_xxx';
```

---

## Security Notes

1. **Never expose webhook secret**
   - Keep it in `supabase/.env` only
   - Don't commit to git
   - Don't log it

2. **Always verify signature**
   - The webhook function verifies Razorpay's signature
   - This prevents fake payment notifications

3. **Use HTTPS**
   - Webhooks only work with HTTPS
   - Supabase functions use HTTPS by default

---

## Production Checklist

- [ ] Webhook deployed: `supabase functions deploy razorpay-webhook`
- [ ] `RAZORPAY_WEBHOOK_SECRET` added to `supabase/.env`
- [ ] Webhook configured in Razorpay Dashboard
- [ ] Events subscribed: `payment.captured`, `payment.failed`
- [ ] Webhook status: Active ✅
- [ ] Test webhook: Successful ✅
- [ ] Real payment test: Successful ✅

---

## Additional Notes

### For Production
When you switch to **live mode** in Razorpay:
1. Create a NEW webhook for production
2. Use your **production Supabase URL**
3. Update **production environment variables**
4. Test with real small amount (₹1)

### Monitoring
Check webhook health regularly:
```bash
# Check recent webhook calls
supabase functions logs razorpay-webhook --tail

# Check failed orders
SELECT id, created_at, payment_status 
FROM orders 
WHERE payment_status = 'pending' 
AND created_at < NOW() - INTERVAL '30 minutes';
```

---

## Need Help?

- Razorpay Webhooks Docs: https://razorpay.com/docs/webhooks/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Check Razorpay Dashboard webhook logs for delivery issues
