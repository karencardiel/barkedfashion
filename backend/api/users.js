// backend/api/users.js
const express = require('express');
const router  = express.Router();

// POST /api/users/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  // TODO: hash password, save to DB
  res.status(201).json({ message: 'User registered', email });
});

// POST /api/users/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  // TODO: validate against DB, issue JWT
  res.json({ message: 'Login successful (demo)', token: 'demo-token-123' });
});

module.exports = router;
