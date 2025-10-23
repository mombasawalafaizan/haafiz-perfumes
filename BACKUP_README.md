# Database Backup Solutions (No Docker Required)

This project provides multiple backup solutions that don't require Docker Desktop or Supabase CLI.

## 🚀 Quick Start

### 1. Manual Backup (Recommended)
```bash
# Simple JSON backup of all tables
npm run backup:manual
```

### 2. SQL Backup
```bash
# Full SQL backup with INSERT statements
npm run backup
```

### 3. Shell Script Backup
```bash
# Using shell script wrapper
./scripts/backup-db.sh
```

## 📋 Available Backup Methods

### Method 1: Manual JSON Backup
- **File**: `scripts/manual-backup.js`
- **Output**: JSON file with all table data
- **Usage**: `npm run backup:manual`
- **Best for**: Quick data export, easy to read

### Method 2: SQL Backup
- **File**: `scripts/backup-db.js`
- **Output**: SQL file with INSERT statements
- **Usage**: `npm run backup`
- **Best for**: Database restoration, SQL compatibility

### Method 3: Automated Cron Backup
- **Setup**: `npm run backup:setup-cron`
- **Schedule**: Daily at 2:00 AM
- **Logs**: `logs/backup.log`
- **Best for**: Automated daily backups

## 🔧 Configuration

### Environment Variables
Create `.env.local` with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backup Directory
- **Location**: `./backups/`
- **Format**: `backup_YYYY-MM-DD.sql.gz`
- **Retention**: 7 backups (configurable)

## 📁 Backup Files

### JSON Backup Format
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "tables": {
    "products": [...],
    "orders": [...],
    "order_items": [...],
    "hero_slides": [...],
    "images": [...],
    "product_images": [...],
    "product_variants": [...],
    "variant_images": [...]
  }
}
```

### SQL Backup Format
```sql
-- Haafiz Perfumes Database Backup
-- Generated on: 2024-01-15T10:30:00.000Z

-- Table: products
INSERT INTO products (id, name, price) VALUES (1, 'Perfume 1', 100);
INSERT INTO products (id, name, price) VALUES (2, 'Perfume 2', 200);
```

## 🛠️ Troubleshooting

### Missing Environment Variables
```bash
❌ Missing Supabase credentials in .env.local
Please add:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Permission Issues
```bash
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

### Node.js Not Found
```bash
# Install Node.js first
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 📊 Backup Comparison

| Method | Docker Required | CLI Required | Output Format | Best For |
|--------|----------------|--------------|---------------|----------|
| Manual JSON | ❌ | ❌ | JSON | Quick export |
| SQL Backup | ❌ | ❌ | SQL | Database restore |
| Cron Backup | ❌ | ❌ | SQL | Automated |
| Supabase CLI | ✅ | ✅ | SQL | Full schema |
| pg_dump | ❌ | ✅ | SQL | PostgreSQL native |

## 🔄 Restore from Backup

### From JSON Backup
```javascript
const backup = require('./backups/manual_backup_2024-01-15.json');
// Process backup.tables.products, backup.tables.orders, etc.
```

### From SQL Backup
```bash
# Import SQL backup (requires PostgreSQL client)
psql -h your_host -U your_user -d your_db < backup.sql
```

## 📅 Automated Backup Setup

### Cron Job Setup
```bash
# Run setup script
npm run backup:setup-cron

# View current cron jobs
crontab -l

# Remove cron job
crontab -e
# Delete the backup line
```

### Manual Cron Entry
```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * cd /path/to/project && node scripts/backup-db.js >> logs/backup.log 2>&1
```

## 🎯 Recommendations

1. **For Development**: Use `npm run backup:manual` for quick exports
2. **For Production**: Set up cron job with `npm run backup:setup-cron`
3. **For Migration**: Use SQL backup for database transfers
4. **For Analysis**: Use JSON backup for data analysis

## 🔒 Security Notes

- Backup files contain sensitive data
- Store backups securely
- Consider encryption for production backups
- Regular backup testing recommended
