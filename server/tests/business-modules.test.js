const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/db', () => ({
  query: jest.fn((text, params = []) => {
    if (text.includes('FROM purchases')) {
      return Promise.resolve({ rows: [{ id: 1, supplier_name: 'Acme Supply', total_amount: '150.00' }] });
    }

    if (text.includes('FROM stock_movements')) {
      return Promise.resolve({ rows: [{ id: 1, product_id: 1, movement_type: 'purchase', quantity_change: 5 }] });
    }

    if (text.includes('FROM salaries')) {
      return Promise.resolve({ rows: [{ id: 1, worker_id: 1, net_salary: '4400.00' }] });
    }

    if (text.includes('SELECT id, current_stock_quantity, unit_cost_price FROM products WHERE id = $1 FOR UPDATE')) {
      return Promise.resolve({ rows: [{ id: 1, current_stock_quantity: 10, unit_cost_price: '18.00' }] });
    }

    if (text.startsWith('INSERT INTO purchases')) {
      return Promise.resolve({ rows: [{ id: 7, supplier_name: params[0], total_amount: params[1], payment_method: params[2], admin_id: params[3] }] });
    }

    if (text.startsWith('INSERT INTO purchase_items')) {
      return Promise.resolve({ rows: [{ id: 11, purchase_id: params[0], product_id: params[1], quantity: params[2], unit_cost_price: params[3], subtotal: params[4] }] });
    }

    if (text.startsWith('INSERT INTO stock_movements')) {
      return Promise.resolve({ rows: [{ id: 22, product_id: params[0], movement_type: params[1], quantity_change: params[2], reference_type: params[3], reference_id: params[4] }] });
    }

    if (text.startsWith('UPDATE products SET current_stock_quantity')) {
      return Promise.resolve({ rows: [{ id: 1, current_stock_quantity: 15 }] });
    }

    if (text.startsWith('INSERT INTO salaries')) {
      return Promise.resolve({ rows: [{ id: 1, worker_id: params[0], basic_salary: params[1], allowances: params[2], deductions: params[3], net_salary: params[4], month: params[5] }] });
    }

    return Promise.resolve({ rows: [] });
  })
}));

const app = require('../src/app');

const token = jwt.sign({ userId: 1, role: 'owner' }, process.env.JWT_SECRET || 'change_me', { expiresIn: '1h' });

describe('Business modules', () => {
  test('creates a purchase and updates stock', async () => {
    const res = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        supplier_name: 'Acme Supply',
        payment_method: 'cash',
        items: [{ product_id: 1, quantity: 5, unit_cost_price: 18 }]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.purchase).toBeDefined();
    expect(res.body.purchase.supplier_name).toBe('Acme Supply');
  });

  test('lists stock movements', async () => {
    const res = await request(app)
      .get('/api/stock-movements')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.movements)).toBe(true);
  });

  test('creates a salary record', async () => {
    const res = await request(app)
      .post('/api/salaries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        worker_id: 1,
        month: '2026-09',
        basic_salary: 4000,
        allowances: 500,
        deductions: 100
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.salary).toBeDefined();
    expect(Number(res.body.salary.net_salary)).toBeGreaterThan(0);
  });
});
