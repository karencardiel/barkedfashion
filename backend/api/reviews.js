// backend/api/reviews.js
const express = require('express');
const router  = express.Router();

router.get('/:productId', (req, res) => {
  res.json({ productId: req.params.productId, reviews: [] });
});

router.post('/', (req, res) => {
  const { product_id, rating, comment } = req.body;
  if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required' });
  res.status(201).json({ message: 'Review submitted' });
});

module.exports = router;
