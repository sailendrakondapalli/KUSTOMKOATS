# KUSTOMKOATS E-Commerce Platform

Jewelry e-commerce platform with React frontend and Express backend.

## Project Structure

```
KUSTOMKOATS/
├── frontend/          # React + Vite frontend
│   ├── src/          # React components, pages, services
│   ├── public/       # Static assets
│   ├── index.html    # Entry HTML
│   ├── vite.config.js
│   ├── package.json
│   └── .env          # Frontend environment variables
│
├── backend/          # Express.js backend API
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, validation
│   ├── config/       # Supabase config
│   ├── server.js     # Entry point
│   ├── package.json
│   └── .env          # Backend environment variables
│
├── database/         # Database migrations
├── supabase/         # Supabase functions and config
└── docs/            # Documentation
```

## Quick Start

### Install Dependencies
```bash
npm run install:all
```

### Development
```bash
# Run frontend only
npm run dev

# Run backend only
npm run dev:backend

# Run both concurrently
npm run dev:all
```

### Build
```bash
# Build frontend
npm run build

# Build backend
npm run build:backend
```

### Environment Setup
```bash
npm run check-env
```

## Environment Variables

### Frontend (.env in frontend/)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key
- `VITE_API_URL` - Backend API URL

### Backend (.env in backend/)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PORT` - Backend server port

### Supabase Functions (.env in supabase/)
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS 4, React Router, Zustand
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Payment**: Razorpay
- **Shipping**: Shiprocket
- **Deployment**: Vercel (frontend), Railway/Render (backend)
