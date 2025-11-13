#!/bin/bash

# =====================================================
# DEPLOY SCRIPT - Portal Keasramaan
# Run this on production server
# =====================================================

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /home/smaithsi-asrama/htdocs/asrama.smaithsi.sch.id || exit

# Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart 3

echo "✅ Deployment completed!"
echo "📊 Check status: pm2 status"
echo "📝 Check logs: pm2 logs 3"
