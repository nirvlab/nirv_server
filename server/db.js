const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const bcrypt = require('bcryptjs');

const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'nirv.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS initiatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      summary_vi TEXT,
      summary_en TEXT,
      content_vi TEXT,
      content_en TEXT,
      category_vi TEXT,
      category_en TEXT,
      beneficiaries_vi TEXT,
      beneficiaries_en TEXT,
      metric_value TEXT,
      metric_label_vi TEXT,
      metric_label_en TEXT,
      cover_image TEXT,
      gallery TEXT,
      status TEXT DEFAULT 'published',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      summary_vi TEXT,
      summary_en TEXT,
      content_vi TEXT,
      content_en TEXT,
      category_vi TEXT,
      category_en TEXT,
      tags TEXT,
      cover_image TEXT,
      author_vi TEXT,
      author_en TEXT,
      event_date DATETIME,
      event_location_vi TEXT,
      event_location_en TEXT,
      event_registration_url TEXT,
      is_featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      authors TEXT NOT NULL,
      year INTEGER NOT NULL,
      venue TEXT NOT NULL,
      publication_type TEXT NOT NULL,
      ranking_category TEXT,
      doi TEXT,
      publisher_url TEXT,
      pdf_url TEXT,
      abstract_vi TEXT,
      abstract_en TEXT,
      keywords TEXT,
      citation_count INTEGER DEFAULT 0,
      citation_source TEXT,
      topic_tags TEXT,
      is_featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title_vi TEXT,
      title_en TEXT,
      role_vi TEXT NOT NULL,
      role_en TEXT NOT NULL,
      group_category TEXT NOT NULL,
      affiliation_vi TEXT,
      affiliation_en TEXT,
      research_interests_vi TEXT,
      research_interests_en TEXT,
      bio_vi TEXT,
      bio_en TEXT,
      avatar TEXT,
      email TEXT,
      google_scholar TEXT,
      orcid TEXT,
      github TEXT,
      website TEXT,
      order_index INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin if not exists
  const checkAdmin = db.prepare('SELECT count(*) as count FROM admin_users').get();
  if (checkAdmin.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('NirvAdmin2026!', salt);
    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (username, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `);
    insertAdmin.run('admin', passwordHash, 'Quản trị viên NIRV', 'superadmin');
  }

  // Authentic Brand Settings for NIRV Research Community
  const settings = [
    ['org_name_vi', 'Cộng đồng Nghiên cứu NIRV'],
    ['org_name_en', 'NIRV Research Community'],
    ['tagline_vi', 'Network for Intelligent Research Vietnam'],
    ['tagline_en', 'Network for Intelligent Research Vietnam'],
    ['intro_vi', 'NIRV — Network for Intelligent Research Vietnam — là cộng đồng kết nối những sinh viên và người trẻ quan tâm đến nghiên cứu trí tuệ nhân tạo.\n\nChúng tôi tin rằng những người theo đuổi nghiên cứu độc lập, dù ở bất cứ đâu, đều xứng đáng có một nơi để kết nối, cùng làm việc, chia sẻ ý tưởng và tự do phát huy sức sáng tạo khoa học.\n\nVới định hướng nghiên cứu Xử lý ngôn ngữ tự nhiên (NLP), Thị giác máy tính (CV) và Mô hình ngôn ngữ lớn (LLMs), NIRV hướng đến việc góp phần xây dựng một cộng đồng nghiên cứu AI Việt Nam cởi mở, hợp tác và không ngừng phát triển.'],
    ['intro_en', 'NIRV — Network for Intelligent Research Vietnam — is a research community connecting students and emerging researchers interested in artificial intelligence.\n\nWe believe independent researchers, wherever they are, deserve a place to belong, collaborate, exchange ideas, and freely develop their scientific creativity.\n\nWith research interests spanning Natural Language Processing (NLP), Computer Vision (CV), and Large Language Models (LLMs), NIRV aspires to contribute to an open, collaborative, and growing AI research community in Vietnam.'],
    ['focus_areas_vi', 'Xử lý ngôn ngữ tự nhiên (NLP), Thị giác máy tính (CV), Mô hình ngôn ngữ lớn (LLMs)'],
    ['focus_areas_en', 'Natural Language Processing (NLP), Computer Vision (CV), Large Language Models (LLMs)'],
    ['contact_address_vi', 'Thành phố Hồ Chí Minh, Việt Nam'],
    ['contact_address_en', 'Ho Chi Minh City, Vietnam'],
    ['contact_email', 'nirv.colab@gmail.com'],
    ['contact_phone', '+84 905935377'],
    ['contact_phone_raw', '+84905935377']
  ];

  const upsertSetting = db.prepare(`
    INSERT INTO site_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  for (const [k, v] of settings) {
    upsertSetting.run(k, v);
  }

  // Clean fabricated/demo data:
  // 1. Remove fabricated publications
  db.exec("DELETE FROM publications");

  // 2. Remove fabricated initiatives with fake impact metrics
  db.exec("DELETE FROM initiatives");

  // 3. Remove fabricated news & events
  db.exec("DELETE FROM news_events");

  // 4. Update team_members: Keep ONLY the verified Founder: Trần Duy Nhân
  db.exec("DELETE FROM team_members WHERE name != 'Trần Duy Nhân'");

  const founderCheck = db.prepare("SELECT count(*) as count FROM team_members WHERE name = 'Trần Duy Nhân'").get();
  if (founderCheck.count === 0) {
    const insertFounder = db.prepare(`
      INSERT INTO team_members (
        name, title_vi, title_en, role_vi, role_en, group_category,
        affiliation_vi, affiliation_en, research_interests_vi, research_interests_en,
        bio_vi, bio_en, avatar, email, google_scholar, orcid, github, website,
        order_index, status
      ) VALUES (
        @name, @title_vi, @title_en, @role_vi, @role_en, @group_category,
        @affiliation_vi, @affiliation_en, @research_interests_vi, @research_interests_en,
        @bio_vi, @bio_en, @avatar, @email, @google_scholar, @orcid, @github, @website,
        @order_index, @status
      )
    `);

    insertFounder.run({
      name: 'Trần Duy Nhân',
      title_vi: 'Nhà sáng lập cộng đồng nghiên cứu NIRV',
      title_en: 'Founder of the NIRV Research Community',
      role_vi: 'Nhà sáng lập cộng đồng nghiên cứu NIRV',
      role_en: 'Founder of the NIRV Research Community',
      group_category: 'leadership',
      affiliation_vi: 'Cộng đồng Nghiên cứu NIRV (Thành phố Hồ Chí Minh, Việt Nam)',
      affiliation_en: 'NIRV Research Community (Ho Chi Minh City, Vietnam)',
      research_interests_vi: 'Xử lý ngôn ngữ tự nhiên (NLP), Thị giác máy tính (CV), Mô hình ngôn ngữ lớn (LLMs)',
      research_interests_en: 'Natural Language Processing (NLP), Computer Vision (CV), Large Language Models (LLMs)',
      bio_vi: 'Khởi xướng cộng đồng nghiên cứu NIRV nhằm tạo dựng một không gian học thuật mở, độc lập và gắn kết cho các bạn sinh viên, người trẻ đam mê nghiên cứu Trí tuệ Nhân tạo tại Việt Nam.',
      bio_en: 'Initiated the NIRV research community to build an open, collaborative, and independent space for students and emerging researchers passionate about AI in Vietnam.',
      avatar: '',
      email: 'nirv.colab@gmail.com',
      google_scholar: '',
      orcid: '',
      github: '',
      website: '',
      order_index: 1,
      status: 'published'
    });
  } else {
    // Ensure titles and roles are exactly verified
    db.prepare(`
      UPDATE team_members SET
        title_vi = 'Nhà sáng lập cộng đồng nghiên cứu NIRV',
        title_en = 'Founder of the NIRV Research Community',
        role_vi = 'Nhà sáng lập cộng đồng nghiên cứu NIRV',
        role_en = 'Founder of the NIRV Research Community',
        affiliation_vi = 'Cộng đồng Nghiên cứu NIRV (Thành phố Hồ Chí Minh, Việt Nam)',
        affiliation_en = 'NIRV Research Community (Ho Chi Minh City, Vietnam)',
        research_interests_vi = 'Xử lý ngôn ngữ tự nhiên (NLP), Thị giác máy tính (CV), Mô hình ngôn ngữ lớn (LLMs)',
        research_interests_en = 'Natural Language Processing (NLP), Computer Vision (CV), Large Language Models (LLMs)',
        email = 'nirv.colab@gmail.com'
      WHERE name = 'Trần Duy Nhân'
    `).run();
  }

  console.log('Database initialized, sanitized, and updated at:', dbPath);
}

module.exports = {
  db,
  initDatabase
};
