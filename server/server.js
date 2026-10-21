const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const { initDatabase } = require('./db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Initialize DB schema & seed
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory for media
const uploadDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Static public assets
const publicAssetsDir = path.resolve(__dirname, '../public/assets');
app.use('/assets', express.static(publicAssetsDir));

// API routes
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Static built frontend if dist exists
const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/assets')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`NIRV API Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
