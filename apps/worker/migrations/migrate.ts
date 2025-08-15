import type { D1Database } from '@cloudflare/workers-types'

export interface Migration {
  id: string
  description: string
  sql: string
  rollback?: string
}

// Lista de todas as migrações em ordem
export const migrations: Migration[] = [
  {
    id: '001_initial_schema',
    description: 'Initial database schema with multi-tenancy support',
    sql: '', // Will be loaded from file
    rollback: `
      DROP TABLE IF EXISTS api_keys;
      DROP TABLE IF EXISTS system_logs;
      DROP TABLE IF EXISTS automation_rules;
      DROP TABLE IF EXISTS ai_analyses;
      DROP TABLE IF EXISTS scrape_tasks;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS suppliers;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS tenants;
    `
  }
]

export class MigrationRunner {
  constructor(private db: D1Database) {}

  async createMigrationsTable(): Promise<void> {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.db.prepare('SELECT id FROM migrations ORDER BY executed_at').all()
    return result.results.map(row => row.id as string)
  }

  async executeMigration(migration: Migration): Promise<void> {
    console.log(`Executing migration: ${migration.id} - ${migration.description}`)
    
    try {
      // Execute migration SQL
      await this.db.exec(migration.sql)
      
      // Record migration as executed
      await this.db.prepare(
        'INSERT INTO migrations (id, description) VALUES (?, ?)'
      ).bind(migration.id, migration.description).run()
      
      console.log(`✅ Migration ${migration.id} completed successfully`)
    } catch (error) {
      console.error(`❌ Migration ${migration.id} failed:`, error)
      throw error
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    if (!migration.rollback) {
      throw new Error(`No rollback script for migration ${migration.id}`)
    }

    console.log(`Rolling back migration: ${migration.id}`)
    
    try {
      // Execute rollback SQL
      await this.db.exec(migration.rollback)
      
      // Remove migration record
      await this.db.prepare(
        'DELETE FROM migrations WHERE id = ?'
      ).bind(migration.id).run()
      
      console.log(`✅ Migration ${migration.id} rolled back successfully`)
    } catch (error) {
      console.error(`❌ Rollback ${migration.id} failed:`, error)
      throw error
    }
  }

  async migrate(): Promise<void> {
    console.log('🚀 Starting database migration...')
    
    // Create migrations table
    await this.createMigrationsTable()
    
    // Get already executed migrations
    const executedMigrations = await this.getExecutedMigrations()
    
    // Execute pending migrations
    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.id)) {
        // Load SQL from file if not already loaded
        if (!migration.sql && migration.id === '001_initial_schema') {
          // In a real app, you'd load from file system
          // For Cloudflare Workers, we'll embed it
          migration.sql = await this.loadInitialSchema()
        }
        
        await this.executeMigration(migration)
      } else {
        console.log(`⏭️  Migration ${migration.id} already executed, skipping`)
      }
    }
    
    console.log('✅ All migrations completed successfully')
  }

  async rollbackTo(targetMigrationId: string): Promise<void> {
    console.log(`🔄 Rolling back to migration: ${targetMigrationId}`)
    
    const executedMigrations = await this.getExecutedMigrations()
    const targetIndex = migrations.findIndex(m => m.id === targetMigrationId)
    
    if (targetIndex === -1) {
      throw new Error(`Migration ${targetMigrationId} not found`)
    }
    
    // Rollback migrations in reverse order
    for (let i = migrations.length - 1; i > targetIndex; i--) {
      const migration = migrations[i]
      if (executedMigrations.includes(migration.id)) {
        await this.rollbackMigration(migration)
      }
    }
    
    console.log(`✅ Rolled back to migration: ${targetMigrationId}`)
  }

  async status(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations()
    
    console.log('\n📊 Migration Status:')
    console.log('===================')
    
    for (const migration of migrations) {
      const status = executedMigrations.includes(migration.id) ? '✅ EXECUTED' : '⏳ PENDING'
      console.log(`${status} | ${migration.id} - ${migration.description}`)
    }
    
    console.log(`\nTotal: ${migrations.length} migrations, ${executedMigrations.length} executed`)
  }

  private async loadInitialSchema(): Promise<string> {
    // This would normally load from file, but for Cloudflare Workers we embed it
    return `-- NuvexSell OS - Initial Database Schema
-- Supports multi-tenancy with tenant_id in all tables

-- ========================================
-- TENANTS & USERS
-- ========================================

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'FREE', -- FREE, VIP, CORPORATE, GODMODE
  status TEXT NOT NULL DEFAULT 'active', -- active, suspended, canceled
  stripe_customer_id TEXT,
  subscription_id TEXT,
  trial_ends_at DATETIME,
  settings TEXT DEFAULT '{}', -- JSON with tenant settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- admin, user, readonly
  is_active BOOLEAN DEFAULT 1,
  last_login_at DATETIME,
  settings TEXT DEFAULT '{}', -- JSON with user preferences
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_tenant ON users(email, tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- ========================================
-- PRODUCTS (Repo 1: Scraper)
-- ========================================

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  images TEXT DEFAULT '[]', -- JSON array of image URLs
  availability BOOLEAN DEFAULT 1,
  sku TEXT,
  brand TEXT,
  category TEXT,
  source_url TEXT NOT NULL, -- Original product URL
  
  -- AI Scores (Repo 2: AI Scoring)
  ai_score INTEGER, -- Overall AI score (0-100)
  price_score INTEGER, -- Price competitiveness (0-100)
  demand_score INTEGER, -- Market demand (0-100)
  sentiment_score INTEGER, -- Review sentiment (0-100)
  recommendation TEXT, -- low, medium, high
  
  -- Automation Status (Repo 3: Ops Automation)
  automation_enabled BOOLEAN DEFAULT 0,
  auto_order_threshold INTEGER DEFAULT 10, -- Min stock to trigger order
  supplier_id TEXT,
  supplier_sku TEXT,
  
  -- Metadata
  scrape_count INTEGER DEFAULT 1,
  last_scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_source_url ON products(source_url);
CREATE INDEX IF NOT EXISTS idx_products_ai_score ON products(ai_score);
CREATE INDEX IF NOT EXISTS idx_products_automation ON products(automation_enabled);

-- ========================================
-- SUPPLIERS (Repo 3: Ops Automation)
-- ========================================

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- amazon, aliexpress, ebay, shopee, mercadolivre
  api_config TEXT DEFAULT '{}', -- JSON with API credentials
  status TEXT DEFAULT 'active', -- active, inactive, error
  priority INTEGER DEFAULT 1, -- Order priority (1=highest)
  success_rate REAL DEFAULT 100.0, -- Order success rate %
  avg_delivery_days INTEGER DEFAULT 7,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);

-- ========================================
-- ORDERS (Repo 3: Ops Automation)
-- ========================================

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED', -- CREATED, PROCESSING, SHIPPED, DELIVERED, CANCELED, FAILED
  
  -- Order Items (JSON)
  items TEXT NOT NULL DEFAULT '[]', -- [{productId, quantity, price, supplierSku}]
  
  -- Destination
  destination TEXT NOT NULL DEFAULT '{}', -- JSON with shipping address
  
  -- Supplier Info
  supplier_id TEXT,
  supplier_order_id TEXT, -- Order ID at supplier
  tracking_code TEXT,
  
  -- Financial
  total_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  
  -- Automation
  auto_created BOOLEAN DEFAULT 0, -- Created by automation?
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  
  -- Timestamps
  ordered_at DATETIME, -- When order was placed with supplier
  shipped_at DATETIME,
  delivered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_auto_created ON orders(auto_created);

-- Insert default data
INSERT OR IGNORE INTO tenants (id, name, plan, status) 
VALUES ('default', 'Default Tenant', 'GODMODE', 'active');

INSERT OR IGNORE INTO users (id, tenant_id, email, password_hash, name, role) 
VALUES (
  'admin', 
  'default', 
  'admin@nuvexsell.com', 
  '$2b$10$8K1p/a0dJFw8/K1p/a0dJOGTNKOGTNKOGTNKOGTNKOGTNKOGTNKOGT',
  'Admin User', 
  'admin'
);

INSERT OR IGNORE INTO suppliers (id, tenant_id, name, type, priority) VALUES
  ('amazon-default', 'default', 'Amazon Brasil', 'amazon', 1),
  ('aliexpress-default', 'default', 'AliExpress', 'aliexpress', 2),
  ('mercadolivre-default', 'default', 'MercadoLivre', 'mercadolivre', 3);`
  }
}