const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const fs = require('node:fs');
const { initDatabase } = require('./db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Initialize DB schema & seed (only in standalone/dev, not on every serverless invocation)
if (!process.env.VERCEL) {
  initDatabase().catch(console.error);
}

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

// Persistent Uploads Directory and Database Fallback Handler
const os = require('node:os');
const uploadDir = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : path.resolve(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {}

async function handleServeUpload(req, res) {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  // 1. If present on disk, serve directly
  if (fs.existsSync(filePath)) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
  }

  // 2. Fetch from Turso database persistence
  try {
    const { db } = require('./db');
    const asset = await db.get('SELECT mimetype, data_base64 FROM media_assets WHERE filename = ?', [filename]);
    if (asset && asset.data_base64) {
      const buffer = Buffer.from(asset.data_base64, 'base64');
      res.setHeader('Content-Type', asset.mimetype || 'image/jpeg');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      try {
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, buffer);
        }
      } catch (e) {}
      return res.send(buffer);
    }
  } catch (err) {
    console.error('Error serving upload from db:', err.message);
  }

  // 3. Graceful SVG fallback for missing assets
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#f0eeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999999">NIRV Media Asset</text></svg>');
}

app.get('/uploads/:filename', handleServeUpload);
app.get('/api/uploads/:filename', handleServeUpload);


// Static public assets
const publicAssetsDir = path.resolve(__dirname, '../public/assets');
app.use('/assets', express.static(publicAssetsDir));

// API routes
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Dynamic OpenGraph & Twitter Card SSR Meta Tag Injector for Social Media Sharing (Facebook, Zalo, Twitter, LinkedIn, Telegram)
async function renderPageWithMeta(req, res, next) {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/assets')) {
    return next();
  }

  const distHtml = path.resolve(__dirname, '../dist/index.html');
  const rootHtml = path.resolve(__dirname, '../index.html');
  const htmlFile = fs.existsSync(distHtml) ? distHtml : (fs.existsSync(rootHtml) ? rootHtml : null);

  if (!htmlFile) {
    return next();
  }

  let html = fs.readFileSync(htmlFile, 'utf8');

  // Protocol and host resolution for absolute image URLs (mandatory for Facebook, Zalo, Twitter, LinkedIn)
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? forwardedProto.split(',')[0].trim() : (req.protocol === 'https' ? 'https' : (req.headers['x-forwarded-ssl'] === 'on' ? 'https' : req.protocol));
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'nirvlab.org';
  const baseUrl = `${protocol}://${host}`;
  const fullUrl = `${baseUrl}${req.originalUrl || req.url}`;

  // Default brand metadata
  let pageTitle = 'NIRV — Network for Intelligent Research Vietnam';
  let pageDesc = 'Cộng đồng kết nối sinh viên và người trẻ nghiên cứu Trí tuệ Nhân tạo (NLP, CV, LLMs).';
  let pageImage = `${baseUrl}/uploads/1792580609685_1792561391106_202164200782567973_3826812143860545776_303ca5e914fb3273297adf791edd7016.jpg`;
  let pageType = 'website';

  try {
    const { db } = require('./db');
    const pathParts = req.path.split('/').filter(Boolean);
    const isLangVi = pathParts[0] === 'vi' || pathParts[0] !== 'en';
    const section = pathParts[1];
    const slug = pathParts[2];

    if (slug && (section === 'dong-gop-xa-hoi' || section === 'social-contribution')) {
      const init = await db.get('SELECT * FROM initiatives WHERE slug = ?', [slug]);
      if (init) {
        pageType = 'article';
        pageTitle = `${isLangVi ? init.title_vi : (init.title_en || init.title_vi)} — NIRV`;
        pageDesc = isLangVi ? (init.summary_vi || init.title_vi) : (init.summary_en || init.title_en || init.summary_vi);
        if (init.cover_image) {
          pageImage = init.cover_image.startsWith('http') ? init.cover_image : `${baseUrl}${init.cover_image.startsWith('/') ? '' : '/'}${init.cover_image}`;
        }
      }
    } else if (slug && (section === 'tin-tuc-su-kien' || section === 'news-events')) {
      const newsItem = await db.get('SELECT * FROM news_events WHERE slug = ?', [slug]);
      if (newsItem) {
        pageType = 'article';
        pageTitle = `${isLangVi ? newsItem.title_vi : (newsItem.title_en || newsItem.title_vi)} — NIRV`;
        pageDesc = isLangVi ? (newsItem.summary_vi || newsItem.title_vi) : (newsItem.summary_en || newsItem.title_en || newsItem.summary_vi);
        if (newsItem.cover_image) {
          pageImage = newsItem.cover_image.startsWith('http') ? newsItem.cover_image : `${baseUrl}${newsItem.cover_image.startsWith('/') ? '' : '/'}${newsItem.cover_image}`;
        }
      }
    }
  } catch (err) {
    console.error('Error generating social preview meta tags:', err.message);
  }

  const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = escapeHtml(pageTitle);
  const safeDesc = escapeHtml(pageDesc);
  const safeImage = escapeHtml(pageImage);
  const safeUrl = escapeHtml(fullUrl);

  const dynamicMeta = `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    <meta property="og:type" content="${pageType}" />
    <meta property="og:site_name" content="NIRV — Network for Intelligent Research Vietnam" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safeUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
  `;

  // Strip pre-existing static meta tags
  html = html.replace(/<title>.*?<\/title>/i, '');
  html = html.replace(/<meta\s+name=["']description["'].*?>/gi, '');
  html = html.replace(/<meta\s+property=["']og:.*?["'].*?>/gi, '');
  html = html.replace(/<meta\s+name=["']twitter:.*?["'].*?>/gi, '');

  html = html.replace('</head>', `${dynamicMeta}\n  </head>`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
}

// Static built frontend if dist exists
const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));
}
app.use(renderPageWithMeta);

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

// Start listening only in standalone/dev environment (not in Vercel Serverless)
let server;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`NIRV API Server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server };
