#!/bin/bash

echo "🚀 Starting update process..."

# Navigate to project directory
cd /var/www/portal-keasramaan

# Pull latest code from Git
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build production
echo "🔨 Building production..."
npm run build

# Restart application with PM2
echo "🔄 Restarting application..."
pm2 restart portal-keasramaan

# Show status
echo "✅ Update completed!"
pm2 status portal-keasramaan
