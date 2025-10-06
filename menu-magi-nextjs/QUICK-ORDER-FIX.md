# 🎯 QUICK FIX GUIDE: Orders Not Showing

## Problem
❌ Customer places order → Owner doesn't see it in Orders page

## Solution
✅ Fixed `ownerId` not being set properly in customer flow

---

## 🔄 What Changed

### Before (Broken):
```
Customer scans QR → restaurantId stored
Customer picks table → tableNumber stored  
Menu loads → ownerId NOT set (menu empty)
Checkout → FAILS (no ownerId)
Order → NOT created or created with null owner_id
Owner → Can't see order
```

### After (Fixed):
```
Customer scans QR → restaurantId stored
Customer picks table → tableNumber stored
Menu loads → ownerId = restaurantId ✅
Checkout → order created with ownerId ✅
Owner → Sees order immediately ✅
```

---

## 🧪 Test Now (2 minutes)

### Step 1: Owner Setup
```
1. Login → http://localhost:3000/owner/login
2. Dashboard → Click "QR Code"  
3. Copy URL (http://localhost:3000/customer/table?restaurant=abc123)
```

### Step 2: Customer Order (Incognito)
```
1. Open incognito window
2. Paste QR URL
3. Select table → Add items → Checkout
4. Click "Confirm & Pay"
```

### Step 3: Verify Owner Sees It
```
1. Go back to owner browser
2. Click "Orders" in header
3. ✅ You should see the order!
```

---

## 🔍 Console Logs (What to Look For)

### Success Logs:

**Menu Page:**
```
✅ Set ownerId from restaurantId: abc123xyz
```

**Checkout:**
```
✅ Checkout initialized with ownerId: abc123xyz
✅ Order created successfully!
```

**Owner Orders:**
```
✅ Loaded orders: 1 orders
```

### Error Logs (If Broken):

```
❌ No ownerId or restaurantId found!
❌ Missing: restaurant ID
❌ Error loading orders
```

---

## 📁 Files Updated

- ✅ `app/customer/menu/page.tsx`
- ✅ `app/customer/checkout/page.tsx`  
- ✅ `app/owner/orders/page.tsx`

---

## ⚠️ Still Not Working?

### Quick Checks:

1. **Clear cache & restart:**
   ```powershell
   cd "d:\hotel management\menu-magi-nextjs"
   rm -r .next
   npm run dev
   ```

2. **Check database:**
   - Does `orders` table have `owner_id` column?
   - Run `quick-fix-gst-columns.sql` if GST errors

3. **Check console:**
   - Compare `ownerId` in customer vs `session.user.id` in owner
   - Should be EXACTLY the same

---

## ✅ Done!

**Refresh both pages and test again. Orders should now show up!** 🎉

See `ORDER-NOT-SHOWING-FIX.md` for detailed technical explanation.
