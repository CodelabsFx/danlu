const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/', requireAuth, async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM salaries ORDER BY paid_date DESC LIMIT 200');
    return res.json({ salaries: q.rows });
  } catch (err) {
    console.error('list salaries', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { worker_id, month, basic_salary = 0, allowances = 0, deductions = 0 } = req.body;
    if (!worker_id || !month) {
      return res.status(400).json({ message: 'worker_id and month are required' });
    }

    const basic = Number(basic_salary || 0);
    const allow = Number(allowances || 0);
    const deduct = Number(deductions || 0);
    const net = basic + allow - deduct;

    const insert = await db.query(
      `INSERT INTO salaries (worker_id, month, basic_salary, allowances, deductions, net_salary, paid_date)
       VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING *`,
      [worker_id, month, basic, allow, deduct, net]
    );

    return res.status(201).json({ salary: insert.rows[0] });
  } catch (err) {
    console.error('create salary', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
