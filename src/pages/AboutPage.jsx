import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AnimatedStat from '../components/AnimatedStat';
import WorldFootprintMap from '../components/WorldFootprintMap';
import { ArrowRight, BookOpen, Users, Compass, ExternalLink, Sparkles, Layers, Cpu } from 'lucide-react';

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

  // Authentic statistics that have genuine underlying records
  const genuineStatCards = [
    {
      id: 'focus_areas',
      number: 3,
      label: lang === 'vi' ? 'Định hướng Nghiên cứu' : 'Research Focus Areas',
      desc: lang === 'vi' ? 'NLP, CV & LLMs' : 'NLP, CV & LLMs'
    },
    {
      id: 'team_profiles',
      number: stats.total_team || 1,
      label: lang === 'vi' ? 'Hồ sơ Nghiên cứu viên' : 'Community Profiles',
      desc: lang === 'vi' ? 'Nhà sáng lập & Thành viên' : 'Founder & Members'
    }
  ];

  if (stats.total_publications > 0) {
    genuineStatCards.push({
      id: 'publications',
      number: stats.total_publications,
      label: lang === 'vi' ? 'Công bố Khoa học' : 'Publications',
      desc: lang === 'vi' ? 'Công trình đã thẩm định' : 'Peer-reviewed works'
    });
  }

  if (stats.total_news + stats.total_events > 0) {
    genuineStatCards.push({
      id: 'news_events',
      number: stats.total_news + stats.total_events,
      label: lang === 'vi' ? 'Tin tức & Hoạt động' : 'News & Activities',
      desc: lang === 'vi' ? 'Giao lưu học thuật' : 'Community outreach'
    });
  }

  return (
    <div>
      {/* 1. Hero Section - Community brand introduction */}
      <section style={{ backgroundColor: 'var(--color-bg-dark)', color: '#FFFFFF', position: 'relative', overflow: 'hidden', padding: '90px 0 110px 0' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', opacity: 0.12, pointerEvents: 'none', background: 'radial-gradient(circle at center, #EE0033 0%, transparent 70%)' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '860px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span className="network-node-dot" />
              <span className="head-sub" style={{ color: 'var(--color-primary-light)', letterSpacing: '0.12em', margin: 0 }}>
                {t('about.heroSub')}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.1rem, 4.8vw, 3.4rem)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.18, letterSpacing: '-0.02em', margin: '16px 0 24px 0' }}>
              {lang === 'vi' ? 'NETWORK FOR INTELLIGENT RESEARCH VIETNAM' : 'NETWORK FOR INTELLIGENT RESEARCH VIETNAM'}
            </h1>

            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '780px' }}>
              {lang === 'vi'
                ? 'NIRV là cộng đồng kết nối những sinh viên và người trẻ quan tâm đến nghiên cứu trí tuệ nhân tạo. Chúng tôi tin rằng những người theo đuổi nghiên cứu độc lập, dù ở bất cứ đâu, đều xứng đáng có một nơi để kết nối, cùng làm việc, chia sẻ ý tưởng và tự do phát huy sức sáng tạo khoa học.'
                : 'NIRV is a research community connecting students and emerging researchers interested in artificial intelligence. We believe independent researchers, wherever they are, deserve a place to belong, collaborate, exchange ideas, and freely develop their scientific creativity.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Link to={routeMap[lang].team} className="btn-solid">
                {t('nav.team')} <ArrowRight size={16} />
              </Link>
              <Link to={routeMap[lang].social} className="btn-white">
                {t('nav.social')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Genuine Statistics Bar - Strictly derives from actual data with animated count-up */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '36px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: '24px' }}>
            {genuineStatCards.map((st) => (
              <div key={st.id} className="stat-box" style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '18px' }}>
                <div className="stat-number">
                  <AnimatedStat value={st.number} />
                </div>
                <div className="stat-label">{st.label}</div>
                <div className="stat-desc">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Community Story & Research Focus */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '60px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="network-node-dot" />
                <span className="head-sub">{t('about.introTitle')}</span>
              </div>
              <h2 className="head-pri">
                {lang === 'vi'
                  ? 'MÁI NHÀ HỌC THUẬT CHO NGHIÊN CỨU VIÊN ĐỘC LẬP'
                  : 'A HOME FOR INDEPENDENT AND EMERGING RESEARCHERS'}
              </h2>
              <p className="desc-intro" style={{ marginBottom: '24px', lineHeight: 1.75 }}>
                {lang === 'vi'
                  ? 'NIRV được sáng lập với tâm nguyện tạo dựng một môi trường mở, cởi mở và gắn kết, nơi sinh viên và những người trẻ yêu thích nghiên cứu AI có thể tìm thấy bạn đồng hành, trao đổi tri thức và cùng hiện thực hóa các ý tưởng khoa học.'
                  : 'NIRV was founded with the aspiration of establishing an open and supportive environment where students and emerging AI researchers can find collaborators, share insights, and realize their scientific ideas.'}
              </p>

              {/* Research Focus 3 Pillars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '28px' }}>
                <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '6px', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Cpu size={18} color="var(--color-primary)" />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)', margin: 0 }}>
                      Natural Language Processing (NLP)
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-body)', margin: 0 }}>
                    {lang === 'vi'
                      ? 'Nghiên cứu xử lý ngôn ngữ tự nhiên, tập trung vào tiếng Việt và các ngữ cảnh ngôn ngữ đặc thù.'
                      : 'Researching NLP techniques with specialized focus on Vietnamese and multilingual contexts.'}
                  </p>
                </div>

                <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '6px', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Layers size={18} color="var(--color-primary)" />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)', margin: 0 }}>
                      Computer Vision (CV)
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-body)', margin: 0 }}>
                    {lang === 'vi'
                      ? 'Thị giác máy tính, nhận diện hình ảnh, video và ứng dụng thị giác vào thực tiễn đời sống.'
                      : 'Advancing visual recognition, multimodal perception, and practical vision systems.'}
                  </p>
                </div>

                <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '6px', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Sparkles size={18} color="var(--color-primary)" />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)', margin: 0 }}>
                      Large Language Models (LLMs)
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-body)', margin: 0 }}>
                    {lang === 'vi'
                      ? 'Khám phá kiến trúc mô hình ngôn ngữ lớn, tinh chỉnh (fine-tuning), lý luận và an toàn AI.'
                      : 'Exploring LLM architectures, instruction tuning, reasoning, and aligned AI.'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
                  alt="NIRV Community Collaboration"
                  style={{ width: '100%', height: '480px', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', color: '#FFFFFF' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {lang === 'vi' ? 'Cộng đồng Nghiên cứu NIRV' : 'NIRV AI Research Community'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                    {lang === 'vi' ? 'Thành phố Hồ Chí Minh, Việt Nam' : 'Ho Chi Minh City, Vietnam'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values & Philosophy */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
            <span className="head-sub">{lang === 'vi' ? 'TRIẾT LÝ HOẠT ĐỘNG' : 'COMMUNITY PHILOSOPHY'}</span>
            <h2 className="head-pri">{t('about.coreValuesTitle')}</h2>
          </div>

          <div className="grid-3" style={{ gap: '30px' }}>
            <div style={{ padding: '40px 30px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', position: 'relative', backgroundColor: 'var(--color-bg-page)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                01
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Tự do Sáng tạo Khoa học' : 'Scientific Creativity'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {lang === 'vi'
                  ? 'Nơi các sinh viên và người trẻ theo đuổi nghiên cứu độc lập tự do phát triển ý tưởng, thử nghiệm phương pháp mới và khai phóng tiềm năng khoa học.'
                  : 'A space where students and independent researchers can freely develop ideas, experiment with novel approaches, and fulfill scientific curiosity.'}
              </p>
            </div>

            <div style={{ padding: '40px 30px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', position: 'relative', backgroundColor: 'var(--color-bg-page)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                02
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Cởi mở & Hợp tác' : 'Open Collaboration'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {lang === 'vi'
                  ? 'Xây dựng môi trường học thuật bình đẳng, kết nối những người cùng chí hướng, sẵn sàng chia sẻ tri thức và cùng nhau giải quyết bài toán lớn.'
                  : 'Fostering an open, egalitarian environment where peers connect, exchange knowledge, and collaborate on challenging AI frontiers.'}
              </p>
            </div>

            <div style={{ padding: '40px 30px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', position: 'relative', backgroundColor: 'var(--color-bg-page)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                03
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Phát triển Bền vững' : 'Sustainable Growth'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {lang === 'vi'
                  ? 'Hướng đến việc góp phần xây dựng một cộng đồng nghiên cứu AI Việt Nam phát triển lâu dài, thực chất và có đóng góp tích cực cho xã hội.'
                  : 'Aspiring to contribute to a sustainable, impactful, and authentic AI research community in Vietnam.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Social Initiatives Preview (Rendered ONLY if genuine initiatives exist) */}
      {initiatives.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="head-sub">{lang === 'vi' ? 'SÁNG KIẾN CỘNG ĐỒNG' : 'COMMUNITY INITIATIVES'}</span>
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
      )}

      {/* 6. Selected News & Events Preview (Rendered ONLY if genuine news exist) */}
      {news.length > 0 && (
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
      )}

      {/* 7. Recently Published Research Preview (Rendered ONLY if genuine publications exist) */}
      {publications.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="head-sub">{lang === 'vi' ? 'CÔNG BỐ KHOA HỌC' : 'SCHOLARLY WORKS'}</span>
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
      )}

      {/* 8. Vùng đất đã đến - Interactive World Footprint Map */}
      <WorldFootprintMap />

      {/* 9. Founder & Team Preview */}
      {leadership.length > 0 && (
        <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="head-sub">{lang === 'vi' ? 'BAN ĐIỀU HÀNH & SÁNG LẬP' : 'LEADERSHIP & FOUNDING'}</span>
                <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('about.teamPreviewTitle')}</h2>
              </div>
              <Link to={routeMap[lang].team} className="btn-pri">
                {t('common.viewAll')} <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
              {leadership.map((member) => (
                <div
                  key={member.id}
                  style={{
                    maxWidth: '380px',
                    width: '100%',
                    backgroundColor: 'var(--color-bg-page)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    textAlign: 'center',
                    transition: 'var(--transition-smooth)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  className="team-card"
                >
                  <div style={{ padding: '36px 24px 20px 24px', display: 'flex', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '135px',
                        height: '135px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '3px solid var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(238,0,51,0.18)',
                        overflow: 'hidden'
                      }}
                    >
                      {member.avatar || member.name === 'Trần Duy Nhân' ? (
                        <img
                          src={member.avatar || '/assets/Tran_Duy_Nhan_avt.svg'}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                        />
                      ) : (
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {member.name ? member.name.slice(0, 2).toUpperCase() : 'NIRV'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '10px 24px 32px 24px' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                      {member.name}
                    </h3>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '12px' }}>
                      {lang === 'vi' ? member.role_vi : member.role_en}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                      {lang === 'vi' ? member.affiliation_vi : member.affiliation_en}
                    </div>
                    <Link to={routeMap[lang].team} className="btn-solid" style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
                      {t('common.readMore')} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
