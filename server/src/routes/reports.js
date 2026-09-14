const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// GET /api/reports?type=pnl|balance&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/', requireAuth, async (req, res) => {
  try {
    const { type = 'pnl', start, end } = req.query;
    const startDate = start || '1970-01-01';
    const endDate = end || new Date().toISOString().slice(0,10);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(type === 'balance' ? 'Balance Sheet' : 'P&L');

    if (type === 'balance') {
      // Simple balance sheet: Assets (inventory), Liabilities (expenses unpaid - not tracked), Equity = retained earnings (net profit)
      const inventoryRes = await db.query('SELECT COALESCE(SUM(current_stock_quantity * unit_cost_price),0) AS inventory_value FROM products');
      const inventory = parseFloat(inventoryRes.rows[0].inventory_value || 0);
      const salesRes = await db.query('SELECT COALESCE(SUM(total_amount),0) AS total_sales FROM sales WHERE sale_date::date BETWEEN $1 AND $2', [startDate, endDate]);
      const cogsRes = await db.query(
        `SELECT COALESCE(SUM(si.quantity * COALESCE(p.unit_cost_price,0)),0) AS cogs
         FROM sale_items si JOIN sales s ON s.id = si.sale_id JOIN products p ON p.id = si.product_id
         WHERE s.sale_date::date BETWEEN $1 AND $2`,
        [startDate, endDate]
      );
      const sales = parseFloat(salesRes.rows[0].total_sales || 0);
      const cogs = parseFloat(cogsRes.rows[0].cogs || 0);
      const expensesRes = await db.query('SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses WHERE date::date BETWEEN $1 AND $2', [startDate, endDate]);
      const expenses = parseFloat(expensesRes.rows[0].expenses || 0);
      const net = sales - cogs - expenses;

      ws.addRow(['Assets', 'Amount']);
      ws.addRow(['Inventory (at cost)', inventory]);
      ws.addRow([]);
      ws.addRow(['Equity / Retained earnings', net]);
      ws.addRow([]);
      ws.addRow(['Notes', `Generated for ${startDate} → ${endDate}`]);
    } else {
      // P&L / Trading accounts
      const salesRes = await db.query('SELECT COALESCE(SUM(total_amount),0) AS total_sales FROM sales WHERE sale_date::date BETWEEN $1 AND $2', [startDate, endDate]);
      const cogsRes = await db.query(
        `SELECT COALESCE(SUM(si.quantity * COALESCE(p.unit_cost_price,0)),0) AS cogs
         FROM sale_items si JOIN sales s ON s.id = si.sale_id JOIN products p ON p.id = si.product_id
         WHERE s.sale_date::date BETWEEN $1 AND $2`,
        [startDate, endDate]
      );
      const expensesRes = await db.query('SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses WHERE date::date BETWEEN $1 AND $2', [startDate, endDate]);
      const sales = parseFloat(salesRes.rows[0].total_sales || 0);
      const cogs = parseFloat(cogsRes.rows[0].cogs || 0);
      const expenses = parseFloat(expensesRes.rows[0].expenses || 0);
      const gross = sales - cogs;
      const net = gross - expenses;

      ws.addRow(['Trading Account', 'Amount']);
      ws.addRow(['Total Sales', sales]);
      ws.addRow(['Cost of Goods Sold', cogs]);
      ws.addRow(['Gross Profit', gross]);
      ws.addRow([]);
      ws.addRow(['Profit & Loss', 'Amount']);
      ws.addRow(['Operating Expenses', expenses]);
      ws.addRow(['Net Profit', net]);
      ws.addRow([]);
      ws.addRow(['Notes', `Generated for ${startDate} → ${endDate}`]);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="report-${type}-${startDate}-${endDate}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('generate report', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
