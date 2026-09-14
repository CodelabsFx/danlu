const request = require('supertest');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ userId: 1, role: 'owner' }, process.env.JWT_SECRET || 'change_me', { expiresIn: '1h' });

jest.mock('../src/db', () => ({
  query: jest.fn((text, params = []) => {
    if (text.includes('FROM settings')) {
      return Promise.resolve({ rows: [{ id: 1, business_name: 'Danlu', currency: 'KES' }] });
    }

    if (text.includes('FROM audit_logs')) {
      return Promise.resolve({ rows: [{ id: 1, action: 'updated settings', details: { business_name: 'Danlu' } }] });
    }

    if (text.includes('SUM(total_amount)') || text.includes('COUNT(*)')) {
      return Promise.resolve({ rows: [{ total_sales: '85000', expenses: '15000', cogs: '42000', expected_profit: '43000', actual_net_profit: '28000' }] });
    }

    if (text.includes('SELECT id, name, email, role')) {
      return Promise.resolve({ rows: [{ id: 1, name: 'Admin', email: 'admin@danlu.com', role: 'owner' }] });
    }

    if (text.startsWith('INSERT INTO settings')) {
      return Promise.resolve({ rows: [{ id: 1, business_name: params[0], currency: params[1] }] });
    }

    if (text.startsWith('INSERT INTO audit_logs')) {
      return Promise.resolve({ rows: [{ id: 1, action: params[0], details: params[1] }] });
    }

    return Promise.resolve({ rows: [] });
  })
}));

const app = require('../src/app');

describe('Remaining admin modules', () => {
  test('gets the business settings', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.settings).toBeDefined();
  });

  test('gets audit logs', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  test('returns pnl summary', async () => {
    const res = await request(app)
      .get('/api/analytics/pnl')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total_sales).toBeDefined();
    expect(res.body.actual_net_profit).toBeDefined();
  });
});
