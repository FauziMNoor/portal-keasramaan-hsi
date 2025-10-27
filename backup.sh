#!/bin/bash

# Backup Script for Portal Keasramaan
# Usage: ./backup.sh

# Configuration
APP_DIR="/var/www/portal-keasramaan"
BACKUP_DIR="/backup/portal-keasramaan"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="portal-keasramaan-$DATE.tar.gz"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

echo "🔄 Starting backup process..."
echo "📁 Source: $APP_DIR"
echo "💾 Destination: $BACKUP_DIR/$BACKUP_FILE"

# Create backup (exclude node_modules and .next)
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs' \
    --exclude='.git' \
    $APP_DIR

# Check if backup successful
if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📦 File: $BACKUP_DIR/$BACKUP_FILE"
    
    # Show file size
    SIZE=$(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)
    echo "📊 Size: $SIZE"
    
    # Keep only last 7 backups
    echo "🧹 Cleaning old backups (keeping last 7)..."
    cd $BACKUP_DIR
    ls -t portal-keasramaan-*.tar.gz | tail -n +8 | xargs -r rm
    
    echo "✅ Backup process completed!"
else
    echo "❌ Backup failed!"
    exit 1
fi
