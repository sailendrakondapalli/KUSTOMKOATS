# Settings & Auto-Increment Product ID Implementation

## Overview
Implemented a global settings system with auto-incrementing product IDs and centralized GST management.

## Features Implemented

### 1. **Global Settings Management**
- Created `site_settings` table for storing system-wide configurations
- Settings include:
  - GSTIN (Company GST Number)
  - Company Name, Address, Phone, Email
  - PAN Number, CIN Number
  - Product ID Prefix (e.g., "KK")
  - Next Product ID Counter

### 2. **Auto-Incrementing Product IDs**
- Products now get auto-generated display IDs (e.g., `KK-100001`, `KK-100002`)
- Added `display_product_id` column to products table
- Implemented database trigger to auto-generate IDs on product creation
- Counter increments automatically with each new product

### 3. **Admin Settings Page**
- New admin page at `/admin/settings`
- Manage all global settings in one place:
  - Company Information
  - Tax & Legal Information (GSTIN, PAN, CIN)
  - Product ID Configuration
- Settings are pulled from database and displayed in product forms

### 4. **Product Form Updates**
- Product ID field now shows:
  - Auto-generated ID for existing products
  - "Will be auto-generated" message for new products
- Added HSN/SAC Code field for tax purposes
- GSTIN displayed in product form (read-only, pulled from settings)
- Enhanced Inventory & Barcode Details section

## Files Created

### 1. Database Setup
**File:** `setup-settings-and-product-ids.sql`
- Creates `site_settings` table with RLS policies
- Adds `display_product_id` and `hsn_code` columns to products table
- Creates `generate_product_id()` function
- Creates trigger for auto-generation
- Backfills existing products with IDs
- Inserts default settings

### 2. Admin Settings Page
**File:** `src/pages/admin/AdminSettingsPage.jsx`
- Full-featured settings management interface
- Three sections: Company Info, Tax Info, Product ID Config
- Real-time preview of next product ID
- Warning about changing product ID settings

## Files Modified

### 1. **src/pages/admin/AdminProductsPage.jsx**
- Imported `getSetting` from settingsService
- Updated `emptyProduct()` to include `hsn_code` and `display_product_id`
- Added GSTIN state that loads from settings
- Updated product form to show:
  - Product ID (auto-generated)
  - HSN/SAC Code field
  - GSTIN display (read-only from settings)
- Updated `buildData()` to include new fields

### 2. **src/App.jsx**
- Added import for `AdminSettingsPage`
- Added route: `/admin/settings`

### 3. **src/components/admin/KKAdminLayout.jsx**
- Added `Settings` icon import
- Added Settings navigation item to `NAV_ITEMS`

## Database Schema Changes

### New Table: `site_settings`
```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Products Table Additions
```sql
ALTER TABLE products ADD COLUMN display_product_id TEXT;
ALTER TABLE products ADD COLUMN hsn_code TEXT DEFAULT '32089090';
```

## Setup Instructions

### 1. Run Database Migration
```bash
# Connect to your Supabase project and run:
psql -d your_database -f setup-settings-and-product-ids.sql
```

Or in Supabase Dashboard:
- Go to SQL Editor
- Paste contents of `setup-settings-and-product-ids.sql`
- Click "Run"

### 2. Verify Settings Table
```sql
SELECT * FROM site_settings;
```

Should show default settings including:
- gstin: 27BZAPK4893D1ZZT
- company_name: KUSTOM KOATS ENTERPRISES
- product_id_prefix: KK
- next_product_id: 100001

### 3. Test Product Creation
1. Go to `/admin/products`
2. Click "Add New Product"
3. Notice "Product ID" field shows "Will be auto-generated"
4. Fill in required fields and save
5. Product should get ID like `KK-100001`
6. Next product will be `KK-100002`, etc.

### 4. Configure Settings
1. Go to `/admin/settings`
2. Update company information as needed
3. Update GSTIN if different
4. Adjust product ID prefix if desired
5. Click "Save Settings"

## Default Settings Explained

### Product ID Format
- **Prefix**: "KK" (customizable)
- **Starting Number**: 100001 (customizable)
- **Format**: `{PREFIX}-{6-digit-number}`
- **Example**: KK-100001, KK-100002, etc.

### GSTIN Usage
- Displayed in product forms (read-only)
- Used in invoices automatically
- Used in E-Way Bill generation
- Change only in Settings page

## Important Notes

### ⚠️ Warnings
1. **Changing Product ID Prefix**: Will only affect NEW products. Existing products keep their IDs.
2. **Changing Next Product ID**: Use with caution. Ensure the number doesn't conflict with existing products.
3. **GSTIN Changes**: Will affect all new invoices and documents. Verify the number is correct.

### Best Practices
1. Set up all settings BEFORE creating products
2. Don't change product ID prefix after production launch
3. Keep GSTIN up-to-date for tax compliance
4. Regularly backup the `site_settings` table

## Testing Checklist

- [x] Settings page accessible at `/admin/settings`
- [x] Settings load correctly from database
- [x] Settings save correctly
- [x] New products get auto-generated IDs
- [x] Product ID format is correct (PREFIX-NUMBER)
- [x] Product ID counter increments
- [x] GSTIN displays in product form
- [x] HSN code field works
- [x] Existing products keep their IDs
- [x] Settings navigation link visible in admin sidebar

## API Endpoints Used

### Reading Settings
```javascript
import { getSetting } from '../services/settingsService'
const gstin = await getSetting('gstin')
```

### Saving Settings
```javascript
import { setSetting } from '../services/settingsService'
await setSetting('gstin', '27BZAPK4893D1ZZT')
```

## Future Enhancements

### Potential Features
1. **Bulk Product ID Regeneration**: Reset all product IDs with new prefix
2. **Settings History**: Track changes to settings over time
3. **Multi-Location Support**: Different settings per warehouse/location
4. **Settings Export/Import**: Backup and restore settings
5. **Settings Validation**: Advanced validation rules for tax numbers
6. **Email Templates**: Store email templates in settings
7. **Custom Fields**: Allow admins to add custom product fields

## Troubleshooting

### Product ID Not Generating
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_product_id';

-- Check current counter value
SELECT value FROM site_settings WHERE key = 'next_product_id';
```

### Settings Not Loading
```sql
-- Check if settings exist
SELECT * FROM site_settings;

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'site_settings';
```

### Duplicate Product IDs
```sql
-- Find duplicates
SELECT display_product_id, COUNT(*) 
FROM products 
GROUP BY display_product_id 
HAVING COUNT(*) > 1;

-- Fix counter to skip duplicates
UPDATE site_settings 
SET value = (SELECT MAX(SUBSTRING(display_product_id FROM '\d+')::INTEGER) + 1 FROM products)::TEXT 
WHERE key = 'next_product_id';
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify database migration ran successfully
3. Check browser console for errors
4. Verify Supabase RLS policies are correct
