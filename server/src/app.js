require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const workersRoutes = require('./routes/workers');
const expensesRoutes = require('./routes/expenses');
const purchasesRoutes = require('./routes/purchases');
const stockMovementsRoutes = require('./routes/stock-movements');
const salariesRoutes = require('./routes/salaries');
const settingsRoutes = require('./routes/settings');
const auditLogsRoutes = require('./routes/audit-logs');
const analyticsRoutes = require('./routes/analytics');
const reportsRoutes = require('./routes/reports');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);
app.use('/api/salaries', salariesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const path = require('path');
const fs = require('fs');

// Serve uploaded files (product images)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
	try { fs.mkdirSync(uploadsDir); } catch (e) { /* ignore */ }
}
app.use('/uploads', express.static(uploadsDir));

// Serve built client if available. Render and local Docker builds can place the
// bundle under either /app/client/dist or /app/server/client/dist.
const possibleClientDistPaths = [
	path.join(__dirname, '..', '..', 'client', 'dist'),
	path.join(__dirname, '..', 'client', 'dist'),
];
const clientDist = possibleClientDistPaths.find((candidate) => fs.existsSync(candidate));

if (clientDist) {
	app.use(express.static(clientDist));

	// Fallback to index.html for client-side routing (keep API & /health routes above)
	app.get('*', (req, res) => {
		if (req.path.startsWith('/api') || req.path === '/health') return res.status(404).end();
		res.sendFile(path.join(clientDist, 'index.html'));
	});
}

module.exports = app;
