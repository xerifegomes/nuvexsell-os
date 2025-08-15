-- NuvexSell OS - Initial Database Schema
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

-- ========================================
-- INVENTORY/STOCK (Repo 3: Ops Automation)
-- ========================================

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  
  -- Stock Info
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- Reserved for pending orders
  min_threshold INTEGER DEFAULT 10, -- Minimum stock before reorder
  max_threshold INTEGER DEFAULT 100, -- Maximum stock to maintain
  
  -- Pricing
  cost_price REAL, -- What we pay to supplier
  sell_price REAL, -- What we sell for
  margin_percent REAL, -- Profit margin %
  
  -- Sync Info
  last_synced_at DATETIME,
  sync_status TEXT DEFAULT 'pending', -- pending, synced, error
  sync_error TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_supplier ON inventory(product_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tenant ON inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(quantity, min_threshold);

-- ========================================
-- SCRAPE TASKS (Repo 1: Scraper)
-- ========================================

CREATE TABLE IF NOT EXISTS scrape_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  
  -- Task Info
  type TEXT NOT NULL, -- single_url, bulk_import, auto_monitor
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100
  
  -- Input
  urls TEXT NOT NULL DEFAULT '[]', -- JSON array of URLs to scrape
  filters TEXT DEFAULT '{}', -- JSON with scrape filters
  
  -- Results
  total_urls INTEGER DEFAULT 0,
  successful_scrapes INTEGER DEFAULT 0,
  failed_scrapes INTEGER DEFAULT 0,
  products_created INTEGER DEFAULT 0,
  
  -- Scheduling (for auto-monitor)
  schedule_enabled BOOLEAN DEFAULT 0,
  schedule_interval TEXT, -- hourly, daily, weekly
  next_run_at DATETIME,
  
  -- Error Info
  error_message TEXT,
  error_details TEXT,
  
  -- Metadata
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scrape_tasks_tenant ON scrape_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scrape_tasks_status ON scrape_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scrape_tasks_schedule ON scrape_tasks(schedule_enabled, next_run_at);

-- ========================================
-- AI ANALYSIS HISTORY (Repo 2: AI Scoring)
-- ========================================

CREATE TABLE IF NOT EXISTS ai_analyses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  
  -- Analysis Type
  analysis_type TEXT NOT NULL, -- price_analysis, sentiment_analysis, demand_analysis, full_analysis
  
  -- Scores
  overall_score INTEGER, -- 0-100
  price_score INTEGER, -- 0-100
  demand_score INTEGER, -- 0-100
  sentiment_score INTEGER, -- 0-100
  
  -- Detailed Results
  analysis_data TEXT DEFAULT '{}', -- JSON with detailed analysis
  recommendations TEXT DEFAULT '[]', -- JSON array of recommendations
  confidence_level REAL, -- 0.0-1.0
  
  -- Market Data
  competitor_count INTEGER,
  avg_market_price REAL,
  market_trend TEXT, -- rising, stable, falling
  
  -- Processing Info
  processing_time_ms INTEGER,
  model_version TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_tenant ON ai_analyses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_product ON ai_analyses(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_score ON ai_analyses(overall_score);

-- ========================================
-- AUTOMATION RULES (Repo 3: Ops Automation)
-- ========================================

CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  
  -- Rule Type
  type TEXT NOT NULL, -- auto_order, price_update, stock_alert, supplier_switch
  
  -- Conditions (JSON)
  conditions TEXT NOT NULL DEFAULT '{}', -- {aiScore: {min: 70}, stock: {max: 10}}
  
  -- Actions (JSON)
  actions TEXT NOT NULL DEFAULT '{}', -- {createOrder: {quantity: 50}, alert: {email: true}}
  
  -- Status
  enabled BOOLEAN DEFAULT 1,
  priority INTEGER DEFAULT 1,
  
  -- Statistics
  executions_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_executed_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_tenant ON automation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON automation_rules(enabled);

-- ========================================
-- SYSTEM LOGS & AUDIT
-- ========================================

CREATE TABLE IF NOT EXISTS system_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  user_id TEXT,
  
  -- Log Info
  level TEXT NOT NULL, -- debug, info, warn, error
  category TEXT NOT NULL, -- scraper, ai, automation, api, auth
  message TEXT NOT NULL,
  details TEXT, -- JSON with additional data
  
  -- Context
  request_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_logs_tenant ON system_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);

-- ========================================
-- API KEYS & INTEGRATIONS
-- ========================================

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Hashed API key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  
  -- Permissions
  permissions TEXT DEFAULT '[]', -- JSON array of allowed endpoints
  rate_limit INTEGER DEFAULT 1000, -- Requests per hour
  
  -- Usage Stats
  total_requests INTEGER DEFAULT 0,
  last_used_at DATETIME,
  
  -- Status
  enabled BOOLEAN DEFAULT 1,
  expires_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_enabled ON api_keys(enabled);

-- ========================================
-- Insert default data
-- ========================================

-- Create default tenant for development
INSERT OR IGNORE INTO tenants (id, name, plan, status) 
VALUES ('default', 'Default Tenant', 'GODMODE', 'active');

-- Create default admin user
INSERT OR IGNORE INTO users (id, tenant_id, email, password_hash, name, role) 
VALUES (
  'admin', 
  'default', 
  'admin@nuvexsell.com', 
  '$2b$10$8K1p/a0dJFw8/K1p/a0dJOGTNKOGTNKOGTNKOGTNKOGTNKOGTNKOGT', -- password: admin123
  'Admin User', 
  'admin'
);

-- Create default suppliers
INSERT OR IGNORE INTO suppliers (id, tenant_id, name, type, priority) VALUES
  ('amazon-default', 'default', 'Amazon Brasil', 'amazon', 1),
  ('aliexpress-default', 'default', 'AliExpress', 'aliexpress', 2),
  ('mercadolivre-default', 'default', 'MercadoLivre', 'mercadolivre', 3);

-- Create default automation rules
INSERT OR IGNORE INTO automation_rules (id, tenant_id, name, type, conditions, actions) VALUES
  ('auto-order-high-score', 'default', 'Auto Order High Score Products', 'auto_order', 
   '{"aiScore": {"min": 80}, "stock": {"max": 5}}',
   '{"createOrder": {"quantity": 20}, "alert": {"email": true}}'),
  ('stock-alert-low', 'default', 'Low Stock Alert', 'stock_alert',
   '{"stock": {"max": 3}}',
   '{"alert": {"email": true, "webhook": true}}');