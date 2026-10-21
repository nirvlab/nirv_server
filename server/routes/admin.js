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
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const user = await db.get('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const token = generateToken(user);
    try {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      await db.run('INSERT INTO audit_logs (user_id, username, action, target_type, target_id, ip_address) VALUES (?, ?, ?, ?, ?, ?)', [
        user.id, user.username, 'LOGIN_SUCCESS', 'auth', String(user.id), ip
      ]);
    } catch (e) {}

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
    res.status(500).json({ success: false, error: 'Đăng nhập không thành công do lỗi hệ thống.' });
  }
});

// All routes below require authorization
router.use(requireAuth);

async function logAudit(req, action, targetType, targetId = null) {
  try {
    const userId = req.user ? req.user.id : null;
    const username = req.user ? req.user.username : 'anonymous';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    await db.run('INSERT INTO audit_logs (user_id, username, action, target_type, target_id, ip_address) VALUES (?, ?, ?, ?, ?, ?)', [
      userId, username, action, targetType, targetId ? String(targetId) : null, ip
    ]);
  } catch (e) {
    console.error('Audit log write error:', e.message);
  }
}

// GET /api/admin/me
router.get('/me', (req, res) => {
  res.json({ success: true, user: req.user });
});

// GET /api/admin/stats (Internal management statistics)
router.get('/stats', async (req, res) => {
  try {
    const pubTotal = await db.get('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published, sum(case when status="draft" then 1 else 0 end) as draft FROM publications');
    const initTotal = await db.get('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published, sum(case when status="draft" then 1 else 0 end) as draft FROM initiatives');
    const newsTotal = await db.get('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published, sum(case when status="draft" then 1 else 0 end) as draft FROM news_events');
    const teamTotal = await db.get('SELECT count(*) as total, sum(case when status="published" then 1 else 0 end) as published FROM team_members');
    const mediaTotal = await db.get('SELECT count(*) as total FROM media_assets');

    res.json({
      success: true,
      data: {
        publications: pubTotal || {},
        initiatives: initTotal || {},
        news_events: newsTotal || {},
        team: teamTotal || {},
        media: mediaTotal || {}
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// INITIATIVES CRUD
// ==========================================
router.get('/initiatives', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM initiatives ORDER BY order_index ASC, id DESC');
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/initiatives', async (req, res) => {
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

    await db.run(`
      INSERT INTO initiatives (
        slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
        category_vi, category_en, beneficiaries_vi, beneficiaries_en,
        metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      cleanSlug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, beneficiaries_vi, beneficiaries_en,
      metric_value, metric_label_vi, metric_label_en, cover_image, gallery || '[]', status || 'published', order_index || 0
    ]);

    await logAudit(req, 'CREATE_INITIATIVE', 'initiative', cleanSlug);
    res.json({ success: true, message: 'Dự án đóng góp xã hội đã được tạo thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/initiatives/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, beneficiaries_vi, beneficiaries_en,
      metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index
    } = req.body;

    await db.run(`
      UPDATE initiatives SET
        slug = ?, title_vi = ?, title_en = ?, summary_vi = ?, summary_en = ?, content_vi = ?, content_en = ?,
        category_vi = ?, category_en = ?, beneficiaries_vi = ?, beneficiaries_en = ?,
        metric_value = ?, metric_label_vi = ?, metric_label_en = ?, cover_image = ?, gallery = ?,
        status = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, beneficiaries_vi, beneficiaries_en,
      metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index, id
    ]);

    await logAudit(req, 'UPDATE_INITIATIVE', 'initiative', id);
    res.json({ success: true, message: 'Dự án đã được cập nhật thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/initiatives/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM initiatives WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE_INITIATIVE', 'initiative', req.params.id);
    res.json({ success: true, message: 'Đã xóa dự án thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// NEWS & EVENTS CRUD
// ==========================================
router.get('/news-events', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM news_events ORDER BY id DESC');
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/news-events', async (req, res) => {
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

    await db.run(`
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
    `, [
      cleanSlug, type || 'news', title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, tags || '', cover_image || '', author_vi || '', author_en || '',
      event_date || null, event_location_vi || null, event_location_en || null, event_registration_url || null,
      is_featured ? 1 : 0, status || 'published', published_at || new Date().toISOString()
    ]);

    await logAudit(req, 'CREATE_NEWS_EVENT', 'news_event', cleanSlug);
    res.json({ success: true, message: 'Đã tạo bài viết/sự kiện mới thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/news-events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      slug, type, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, tags, cover_image, author_vi, author_en,
      event_date, event_location_vi, event_location_en, event_registration_url,
      is_featured, status, published_at
    } = req.body;

    await db.run(`
      UPDATE news_events SET
        slug = ?, type = ?, title_vi = ?, title_en = ?, summary_vi = ?, summary_en = ?, content_vi = ?, content_en = ?,
        category_vi = ?, category_en = ?, tags = ?, cover_image = ?, author_vi = ?, author_en = ?,
        event_date = ?, event_location_vi = ?, event_location_en = ?, event_registration_url = ?,
        is_featured = ?, status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      slug, type, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
      category_vi, category_en, tags, cover_image, author_vi, author_en,
      event_date || null, event_location_vi || null, event_location_en || null, event_registration_url || null,
      is_featured ? 1 : 0, status, published_at, id
    ]);

    await logAudit(req, 'UPDATE_NEWS_EVENT', 'news_event', id);
    res.json({ success: true, message: 'Cập nhật bài viết/sự kiện thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/news-events/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM news_events WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE_NEWS_EVENT', 'news_event', req.params.id);
    res.json({ success: true, message: 'Đã xóa bài viết/sự kiện thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// PUBLICATIONS CRUD
// ==========================================
router.get('/publications', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM publications ORDER BY year DESC, id DESC');
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/publications', async (req, res) => {
  try {
    const {
      title, authors, year, venue, publication_type, ranking_category,
      doi, publisher_url, pdf_url, abstract_vi, abstract_en, keywords,
      citation_count, citation_source, topic_tags, is_featured, status
    } = req.body;

    if (!title || !authors || !year || !venue) {
      return res.status(400).json({ success: false, error: 'Tiêu đề, tác giả, năm và nơi công bố là thông tin bắt buộc.' });
    }

    await db.run(`
      INSERT INTO publications (
        title, authors, year, venue, publication_type, ranking_category,
        doi, publisher_url, pdf_url, abstract_vi, abstract_en, keywords,
        citation_count, citation_source, topic_tags, is_featured, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `, [
      title, authors, Number(year), venue, publication_type || 'Journal', ranking_category || null,
      doi || null, publisher_url || null, pdf_url || null, abstract_vi || '', abstract_en || '', keywords || '',
      citation_count ? Number(citation_count) : 0, citation_source || 'Manual', topic_tags || '', is_featured ? 1 : 0, status || 'published'
    ]);

    await logAudit(req, 'CREATE_PUBLICATION', 'publication', title);
    res.json({ success: true, message: 'Thêm ấn phẩm nghiên cứu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/publications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title, authors, year, venue, publication_type, ranking_category,
      doi, publisher_url, pdf_url, abstract_vi, abstract_en, keywords,
      citation_count, citation_source, topic_tags, is_featured, status
    } = req.body;

    await db.run(`
      UPDATE publications SET
        title = ?, authors = ?, year = ?, venue = ?, publication_type = ?, ranking_category = ?,
        doi = ?, publisher_url = ?, pdf_url = ?, abstract_vi = ?, abstract_en = ?, keywords = ?,
        citation_count = ?, citation_source = ?, topic_tags = ?, is_featured = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, authors, Number(year), venue, publication_type, ranking_category || null,
      doi || null, publisher_url || null, pdf_url || null, abstract_vi, abstract_en, keywords,
      Number(citation_count || 0), citation_source, topic_tags, is_featured ? 1 : 0, status, id
    ]);

    await logAudit(req, 'UPDATE_PUBLICATION', 'publication', id);
    res.json({ success: true, message: 'Cập nhật ấn phẩm thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/publications/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM publications WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE_PUBLICATION', 'publication', req.params.id);
    res.json({ success: true, message: 'Đã xóa ấn phẩm nghiên cứu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// TEAM MEMBERS CRUD
// ==========================================
router.get('/team', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM team_members ORDER BY order_index ASC, id ASC');
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/team', async (req, res) => {
  try {
    const {
      name, title_vi, title_en, role_vi, role_en, group_category,
      affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
      bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website, order_index, status
    } = req.body;

    if (!name || !role_vi || !role_en) {
      return res.status(400).json({ success: false, error: 'Họ tên và chức vụ (VI/EN) là bắt buộc.' });
    }

    await db.run(`
      INSERT INTO team_members (
        name, title_vi, title_en, role_vi, role_en, group_category,
        affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
        bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website, order_index, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      name, title_vi || '', title_en || '', role_vi, role_en, group_category || 'researchers',
      affiliation_vi || '', affiliation_en || '', research_interests_vi || '', research_interests_en || '',
      bio_vi || '', bio_en || '', avatar || '', email || '', google_scholar || '', orcid || '', github || '', website || '',
      Number(order_index || 0), status || 'published'
    ]);

    await logAudit(req, 'CREATE_TEAM_MEMBER', 'team_member', name);
    res.json({ success: true, message: 'Thêm nhân sự nghiên cứu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/team/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name, title_vi, title_en, role_vi, role_en, group_category,
      affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
      bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website, order_index, status
    } = req.body;

    await db.run(`
      UPDATE team_members SET
        name = ?, title_vi = ?, title_en = ?, role_vi = ?, role_en = ?, group_category = ?,
        affiliation_vi = ?, affiliation_en = ?, research_interests_vi = ?, research_interests_en = ?,
        bio_vi = ?, bio_en = ?, avatar = ?, email = ?, google_scholar = ?, orcid = ?, github = ?, website = ?,
        order_index = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, title_vi, title_en, role_vi, role_en, group_category,
      affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
      bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website,
      Number(order_index || 0), status, id
    ]);

    await logAudit(req, 'UPDATE_TEAM_MEMBER', 'team_member', id);
    res.json({ success: true, message: 'Cập nhật thông tin nhân sự thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/team/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE_TEAM_MEMBER', 'team_member', req.params.id);
    res.json({ success: true, message: 'Đã xóa hồ sơ nhân sự.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SITE SETTINGS
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    const rows = await db.all('SELECT key, value FROM site_settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.run(`
        INSERT INTO site_settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `, [key, String(value)]);
    }

    await logAudit(req, 'UPDATE_SETTINGS', 'settings');
    res.json({ success: true, message: 'Cài đặt hệ thống đã được lưu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// MEDIA ASSETS UPLOAD & LIST
// ==========================================
router.post('/media/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Không tìm thấy tệp tải lên.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    await db.run(`
      INSERT INTO media_assets (filename, original_name, mimetype, size, url)
      VALUES (?, ?, ?, ?, ?)
    `, [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, fileUrl]);

    await logAudit(req, 'UPLOAD_MEDIA', 'media', req.file.filename);
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

router.get('/media', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM media_assets ORDER BY id DESC');
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/audit-logs (Security Audit Trail)
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await db.all('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100');
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Không thể truy xuất nhật ký kiểm toán.' });
  }
});

module.exports = router;
