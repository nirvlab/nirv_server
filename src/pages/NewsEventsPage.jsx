import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Search, Calendar, MapPin, ArrowRight, Tag, Filter } from 'lucide-react';

export default function NewsEventsPage() {
  const { lang, t, routeMap } = useLanguage();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'news', 'event'
  const [selectedTiming, setSelectedTiming] = useState('all'); // 'all', 'upcoming', 'past'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNewsEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedType !== 'all') params.append('type', selectedType);
    if (selectedCategory) params.append('category', selectedCategory);
    if (searchQuery) params.append('search', searchQuery);
    if (selectedType === 'event' && selectedTiming !== 'all') params.append('timing', selectedTiming);

    fetch(`/api/public/news-events?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setItems(res.data);
          if (res.categories) setCategories(res.categories);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNewsEvents();
  }, [selectedType, selectedCategory, selectedTiming]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNewsEvents();
  };

  // Find featured story for the top spotlight
  const featuredStory = items.find(i => i.is_featured) || items[0];
  const regularItems = items.filter(i => i.id !== featuredStory?.id);

  return (
    <div>
      {/* 1. Page Header */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '60px 0 40px 0' }}>
        <div className="container">
          <span className="head-sub">{t('news.headerSub')}</span>
          <h1 className="head-pri" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', margin: '12px 0 16px 0' }}>
            {t('news.headerTitle')}
          </h1>
          <p className="desc-intro">{t('news.headerDesc')}</p>
        </div>
      </section>

      {/* 2. Filter & Search Bar - Clean editorial style */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 'var(--header-height)', zIndex: 800 }}>
        <div className="container" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Type Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setSelectedType('all'); setSelectedTiming('all'); }}
              className={selectedType === 'all' ? 'btn-solid' : 'btn-outline-gray'}
              style={{ padding: '6px 16px', fontSize: '0.8rem' }}
            >
              {t('common.all')}
            </button>
            <button
              type="button"
              onClick={() => { setSelectedType('news'); setSelectedTiming('all'); }}
              className={selectedType === 'news' ? 'btn-solid' : 'btn-outline-gray'}
              style={{ padding: '6px 16px', fontSize: '0.8rem' }}
            >
              {t('news.typeNews')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('event')}
              className={selectedType === 'event' ? 'btn-solid' : 'btn-outline-gray'}
              style={{ padding: '6px 16px', fontSize: '0.8rem' }}
            >
              {t('news.typeEvent')}
            </button>
          </div>

          {/* Event Timing Filter (Upcoming vs Past) */}
          {selectedType === 'event' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedTiming('all')}
                style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedTiming === 'all' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                {t('common.all')}
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setSelectedTiming('upcoming')}
                style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedTiming === 'upcoming' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                {t('news.upcomingEvents')}
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setSelectedTiming('past')}
                style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedTiming === 'past' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                {t('news.pastEvents')}
              </button>
            </div>
          )}

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              placeholder={t('news.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingRight: '36px', height: '38px', fontSize: '0.85rem' }}
            />
            <button type="submit" style={{ position: 'absolute', right: '10px', color: 'var(--color-text-muted)' }}>
              <Search size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* 3. Main Content: Featured Spotlight + Editorial Grid */}
      <section className="section">
        <div className="container">
          {/* Prominent Featured Story */}
          {featuredStory && !searchQuery && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                marginBottom: '60px',
                boxShadow: 'var(--shadow-md)'
              }}
              className="featured-spotlight-card"
            >
              <div style={{ position: 'relative', minHeight: '360px', overflow: 'hidden' }}>
                <img
                  src={featuredStory.cover_image}
                  alt={lang === 'vi' ? featuredStory.title_vi : featuredStory.title_en}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23f0eeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23888888">NIRV Featured Activity</text></svg>';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
                  <span className="badge badge-primary">
                    {featuredStory.type === 'event' ? (lang === 'vi' ? 'SỰ KIỆN NỔI BẬT' : 'FEATURED EVENT') : (lang === 'vi' ? 'TIN ĐẶC BIỆT' : 'FEATURED STORY')}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(featuredStory.event_date || featuredStory.published_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: '1.3', marginBottom: '16px' }}>
                  <Link to={`${routeMap[lang].news}/${featuredStory.slug}`} style={{ color: 'var(--color-text-main)' }}>
                    {lang === 'vi' ? featuredStory.title_vi : featuredStory.title_en}
                  </Link>
                </h2>

                <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: '1.65', marginBottom: '24px' }}>
                  {lang === 'vi' ? featuredStory.summary_vi : featuredStory.summary_en}
                </p>

                {featuredStory.type === 'event' && featuredStory.event_location_vi && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-body)', marginBottom: '20px' }}>
                    <MapPin size={16} color="var(--color-primary)" />
                    <span>{lang === 'vi' ? featuredStory.event_location_vi : featuredStory.event_location_en}</span>
                  </div>
                )}

                <div>
                  <Link to={`${routeMap[lang].news}/${featuredStory.slug}`} className="btn-solid">
                    {t('common.readMore')} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Regular Editorial Cards Grid */}
          <div className="grid-3">
            {regularItems.map((item) => {
              const isPastEvent = item.type === 'event' && item.event_date && new Date(item.event_date) < new Date();
              return (
                <div key={item.id} className="editorial-card">
                  <div className="editorial-img-box">
                    <img
                      src={item.cover_image}
                      alt={lang === 'vi' ? item.title_vi : item.title_en}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380"><rect width="600" height="380" fill="%23f0eeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23888888">NIRV News &amp; Events</text></svg>';
                      }}
                    />
                    {item.type === 'event' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: isPastEvent ? 'rgba(0,0,0,0.7)' : 'var(--color-primary)',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {isPastEvent ? (lang === 'vi' ? 'ĐÃ DIỄN RA' : 'PAST EVENT') : (lang === 'vi' ? 'SẮP DIỄN RA' : 'UPCOMING')}
                      </div>
                    )}
                  </div>
                  <div className="editorial-content">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                      <span className={`badge ${item.type === 'event' ? 'badge-dark' : 'badge-primary'}`}>
                        {item.type === 'event' ? (lang === 'vi' ? 'Sự kiện' : 'Event') : (lang === 'vi' ? 'Tin tức' : 'News')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                        {new Date(item.event_date || item.published_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>

                    <h3 className="editorial-title">
                      <Link to={`${routeMap[lang].news}/${item.slug}`}>
                        {lang === 'vi' ? item.title_vi : item.title_en}
                      </Link>
                    </h3>

                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '16px', flexGrow: 1 }}>
                      {lang === 'vi' ? item.summary_vi : item.summary_en}
                    </p>

                    {item.type === 'event' && item.event_location_vi && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                        <MapPin size={14} color="var(--color-primary)" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lang === 'vi' ? item.event_location_vi : item.event_location_en}
                        </span>
                      </div>
                    )}

                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                      <Link to={`${routeMap[lang].news}/${item.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        {t('common.readMore')} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {items.length === 0 && !loading && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                maxWidth: '680px',
                margin: '0 auto'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '10px' }}>
                {lang === 'vi' ? 'Tin Tức & Hoạt Động Học Thuật' : 'News & Activities'}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {t('common.noNews')}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
