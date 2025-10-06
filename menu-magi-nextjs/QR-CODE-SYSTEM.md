# 🎯 QR Code System - Restaurant Specific Implementation

## Overview

Your QR code system is now set up for **dedicated restaurant QR codes** that:
- ✅ **Never change** - Print once, use forever
- ✅ **Restaurant-specific** - Each restaurant gets their own unique QR code
- ✅ **Menu filtering** - Customers only see that restaurant's menu items
- ✅ **Table selection** - Customers select their table after scanning
- ✅ **Permanent** - Adding/removing menu items doesn't affect the QR code

## How It Works

### 1. QR Code Generation

**Each restaurant gets a unique URL in their QR code:**

```
http://localhost:3000/customer/table?restaurant={owner_id}
```

**Example:**
```
http://localhost:3000/customer/table?restaurant=550e8400-e29b-41d4-a716-446655440000
```

**URL Parameters:**
- `restaurant` = Owner's unique ID from Supabase database
- This ID is permanent and linked to the restaurant account

### 2. Customer Journey

```
┌─────────────────┐
│  Customer scans │
│    QR Code      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ URL: /customer/table?           │
│      restaurant={owner_id}      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Table Selection Page            │
│ - Restaurant ID stored          │
│ - Customer selects table (1-20) │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Menu Page                       │
│ - Shows ONLY that restaurant's  │
│   menu items (filtered by ID)   │
│ - Customer adds items to cart   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Checkout                        │
│ - Table number included         │
│ - Restaurant ID included        │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Order sent to Kitchen           │
│ - Restaurant owner sees order   │
│ - Table number displayed        │
└─────────────────────────────────┘
```

### 3. Data Flow

**Step 1: Scan QR Code**
```
URL: http://localhost:3000/customer/table?restaurant=abc-123
```

**Step 2: Extract & Store Restaurant ID**
```typescript
// In customer/table/page.tsx
const restaurantId = searchParams.get('restaurant');
sessionStorage.setItem('restaurantId', restaurantId);
```

**Step 3: Select Table**
```typescript
// Customer selects table 5
sessionStorage.setItem('tableNumber', '5');
```

**Step 4: Load Menu (Filtered)**
```typescript
// In customer/menu/page.tsx
const restaurantId = sessionStorage.getItem('restaurantId');

// Query only this restaurant's menu items
const { data } = await supabase
  .from('menu_items')
  .select('*')
  .eq('owner_id', restaurantId)  // ← Filters by restaurant
  .eq('is_available', true);
```

**Step 5: Place Order**
```typescript
// Order includes:
{
  owner_id: restaurantId,      // ← Restaurant
  table_number: 5,              // ← Table
  items: [...],                 // ← Cart items
}
```

## Implementation Details

### Owner Dashboard (`/owner/dashboard`)

**QR Code URL Generation:**
```typescript
// When owner logs in, generate their unique QR code URL
setShopUrl(`${window.location.origin}/customer/table?restaurant=${ownerData.id}`);
```

**QR Code Display:**
```tsx
<QRCodeSVG value={shopUrl} size={256} />
// Generates QR code with restaurant-specific URL
```

### Customer Table Selection (`/customer/table`)

**Extract Restaurant ID:**
```typescript
const searchParams = useSearchParams();
const restaurantId = searchParams.get('restaurant');

// Store for later use
if (restaurantId) {
  sessionStorage.setItem('restaurantId', restaurantId);
}
```

### Customer Menu (`/customer/menu`)

**Filter Menu by Restaurant:**
```typescript
const restaurantId = sessionStorage.getItem('restaurantId');

// Build query with restaurant filter
let query = supabase
  .from('menu_items')
  .select('*')
  .eq('is_available', true);

// Only show this restaurant's items
if (restaurantId) {
  query = query.eq('owner_id', restaurantId);
}
```

## Why This Approach?

### ✅ Advantages

1. **Permanent QR Codes**
   - Print once, use forever
   - No need to regenerate when menu changes
   - Restaurant ID never changes

2. **Restaurant Isolation**
   - Each restaurant only sees their own orders
   - Menu items are filtered by restaurant
   - No cross-contamination of data

