-- Add product_image column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_image TEXT;
