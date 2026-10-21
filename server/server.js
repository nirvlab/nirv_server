const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const fs = require('node:fs');
const { initDatabase } = require('./db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Initialize DB schema & seed
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy if deployed behind nginx/cloud
app.set('trust proxy', 1);

// Security Headers via Helmet (OWASP secure headers)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite dev scripts & SPA routing
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xFrameOptions: { action: 'sameorigin' }
  })
);

// Safe CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parser limits to prevent request-flooding Denial of Service
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters (OWASP Rate Limiting Cheat Sheet)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes to thwart brute-force attacks
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 15 phút.' }
});

app.use('/api', apiLimiter);
app.use('/api/admin/login', loginLimiter);

// Static uploads directory with nosniff and download headers
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use(
  '/uploads',
  express.static(uploadDir, {
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  })
);

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

// Centralized safe error handling (OWASP Error Handling Cheat Sheet: never leak stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: 'Yêu cầu không thể hoàn tất do lỗi máy chủ nội bộ.'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`NIRV API Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
