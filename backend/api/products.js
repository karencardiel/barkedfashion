// backend/api/products.js
const express = require('express');
const router  = express.Router();
// Importas tu pool o cliente de conexión a la base de datos (MySQL/PostgreSQL)
const db      = require('../config/db'); 

// GET /api/products
router.get('/', async (req, res) => {
  const { category, q, limit = 20, page = 1 } = req.query;
  const parsedLimit = Number(limit);
  const offset = (Number(page) - 1) * parsedLimit;

  // 1. Consulta base: Unimos las tablas products y categories usando tu esquema relacional
  let sql = `
    SELECT p.*, c.slug AS category_slug 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = TRUE
  `;
  const queryParams = [];

  // 2. Filtro adaptativo por categoría (slug)
  if (category) {
    sql += ` AND c.slug = ?`;
    queryParams.push(category);
  }

  // 3. Filtro adaptativo por buscador (Coincidencia parcial en nombre o descripción)
  if (q) {
    sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
    const searchPattern = `%${q}%`;
    queryParams.push(searchPattern, searchPattern);
  }

  // 4. Orden y Paginación válidos para SQL
  sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(parsedLimit, offset);

  try {
    // 5. Ejecución de la consulta en la base de datos
    const [rows] = await db.query(sql, queryParams);
    
    res.json({
      total: rows.length,
      page: Number(page),
      data: rows // Devuelve directamente las filas de tu tabla SQL al frontend
    });
  } catch (error) {
    console.error("Error en GET /api/products:", error);
    res.status(500).json({ error: 'Error interno del servidor al consultar la base de datos.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const productId = Number(req.params.id);

  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ? AND is_active = TRUE', [productId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error en GET /api/products/:id:", error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
