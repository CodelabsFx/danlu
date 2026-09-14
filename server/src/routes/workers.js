const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// List workers
router.get('/', requireAuth, async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM workers ORDER BY full_name');
    return res.json({ workers: q.rows });
  } catch (err) {
    console.error('list workers', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get worker
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM workers WHERE id = $1', [req.params.id]);
    if (q.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.json({ worker: q.rows[0] });
  } catch (err) {
    console.error('get worker', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create worker
router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { full_name, national_id_or_passport, role_title, phone, salary_amount = 0, hired_date } = req.body;
    if (!full_name) return res.status(400).json({ message: 'full_name required' });
    const insert = await db.query(
      `INSERT INTO workers (full_name, national_id_or_passport, role_title, phone, salary_amount, hired_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [full_name, national_id_or_passport, role_title, phone, salary_amount, hired_date]
    );
    return res.status(201).json({ worker: insert.rows[0] });
  } catch (err) {
    console.error('create worker', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update worker
router.put('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const fields = ['full_name','national_id_or_passport','role_title','phone','salary_amount','hired_date'];
    const updates = [];
    const values = [];
    let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx}`);
        values.push(req.body[f]);
        idx++;
      }
    }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    values.push(req.params.id);
    const q = `UPDATE workers SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const resq = await db.query(q, values);
    if (resq.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.json({ worker: resq.rows[0] });
  } catch (err) {
    console.error('update worker', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete worker
router.delete('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const q = await db.query('DELETE FROM workers WHERE id = $1 RETURNING *', [req.params.id]);
    if (q.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.json({ deleted: q.rows[0] });
  } catch (err) {
    console.error('delete worker', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
