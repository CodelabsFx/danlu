-- Initial schema for Inventory, Sales, Workers, Expenses

-- Drop existing tables (safe for repeated test runs)
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

-- Indexes for common queries
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_sales_date ON sales(sale_date);
