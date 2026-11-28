# Vercel Deployment Guide

Complete guide to deploying your updated KUSTOMKOATS application to Vercel.

## 🎯 What You're Deploying

1. **Frontend Reorganization** - New folder structure with frontend in `frontend/` directory
2. **Payment Failure Tracking** - New admin feature for monitoring Razorpay failures

## 📋 Pre-Deployment Checklist

### 1. Database Migration (MUST DO FIRST) ⚠️

Before deploying, run the database migration on your **PRODUCTION** Supabase:

```sql
-- Go to Supabase Dashboard > SQL Editor
-- Copy and paste migration034.sql content
-- Execute the migration
```

**Verify migration:**
```sql
SELECT * FROM payment_failures LIMIT 1;
```

### 2. Deploy Supabase Functions

```bash
# Make sure you're logged into Supabase CLI
supabase login

# Link to your production project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the updated webhook
supabase functions deploy razorpay-webhook

# Verify deployment
supabase functions list
```

### 3. Update Environment Variables (If Needed)

Check your `.env` files don't have any hardcoded localhost URLs:

**Frontend (.env in frontend/)**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_API_URL=https://your-backend-domain.com  # or Railway/Render URL
```

## 🚀 Deployment Steps

### Option 1: Deploy via Git (Recommended)

#### Step 1: Commit All Changes

```bash
# Navigate to project root
cd c:\Users\saile\Desktop\huhu\KUSTOMKOATS

# Check status
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add frontend reorganization and payment failure tracking

- Reorganized project: moved frontend to frontend/ folder
- Added payment failure tracking system
- Created admin panel for monitoring failures
- Updated Razorpay webhook to capture failures
- Added backend API routes for failure management"

# Push to your Git repository
git push origin main
```

#### Step 2: Deploy to Vercel

**If Project is Already on Vercel:**
- Vercel will automatically detect the push and start deployment
- Go to Vercel Dashboard to monitor progress
- Deployment will use the updated `vercel.json` configuration

**If This is First Time Deploying:**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: Deploy via Vercel CLI Directly

```bash
# Navigate to project root
cd c:\Users\saile\Desktop\huhu\KUSTOMKOATS

# Deploy to production
vercel --prod

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: Yes (if exists) / No (if new)
# - Project name: kustomkoats (or your project name)
# - Override settings: No (use vercel.json)
```

## ⚙️ Vercel Configuration Verification

Your `vercel.json` is already updated for the new structure:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**This tells Vercel:**
- Build the frontend from the `frontend/` folder
- Output is in `frontend/dist/`
- Use client-side routing (SPA)

## 🔧 Backend Deployment

Your backend needs to be deployed separately (Vercel is for frontend only).

### Options for Backend:

#### Option 1: Railway (Recommended)

1. Go to https://railway.app
2. Create new project
3. Connect GitHub repo
4. Select `backend` folder as root directory
5. Add environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   PORT=3000
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   ```
6. Deploy

#### Option 2: Render

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add environment variables (same as Railway)
8. Deploy

#### Option 3: Keep Backend Separate

If your backend is already deployed elsewhere, just make sure:
- Environment variable `VITE_API_URL` in frontend points to your backend
- Backend CORS allows your Vercel domain

## 🌐 Environment Variables in Vercel

After deployment, set environment variables in Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_API_URL=https://your-backend-url.com
```

5. **Redeploy** to apply environment variables:
   - Go to **Deployments**
   - Click **...** on latest deployment
   - Click **Redeploy**

## ✅ Post-Deployment Verification

### 1. Check Frontend Deployment

Visit your Vercel URL: `https://your-project.vercel.app`

**Verify:**
- [ ] Website loads correctly
- [ ] Images and assets load
- [ ] Navigation works
- [ ] Products page loads
- [ ] Cart functionality works

### 2. Check Admin Panel

Visit: `https://your-project.vercel.app/admin/payment-failures`

