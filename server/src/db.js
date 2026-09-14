const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://danlu:danlu@localhost:5432/danlu_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false,
});

async function initializeDatabase() {
  try {
    const tables = await pool.query(`
      SELECT
        to_regclass('public.users') AS users,
        to_regclass('public.products') AS products,
        to_regclass('public.sales') AS sales,
        to_regclass('public.sale_items') AS sale_items,
        to_regclass('public.workers') AS workers,
        to_regclass('public.expenses') AS expenses;
    `);

    const tablePresence = tables.rows[0] || {};
    const requiredTables = ['users', 'products', 'sales', 'sale_items', 'workers', 'expenses'];
    const missing = requiredTables.some((table) => !tablePresence[table]);

    if (!missing) return true;

    const migrationPath = path.resolve(__dirname, '../../migrations/001_init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    const statements = migrationSQL
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log('Database initialized from migration 001_init.sql');
    return true;
  } catch (error) {
    console.warn('Database initialization skipped:', error.message);
    return false;
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initializeDatabase,
};
