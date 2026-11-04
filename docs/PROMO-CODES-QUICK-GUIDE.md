# Promo Codes - Quick Reference Guide

## 🎯 Quick Setup (3 Steps)

### 1. Run SQL Migration
Open Supabase SQL Editor and run `setup-promo-codes.sql`

### 2. Access Admin Panel
Go to: `http://localhost:5173/admin/promo-codes`

### 3. Create a Code
Click "Add Promo Code" → Fill form → Save

---

## 📍 Admin Panel Access

**URL**: `http://localhost:5173/admin/promo-codes`

**Location in Admin Menu**: 
- Dashboard
- Products
- Categories
- Orders
- Customers
- **→ Promo Codes** ← HERE
- Wholesale
- Blog

---

## 🎫 Create Promo Code - Field Guide

| Field | Required | Example | Notes |
|-------|----------|---------|-------|
| **Code** | ✅ Yes | SAVE10 | Auto-uppercase, must be unique |
| **Discount Type** | ✅ Yes | Percentage / Fixed | Choose % or ₹ |
| **Discount Value** | ✅ Yes | 10 (for 10%) or 100 (for ₹100) | Must be > 0 |
| **Min Order Amount** | ❌ No | 500 | Leave 0 for no minimum |
| **Applicable Category** | ❌ No | Xtreme Kolorz | Leave empty for all categories |
| **Expiry Date** | ❌ No | 2024-12-31 | Leave empty for no expiry |
| **Max Uses** | ❌ No | 100 | Leave empty for unlimited |
| **Description** | ❌ No | Summer sale discount | For internal notes |
| **One-time per customer** | ❌ No | ☑️ | Check if each user can use only once |
| **Active** | ✅ Yes | ☑️ | Uncheck to disable without deleting |

---

## 💡 Common Promo Code Examples

### Example 1: Welcome Discount (10% off)
```
Code: WELCOME10
Type: Percentage
Value: 10
Min Order: 0
Category: (empty - all categories)
One-time: ☑️ (checked)
Active: ☑️
```

### Example 2: Bulk Order (₹100 off above ₹1000)
```
Code: BULK100
Type: Fixed
Value: 100
Min Order: 1000
Category: (empty)
One-time: ☐ (unchecked)
Active: ☑️
```

### Example 3: Category-Specific (20% off Xtreme Kolorz)
```
Code: KOLORZ20
Type: Percentage
Value: 20
Min Order: 0
Category: Xtreme Kolorz
One-time: ☐
Active: ☑️
```

### Example 4: Flash Sale (50% off, expires soon)
```
Code: FLASH50
Type: Percentage
Value: 50
Min Order: 0
Category: (empty)
Expires: 2024-03-31 23:59
Max Uses: 50
One-time: ☑️
Active: ☑️
```

---

## 👥 How Customers Use Promo Codes

### On Checkout Page:
1. Customer adds items to cart
2. Goes to checkout
3. Sees "Order Summary" on right side
4. Two ways to apply:
   - **Option A**: Manual entry
     - Type code in "Enter promo code" field
     - Click "Apply" button
   - **Option B**: One-click from list
     - Scroll to "Available Offers"
     - Click "Apply" on any eligible code

5. Discount appears immediately
6. Total price updates

### Visual Feedback:
- ✅ Green chip shows applied code
- ❌ Red error if code invalid
- 🔒 Gray lock on ineligible codes
- 💚 Green "saved" amount displayed

---

## 🔍 Admin Features

### Table View Shows:
- Code (with copy button)
- Discount amount
- Minimum order
- Category restriction
- Expiry date
- Usage limits
- Active/Inactive status

### Actions Available:
- **Edit** (pencil icon) - Modify code
- **Delete** (trash icon) - Remove code
- **Copy** (copy icon) - Copy code to clipboard
- **Toggle Status** - Click Active/Inactive badge

---

## ⚡ Quick Actions

### Disable a Code (Without Deleting)
1. Find code in table
2. Click the "Active" green badge
3. It changes to "Inactive" (red)
4. Users won't see it anymore

### Copy Code for Sharing
1. Find code in table
2. Click copy icon next to code
3. "Code copied!" toast appears
4. Paste in email/WhatsApp/etc.

### Edit Discount Amount
1. Click pencil (Edit) icon
2. Change "Discount Value"
3. Click "Save Promo Code"

---

## 🎨 Color-Coded Status

| Color | Meaning |
|-------|---------|
| 🟢 Green Badge | Active code |
| 🔴 Red Badge | Inactive code |
| 🟡 Yellow Badge | Category-specific |
| ⚫ Gray Text | Expired/unavailable |

---

## 🚨 Common Issues & Solutions

### Issue: Code not showing on checkout
**Solution**: Check if code is marked "Active" in admin panel

### Issue: "Invalid promo code" error
**Solutions**:
- Verify code is spelled correctly (case-insensitive)
- Check if code has expired
- Ensure minimum order amount is met
- Verify category matches (if category-specific)

### Issue: "Already used" error
**Solution**: Code is set to one-time use and user already used it

### Issue: Can't create duplicate code
**Solution**: Each code must be unique. Try SAVE10_V2 or NEWSAVE10

---

## 📊 Usage Tracking

### View How Many Times a Code Was Used:
Currently visible in the "Uses" column in admin table.

### Future Enhancement:
Could add detailed analytics showing:
- Total revenue from each code
- Number of unique users
- Average order value with code
- Peak usage times

---

## 🔐 Security Notes

- Only admins can create/edit/delete codes
- Codes are case-insensitive (auto-uppercase)
- One-time codes tracked per user ID
- Guest users can use codes but can't track one-time restriction
- All validations happen server-side (secure)

---

## 📱 Mobile Experience

- Fully responsive on all devices
- Easy to apply codes on mobile
- Touch-friendly buttons
- Scrollable code list

---

## 🎁 Marketing Ideas

### Email Campaigns
```
"Use code SAVE20 for 20% off your first order!"
```

### Social Media
```
"Flash Sale! 🔥
Code: FLASH50
50% OFF - Today Only!
Shop now: [link]"
```

### Cart Abandonment
```
"Still thinking? Here's 10% off!
Code: COMEBACK10"
```

### Seasonal
```
"Happy Diwali! 🪔
Code: DIWALI25
25% off sitewide"
```

---

## 🛠️ Developer Notes

### Service Functions (in `promoService.js`):
- `fetchAllCodes()` - Get all codes (admin)
- `fetchActiveCodes()` - Get active codes (users)
- `validatePromoCode()` - Check if code is valid
- `createPromoCode()` - Create new code
- `updatePromoCode()` - Update existing code
- `deletePromoCode()` - Delete code
- `recordPromoUse()` - Track usage

### Database Tables:
- `promo_codes` - Stores all codes
- `promo_code_uses` - Tracks when/who used codes

---

## ✅ Testing Checklist

- [ ] Can create promo code in admin
- [ ] Code shows in admin table
- [ ] Can edit code
- [ ] Can toggle active/inactive
- [ ] Can delete code
- [ ] Code appears on checkout page
- [ ] Can apply code manually
- [ ] Can apply code from list
- [ ] Discount calculates correctly
- [ ] Can remove applied code
- [ ] One-time codes work
- [ ] Category-specific codes work
- [ ] Min order amount works
- [ ] Expiry date works

---

**Need Help?** Check `PROMO-CODES-SETUP.md` for detailed documentation!
