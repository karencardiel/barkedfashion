// api/index.js — Entry point para Vercel Serverless Functions
// Vercel detecta automáticamente todo lo que esté en /api/
const app = require('../backend/app');
module.exports = app;
