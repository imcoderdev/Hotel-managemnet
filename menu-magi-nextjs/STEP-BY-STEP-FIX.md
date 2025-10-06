# 🎯 EXACT STEPS TO FIX ORDERS NOT SHOWING

## ⚠️ DON'T RUN ALL SQL FILES - FOLLOW THIS ORDER!

### Step 1: Diagnose the Problem (OPTIONAL - Just to see what's wrong)
**File:** `diagnose-order-visibility.sql`
**Purpose:** Check what's wrong (you can skip this if you want to just fix it)

```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of diagnose-order-visibility.sql
4. Paste and click "Run"
5. Look at results - it will show you what's missing
```

---

### Step 2: Fix Everything (REQUIRED - DO THIS!)
**File:** `COMPLETE-RLS-FIX.sql`
**Purpose:** This fixes EVERYTHING in one go

```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of COMPLETE-RLS-FIX.sql
4. Paste and click "Run"
5. Wait for success message
```

**This file fixes:**
- ✅ Storage RLS (image uploads)
- ✅ Orders RLS (orders visibility)
- ✅ Creates all missing policies
- ✅ Enables RLS properly

---

### Step 3: Verify It Worked
After running `COMPLETE-RLS-FIX.sql`:

1. **Refresh your owner dashboard**
2. **Click on "Orders" tab**
3. **You should see:**
   - Order #f0db17 (Table 10, ₹105.00) ✅
   - Any other orders customers placed ✅

---

## 🚨 IMPORTANT: Only Run These 2 Files

### ✅ Files to RUN in Supabase SQL Editor:
1. `COMPLETE-RLS-FIX.sql` - **REQUIRED** (fixes everything)
2. `diagnose-order-visibility.sql` - **OPTIONAL** (just for checking)

### ❌ Files to NOT run (they're old/redundant):
- ~~`fix-orders-rls.sql`~~ (superseded by COMPLETE-RLS-FIX.sql)
- ~~`fix-storage-rls.sql`~~ (superseded by COMPLETE-RLS-FIX.sql)

---

## 🎯 QUICK ACTION (Just Do This!)

**If you just want it fixed NOW:**

1. Open: https://supabase.com/dashboard
2. Select your project
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Open file: `COMPLETE-RLS-FIX.sql`
6. **Copy ALL contents** (Ctrl+A, Ctrl+C)
7. **Paste in Supabase** (Ctrl+V)
8. Click: **Run** (or press Ctrl+Enter)
9. Wait for green success message ✅
10. **Refresh your app** in browser
11. **Go to Orders page** - orders should appear! 🎉

---

## 🔍 If Orders Still Don't Show After Running SQL:

### Check 1: Did the SQL script succeed?
Look for this in Supabase:
```
✅ INSERT 0 1 (bucket created)
✅ CREATE POLICY (should see multiple times)
✅ ALTER TABLE (RLS enabled)
```

### Check 2: Are you logged in as the owner?
```
1. Check your email in profile
2. Must be same email used when creating restaurant
```

### Check 3: Does the order have the correct owner_id?
Run this in Supabase SQL Editor:
```sql
SELECT id, order_number, owner_id, total, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;
```

Compare `owner_id` with your user ID:
```sql
SELECT id, email FROM auth.users;
```

They should match!

---

## ✅ SUCCESS CHECKLIST

After running `COMPLETE-RLS-FIX.sql`:

- [ ] SQL script ran without errors
- [ ] Saw "CREATE POLICY" messages (multiple)
- [ ] Saw "ALTER TABLE" success
- [ ] Refreshed browser
- [ ] Logged in as owner
- [ ] Clicked "Orders" tab
- [ ] See Order #f0db17 in list
- [ ] Can mark order as paid
- [ ] Can upload images (storage also fixed)

---

## 💡 TL;DR

**Just run `COMPLETE-RLS-FIX.sql` in Supabase SQL Editor and refresh your app. That's it!**

All your orders will appear. 🎉
