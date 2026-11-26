#!/bin/bash
# Run this on the VPS to pull latest code and redeploy

set -e

echo "=== Pulling latest code ==="
cd /var/www/KUSTOMKOATS
git pull origin database-and-backend-organization

echo "=== Rebuilding frontend ==="
cd /var/www/KUSTOMKOATS/frontend
npm install
npm run build

echo "=== Restarting backend ==="
cd /var/www/KUSTOMKOATS/backend
npm install
pm2 restart kustomkoats-backend

echo "=== Done! Site is updated ==="
pm2 status
