const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/public/settings
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

// GET /api/public/overview (Institution-wide real counts & featured highlights)
router.get('/overview', (req, res) => {
  try {
    // 1. Calculate live statistics from published records only
    const pubCount = db.prepare("SELECT count(*) as count, coalesce(sum(citation_count), 0) as citations FROM publications WHERE status = 'published'").get();
    const initCount = db.prepare("SELECT count(*) as count FROM initiatives WHERE status = 'published'").get();
    const newsCount = db.prepare("SELECT count(*) as count FROM news_events WHERE status = 'published' AND type = 'news'").get();
    const eventCount = db.prepare("SELECT count(*) as count FROM news_events WHERE status = 'published' AND type = 'event'").get();
    const teamCount = db.prepare("SELECT count(*) as count FROM team_members WHERE status = 'published'").get();

    // 2. Fetch featured items for landing page
    const featuredInitiatives = db.prepare("SELECT * FROM initiatives WHERE status = 'published' ORDER BY order_index ASC, id DESC LIMIT 3").all();
    const featuredNews = db.prepare("SELECT * FROM news_events WHERE status = 'published' ORDER BY is_featured DESC, published_at DESC LIMIT 3").all();
    const featuredPubs = db.prepare("SELECT * FROM publications WHERE status = 'published' ORDER BY is_featured DESC, year DESC, citation_count DESC LIMIT 4").all();
    const leadership = db.prepare("SELECT * FROM team_members WHERE status = 'published' AND group_category = 'leadership' ORDER BY order_index ASC LIMIT 4").all();

    res.json({
      success: true,
      data: {
        stats: {
          total_publications: pubCount.count,
          total_citations: pubCount.citations,
          total_initiatives: initCount.count,
          total_news: newsCount.count,
          total_events: eventCount.count,
          total_team: teamCount.count
        },
        featured_initiatives: featuredInitiatives,
        featured_news: featuredNews,
        featured_publications: featuredPubs,
        leadership_team: leadership
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/initiatives
router.get('/initiatives', (req, res) => {
  try {
    const initiatives = db.prepare("SELECT * FROM initiatives WHERE status = 'published' ORDER BY order_index ASC, id DESC").all();
    res.json({ success: true, data: initiatives });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/initiatives/:slug
router.get('/initiatives/:slug', (req, res) => {
  try {
    const item = db.prepare("SELECT * FROM initiatives WHERE slug = ? AND status = 'published'").get(req.params.slug);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/news-events
router.get('/news-events', (req, res) => {
  try {
    const { type, category, search, timing, limit = 20, page = 1 } = req.query;
    let query = "SELECT * FROM news_events WHERE status = 'published'";
    const params = [];

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      query += ' AND (category_vi = ? OR category_en = ?)';
      params.push(category, category);
    }

    if (search) {
      query += ' AND (title_vi LIKE ? OR title_en LIKE ? OR summary_vi LIKE ? OR summary_en LIKE ? OR tags LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    if (timing === 'upcoming') {
      query += " AND type = 'event' AND datetime(event_date) >= datetime('now')";
    } else if (timing === 'past') {
      query += " AND type = 'event' AND datetime(event_date) < datetime('now')";
    }

    // Sort: events by event_date, news by published_at
    query += " ORDER BY is_featured DESC, coalesce(event_date, published_at) DESC";

    const allRecords = db.prepare(query).all(...params);
    const total = allRecords.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paged = allRecords.slice(offset, offset + Number(limit));

    // Categories list for filter bar
    const categories = db.prepare("SELECT DISTINCT category_vi, category_en FROM news_events WHERE status = 'published'").all();

    res.json({
      success: true,
      data: paged,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      categories
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/news-events/:slug
router.get('/news-events/:slug', (req, res) => {
  try {
    const item = db.prepare("SELECT * FROM news_events WHERE slug = ? AND status = 'published'").get(req.params.slug);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Article/Event not found' });
    }

    // Related items
    const related = db.prepare(`
      SELECT id, slug, type, title_vi, title_en, summary_vi, summary_en, cover_image, category_vi, category_en, published_at, event_date
      FROM news_events
      WHERE status = 'published' AND id != ? AND type = ?
      ORDER BY published_at DESC LIMIT 3
    `).all(item.id, item.type);

    res.json({ success: true, data: item, related });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/publications/stats (Dynamic statistics strictly computed from published records)
router.get('/publications/stats', (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT count(*) as total, coalesce(sum(citation_count), 0) as total_citations
      FROM publications WHERE status = 'published'
    `).get();

    const byYear = db.prepare(`
      SELECT year, count(*) as count
      FROM publications
      WHERE status = 'published'
      GROUP BY year
      ORDER BY year ASC
    `).all();

    const byType = db.prepare(`
      SELECT publication_type as type, count(*) as count
      FROM publications
      WHERE status = 'published'
      GROUP BY publication_type
      ORDER BY count DESC
    `).all();

    const byRanking = db.prepare(`
      SELECT coalesce(ranking_category, 'Unranked') as ranking, count(*) as count
      FROM publications
      WHERE status = 'published'
      GROUP BY ranking_category
      ORDER BY count DESC
    `).all();

    res.json({
      success: true,
      data: {
        total: summary.total,
        total_citations: summary.total_citations,
        by_year: byYear,
        by_type: byType,
        by_ranking: byRanking
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/publications
router.get('/publications', (req, res) => {
  try {
    const { search, year, author, venue, type, ranking, topic, sort = 'newest' } = req.query;
    let query = "SELECT * FROM publications WHERE status = 'published'";
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR authors LIKE ? OR venue LIKE ? OR abstract_vi LIKE ? OR abstract_en LIKE ? OR keywords LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }

    if (year) {
      query += ' AND year = ?';
      params.push(Number(year));
    }

    if (author) {
      query += ' AND authors LIKE ?';
      params.push(`%${author}%`);
    }

    if (venue) {
      query += ' AND venue LIKE ?';
      params.push(`%${venue}%`);
    }

    if (type) {
      query += ' AND publication_type = ?';
      params.push(type);
    }

    if (ranking) {
      query += ' AND ranking_category = ?';
      params.push(ranking);
    }

    if (topic) {
      query += ' AND topic_tags LIKE ?';
      params.push(`%${topic}%`);
    }

    if (sort === 'oldest') {
      query += ' ORDER BY year ASC, title ASC';
    } else if (sort === 'title') {
      query += ' ORDER BY title ASC';
    } else if (sort === 'citations') {
      query += ' ORDER BY citation_count DESC, year DESC';
    } else {
      // Default: newest first
      query += ' ORDER BY is_featured DESC, year DESC, id DESC';
    }

    const publications = db.prepare(query).all(...params);

    // Filter facet values
    const availableYears = db.prepare("SELECT DISTINCT year FROM publications WHERE status = 'published' ORDER BY year DESC").all().map(r => r.year);
    const availableTypes = db.prepare("SELECT DISTINCT publication_type FROM publications WHERE status = 'published'").all().map(r => r.publication_type);
    const availableRankings = db.prepare("SELECT DISTINCT ranking_category FROM publications WHERE status = 'published' AND ranking_category IS NOT NULL").all().map(r => r.ranking_category);

    res.json({
      success: true,
      data: publications,
      total: publications.length,
      facets: {
        years: availableYears,
        types: availableTypes,
        rankings: availableRankings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/team
router.get('/team', (req, res) => {
  try {
    const team = db.prepare("SELECT * FROM team_members WHERE status = 'published' ORDER BY order_index ASC, id ASC").all();
    const leadership = team.filter(m => m.group_category === 'leadership');
    const researchers = team.filter(m => m.group_category === 'researchers');
    const advisors = team.filter(m => m.group_category === 'advisors');

    res.json({
      success: true,
      data: {
        all: team,
        leadership,
        researchers,
        advisors
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
