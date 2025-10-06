# 🔥 EMERGENCY FIX: Orders Not Showing Despite Notifications

## Problem
- ✅ Order placed successfully (you saw confirmation page)
- ✅ Notification received in owner dashboard
- ❌ Order NOT visible in orders list
- ❌ Realtime subscription works, but query fails

## Root Cause
**The RLS (Row-Level Security) policy on the `orders` table is blocking the SELECT query.**

Even though:
- The order was created (INSERT worked because of `WITH CHECK (true)`)
- Notification triggered (realtime subscription sees the INSERT)
- Owner is authenticated

The owner CANNOT SELECT/read the orders because there's no policy allowing it.

---

## 🚨 IMMEDIATE FIX (3 Steps)

### Step 1: Run Diagnostic Script
```bash
# 1. Open Supabase Dashboard: https://supabase.com/dashboard
# 2. Select your project
# 3. Go to SQL Editor
# 4. Copy and paste: diagnose-order-visibility.sql
# 5. Click RUN
```

**What to look for:**
- Step 1: Is RLS enabled? (should be ✅)
- Step 2: How many policies exist? (should be 3 after fix)
- Step 4: Do orders exist in database? (should show your order #f0db17)
- Step 5: Does owner_id match an auth user? (CRITICAL!)

### Step 2: Run Complete Fix
```bash
# Still in Supabase SQL Editor
# 1. Copy and paste: COMPLETE-RLS-FIX.sql
# 2. Click RUN (this runs ALL fixes at once)
```

**Expected output:**
```sql
ALTER TABLE         -- RLS enabled
DROP POLICY         -- Old policies removed (multiple)
CREATE POLICY       -- 3 new policies created (orders)
CREATE POLICY       -- 4 new policies created (storage)
✅ orders table RLS: ENABLED
✅ orders policies: CORRECT (3 policies)
✅ storage policies: CORRECT (4+ policies)
```

### Step 3: Refresh & Test
```bash
# 1. Go to owner dashboard: http://localhost:3000/owner/dashboard
# 2. Click "Orders" in sidebar
# 3. You should now see the order!
```

---

## 🔍 Why This Happens

### The RLS Problem
Supabase uses Row-Level Security to protect data. By default, when RLS is enabled, **NO ONE can read anything** unless there's an explicit policy.

Your current situation:
```sql
-- ✅ This works (customers can INSERT)
CREATE POLICY "Allow order creation"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- ❌ This is MISSING (owners can't SELECT)
-- That's why orders don't show up!
```

### The Fix
```sql
-- ✅ This allows owners to SELECT their orders
CREATE POLICY "Owners can view their orders"
ON orders FOR SELECT
TO authenticated
USING (owner_id = auth.uid());
```

**The magic:** `owner_id = auth.uid()`
- `auth.uid()` = currently logged-in user ID
- `owner_id` = the owner who owns this order
- Policy: "Only show orders where owner_id matches logged-in user"

---

## 🧪 Detailed Testing Steps

### Test 1: Verify Policies Are Applied
```sql
-- Run in Supabase SQL Editor
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'orders';
```

**Expected result:**
| policyname | cmd | roles |
|------------|-----|-------|
| Owners can view their orders | SELECT | authenticated |
| Owners can update their orders | UPDATE | authenticated |
| Allow order creation | INSERT | public |

### Test 2: Test as Admin (Bypass RLS)
```sql
-- Run in Supabase SQL Editor
SELECT id, table_number, total, owner_id, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

**Should show:**
- Order #f0db17
- Table 10
- Total 105.00
- owner_id (some UUID)
- created_at (recent timestamp)

### Test 3: Test as Owner (Simulates App)
```sql
-- Run in Supabase SQL Editor WHILE LOGGED IN AS OWNER
SELECT * FROM orders WHERE owner_id = auth.uid();
```

**Should show:**
- Same order as Test 2
- If EMPTY → owner_id mismatch! (see Troubleshooting)

### Test 4: Test in App
```bash
# 1. Open browser console (F12)
# 2. Navigate to: http://localhost:3000/owner/orders
# 3. Check console logs
```

**Expected logs:**
```
🔍 Loading orders for owner: <your-user-id>
✅ Loaded orders: 1 orders
```

**If you see:**
```
🔍 Loading orders for owner: <your-user-id>
❌ Error loading orders: <some RLS error>
```
→ Policies not applied correctly, re-run COMPLETE-RLS-FIX.sql

---

## ❌ Troubleshooting

### Issue 1: Still No Orders After Running Script

**Possible causes:**
1. **Script didn't run completely**
   - Re-run COMPLETE-RLS-FIX.sql
   - Check for errors in SQL Editor output
   
2. **Owner ID mismatch**
   ```sql
   -- Check logged-in user ID
   SELECT auth.uid();
   
   -- Check owner_id in orders
   SELECT DISTINCT owner_id FROM orders;
   
   -- They should MATCH!
   ```

3. **Not logged in as owner**
   - Logout and login again
   - Clear browser cache
   - Check session: `supabase.auth.getSession()`

### Issue 2: Error "permission denied for table orders"

**Solution:**
```sql
-- RLS not enabled or policies missing
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Then re-run COMPLETE-RLS-FIX.sql
```

### Issue 3: Orders Show for Admin but Not in App

**Cause:** Frontend query has wrong filter

**Check:** `app/owner/orders/page.tsx` line 159
```typescript
.eq('owner_id', session.user.id)
```

**Should be filtering by logged-in user ID**

**Debug:**
```typescript
// Add this in loadOrders() function
console.log('Current user:', session.user.id);
console.log('Query filter:', { owner_id: session.user.id });

const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('owner_id', session.user.id);

console.log('Query result:', { data, error });
```

### Issue 4: Wrong owner_id Saved in Order

**Symptoms:**
- Orders exist in database
- owner_id is different from logged-in user
- This happens if QR code has wrong restaurant ID

**Fix:**
1. Check QR code generation:
   ```typescript
   // Should be in QR code URL
   ?restaurantId=<owner-user-id>
   ```

2. Check sessionStorage in customer flow:
   ```javascript
   // Browser console on menu page
   console.log('ownerId:', sessionStorage.getItem('ownerId'));
   console.log('restaurantId:', sessionStorage.getItem('restaurantId'));
   ```

3. Manually update order (temporary fix):
   ```sql
   -- Get your user ID
   SELECT id FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Update order owner_id
   UPDATE orders 
   SET owner_id = '<your-user-id-from-above>'
   WHERE id = '784a8123-d230-4443-b457-16d54ef0db17';
   ```

---

## 📊 Understanding the Flow

### Customer Places Order
```
1. Customer scans QR → restaurantId stored
2. Customer browses menu → adds items to cart
3. Customer checks out → creates order with owner_id
4. Order INSERT → RLS allows (public policy)
5. Realtime trigger → notification sent
```

### Owner Views Orders
```
1. Owner logs in → session.user.id = owner UUID
2. Owner clicks Orders → loadOrders() runs
3. Query: SELECT * FROM orders WHERE owner_id = auth.uid()
4. RLS checks policy → "Owners can view their orders"
5. Policy USING clause → owner_id = auth.uid()
6. If match → return rows ✅
7. If no match → return empty []
```

**The problem:** Step 6 returns empty because policy doesn't exist!

---

## ✅ Success Checklist

After running fixes, verify:

- [ ] Run `diagnose-order-visibility.sql` → see orders in Step 4
- [ ] Run `COMPLETE-RLS-FIX.sql` → all ✅ in verification
- [ ] Refresh owner dashboard → notification sound plays
- [ ] Click Orders → see order #f0db17 in list
- [ ] Order shows Table 10, ₹105.00
- [ ] Can click "Mark as Paid"
- [ ] Upload image in dashboard → no RLS error
- [ ] Place new order → appears immediately in orders list

---

## 🎯 Next Steps After Fix

Once orders are visible:

1. **Test complete order flow:**
   - Customer places order
   - Owner sees notification
   - Owner accepts order
   - Owner marks as preparing
   - Owner marks as completed
   - Owner marks as paid

2. **Test payment status:**
   - New orders show "Pending" badge
   - Click "Mark as Paid" → badge changes to "Paid"

3. **Test image upload:**
   - Dashboard → Add menu item
   - Upload image → should work without error
   - Image appears in menu

4. **Test language toggle:**
   - Customer menu → top-right corner
   - Click toggle → UI changes to Hindi
   - Refresh page → language persists

---

## 🆘 Still Not Working?

Run this comprehensive diagnostic:

```sql
-- Copy/paste this ENTIRE block into Supabase SQL Editor

-- 1. Check your user ID
SELECT 
  'My User ID' as info,
  auth.uid() as value;

-- 2. Check orders owner_id
SELECT 
  'Order Owner IDs' as info,
  DISTINCT owner_id as value
FROM orders;

-- 3. Check if they match
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM orders WHERE owner_id = auth.uid()
    ) THEN '✅ MATCH - Orders found for your user'
    ELSE '❌ MISMATCH - No orders for your user'
  END as status;

-- 4. Show all orders with ownership info
SELECT 
  o.id,
  o.table_number,
  o.total,
  o.owner_id,
  o.created_at,
  u.email as owner_email,
  CASE 
    WHEN o.owner_id = auth.uid() THEN '✅ YOUR ORDER'
    ELSE '❌ NOT YOUR ORDER'
  END as ownership
FROM orders o
LEFT JOIN auth.users u ON o.owner_id = u.id
ORDER BY o.created_at DESC;
```

**Send me the output** and I'll help debug further!
