// backend/api/orders.js
const express = require('express');
const router  = express.Router();

// GET /api/orders (user's orders)
router.get('/', (req, res) => {
  // TODO: get user from JWT, query orders
  res.json({ message: 'Orders endpoint (auth required)', data: [] });
});

// POST /api/orders
router.post('/', (req, res) => {
  const { items, shipping_addr } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });
  // TODO: create order in DB, decrease stock, send email
  res.status(201).json({ message: 'Order created', orderId: Math.floor(Math.random() * 9000) + 1000 });
});

module.exports = router;
