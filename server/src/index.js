// Start server (kept minimal) and cron jobs — app logic lives in app.js for tests
require('dotenv').config();
const app = require('./app');
// start cron jobs (only in real runtime)
if (process.env.DISABLE_CRON !== '1') {
	try { require('./cron/jobs'); } catch (err) { console.warn('cron jobs not started', err.message); }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
