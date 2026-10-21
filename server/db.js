const { createClient } = require('@libsql/client');
const path = require('node:path');
const fs = require('node:fs');

// Default fallback to Turso production cloud, or local fallback
const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://nirv-db-nirvlab.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTI1NTYzNzAsImlkIjoiMDFhMTVjYWQtNmUwMS03MDZiLWJlZDMtOTM2NWE4YjViY2M2Iiwia2lkIjoic2Fma2h4dExIU3pjRWRRQkJiY2daT2NPd1E5WmE5ZEdVcGlGNTJ5azdzcyIsInJpZCI6IjlhZmZlMDM4LTcxNzEtNGUxOC1hMmZiLTM0MTEzOWMwYzFkZiJ9.oqdmSHNqog30RNRvLIq4GpUrX8EF0aPonldhCInkKtkweBJYuDnkqyZnnofIJzI9tKK1mVAOnyZZAsm97y67AA';

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});

// Normalized async database helper
const db = {
  client,

  async all(sql, args = []) {
    const res = await client.execute({ sql, args });
    return res.rows;
  },

  async get(sql, args = []) {
    const res = await client.execute({ sql, args });
    return res.rows.length > 0 ? res.rows[0] : null;
  },

  async run(sql, args = []) {
    const res = await client.execute({ sql, args });
    return {
      lastInsertRowid: res.lastInsertRowid ? Number(res.lastInsertRowid) : null,
      changes: res.rowsAffected
    };
  },

  async exec(sql) {
    return await client.executeMultiple(sql);
  }
};

async function initDatabase() {
  try {
    await db.exec(`
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
        verification_vi TEXT,
        verification_en TEXT,
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
        data_base64 TEXT,
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

    // Auto-migration for existing tables
    const tryAddCol = async (table, col, type) => {
      try {
        await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type};`);
      } catch (e) {}
    };
    await tryAddCol('initiatives', 'verification_vi', 'TEXT');
    await tryAddCol('initiatives', 'verification_en', 'TEXT');
    await tryAddCol('media_assets', 'data_base64', 'TEXT');

    console.log('Turso cloud database connected and verified.');
  } catch (err) {
    console.error('Error initializing Turso schema:', err.message);
  }
}

module.exports = {
  db,
  initDatabase
};
