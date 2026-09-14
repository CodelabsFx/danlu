-- Initial schema for Inventory, Sales, Workers, Expenses

-- Drop existing tables (safe for repeated test runs)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS salaries CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS purchase_items CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT,
  sku TEXT UNIQUE,
  unit_cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_alert_threshold INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  admin_id INTEGER REFERENCES users(id)
);

CREATE TABLE sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE workers (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  national_id_or_passport TEXT,
  role_title TEXT,
  phone TEXT,
  salary_amount NUMERIC(12,2) DEFAULT 0,
  hired_date DATE
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  expense_type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logged_by_admin_id INTEGER REFERENCES users(id)
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  admin_id INTEGER REFERENCES users(id)
);

CREATE TABLE purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_cost_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  movement_type TEXT NOT NULL,
  quantity_change INTEGER NOT NULL,
  reference_type TEXT,
  reference_id INTEGER,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER REFERENCES workers(id),
  month TEXT NOT NULL,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'Danlu',
  business_email TEXT,
  phone TEXT,
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'KES',
  timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  report_email_recipients TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX idx_salaries_worker ON salaries(worker_id, month);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
