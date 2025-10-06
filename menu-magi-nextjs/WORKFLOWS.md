# 🎬 User Workflows - Menu Magi

## 👨‍🍳 Owner Workflow

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Initial Setup                                  │
└─────────────────────────────────────────────────────────┘
    ↓
1. Create account in Supabase Auth
2. Admin adds owner record to `owners` table
3. Owner receives email/password
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Login                                          │
└─────────────────────────────────────────────────────────┘
    ↓
/owner/login
• Enter email & password
• Supabase Auth validates
• Middleware sets cookie
• Redirect to /owner/dashboard
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Setup Menu                                     │
└─────────────────────────────────────────────────────────┘
    ↓
/owner/dashboard
• Click "Add Menu Item"
• Fill form:
  - Name: "Margherita Pizza"
  - Description: "Fresh mozzarella..."
  - Price: $14.99
  - Category: "Main Course"
• Upload image (camera or gallery)
  → Saved to Supabase Storage (menu-images/)
• Click "Save"
  → Insert into `menu_items` table
  → Real-time update (if subscribed)
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Generate QR Codes                              │
└─────────────────────────────────────────────────────────┘
    ↓
/owner/dashboard
• Click "QR Codes" tab
• System generates:
  - Table 1: menu-magi.com/shop/{ownerId}?table=1
  - Table 2: menu-magi.com/shop/{ownerId}?table=2
  - ...
• Download & print QR codes
• Place on physical tables
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 5: Monitor Orders (Kitchen Dashboard)             │
└─────────────────────────────────────────────────────────┘
    ↓
/owner/orders
• Real-time order display (WebSocket)
• New order arrives:
  ┌─────────────────────────┐
  │  Table 5                │
  │  Status: 🟡 Waiting     │
  │  ─────────────────────  │
  │  2x Pizza               │
  │  1x Salad               │
  │  ─────────────────────  │
  │  Total: $44.97          │
  │  ─────────────────────  │
  │  [Accept Order]         │
  └─────────────────────────┘
• Click "Accept Order"
  → Status: Accepted
  → Update `orders` table
  → Customer sees real-time update
• Click "Start Preparing"
  → Status: Preparing
• Click "On the Way"
  → Status: On the Way
• Click "Mark Completed"
  → Status: Completed
  → Moved to history
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 6: View Analytics                                 │
└─────────────────────────────────────────────────────────┘
    ↓
/owner/history
• View daily revenue charts
• See popular items
• Export reports
• Filter by date range
```

---

## 🍽️ Customer Workflow

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Scan QR Code at Table                          │
└─────────────────────────────────────────────────────────┘
    ↓
Customer scans QR code on Table 5
    ↓
Opens: menu-magi.com/shop/{ownerId}?table=5
    ↓
Redirects to: /customer/table
• Auto-selects Table 5 (from QR code)
• Or manually select table number
• Save table number in sessionStorage
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Browse Menu                                    │
└─────────────────────────────────────────────────────────┘
    ↓
/customer/menu
• Load menu items from Supabase:
  SELECT * FROM menu_items 
  WHERE owner_id = '{ownerId}' 
  AND is_available = true
• Display in grid:
  ┌──────────────────┐ ┌──────────────────┐
  │  [Image]         │ │  [Image]         │
  │  Pizza           │ │  Burger          │
  │  $14.99          │ │  $12.99          │
  │  [+ Add]         │ │  [+ Add]         │
  └──────────────────┘ └──────────────────┘
    ↓
Customer clicks "+ Add" on Pizza
    ↓
• Add to cart (React state)
• Show floating cart summary:
  ┌────────────────────────────┐
  │  Your Order (2 items)      │
  │  Total: $44.97             │
  │  [Proceed to Checkout]     │
  └────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Checkout                                       │
└─────────────────────────────────────────────────────────┘
    ↓
/customer/checkout
• Review order:
  2x Pizza    $29.98
  1x Salad    $10.99
  ───────────────────
  Subtotal    $40.97
  Tax (10%)    $4.10
  ───────────────────
  Total       $45.07
• Optional: Add name, phone
• Click "Confirm & Pay"
    ↓
Create order in Supabase:
  1. INSERT INTO orders (...)
  2. INSERT INTO order_items (...)
  3. Get order ID
    ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Confirmation                                   │
└─────────────────────────────────────────────────────────┘
    ↓
/customer/confirmation/{orderId}
• Show confirmation:
  ┌────────────────────────────┐
  │  ✅ Order Placed!          │
  │  Order #AB123              │
  │  Table 5                   │
  │  ─────────────────────     │
  │  Status: 🟡 Waiting        │
  │  ─────────────────────     │
  │  Your food will arrive     │
  │  soon!                     │
  └────────────────────────────┘
• Subscribe to real-time updates
• Status changes automatically:
  - 🟡 Waiting
  - ✅ Accepted
  - 🍳 Preparing
  - 🚀 On the Way
  - ✔️ Completed (Enjoy!)
```