**Verify:**
- [ ] Admin panel loads
- [ ] "Payment Failures" link appears in sidebar
- [ ] Page loads without errors
- [ ] Statistics display (may be 0 if no failures yet)

### 3. Test Payment Failure Tracking

1. Make a test payment on checkout
2. Cancel the payment (close Razorpay modal)
3. Check admin panel
4. Verify failure was logged

### 4. Check Webhook

```bash
# Check Supabase function logs
supabase functions logs razorpay-webhook --tail

# Make a test payment that fails
# Watch logs for webhook capture
```

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error: "Cannot find module"**
```bash
# Solution: Ensure frontend/package.json has all dependencies
cd frontend
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

**Error: "Build command failed"**
```bash
# Solution: Test build locally
cd frontend
npm run build

# If build succeeds locally, check Vercel logs
```

### Environment Variables Not Working

**Error: "VITE_SUPABASE_URL is undefined"**

Solution:
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Make sure variables start with `VITE_` for Vite
3. Click "Redeploy" after adding variables

### API Calls Failing

**Error: "CORS error" or "Network error"**

Solution:
1. Check `VITE_API_URL` points to correct backend
2. Check backend CORS allows Vercel domain
3. Update backend CORS:
```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-domain.vercel.app'
  ],
  credentials: true
}));
```

### Admin Panel Not Loading

**Error: "Page not found"**

Solution:
1. Check `vercel.json` has correct rewrites
2. Verify route is added in `App.jsx`
3. Check browser console for errors

### Payment Failures Not Showing

**Error: "No data"**

Solution:
1. Verify migration ran on production database
2. Check webhook is deployed to production
3. Test a payment failure
4. Check Supabase function logs

## 📊 Monitoring After Deployment

### 1. Vercel Logs

```bash
# View deployment logs
vercel logs YOUR_DEPLOYMENT_URL

# Stream real-time logs
vercel logs YOUR_DEPLOYMENT_URL --follow
```

### 2. Supabase Logs

```bash
# View function logs
supabase functions logs razorpay-webhook

# Stream real-time logs
supabase functions logs razorpay-webhook --tail
```

### 3. Check Analytics

- Vercel Dashboard > Analytics
- Monitor page load times
- Check for errors

## 🔄 Future Deployments

For future updates:

```bash
# Make changes
git add .
git commit -m "Your change description"
git push origin main

# Vercel auto-deploys from Git
# No manual action needed!
```

## 📝 Deployment Checklist

Before deploying:
- [ ] Run migration on production database
- [ ] Deploy updated Supabase functions
- [ ] Test locally (frontend + backend)
- [ ] Check all environment variables
- [ ] Commit and push to Git
- [ ] Verify Vercel deployment starts
- [ ] Check deployment logs
- [ ] Test live site
- [ ] Test admin panel
- [ ] Test payment flow
- [ ] Monitor for first 24 hours

## 🆘 Need Help?

### Common Issues:

1. **Build fails**: Check `frontend/` folder structure is correct
2. **White screen**: Check browser console, verify environment variables
3. **API errors**: Check backend URL and CORS settings
4. **Webhook not working**: Check Supabase function is deployed to production
5. **Admin panel 404**: Check vercel.json rewrites are correct

### Quick Fixes:

```bash
# Force rebuild on Vercel
vercel --prod --force

# Clear cache and rebuild
vercel --prod --no-cache

# Check deployment status
vercel ls

# View recent deployments
vercel list
```

## 🎉 Success Indicators

Your deployment is successful when:

✅ Vercel deployment shows "Ready"
✅ Website loads at your Vercel URL
✅ Admin panel accessible
✅ Payment failures page loads
✅ Webhook captures failures
✅ Statistics display correctly
✅ No console errors
✅ All features work as expected

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Deployment Logs**: Vercel Dashboard > Deployments > View Logs
- **Function Logs**: `supabase functions logs`

---

**Deployment Guide Version**: 1.0
**Last Updated**: ${new Date().toLocaleDateString()}
**Project**: KUSTOMKOATS E-Commerce Platform
