import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, BookOpen, Users, Globe2, Award, Calendar, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  const { lang, t, routeMap } = useLanguage();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/public/overview').then(res => res.json()),
      fetch('/api/public/settings').then(res => res.json())
    ])
      .then(([overviewRes, settingsRes]) => {
        if (overviewRes.success) setData(overviewRes.data);
        if (settingsRes.success) setSettings(settingsRes.data);
      })
      .catch(err => console.error('Error loading overview data:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const initiatives = data?.featured_initiatives || [];
  const news = data?.featured_news || [];
  const publications = data?.featured_publications || [];
  const leadership = data?.leadership_team || [];

  return (
    <div>
      {/* 1. Hero Section - Viettel inspired high-impact institutional banner */}
      <section style={{ backgroundColor: 'var(--color-bg-dark)', color: '#FFFFFF', position: 'relative', overflow: 'hidden', padding: '90px 0 110px 0' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', opacity: 0.12, pointerEvents: 'none', background: 'radial-gradient(circle at center, #EE0033 0%, transparent 70%)' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '840px' }}>
            <span className="head-sub" style={{ color: 'var(--color-primary-light)' }}>
              {t('about.heroSub')}
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '20px 0' }}>
              {lang === 'vi' ? settings.tagline_vi || t('about.heroTitle') : settings.tagline_en || t('about.heroTitle')}
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.65, marginBottom: '36px', maxWidth: '720px' }}>
              {lang === 'vi' ? settings.vision_vi || t('about.heroDesc') : settings.vision_en || t('about.heroDesc')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Link to={routeMap[lang].social} className="btn-solid">
                {t('nav.social')} <ArrowRight size={16} />
              </Link>
              <Link to={routeMap[lang].publications} className="btn-white">
                {t('nav.publications')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Institution-Wide Live Statistics (Strictly derived from published records) */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
            <div className="stat-box" style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '16px' }}>
              <div className="stat-number">{stats.total_publications || 0}</div>
              <div className="stat-label">{lang === 'vi' ? 'Công bố Khoa học' : 'Publications'}</div>
              <div className="stat-desc">{lang === 'vi' ? 'Đã xuất bản (Q1, CORE A*)' : 'Peer-reviewed works'}</div>
            </div>

            <div className="stat-box" style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '16px' }}>
              <div className="stat-number">{stats.total_citations ? stats.total_citations.toLocaleString() : 0}</div>
              <div className="stat-label">{lang === 'vi' ? 'Lượt Trích dẫn' : 'Citations'}</div>
              <div className="stat-desc">{lang === 'vi' ? 'Google Scholar / Scopus' : 'Scholar verified'}</div>
            </div>

            <div className="stat-box" style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '16px' }}>
              <div className="stat-number">{stats.total_initiatives || 0}</div>
              <div className="stat-label">{lang === 'vi' ? 'Dự án Xã hội' : 'Social Initiatives'}</div>
              <div className="stat-desc">{lang === 'vi' ? 'Phục vụ cộng đồng' : 'Societal impact'}</div>
            </div>

            <div className="stat-box" style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '16px' }}>
              <div className="stat-number">{stats.total_news + stats.total_events || 0}</div>
              <div className="stat-label">{lang === 'vi' ? 'Tin tức & Sự kiện' : 'News & Events'}</div>
              <div className="stat-desc">{lang === 'vi' ? 'Hoạt động học thuật' : 'Scientific outreach'}</div>
            </div>

            <div className="stat-box" style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '16px' }}>
              <div className="stat-number">{stats.total_team || 0}</div>
              <div className="stat-label">{lang === 'vi' ? 'Nhà Khoa học' : 'Researchers'}</div>
              <div className="stat-desc">{lang === 'vi' ? 'Chuyên gia đầu ngành' : 'Faculty & fellows'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision & Mission Section */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '60px' }}>
            <div>
              <span className="head-sub">{lang === 'vi' ? 'GIỚI THIỆU TỔ CHỨC' : 'ABOUT THE INSTITUTE'}</span>
              <h2 className="head-pri">
                {lang === 'vi' ? 'KẾT NỐI TRI THỨC ĐỈNH CAO VỚI TÁC ĐỘNG THỰC TIỄN' : 'CONNECTING FRONTIER KNOWLEDGE WITH REAL-WORLD IMPACT'}
              </h2>
              <p className="desc-intro" style={{ marginBottom: '24px' }}>
                {lang === 'vi' ? settings.mission_vi : settings.mission_en}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
                <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '6px', borderLeft: '4px solid var(--color-primary)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-primary)' }}>
                    {t('about.visionTitle')}
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-body)' }}>
                    {lang === 'vi' ? settings.vision_vi : settings.vision_en}
                  </p>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '6px', borderLeft: '4px solid var(--color-text-main)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                    {t('about.missionTitle')}
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-body)' }}>
                    {lang === 'vi' ? settings.mission_vi : settings.mission_en}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
                  alt="NIRV Researchers"
                  style={{ width: '100%', height: '480px', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', color: '#FFFFFF' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{lang === 'vi' ? 'Không gian Nghiên cứu Sáng tạo NIRV' : 'NIRV Collaborative Innovation Hub'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Khu Công nghệ cao Hòa Lạc, Hà Nội</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values - Inspired by Viettel .item-coreValue with big numbered circles */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
            <span className="head-sub">{lang === 'vi' ? 'TRIẾT LÝ HÀNH ĐỘNG' : 'GUIDING PRINCIPLES'}</span>
            <h2 className="head-pri">{t('about.coreValuesTitle')}</h2>
          </div>

          <div className="grid-3" style={{ gap: '30px' }}>
            <div style={{ padding: '40px 30px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', position: 'relative', backgroundColor: 'var(--color-bg-page)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                01
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Chuẩn mực Học thuật' : 'Academic Rigor'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                {lang === 'vi'
                  ? 'Theo đuổi các tiêu chuẩn nghiên cứu khoa học nghiêm ngặt nhất thế giới, hướng đến các công bố trên các tạp chí Q1 và hội nghị hạng A*.'
                  : 'Pursuing the highest international scientific standards, with consistent contributions to premier Q1 journals and CORE A* venues.'}
              </p>
            </div>

            <div style={{ padding: '40px 30px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', position: 'relative', backgroundColor: 'var(--color-bg-page)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                02
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Tác động Cộng đồng' : 'Societal Impact'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                {lang === 'vi'
                  ? 'Khoa học công nghệ phải phụng sự con người, giải quyết bài toán chăm sóc sức khỏe, bình đẳng giáo dục và thích ứng biến đổi khí hậu.'
                  : 'Technology must serve humanity, solving systemic challenges in community healthcare, education equity, and climate resilience.'}
              </p>
            </div>

            <div style={{ padding: '40px 30px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', position: 'relative', backgroundColor: 'var(--color-bg-page)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                03
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Đổi mới & Tự chủ' : 'Frontier Sovereignty'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                {lang === 'vi'
                  ? 'Làm chủ công nghệ lõi và nền tảng trí tuệ nhân tạo, xây dựng chủ quyền dữ liệu và thúc đẩy vị thế công nghệ Việt Nam trên bản đồ quốc tế.'
                  : 'Mastering core technologies and sovereign AI architectures to assert technological leadership on the global stage.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Social Initiatives Preview */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="head-sub">{lang === 'vi' ? 'SÁNG KIẾN TIÊU BIỂU' : 'HIGHLIGHTED INITIATIVES'}</span>
              <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('about.featuredSocialTitle')}</h2>
            </div>
            <Link to={routeMap[lang].social} className="btn-pri">
              {t('common.viewAll')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {initiatives.map((item) => (
              <div key={item.id} className="editorial-card">
                <div className="editorial-img-box">
                  <img src={item.cover_image} alt={lang === 'vi' ? item.title_vi : item.title_en} />
                </div>
                <div className="editorial-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="badge badge-primary">{lang === 'vi' ? item.category_vi : item.category_en}</span>
                    {item.metric_value && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {item.metric_value}
                      </span>
                    )}
                  </div>
                  <h3 className="editorial-title">
                    <Link to={`${routeMap[lang].social}/${item.slug}`}>
                      {lang === 'vi' ? item.title_vi : item.title_en}
                    </Link>
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 }}>
                    {lang === 'vi' ? item.summary_vi : item.summary_en}
                  </p>
                  <Link to={`${routeMap[lang].social}/${item.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    {t('common.readMore')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Selected News & Events Preview */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="head-sub">{lang === 'vi' ? 'HOẠT ĐỘNG & BÁO CHÍ' : 'NEWSROOM'}</span>
              <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('about.featuredNewsTitle')}</h2>
            </div>
            <Link to={routeMap[lang].news} className="btn-pri">
              {t('common.viewAll')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {news.map((item) => (
              <div key={item.id} className="editorial-card">
                <div className="editorial-img-box">
                  <img src={item.cover_image} alt={lang === 'vi' ? item.title_vi : item.title_en} />
                </div>
                <div className="editorial-content">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <span className={`badge ${item.type === 'event' ? 'badge-dark' : 'badge-primary'}`}>
                      {item.type === 'event' ? (lang === 'vi' ? 'SỰ KIỆN' : 'EVENT') : (lang === 'vi' ? 'TIN TỨC' : 'NEWS')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', alignSelf: 'center' }}>
                      {new Date(item.event_date || item.published_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                    </span>
                  </div>
                  <h3 className="editorial-title">
                    <Link to={`${routeMap[lang].news}/${item.slug}`}>
                      {lang === 'vi' ? item.title_vi : item.title_en}
                    </Link>
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 }}>
                    {lang === 'vi' ? item.summary_vi : item.summary_en}
                  </p>
                  <Link to={`${routeMap[lang].news}/${item.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    {t('common.readMore')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Recently Published Research Preview */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="head-sub">{lang === 'vi' ? 'ẤN PHẨM HỌC THUẬT' : 'SCHOLARLY WORKS'}</span>
              <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('about.featuredPubTitle')}</h2>
            </div>
            <Link to={routeMap[lang].publications} className="btn-pri">
              {t('common.viewAll')} <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {publications.map((pub) => (
              <div
                key={pub.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '24px 28px',
                  transition: 'var(--transition-smooth)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                className="pub-list-item"
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-ranking">{pub.ranking_category || 'Peer-Reviewed'}</span>
                  <span className="badge badge-gray">{pub.publication_type}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>{pub.year}</span>
                  {pub.citation_count > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                      {pub.citation_count} trích dẫn ({pub.citation_source || 'Scholar'})
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  {pub.title}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  <strong>{t('publications.authors')}:</strong> {pub.authors}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)', fontStyle: 'italic', marginBottom: '14px' }}>
                  {pub.venue}
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <Link to={routeMap[lang].publications} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {t('common.readMore')} <ArrowRight size={14} />
                  </Link>
                  {pub.doi && (
                    <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      DOI: {pub.doi} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Leadership Team Preview */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="head-sub">{lang === 'vi' ? 'HỘI ĐỒNG LÃNH ĐẠO' : 'FACULTY'}</span>
              <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('about.teamPreviewTitle')}</h2>
            </div>
            <Link to={routeMap[lang].team} className="btn-pri">
              {t('common.viewAll')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-4">
            {leadership.map((member) => (
              <div
                key={member.id}
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  textAlign: 'center',
                  transition: 'var(--transition-smooth)'
                }}
                className="team-card"
              >
                <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '20px 16px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                    {member.name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                    {lang === 'vi' ? member.role_vi : member.role_en}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {lang === 'vi' ? member.affiliation_vi : member.affiliation_en}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .pub-list-item:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }
        .team-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
