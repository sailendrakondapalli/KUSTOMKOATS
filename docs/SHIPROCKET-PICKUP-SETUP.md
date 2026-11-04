# 🚨 IMPORTANT: Add Pickup Location in Shiprocket

## Error You're Seeing

```
"Please add billing/shipping address first"
```

This means **you need to add your business pickup address** in Shiprocket before you can create shipments.

---

## ✅ How to Fix (Takes 2 minutes)

### Step 1: Login to Shiprocket
Go to: https://app.shiprocket.in/auth/login
- Email: kustomkoats.business@gmail.com
- Password: S5LXM#3@87^WnEbwVMuL9IvY2pCVyLy@

### Step 2: Add Pickup Address
1. Click on **Settings** in the left sidebar
2. Click on **Pickup Locations** (or go directly: https://app.shiprocket.in/seller/settings/pickup-address)
3. Click **"Add Pickup Address"** button

### Step 3: Fill in Your Business Address

**Pickup Location Name**: `Primary` (IMPORTANT: Use exactly this name)

**Contact Details**:
- Contact Person Name: Your name or business contact
- Phone Number: Your business phone number
- Email: kustomkoats.business@gmail.com

**Address**:
- Address Line 1: Your business street address
- Address Line 2: Landmark (optional)
- City: Your city
- State: Your state
- PIN Code: Your area PIN code
- Country: India

### Step 4: Save

Click **Save** or **Add Address** button.

---

## 📍 Example Address Format

```
Pickup Location Name: Primary
Contact Person: Kustom Koats Store
Phone: 9876543210
Email: kustomkoats.business@gmail.com

Address Line 1: Shop No. 123, MG Road
Address Line 2: Near Central Mall
City: Hyderabad
State: Telangana  
PIN Code: 500001
Country: India
```

---

## ⚠️ Important Notes

1. **Use "Primary" as the pickup location name** - Our code is configured to use this name
2. **You can add multiple pickup locations** if you have multiple warehouses
3. **Make sure all fields are filled** - Shiprocket requires complete address
4. **Verify your phone number** if Shiprocket asks for OTP

---

## 🧪 Test After Adding

Once you've added the pickup address:

1. Wait 1-2 minutes for Shiprocket to process
2. Open `test-shiprocket-now.html` again
3. Click "Test Shiprocket"
4. You should see ✅ SUCCESS!

---

## 🔍 Troubleshooting

### Still getting the same error?
- Make sure you saved the address properly
- Check if the pickup location name is exactly "Primary"
- Try refreshing your Shiprocket dashboard
- Wait a minute and try again

### Want to use a different pickup location name?
If you named it something else (like "Main Warehouse"), update these files:
- `supabase/functions/create-shiprocket-order/index.ts` - Line with `pickup_location: orderData.pickup_location || 'Primary'`
- Change `'Primary'` to your location name

### Multiple Warehouses?
You can add multiple pickup locations and specify which one to use per order. The default is "Primary".

---

## ✅ Once Done

After adding the pickup address, you're ready to:
1. ✅ Test the integration (test-shiprocket-now.html)
2. ✅ Create real shipments when customers checkout
3. ✅ Track orders in your Shiprocket dashboard

---

**Go to Shiprocket now and add your pickup address!**
https://app.shiprocket.in/seller/settings/pickup-address
