# 🚀 Complete Setup Guide - Menu Magi Migration

This guide will walk you through migrating from the localStorage version to the production Supabase + Next.js version.

## ✅ Current Status

✅ Next.js 14 project created  
✅ Supabase client libraries installed  
✅ TypeScript types defined  
✅ Database schema created  
✅ Middleware configured  
✅ Landing page created  

## 📝 Next Steps

### Step 1: Setup Supabase Project (15 minutes)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up with GitHub (easiest)

2. **Create New Project**
   - Click "New Project"
   - Organization: Create new or use existing
   - Project name: `menu-magi-prod`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Click "Create new project" (takes ~2 minutes)

3. **Run Database Schema**
   - Wait for project to finish setting up
   - Go to SQL Editor (left sidebar)
   - Click "New Query"
   - Open `supabase-schema.sql` in your project
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run" (bottom right)
   - Should see "Success. No rows returned"

4. **Create Storage Buckets**
   - Go to Storage (left sidebar)
   - Click "New bucket"
     - Name: `menu-images`
     - Public: ✅ ON
     - Click "Create bucket"
   - Click "New bucket" again
     - Name: `qr-codes`
     - Public: ✅ ON
     - Click "Create bucket"

5. **Get API Credentials**
   - Go to Project Settings (gear icon, bottom left)
   - Click "API" tab
   - You'll see:
     - Project URL (starts with https://)
     - anon/public key (starts with eyJ...)
   - Keep this tab open

### Step 2: Configure Environment Variables (2 minutes)

1. **Edit `.env.local` file**
   - Open `menu-magi-nextjs/.env.local`
   - Replace the placeholders:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Save the file**

### Step 3: Test the Setup (5 minutes)

1. **Start Development Server**
   ```bash
   cd menu-magi-nextjs
   npm run dev
   ```

2. **Open Browser**
   - Go to http://localhost:3000
   - You should see the landing page with:
     - "I'm a Customer" card
     - "I'm the Owner" card

3. **Test Supabase Connection**
   - Open browser console (F12)
   - Go to Network tab
   - Click "I'm the Owner"
   - You should see requests to Supabase (no errors)

### Step 4: Create Your First Owner Account (5 minutes)

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to Supabase Dashboard → Authentication
2. Click "Add user" → "Create new user"
3. Email: `owner@yourrestaurant.com`
4. Password: Create a strong password
5. ✅ Auto Confirm User
6. Click "Create user"
7. Copy the user's UUID (looks like: `a1b2c3d4-...`)

8. Go to Supabase Dashboard → Table Editor
9. Select `owners` table
10. Click "Insert" → "Insert row"
11. Fill in:
    - id: Paste the UUID from step 7
    - email: `owner@yourrestaurant.com`
    - restaurant_name: Your Restaurant Name
    - phone: Your phone (optional)
    - address: Your address (optional)
12. Click "Save"

**Option B: Using SQL (Advanced)**

First create auth user, then run:
```sql
INSERT INTO owners (id, email, restaurant_name, phone, address)
VALUES (
  'paste-auth-user-uuid-here',
  'owner@yourrestaurant.com',
  'My Amazing Restaurant',
  '+1234567890',
  '123 Food Street'
);
```

### Step 5: What's Next?

Now you have:
✅ Working Next.js app
✅ Supabase database configured
✅ Owner account created
✅ Storage buckets ready

**Remaining Pages to Create:**

1. **Owner Login Page** (`/owner/login`)
   - Login form with email/password
   - Uses Supabase Auth

2. **Owner Dashboard** (`/owner/dashboard`)
   - Menu management (CRUD)
   - Image upload to Supabase Storage
   - QR code generation

3. **Customer Table Selection** (`/customer/table`)
   - Select table number
   - Or scan QR code

4. **Customer Menu** (`/customer/menu`)
   - Browse menu from Supabase
   - Add to cart
   - Real-time availability

5. **Checkout Page** (`/customer/checkout`)
   - Order summary
   - Payment integration (optional)

6. **Kitchen Dashboard** (`/owner/orders`)
   - Real-time order updates
   - Status workflow

7. **Order History** (`/owner/history`)
   - Analytics & reports
   - Revenue tracking

## 🎯 Migration Strategy

### Phase 1: Core Pages (Week 1)
- [ ] Owner login page
- [ ] Customer table selection
- [ ] Customer menu page (read-only first)

### Phase 2: CRUD Operations (Week 2)
- [ ] Owner dashboard (menu management)
- [ ] Image upload to Supabase Storage
- [ ] Order creation

### Phase 3: Real-time Features (Week 3)
- [ ] Kitchen dashboard
- [ ] Real-time order updates
- [ ] Order status workflow

### Phase 4: Polish (Week 4)
- [ ] QR code generation
- [ ] Order history & analytics
- [ ] Payment integration
- [ ] Testing & bug fixes

## 🆘 Troubleshooting

### Error: "Invalid API key"
- Check your `.env.local` file
- Make sure you copied the ANON key (not service role key)
- Restart dev server after changing env variables

### Error: "Authentication required"
- RLS policies might be too strict
- Check Supabase Dashboard → Authentication
- Make sure user exists in both auth.users AND owners table

### Error: "Failed to fetch"
- Check your Project URL in `.env.local`
- Make sure Supabase project is active
- Check browser console for detailed error

### Database Connection Issues
- Verify SQL schema ran successfully
- Check Table Editor to confirm tables exist
- Look at Supabase logs (Dashboard → Logs)

## 📚 Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## 💡 Pro Tips

1. **Development Workflow**
   - Always commit before major changes
   - Test in Supabase staging project first
   - Use TypeScript strictly

2. **Performance**
   - Use Server Components when possible
   - Optimize images with Next.js Image
   - Index database queries

3. **Security**
   - Never expose service role key
   - Always use RLS policies
   - Validate input on server-side

4. **Deployment**
   - Deploy to Vercel (automatic)
   - Use environment variables in Vercel Dashboard
   - Enable Vercel Analytics

---

**Ready to start? Begin with Step 1! 🚀**