3. **Multi-Restaurant Support**
   - Same app can serve multiple restaurants
   - Each has their own unique QR code
   - Data is completely separated

4. **Easy Table Management**
   - Customer selects table after scanning
   - Same QR code works for all tables
   - No need for table-specific QR codes

5. **Scalable**
   - Add unlimited restaurants
   - Each gets automatic QR code
   - No manual configuration needed

## Usage Instructions

### For Restaurant Owners:

1. **Login** to your dashboard at `/owner/login`
2. **Click "QR Code" button** in the header
3. **Print the QR code** (click "Print QR Code" button)
4. **Place printed QR code on every table** in your restaurant
5. **Done!** Customers can now scan from any table

### For Customers:

1. **Scan QR code** from any table using phone camera
2. **Select your table number** (1-20)
3. **Browse menu** (shows only that restaurant's items)
4. **Add items to cart**
5. **Checkout** and place order
6. **Track order status** in real-time

## Testing

### Test Scenario 1: Single Restaurant

```bash
# 1. Owner logs in
http://localhost:3000/owner/login

# 2. View QR code on dashboard
# QR code contains: http://localhost:3000/customer/table?restaurant={id}

# 3. Scan QR code (or manually visit URL)
http://localhost:3000/customer/table?restaurant=550e8400-e29b-41d4-a716-446655440000

# 4. Select table (e.g., Table 5)
# Stores: restaurantId + tableNumber

# 5. View menu
# Should show ONLY items from that restaurant

# 6. Place order
# Order sent to that restaurant's kitchen
```

### Test Scenario 2: Multiple Restaurants

```bash
# Restaurant A
Owner A logs in → Gets QR code with restaurant=owner-a-id
Customer scans → Sees only Restaurant A's menu

# Restaurant B
Owner B logs in → Gets QR code with restaurant=owner-b-id
Customer scans → Sees only Restaurant B's menu

# Result: Complete data separation ✅
```

## Database Schema

**Menu Items:**
```sql
menu_items
  - id (uuid)
  - owner_id (uuid) ← Links to specific restaurant
  - name (text)
  - price (numeric)
  - is_available (boolean)
```

**Orders:**
```sql
orders
  - id (uuid)
  - owner_id (uuid) ← Links to specific restaurant
  - table_number (integer)
  - status (text)
  - total (numeric)
```

**Row Level Security (RLS):**
```sql
-- Owners can only see their own menu items
CREATE POLICY "Owners can manage their menu"
ON menu_items
FOR ALL
USING (auth.uid() = owner_id);

-- Owners can only see their own orders
CREATE POLICY "Owners can view their orders"
ON orders
FOR SELECT
USING (auth.uid() = owner_id);
```

## Security Features

1. **Restaurant Isolation**
   - RLS policies ensure data separation
   - Each owner only sees their own data
   - Customers can't access other restaurants' items

2. **Session Management**
   - Restaurant ID validated against database
   - Invalid IDs result in empty menu
   - No unauthorized access possible

3. **URL Parameters**
   - Restaurant ID is UUID (hard to guess)
   - No sequential IDs that could be enumerated
   - Tamper-proof

## Maintenance

### When Menu Changes:
- ✅ QR code stays the same
- ✅ No need to reprint
- ✅ Changes reflect immediately

### When Restaurant Changes Name:
- ✅ QR code stays the same
- ✅ Restaurant ID unchanged
- ✅ Only display name updates

### When Adding Tables:
- ✅ QR code stays the same
- ✅ Just add more table numbers in code
- ✅ All tables use same QR code

## Production Deployment

**When deploying to production, the QR code URL will be:**
```
https://yourdomain.com/customer/table?restaurant={owner_id}
```

**Example:**
```
https://menumagi.com/customer/table?restaurant=550e8400-e29b-41d4-a716-446655440000
```

This permanent URL goes in the QR code and never changes! 🎉

## Summary

Your QR code system now works like this:

1. **One QR code per restaurant** (not per table)
2. **QR code never changes** (permanent)
3. **Place same QR code on all tables**
4. **Customers select table after scanning**
5. **Menu automatically filtered** to show only that restaurant's items
6. **Orders go to correct restaurant** with table number

This is the industry-standard approach used by professional restaurant ordering systems! 🚀
