# 🚀 Deploy Menu Magi to Vercel - Complete Guide

## Prerequisites Checklist
- [x] Code is working locally
- [x] All fixes implemented
- [x] Supabase project is set up
- [ ] Git repository is ready
- [ ] Vercel account created

---

## Step 1: Prepare Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get these from Supabase:**
1. Go to Supabase Dashboard
2. Click on your project
3. Go to Settings → API
4. Copy `Project URL` and `anon public` key

---

## Step 2: Update .gitignore

Make sure `.env.local` is in `.gitignore` (it should already be there):

```
.env.local
.env*.local
node_modules
.next
```

---

## Step 3: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment - Menu Magi app with all fixes"

# Create GitHub repo and push
# (You already have: menu-magi-app)
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel:** https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import** your `menu-magi-app` repository
5. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./menu-magi-nextjs` or `.` (depending on your structure)
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_key_here
   ```

7. **Click "Deploy"** 🚀

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: menu-magi
# - Directory: ./menu-magi-nextjs (or ./)
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

---

## Step 5: Configure Supabase for Production

After deployment, update Supabase settings:

1. **Go to Supabase Dashboard** → Authentication → URL Configuration
2. **Add your Vercel URL** to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

3. **Storage CORS settings:**
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE storage.buckets 
   SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
   WHERE id = 'menu-images';
   ```

---

## Step 6: Update QR Codes

After deployment, update your QR codes to use the production URL:

**Old URL (local):**
```
http://localhost:3000/customer/table?ownerId=YOUR_ID
```

**New URL (production):**
```
https://your-app.vercel.app/customer/table?ownerId=YOUR_ID
```

Generate new QR codes with the production URL.

---

## Step 7: Test Production Deployment

1. **Owner Login:** `https://your-app.vercel.app/owner/login`
2. **Upload Menu Items** - Test image upload
3. **Scan QR Code** - Test customer flow
4. **Place Order** - Test notifications
5. **Check All Features:**
   - ✅ Image uploads work
   - ✅ Orders appear in dashboard
   - ✅ Notifications fire
   - ✅ Payments work
   - ✅ Currency shows ₹
   - ✅ Language toggle works

---

## Troubleshooting

### Build Fails
- Check for TypeScript errors: `npm run build` locally
- Fix any errors before pushing

### Environment Variables Not Working
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding env vars

### Images Not Uploading
- Check Supabase Storage RLS policies
- Verify bucket is public for reads

### Orders Not Showing
- Check RLS policies are applied
- Verify environment variables are set

---

## Post-Deployment Checklist

- [ ] App loads on Vercel URL
- [ ] Owner can log in
- [ ] Owner can upload menu items
- [ ] QR code redirects work
- [ ] Customers can place orders
- [ ] Notifications work
- [ ] All prices show ₹
- [ ] Language toggle works
- [ ] Mobile responsive

---

## Useful Commands

```bash
# View deployment logs
vercel logs

# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback

# Open production in browser
vercel --prod --open
```

---

## 🎉 Success!

Your Menu Magi app should now be live at:
**https://your-app.vercel.app**

Share this URL with restaurant owners! 🍽️
