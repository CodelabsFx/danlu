const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/', requireAuth, async (req, res) => {
  try {
    const q = await db.query('SELECT * FROM purchases ORDER BY purchase_date DESC LIMIT 200');
    return res.json({ purchases: q.rows });
  } catch (err) {
    console.error('list purchases', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { supplier_name, payment_method, items = [] } = req.body;
    if (!supplier_name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'supplier_name and items are required' });
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost_price || 0), 0);

    const purchaseRes = await db.query(
      'INSERT INTO purchases (supplier_name, purchase_date, total_amount, payment_method, admin_id) VALUES (now(), $1, $2, $3, $4) RETURNING *',
      [supplier_name, totalAmount, payment_method || 'cash', req.user.userId]
    );

    const purchase = purchaseRes.rows[0];
    const purchaseId = purchase.id;

    for (const item of items) {
      const productId = item.product_id;
      const qty = Number(item.quantity || 0);
      const unitCost = Number(item.unit_cost_price || 0);
      const subtotal = qty * unitCost;

      await db.query(
        'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [purchaseId, productId, qty, unitCost, subtotal]
      );

      const productRes = await db.query('SELECT id, current_stock_quantity, unit_cost_price FROM products WHERE id = $1 FOR UPDATE', [productId]);
      const product = productRes.rows[0];
      if (!product) {
        throw new Error('Product not found');
      }

      const newStock = Number(product.current_stock_quantity || 0) + qty;
      const avgCost = Number(product.unit_cost_price || 0) || unitCost;
      await db.query(
        'UPDATE products SET current_stock_quantity = $1, unit_cost_price = $2 WHERE id = $3',
        [newStock, avgCost, productId]
      );

      await db.query(
        'INSERT INTO stock_movements (product_id, movement_type, quantity_change, reference_type, reference_id, note) VALUES ($1, $2, $3, $4, $5, $6)',
        [productId, 'purchase', qty, 'purchase', purchaseId, `Purchase #${purchaseId}`]
      );
    }

    return res.status(201).json({ purchase });
  } catch (err) {
    console.error('create purchase', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

module.exports = router;
