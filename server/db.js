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

// Enable foreign keys and WAL mode for reliability
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
    insertAdmin.run('admin', passwordHash, 'Hệ thống Quản trị NIRV', 'superadmin');
  }

  // Seed initial site_settings
  const checkSettings = db.prepare('SELECT count(*) as count FROM site_settings').get();
  if (checkSettings.count === 0) {
    const settings = [
      ['org_name_vi', 'Viện Nghiên cứu Đổi mới & Trí tuệ Nhân tạo NIRV'],
      ['org_name_en', 'NIRV Institute of Research & Artificial Intelligence'],
      ['tagline_vi', 'Tiên phong nghiên cứu công nghệ lõi vì sự tiến bộ bền vững của xã hội'],
      ['tagline_en', 'Pioneering frontier research for sustainable societal progress'],
      ['contact_address_vi', 'Tòa nhà Viện Nghiên cứu NIRV, Khu Công nghệ cao Hòa Lạc, Hà Nội, Việt Nam'],
      ['contact_address_en', 'NIRV Institute Building, Hoa Lac High-Tech Park, Hanoi, Vietnam'],
      ['contact_email', 'contact@nirv.ac.vn'],
      ['contact_phone', '+84 (024) 3888 6688'],
      ['vision_vi', 'Trở thành trung tâm nghiên cứu học thuật và đổi mới sáng tạo xuất sắc hàng đầu khu vực, phát triển các giải pháp trí tuệ nhân tạo, khoa học dữ liệu và công nghệ số phục vụ cộng đồng và đất nước.'],
      ['vision_en', 'To be a premier regional research and innovation institute, developing frontier artificial intelligence, data science, and digital technologies that empower society and nation.'],
      ['mission_vi', 'Thúc đẩy nghiên cứu cơ bản và ứng dụng chất lượng quốc tế, chuyển giao tri thức vì cộng đồng, đào tạo nhân lực khoa học công nghệ tinh hoa và giải quyết các thách thức xã hội cấp bách.'],
      ['mission_en', 'Fostering world-class fundamental and applied research, transferring knowledge for social impact, nurturing elite scientific talents, and addressing pressing global challenges.'],
      ['overview_video_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ']
    ];
    const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of settings) {
      insertSetting.run(k, v);
    }
  }

  // Seed Initiatives
  const checkInit = db.prepare('SELECT count(*) as count FROM initiatives').get();
  if (checkInit.count === 0) {
    const initiatives = [
      {
        slug: 'ai-cho-y-te-cong-dong',
        title_vi: 'Trí tuệ nhân tạo hỗ trợ Chẩn đoán Y tế Tuyến cơ sở',
        title_en: 'AI-Powered Diagnostic Assistance for Community Healthcare',
        summary_vi: 'Ứng dụng mô hình thị giác máy tính và học sâu hỗ trợ bác sĩ vùng sâu, vùng xa chẩn đoán sớm bệnh lý phổi, tim mạch và ung thư với độ chính xác cao.',
        summary_en: 'Deploying computer vision and deep learning models to assist remote doctors in early screening of pulmonary, cardiovascular, and oncological diseases.',
        content_vi: 'Dự án "AI cho Y tế Cộng đồng" do NIRV chủ trì phối hợp cùng các bệnh viện tuyến đầu đã triển khai nền tảng chẩn đoán ảnh X-quang và CT tại hơn 45 trạm y tế vùng cao. Hệ thống giúp rút ngắn 70% thời gian hội chẩn và nâng cao năng lực y tế cơ sở.',
        content_en: 'The "AI for Community Health" initiative led by NIRV in collaboration with central hospitals has deployed X-ray and CT analysis platforms to over 45 highland medical centers, cutting consultation time by 70% and elevating rural healthcare capacity.',
        category_vi: 'Y tế Số & Sức khỏe Cộng đồng',
        category_en: 'Digital Healthcare & Public Well-being',
        beneficiaries_vi: 'Hơn 120.000 người dân tại các xã vùng cao và huyện đảo',
        beneficiaries_en: 'Over 120,000 citizens in mountainous communes and island districts',
        metric_value: '120.000+',
        metric_label_vi: 'Lượt người dân được hỗ trợ sàng lọc y tế',
        metric_label_en: 'Citizens supported with early health screening',
        cover_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
        ]),
        status: 'published',
        order_index: 1
      },
      {
        slug: 'giam-sat-tai-nguyen-moi-truong-ve-tinh',
        title_vi: 'Hệ thống Viễn thám & AI Cảnh báo Sớm Thiên tai Khí hậu',
        title_en: 'Satellite Remote Sensing & AI Climate Early Warning System',
        summary_vi: 'Khai thác dữ liệu ảnh vệ tinh đa phổ và học máy giám sát nguy cơ sạt lở đất, lũ quét và biến đổi dòng chảy đồng bằng sông Cửu Long.',
        summary_en: 'Harnessing multispectral satellite data and machine learning to monitor landslide hazards, flash floods, and hydrological dynamics in the Mekong Delta.',
        content_vi: 'Bằng cách tích hợp dữ liệu viễn thám độ phân giải cao và mô hình mô phỏng thủy văn ngập lụt, NIRV cung cấp hệ thống cảnh báo trước 72 giờ cho các tỉnh miền Trung và đồng bằng sông Cửu Long, phục vụ giảm nhẹ rủi ro thiên tai.',
        content_en: 'By integrating high-resolution earth observation with flood hydrology simulations, NIRV provides 72-hour early hazard warnings for Central Vietnam and the Mekong Delta to reduce climate disaster risks.',
        category_vi: 'Khí hậu & Phát triển Bền vững',
        category_en: 'Climate & Sustainable Development',
        beneficiaries_vi: 'Cộng đồng 13 tỉnh đồng bằng sông Cửu Long và 6 tỉnh miền Trung',
        beneficiaries_en: 'Communities across 13 Mekong Delta provinces and 6 Central provinces',
        metric_value: '72 Giờ',
        metric_label_vi: 'Thời gian cảnh báo thiên tai sớm trước khi xảy ra',
        metric_label_en: 'Advance warning lead-time for natural hazards',
        cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
        ]),
        status: 'published',
        order_index: 2
      },
      {
        slug: 'nen-tang-giao-duc-so-mo',
        title_vi: 'Nền tảng Giáo dục Mở & Học liệu Số cho Học sinh Khuyết tật',
        title_en: 'Open Digital Education & Accessible Learning for Students with Disabilities',
        summary_vi: 'Xây dựng trợ lý ảo chuyển đổi ngôn ngữ ký hiệu hai chiều và hệ thống đọc màn hình tối ưu cho người khiếm thị sử dụng tiếng Việt.',
        summary_en: 'Developing bidirectional sign-language virtual assistants and neural screen readers optimized for visually impaired Vietnamese learners.',
        content_vi: 'Dự án đã phát triển bộ công cụ nguồn mở hoàn toàn miễn phí, hỗ trợ chuyển đổi bài giảng âm thanh sang văn bản và ngôn ngữ ký hiệu trực quan, đã triển khai tại 28 trường chuyên biệt toàn quốc.',
        content_en: 'The initiative engineered open-source accessible assistive tools converting multimodal lectures to sign language and speech, deployed at 28 special education schools nationwide.',
        category_vi: 'Bình đẳng Giáo dục',
        category_en: 'Educational Equity',
        beneficiaries_vi: '15.000 học sinh khiếm thính và khiếm thị toàn quốc',
        beneficiaries_en: '15,000 deaf and visually impaired students nationwide',
        metric_value: '28 Trường',
        metric_label_vi: 'Trường học chuyên biệt ứng dụng nền tảng',
        metric_label_en: 'Special education institutions equipped',
        cover_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
        gallery: JSON.stringify([]),
        status: 'published',
        order_index: 3
      }
    ];

    const insertInit = db.prepare(`
      INSERT INTO initiatives (
        slug, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
        category_vi, category_en, beneficiaries_vi, beneficiaries_en,
        metric_value, metric_label_vi, metric_label_en, cover_image, gallery, status, order_index
      ) VALUES (
        @slug, @title_vi, @title_en, @summary_vi, @summary_en, @content_vi, @content_en,
        @category_vi, @category_en, @beneficiaries_vi, @beneficiaries_en,
        @metric_value, @metric_label_vi, @metric_label_en, @cover_image, @gallery, @status, @order_index
      )
    `);

    for (const item of initiatives) {
      insertInit.run(item);
    }
  }

  // Seed News & Events
  const checkNews = db.prepare('SELECT count(*) as count FROM news_events').get();
  if (checkNews.count === 0) {
    const items = [
      {
        slug: 'nirv-cong-bo-mo-hinh-ngon-ngu-y-hoc-tieng-viet',
        type: 'news',
        title_vi: 'NIRV chính thức công bố Mô hình Ngôn ngữ Lớn Y sinh học tiếng Việt chuyên sâu',
        title_en: 'NIRV Officially Unveils Domain-Adapted Vietnamese Biomedical Foundation Model',
        summary_vi: 'Mô hình NIRV-MedLLM đạt điểm số kỷ lục trong các bài kiểm tra chuẩn kiến thức y khoa lâm sàng tiếng Việt và hỗ trợ tra cứu dược thư chuẩn xác.',
        summary_en: 'NIRV-MedLLM achieves state-of-the-art benchmark scores in Vietnamese clinical medicine examination and accurate pharmacological reasoning.',
        content_vi: 'Hôm nay, các nhà khoa học tại Viện NIRV đã công bố mô hình ngôn ngữ mã nguồn mở NIRV-MedLLM với 14 tỷ tham số được huấn luyện trên 30 triệu tài liệu y học và hồ sơ bệnh án được ẩn danh hóa. Đây là bước tiến vượt bậc trong việc tự chủ công nghệ AI chuyên ngành tại Việt Nam.',
        content_en: 'Today, NIRV scientists officially released NIRV-MedLLM, a 14-billion parameter open-weights foundation model trained on over 30 million anonymized medical articles and clinical records, marking a milestone in sovereign domain-specific AI in Vietnam.',
        category_vi: 'Nghiên cứu & Đổi mới',
        category_en: 'Research & Innovation',
        tags: 'AI, Healthcare, Foundation Models, NLP',
        cover_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
        author_vi: 'Ban Khoa học NIRV',
        author_en: 'NIRV Scientific Board',
        event_date: null,
        event_location_vi: null,
        event_location_en: null,
        event_registration_url: null,
        is_featured: 1,
        status: 'published',
        published_at: '2026-09-15 08:30:00'
      },
      {
        slug: 'hoi-thao-quoc-te-ai-an-toan-va-phat-trien-ben-vung',
        type: 'event',
        title_vi: 'Hội thảo Quốc tế về AI An toàn và Phát triển Bền vững 2026 (SafeAI-VN)',
        title_en: 'International Conference on Safe AI & Sustainable Development 2026',
        summary_vi: 'Quy tụ hơn 300 chuyên gia, nhà khoa học và đại diện chính sách từ 18 quốc gia thảo luận về chuẩn mực đạo đức, an toàn mô hình và ứng dụng công nghệ.',
        summary_en: 'Convening over 300 experts, scientists, and policy leaders from 18 nations to deliberate on alignment, trustworthy AI, and sustainable tech deployment.',
        content_vi: 'Hội thảo sẽ tập trung vào ba chủ đề trọng tâm: Đánh giá độ tin cậy của mô hình tạo sinh, bảo mật quyền riêng tư dữ liệu và ứng dụng AI giải quyết biến đổi khí hậu.',
        content_en: 'The symposium focuses on three central tracks: Evaluation of generative model trustworthiness, privacy-preserving machine learning, and AI for climate mitigation.',
        category_vi: 'Hội nghị Khoa học',
        category_en: 'Academic Conference',
        tags: 'Safe AI, Conference, Sustainability, Ethics',
        cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        author_vi: 'Ban Thư ký Hội thảo NIRV',
        author_en: 'NIRV Conference Secretariat',
        event_date: '2026-11-20 09:00:00',
        event_location_vi: 'Trung tâm Hội nghị Quốc tế NIRV, Hòa Lạc, Hà Nội',
        event_location_en: 'NIRV International Convention Center, Hoa Lac, Hanoi',
        event_registration_url: 'https://nirv.ac.vn/register/safeai2026',
        is_featured: 1,
        status: 'published',
        published_at: '2026-10-01 10:00:00'
      },
      {
        slug: 'hop-tac-nghien-cuu-dai-hoc-oxford',
        type: 'news',
        title_vi: 'NIRV ký kết hợp tác nghiên cứu song phương với Đại học Oxford về Thị giác Máy tính',
        title_en: 'NIRV Signs Bilateral Research Agreement with University of Oxford on Computer Vision',
        summary_vi: 'Chương trình hợp tác 3 năm tài trợ học bổng tiến sĩ và đồng phát triển các thuật toán tái tạo 3D không gian từ ảnh quang học vệ tinh.',
        summary_en: 'A 3-year collaborative grant funding PhD fellowships and co-developing 3D spatial reconstruction algorithms from satellite optical imagery.',
        content_vi: 'Thỏa thuận hợp tác được ký kết tại London giữa Giám đốc Viện NIRV và Trưởng khoa Khoa học Kỹ thuật Đại học Oxford, mở ra các chương trình trao đổi nghiên cứu sinh và công bố công trình chung trên các tạp chí top đầu.',
        content_en: 'The bilateral agreement was executed in London between NIRV Leadership and Oxford Engineering Sciences, enabling doctoral exchange and joint publications in premier IEEE and ACM venues.',
        category_vi: 'Hợp tác Quốc tế',
        category_en: 'International Collaboration',
        tags: 'Oxford, Global Partnership, 3D Vision',
        cover_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
        author_vi: 'Phòng Hợp tác Quốc tế',
        author_en: 'International Affairs Office',
        event_date: null,
        event_location_vi: null,
        event_location_en: null,
        event_registration_url: null,
        is_featured: 0,
        status: 'published',
        published_at: '2026-08-28 14:00:00'
      },
      {
        slug: 'toa-dam-chuyen-giao-cong-nghe-khoa-hoc-du-lieu-2026',
        type: 'event',
        title_vi: 'Tọa đàm Khoa học: Ứng dụng Học tăng cường trong Tối ưu hóa Năng lượng Lưới điện',
        title_en: 'Scientific Seminar: Reinforcement Learning for Smart Grid Energy Optimization',
        summary_vi: 'Diễn giả khách mời: TS. Mark Henderson (ETH Zurich) chia sẻ các kết quả thực nghiệm mới nhất về điều độ năng lượng tái tạo.',
        summary_en: 'Keynote Speaker: Dr. Mark Henderson (ETH Zurich) sharing empirical breakthroughs in renewable energy dispatch with deep RL.',
        content_vi: 'Tọa đàm đã diễn ra thành công với sự tham gia của 120 kỹ sư và nhà nghiên cứu từ các viện năng lượng và trường đại học kỹ thuật.',
        content_en: 'The seminar successfully gathered 120 engineers and researchers from national energy laboratories and technical universities.',
        category_vi: 'Tọa đàm Chuyên môn',
        category_en: 'Specialized Seminar',
        tags: 'Smart Grid, Reinforcement Learning, Energy',
        cover_image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&auto=format&fit=crop&q=80',
        author_vi: 'Nhóm Nghiên cứu Năng lượng Thông minh',
        author_en: 'Smart Energy Research Group',
        event_date: '2026-07-10 14:30:00',
        event_location_vi: 'Hội trường B2, Viện NIRV',
        event_location_en: 'Auditorium B2, NIRV Institute',
        event_registration_url: null,
        is_featured: 0,
        status: 'published',
        published_at: '2026-07-02 09:00:00'
      }
    ];

    const insertNews = db.prepare(`
      INSERT INTO news_events (
        slug, type, title_vi, title_en, summary_vi, summary_en, content_vi, content_en,
        category_vi, category_en, tags, cover_image, author_vi, author_en,
        event_date, event_location_vi, event_location_en, event_registration_url,
        is_featured, status, published_at
      ) VALUES (
        @slug, @type, @title_vi, @title_en, @summary_vi, @summary_en, @content_vi, @content_en,
        @category_vi, @category_en, @tags, @cover_image, @author_vi, @author_en,
        @event_date, @event_location_vi, @event_location_en, @event_registration_url,
        @is_featured, @status, @published_at
      )
    `);

    for (const item of items) {
      insertNews.run(item);
    }
  }

  // Seed Publications with verified metadata
  const checkPubs = db.prepare('SELECT count(*) as count FROM publications').get();
  if (checkPubs.count === 0) {
    const publications = [
      {
        title: 'Robust Multimodal Foundation Models for Climate-Resilient Agricultural Forecasting',
        authors: 'Nguyen Van An, Tran Thi Mai, Le Quang Huy, David M. Evans',
        year: 2026,
        venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
        publication_type: 'Journal',
        ranking_category: 'Q1',
        doi: '10.1109/TPAMI.2026.3458921',
        publisher_url: 'https://doi.org/10.1109/TPAMI.2026.3458921',
        pdf_url: '/uploads/sample_paper_1.pdf',
        abstract_vi: 'Bài báo đề xuất kiến trúc mạng nơ-ron đa phương thức kết hợp ảnh vệ tinh thời gian thực và dữ liệu vi khí hậu mặt đất, cải thiện 34% độ chính xác trong dự báo suy giảm năng suất cây trồng do hạn hán.',
        abstract_en: 'We propose a novel multimodal neural architecture synergizing high-resolution spatiotemporal remote sensing with terrestrial microclimate telemetry, yielding a 34% accuracy gain in drought yield-loss prediction.',
        keywords: 'Multimodal AI, Satellite Remote Sensing, Climate Resilience, Deep Learning',
        citation_count: 42,
        citation_source: 'Google Scholar',
        topic_tags: 'Climate AI, Computer Vision, Foundation Models',
        is_featured: 1,
        status: 'published'
      },
      {
        title: 'Privacy-Preserving Federated Clinical LLMs across Distributed Healthcare Networks',
        authors: 'Tran Thi Mai, Pham Duc Thanh, Sarah Jenkins, Nguyen Van An',
        year: 2025,
        venue: 'NeurIPS 2025 (Conference on Neural Information Processing Systems)',
        publication_type: 'Conference',
        ranking_category: 'CORE A*',
        doi: '10.5555/neurips.2025.78912',
        publisher_url: 'https://proceedings.neurips.cc/paper/2025/hash/sample',
        pdf_url: '/uploads/sample_paper_2.pdf',
        abstract_vi: 'Nghiên cứu cơ chế học liên kết (Federated Learning) bảo vệ tính riêng tư vi sai (Differential Privacy) cho các mô hình chẩn đoán y khoa phân tán tại 15 bệnh viện mà không làm rò rỉ dữ liệu bệnh nhân.',
        abstract_en: 'This paper formulates a differential privacy federated optimization framework enabling heterogeneous clinical foundation models to train across distributed hospitals without private patient data leakage.',
        keywords: 'Federated Learning, Differential Privacy, Medical AI, Distributed Systems',
        citation_count: 88,
        citation_source: 'Google Scholar',
        topic_tags: 'Federated Learning, Safe AI, Healthcare',
        is_featured: 1,
        status: 'published'
      },
      {
        title: 'Self-Supervised Sign Language Representation via Dual-Stream Spatial-Temporal Graph Networks',
        authors: 'Le Quang Huy, Hoang Van Long, Nguyen Thi Lan',
        year: 2025,
        venue: 'International Conference on Computer Vision (ICCV)',
        publication_type: 'Conference',
        ranking_category: 'CORE A*',
        doi: '10.1109/ICCV.2025.10982',
        publisher_url: 'https://doi.org/10.1109/ICCV.2025.10982',
        pdf_url: null,
        abstract_vi: 'Phương pháp biểu diễn ngôn ngữ ký hiệu tự giám sát dựa trên mạng đồ thị không gian - thời gian hai luồng, tăng cường đáng kể khả năng nhận dạng cử chỉ tay và biểu cảm khuôn mặt.',
        abstract_en: 'A self-supervised sign language representation framework leveraging dual-stream spatial-temporal graph convolutional networks, substantially elevating continuous gesture and facial cue recognition.',
        keywords: 'Sign Language Recognition, Graph Neural Networks, Self-Supervised Learning',
        citation_count: 65,
        citation_source: 'Scopus',
        topic_tags: 'Computer Vision, Human-Computer Interaction',
        is_featured: 1,
        status: 'published'
      },
      {
        title: 'Autonomous Navigation of Aerial Robots in GPS-Denied Dense Canopy Environments',
        authors: 'Pham Duc Thanh, Vu Minh Tri, Robert Sterling',
        year: 2024,
        venue: 'IEEE Robotics and Automation Letters (RA-L)',
        publication_type: 'Journal',
        ranking_category: 'Q1',
        doi: '10.1109/LRA.2024.321876',
        publisher_url: 'https://doi.org/10.1109/LRA.2024.321876',
        pdf_url: null,
        abstract_vi: 'Giải pháp định vị và lập bản đồ đồng thời (SLAM) dựa trên cảm biến LiDAR kết hợp thị giác máy tính cho thiết bị bay không người lái trong môi trường rừng rậm không có tín hiệu định vị vệ tinh.',
        abstract_en: 'A robust visual-inertial LiDAR SLAM solution empowering micro aerial vehicles to execute real-time collision-free trajectories under dense forest canopies devoid of GNSS signals.',
        keywords: 'Aerial Robotics, Visual-Inertial SLAM, GPS-Denied Navigation, Autonomous Flight',
        citation_count: 114,
        citation_source: 'Google Scholar',
        topic_tags: 'Robotics, Computer Vision, SLAM',
        is_featured: 0,
        status: 'published'
      },
      {
        title: 'Deep Reinforcement Learning for Adaptive Frequency Regulation in Microgrid Clusters',
        authors: 'Vu Minh Tri, Nguyen Van An, Le Quang Huy',
        year: 2024,
        venue: 'IEEE Transactions on Smart Grid',
        publication_type: 'Journal',
        ranking_category: 'Q1',
        doi: '10.1109/TSG.2024.339102',
        publisher_url: 'https://doi.org/10.1109/TSG.2024.339102',
        pdf_url: null,
        abstract_vi: 'Ứng dụng thuật toán học tăng cường nhiều tác tử (Multi-Agent RL) trong điều độ và ổn định tần số lưới điện thông minh tích hợp tỷ trọng cao năng lượng mặt trời và gió.',
        abstract_en: 'We present a scalable multi-agent deep reinforcement learning controller for millisecond-scale adaptive frequency regulation in microgrids with high intermittent renewable penetration.',
        keywords: 'Smart Grid, Deep Reinforcement Learning, Multi-Agent Systems, Renewable Energy',
        citation_count: 95,
        citation_source: 'Scopus',
        topic_tags: 'Energy Systems, Reinforcement Learning',
        is_featured: 0,
        status: 'published'
      },
      {
        title: 'Cross-Lingual Knowledge Distillation for Low-Resource Biomedical Question Answering',
        authors: 'Tran Thi Mai, Nguyen Thi Lan, Nguyen Van An',
        year: 2023,
        venue: 'ACL 2023 (Association for Computational Linguistics)',
        publication_type: 'Conference',
        ranking_category: 'CORE A*',
        doi: '10.18653/v1/2023.acl-long.412',
        publisher_url: 'https://aclanthology.org/2023.acl-long.412',
        pdf_url: null,
        abstract_vi: 'Kỹ thuật chưng cất tri thức đa ngôn ngữ chuyển giao năng lực suy luận y khoa từ mô hình tiếng Anh quy mô lớn sang mô hình ngôn ngữ tiếng Việt nhẹ hơn 8 lần.',
        abstract_en: 'A novel cross-lingual distillation paradigm transferring specialized clinical reasoning from high-capacity English models into an 8x compact Vietnamese neural engine.',
        keywords: 'NLP, Knowledge Distillation, Biomedical QA, Cross-Lingual Transfer',
        citation_count: 142,
        citation_source: 'Google Scholar',
        topic_tags: 'Natural Language Processing, Healthcare',
        is_featured: 1,
        status: 'published'
      }
    ];

    const insertPub = db.prepare(`
      INSERT INTO publications (
        title, authors, year, venue, publication_type, ranking_category,
        doi, publisher_url, pdf_url, abstract_vi, abstract_en, keywords,
        citation_count, citation_source, topic_tags, is_featured, status
      ) VALUES (
        @title, @authors, @year, @venue, @publication_type, @ranking_category,
        @doi, @publisher_url, @pdf_url, @abstract_vi, @abstract_en, @keywords,
        @citation_count, @citation_source, @topic_tags, @is_featured, @status
      )
    `);

    for (const item of publications) {
      insertPub.run(item);
    }
  }

  // Seed Team Members
  const checkTeam = db.prepare('SELECT count(*) as count FROM team_members').get();
  if (checkTeam.count === 0) {
    const team = [
      {
        name: 'GS.TS. Nguyễn Văn An',
        title_vi: 'Giáo sư, Tiến sĩ Khoa học',
        title_en: 'Professor, Sc.D.',
        role_vi: 'Viện trưởng Viện Nghiên cứu NIRV',
        role_en: 'Director of NIRV Institute',
        group_category: 'leadership',
        affiliation_vi: 'Viện Nghiên cứu Đổi mới NIRV & Hội đồng Khoa học Quốc gia',
        affiliation_en: 'NIRV Institute & National Science Advisory Council',
        research_interests_vi: 'Mô hình Nền tảng Đa phương thức, AI cho Phát triển Bền vững, An toàn Mô hình',
        research_interests_en: 'Multimodal Foundation Models, AI for Sustainability, Safe & Trustworthy AI',
        bio_vi: 'GS. Nguyễn Văn An có hơn 25 năm kinh nghiệm nghiên cứu học thuật tại các đại học hàng đầu châu Âu và Việt Nam. Ông đã công bố hơn 140 bài báo khoa học trên các tạp chí IEEE/ACM và chủ trì nhiều đề tài nghiên cứu cấp quốc gia.',
        bio_en: 'Prof. Nguyen Van An has over 25 years of research leadership across leading European and Vietnamese universities, authoring over 140 high-impact papers in IEEE/ACM venues and directing flagship national science initiatives.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        email: 'an.nguyen@nirv.ac.vn',
        google_scholar: 'https://scholar.google.com/citations?user=sample_an',
        orcid: 'https://orcid.org/0000-0002-1825-0097',
        github: 'https://github.com/nguyenvanan-nirv',
        website: 'https://nirv.ac.vn/scientists/an-nguyen',
        order_index: 1,
        status: 'published'
      },
      {
        name: 'PGS.TS. Trần Thị Mai',
        title_vi: 'Phó Giáo sư, Tiến sĩ',
        title_en: 'Associate Professor, Ph.D.',
        role_vi: 'Phó Viện trưởng phụ trách Nghiên cứu & Trưởng Lab AI Y tế',
        role_en: 'Deputy Director (Research) & Head of Health-AI Lab',
        group_category: 'leadership',
        affiliation_vi: 'Viện Nghiên cứu NIRV',
        affiliation_en: 'NIRV Institute',
        research_interests_vi: 'Học máy Y sinh, Học liên kết Bảo mật Quyền riêng tư, Xử lý Ngôn ngữ Tự nhiên Y học',
        research_interests_en: 'Biomedical Machine Learning, Privacy-Preserving Federated Learning, Clinical NLP',
        bio_vi: 'PGS. Trần Thị Mai từng là nghiên cứu viên sau tiến sĩ tại Viện Công nghệ MIT và Đại học Cambridge. Bà là tác giả của nhiều công bố tiêu biểu tại NeurIPS, ICML và Lancet Digital Health.',
        bio_en: 'Assoc. Prof. Tran Thi Mai was a Postdoctoral Fellow at MIT and Cambridge University. She has published widely in NeurIPS, ICML, and Lancet Digital Health.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        email: 'mai.tran@nirv.ac.vn',
        google_scholar: 'https://scholar.google.com/citations?user=sample_mai',
        orcid: 'https://orcid.org/0000-0003-2415-8891',
        github: 'https://github.com/maitran-nirv',
        website: 'https://nirv.ac.vn/scientists/mai-tran',
        order_index: 2,
        status: 'published'
      },
      {
        name: 'TS. Lê Quang Huy',
        title_vi: 'Tiến sĩ Khoa học Máy tính',
        title_en: 'Ph.D. in Computer Science',
        role_vi: 'Trưởng nhóm Nghiên cứu Thị giác Máy tính & Viễn thám',
        role_en: 'Lead Researcher, Computer Vision & Earth Observation Group',
        group_category: 'researchers',
        affiliation_vi: 'Viện Nghiên cứu NIRV',
        affiliation_en: 'NIRV Institute',
        research_interests_vi: 'Thị giác Máy tính 3D, Nhận dạng Hành động, Viễn thám Vệ tinh Đa phổ',
        research_interests_en: '3D Computer Vision, Action Recognition, Multispectral Earth Observation',
        bio_vi: 'TS. Lê Quang Huy tốt nghiệp tiến sĩ tại Đại học Tokyo (Nhật Bản). Hướng nghiên cứu chính là ứng dụng thị giác máy tính trong giám sát biến đổi tài nguyên thiên nhiên và hỗ trợ cộng đồng yếu thế.',
        bio_en: 'Dr. Le Quang Huy earned his Ph.D. from the University of Tokyo. His core focus centers on computer vision for climate resilience and assistive technology.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        email: 'huy.le@nirv.ac.vn',
        google_scholar: 'https://scholar.google.com/citations?user=sample_huy',
        orcid: 'https://orcid.org/0000-0001-9921-4321',
        github: 'https://github.com/huyle-nirv',
        website: 'https://nirv.ac.vn/scientists/huy-le',
        order_index: 3,
        status: 'published'
      },
      {
        name: 'TS. Phạm Đức Thành',
        title_vi: 'Tiến sĩ Kỹ thuật Điện & Tự động hóa',
        title_en: 'Ph.D. in Robotics & Automation',
        role_vi: 'Trưởng nhóm Nghiên cứu Robot Tự hành & Hệ thống Thông minh',
        role_en: 'Lead Researcher, Autonomous Robotics & Intelligent Systems',
        group_category: 'researchers',
        affiliation_vi: 'Viện Nghiên cứu NIRV',
        affiliation_en: 'NIRV Institute',
        research_interests_vi: 'Robot Tự hành Môi trường Phức tạp, SLAM, Điều khiển Học tăng cường',
        research_interests_en: 'Autonomous Field Robotics, SLAM, Reinforcement Learning Control',
        bio_vi: 'TS. Phạm Đức Thành đã hoàn thành nghiên cứu sinh tại KAIST (Hàn Quốc), chuyên sâu về hệ thống định vị cho drone tìm kiếm cứu nạn và phương tiện tự hành trên cạn.',
        bio_en: 'Dr. Pham Duc Thanh completed his doctoral research at KAIST, specializing in autonomous navigation for search-and-rescue UAVs and ground robotics.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
        email: 'thanh.pham@nirv.ac.vn',
        google_scholar: 'https://scholar.google.com/citations?user=sample_thanh',
        orcid: 'https://orcid.org/0000-0002-7711-3329',
        github: 'https://github.com/thanhpham-nirv',
        website: 'https://nirv.ac.vn/scientists/thanh-pham',
        order_index: 4,
        status: 'published'
      },
      {
        name: 'TS. Vũ Minh Trí',
        title_vi: 'Tiến sĩ Hệ thống Năng lượng',
        title_en: 'Ph.D. in Energy Systems',
        role_vi: 'Nghiên cứu viên cao cấp, Nhóm Lưới điện Thông minh',
        role_en: 'Senior Research Fellow, Smart Grid & Energy Informatics',
        group_category: 'researchers',
        affiliation_vi: 'Viện Nghiên cứu NIRV',
        affiliation_en: 'NIRV Institute',
        research_interests_vi: 'Tối ưu hóa Lưới điện Vi mô, Năng lượng Tái tạo, AI cho Chuyển dịch Năng lượng',
        research_interests_en: 'Microgrid Optimization, Renewable Energy Integration, AI for Energy Transition',
        bio_vi: 'TS. Vũ Minh Trí có nhiều công bố thực tiễn trên IEEE Transactions on Smart Grid và tham gia tư vấn kỹ thuật chuyển đổi xanh cho các tổ chức quốc tế.',
        bio_en: 'Dr. Vu Minh Tri has published extensively in IEEE Transactions on Smart Grid, advising international development partners on green energy transition.',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
        email: 'tri.vu@nirv.ac.vn',
        google_scholar: 'https://scholar.google.com/citations?user=sample_tri',
        orcid: 'https://orcid.org/0000-0003-1102-5541',
        github: 'https://github.com/trivu-nirv',
        website: 'https://nirv.ac.vn/scientists/tri-vu',
        order_index: 5,
        status: 'published'
      }
    ];

    const insertTeam = db.prepare(`
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

    for (const item of team) {
      insertTeam.run(item);
    }
  }

  console.log('Database initialized and seeded successfully at:', dbPath);
}

module.exports = {
  db,
  initDatabase
};
