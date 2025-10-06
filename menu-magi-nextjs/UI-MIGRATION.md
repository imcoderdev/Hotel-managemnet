# UI Migration from Vite to Next.js + Supabase

## Overview
Migrating all pages from the Vite + localStorage app to Next.js + Supabase while keeping the same UI/UX.

## Pages to Migrate

### ✅ Already Created (Basic Versions)
1. **Landing Page** (`app/page.tsx`) - Customer vs Owner selection
2. **Table Select** (`app/customer/table/page.tsx`) - Choose table number
3. **Customer Menu** (`app/customer/menu/page.tsx`) - Browse menu, add to cart
4. **Owner Login** (`app/owner/login/page.tsx`) - Email/Password + Google OAuth
5. **Owner Dashboard** (`app/owner/dashboard/page.tsx`) - Basic version (needs upgrade)

### 🔄 Needs Full UI Migration
1. **Owner Dashboard** - Add full menu management (CRUD operations)
2. **Kitchen Orders** (`app/owner/orders/page.tsx`) - Real-time order tracking
3. **Checkout Page** (`app/customer/checkout/page.tsx`) - Order summary & payment
4. **Confirmation Page** (`app/customer/confirmation/[orderId]/page.tsx`) - Order status tracking

## Changes from Vite to Next.js

### Routing
- **Vite:** React Router DOM (`useNavigate`, `useParams`)
- **Next.js:** App Router (`useRouter from next/navigation`, dynamic routes)

### Data Storage
- **Vite:** localStorage functions from `lib/localStorage.ts`
- **Next.js:** Supabase queries using `createClient()` from `lib/supabase/client.ts`

### Authentication
- **Vite:** localStorage based owner sessions
- **Next.js:** Supabase Auth with JWT tokens

### Real-time Updates
- **Vite:** `setInterval` polling every 2-3 seconds
- **Next.js:** Supabase Realtime subscriptions (more efficient)

## UI Components (Already Available)
All shadcn/ui components are already installed:
- Button, Card, Dialog, Input, Label, Textarea
- Badge, Separator, Toast (sonner)
- QRCodeSVG (qrcode.react)

## Migration Strategy

### 1. Owner Dashboard (Full Menu Management)
**Features to Add:**
- Menu item CRUD operations
- Image upload (base64 for now, Supabase Storage later)
- Category management
- QR code generation for shop URL
- Navigation to Orders page

**Data Changes:**
- `getAllMenuItems()` → `supabase.from('menu_items').select()`
- `addMenuItem()` → `supabase.from('menu_items').insert()`
- `updateMenuItem()` → `supabase.from('menu_items').update()`
- `deleteMenuItem()` → `supabase.from('menu_items').delete()`

### 2. Kitchen Orders Page
**Features:**
- Display all orders grouped by status
- Status workflow buttons (Accept → Preparing → On the Way → Completed)
- Real-time updates using Supabase Realtime
- Filter by active/completed orders

**Data Changes:**
- `getAllOrders()` → `supabase.from('orders').select('*, order_items(*)')`
- `updateOrderStatus()` → `supabase.from('orders').update({ status })`
- Polling → Supabase Realtime subscription

### 3. Checkout Page
**Features:**
- Display cart summary
- Calculate tax (10%)
- Payment simulation
- Create order in database

**Data Changes:**
- `createOrder()` → `supabase.from('orders').insert()` + `order_items.insert()`
- Get owner_id from menu items instead of sessionStorage

### 4. Confirmation Page
**Features:**
- Display order details
- Live status tracking with progress bar
- Real-time updates on status changes
- Order again / Back to home buttons

**Data Changes:**
- `getAllOrders().find()` → `supabase.from('orders').select().eq('id', orderId)`
- Polling → Supabase Realtime subscription

## Next Steps

1. **Replace Owner Dashboard** with full menu management UI
2. **Create Kitchen Orders** page (`app/owner/orders/page.tsx`)
3. **Create Checkout** page (`app/customer/checkout/page.tsx`)
4. **Create Confirmation** page (`app/customer/confirmation/[orderId]/page.tsx`)

## Status
- [x] Project setup
- [x] Authentication (Login/Signup)
- [x] Basic Dashboard
- [ ] Full Menu Management Dashboard
- [ ] Kitchen Orders Page  
- [ ] Checkout Page
- [ ] Confirmation Page

