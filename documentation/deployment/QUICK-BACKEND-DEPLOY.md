# ⚡ Quick Backend Deployment (5 Minutes)

## Option 1: Render.com (Recommended - Free Tier)

### Step 1: Sign Up (1 min)
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub

### Step 2: Deploy (2 min)
1. Click **"New +"** > **"Web Service"**
2. Connect **KUSTOMKOATS** repo
3. Fill in:
   - Name: `kustomkoats-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Select: **Free** tier

### Step 3: Environment Variables (2 min)

Click "Advanced" and add:

```
SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=GET_FROM_SUPABASE_DASHBOARD
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Get Service Role Key:**
- Supabase Dashboard > Settings > API > service_role (secret)

### Step 4: Deploy!
1. Click "Create Web Service"
2. Wait 2-3 minutes
3. Copy your URL: `https://kustomkoats-backend.onrender.com`

### Step 5: Update Frontend
1. Vercel Dashboard > Settings > Environment Variables
2. Add/Update:
   ```
   VITE_API_URL=https://kustomkoats-backend.onrender.com
   ```
3. Redeploy Vercel

## Option 2: Railway (Alternative - $5/month)

### Step 1: Sign Up
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy
1. Click "New Project" > "Deploy from GitHub"
2. Select KUSTOMKOATS
3. Add environment variables (same as above)
4. Set root directory to `backend`
5. Deploy!

## Option 3: Vercel (Node.js Serverless)

Vercel can also host the backend:

### Deploy Backend to Vercel

1. Create `vercel.json` in backend folder:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

2. Deploy:
```bash
cd backend
vercel --prod
```

## 🧪 Test Your Backend

After deployment, test:

```bash
# Replace with your actual backend URL
curl https://kustomkoats-backend.onrender.com/health

# Should return:
{"status":"ok","timestamp":"..."}
```

## ✅ Success Checklist

- [ ] Backend deployed
- [ ] Health endpoint works
- [ ] Environment variables set
- [ ] Frontend updated with backend URL
- [ ] Vercel redeployed
- [ ] Products load on site

## 🐛 Quick Troubleshooting

**Backend won't start?**
- Check Root Directory is `backend`
- Check Start Command is `node server.js`
- Check environment variables

**CORS error?**
- Update CORS in `backend/server.js` to include your Vercel domain

**Products not loading?**
- Check VITE_API_URL in Vercel environment variables
- Check backend logs for errors

## 📚 Full Guide

See `BACKEND-DEPLOYMENT-GUIDE.md` for detailed instructions.

---

**Choose Option 1 (Render)** if you want:
- Free tier
- Easy setup
- Auto-deploy from GitHub

**Total Time**: 5-10 minutes
