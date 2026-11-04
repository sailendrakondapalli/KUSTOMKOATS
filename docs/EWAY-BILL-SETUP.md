# E-Way Bill Integration - Setup Guide

## ✅ Implementation Complete

Government E-Way Bill API integration has been added to your Kustom Koats admin panel.

## 📋 What's Been Added

### 1. **E-Way Bill Service** (`src/services/ewayBillService.js`)
- Government API authentication
- E-Way Bill generation
- E-Way Bill retrieval
- E-Way Bill cancellation
- Automatic data formatting from orders

### 2. **Database Tables** (`setup-eway-bill.sql`)
- `eway_bill_config` - Stores your credentials and seller details
- `eway_bills` - Records of all generated e-way bills
- Links to orders table

### 3. **Admin Configuration Page** (`/admin/eway-bill`)
- Secure credential storage
- Seller details (GSTIN, address, etc.)
- Default settings (HSN codes, tax rates, transport mode)
- Enable/disable e-way bill generation

### 4. **Menu Integration**
- ✅ Added "E-Way Bill" menu item in admin sidebar
- ✅ Route registered in App.jsx

## 🚀 Setup Instructions

### Step 1: Get E-Way Bill API Credentials

1. Visit https://ewaybillgst.gov.in/
2. Login with your GSTIN credentials
3. Go to **Registration → For API**
4. Request API access and get:
   - API Username
   - API Password

### Step 2: Run Database Migration

```bash
# In Supabase SQL Editor, run:
```

Open `setup-eway-bill.sql` in Supabase SQL Editor and execute it.

### Step 3: Configure E-Way Bill Settings

1. Navigate to **Admin Panel → E-Way Bill**
2. Fill in your credentials:
   - E-Way Bill API Username
   - E-Way Bill API Password
3. Fill in seller details:
   - GSTIN (15 characters)
   - Trade Name
   - Complete address
   - Pincode & State
4. Set default values:
   - HSN Code (default: 3208 for paints)
   - CGST Rate (default: 9%)
   - SGST Rate (default: 9%)
   - Transport Mode (Road/Rail/Air/Ship)
   - Transporter details (optional)
5. Enable e-way bill generation
6. Click "Save Configuration"

## 📝 How to Use

### Generate E-Way Bill for an Order

You'll need to add a "Generate E-Way Bill" button to your Orders page. Here's the code:

```javascript
import ewayBillService from '../../services/ewayBillService'

// In AdminOrdersPage.jsx
const handleGenerateEWayBill = async (order) => {
  try {
    // Load config
    const { data: config } = await supabase
      .from('eway_bill_config')
      .select('*')
      .eq('is_active', true)
      .single()
    
    if (!config) {
      return toast.error('E-Way Bill not configured')
    }

    // Authenticate
    await ewayBillService.authenticate(
      config.api_username,
      config.api_password
    )

    // Format order data
    const ewayBillData = ewayBillService.formatOrderForEWayBill(order, config)

    // Generate e-way bill
    const result = await ewayBillService.generateEWayBill(ewayBillData)

    // Save to database
    const { error } = await supabase
      .from('eway_bills')
      .insert({
        order_id: order.id,
        ewb_no: result.ewayBillNo,
        ewb_date: result.ewayBillDate,
        valid_upto: result.validUpto,
        doc_type: 'INV',
        doc_no: order.order_number,
        doc_date: new Date(),
        from_gstin: config.seller_gstin,
        from_trade_name: config.seller_trade_name,
        to_gstin: order.shipping_gstin || 'URP',
        to_trade_name: order.shipping_name,
        total_value: order.total_amount,
        total_inv_value: order.total_amount,
        api_response: result,
        status: 'active',
      })

    if (error) throw error

    // Update order
    await supabase
      .from('orders')
      .update({
        eway_bill_no: result.ewayBillNo,
        eway_bill_date: result.ewayBillDate,
      })
      .eq('id', order.id)

    toast.success(`E-Way Bill generated: ${result.ewayBillNo}`)
  } catch (error) {
    console.error('E-Way Bill generation error:', error)
    toast.error(error.message || 'Failed to generate E-Way Bill')
  }
}
```

## 🔐 Security Notes

1. **Credentials Storage**: API credentials are stored in the database. In production, consider encrypting them.
2. **Access Control**: Only admins should access e-way bill configuration.
3. **API Token**: Auth token is stored in memory and expires after 6 hours.

## 📊 E-Way Bill Requirements

Generate e-way bills when:
- Order value > ₹50,000 (mandatory for most states)
- Interstate movement of goods
- Goods are being transported by vehicle

## 🔄 E-Way Bill Workflow

1. **Configuration** → Set up credentials and seller details
2. **Order Processing** → Order is placed and confirmed
3. **Generation** → Generate e-way bill before shipping
4. **Transport** → Provide e-way bill number to transporter
5. **Tracking** → View all generated e-way bills in database

## 📱 API Endpoints Available

- `/authenticate` - Get auth token
- `/ewayapi/v1.03/ewayapi` - Generate e-way bill
- `/ewayapi/v1.03/ewayapi/getewaybill` - Get e-way bill details
- `/ewayapi/v1.03/ewayapi/cancewaybill` - Cancel e-way bill

## ⚠️ Important Notes

1. E-Way Bill is valid for limited time based on distance
2. Can be cancelled within 24 hours of generation
3. Required documents: Invoice, Transporter details
4. Each e-way bill has unique number (12 digits)

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Configure credentials in admin panel
3. ⏳ Add "Generate E-Way Bill" button to Orders page
4. ⏳ Test with a sample order
5. ⏳ Train staff on e-way bill generation process

## 📞 Support

For API issues, contact:
- E-Way Bill Helpdesk: https://ewaybillgst.gov.in/
- Email: [email protected]
- Phone: 0120-4888999

---

**Status**: Ready for configuration and testing
**Location**: `/admin/eway-bill`
