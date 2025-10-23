#!/usr/bin/env node

/**
 * Manual Database Backup Script
 * Simple script to export data from Supabase tables
 */

import fs from "fs";
import path from "path";

// Load environment variables from .env.local

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const envVars = {};
    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    });
    return envVars;
  }
  return {};
}

const env = loadEnvFile();
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("Please add:");
  console.error("SUPABASE_URL=your_supabase_url");
  console.error("SUPABASE_ANON_KEY=your_supabase_anon_key");
  process.exit(1);
}

async function fetchTableData(tableName) {
  console.log(`📦 Fetching ${tableName}...`);

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?select=*`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.length} rows from ${tableName}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${tableName}:`, error.message);
    return [];
  }
}

async function createBackup() {
  const timestamp = new Date().toISOString().split("T")[0];
  const backupDir = "./backups";
  const backupFile = `manual_backup_${timestamp}.json`;

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log("🔄 Starting manual backup...");

  // Tables to backup (all tables from your Supabase database)
  const tables = [
    "products",
    "orders",
    "order_items",
    "hero_slides",
    "images",
    "product_images",
    "product_variants",
    "variant_images",
  ];

  const backup = {
    timestamp: new Date().toISOString(),
    tables: {},
  };

  for (const table of tables) {
    const data = await fetchTableData(table);
    backup.tables[table] = data;
  }

  // Save backup
  const backupPath = path.join(backupDir, backupFile);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

  console.log(`✅ Backup saved: ${backupPath}`);
  console.log("🎉 Manual backup completed!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createBackup().catch(console.error);
}

export { createBackup };
