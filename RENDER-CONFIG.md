# 🚀 Render.com Deployment - Complete Configuration

## Step 1: Repository Information

**GitHub Repository URL:**
```
https://github.com/sailendrakondapalli/KUSTOMKOATS
```

**Branch:**
```
master
```

## Step 2: Service Configuration

**Service Name:**
```
kustomkoats-backend
```

**Region:**
```
Singapore (or closest to your users)
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install && npm run build
```

**OR** (if above fails, use just):
```
npm install
```

**Start Command:**
```
node server.js
```

**Instance Type:**
```
Free
```

## Step 3: Environment Variables

Click "Advanced" → Add these environment variables one by one:

### Variable 1: SUPABASE_URL
**Key:** `SUPABASE_URL`
**Value:**
```
https://gozoxlueuwnyujvvafdl.supabase.co
```

### Variable 2: SUPABASE_SERVICE_ROLE_KEY
**Key:** `SUPABASE_SERVICE_ROLE_KEY`
**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvem94bHVldXdueXVqdnZhZmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTEyMDQzMiwiZXhwIjoyMTA0Njk2NDMyfQ.DCsCeaio94tKXl4MZBGRWYoTlZjMAlwmbHE9We52X6k
```

### Variable 3: SUPABASE_ANON_KEY
**Key:** `SUPABASE_ANON_KEY`
**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvem94bHVldXdueXVqdnZhZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjA0MzIsImV4cCI6MjEwNDY5NjQzMn0.TZ0swyo2VectJn2eThLMlNhfw6gZnsRNeuqEOZNQG84
```

### Variable 4: PORT
**Key:** `PORT`
**Value:**
```
3000
```

### Variable 5: NODE_ENV
**Key:** `NODE_ENV`
**Value:**
```
production
```

### Variable 6: FRONTEND_URL
**Key:** `FRONTEND_URL`
**Value:**
```
https://kustomkoats.vercel.app
```

## Step 4: Auto-Deploy Settings

✅ Enable "Auto-Deploy" (default - deploys on git push)

## Step 5: Health Check (Optional)

If asked for health check path:
```
/health
```

## 🎯 Quick Copy Format

For easy copy-paste into Render's interface:

**Repository:**
```
https://github.com/sailendrakondapalli/KUSTOMKOATS
```

**Root Directory:**
```
backend
```

**Build:**
```
npm install
```

**Start:**
```
node server.js
```

**Environment Variables (copy each line):**
```
SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvem94bHVldXdueXVqdnZhZmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTEyMDQzMiwiZXhwIjoyMTA0Njk2NDMyfQ.DCsCeaio94tKXl4MZBGRWYoTlZjMAlwmbHE9We52X6k
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvem94bHVldXdueXVqdnZhZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjA0MzIsImV4cCI6MjEwNDY5NjQzMn0.TZ0swyo2VectJn2eThLMlNhfw6gZnsRNeuqEOZNQG84
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://kustomkoats.vercel.app
```

## 📋 Deployment Checklist

- [ ] Signed up on Render.com
- [ ] Clicked "New +" → "Web Service"
- [ ] Connected GitHub account
- [ ] Selected KUSTOMKOATS repository
- [ ] Set root directory to `backend`
- [ ] Set build command to `npm install`
- [ ] Set start command to `node server.js`
- [ ] Selected "Free" instance type
- [ ] Added all 6 environment variables
- [ ] Clicked "Create Web Service"
- [ ] Waiting for deployment (2-5 minutes)

## 🎉 After Deployment

Once Render finishes deploying:

1. **Copy your backend URL** (will look like):
   ```
   https://kustomkoats-backend.onrender.com
   ```

2. **Test the health endpoint**:
   ```
   https://kustomkoats-backend.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

3. **Update Vercel Environment Variable**:
   - Go to Vercel Dashboard
   - Your Project → Settings → Environment Variables
   - Update `VITE_API_URL` to your Render URL
   - Redeploy Vercel

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Render shows "Live" status
- ✅ Health endpoint responds
- ✅ No errors in Render logs
- ✅ Backend URL is accessible

## 🐛 If Deployment Fails

1. Check Render logs for errors
2. Verify all environment variables are correct
3. Verify root directory is `backend`
4. Verify build command is `npm install`
5. Verify start command is `node server.js`

## 📞 Your URLs

**Backend (Render):** Will be provided after deployment
**Frontend (Vercel):** https://kustomkoats.vercel.app
**Database (Supabase):** https://gozoxlueuwnyujvvafdl.supabase.co

---

**Ready to deploy!** Just follow the steps above in Render.com 🚀
