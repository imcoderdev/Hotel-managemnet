# 🔧 FIX: Orders Not Showing in Owner Dashboard

## 🐛 Problem
After customer clicks "Confirm & Pay", the order is not appearing in the owner's orders page.

## 🔍 Root Cause Analysis

The issue was in the **customer order flow**:

1. **QR Code** contains: `?restaurant=OWNER_ID`
2. **Table Select Page** stores it as `restaurantId` in sessionStorage
3. **Menu Page** was supposed to save `ownerId` from menu items, BUT:
   - If no menu items exist, `ownerId` is never set
   - If menu query fails, `ownerId` is never set
4. **Checkout Page** requires `ownerId` to create the order
5. **Without `ownerId`**, the order can't be created OR it's created with `null` owner_id

## ✅ Fixes Applied

### Fix 1: Menu Page - Set ownerId Earlier
**File:** `app/customer/menu/page.tsx`

**Before:**
```typescript
// Only set ownerId AFTER loading menu items
if (data && data.length > 0 && data[0].owner_id) {
  sessionStorage.setItem('ownerId', data[0].owner_id);
}
```

**After:**
```typescript
// ✅ Set ownerId IMMEDIATELY if available from restaurantId
if (ownerId) {
  sessionStorage.setItem('ownerId', ownerId);
  console.log('✅ Set ownerId from restaurantId:', ownerId);
}

// Then load menu...

// ✅ Also store from menu items as fallback
if (!ownerId && data && data.length > 0 && data[0].owner_id) {
  sessionStorage.setItem('ownerId', data[0].owner_id);
  console.log('✅ Set ownerId from menu items:', data[0].owner_id);
}
```

### Fix 2: Checkout Page - Use restaurantId as Fallback
**File:** `app/customer/checkout/page.tsx`

**Before:**
```typescript
const storedOwnerId = sessionStorage.getItem('ownerId');
setOwnerId(storedOwnerId);
```

**After:**
```typescript
const storedOwnerId = sessionStorage.getItem('ownerId');
const storedRestaurantId = sessionStorage.getItem('restaurantId');

// ✅ Use restaurantId as fallback if ownerId is missing
const finalOwnerId = storedOwnerId || storedRestaurantId;

if (!finalOwnerId) {
  console.error('❌ No ownerId or restaurantId found!');
  toast.error('Restaurant information missing. Please scan QR code again.');
  router.push('/customer/table');
  return;
}

setOwnerId(finalOwnerId);
```

### Fix 3: Better Error Messages
**File:** `app/customer/checkout/page.tsx`

**Before:**
```typescript
if (!tableNumber || !ownerId) {
  toast.error('Missing order information');
  return;
}
```

**After:**
```typescript
if (!tableNumber || !ownerId) {
  const missingInfo = [];
  if (!tableNumber) missingInfo.push('table number');
  if (!ownerId) missingInfo.push('restaurant ID');
  
  console.error('❌ Missing:', { tableNumber, ownerId });
  toast.error(`Missing: ${missingInfo.join(', ')}. Please start from table selection.`);
  return;
}
```

### Fix 4: Owner Orders Page - Better Debugging
**File:** `app/owner/orders/page.tsx`

Added console logs to track:
- Owner ID being queried
- Number of orders loaded
- Orders data

## 🧪 Testing Instructions

### Step 1: Owner Login
1. Open http://localhost:3000/owner/login
2. Login as owner
3. Open browser console (F12)
4. Note the owner ID in logs

### Step 2: Get QR Code
1. Go to owner dashboard
2. Click "QR Code" button
3. You should see QR code with URL like:
   ```
   http://localhost:3000/customer/table?restaurant=abc123xyz
   ```
4. Copy that URL (or use manual table selection)

### Step 3: Customer Order Flow
1. Open NEW incognito window (important!)
2. Paste the QR code URL
3. **Check console logs** - should see:
   ```
   ✅ Set ownerId from restaurantId: abc123xyz
   ```
4. Select a table
5. Add items to cart
6. Go to checkout
7. **Check console logs** - should see:
   ```
   🔍 Checkout - sessionStorage values: {
     tableNumber: "5",
     cartItems: 3,
     ownerId: "abc123xyz",
     restaurantId: "abc123xyz"
   }
   ✅ Checkout initialized with ownerId: abc123xyz
   ```
