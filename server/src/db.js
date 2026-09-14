const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://danlu:danlu@localhost:5432/danlu_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
