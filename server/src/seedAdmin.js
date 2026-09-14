const bcrypt = require('bcrypt');
const db = require('./db');

const DEFAULT_ADMIN = {
  name: 'Daniel Kiarie',
  email: 'danielkiarie013@gmail.com',
  password: 'Danniey@1',
  role: 'owner',
  phone: '+254700000000'
};

async function ensureDefaultAdmin() {
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [DEFAULT_ADMIN.email]);
    if (existing.rows.length > 0) return existing.rows[0];

    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    const insert = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone`,
      [DEFAULT_ADMIN.name, DEFAULT_ADMIN.email, passwordHash, DEFAULT_ADMIN.role, DEFAULT_ADMIN.phone]
    );

    console.log('Default admin seeded:', DEFAULT_ADMIN.email);
    return insert.rows[0];
  } catch (err) {
    console.warn('Default admin seed skipped:', err.message);
    return null;
  }
}

module.exports = { ensureDefaultAdmin, DEFAULT_ADMIN };
