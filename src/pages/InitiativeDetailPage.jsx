import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, CheckCircle2, Users, Target, Calendar, Share2 } from 'lucide-react';
import ArticleContent from '../components/ArticleContent';

export default function InitiativeDetailPage() {
  const { slug } = useParams();
  const { lang, t, routeMap } = useLanguage();
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/initiatives/${slug}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setInitiative(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!initiative) return;
    const title = `${lang === 'vi' ? initiative.title_vi : (initiative.title_en || initiative.title_vi)} — NIRV`;
    document.title = title;

    const setMeta = (attr, key, val) => {
      if (!val) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    const desc = lang === 'vi' ? (initiative.summary_vi || initiative.title_vi) : (initiative.summary_en || initiative.title_en || initiative.summary_vi);
    const img = initiative.cover_image?.startsWith('http') ? initiative.cover_image : `${window.location.origin}${initiative.cover_image?.startsWith('/') ? '' : '/'}${initiative.cover_image || ''}`;
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:url', window.location.href);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
  }, [initiative, lang]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>{t('common.noData')}</h2>
        <Link to={routeMap[lang].social} className="btn-pri" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> {t('common.back')}
        </Link>
      </div>
    );
  }

  const gallery = JSON.parse(initiative.gallery || '[]');

  return (
    <div>
      {/* Top Banner Header */}
      <section style={{ backgroundColor: 'var(--color-bg-dark)', color: '#FFFFFF', padding: '60px 0 50px 0' }}>
        <div className="container">
          <Link to={routeMap[lang].social} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '20px' }}>
            <ArrowLeft size={16} /> {t('nav.social')}
          </Link>
          <div style={{ maxWidth: '900px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '14px' }}>
              {lang === 'vi' ? initiative.category_vi : initiative.category_en}
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: '1.25', margin: '14px 0 20px 0' }}>
              {lang === 'vi' ? initiative.title_vi : initiative.title_en}
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
              {lang === 'vi' ? initiative.summary_vi : initiative.summary_en}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="section">
        <div className="container">
          <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '50px' }}>
            {/* Storytelling & Details */}
            <div>
              <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '36px', boxShadow: 'var(--shadow-sm)' }}>
                <img
                  src={initiative.cover_image}
                  alt={lang === 'vi' ? initiative.title_vi : initiative.title_en}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23f0eeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23888888">NIRV Social Initiative</text></svg>';
                  }}
                  style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                />
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '36px', border: '1px solid var(--color-border)', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: 'var(--color-text-main)' }}>
                  {lang === 'vi' ? 'BỐI CẢNH & MỤC TIÊU CHIẾN LƯỢC' : 'CONTEXT & STRATEGIC OBJECTIVES'}
                </h3>
                <div style={{ marginTop: '16px' }}>
                  <ArticleContent content={lang === 'vi' ? initiative.content_vi : initiative.content_en} />
                </div>
              </div>

              {/* Gallery if present */}
              {gallery.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '20px' }}>
                    {t('social.gallery')}
                  </h3>
                  <div className="grid-2" style={{ gap: '20px' }}>
                    {gallery.map((imgUrl, i) => (
                      <div key={i} style={{ borderRadius: '6px', overflow: 'hidden', height: '240px' }}>
                        <img
                          src={imgUrl}
                          alt="Field activity"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="%23f0eeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23888888">Activity Photo</text></svg>';
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Impact Sidebar */}
            <div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '30px', position: 'sticky', top: '100px', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)', marginBottom: '20px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '8px' }}>
                  {t('social.verifiedOutcome')}
                </h4>

                {initiative.metric_value && (
                  <div style={{ marginBottom: '24px', backgroundColor: 'var(--color-primary-bg)', padding: '20px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                      {initiative.metric_value}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-body)', marginTop: '6px' }}>
                      {lang === 'vi' ? initiative.metric_label_vi : initiative.metric_label_en}
                    </div>
                  </div>
                )}

                {(initiative.beneficiaries_vi || initiative.beneficiaries_en) && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      <Users size={16} color="var(--color-primary)" />
                      {t('social.targetBeneficiaries')}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {lang === 'vi' ? (initiative.beneficiaries_vi || initiative.beneficiaries_en) : (initiative.beneficiaries_en || initiative.beneficiaries_vi)}
                    </div>
                  </div>
                )}

                {(initiative.verification_vi || initiative.verification_en) && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      <CheckCircle2 size={16} color="var(--color-primary)" />
                      {lang === 'vi' ? 'Phương thức Kiểm chứng' : 'Verification Model'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', lineHeight: '1.6' }}>
                      {lang === 'vi' ? (initiative.verification_vi || initiative.verification_en) : (initiative.verification_en || initiative.verification_vi)}
                    </div>
                  </div>
                )}

                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                  <Link to={routeMap[lang].social} className="btn-pri" style={{ width: '100%', justifyContent: 'center' }}>
                    <ArrowLeft size={16} /> {t('common.back')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
