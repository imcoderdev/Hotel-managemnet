# 🎯 Quick Reference - Menu Magi Development

## 📂 Project Structure

```
menu-magi-nextjs/
├── app/                    # Routes (Next.js App Router)
│   ├── page.tsx           # Landing page (/)
│   ├── layout.tsx         # Root layout
│   ├── customer/          # Customer routes
│   │   ├── table/page.tsx
│   │   ├── menu/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── confirmation/[id]/page.tsx
│   └── owner/             # Owner routes (protected)
│       ├── login/page.tsx
│       ├── dashboard/page.tsx
│       ├── orders/page.tsx
│       └── history/page.tsx
├── components/
│   └── ui/                # shadcn components
├── lib/
│   ├── utils.ts           # Helper functions
│   └── supabase/          # Supabase clients
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       └── middleware.ts  # Auth helper
├── types/
│   └── database.ts        # TypeScript types
├── middleware.ts          # Next.js middleware
├── .env.local             # Environment variables
└── supabase-schema.sql    # Database schema
```

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 💻 Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Install package
npm install package-name

# Add shadcn component
npx shadcn@latest add button
```

## 🗄️ Database Tables

```sql
owners          # Restaurant owners
menu_items      # Menu items with prices
tables          # Restaurant tables
orders          # Customer orders
order_items     # Order line items
```

## 📝 Code Snippets

### Client Component (Interactive)

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [data, setData] = useState([]);
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('table_name')
        .select('*');
      setData(data || []);
    }
    fetchData();
  }, []);
  
  return <div>{/* Use data */}</div>;
}
```

### Server Component (Fast Loading)

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('table_name')
    .select('*');
  
  return <div>{/* Use data */}</div>;
}
```

### Real-time Subscription

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

useEffect(() => {
  const supabase = createClient();
  
  const channel = supabase
    .channel('my-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders',
    }, (payload) => {
      console.log('Change received!', payload);
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Authentication

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Logout
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Insert Data

```typescript
const { data, error } = await supabase
  .from('menu_items')
  .insert({
    owner_id: userId,
    name: 'Pizza',
    price: 12.99,
    is_available: true,
  })
  .select()
  .single();
```

### Update Data

```typescript
const { error } = await supabase
  .from('orders')
  .update({ status: 'preparing' })
  .eq('id', orderId);
```

### Delete Data

```typescript
const { error } = await supabase
  .from('menu_items')
  .delete()
  .eq('id', itemId);
```

### Upload Image

```typescript
const { data, error } = await supabase.storage
  .from('menu-images')
  .upload(`${userId}/${filename}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('menu-images')
  .getPublicUrl(`${userId}/${filename}`);
```

## 🎨 UI Components (shadcn)

```bash
# Install components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add toast
```

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";

// Use
<Button onClick={() => toast.success("Done!")}>
  Click me
</Button>
```

## 🛣️ Routing

```typescript
// Navigate (Client)
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/customer/menu');

// Link (Better for performance)
import Link from 'next/link';

<Link href="/customer/menu">Go to Menu</Link>

// Dynamic routes
/confirmation/[orderId]
// File: app/confirmation/[orderId]/page.tsx
// Access: params.orderId
```

## 🔒 Protected Routes

```typescript
// middleware.ts automatically protects /owner/* routes

// In page, check auth:
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OwnerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/owner/login');
  
  return <div>Protected content</div>;
}
```

## 🐛 Debugging

```typescript
// Check Supabase connection
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Check auth status
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check database query
const { data, error } = await supabase.from('table').select('*');
console.log('Data:', data);
console.log('Error:', error);

// Check real-time connection
supabase.channel('test').subscribe((status) => {
  console.log('Status:', status);
});
```

## 📊 Common Queries

```sql
-- Get menu items for owner
SELECT * FROM menu_items 
WHERE owner_id = 'xxx' 
AND is_available = true;

-- Get orders with items
SELECT 
  orders.*,
  json_agg(order_items.*) as items
FROM orders
LEFT JOIN order_items ON orders.id = order_items.order_id
WHERE orders.owner_id = 'xxx'
GROUP BY orders.id
ORDER BY created_at DESC;

-- Daily revenue
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total) as revenue
FROM orders
WHERE owner_id = 'xxx' 
AND status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🚀 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import GitHub repo to Vercel
- [ ] Add environment variables in Vercel
- [ ] Deploy!
- [ ] Test production URL
- [ ] Set up custom domain (optional)

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid API key" | Check `.env.local`, restart dev server |
| 404 on routes | Create `page.tsx` in route folder |
| Auth not working | Check middleware.ts, verify Supabase auth |
| RLS denying access | Check policies in Supabase dashboard |
| Images not loading | Check storage bucket is public |
| Real-time not working | Enable realtime in Supabase dashboard |

## 📚 Quick Links

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs

---

**Keep this file open while coding! 📌**
