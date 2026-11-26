# Hostinger VPS Deployment Guide — KustomKoats

## Architecture on VPS
- **Nginx** — web server / reverse proxy (port 80/443)
- **Frontend** — Vite build served as static files via Nginx
- **Backend** — Node.js Express API running on port 3001 via PM2
- **SSL** — Let's Encrypt (free, via Certbot)

---

## Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## Step 2: Install Dependencies on VPS

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install PM2 (process manager for Node.js)
npm install -g pm2

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Verify versions
node -v
npm -v
nginx -v
```

---

## Step 3: Clone Your Repo on VPS

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/sailendrakondapalli/KUSTOMKOATS.git
cd KUSTOMKOATS
```

---

## Step 4: Configure Backend Environment

```bash
cd /var/www/KUSTOMKOATS/backend
cp .env.example .env
nano .env
```

Paste these values into the .env file:
```
SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_FROM_SUPABASE
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://kustomkoats.in
SHIPROCKET_EMAIL=kustomkoats.business@gmail.com
SHIPROCKET_PASSWORD=YOUR_SHIPROCKET_PASSWORD
```

Get SUPABASE_SERVICE_ROLE_KEY from: Supabase → Settings → API → service_role key

---

## Step 5: Install Backend Dependencies & Start with PM2

```bash
cd /var/www/KUSTOMKOATS/backend
npm install
pm2 start server.js --name "kustomkoats-backend"
pm2 save
pm2 startup
```

Verify backend is running:
```bash
pm2 status
curl http://localhost:3001/health
```

---

## Step 6: Configure Frontend Environment & Build

```bash
cd /var/www/KUSTOMKOATS/frontend
```

Create production .env:
```bash
nano .env.production
```

Paste:
```
VITE_SUPABASE_URL=https://gozoxlueuwnyujvvafdl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvem94bHVldXdueXVqdnZhZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjA0MzIsImV4cCI6MjEwNDY5NjQzMn0.TZ0swyo2VectJn2eThLMlNhfw6gZnsRNeuqEOZNQG84
VITE_ADMIN_EMAIL=sailendrakondapalli@gmail.com
VITE_API_URL=https://kustomkoats.in/api
VITE_RAZORPAY_KEY_ID=rzp_live_Tm8zdwG0mHgj7d
```

Build:
```bash
npm install
npm run build
```

This creates `/var/www/KUSTOMKOATS/frontend/dist/`

---

## Step 7: Configure Nginx

```bash
nano /etc/nginx/sites-available/kustomkoats
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name kustomkoats.in www.kustomkoats.in;

    # Frontend — serve React SPA
    root /var/www/KUSTOMKOATS/frontend/dist;
    index index.html;

    # Handle React Router — all routes fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API — proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/kustomkoats /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Step 8: Point Your Domain to VPS

In Hostinger DNS settings for kustomkoats.in:
- **A record** → `@` → `YOUR_VPS_IP`
- **A record** → `www` → `YOUR_VPS_IP`

Wait 10–30 minutes for DNS propagation.

---

## Step 9: Enable SSL (HTTPS)

```bash
certbot --nginx -d kustomkoats.in -d www.kustomkoats.in
```

Certbot automatically updates your Nginx config for HTTPS.

---

## Step 10: Verify Everything Works

```bash
# Check backend
curl https://kustomkoats.in/api/health

# Check PM2
pm2 status

# Check Nginx
systemctl status nginx
```

---

## Updating the Site Later

Whenever you push changes to GitHub, run this on the VPS:

```bash
cd /var/www/KUSTOMKOATS
git pull origin database-and-backend-organization

# Rebuild frontend
cd frontend && npm run build && cd ..

# Restart backend
pm2 restart kustomkoats-backend
```

---

## Quick Reference

| Command | Purpose |
|---|---|
| `pm2 status` | Check if backend is running |
| `pm2 logs kustomkoats-backend` | View backend logs |
| `pm2 restart kustomkoats-backend` | Restart after code changes |
| `systemctl reload nginx` | Apply Nginx config changes |
| `certbot renew` | Renew SSL certificate (auto via cron) |
