# Quick Reference - KUSTOMKOATS Development

## 🚀 Quick Start

```bash
# First time setup
npm run install:all

# Development (frontend + backend)
npm run dev:all

# Frontend only
npm run dev

# Backend only
npm run dev:backend
```

## 📁 Project Structure

```
KUSTOMKOATS/
├── frontend/        # React + Vite (Port 5173)
├── backend/         # Express API (Port 3000/5000)
├── database/        # SQL migrations
├── supabase/        # Edge functions
└── docs/           # Documentation
```

## 🔧 Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run dev:backend` | Start backend server |
| `npm run dev:all` | Start both frontend & backend |
| `npm run build` | Build frontend for production |
| `npm run install:all` | Install all dependencies |
| `npm run check-env` | Verify environment variables |

## 📝 Environment Files

| File | Variables |
|------|-----------|
| `frontend/.env` | VITE_SUPABASE_URL<br>VITE_SUPABASE_ANON_KEY<br>VITE_RAZORPAY_KEY_ID<br>VITE_API_URL |
| `backend/.env` | SUPABASE_URL<br>SUPABASE_SERVICE_ROLE_KEY<br>PORT |
| `supabase/.env` | RAZORPAY_KEY_ID<br>RAZORPAY_KEY_SECRET |

## 🌐 Default Ports

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000 (or check backend/.env)

## 📦 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS 4, Zustand
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Payment**: Razorpay
- **Shipping**: Shiprocket

## 🔗 Important Links

- Frontend Dev: http://localhost:5173
- Backend API: http://localhost:3000
- Supabase Dashboard: https://supabase.com/dashboard

## 📖 Documentation

- `README.md` - Full project documentation
- `FRONTEND-REORGANIZATION-SUMMARY.md` - Structure change details
- `MIGRATION-CHECKLIST.md` - Migration checklist
- `docs/` - Detailed documentation

## 🆘 Troubleshooting

**Frontend not starting?**
```bash
cd frontend
npm install
npm run dev
```

**Backend not starting?**
```bash
cd backend
npm install
npm run dev
```

**Environment variables not loading?**
```bash
npm run check-env
```

**Both not starting together?**
```bash
npm install  # Install concurrently
npm run dev:all
```

---

💡 **Tip**: Keep this file open for quick reference while developing!
