// backend/api/cart.js
const express = require('express');
const router  = express.Router();

router.get('/',          (req, res) => res.json({ message: 'Cart (auth required)', items: [] }));
router.post('/add',      (req, res) => res.status(201).json({ message: 'Item added to cart' }));
router.delete('/:itemId',(req, res) => res.json({ message: 'Item removed' }));

module.exports = router;
