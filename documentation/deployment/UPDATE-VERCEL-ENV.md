# 🔧 Update Vercel Environment Variable

## Your Backend is Live! 🎉

**Backend URL:** `https://kustomkoats-backend.onrender.com`

Now you need to update your frontend to use this URL.

## Step 1: Update Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Click on your **kustomkoats** project
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Find `VITE_API_URL` (or add it if it doesn't exist)
6. Update/Set the value to:
   ```
   https://kustomkoats-backend.onrender.com
   ```
7. Make sure it's set for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
8. Click **Save**

## Step 2: Redeploy Vercel

After updating the environment variable:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Confirm the redeployment
6. Wait 2-3 minutes for deployment to complete

## Step 3: Test Your Site

Once redeployment is done:

1. Visit: `https://kustomkoats.vercel.app`
2. Products should now load! ✅
3. Check browser console (F12) - no API errors
4. Test checkout flow
5. Test admin panel

## Quick Verification Commands

### Test Backend Health
```bash
curl https://kustomkoats-backend.onrender.com/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "KustomKoats Backend API"
}
```

### Test Products API
```bash
curl https://kustomkoats-backend.onrender.com/api/products?limit=5
```

Should return products list.

## Alternative: Update via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Set environment variable
vercel env add VITE_API_URL production

# When prompted, enter:
https://kustomkoats-backend.onrender.com

# Redeploy
vercel --prod
```

## Update Local Development Too

Update `frontend/.env`:

```env
# Local development uses localhost
VITE_API_URL=http://localhost:3001

# Production (Vercel overrides this)
# VITE_API_URL=https://kustomkoats-backend.onrender.com
```

Note: Vercel will override this with the environment variable you set in the dashboard.

## ✅ Success Checklist

- [ ] Updated `VITE_API_URL` in Vercel
- [ ] Redeployed Vercel
- [ ] Tested backend health endpoint
- [ ] Visited frontend site
- [ ] Products loading correctly
- [ ] No console errors
- [ ] Checkout works
- [ ] Admin panel accessible

## 🎯 Your Complete Architecture

```
User Browser
     ↓
Vercel (Frontend)
https://kustomkoats.vercel.app
     ↓ API calls to VITE_API_URL
Render (Backend)
https://kustomkoats-backend.onrender.com
     ↓ Database queries
Supabase (Database)
https://gozoxlueuwnyujvvafdl.supabase.co
```

## 🐛 Troubleshooting

**Products still not loading?**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check browser console for errors
3. Verify Vercel environment variable is saved
4. Make sure you redeployed after updating env var

**CORS Error?**
The backend is already configured with CORS. If you see CORS errors:
1. Check the backend logs in Render dashboard
2. Verify `FRONTEND_URL` is set correctly in Render

**Backend sleeping (Free tier)?**
- Free tier sleeps after 15 minutes
- First request may take 30 seconds to wake up
- Subsequent requests will be fast

---

**Status**: Backend Live ✅ | Frontend needs update ⏳
**Next**: Update Vercel environment variable and redeploy!
