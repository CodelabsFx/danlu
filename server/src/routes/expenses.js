const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// List expenses
router.get('/', requireAuth, async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM expenses ORDER BY date DESC LIMIT 500');
    return res.json({ expenses: q.rows });
  } catch (err) {
    console.error('list expenses', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get expense
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM expenses WHERE id = $1', [req.params.id]);
    if (q.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.json({ expense: q.rows[0] });
  } catch (err) {
    console.error('get expense', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create expense
router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { expense_type, amount, description, date } = req.body;
    if (!expense_type || amount === undefined) return res.status(400).json({ message: 'expense_type and amount required' });
    const insert = await db.query(
      `INSERT INTO expenses (expense_type, amount, description, date, logged_by_admin_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [expense_type, amount, description, date || new Date(), req.user.userId]
    );
    return res.status(201).json({ expense: insert.rows[0] });
  } catch (err) {
    console.error('create expense', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const fields = ['expense_type','amount','description','date'];
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
    const q = `UPDATE expenses SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const resq = await db.query(q, values);
    if (resq.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.json({ expense: resq.rows[0] });
  } catch (err) {
    console.error('update expense', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const q = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [req.params.id]);
    if (q.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.json({ deleted: q.rows[0] });
  } catch (err) {
    console.error('delete expense', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Aggregate and post monthly salaries as a single expense
router.post('/post-monthly-salaries', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { month } = req.body; // e.g., '2026-09' (YYYY-MM)
    const target = month || new Date().toISOString().slice(0,7);

    const workersRes = await db.query('SELECT id, full_name, salary_amount FROM workers WHERE salary_amount > 0');
    const workers = workersRes.rows;
    if (workers.length === 0) return res.status(400).json({ message: 'No salaried workers found' });

    const total = workers.reduce((s, w) => s + parseFloat(w.salary_amount || 0), 0);
    const description = `Monthly salaries for ${target} (auto-posted)`;
    const insert = await db.query('INSERT INTO expenses (expense_type, amount, description, date, logged_by_admin_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      ['Salaries', total, description, new Date(), req.user.userId]);

    return res.status(201).json({ expense: insert.rows[0], total, workersCount: workers.length });
  } catch (err) {
    console.error('post salaries', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
