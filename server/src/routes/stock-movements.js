const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const q = await db.query(
      `SELECT sm.*, p.product_name
       FROM stock_movements sm
       LEFT JOIN products p ON p.id = sm.product_id
       ORDER BY sm.created_at DESC LIMIT 200`
    );
    return res.json({ movements: q.rows });
  } catch (err) {
    console.error('list stock movements', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
