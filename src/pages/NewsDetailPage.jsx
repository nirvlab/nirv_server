import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Calendar, MapPin, User, ExternalLink, Share2, Tag } from 'lucide-react';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { lang, t, routeMap } = useLanguage();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/news-events/${slug}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setItem(res.data);
          if (res.related) setRelated(res.related);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>{t('common.noData')}</h2>
        <Link to={routeMap[lang].news} className="btn-pri" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '50px 0 40px 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <Link to={routeMap[lang].news} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '20px' }}>
            <ArrowLeft size={16} /> {t('nav.news')}
          </Link>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <span className={`badge ${item.type === 'event' ? 'badge-dark' : 'badge-primary'}`}>
              {item.type === 'event' ? (lang === 'vi' ? 'SỰ KIỆN' : 'EVENT') : (lang === 'vi' ? 'TIN TỨC' : 'NEWS')}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {lang === 'vi' ? item.category_vi : item.category_en}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: '1.25', color: 'var(--color-text-main)', marginBottom: '20px' }}>
            {lang === 'vi' ? item.title_vi : item.title_en}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="var(--color-primary)" />
              <span>{new Date(item.event_date || item.published_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
            </div>
            {(item.author_vi || item.author_en) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} color="var(--color-primary)" />
                <span>{lang === 'vi' ? item.author_vi : item.author_en}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Cover image */}
          <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '36px', boxShadow: 'var(--shadow-sm)' }}>
            <img
              src={item.cover_image}
              alt={lang === 'vi' ? item.title_vi : item.title_en}
              style={{ width: '100%', maxHeight: '520px', objectFit: 'cover' }}
            />
          </div>

          {/* Event Metadata Card if Event */}
          {item.type === 'event' && (
            <div style={{ backgroundColor: 'var(--color-primary-bg)', border: '1px solid rgba(238,0,51,0.2)', borderRadius: '8px', padding: '24px', marginBottom: '36px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '14px' }}>
                {lang === 'vi' ? 'THÔNG TIN SỰ KIỆN' : 'EVENT DETAILS'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="var(--color-primary)" />
                  <strong>{t('news.eventDate')}:</strong>
                  <span>{new Date(item.event_date).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                </div>
                {item.event_location_vi && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} color="var(--color-primary)" />
                    <strong>{t('news.eventLocation')}:</strong>
                    <span>{lang === 'vi' ? item.event_location_vi : item.event_location_en}</span>
                  </div>
                )}
                {item.event_registration_url && (
                  <div style={{ marginTop: '10px' }}>
                    <a href={item.event_registration_url} target="_blank" rel="noopener noreferrer" className="btn-solid">
                      {t('news.registerEvent')} <ExternalLink size={15} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Lead */}
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: '1.6', marginBottom: '28px', borderLeft: '4px solid var(--color-primary)', paddingLeft: '18px' }}>
            {lang === 'vi' ? item.summary_vi : item.summary_en}
          </div>

          {/* Main Body */}
          <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-body)', whiteSpace: 'pre-line', marginBottom: '40px' }}>
            {lang === 'vi' ? item.content_vi : item.content_en}
          </div>

          {/* Tags */}
          {item.tags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
              <Tag size={16} color="var(--color-primary)" />
              {item.tags.split(',').map((tag, i) => (
                <span key={i} className="badge badge-gray">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related News / Events */}
      {related.length > 0 && (
        <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '30px' }}>
              {t('common.relatedContent')}
            </h3>
            <div className="grid-3">
              {related.map((rel) => (
                <div key={rel.id} className="editorial-card">
                  <div className="editorial-img-box">
                    <img src={rel.cover_image} alt={lang === 'vi' ? rel.title_vi : rel.title_en} />
                  </div>
                  <div className="editorial-content">
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
                      <Link to={`${routeMap[lang].news}/${rel.slug}`}>
                        {lang === 'vi' ? rel.title_vi : rel.title_en}
                      </Link>
                    </h4>
                    <Link to={`${routeMap[lang].news}/${rel.slug}`} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginTop: 'auto' }}>
                      {t('common.readMore')} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
