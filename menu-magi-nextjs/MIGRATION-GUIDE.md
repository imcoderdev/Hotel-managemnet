# Migration Comparison: Vite → Next.js + Supabase

## 📊 Key Differences

| Feature | Old (Vite + localStorage) | New (Next.js + Supabase) |
|---------|--------------------------|--------------------------|
| **Routing** | React Router DOM (client-side) | Next.js App Router (server + client) |
| **Data Storage** | Browser localStorage | PostgreSQL (Supabase) |
| **Authentication** | localStorage flag | Supabase Auth (JWT tokens) |
| **Images** | Base64 in localStorage | Supabase Storage (CDN) |
| **Real-time** | Manual polling (3s interval) | WebSocket (Supabase Realtime) |
| **Multi-user** | ❌ Single browser only | ✅ Multiple users/devices |
| **Data Persistence** | ❌ Lost on cache clear | ✅ Permanent in database |
| **Scalability** | ❌ Limited to browser | ✅ Unlimited scaling |
| **Security** | ❌ Plain text passwords | ✅ Encrypted auth |

## 🗂️ File Structure Comparison

### Old Structure (Vite)
```
src/
├── pages/           # React components (routes)
├── components/ui/   # shadcn components
├── lib/
│   └── localStorage.ts   # All data management
├── types/
│   └── index.ts     # TypeScript types
└── App.tsx          # React Router setup
```

### New Structure (Next.js)
```
app/
├── layout.tsx       # Root layout
├── page.tsx         # Landing page
├── customer/        # Customer routes
│   ├── table/
│   │   └── page.tsx
│   ├── menu/
│   │   └── page.tsx
│   └── checkout/
│       └── page.tsx
└── owner/           # Owner routes (protected)
    ├── login/
    │   └── page.tsx
    ├── dashboard/
    │   └── page.tsx
    └── orders/
        └── page.tsx

lib/
└── supabase/        # Supabase clients
    ├── client.ts    # Browser
    ├── server.ts    # Server
    └── middleware.ts

middleware.ts        # Route protection
```

## 🔄 Code Migration Examples

### Example 1: Get Menu Items

**OLD (localStorage):**
```typescript
// In component
import { getAllMenuItems } from "@/lib/localStorage";

function CustomerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  
  useEffect(() => {
    const items = getAllMenuItems(); // From localStorage
    setMenuItems(items);
  }, []);
}
```

**NEW (Supabase):**
```typescript
// In component (Client Component)
'use client';

import { createClient } from '@/lib/supabase/client';

function CustomerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);
      
      if (data) setMenuItems(data);
    }
    fetchMenu();
  }, []);
}
```

**OR (Server Component - Better):**
```typescript
// In app/customer/menu/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function MenuPage() {
  const supabase = await createClient();
  
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true);

  return <MenuDisplay items={menuItems} />;
}
```

### Example 2: Owner Authentication

**OLD (localStorage):**
```typescript
// lib/localStorage.ts
export function loginOwner(username: string, password: string) {
  const owners = getAllOwners();
  const owner = owners.find(o => 
    o.username === username && o.password === password
  );
  
  if (owner) {
    localStorage.setItem('current_owner_id', owner.id);
  }
  return owner;
}

// In component
const handleLogin = () => {
  const owner = loginOwner(username, password);
  if (owner) {
    navigate('/owner/dashboard');
  }
};
```

**NEW (Supabase Auth):**
```typescript
// In app/owner/login/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';

const handleLogin = async () => {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (data.user) {
    router.push('/owner/dashboard');
  }
};
```

### Example 3: Create Order

**OLD (localStorage):**
```typescript
// lib/localStorage.ts
export function createOrder(tableNumber, items, total, ownerId) {
  const orders = getAllOrders();
  
  const newOrder = {
    id: Date.now().toString(),
    tableNumber,
    items,
    total,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    ownerId,
  };
  
  orders.push(newOrder);
  localStorage.setItem('restaurant_orders', JSON.stringify(orders));
  return newOrder;
}
```

**NEW (Supabase):**
```typescript
// In app/customer/checkout/actions.ts (Server Action)
'use server';

import { createClient } from '@/lib/supabase/server';

export async function createOrder(
  tableNumber: number,
  items: CartItem[],
  total: number
) {
  const supabase = await createClient();
  
  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_number: tableNumber,
      subtotal: total,
      tax: total * 0.1,
      total: total * 1.1,
      status: 'waiting',
    })
    .select()
    .single();
  
  if (orderError) throw orderError;
  
  // Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    menu_item_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));
  
  await supabase.from('order_items').insert(orderItems);
  
  return order;
}
```

### Example 4: Real-time Order Updates

**OLD (Polling):**
```typescript
// In Orders.tsx
useEffect(() => {
  const interval = setInterval(() => {
    loadOrders(); // Fetch from localStorage every 3s
  }, 3000);
  
  return () => clearInterval(interval);
}, []);
```

**NEW (Realtime WebSocket):**
```typescript
// In app/owner/orders/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';

useEffect(() => {
  const supabase = createClient();
  
  // Subscribe to real-time changes
  const channel = supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        console.log('Order changed!', payload);
        // Update UI automatically
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## 🎨 UI Component Changes

Most shadcn/ui components work the same! Just ensure:

1. **Add 'use client' directive** for interactive components:
```typescript
'use client';

import { Button } from "@/components/ui/button";
```

2. **Server Components** don't need it:
```typescript
// No 'use client' needed
import { Card } from "@/components/ui/card";

export default async function Page() {
  // Can use async/await directly
  const data = await fetchData();
  return <Card>{data}</Card>;
}
```

## 📦 Package Changes

**Removed:**
- ❌ `react-router-dom` (replaced by Next.js routing)
- ❌ `@tanstack/react-query` (optional - Next.js has built-in caching)

**Added:**
- ✅ `@supabase/supabase-js`
- ✅ `@supabase/ssr`

**Kept:**
- ✅ All shadcn/ui components
- ✅ `lucide-react`
- ✅ `sonner`
- ✅ `react-hook-form` + `zod`
- ✅ `recharts`

## 🚀 Deployment Differences

**OLD (Vite):**
- Build: `npm run build` → static files in `dist/`
- Deploy: Upload to any static host (Netlify, Vercel, etc.)
- No server needed

**NEW (Next.js):**
- Build: `npm run build` → optimized Next.js build
- Deploy: Vercel (automatic), or any Node.js host
- Requires Node.js runtime (but Vercel handles it)

## 💾 Data Migration

To migrate your existing localStorage data to Supabase:

1. **Export from localStorage:**
```typescript
const oldMenuItems = localStorage.getItem('restaurant_menu');
const oldOrders = localStorage.getItem('restaurant_orders');
console.log(JSON.parse(oldMenuItems));
```

2. **Import to Supabase:**
```typescript
// Run this once in browser console on new app
const oldData = [...]; // Paste from step 1

const supabase = createClient();
await supabase.from('menu_items').insert(oldData);
```

## 🔐 Security Improvements

**OLD:**
- Plain text passwords in localStorage
- No encryption
- Anyone can inspect localStorage

**NEW:**
- Bcrypt hashed passwords
- JWT tokens (HTTP-only cookies)
- Row Level Security (RLS)
- Server-side validation

## ⚡ Performance Improvements

**OLD:**
- Client-side rendering only
- No caching
- Large JavaScript bundle

**NEW:**
- Server-side rendering (SSR)
- Automatic code splitting
- Image optimization
- Edge caching
- Smaller client bundle

---

**Summary:** The new architecture is production-ready, scalable, and secure! 🎉
