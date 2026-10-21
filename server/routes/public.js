const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { getCache, setCache } = require('../cache');

// GET /api/public/settings
router.get('/settings', async (req, res) => {
  try {
    const cached = getCache('public_settings');
    if (cached) return res.json({ success: true, data: cached });

    const rows = await db.all('SELECT key, value FROM site_settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    setCache('public_settings', settings, 60000);
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/overview (Institution-wide real counts & featured highlights)
router.get('/overview', async (req, res) => {
  try {
    const cached = getCache('public_overview');
    if (cached) return res.json({ success: true, data: cached });

    // Parallel fetch using Promise.all for ultra-low latency response
    const [
      pubCount,
      initCount,
      newsCount,
      eventCount,
      teamCount,
      footprintRow,
      featuredInitiatives,
      featuredNews,
      featuredPubs,
      leadership
    ] = await Promise.all([
      db.get("SELECT count(*) as count, coalesce(sum(citation_count), 0) as citations FROM publications WHERE status = 'published'"),
      db.get("SELECT count(*) as count FROM initiatives WHERE status = 'published'"),
      db.get("SELECT count(*) as count FROM news_events WHERE status = 'published' AND type = 'news'"),
      db.get("SELECT count(*) as count FROM news_events WHERE status = 'published' AND type = 'event'"),
      db.get("SELECT count(*) as count FROM team_members WHERE status = 'published'"),
      db.get("SELECT value FROM site_settings WHERE key = 'footprint_destinations'"),
      db.all("SELECT * FROM initiatives WHERE status = 'published' ORDER BY order_index ASC, id DESC LIMIT 3"),
      db.all("SELECT * FROM news_events WHERE status = 'published' ORDER BY is_featured DESC, published_at DESC LIMIT 3"),
      db.all("SELECT * FROM publications WHERE status = 'published' ORDER BY is_featured DESC, year DESC, citation_count DESC LIMIT 4"),
      db.all("SELECT * FROM team_members WHERE status = 'published' AND group_category = 'leadership' ORDER BY order_index ASC LIMIT 4")
    ]);

    // Count footprint destinations (Vietnam base + configured destinations)
    let footprintCount = 1;
    if (footprintRow && footprintRow.value) {
      try {
        const list = JSON.parse(footprintRow.value);
        if (Array.isArray(list)) {
          const uniqueCountries = new Set(['vn', ...list.map(d => (d.country_code || d.country_vi || '').toLowerCase())]);
          footprintCount = uniqueCountries.size;
        }
      } catch (e) {}
    }

    const payload = {
      stats: {
        total_publications: pubCount ? pubCount.count : 0,
        total_citations: pubCount ? pubCount.citations : 0,
        total_initiatives: initCount ? initCount.count : 0,
        total_news: newsCount ? newsCount.count : 0,
        total_events: eventCount ? eventCount.count : 0,
        total_team: teamCount ? teamCount.count : 0,
        total_footprint: footprintCount
      },
      featured_initiatives: featuredInitiatives,
      featured_news: featuredNews,
      featured_publications: featuredPubs,
      leadership_team: leadership
    };

    setCache('public_overview', payload, 60000);
    res.json({ success: true, data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/initiatives
router.get('/initiatives', async (req, res) => {
  try {
    const initiatives = await db.all("SELECT * FROM initiatives WHERE status = 'published' ORDER BY order_index ASC, id DESC");
    res.json({ success: true, data: initiatives });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/initiatives/:slug
router.get('/initiatives/:slug', async (req, res) => {
  try {
    const item = await db.get("SELECT * FROM initiatives WHERE slug = ? AND status = 'published'", [req.params.slug]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/news-events
router.get('/news-events', async (req, res) => {
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

    const allRecords = await db.all(query, params);
    const total = allRecords.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paged = allRecords.slice(offset, offset + Number(limit));

    // Categories list for filter bar
    const categories = await db.all("SELECT DISTINCT category_vi, category_en FROM news_events WHERE status = 'published'");

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
router.get('/news-events/:slug', async (req, res) => {
  try {
    const item = await db.get("SELECT * FROM news_events WHERE slug = ? AND status = 'published'", [req.params.slug]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Article/Event not found' });
    }

    // Related items
    const related = await db.all(`
      SELECT id, slug, type, title_vi, title_en, summary_vi, summary_en, cover_image, category_vi, category_en, published_at, event_date
      FROM news_events
      WHERE status = 'published' AND id != ? AND type = ?
      ORDER BY published_at DESC LIMIT 3
    `, [item.id, item.type]);

    res.json({ success: true, data: item, related });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/publications/stats (Dynamic statistics strictly computed from published records)
router.get('/publications/stats', async (req, res) => {
  try {
    const summary = await db.get(`
      SELECT count(*) as total, coalesce(sum(citation_count), 0) as total_citations
      FROM publications WHERE status = 'published'
    `);

    const byYear = await db.all(`
      SELECT year, count(*) as count
      FROM publications
      WHERE status = 'published'
      GROUP BY year
      ORDER BY year ASC
    `);

    const byType = await db.all(`
      SELECT publication_type as type, count(*) as count
      FROM publications
      WHERE status = 'published'
      GROUP BY publication_type
      ORDER BY count DESC
    `);

    const byRanking = await db.all(`
      SELECT coalesce(ranking_category, 'Unranked') as ranking, count(*) as count
      FROM publications
      WHERE status = 'published'
      GROUP BY ranking_category
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        total: summary ? summary.total : 0,
        total_citations: summary ? summary.total_citations : 0,
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
router.get('/publications', async (req, res) => {
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
      query += ' ORDER BY is_featured DESC, year DESC, id DESC';
    }

    const publications = await db.all(query, params);

    const availableYearsRows = await db.all("SELECT DISTINCT year FROM publications WHERE status = 'published' ORDER BY year DESC");
    const availableTypesRows = await db.all("SELECT DISTINCT publication_type FROM publications WHERE status = 'published'");
    const availableRankingsRows = await db.all("SELECT DISTINCT ranking_category FROM publications WHERE status = 'published' AND ranking_category IS NOT NULL");

    res.json({
      success: true,
      data: publications,
      total: publications.length,
      facets: {
        years: availableYearsRows.map(r => r.year),
        types: availableTypesRows.map(r => r.publication_type),
        rankings: availableRankingsRows.map(r => r.ranking_category)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/team
router.get('/team', async (req, res) => {
  try {
    const team = await db.all("SELECT * FROM team_members WHERE status = 'published' ORDER BY order_index ASC, id ASC");
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
