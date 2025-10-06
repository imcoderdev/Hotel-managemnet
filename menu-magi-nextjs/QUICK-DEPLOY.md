# 🚀 QUICK DEPLOYMENT - Choose Your Path

## Your Project Structure

You have TWO projects:
1. **Root Project** (Vite/React) - Old version
2. **menu-magi-nextjs** (Next.js) - Current working version ✅

We need to deploy **menu-magi-nextjs** folder.

---

## 🎯 EASIEST METHOD: Vercel Dashboard

### Step 1: Get Supabase Credentials

1. Open Supabase Dashboard
2. Go to: **Settings** → **API**
3. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGci...`

### Step 2: Push to GitHub

```powershell
# Navigate to menu-magi-nextjs folder
cd "D:\hotel management\menu-magi-nextjs"

# Check git status
git status

# If not initialized, initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - Menu Magi"

# If not already connected to GitHub:
# Create a NEW repo on GitHub called "menu-magi-nextjs"
# Then:
git remote add origin https://github.com/YOUR_USERNAME/menu-magi-nextjs.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. **Go to:** https://vercel.com/new
2. **Import Git Repository**
3. **Select:** `menu-magi-nextjs` repository
4. **Configure:**
   - Framework: **Next.js** ✅ (auto-detected)
   - Root Directory: **Leave as `.`** (deploy from root of the repo)
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Environment Variables** (IMPORTANT!):
   Click "Add" for each:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   Value: paste your Supabase URL

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: paste your anon key
   ```

6. **Click "Deploy"** 🚀

---

## ⚡ FASTER: Deploy Current Folder

If you want to deploy just the Next.js app:

```powershell
# Navigate to the Next.js folder
cd "D:\hotel management\menu-magi-nextjs"

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Answer prompts:
# ? Set up and deploy "D:\hotel management\menu-magi-nextjs"? Y
# ? Which scope? Your username
# ? Link to existing project? N
# ? What's your project's name? menu-magi
# ? In which directory is your code located? ./
# ? Want to override settings? N

# After first deployment, deploy to production:
vercel --prod
```

---

## 📝 Environment Variables (Add in Vercel)

After deployment or during setup, add these in Vercel dashboard:

**Go to:** Project Settings → Environment Variables

Add:
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...your-key
```

**Redeploy** after adding env vars.

---

## ✅ Post-Deployment Checklist

1. **Update Supabase URLs:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add: `https://your-app.vercel.app/**`

2. **Test the app:**
   - Visit: `https://your-app.vercel.app`
   - Login as owner
   - Upload menu item
   - Place test order

3. **Generate new QR codes:**
   - Update URL from `localhost:3000` to `your-app.vercel.app`

---

## 🆘 Need Help?

**Common Issues:**

1. **Build fails:** Run `npm run build` locally first
2. **Env vars not working:** Make sure they start with `NEXT_PUBLIC_`
3. **404 on routes:** Check `Root Directory` is set correctly
4. **Images not uploading:** Verify Supabase RLS policies

---

## 🎉 You're Done!

Your app will be live at:
**https://menu-magi.vercel.app** (or similar)

Want me to help with the deployment? Let me know where you get stuck!
