# Quick Start: Settings & Product IDs

## Step 1: Run Database Setup

### Option A: Supabase Dashboard (Recommended)
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the entire contents of `setup-settings-and-product-ids.sql`
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Option B: Command Line
```bash
psql postgresql://[your-connection-string] -f setup-settings-and-product-ids.sql
```

## Step 2: Verify Installation

### Check Settings Table
```sql
SELECT * FROM site_settings ORDER BY key;
```

You should see 9 rows:
- cin_number
- company_address
- company_email
- company_name
- company_phone
- gstin
- next_product_id
- pan_number
- product_id_prefix

### Check Products Table
```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('display_product_id', 'hsn_code');
```

Should return 2 rows.

## Step 3: Configure Your Settings

1. Navigate to **http://localhost:5173/admin/settings**
2. Update the following:

### Company Information
- **Company Name**: Your legal business name
- **Company Address**: Full registered address
- **Phone Number**: Contact number
- **Email Address**: Business email

### Tax & Legal Information
- **GSTIN**: Your 15-character GST number (REQUIRED)
- **PAN Number**: 10-character PAN
- **CIN Number**: Company Identification Number

### Product ID Configuration
- **Product ID Prefix**: Keep "KK" or change (e.g., "KC", "PROD")
- **Next Product ID Number**: Leave as 100001 or adjust

3. Click **"Save Settings"**

## Step 4: Test Product Creation

1. Go to **http://localhost:5173/admin/products**
2. Click **"Add New Product"**
3. Notice the **"Product ID"** field shows "Will be auto-generated"
4. Fill in:
   - Product Name: "Test Product"
   - Price: 999
   - Category: Select any
5. Scroll down to **"Inventory & Barcode Details"**
6. Notice:
   - **Company GSTIN** is displayed (read-only from settings)
   - **HSN/SAC Code** defaults to 32089090
7. Click **"Save"**
8. The product should be created with ID: **KK-100001**

## Step 5: Verify Auto-Increment

1. Create another product
2. This should get ID: **KK-100002**
3. Check the counter in settings:

```sql
SELECT value FROM site_settings WHERE key = 'next_product_id';
-- Should show: 100003 (ready for next product)
```

## What's Changed?

### Product Form Changes
**Before:**
- No Product ID field
- Manual product tracking
- No HSN code
- No GSTIN display

**After:**
- ✅ Auto-generated Product ID (KK-100001 format)
- ✅ HSN/SAC Code field for tax
- ✅ GSTIN displayed from settings
- ✅ All inventory fields organized in one section

### Settings Management
**Before:**
- Hardcoded values in code
- GSTIN in multiple places
- No central configuration

**After:**
- ✅ All settings in one place (`/admin/settings`)
- ✅ GSTIN centrally managed
- ✅ Easy to update company information
- ✅ Product ID format customizable

## Common Tasks

### Change Product ID Format
1. Go to `/admin/settings`
2. Update **"Product ID Prefix"** (e.g., change "KK" to "KC")
3. Save settings
4. New products will use new prefix (e.g., KC-100001)
5. ⚠️ Existing products keep their old IDs

### Update GSTIN
1. Go to `/admin/settings`
2. Update **"GSTIN Number"** field
3. Save settings
4. New invoices/products will use new GSTIN
5. ✅ Changes reflect immediately in product forms

### Reset Product Counter
⚠️ **Advanced - Use with caution!**

```sql
-- Set next product ID to specific number
UPDATE site_settings 
SET value = '100500' 
WHERE key = 'next_product_id';
```

### View All Product IDs
```sql
SELECT id, display_product_id, name, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;
```

## Troubleshooting

### "Product ID not generating"
**Solution:**
```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_auto_product_id';

-- Manually generate ID for a product
UPDATE products 
SET display_product_id = (
  SELECT 'KK-' || LPAD((
    SELECT value::INTEGER FROM site_settings WHERE key = 'next_product_id'
  )::TEXT, 6, '0')
)
WHERE id = 'your-product-id' AND display_product_id IS NULL;
```

### "Settings not loading"
**Check RLS policies:**
```sql
-- Verify you're logged in as admin
SELECT auth.jwt() ->> 'email';

-- Check site_settings policies
SELECT * FROM pg_policies WHERE tablename = 'site_settings';
```

### "GSTIN not showing in product form"
**Frontend issue - Check browser console:**
1. Open DevTools (F12)
2. Check for errors
3. Verify `/api/settings/gstin` is returning data
4. Clear browser cache and reload

## Next Steps

### 1. Update Existing Products (Optional)
If you have existing products without display IDs:
```sql
-- They should have been auto-assigned during setup
-- But if not, run this:
UPDATE products 
SET display_product_id = 'KK-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE display_product_id IS NULL;

-- Update the counter
UPDATE site_settings 
SET value = (
  SELECT (MAX(SUBSTRING(display_product_id FROM '\d+')::INTEGER) + 1)::TEXT 
  FROM products
)
WHERE key = 'next_product_id';
```

### 2. Configure Invoices
The GSTIN from settings will automatically be used in:
- Tax invoices
- Product labels/QR codes
- E-Way bills
- ERP reports

### 3. Backup Settings
```sql
-- Export current settings
COPY (SELECT * FROM site_settings) TO '/tmp/settings_backup.csv' CSV HEADER;

-- Or in Supabase Dashboard, just copy the table data
```

## Help & Support

### Quick Checks
✅ Database migration completed successfully  
✅ Settings page accessible at `/admin/settings`  
✅ GSTIN displays in product form  
✅ New products get auto-generated IDs  
✅ Settings save successfully  

### If Issues Persist
1. Check Supabase logs for errors
2. Verify RLS policies are active
3. Ensure you're logged in as admin
4. Check browser console for frontend errors

## Summary

You now have:
1. ✅ **Centralized Settings** - Manage everything in one place
2. ✅ **Auto Product IDs** - KK-100001, KK-100002, etc.
3. ✅ **GST Integration** - GSTIN managed globally
4. ✅ **Better Organization** - All inventory fields in one section

Start creating products and enjoy the automated workflow! 🎉
