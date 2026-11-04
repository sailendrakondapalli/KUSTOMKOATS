# Quick Start: Backend API Setup

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (gozoxlueuwnyujvvafdl)
3. Go to **Settings** → **API**
4. Find "Project API keys" section
5. Copy the **`service_role`** key (NOT the anon key)
   - It should start with `eyJhbGci...` and be much longer

### Step 2: Configure Backend

Open `backend/.env` and replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI... (your actual key)
```

⚠️ **IMPORTANT**: 
- This key is SECRET and should NEVER be exposed to the frontend
- Never commit this file to Git (already in .gitignore)
- This key bypasses Row Level Security - keep it secure!

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════╗
║   KustomKoats Backend API Server              ║
║   Running on: http://localhost:3001           ║
╚═══════════════════════════════════════════════╝
```

### Step 4: Test the API

Open a new terminal and test:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "KustomKoats Backend API"
}
```

### Step 5: Test Products Endpoint

```bash
curl http://localhost:3001/api/products
```

Should return your products from the database.

### Step 6: Start Frontend

In a new terminal:

```bash
# From KUSTOMKOATS directory
npm run dev
```

The frontend is now configured to use the backend API at `http://localhost:3001/api`

## ✅ Verification Checklist

- [ ] Backend server starts without errors
- [ ] Health check returns "ok"
- [ ] Products endpoint returns data
- [ ] Frontend connects to backend
- [ ] No CORS errors in browser console

## 🔧 Troubleshooting

### Backend won't start

**Error: "Missing Supabase configuration"**
- Make sure you've set `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`

**Error: "Port 3001 already in use"**
```bash
npx kill-port 3001
```

### Can't get service role key

1. Make sure you're logged into Supabase
2. Select the correct project
3. Go to Settings → API
4. Look for "service_role" under "Project API keys"
5. Click the eye icon to reveal the key

### CORS errors

- Verify `FRONTEND_URL=http://localhost:5173` in `backend/.env`
- Make sure both frontend and backend are running
- Clear browser cache

### Products endpoint returns empty

- Check your database has products
- Verify Supabase URL is correct
- Check service role key is valid

## 📝 Next Steps

Once the backend is running:

1. **Read the Migration Guide**: `BACKEND-MIGRATION-GUIDE.md`
2. **Update your services**: Start migrating direct Supabase calls to API calls
3. **Test thoroughly**: Verify all features work with the new backend

## 🎯 What You Get

✅ **Secure**: Database credentials hidden on backend  
✅ **Validated**: All requests validated before database  
✅ **Scalable**: Easy to add features and scale  
✅ **Monitored**: All API requests logged  
✅ **Professional**: Industry-standard architecture  

## 📚 Documentation

- **Full Documentation**: See `backend/README.md`
- **Migration Guide**: See `BACKEND-MIGRATION-GUIDE.md`
- **API Endpoints**: Listed in `backend/README.md`

## 🆘 Need Help?

If you're stuck:

1. Check backend console for errors
2. Check browser console for errors
3. Verify all environment variables are set
4. Make sure both servers are running
5. Test endpoints with curl or Postman

---

**Status**: ✅ Backend installed and ready to start!

Run `npm run dev` in the backend directory to get started.
