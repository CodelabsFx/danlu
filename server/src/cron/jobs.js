const cron = require('node-cron');
const db = require('../db');
const nodemailer = require('nodemailer');

const OWNER_EMAILS = (process.env.OWNER_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

async function sendEmail(to, subject, html) {
  if (!SMTP_HOST || !SMTP_USER) {
    console.warn('SMTP not configured, skipping email');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  await transporter.sendMail({ from: SMTP_USER, to, subject, html });
}

async function fetchWeeklySummary() {
  // last 7 days
  const now = new Date();
  const end = now.toISOString().slice(0,10);
  const d = new Date(); d.setDate(d.getDate()-6);
  const start = d.toISOString().slice(0,10);

  const salesRes = await db.query('SELECT COALESCE(SUM(total_amount),0) AS total_sales FROM sales WHERE sale_date::date BETWEEN $1 AND $2', [start, end]);
  const total_sales = parseFloat(salesRes.rows[0].total_sales || 0);

  const topItemsRes = await db.query(
    `SELECT p.product_name, SUM(si.quantity) AS qty_sold
     FROM sale_items si JOIN sales s ON s.id = si.sale_id JOIN products p ON p.id = si.product_id
     WHERE s.sale_date::date BETWEEN $1 AND $2
     GROUP BY p.product_name ORDER BY qty_sold DESC LIMIT 5`,
    [start, end]
  );

  const expensesRes = await db.query('SELECT COALESCE(SUM(amount),0) AS total_expenses FROM expenses WHERE date::date BETWEEN $1 AND $2', [start, end]);
  const total_expenses = parseFloat(expensesRes.rows[0].total_expenses || 0);

  const lowStockRes = await db.query('SELECT product_name, current_stock_quantity, min_stock_alert_threshold FROM products WHERE current_stock_quantity <= min_stock_alert_threshold');

  return { start, end, total_sales, total_expenses, topItems: topItemsRes.rows, lowStock: lowStockRes.rows };
}

async function fetchMonthlySummary() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (`0${now.getMonth()+1}`).slice(-2);
  const start = `${year}-${month}-01`;
  const end = now.toISOString().slice(0,10);

  const analytics = await require('../routes/analytics').__getSummaryForRange(start, end, db).catch(async () => {
    // fallback inline queries
    const salesRes = await db.query('SELECT COALESCE(SUM(total_amount),0) AS total_sales FROM sales WHERE sale_date::date BETWEEN $1 AND $2', [start, end]);
    const total_sales = parseFloat(salesRes.rows[0].total_sales || 0);
    const cogsRes = await db.query(
      `SELECT COALESCE(SUM(si.quantity * COALESCE(p.unit_cost_price,0)),0) AS cogs
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products p ON p.id = si.product_id
       WHERE s.sale_date::date BETWEEN $1 AND $2`,
      [start, end]
    );
    const cogs = parseFloat(cogsRes.rows[0].cogs || 0);
    const expensesRes = await db.query('SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses WHERE date::date BETWEEN $1 AND $2', [start, end]);
    const expenses = parseFloat(expensesRes.rows[0].expenses || 0);
    return { start, end, total_sales, cogs, expenses };
  });
  return analytics;
}

// Weekly job: Sundays 23:59
cron.schedule('59 23 * * 0', async () => {
  try {
    const summary = await fetchWeeklySummary();
    const html = `<h2>Weekly Summary (${summary.start} to ${summary.end})</h2>
      <p>Total Sales: ${summary.total_sales}</p>
      <p>Total Expenses: ${summary.total_expenses}</p>
      <h3>Top Items</h3>
      <ul>${summary.topItems.map(i=>`<li>${i.product_name} — ${i.qty_sold}</li>`).join('')}</ul>
      <h3>Low Stock</h3>
      <ul>${summary.lowStock.map(p=>`<li>${p.product_name} — ${p.current_stock_quantity} (min ${p.min_stock_alert_threshold})</li>`).join('')}</ul>`;

    if (OWNER_EMAILS.length) await sendEmail(OWNER_EMAILS.join(','), `Weekly Summary ${summary.start} - ${summary.end}`, html);
    console.log('Weekly summary sent');
  } catch (err) {
    console.error('weekly cron error', err);
  }
});

// Monthly job: run daily at 23:59 and if tomorrow is 1st, send
cron.schedule('59 23 * * *', async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate()+1);
    if (tomorrow.getDate() !== 1) return; // not last day

    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    const end = now.toISOString().slice(0,10);

    const salesRes = await db.query('SELECT COALESCE(SUM(total_amount),0) AS total_sales FROM sales WHERE sale_date::date BETWEEN $1 AND $2', [start, end]);
    const total_sales = parseFloat(salesRes.rows[0].total_sales || 0);
    const cogsRes = await db.query(
      `SELECT COALESCE(SUM(si.quantity * COALESCE(p.unit_cost_price,0)),0) AS cogs
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products p ON p.id = si.product_id
       WHERE s.sale_date::date BETWEEN $1 AND $2`,
      [start, end]
    );
    const cogs = parseFloat(cogsRes.rows[0].cogs || 0);
    const expensesRes = await db.query('SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses WHERE date::date BETWEEN $1 AND $2', [start, end]);
    const expenses = parseFloat(expensesRes.rows[0].expenses || 0);

    const expected_profit = total_sales - cogs;
    const actual_net = expected_profit - expenses;

    const html = `<h2>Monthly Financial Statement (${start} to ${end})</h2>
      <p>Total Sales: ${total_sales}</p>
      <p>COGS: ${cogs}</p>
      <p>Expected Profit: ${expected_profit}</p>
      <p>Total Expenses: ${expenses}</p>
      <p>Net Profit: ${actual_net}</p>`;

    if (OWNER_EMAILS.length) await sendEmail(OWNER_EMAILS.join(','), `Monthly Financial Statement ${start} - ${end}`, html);
    console.log('Monthly financial statement sent');
  } catch (err) {
    console.error('monthly cron error', err);
  }
});

console.log('Cron jobs initialized');

module.exports = {};
