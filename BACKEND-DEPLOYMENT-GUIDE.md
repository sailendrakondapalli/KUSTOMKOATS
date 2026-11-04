# Backend Deployment Guide - Render.com

Complete guide to deploy your Node.js/Express backend to Render.com (Free tier available)

## 🎯 Why Render?

- ✅ Free tier available (750 hours/month)
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variable management
- ✅ Built-in HTTPS
- ✅ Auto-scaling
- ✅ Good for Node.js apps

## 📋 Prerequisites

- [x] Backend code pushed to GitHub (✅ Already done!)
- [ ] Render.com account (free)
- [ ] Supabase credentials ready

## 🚀 Step-by-Step Deployment

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (recommended) or email
4. Verify your email

### Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect GitHub"** (if not already connected)
4. Authorize Render to access your repositories
5. Find and select **"KUSTOMKOATS"** repository
6. Click **"Connect"**

### Step 3: Configure Service

Fill in these settings:

**Basic Settings:**
- **Name**: `kustomkoats-backend` (or your choice)
- **Region**: Choose closest to your users (e.g., Singapore, Oregon)
- **Branch**: `master`
- **Root Directory**: `backend` ⚠️ IMPORTANT!
- **Runtime**: `Node`

**Build & Deploy Settings:**
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance Type:**
- Select **"Free"** (or paid if you need always-on)
- Note: Free tier sleeps after 15 min of inactivity

### Step 4: Add Environment Variables

Click **"Advanced"** > **"Add Environment Variable"**

Add these variables:

```
SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvem94bHVldXdueXVqdnZhZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjA0MzIsImV4cCI6MjEwNDY5NjQzMn0.TZ0swyo2VectJn2eThLMlNhfw6gZnsRNeuqEOZNQG84
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

**Where to find Supabase Service Role Key:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy "service_role" secret key (NOT the anon key!)

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Render will start building your backend
3. Wait 2-5 minutes for deployment
4. You'll see logs in real-time

### Step 6: Get Your Backend URL

Once deployed:
1. You'll see a URL like: `https://kustomkoats-backend.onrender.com`
2. Copy this URL
3. Test it: `https://kustomkoats-backend.onrender.com/health`
4. You should see: `{"status":"ok"}`

## 🔧 Update Frontend to Use Backend

### Update Vercel Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Update or add:
   ```
   VITE_API_URL=https://kustomkoats-backend.onrender.com
   ```
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"..."** on latest deployment
8. Click **"Redeploy"**

### Update Local .env (for development)

Update `frontend/.env`:
```env
# For local development
VITE_API_URL=http://localhost:3001

# For production (Vercel will override this)
```

## ✅ Verification Steps

### 1. Test Backend Health Endpoint

```bash
curl https://kustomkoats-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "KustomKoats Backend API"
}
```

### 2. Test Products Endpoint

```bash
curl https://kustomkoats-backend.onrender.com/api/products?limit=5
```

Should return products from Supabase.

### 3. Test from Frontend

1. Open your Vercel site
2. Open browser console (F12)
3. Check for API errors
4. Products should load correctly

## 🔄 Auto-Deploy on Push

Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update backend"
git push origin master

# Render automatically deploys!
```

## 🐛 Troubleshooting

### Issue 1: Build Fails

**Error**: "Cannot find module"

**Solution**:
1. Go to Render Dashboard > Your Service
2. Check **"Build Command"** is: `npm install`
3. Check **"Start Command"** is: `node server.js`
4. Check **"Root Directory"** is: `backend`

### Issue 2: Service Crashes on Start

**Error**: "Application failed to respond"

**Solution**:
1. Check Render logs for errors
2. Verify environment variables are set correctly
3. Make sure `PORT` is set to `3000` or use `process.env.PORT`

### Issue 3: CORS Errors

**Error**: "Access-Control-Allow-Origin"

**Solution**: Update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-domain.vercel.app',
    'https://kustomkoats.vercel.app' // Add your actual domain
  ],
  credentials: true
}));
```

Commit and push to redeploy.

### Issue 4: Service Sleeps (Free Tier)

**Issue**: First request takes 30 seconds

**Why**: Free tier sleeps after 15 minutes of inactivity

**Solutions**:
- Upgrade to paid tier ($7/month for always-on)
- Use a service like UptimeRobot to ping every 10 minutes
- Accept the cold start delay

### Issue 5: Environment Variable Not Working

**Solution**:
1. Go to Render Dashboard
2. Click your service
3. Go to **Environment** tab
4. Verify all variables are set
5. Click **"Manual Deploy"** > **"Clear build cache & deploy"**

## 📊 Monitor Your Backend

### View Logs

1. Go to Render Dashboard
2. Click your service
3. Go to **Logs** tab
4. See real-time logs

### Metrics

1. Go to **Metrics** tab
2. See CPU, Memory, Request volume
3. Monitor response times

## 💰 Free Tier Limits

Render Free Tier:
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 512 MB RAM
- ⚠️ Shared CPU

Upgrade needed if:
- Need always-on service
- High traffic (>100 requests/min)
- Need more resources

## 🎯 Alternative: Railway (Alternative Option)

If you prefer Railway instead:

### Railway Deployment

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Select KUSTOMKOATS repo
6. Click **"Add variables"**
7. Add same environment variables
8. Set **"Root Directory"** to `backend`
9. Deploy!

Railway auto-detects Node.js and uses package.json scripts.

## 📝 Post-Deployment Checklist

After backend is deployed:

- [ ] Backend URL accessible
- [ ] Health endpoint responds
- [ ] Products API works
- [ ] Frontend updated with backend URL
- [ ] Vercel redeployed with new env var
- [ ] CORS configured correctly
- [ ] Environment variables verified
- [ ] Test payment flow works
- [ ] Test admin panel works
- [ ] Monitor logs for errors

## 🔐 Security Checklist

- [ ] Service role key is secret (not in frontend)
- [ ] CORS only allows your domains
- [ ] Environment variables are private
- [ ] No sensitive data in logs
- [ ] HTTPS enabled (automatic on Render)

## 🚦 Production Readiness

Before going live:

1. **Load Testing**: Test with expected traffic
2. **Error Monitoring**: Set up error tracking (Sentry)
3. **Logging**: Ensure proper logging
4. **Backup Plan**: Know how to rollback
5. **Monitoring**: Set up uptime monitoring

## 📞 Support

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Your Deployment
- Backend: https://kustomkoats-backend.onrender.com
- Frontend: https://your-project.vercel.app
- Database: https://supabase.com/dashboard

## 🎉 You're Done!

Once complete, your architecture:

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼─────────┐
│  Vercel (Frontend)│
│  React + Vite    │
└────────┬─────────┘
         │
         │ API Calls
         │
┌────────▼─────────┐
│ Render (Backend) │
│  Node.js/Express │
└────────┬─────────┘
         │
         │ Database Queries
         │
┌────────▼─────────┐
│    Supabase      │
│   PostgreSQL     │
└──────────────────┘
```

---

**Deployment Time**: ~10-15 minutes
**Difficulty**: Easy 🟢
**Cost**: Free (with limits)

Need help? Check Render docs or the troubleshooting section above.
