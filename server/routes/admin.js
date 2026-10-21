const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const { db } = require('../db');
const { generateToken, requireAuth } = require('../auth');

// Multer storage setup
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${basename}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg|gif|pdf|docx|zip/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tệp không hợp lệ. Chỉ chấp nhận ảnh (JPG, PNG, WEBP, SVG, GIF) và tài liệu (PDF, DOCX, ZIP).'));
    }
  }
});

// POST /api/admin/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// All routes below require authorization
router.use(requireAuth);

// GET /api/admin/me
router.get('/me', (req, res) => {
  res.json({ success: true, user: req.user });
});

// GET /api/admin/stats (Internal management statistics)
router.get('/stats', (req, res) => {
  try {
    const pubTotal = db.prepare('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published, sum(case when status="draft" then 1 else 0 end) as draft FROM publications').get();
    const initTotal = db.prepare('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published, sum(case when status="draft" then 1 else 0 end) as draft FROM initiatives').get();
    const newsTotal = db.prepare('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published, sum(case when status="draft" then 1 else 0 end) as draft FROM news_events').get();
    const teamTotal = db.prepare('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published FROM team_members').get();
    const mediaTotal = db.prepare('SELECT count(*) as total FROM media_assets').get();

    res.json({
      success: true,
      data: {
        publications: pubTotal,
        initiatives: initTotal,
        news_events: newsTotal,
        team: teamTotal,
        media: mediaTotal
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// INITIATIVES CRUD
// ==========================================
router.get('/initiatives', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM initiatives ORDER BY order_index ASC, id DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/initiatives', (req, res) => {
  try {
    const {
      slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, beneficiaries_vi, beneficiaries_en,
      metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index
    } = req.body;

    if (!title_vi || !title_en) {
      return res.status(400).json({ success: false, error: 'Tiêu đề tiếng Việt và tiếng Anh là bắt buộc.' });
    }

    const cleanSlug = slug || title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `init-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO initiatives (
        slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
        category_vi, category_en, beneficiaries_vi, beneficiaries_en,
        metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      cleanSlug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, beneficiaries_vi, beneficiaries_en,
      metric_value, metric_label_vi, metric_label_en, cover_image, gallery || '[]', status || 'published', order_index || 0
    );

    res.json({ success: true, message: 'Dự án đóng góp xã hội đã được tạo thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/initiatives/:id', (req, res) => {
  try {
    const id = req.params.id;
    const {
      slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, beneficiaries_vi, beneficiaries_en,
      metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index
    } = req.body;

    const stmt = db.prepare(`
      UPDATE initiatives SET
        slug = ?, title_vi = ?, title_en = ?, summary_vi = ?, summary_en = ?, content_vi = ?, content_en = ?,
        category_vi = ?, category_en = ?, beneficiaries_vi = ?, beneficiaries_en = ?,
        metric_value = ?, metric_label_vi = ?, metric_label_en = ?, cover_image = ?, gallery = ?,
        status = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, beneficiaries_vi, beneficiaries_en,
      metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index, id
    );

    res.json({ success: true, message: 'Dự án đã được cập nhật thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/initiatives/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM initiatives WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa dự án thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// NEWS & EVENTS CRUD
// ==========================================
router.get('/news-events', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM news_events ORDER BY id DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/news-events', (req, res) => {
  try {
    const {
      slug, type, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, tags, cover_image, author_vi, author_en,
      event_date, event_location_vi, event_location_en, event_registration_url,
      is_featured, status, published_at
    } = req.body;

    if (!title_vi || !title_en) {
      return res.status(400).json({ success: false, error: 'Tiêu đề tiếng Việt và tiếng Anh là bắt buộc.' });
    }

    const cleanSlug = slug || title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO news_events (
        slug, type, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
        category_vi, category_en, tags, cover_image, author_vi, author_en,
        event_date, event_location_vi, event_location_en, event_registration_url,
        is_featured, status, published_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    stmt.run(
      cleanSlug, type || 'news', title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, tags || '', cover_image || '', author_vi || '', author_en || '',
      event_date || null, event_location_vi || null, event_location_en || null, event_registration_url || null,
      is_featured ? 1 : 0, status || 'published', published_at || new Date().toISOString()
    );

    res.json({ success: true, message: 'Đã tạo bài viết/sự kiện mới thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/news-events/:id', (req, res) => {
  try {
    const id = req.params.id;
    const {
      slug, type, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, tags, cover_image, author_vi, author_en,
      event_date, event_location_vi, event_location_en, event_registration_url,
      is_featured, status, published_at
    } = req.body;

    const stmt = db.prepare(`
      UPDATE news_events SET
        slug = ?, type = ?, title_vi = ?, title_en = ?, summary_vi = ?, summary_en = ?, content_vi = ?, content_en = ?,
        category_vi = ?, category_en = ?, tags = ?, cover_image = ?, author_vi = ?, author_en = ?,
        event_date = ?, event_location_vi = ?, event_location_en = ?, event_registration_url = ?,
        is_featured = ?, status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      slug, type, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, tags, cover_image, author_vi, author_en,
      event_date || null, event_location_vi || null, event_location_en || null, event_registration_url || null,
      is_featured ? 1 : 0, status, published_at, id
    );

    res.json({ success: true, message: 'Cập nhật bài viết/sự kiện thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/news-events/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM news_events WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa bài viết/sự kiện thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// PUBLICATIONS CRUD
// ==========================================
router.get('/publications', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM publications ORDER BY year DESC, id DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/publications', (req, res) => {
  try {
    const {
      title, authors, year, venue, publication_type, ranking_category,
      doi, publisher_url, pdf_url, abstract_vi, abstract_en, keywords,
      citation_count, citation_source, topic_tags, is_featured, status
    } = req.body;

    if (!title || !authors || !year || !venue) {
      return res.status(400).json({ success: false, error: 'Tiêu đề, tác giả, năm và nơi công bố là thông tin bắt buộc.' });
    }

    const stmt = db.prepare(`
      INSERT INTO publications (
        title, authors, year, venue, publication_type, ranking_category,
        doi, publisher_url, pdf_url, abstract_vi, abstract_en, keywords,
        citation_count, citation_source, topic_tags, is_featured, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      title, authors, Number(year), venue, publication_type || 'Journal', ranking_category || null,
      doi || null, publisher_url || null, pdf_url || null, abstract_vi || '', abstract_en || '', keywords || '',
      citation_count ? Number(citation_count) : 0, citation_source || 'Manual', topic_tags || '', is_featured ? 1 : 0, status || 'published'
    );

    res.json({ success: true, message: 'Thêm ấn phẩm nghiên cứu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/publications/:id', (req, res) => {
  try {
    const id = req.params.id;
    const {
      title, authors, year, venue, publication_type, ranking_category,
      doi, publisher_url, pdf_url, abstract_vi, abstract_en, keywords,
      citation_count, citation_source, topic_tags, is_featured, status
    } = req.body;

    const stmt = db.prepare(`
      UPDATE publications SET
        title = ?, authors = ?, year = ?, venue = ?, publication_type = ?, ranking_category = ?,
        doi = ?, publisher_url = ?, pdf_url = ?, abstract_vi = ?, abstract_en = ?, keywords = ?,
        citation_count = ?, citation_source = ?, topic_tags = ?, is_featured = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title, authors, Number(year), venue, publication_type, ranking_category || null,
      doi || null, publisher_url || null, pdf_url || null, abstract_vi, abstract_en, keywords,
      Number(citation_count || 0), citation_source, topic_tags, is_featured ? 1 : 0, status, id
    );

    res.json({ success: true, message: 'Cập nhật ấn phẩm thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/publications/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM publications WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa ấn phẩm nghiên cứu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// TEAM MEMBERS CRUD
// ==========================================
router.get('/team', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM team_members ORDER BY order_index ASC, id ASC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/team', (req, res) => {
  try {
    const {
      name, title_vi, title_en, role_vi, role_en, group_category,
      affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
      bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website, order_index, status
    } = req.body;

    if (!name || !role_vi || !role_en) {
      return res.status(400).json({ success: false, error: 'Họ tên và chức vụ (VI/EN) là bắt buộc.' });
    }

    const stmt = db.prepare(`
      INSERT INTO team_members (
        name, title_vi, title_en, role_vi, role_en, group_category,
        affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
        bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website, order_index, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      name, title_vi || '', title_en || '', role_vi, role_en, group_category || 'researchers',
      affiliation_vi || '', affiliation_en || '', research_interests_vi || '', research_interests_en || '',
      bio_vi || '', bio_en || '', avatar || '', email || '', google_scholar || '', orcid || '', github || '', website || '',
      Number(order_index || 0), status || 'published'
    );

    res.json({ success: true, message: 'Thêm nhân sự nghiên cứu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/team/:id', (req, res) => {
  try {
    const id = req.params.id;
    const {
      name, title_vi, title_en, role_vi, role_en, group_category,
      affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
      bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website, order_index, status
    } = req.body;

    const stmt = db.prepare(`
      UPDATE team_members SET
        name = ?, title_vi = ?, title_en = ?, role_vi = ?, role_en = ?, group_category = ?,
        affiliation_vi = ?, affiliation_en = ?, research_interests_vi = ?, research_interests_en = ?,
        bio_vi = ?, bio_en = ?, avatar = ?, email = ?, google_scholar = ?, orcid = ?, github = ?, website = ?,
        order_index = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name, title_vi, title_en, role_vi, role_en, group_category,
      affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
      bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website,
      Number(order_index || 0), status, id
    );

    res.json({ success: true, message: 'Cập nhật thông tin nhân sự thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/team/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa hồ sơ nhân sự.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SITE SETTINGS
// ==========================================
router.get('/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings', (req, res) => {
  try {
    const settings = req.body;
    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(settings)) {
      upsert.run(key, String(value));
    }

    res.json({ success: true, message: 'Cài đặt hệ thống đã được lưu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// MEDIA ASSETS UPLOAD & LIST
// ==========================================
router.post('/media/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Không tìm thấy tệp tải lên.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const stmt = db.prepare(`
      INSERT INTO media_assets (filename, original_name, mimetype, size, url)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, fileUrl);

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        url: fileUrl,
        size: req.file.size
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/media', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM media_assets ORDER BY id DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
