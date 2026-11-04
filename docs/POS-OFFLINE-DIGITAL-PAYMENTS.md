# POS Offline Digital Payments Guide

## How Offline UPI/Card Payments Work

When your internet connection is down, the POS system now handles UPI and Card payments differently than when online.

## Payment Behavior

### When ONLINE ✅
**UPI/Card Payments:**
1. Customer selects UPI or Card
2. Clicks "Complete & Print"
3. Razorpay payment gateway opens
4. Customer completes payment
5. Payment verified instantly
6. Receipt prints with confirmation
7. Sale marked as "PAID"

### When OFFLINE 📵
**UPI/Card Payments:**
1. Customer selects UPI or Card
2. Clicks "Complete & Print"
3. **System detects offline mode**
4. Payment recorded as "PENDING VERIFICATION"
5. Receipt prints with warning notice
6. Sale saved to local database
7. Will sync when internet returns

**Cash Payments:**
- Work the same online or offline
- No Razorpay needed
- Recorded immediately

## Offline Payment Flow

```
┌─────────────────────────────────┐
│  Customer wants to pay via UPI  │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────┐
    │  Check Online  │
    │     Status     │
    └────────┬───────┘
             │
      ┌──────┴───────┐
      │              │
      ▼              ▼
  ONLINE         OFFLINE
      │              │
      │              ▼
      │    ┌──────────────────┐
      │    │  Record payment  │
      │    │   as PENDING     │
      │    └────────┬─────────┘
      │             │
      ▼             ▼
┌─────────────────────────┐
│   Print Receipt         │
│  (Shows status)         │
└─────────────────────────┘
```

## Receipt Differences

### Online Payment Receipt
```
═══════════════════════════
      KUSTOM KOATS
   Point of Sale Receipt
   15 Jan 2025, 2:30 PM
═══════════════════════════
Customer: John Doe
Phone: 9876543210
───────────────────────────
Item         Qty  Rate  Amount
Product A     2   ₹500  ₹1,000
───────────────────────────
TOTAL:               ₹1,000
Payment Method:         UPI
═══════════════════════════
Thank you for your purchase!
Visit us online at:
kustomkoats.in
═══════════════════════════
```

### Offline Payment Receipt
```
═══════════════════════════
      KUSTOM KOATS
   Point of Sale Receipt
   15 Jan 2025, 2:30 PM
═══════════════════════════
Customer: John Doe
Phone: 9876543210
───────────────────────────
Item         Qty  Rate  Amount
Product A     2   ₹500  ₹1,000
───────────────────────────
TOTAL:               ₹1,000
Payment Method:         UPI
Status:    PENDING VERIFICATION
───────────────────────────
⚠ Offline Payment Notice
This payment will be verified
when internet connection
is restored.
═══════════════════════════
Thank you for your purchase!
Visit us online at:
kustomkoats.in
═══════════════════════════
```

## What Happens When Internet Returns

### Auto-Sync Process
1. **System detects internet is back**
2. **Every 30 seconds** automatic sync runs
3. Pending offline sales are uploaded
4. Stock levels synchronized
5. **You see notification:** "Synced X offline sales"

### Manual Sync
- Yellow badge shows pending count
- Click the badge to sync manually
- All pending sales upload immediately

## Important Notes for Shop Staff

### ⚠ When Taking Offline Digital Payments

1. **Verify Payment Externally**
   - Customer should show payment confirmation on their phone
   - Take screenshot or note transaction ID
   - Write reference number on receipt copy

2. **Customer Communication**
   - Explain payment is recorded offline
   - Show them the "PENDING VERIFICATION" on receipt
   - Assure them it will be verified when system comes back online

3. **Keep Receipt Copies**
   - Important for offline digital payments
   - Helps reconcile when internet returns
   - Match with bank statements later

### ✅ Best Practices

**For Cash Payments:**
- Use offline or online - no difference
- Always works perfectly

**For UPI/Card When Online:**
- Use Razorpay payment gateway
- Instant verification
- Most secure option

**For UPI/Card When Offline:**
- Use only if customer insists
- Verify payment on their device
- Keep detailed records
- Sync as soon as internet returns

## Reconciliation Workflow

### Daily Closing (With Offline Payments)

1. **Check Pending Count**
   - Look for yellow badge in POS header
   - Shows number of unsynced sales

2. **Ensure Internet Connection**
   - Connect to WiFi/mobile data
   - Wait for "Online" indicator

3. **Manual Sync**
   - Click "X Pending" button
   - Wait for "Synced X offline sales" message

4. **Verify in Database**
   - Check admin orders page
   - Confirm all sales are recorded
   - Match with physical receipts

5. **Bank Reconciliation**
   - Match Razorpay dashboard for online payments
   - For offline UPI/Card - match with bank statements
   - Verify amounts and customer details

## Troubleshooting

### Problem: Offline payment not syncing
**Solution:**
1. Check internet connection (look for green "Online" badge)
2. Click "Sync" button manually
3. Refresh the page
4. Check browser console for errors

### Problem: Customer didn't actually pay (offline payment)
**Solution:**
1. This is why verification is important!
2. Keep receipt copies for offline payments
3. Always ask to see payment confirmation
4. Cancel/refund in admin panel if needed

### Problem: Stock shows incorrect after offline sales
**Solution:**
1. Stock updates locally when offline
2. Syncs to server when online
3. Refresh products to see current stock
4. Manual stock adjustment in admin if needed

## System Indicators

### Online Status Badge
- 🟢 **Green "Online"** - All features work, Razorpay available
- 🔴 **Red "Offline"** - Limited features, cash preferred

### Pending Sales Badge
- 🟡 **Yellow "X Pending"** - Unsynced offline sales
- Click to sync manually
- Shows count of pending sales

### Sync Status
- ⚙️ **Syncing...** - Upload in progress
- ✅ **"Synced X sales"** - Successfully uploaded
- ❌ **"Sync failed"** - Check connection

## Summary

| Payment Method | Online | Offline |
|---------------|---------|---------|
| **Cash** | ✅ Direct | ✅ Direct |
| **UPI** | ✅ Razorpay Gateway | ⚠️ Pending Verification |
| **Card** | ✅ Razorpay Gateway | ⚠️ Pending Verification |

### Key Takeaways

✅ **Cash is always safe** - Works perfectly online or offline
✅ **Online UPI/Card** - Use Razorpay for instant verification
⚠️ **Offline UPI/Card** - Requires manual verification, use with caution
🔄 **Auto-sync** - Runs every 30 seconds when online
📊 **Reconciliation** - Always verify offline digital payments

## Quick Reference

**Prefer:**
1. Cash (always works)
2. Online UPI/Card (verified instantly)

**Use Carefully:**
3. Offline UPI/Card (pending verification)

**Always:**
- Verify customer payment on their device for offline digital payments
- Keep receipt copies for offline transactions
- Sync as soon as internet returns
- Reconcile daily with bank statements