8. Click "Confirm & Pay"
9. **Check console logs** - should see:
   ```
   ✅ Starting order creation with: {
     tableNumber: 5,
     ownerId: "abc123xyz",
     itemCount: 3
   }
   🔍 Order payload: {...}
   ✅ Order created successfully!
   ```

### Step 4: Check Owner Orders Page
1. Go back to owner's browser
2. Navigate to Orders page
3. **Check console logs** - should see:
   ```
   🔍 Loading orders for owner: abc123xyz
   ✅ Loaded orders: 1 orders
   📋 Orders data: [...]
   ```
4. **You should now see the order!**

## 🚨 If Orders Still Don't Show

### Check 1: Owner ID Mismatch
Open browser console and compare:
- Customer order creation: `ownerId: "abc123"`
- Owner orders query: `owner: "xyz456"`

If they don't match, the owner_id is being set incorrectly.

### Check 2: Database RLS Policies
Run in Supabase SQL Editor:
```sql
-- Check if orders were created
SELECT id, owner_id, table_number, status, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'orders';
```

### Check 3: Order Creation Failing Silently
In customer checkout, look for error logs:
```
❌ Order error detected!
❌ Full error: {...}
```

Common errors:
- `column "gst_amount" does not exist` → Run `quick-fix-gst-columns.sql`
- `violates check constraint` → Check payment_status value
- `null value in column "owner_id"` → ownerId is still not being set

## 📊 Debug Checklist

Run through this checklist:

### Customer Side:
- [ ] QR code URL contains `?restaurant=OWNER_ID`
- [ ] Table select page stores `restaurantId` in sessionStorage
- [ ] Menu page sets `ownerId` from `restaurantId`
- [ ] Checkout receives valid `ownerId`
- [ ] Order payload includes `owner_id: "abc123..."`
- [ ] Order creation succeeds (check console)

### Owner Side:
- [ ] Owner is logged in
- [ ] Owner session.user.id matches the customer's ownerId
- [ ] Orders page queries with correct owner_id
- [ ] Orders are returned from database
- [ ] Orders are displayed in UI

### Database:
- [ ] GST columns exist (gst_amount, cgst, sgst)
- [ ] payment_status accepts 'paid' value
- [ ] RLS policies allow owner to read their own orders
- [ ] Orders table has owner_id column

## 🎯 Expected Flow (Success Case)

```
1. Owner generates QR code with ?restaurant=OWNER_123
2. Customer scans → Table select page
3. sessionStorage: restaurantId = "OWNER_123"
4. Customer selects table 5
5. sessionStorage: tableNumber = "5"
6. Menu page loads
7. sessionStorage: ownerId = "OWNER_123" (from restaurantId)
8. Customer adds items, goes to checkout
9. Checkout creates order with owner_id = "OWNER_123"
10. Owner's orders page queries for owner_id = "OWNER_123"
11. Order appears in owner dashboard! ✅
```

## 🔄 If Still Broken

If orders still don't show after all fixes:

1. **Clear all caches:**
   ```powershell
   # Stop dev server
   # Then:
   cd "d:\hotel management\menu-magi-nextjs"
   rm -r .next
   npm run dev
   ```

2. **Test with console logs:**
   - Customer side: Check every step logs ownerId correctly
   - Owner side: Check orders query returns data

3. **Database direct check:**
   ```sql
   -- See what owner_id values exist in orders
   SELECT DISTINCT owner_id FROM orders;
   
   -- See owner IDs in owners table
   SELECT id, restaurant_name FROM owners;
   
   -- Do they match?
   ```

4. **RLS Policy Fix:**
   If RLS policies are blocking:
   ```sql
   -- Temporarily disable RLS to test
   ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
   
   -- Then try again
   -- If it works, the problem is RLS policies
   
   -- Re-enable after testing
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ```

## ✅ Success Criteria

You'll know it's fixed when:

1. ✅ Customer places order successfully
2. ✅ Console shows: "✅ Order created successfully!"
3. ✅ Owner's orders page shows: "1 active orders"
4. ✅ Order card appears with correct table number
5. ✅ Order has "⏳ Waiting" status
6. ✅ "Accept Order" button is clickable

## 📝 Changes Summary

**Files Modified:**
1. `app/customer/menu/page.tsx` - Set ownerId earlier
2. `app/customer/checkout/page.tsx` - Fallback to restaurantId, better errors
3. `app/owner/orders/page.tsx` - Added debugging logs

**No database changes needed** - This was purely a frontend state management issue!
