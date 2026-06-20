// backend/api/products.js
const express = require('express');
const router  = express.Router();

// In a real app these would query the DB. Using mock data for skeleton.
const products = require('../../data/json/products.json');

// GET /api/products
router.get('/', (req, res) => {
  const { category, q, limit = 20, page = 1 } = req.query;
  let result = [...products];

  if (category) result = result.filter(p => p.category === category);
  if (q)        result = result.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  const start = (page - 1) * limit;
  res.json({
    total: result.length,
    page: Number(page),
    data: result.slice(start, start + Number(limit))
  });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;
