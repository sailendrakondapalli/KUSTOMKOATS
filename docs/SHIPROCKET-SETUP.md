# Shiprocket Integration Setup Guide

## ✅ What's Already Done

1. **Edge Function Created**: `supabase/functions/create-shiprocket-order/index.ts`
2. **Frontend Service**: `src/services/shiprocketService.js` 
3. **Checkout Integration**: Shiprocket order is automatically created after successful Razorpay payment

## 🔧 What You Need To Do

### Step 1: Add Shiprocket Credentials

1. Go to https://app.shiprocket.in/seller/setting
2. Get your Shiprocket email and password
3. Add to **TWO** `.env` files:

#### File 1: `.env` (Main frontend config)
```env
VITE_SHIPROCKET_EMAIL=your_actual_shiprocket_email@example.com
VITE_SHIPROCKET_PASSWORD=your_actual_shiprocket_password
```

#### File 2: `supabase/.env` (Edge Functions config)
```env
SHIPROCKET_EMAIL=your_actual_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_actual_shiprocket_password
```

### Step 2: Deploy Edge Function

Run this command in your terminal:

```bash
cd C:\Users\saile\Desktop\huhu\KUSTOMKOATS
supabase functions deploy create-shiprocket-order
```

If you get authentication errors:
```bash
supabase login
supabase link --project-ref gozoxlueuwnyujvvafdl
supabase functions deploy create-shiprocket-order
```

### Step 3: Set Secrets in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/gozoxlueuwnyujvvafdl/settings/functions
2. Click "Edge Functions Secrets"
3. Add these secrets:
   - Key: `SHIPROCKET_EMAIL`, Value: your email
   - Key: `SHIPROCKET_PASSWORD`, Value: your password

## 🎯 How It Works

1. **Customer completes checkout** → Razorpay payment modal opens
2. **Payment succeeds** → Order verified and saved to database
3. **Shiprocket order created automatically** → Shipment tracking begins
4. **Customer redirected** → Order success page

## 🔍 Testing

After deployment, test with a real order:
1. Add items to cart
2. Go to checkout
3. Complete payment with Razorpay
4. Check browser console for "Shiprocket order created successfully"
5. Verify shipment in your Shiprocket dashboard: https://app.shiprocket.in/orders

## 📝 Order Data Sent to Shiprocket

```javascript
{
  order_id: "your_order_id",
  customer_name: "Customer Name",
  customer_email: "email@example.com",
  customer_phone: "9876543210",
  billing_address: "Full address",
  billing_city: "City",
  billing_pincode: "123456",
  billing_state: "State",
  order_items: [
    {
      name: "Product Name",
      sku: "PROD-001",
      units: 2,
      selling_price: 999,
    }
  ],
  payment_method: "Prepaid",
  sub_total: 1998,
  shipping_charges: 0,
  weight: 1.0  // kg
}
```

## ⚠️ Important Notes

- Shiprocket order creation happens **after** successful payment
- If Shiprocket fails, **payment still succeeds** (order is not cancelled)
- Check console logs for Shiprocket errors
- Weight is auto-calculated as 0.5kg per item (you can adjust in CheckoutPage.jsx line ~311)
- Package dimensions default to 10x10x10 cm (adjust if needed)

## 🐛 Troubleshooting

### Error: "Failed to authenticate with Shiprocket"
- Check credentials in Supabase secrets
- Verify email/password at https://app.shiprocket.in

### Error: "Docker is not running"
- This is just a warning for local testing
- The Edge Function will still deploy to production
- Or start Docker Desktop if you want to test locally

### Shiprocket order not appearing
- Check browser console for errors
- Verify Edge Function is deployed: `supabase functions list`
- Check Supabase Edge Functions logs in dashboard
- Ensure secrets are set correctly

## 🎨 Customization

To modify shipment details, edit `CheckoutPage.jsx` around line 308:

```javascript
const shiprocketOrderData = {
  // ... existing fields
  weight: items.reduce((sum, i) => sum + (i.quantity * YOUR_WEIGHT), 0),
  length: YOUR_LENGTH,
  breadth: YOUR_BREADTH,
  height: YOUR_HEIGHT,
}
```

---

**Need Help?** Check Shiprocket API docs: https://apidocs.shiprocket.in/
