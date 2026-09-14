const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200');
    return res.json({ logs: q.rows });
  } catch (err) {
    console.error('list audit logs', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { action, entity_type, entity_id, details } = req.body;
    if (!action) return res.status(400).json({ message: 'action required' });

    const q = await db.query(
      'INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, action, entity_type || null, entity_id || null, details || {}]
    );

    return res.status(201).json({ log: q.rows[0] });
  } catch (err) {
    console.error('create audit log', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
