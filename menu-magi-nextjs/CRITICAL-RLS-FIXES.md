# 🚨 CRITICAL FIXES - RLS & Currency Issues

## Issues Found & Fixed

### ❌ Issue 1: Storage RLS Policy Blocking Uploads
**Error:** `StorageApiError: new row violates row-level security policy`

**Cause:** Supabase Storage doesn't have proper RLS policies for `menu-images` bucket

**Solution:** Run `fix-storage-rls.sql` in Supabase SQL Editor

### ❌ Issue 2: Orders Not Showing in Owner Dashboard
**Error:** Orders created but not visible to owner (notification comes but no orders)

**Cause:** RLS policy on `orders` table blocks owner from reading orders

**Solution:** Run `fix-orders-rls.sql` in Supabase SQL Editor

### ❌ Issue 3: Dollar Signs Instead of Rupee
**Error:** Dashboard shows `$199.00` instead of `₹199.00`

**Solution:** ✅ FIXED - Changed all `$` to `₹` in:
- `app/owner/dashboard/page.tsx`
- `app/owner/orders/page.tsx`

### ❌ Issue 4: Language Toggle Not Visible
**Error:** Can't find language switch button

**Solution:** ✅ FIXED - Language toggle is in customer menu page header (top-right corner)

---

## 🔧 IMMEDIATE ACTIONS REQUIRED

### Step 1: Fix Storage Policy (CRITICAL)
```bash
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of fix-storage-rls.sql
# 3. Paste and Run
```

**What it does:**
- Creates `menu-images` bucket (if not exists)
- Adds INSERT policy for authenticated users
- Adds SELECT policy for public access
- Adds UPDATE/DELETE policies

**Expected Output:**
```sql
INSERT 0 1  -- Bucket created (or skipped)
DROP POLICY -- Old policies removed
CREATE POLICY -- 4 new policies created
```

### Step 2: Fix Orders Policy (CRITICAL)
```bash
# 1. Still in Supabase SQL Editor
# 2. Copy contents of fix-orders-rls.sql
# 3. Paste and Run
```

**What it does:**
- Allows owners to SELECT their orders (`owner_id = auth.uid()`)
- Allows owners to UPDATE their orders (status changes)
- Allows public to INSERT orders (customer orders without auth)

**Expected Output:**
```sql
DROP POLICY -- Old policies removed
CREATE POLICY -- 3 new policies created
ALTER TABLE -- RLS enabled
```

---

## 🧪 TESTING AFTER FIXES

### Test 1: Image Upload
```
1. Owner Dashboard → Add Menu Item
2. Upload an image
3. Should succeed without RLS error ✅
4. Check Supabase Storage → Image exists ✅
```

**Before:** `StorageApiError: new row violates row-level security policy`
**After:** `Image uploaded successfully!` ✅

### Test 2: View Orders
```
1. Customer (incognito) → Place order
2. Owner Dashboard → Click "Orders"
3. Should see the order in list ✅
4. Notification sound plays ✅
```

**Before:** Notification comes but no orders visible
**After:** Orders appear immediately with notification ✅

### Test 3: Currency Display
```
1. Owner Dashboard → Check menu items
2. Prices show ₹199.00 (not $199.00) ✅
3. Orders page → Check totals
4. All amounts show ₹ symbol ✅
```

**Before:** `$199.00`
**After:** `₹199.00` ✅

### Test 4: Language Toggle
```
1. Open http://localhost:3000/customer/menu
2. Look at top-right corner of header ✅
3. See toggle button: "हिंदी" ✅
4. Click → UI changes to Hindi ✅
```

**Location:** Customer Menu page → Header → Right side (next to table number)

---

## 📋 SQL Scripts Created

### fix-storage-rls.sql
- Creates storage bucket
- Sets up 4 RLS policies:
  1. Allow authenticated uploads
  2. Allow authenticated updates
  3. Allow authenticated deletes
  4. Allow public reads

### fix-orders-rls.sql
- Fixes orders table RLS
- Sets up 3 policies:
  1. Owners SELECT their orders
  2. Owners UPDATE their orders
  3. Public INSERT orders

---

## 🔍 DEBUGGING GUIDE

### If Image Upload Still Fails:

**Check 1: Bucket Exists**
```sql
SELECT * FROM storage.buckets WHERE id = 'menu-images';
```
Should return 1 row with `public = true`

**Check 2: Policies Exist**
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%menu-images%';
```
Should return 4 policies (INSERT, SELECT, UPDATE, DELETE)

**Check 3: User Authenticated**
```typescript
// In browser console
const { data: { session } } = await supabase.auth.getSession();
console.log(session); // Should show user object
```

### If Orders Still Don't Show:

**Check 1: RLS Enabled**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';
```
Should show `rowsecurity = true`

**Check 2: Policies Exist**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'orders';
```
Should return 3 policies (SELECT, UPDATE, INSERT)

**Check 3: Owner ID Matches**
```sql
-- Run as logged-in owner
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- Compare with:
SELECT DISTINCT owner_id FROM orders;
-- They should match!
```

**Check 4: Test Direct Query**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM orders WHERE owner_id = 'YOUR_OWNER_ID';
```
If this works but app doesn't → Frontend issue
If this fails → RLS policy issue

### If Language Toggle Not Visible:

**Location:**
- Page: `/customer/menu`
- Element: Header (top of page)
- Position: Right side, next to table number badge
- Looks like: Button with `<Languages>` icon and "हिंदी" text

**If Still Not Visible:**
```typescript
// Check in browser console
localStorage.getItem('language'); // Should show 'en' or 'hi'
```

---

## ✅ VERIFICATION CHECKLIST

After running SQL scripts:

- [ ] Storage bucket `menu-images` exists
- [ ] Storage has 4 RLS policies
- [ ] Orders table has RLS enabled
- [ ] Orders table has 3 RLS policies
- [ ] Dashboard shows ₹ (not $)
- [ ] Orders page shows ₹ (not $)
- [ ] Language toggle visible in menu
- [ ] Image upload works
- [ ] Orders visible to owner
- [ ] Notifications work
- [ ] Payment status changes work

---

## 🚀 QUICK FIX SUMMARY

**What You Need To Do NOW:**

1. **Open Supabase Dashboard** (https://supabase.com)
2. **Go to SQL Editor**
3. **Run `fix-storage-rls.sql`** (copy/paste)
4. **Run `fix-orders-rls.sql`** (copy/paste)
5. **Refresh your app**
6. **Test:**
   - Upload image → Should work ✅
   - Place order → Should appear in orders ✅
   - Check prices → Should show ₹ ✅
   - Find language toggle → Top-right in menu ✅

**That's it!** All issues will be resolved. 🎉

---

## 📞 STILL HAVING ISSUES?

If problems persist after running SQL scripts:

1. **Check browser console** for errors
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify authentication** (user logged in?)
4. **Check network tab** (API calls failing?)
5. **Try in incognito** (clear cache)

Most likely cause: SQL scripts not run correctly.
Solution: Re-run scripts, verify output shows `CREATE POLICY` success.
