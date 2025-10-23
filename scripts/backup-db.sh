#!/bin/bash

# Supabase Database Backup Script (No Docker Required)
# Uses Node.js script with Supabase REST API
# Usage: ./scripts/backup-db.sh

set -e

echo "🔄 Starting database backup (No Docker Required)..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    echo "❌ Environment file not found. Please create .env.local with:"
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_ANON_KEY=your_supabase_anon_key"
    exit 1
fi

# Run the Node.js backup script
echo "📦 Creating backup using Node.js script..."
node scripts/backup-db.js

if [ $? -eq 0 ]; then
    echo "🎉 Backup completed successfully!"
else
    echo "❌ Backup failed!"
    exit 1
fi