---

## 🔄 Data Flow Diagram

```
┌──────────────┐
│   Customer   │
│   Browser    │
└──────┬───────┘
       │ 1. Scan QR code
       ↓
┌──────────────────────────┐
│  Next.js Frontend        │
│  (Server + Client)       │
└──────┬───────────────────┘
       │ 2. Fetch menu
       ↓
┌──────────────────────────┐
│  Supabase PostgreSQL     │
│  SELECT * FROM menu_items│
└──────┬───────────────────┘
       │ 3. Return data
       ↓
┌──────────────────────────┐
│  Next.js renders menu    │
└──────┬───────────────────┘
       │ 4. Display to customer
       ↓
┌──────────────┐
│   Customer   │
│   adds items │
└──────┬───────┘
       │ 5. Click checkout
       ↓
┌──────────────────────────┐
│  Next.js creates order   │
│  INSERT INTO orders      │
└──────┬───────────────────┘
       │ 6. Save to database
       ↓
┌──────────────────────────┐
│  Supabase triggers       │
│  Realtime event          │
└──────┬───────────────────┘
       │ 7. WebSocket push
       ↓
┌──────────────────────────┐
│  Owner's Kitchen         │
│  Dashboard receives      │
│  new order alert         │
└──────────────────────────┘
```

---

## 📱 Screen Flow Diagrams

### Customer Journey

```
┌─────────┐
│ Landing │
│  Page   │ Choose "I'm a Customer"
└────┬────┘
     ↓
┌────────────┐
│   Table    │
│ Selection  │ Select Table 5
└─────┬──────┘
      ↓
┌────────────┐
│   Menu     │
│  Browsing  │ Add 2x Pizza, 1x Salad
└─────┬──────┘
      ↓
┌────────────┐
│  Checkout  │ Confirm order
└─────┬──────┘
      ↓
┌─────────────┐
│Confirmation │ Track status
└─────────────┘
```

### Owner Journey

```
┌─────────┐
│ Landing │
│  Page   │ Choose "I'm the Owner"
└────┬────┘
     ↓
┌────────────┐
│   Login    │ Email + Password
└─────┬──────┘
      ↓
┌────────────┐
│ Dashboard  │ Manage menu
└─────┬──────┘
      │
      ├──> Add/Edit/Delete items
      ├──> Generate QR codes
      │
      ↓
┌────────────┐
│   Orders   │ Kitchen view
└─────┬──────┘
      │
      ├──> Accept orders
      ├──> Update status
      │
      ↓
┌────────────┐
│  History   │ View analytics
└────────────┘
```

---

## 🔐 Authentication Flow

```
┌────────────────────────┐
│  User visits           │
│  /owner/dashboard      │
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│  middleware.ts checks  │
│  Supabase session      │
└────────┬───────────────┘
         │
    ┌────┴────┐
    │ Has     │
    │ session?│
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
   YES                   NO
    │                     │
    ↓                     ↓
┌───────────┐      ┌─────────────┐
│  Allow    │      │  Redirect   │
│  access   │      │  to /login  │
└───────────┘      └─────────────┘
```

---

**Use these diagrams to understand the complete system flow! 📊**
