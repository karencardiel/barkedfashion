// backend/api/analytics.js
const express = require('express');
const router  = express.Router();

// POST /api/analytics
router.post('/', (req, res) => {
  // express.json() procesará el paquete enviado por el cliente
  const metrics = req.body;

  console.log('======= NUEVA TELEMETRÍA DE ESTUDIANTE =======');
  console.log(`ID Sesión: ${metrics.sessionId}`);
  console.log(`Hora de entrada: ${metrics.timestamp}`);
  console.log(`Tiempo total en pantalla: ${metrics.durationSeconds}s`);
  console.log(`Categorías exploradas: ${metrics.categoriesCount} (${metrics.categoriesList.join(', ')})`);
  console.log(`Páginas visitadas: ${metrics.pagesCount}`);
  console.log(`Usó buscador: ${metrics.usedSearch} (Consultas totales: ${metrics.searchQueriesCount})`);
  console.log(`Segmentación de clics:`, metrics.clicksBreakdown);
  console.log('==============================================');

  /* 
     TODO: Aquí realizarás el INSERT directo a tus tablas relacionales 
     cuando desees persistir los datos de comportamiento en MySQL/PostgreSQL.
  */

  res.status(204).end(); // Respuesta limpia sin contenido para no retrasar al cliente
});

module.exports = router;