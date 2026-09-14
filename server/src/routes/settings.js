const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/', requireAuth, async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
    if (q.rows.length === 0) {
      const created = await db.query(
        `INSERT INTO settings (business_name, business_email, phone, address, currency, timezone, report_email_recipients)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        ['Danlu', 'owner@danlu.com', '', '', 'KES', 'Africa/Nairobi', '']
      );
      return res.json({ settings: created.rows[0] });
    }
    return res.json({ settings: q.rows[0] });
  } catch (err) {
    console.error('get settings', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const {
      business_name, business_email, phone, address, currency, timezone, report_email_recipients
    } = req.body;

    const q = await db.query(
      `INSERT INTO settings (business_name, business_email, phone, address, currency, timezone, report_email_recipients, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (id) DO UPDATE SET
         business_name = EXCLUDED.business_name,
         business_email = EXCLUDED.business_email,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         currency = EXCLUDED.currency,
         timezone = EXCLUDED.timezone,
         report_email_recipients = EXCLUDED.report_email_recipients,
         updated_at = now()
       RETURNING *`,
      [business_name || 'Danlu', business_email || '', phone || '', address || '', currency || 'KES', timezone || 'Africa/Nairobi', report_email_recipients || '']
    );

    return res.json({ settings: q.rows[0] });
  } catch (err) {
    console.error('update settings', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
