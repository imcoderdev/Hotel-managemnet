# Menu Magi - Production Restaurant Ordering SystemThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, production-ready restaurant ordering system built with Next.js 14, Supabase (PostgreSQL), and TypeScript.## Getting Started



## 🚀 Tech StackFirst, run the development server:



- **Frontend:** Next.js 14 (App Router), React 18, TypeScript```bash

- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)npm run dev

- **UI:** Tailwind CSS, shadcn/ui, Lucide Icons# or

- **Forms:** React Hook Form + Zod validationyarn dev

- **Charts:** Recharts# or

- **Notifications:** Sonner (toast)pnpm dev

# or

## 📋 Featuresbun dev

```

### For Customers

- ✅ QR code table scanningOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- ✅ Browse menu with images

- ✅ Real-time cart managementYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- ✅ Order placement

- ✅ Order confirmationThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- ✅ No login required

## Learn More

### For Restaurant Owners

- ✅ Secure authentication (Supabase Auth)To learn more about Next.js, take a look at the following resources:

- ✅ Menu management (CRUD operations)

- ✅ Image upload to cloud storage- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- ✅ QR code generation for tables- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- ✅ Real-time order tracking

- ✅ Order status workflow (waiting → accepted → preparing → on-the-way → completed)You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- ✅ Order history & analytics

- ✅ Multi-restaurant support## Deploy on Vercel



## 🛠️ Setup InstructionsThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



### 1. PrerequisitesCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


- Node.js 18+ installed
- A Supabase account (free tier works)

### 2. Supabase Setup

1. **Create a new Supabase project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Set project name, database password, region

2. **Run the database schema:**
   - Open Supabase Dashboard → SQL Editor
   - Copy the entire content of `supabase-schema.sql`
   - Paste and run it

3. **Create storage buckets:**
   - Go to Storage in Supabase Dashboard
   - Create bucket: `menu-images` (Public)
   - Create bucket: `qr-codes` (Public)

4. **Get your API credentials:**
   - Go to Project Settings → API
   - Copy the Project URL
   - Copy the anon/public key

### 3. Project Setup

```bash
# Install dependencies
npm install

# Configure environment variables
# Edit .env.local and add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Your First Owner Account

1. Go to Supabase Dashboard → Authentication
2. Click "Add User"
3. Create user with email/password
4. Copy the user's UUID
5. Insert owner record in `owners` table with that UUID

## 📁 Project Structure

```
menu-magi-nextjs/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with Toaster
│   ├── page.tsx           # Landing page
│   ├── customer/          # Customer routes
│   │   ├── table/         # Table selection
│   │   ├── menu/          # Menu browsing
│   │   ├── checkout/      # Checkout page
│   │   └── confirmation/  # Order confirmation
│   └── owner/             # Owner routes (protected)
│       ├── login/         # Owner login
│       ├── dashboard/     # Menu management
│       ├── orders/        # Kitchen dashboard
│       └── history/       # Order history
├── lib/
│   ├── utils.ts           # Utility functions
│   └── supabase/          # Supabase clients
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       └── middleware.ts  # Auth middleware
├── types/
│   └── database.ts        # TypeScript types
├── middleware.ts          # Next.js middleware (auth)
├── supabase-schema.sql    # Database schema
└── .env.local             # Environment variables
```

## 🔐 Security Features

- Row Level Security (RLS) policies
- JWT authentication via Supabase
- Middleware-based route protection
- Secure password hashing (bcrypt)
- HTTPS enforced in production

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel dashboard.

**Don't forget to add environment variables in Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 Database Schema

### Tables
- `owners` - Restaurant owner accounts
- `menu_items` - Menu items with images
- `tables` - Restaurant tables with QR codes
- `orders` - Customer orders
- `order_items` - Order line items

### Features
- Foreign key constraints
- Check constraints for data validation
- Indexes for query performance
- Triggers for timestamp updates
- Row Level Security policies

## 🔄 Real-time Features

Orders are updated in real-time using Supabase Realtime:
- Kitchen dashboard auto-refreshes when new orders arrive
- Order status updates are instant
- No polling required (WebSocket connection)

---

**Built with ❤️ for restaurants and hotels**
