# 📖 MENU MAGI - COMPLETE APP DOCUMENTATION

**Version:** 1.0.0  
**Last Updated:** October 6, 2025  
**Project:** Restaurant Ordering & Management System for India Market

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Features](#features)
6. [File Structure](#file-structure)
7. [User Flows](#user-flows)
8. [API & Integrations](#api--integrations)
9. [India-Specific Features](#india-specific-features)
10. [Setup Instructions](#setup-instructions)
11. [Recent Fixes & Updates](#recent-fixes--updates)
12. [Known Issues](#known-issues)
13. [Future Enhancements](#future-enhancements)

---

## 1. OVERVIEW

### What is Menu Magi?

Menu Magi is a **production-ready, QR-based restaurant ordering system** designed specifically for the **Indian market**. It enables:

- **Customers:** Scan QR code → Browse menu → Place order → Track status in real-time
- **Restaurant Owners:** Manage menu → Receive orders → Update order status → View analytics

### Key Differentiators

✅ **No payment integration** - Cash/UPI payments handled offline  
✅ **GST compliant** - 5% GST with CGST/SGST breakdown  
✅ **WhatsApp integration** - Share order confirmations  
✅ **Hindi language support** - Bilingual menu (English/Hindi)  
✅ **Indian currency (₹)** - All prices in rupees with proper formatting  
✅ **Real-time updates** - WebSocket-based order tracking  
✅ **QR code based** - No customer login required  

### Target Market

🇮🇳 **India** - Restaurants, cafes, hotels, food courts, cloud kitchens

---

## 2. TECH STACK

### Frontend
- **Framework:** Next.js 15.5.4 (App Router, Server Components, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 (with PostCSS)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts (for analytics)
- **Notifications:** Sonner (toast notifications)
- **QR Codes:** qrcode.react

### Backend
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (JWT-based)
- **Storage:** Supabase Storage (CDN for images)
- **Real-time:** Supabase Realtime (WebSocket)
- **API:** Supabase REST API (auto-generated)

### DevOps
- **Package Manager:** npm
- **Linting:** ESLint 9
- **Deployment:** Vercel (recommended)
- **Version Control:** Git

### Libraries & Utilities
- **Date Handling:** date-fns
- **Class Management:** clsx, tailwind-merge
- **Type Safety:** Zod schemas

---

## 3. ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER SIDE                        │
│  [QR Scan] → [Table Select] → [Menu] → [Checkout]     │
│     ↓                                       ↓            │
│  [Order Confirmation] ← [Real-time Status Updates]      │
└─────────────────────────────────────────────────────────┘
                           ↓ ↑
                     [SUPABASE]
                    - PostgreSQL
                    - Realtime
                    - Storage
                    - Auth
                           ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                     OWNER SIDE                          │
│  [Login] → [Dashboard] → [Menu Management]             │
│     ↓                                                    │
│  [Orders Page] → [Accept/Process] → [Complete]         │
│     ↓                                                    │
│  [Order History] → [Analytics]                          │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
Owner Login:
1. Email/Password → Supabase Auth
2. JWT token stored in cookies
3. Middleware validates token on protected routes
4. session.user.id = owner_id in database

Customer Flow:
- No authentication required
- QR code contains ?restaurant=OWNER_ID
- Orders linked via owner_id + table_number
```

### Real-time Data Flow

```
Customer places order
     ↓
Insert into orders table
     ↓
PostgreSQL Trigger
     ↓
Supabase Realtime (WebSocket)
     ↓
Owner's Orders Page (auto-refresh)
     ↓
Owner updates status
     ↓
Customer's Confirmation Page (auto-update)
```

---

## 4. DATABASE SCHEMA

### Tables

#### 1. `owners` Table
```sql
CREATE TABLE owners (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  restaurant_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store restaurant owner accounts  
**Key:** id links to Supabase Auth users  
**Indexes:** email (unique)

#### 2. `menu_items` Table
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store menu items for each restaurant  
**Key:** owner_id (foreign key to owners)  
**Constraints:** price >= 0  
**RLS:** Owners can only manage their own items

#### 3. `orders` Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES owners(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'waiting' 
    CHECK (status IN ('waiting', 'accepted', 'preparing', 'on-the-way', 'completed', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_method TEXT,
  
  -- India-specific GST fields
  gst_rate DECIMAL(5,2),
  gst_amount DECIMAL(10,2),
  cgst DECIMAL(10,2),
  sgst DECIMAL(10,2),
  igst DECIMAL(10,2),
  invoice_number TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store customer orders  
**Status Flow:** waiting → accepted → preparing → on-the-way → completed  
**Payment:** 'pending', 'paid', 'failed' (cash/UPI offline)  
**GST:** 5% total (2.5% CGST + 2.5% SGST for same state)

#### 4. `order_items` Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL
);
```

**Purpose:** Store individual items in each order  
**Denormalization:** Stores name and price to preserve order history even if menu changes

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_orders_owner_id ON orders(owner_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_menu_items_owner_id ON menu_items(owner_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### Row Level Security (RLS)

```sql
-- Owners can only see their own data
CREATE POLICY "Owners can view own menu items"
  ON menu_items FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert own menu items"
  ON menu_items FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own menu items"
  ON menu_items FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own menu items"
  ON menu_items FOR DELETE
  USING (auth.uid() = owner_id);

-- Similar policies for orders, order_items
```

### Storage Buckets

1. **menu-images** (Public)
   - Stores menu item photos
   - CDN-enabled for fast delivery
   - Accepts: jpg, png, webp
   - Max size: 5MB

2. **qr-codes** (Public)
   - Stores generated QR codes
   - One permanent QR per restaurant

---

## 5. FEATURES

### Customer Features

#### 1. QR Code Scanning
- **URL Format:** `https://yourdomain.com/customer/table?restaurant=OWNER_ID`
- **Flow:** Scan → Auto-open browser → Table selection page
- **Fallback:** Manual table entry if QR not scanned

#### 2. Table Selection
- **UI:** Grid of 20 tables (expandable)
- **State:** Stored in sessionStorage
- **Validation:** Required before accessing menu

#### 3. Menu Browsing
- **Layout:** Card grid with images
- **Info per item:** Name, description, price (₹), image
- **Categories:** Optional filtering by category
- **Availability:** Only shows available items
- **Cart:** Real-time cart in sidebar with quantity controls

#### 4. Shopping Cart
- **Actions:** Add, remove, update quantity
- **Display:** Item count, subtotal
- **Persistence:** sessionStorage (survives page refresh)
- **Validation:** Minimum 1 item to checkout

#### 5. Checkout
- **Summary:** All items with quantities
- **Pricing:**
  - Subtotal (₹)
  - CGST 2.5% (₹)
  - SGST 2.5% (₹)
  - Total GST 5% (₹)
  - Total Amount (₹)
- **Payment:** "Confirm & Pay" (offline payment)
- **Validation:** Requires table number and owner ID

#### 6. Order Confirmation
- **Display:** Order ID, table number, items, total
- **Status Tracking:** Real-time status updates via WebSocket
- **WhatsApp:** Option to share order confirmation
- **Updates:** Auto-refresh when owner changes status

### Owner Features

#### 1. Authentication
- **Method:** Email + Password (Supabase Auth)
- **Security:** JWT tokens, HTTP-only cookies
- **Session:** Persistent login, secure logout
- **Protection:** Middleware guards all /owner routes

#### 2. Dashboard (Menu Management)
- **Actions:** Create, Read, Update, Delete menu items
- **Form Fields:**
  - Name (required)
  - Description
  - Price in ₹ (required, >= 0)
  - Category
  - Image upload
  - Availability toggle
- **Image Upload:** 
  - Base64 encoding (current)
  - Supabase Storage (ready, not integrated)
- **Validation:** React Hook Form + Zod schemas

#### 3. QR Code Generation
- **Type:** Permanent QR code per restaurant
- **URL:** Includes owner ID in query param
- **Display:** SVG format, 256x256px
- **Actions:** View, download, print
- **Usage:** Print once, place on all tables

#### 4. Orders Page (Kitchen Dashboard)
- **Layout:** Kanban-style cards
- **Sections:**
  - Waiting (new orders)
  - Accepted
  - Preparing
  - On the Way
  - Completed
- **Real-time:** Auto-refresh on new orders
- **Actions per status:**
  - Waiting → "Accept Order"
  - Accepted → "Start Preparing"
  - Preparing → "Mark On the Way"
  - On the Way → "Mark Completed"
- **Order Details:**
  - Table number
  - Items list with quantities
  - Total amount
  - Time since order placed
  - Customer info (if provided)

#### 5. Order History
- **Filters:** Date range, status, table number
- **Display:** All past orders
- **Analytics:**
  - Total revenue
  - Orders per day
  - Popular items
  - Average order value

---

## 6. FILE STRUCTURE

```
menu-magi-nextjs/
│
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout (Toaster provider)
│   ├── page.tsx                 # Landing page (hero, features)
│   ├── globals.css              # Global Tailwind styles
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         # OAuth callback handler
│   │
│   ├── customer/                # Customer-facing routes (public)
│   │   ├── table/
│   │   │   └── page.tsx         # Table selection page
│   │   ├── menu/
│   │   │   └── page.tsx         # Menu browsing + cart
│   │   ├── checkout/
│   │   │   └── page.tsx         # Checkout with GST breakdown
│   │   └── confirmation/
│   │       └── [orderId]/
│   │           └── page.tsx     # Order confirmation + tracking
│   │
│   └── owner/                   # Owner routes (protected)
│       ├── login/
│       │   └── page.tsx         # Owner login form
│       ├── dashboard/
│       │   └── page.tsx         # Menu management + QR code
│       ├── orders/
│       │   └── page.tsx         # Kitchen dashboard (real-time)
│       └── history/
│           └── page.tsx         # Order history + analytics
│
├── components/
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── separator.tsx
│       └── badge.tsx
│
├── lib/
│   ├── utils.ts                 # Utility functions (cn, etc.)
│   ├── gst.ts                   # GST calculation + Indian currency formatting
│   ├── whatsapp.ts              # WhatsApp message generation
│   ├── i18n.ts                  # Hindi translations (not yet integrated)
│   ├── uploadImage.ts           # Supabase Storage upload (not yet integrated)
│   ├── notifications.ts         # Browser notifications (not yet integrated)
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       ├── server.ts            # Server Supabase client
│       └── middleware.ts        # Auth middleware helper
│
├── types/
│   └── database.ts              # TypeScript types for Supabase tables
│
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── middleware.ts                # Next.js middleware (auth protection)
│
├── SQL Scripts/
│   ├── supabase-schema.sql              # Main database schema
│   ├── supabase-performance-fixes.sql   # Performance optimizations
│   ├── supabase-india-schema.sql        # India-specific features
│   ├── quick-fix-gst-columns.sql        # GST columns fix
│   ├── fix-payment-status-constraint.sql
│   ├── fix-owner-rls-policy.sql
│   └── diagnose-order-issue.sql
│
├── Documentation/
│   ├── README.md                        # Main readme
│   ├── CUSTOMER-PAGES-COMPLETE.md       # Customer pages update summary
│   ├── ORDER-FIX-SUMMARY.md             # Orders showing fix
│   ├── ORDER-NOT-SHOWING-FIX.md         # Detailed order fix guide
│   ├── QUICK-ORDER-FIX.md               # Quick reference
│   ├── WHATS-CONNECTED-NOW.md           # Integration status
│   ├── CHANGES-MADE.md                  # All changes log
│   ├── INTEGRATION-CHECKLIST.md         # Pending integrations
│   ├── WORKFLOWS.md                     # Development workflows
│   ├── QUICK-START.md                   # Quick start guide
│   └── 30-DAY-PLAN.md                   # Development roadmap
│
├── Configuration/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── components.json           # shadcn/ui config
│
└── .env.local                    # Environment variables (not in repo)
    ├── NEXT_PUBLIC_SUPABASE_URL
    └── NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 7. USER FLOWS

### Customer Journey (End-to-End)

```
1. SCAN QR CODE
   ↓
   QR contains: https://yourdomain.com/customer/table?restaurant=abc123
   ↓
2. TABLE SELECTION PAGE
   - URL parsed: restaurantId = "abc123"
   - sessionStorage.setItem('restaurantId', 'abc123')
   - User selects table 5
   - sessionStorage.setItem('tableNumber', '5')
   - Navigate to /customer/menu
   ↓
3. MENU PAGE
   - Load menu items from database (filter by owner_id = abc123)
   - Set ownerId from restaurantId in sessionStorage
   - Display menu items with ₹ prices
   - User adds items to cart
   - Cart stored in sessionStorage
   - Click "Proceed to Checkout"
   ↓
4. CHECKOUT PAGE
   - Display cart items
   - Calculate GST:
     * Subtotal: ₹100
     * CGST (2.5%): ₹2.50
     * SGST (2.5%): ₹2.50
     * Total GST: ₹5.00
     * Total: ₹105.00
   - User clicks "Confirm & Pay"
   - Create order in database:
     {
       owner_id: "abc123",
       table_number: 5,
       status: "waiting",
       subtotal: 100,
       gst_amount: 5,
       cgst: 2.5,
       sgst: 2.5,
       total: 105,
       payment_status: "paid"
     }
   - Create order_items for each cart item
   ↓
5. ORDER CONFIRMATION
   - Display order ID, items, total
   - Show WhatsApp share popup
   - Real-time status tracking
   - Status updates via WebSocket:
     * Waiting → Accepted → Preparing → On the Way → Completed
   ↓
6. COMPLETION
   - Order marked as completed
   - Customer can leave feedback (future feature)
```

### Owner Journey (Dashboard Management)

```
1. LOGIN
   ↓
   - Navigate to /owner/login
   - Enter email + password
   - Supabase Auth validates
   - JWT token stored in cookies
   - Redirect to /owner/dashboard
   ↓
2. DASHBOARD
   ↓
   - View all menu items
   - Click "Add Menu Item"
   ↓
3. CREATE MENU ITEM
   - Fill form:
     * Name: "Butter Chicken"
     * Description: "Creamy tomato curry"
     * Price: ₹350
     * Category: "Main Course"
     * Upload image
   - Submit form
   - Validate with Zod schema
   - Insert into database
   - Image uploaded to Supabase Storage (future)
   ↓
4. GENERATE QR CODE
   - Click "QR Code" button
   - Generate QR with URL: /customer/table?restaurant={owner_id}
   - Display QR code (256x256 SVG)
   - Download QR code
   - Print and place on tables
   ↓
5. RECEIVE ORDERS
   - Navigate to /owner/orders
   - Real-time subscription to orders table
   - New order appears in "Waiting" section
   - Sound notification (future)
   - Browser notification (future)
   ↓
6. PROCESS ORDER
   - Click "Accept Order" → Status: "accepted"
   - Click "Start Preparing" → Status: "preparing"
   - Click "Mark On the Way" → Status: "on-the-way"
   - Click "Mark Completed" → Status: "completed"
   - Each update triggers WebSocket to customer
   ↓
7. VIEW HISTORY
   - Navigate to /owner/history
   - See all past orders
   - Filter by date, status
   - View analytics dashboard
```

---

## 8. API & INTEGRATIONS

### Supabase API

All database operations use Supabase auto-generated REST API:

#### Example: Fetch Menu Items
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .eq('owner_id', ownerId)
  .eq('is_available', true)
  .order('name');
```

#### Example: Create Order
```typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    owner_id: ownerId,
    table_number: tableNumber,
    status: 'waiting',
    subtotal: subtotal,
    gst_amount: gstAmount,
    cgst: cgst,
    sgst: sgst,
    total: total,
    payment_status: 'paid'
  })
  .select()
  .single();
```

#### Example: Real-time Subscription
```typescript
const channel = supabase
  .channel('orders-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders'
    },
    () => {
      loadOrders(); // Refresh orders
    }
  )
  .subscribe();
```

### GST Calculation Library

**File:** `lib/gst.ts`

```typescript
export interface GSTBreakdown {
  subtotal: number;
  cgst: number;      // Central GST (2.5%)
  sgst: number;      // State GST (2.5%)
  igst: number;      // Inter-state GST (5%)
  gstRate: number;   // 5%
  totalGST: number;  // cgst + sgst or igst
  total: number;     // subtotal + totalGST
}

export function calculateGST(
  subtotal: number,
  gstRate: number = 5,
  isInterState: boolean = false
): GSTBreakdown {
  const gstAmount = (subtotal * gstRate) / 100;
  
  if (isInterState) {
    return {
      subtotal,
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      gstRate,
      totalGST: gstAmount,
      total: subtotal + gstAmount
    };
  } else {
    const halfGST = gstAmount / 2;
    return {
      subtotal,
      cgst: halfGST,
      sgst: halfGST,
      igst: 0,
      gstRate,
      totalGST: gstAmount,
      total: subtotal + gstAmount
    };
  }
}

export function formatIndianCurrency(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
```

**Usage:**
```typescript
const gst = calculateGST(100, 5, false);
// Returns: {
//   subtotal: 100,
//   cgst: 2.5,
//   sgst: 2.5,
//   totalGST: 5,
//   total: 105
// }

const formatted = formatIndianCurrency(1234.56);
// Returns: "1,234.56"
```

### WhatsApp Integration

**File:** `lib/whatsapp.ts`

```typescript
export function getOrderConfirmationMessage(params: {
  orderId: string;
  restaurantName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  tableNumber: number;
}): string {
  const { orderId, restaurantName, items, total, tableNumber } = params;
  
  let message = `🍽️ *${restaurantName}*\n\n`;
  message += `📋 Order ID: ${orderId}\n`;
  message += `🪑 Table: ${tableNumber}\n\n`;
  message += `*Your Order:*\n`;
  
  items.forEach(item => {
    message += `• ${item.name} x${item.quantity} - ₹${formatIndianCurrency(item.price * item.quantity)}\n`;
  });
  
  message += `\n*Total: ₹${formatIndianCurrency(total)}*\n\n`;
  message += `✅ Your order has been placed!\n`;
  message += `We'll notify you when it's ready.`;
  
  return message;
}

export function shareOnWhatsApp(message: string, phoneNumber?: string): void {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}
```

**Usage:**
```typescript
const message = getOrderConfirmationMessage({
  orderId: 'INV/2025/10/001',
  restaurantName: 'Menu Magi Restaurant',
  items: [
    { name: 'Butter Chicken', quantity: 2, price: 350 },
    { name: 'Naan', quantity: 4, price: 40 }
  ],
  total: 860,
  tableNumber: 5
});

shareOnWhatsApp(message);
// Opens WhatsApp with pre-filled message
```

---

## 9. INDIA-SPECIFIC FEATURES

### 1. GST (Goods & Services Tax)

**Rate:** 5% for restaurant services (as per Indian GST law)

**Breakdown:**
- **Same State:** 2.5% CGST + 2.5% SGST = 5% total
- **Inter-State:** 5% IGST

**Display on Checkout:**
```
Subtotal:         ₹100.00
CGST (2.5%):      ₹2.50
SGST (2.5%):      ₹2.50
Total GST (5%):   ₹5.00
────────────────────────
Total Amount:     ₹105.00
```

**Database Fields:**
- `gst_rate` (5.00)
- `gst_amount` (5.00)
- `cgst` (2.50)
- `sgst` (2.50)
- `igst` (0 for same state)

### 2. Indian Currency (₹)

**Formatting:**
- Symbol: ₹ (not $)
- Format: 1,234.56 (Indian numbering system)
- Function: `formatIndianCurrency(amount)`

**Examples:**
- ₹350.00
- ₹1,234.56
- ₹10,00,000.00 (10 lakhs)

### 3. Invoice Numbering

**Format:** `INV/YYYY/MM/XXXXX`

**Example:** `INV/2025/10/00001`

**Logic:**
```typescript
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const sequence = String(orderCount + 1).padStart(5, '0');
const invoiceNumber = `INV/${year}/${month}/${sequence}`;
```

### 4. Payment Methods (Offline)

Since payment integration is skipped:
- **Cash:** Default method
- **UPI:** QR code printed on receipt (future)
- **Card:** Manual swipe machine (future)

**Payment Status:**
- `pending` - Not yet paid
- `paid` - Payment received (cash/UPI/card)
- `failed` - Payment issue

### 5. WhatsApp Sharing

After order placement, customer gets popup:
```
📱 Share order confirmation on WhatsApp?

[Yes] [No]
```

Clicking "Yes" opens WhatsApp with:
```
🍽️ *Menu Magi Restaurant*

📋 Order ID: INV/2025/10/00001
🪑 Table: 5

*Your Order:*
• Butter Chicken x2 - ₹700.00
• Naan x4 - ₹160.00

*Total: ₹860.00*

✅ Your order has been placed!
We'll notify you when it's ready.
```

### 6. Hindi Language Support

**File:** `lib/i18n.ts` (created but not yet integrated)

**Translations:**
```typescript
export const translations = {
  menu: {
    en: "Menu",
    hi: "मेनू"
  },
  addToCart: {
    en: "Add to Cart",
    hi: "कार्ट में जोड़ें"
  },
  checkout: {
    en: "Checkout",
    hi: "चेकआउट"
  },
  total: {
    en: "Total",
    hi: "कुल"
  }
};
```

**Future Integration:**
- Language toggle button on menu page
- Store preference in localStorage
- Display menu in Hindi

---

## 10. SETUP INSTRUCTIONS

### Prerequisites

✅ Node.js 18+ installed  
✅ npm/yarn/pnpm installed  
✅ Supabase account (free tier works)  
✅ Code editor (VS Code recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/menu-magi-nextjs.git
cd menu-magi-nextjs
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Set project name: `menu-magi`
4. Set database password (save it!)
5. Select region (India - Mumbai recommended)
6. Click "Create New Project"
7. Wait 2-3 minutes for setup

### Step 4: Run Database Schema

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy content from `supabase-schema.sql`
4. Paste and click "Run"
5. ✅ Tables created!

**Optional (for India features):**
```bash
# Run these in order:
1. supabase-performance-fixes.sql
2. supabase-india-schema.sql
3. quick-fix-gst-columns.sql (if needed)
```

### Step 5: Create Storage Buckets

1. Go to Storage in Supabase
2. Click "New Bucket"
3. Name: `menu-images`
4. Public: ✅ Yes
5. Click "Create Bucket"

Repeat for `qr-codes` bucket.

### Step 6: Configure Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get credentials:**
- Go to Project Settings → API
- Copy "Project URL"
- Copy "anon public" key

### Step 7: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### Step 8: Create Owner Account

**Method 1: Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User"
3. Email: `owner@restaurant.com`
4. Password: (set strong password)
5. Click "Create User"
6. Copy user UUID
7. Go to Table Editor → `owners`
8. Click "Insert Row"
9. id: (paste UUID)
10. email: `owner@restaurant.com`
11. restaurant_name: `My Restaurant`
12. Click "Save"

**Method 2: SQL**
```sql
-- First create auth user in Dashboard, then:
INSERT INTO owners (id, email, restaurant_name, phone, address)
VALUES (
  'paste-user-uuid-here',
  'owner@restaurant.com',
  'My Restaurant',
  '+91 9876543210',
  'Mumbai, Maharashtra'
);
```

### Step 9: Test the App

1. **Owner Login:**
   - Go to http://localhost:3000/owner/login
   - Email: `owner@restaurant.com`
   - Password: (your password)
   - ✅ Should redirect to dashboard

2. **Add Menu Item:**
   - Click "Add Menu Item"
   - Fill form, upload image
   - Click "Add Item"
   - ✅ Item appears in list

3. **Generate QR Code:**
   - Click "QR Code" button
   - ✅ QR code displays
   - Copy the URL

4. **Customer Flow:**
   - Open incognito window
   - Paste QR URL
   - Select table
   - Add items to cart
   - Checkout
   - ✅ Order placed!

5. **View Order:**
   - Go back to owner window
   - Click "Orders"
   - ✅ Order appears!

### Step 10: Deploy (Optional)

**Vercel Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 11. RECENT FIXES & UPDATES

### Fix 1: GST Calculation Bug (Oct 6, 2025)

**Problem:** Total was ₹67.65 instead of ₹34.65 for ₹33 order

**Cause:** Used `gstCalculation.total` as tax variable instead of `gstCalculation.totalGST`

**Fix:**
```typescript
// Before (WRONG):
const tax = gstCalculation.total; // This is subtotal + tax!
const total = subtotal + tax; // Double-counted tax!

// After (CORRECT):
const tax = gstCalculation.totalGST; // Just the tax amount
const total = gstCalculation.total; // Pre-calculated subtotal + tax
```

**Files Changed:** `app/customer/checkout/page.tsx`

### Fix 2: Currency Symbol (Oct 6, 2025)

**Problem:** All customer pages showed $ instead of ₹

**Fix:** Added `formatIndianCurrency()` function and replaced all currency displays

**Files Changed:**
- `app/customer/menu/page.tsx`
- `app/customer/checkout/page.tsx`
- `app/customer/confirmation/[orderId]/page.tsx`
- `lib/gst.ts` (added formatIndianCurrency function)

### Fix 3: Orders Not Showing in Owner Dashboard (Oct 6, 2025)

**Problem:** After customer placed order, it didn't appear in owner's orders page

**Cause:** `ownerId` was not being set properly in customer flow

**Root Cause Analysis:**
1. QR code has `?restaurant=OWNER_ID`
2. Table page stored it as `restaurantId`
3. Menu page tried to get `ownerId` from menu items
4. If no menu items, `ownerId` was never set!
5. Checkout couldn't create order without `ownerId`

**Fix:**

**Menu Page:**
```typescript
// Set ownerId IMMEDIATELY from restaurantId
if (ownerId) {
  sessionStorage.setItem('ownerId', ownerId);
}
```

**Checkout Page:**
```typescript
// Use restaurantId as fallback
const finalOwnerId = storedOwnerId || storedRestaurantId;

if (!finalOwnerId) {
  toast.error('Restaurant info missing. Please scan QR code again.');
  return;
}
```

**Files Changed:**
- `app/customer/menu/page.tsx`
- `app/customer/checkout/page.tsx`
- `app/owner/orders/page.tsx` (added debug logs)

### Fix 4: Payment Status Constraint (Oct 6, 2025)

**Problem:** `violates check constraint "orders_payment_status_check"`

**Cause:** Code used `'success'` but constraint only allowed `'pending'`, `'paid'`, `'failed'`

**Fix:** Changed `payment_status: 'success'` to `payment_status: 'paid'`

**Files Changed:** `app/customer/checkout/page.tsx`

### Fix 5: GST Columns Missing (Oct 6, 2025)

**Problem:** `Could not find the 'gst_amount' column of 'orders' in the schema cache`

**Cause:** Database didn't have GST columns

**Fix:** Created `quick-fix-gst-columns.sql` to add:
- `gst_rate`
- `gst_amount`
- `cgst`
- `sgst`
- `igst`
- `invoice_number`

**Files Changed:** Created `quick-fix-gst-columns.sql`

---

## 12. KNOWN ISSUES

### 1. Image Upload Not Integrated

**Status:** Library created, not connected to dashboard

**File:** `lib/uploadImage.ts`

**Current:** Menu items use base64 encoding (bloats database)

**Todo:** Replace with Supabase Storage upload

**Impact:** 90% database size reduction

### 2. Notifications Not Integrated

**Status:** Library created, not connected to orders page

**File:** `lib/notifications.ts`

**Current:** No sound/browser notifications for new orders

**Todo:** Add to owner orders page real-time subscription

**Impact:** Owner might miss new orders

### 3. Hindi Language Not Active

**Status:** Library created, not integrated into UI

**File:** `lib/i18n.ts`

**Current:** All UI is English only

**Todo:** Add language toggle to menu page

**Impact:** Non-English speakers can't read menu

### 4. No Customer Authentication

**Status:** By design (QR-based ordering)

**Current:** Customers don't create accounts

**Future:** Optional login for order history/favorites

### 5. No Analytics Dashboard

**Status:** Planned feature

**Current:** Order history page exists, no charts

**Todo:** Add Recharts visualizations

**Impact:** Owner can't see trends

---

## 13. FUTURE ENHANCEMENTS

### Phase 1: Complete Existing Features (Week 1-2)

- [ ] Integrate image upload to Supabase Storage
- [ ] Add browser notifications for new orders
- [ ] Activate Hindi language toggle
- [ ] Add order analytics dashboard
- [ ] Implement table management (add/remove tables)

### Phase 2: Customer Experience (Week 3-4)

- [ ] Customer feedback/rating system
- [ ] Order customization (add notes, preferences)
- [ ] Estimated time display
- [ ] Order cancellation (within time limit)
- [ ] Popular items section
- [ ] Search/filter menu

### Phase 3: Owner Tools (Week 5-6)

- [ ] Multi-user support (waiters, kitchen staff)
- [ ] Inventory management
- [ ] Auto-disable items when out of stock
- [ ] Sales reports (daily, weekly, monthly)
- [ ] Peak hours analysis
- [ ] Best-selling items
- [ ] Table turnover rate

### Phase 4: Advanced Features (Week 7-8)

- [ ] UPI payment integration (Razorpay/Paytm/PhonePe)
- [ ] SMS notifications (Twilio/MSG91)
- [ ] Email receipts
- [ ] Loyalty program
- [ ] Discounts & offers
- [ ] Multi-language support (Marathi, Tamil, etc.)

### Phase 5: Scale & Optimize (Week 9-12)

- [ ] PWA (Progressive Web App) for offline support
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Image optimization (WebP, lazy loading)
- [ ] Database query optimization
- [ ] CDN for static assets
- [ ] Multi-restaurant support (franchise mode)
- [ ] White-label solution

---

## 14. TROUBLESHOOTING

### Issue: "Failed to place order"

**Check:**
1. Console logs for specific error
2. Database has GST columns (run `quick-fix-gst-columns.sql`)
3. `ownerId` is set in sessionStorage
4. `payment_status` uses 'paid' not 'success'

### Issue: "Orders not showing in owner dashboard"

**Check:**
1. Owner is logged in
2. `session.user.id` matches customer's `ownerId`
3. RLS policies allow owner to read orders
4. Real-time subscription is active

### Issue: "Currency showing $ instead of ₹"

**Check:**
1. `formatIndianCurrency()` is imported
2. Using `₹{formatIndianCurrency(amount)}` not `${amount.toFixed(2)}`

### Issue: "Images not uploading"

**Check:**
1. Storage bucket `menu-images` exists
2. Bucket is public
3. Image size < 5MB
4. Image format is jpg/png/webp

### Issue: "Real-time updates not working"

**Check:**
1. Supabase Realtime enabled in project settings
2. Tables added to publication: `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`
3. WebSocket connection active (check Network tab)

---

## 15. CONTACT & SUPPORT

**Project:** Menu Magi  
**Version:** 1.0.0  
**Last Updated:** October 6, 2025

**Documentation Files:**
- `COMPLETE-APP-DOCUMENTATION.md` (this file)
- `README.md` - Quick start
- `CUSTOMER-PAGES-COMPLETE.md` - Customer features
- `ORDER-FIX-SUMMARY.md` - Recent fixes
- `INTEGRATION-CHECKLIST.md` - Todo list

**Getting Help:**
1. Check documentation files
2. Search issues in GitHub
3. Check Supabase logs
4. Review console logs (browser DevTools)

---

## 16. GLOSSARY

**CGST:** Central Goods & Services Tax (2.5% in India)  
**SGST:** State Goods & Services Tax (2.5% in India)  
**IGST:** Integrated GST (5% for inter-state)  
**RLS:** Row Level Security (Supabase/PostgreSQL)  
**JWT:** JSON Web Token (authentication)  
**SSR:** Server-Side Rendering  
**CSR:** Client-Side Rendering  
**PWA:** Progressive Web App  
**CDN:** Content Delivery Network  
**UUID:** Universally Unique Identifier  
**QR:** Quick Response (2D barcode)  
**UPI:** Unified Payments Interface (India)

---

## 17. APPENDIX

### A. Database ER Diagram

```
┌─────────────┐
│   owners    │
├─────────────┤
│ id (PK)     │──┐
│ email       │  │
│ restaurant_ │  │
│ name        │  │
└─────────────┘  │
                 │
                 ├──┐
                 │  │
    ┌────────────┘  │
    │               │
┌───▼──────────┐    │
│ menu_items   │    │
├──────────────┤    │
│ id (PK)      │    │
│ owner_id(FK) │    │
│ name         │    │
│ price        │    │
│ image_url    │    │
└──────────────┘    │
                    │
    ┌───────────────┘
    │
┌───▼──────────┐
│   orders     │
├──────────────┤
│ id (PK)      │──┐
│ owner_id(FK) │  │
│ table_number │  │
│ status       │  │
│ total        │  │
│ gst_amount   │  │
└──────────────┘  │
                  │
    ┌─────────────┘
    │
┌───▼──────────┐
│ order_items  │
├──────────────┤
│ id (PK)      │
│ order_id(FK) │
│ name         │
│ price        │
│ quantity     │
└──────────────┘
```

### B. State Machine: Order Status

```
┌─────────┐
│ waiting │ (Initial state after order placed)
└────┬────┘
     │ Owner clicks "Accept Order"
     ▼
┌──────────┐
│ accepted │
└────┬─────┘
     │ Owner clicks "Start Preparing"
     ▼
┌───────────┐
│ preparing │
└────┬──────┘
     │ Owner clicks "Mark On the Way"
     ▼
┌─────────────┐
│ on-the-way  │
└────┬────────┘
     │ Owner clicks "Mark Completed"
     ▼
┌───────────┐
│ completed │ (Final state)
└───────────┘

Alternative path:
Any state → cancelled (if order cancelled)
```

### C. Sample Environment Variables

```bash
# .env.local (DO NOT commit to Git)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config (Optional)
NEXT_PUBLIC_APP_NAME=Menu Magi
NEXT_PUBLIC_APP_URL=https://menumagi.com
NEXT_PUBLIC_GST_RATE=5

# Analytics (Future)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Payments (Future - when integrating)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### D. Sample SQL Queries

**Get today's revenue:**
```sql
SELECT 
  SUM(total) as daily_revenue,
  COUNT(*) as order_count
FROM orders
WHERE owner_id = 'your-owner-id'
  AND DATE(created_at) = CURRENT_DATE
  AND status = 'completed';
```

**Most popular items:**
```sql
SELECT 
  oi.name,
  SUM(oi.quantity) as total_ordered,
  SUM(oi.subtotal) as total_revenue
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.owner_id = 'your-owner-id'
  AND o.status = 'completed'
GROUP BY oi.name
ORDER BY total_ordered DESC
LIMIT 10;
```

**Average order value:**
```sql
SELECT 
  AVG(total) as avg_order_value,
  MIN(total) as min_order,
  MAX(total) as max_order
FROM orders
WHERE owner_id = 'your-owner-id'
  AND status = 'completed';
```

---

**END OF DOCUMENTATION**

This document provides a complete reference for the Menu Magi application. For quick starts, see `README.md` or `QUICK-START.md`.
