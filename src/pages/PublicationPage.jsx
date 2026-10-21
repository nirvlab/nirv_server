import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import PublicationCharts from '../components/PublicationCharts';
import { Search, Filter, FileText, ExternalLink, ChevronDown, ChevronUp, Quote, Award, Tag } from 'lucide-react';

export default function PublicationPage() {
  const { lang, t } = useLanguage();
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState(null);
  const [facets, setFacets] = useState({ years: [], types: [], rankings: [] });
  
  // Filters and sort states
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRanking, setSelectedRanking] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title', 'citations'
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch stats and publications
  const fetchPublicationsData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedYear) params.append('year', selectedYear);
    if (selectedType) params.append('type', selectedType);
    if (selectedRanking) params.append('ranking', selectedRanking);
    if (sortBy) params.append('sort', sortBy);

    Promise.all([
      fetch(`/api/public/publications?${params.toString()}`).then(res => res.json()),
      fetch('/api/public/publications/stats').then(res => res.json())
    ])
      .then(([pubsRes, statsRes]) => {
        if (pubsRes.success) {
          setPublications(pubsRes.data);
          if (pubsRes.facets) setFacets(pubsRes.facets);
        }
        if (statsRes.success) setStats(statsRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPublicationsData();
  }, [selectedYear, selectedType, selectedRanking, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPublicationsData();
  };

  const toggleAbstract = (id) => {
    setExpandedAbstracts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedYear('');
    setSelectedType('');
    setSelectedRanking('');
    setSortBy('newest');
  };

  return (
    <div>
      {/* 1. Page Header */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '60px 0 40px 0' }}>
        <div className="container">
          <span className="head-sub">{t('publications.headerSub')}</span>
          <h1 className="head-pri" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', margin: '12px 0 16px 0' }}>
            {t('publications.headerTitle')}
          </h1>
          <p className="desc-intro">{t('publications.headerDesc')}</p>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <section className="section">
        <div className="container">
          {/* Dynamic Statistics & Interactive Charts */}
          <PublicationCharts stats={stats} />

          {/* Search, Filter Bar & Sort Controls */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', marginBottom: '36px', boxShadow: 'var(--shadow-sm)' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              {/* Keyword Search */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">{t('common.search')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={t('publications.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingRight: '36px' }}
                  />
                  <button type="submit" style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--color-primary)' }}>
                    <Search size={18} />
                  </button>
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <label className="form-label">{t('publications.filterYear')}</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-select">
                  <option value="">{t('common.all')}</option>
                  {facets.years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="form-label">{t('publications.filterType')}</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="form-select">
                  <option value="">{t('common.all')}</option>
                  {facets.types.map(typ => (
                    <option key={typ} value={typ}>{typ}</option>
                  ))}
                </select>
              </div>

              {/* Ranking Filter */}
              <div>
                <label className="form-label">{t('publications.filterRanking')}</label>
                <select value={selectedRanking} onChange={(e) => setSelectedRanking(e.target.value)} className="form-select">
                  <option value="">{t('common.all')}</option>
                  {facets.rankings.map(rnk => (
                    <option key={rnk} value={rnk}>{rnk}</option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="form-label">{t('publications.sortBy')}</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select">
                  <option value="newest">{t('publications.sortNewest')}</option>
                  <option value="oldest">{t('publications.sortOldest')}</option>
                  <option value="title">{t('publications.sortTitle')}</option>
                  <option value="citations">{t('publications.sortCitations')}</option>
                </select>
              </div>
            </form>

            {/* Active Filters / Reset */}
            {(search || selectedYear || selectedType || selectedRanking) && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {lang === 'vi' ? `Tìm thấy ${publications.length} ấn phẩm phù hợp` : `Found ${publications.length} matching works`}
                </span>
                <button type="button" onClick={clearAllFilters} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {t('common.clearFilter')}
                </button>
              </div>
            )}
          </div>

          {/* 3. Google Scholar / Research Profile Long-form Publications List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {publications.map((pub) => {
              const isExpanded = expandedAbstracts[pub.id];
              return (
                <article
                  key={pub.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '28px 32px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="scholar-entry"
                >
                  {/* Metadata Badges Bar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                    {pub.ranking_category && (
                      <span className="badge badge-ranking">
                        {pub.ranking_category}
                      </span>
                    )}
                    <span className="badge badge-gray">
                      {pub.publication_type}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {pub.year}
                    </span>

                    {/* Verified Citation Pill */}
                    {pub.citation_count > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: '#F5F5F5',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          color: '#333333'
                        }}
                      >
                        <Quote size={12} color="var(--color-primary)" />
                        {pub.citation_count} {lang === 'vi' ? 'trích dẫn' : 'citations'} ({pub.citation_source || 'Verified'})
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: '1.4', marginBottom: '8px' }}>
                    {pub.publisher_url ? (
                      <a href={pub.publisher_url} target="_blank" rel="noopener noreferrer" className="paper-title-link">
                        {pub.title}
                      </a>
                    ) : (
                      pub.title
                    )}
                  </h2>

                  {/* Authors */}
                  <div style={{ fontSize: '0.95rem', color: '#1B5E20', fontWeight: 500, marginBottom: '6px' }}>
                    {pub.authors}
                  </div>

                  {/* Venue & Journal info */}
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '14px' }}>
                    {pub.venue} ({pub.year})
                  </div>

                  {/* Topic Tags */}
                  {pub.topic_tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {pub.topic_tags.split(',').map((tag, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg-page)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Abstract Toggle */}
                  {(pub.abstract_vi || pub.abstract_en) && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => toggleAbstract(pub.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          padding: '4px 0'
                        }}
                      >
                        {isExpanded ? (
                          <>{lang === 'vi' ? 'Thu gọn Tóm tắt' : 'Hide Abstract'} <ChevronUp size={16} /></>
                        ) : (
                          <>{lang === 'vi' ? 'Xem Tóm tắt (Abstract)' : 'View Abstract'} <ChevronDown size={16} /></>
                        )}
                      </button>

                      {isExpanded && (
                        <div style={{ backgroundColor: 'var(--color-bg-page)', padding: '18px 22px', borderRadius: '6px', marginTop: '10px', fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--color-text-body)', borderLeft: '3px solid var(--color-primary)' }}>
                          <p>{lang === 'vi' ? pub.abstract_vi || pub.abstract_en : pub.abstract_en || pub.abstract_vi}</p>
                          {pub.keywords && (
                            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                              <strong>{lang === 'vi' ? 'Từ khóa' : 'Keywords'}:</strong> {pub.keywords}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Action Links */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--color-border-light)', fontSize: '0.85rem' }}>
                    {pub.doi && (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }} className="link-hover">
                        DOI: {pub.doi} <ExternalLink size={13} />
                      </a>
                    )}
                    {pub.pdf_url && (
                      <a href={pub.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontWeight: 700 }} className="link-hover">
                        <FileText size={14} /> [PDF] {t('publications.downloadPdf')}
                      </a>
                    )}
                    {pub.publisher_url && (
                      <a href={pub.publisher_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-main)', fontWeight: 600 }} className="link-hover">
                        {t('publications.viewPublisher')} <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {publications.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h3>{t('common.noData')}</h3>
              <button type="button" onClick={clearAllFilters} className="btn-pri" style={{ marginTop: '16px' }}>
                {t('common.clearFilter')}
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .scholar-entry:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }
        .paper-title-link:hover {
          color: var(--color-primary);
        }
        .link-hover:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
