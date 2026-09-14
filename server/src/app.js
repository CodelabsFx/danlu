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
const analyticsRoutes = require('./routes/analytics');

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
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const path = require('path');
const fs = require('fs');

// Serve built client if available
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
	app.use(express.static(clientDist));

	// Fallback to index.html for client-side routing (keep API & /health routes above)
	app.get('*', (req, res) => {
		if (req.path.startsWith('/api') || req.path === '/health') return res.status(404).end();
		res.sendFile(path.join(clientDist, 'index.html'));
	});
}

module.exports = app;
