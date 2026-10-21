import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

export default function SocialContributionPage() {
  const { lang, t, routeMap } = useLanguage();
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/initiatives')
      .then(res => res.json())
      .then(res => {
        if (res.success) setInitiatives(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* 1. Impactful Intro Section inspired by Viettel kien-tao-xa-hoi-so */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '80px 0 60px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '880px' }}>
            <span className="head-sub">{t('social.headerSub')}</span>
            <h1 className="head-pri" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', margin: '16px 0 24px 0' }}>
              {t('social.headerTitle')}
            </h1>
            <p className="desc-intro" style={{ fontSize: '1.2rem', lineHeight: '1.7', color: 'var(--color-text-body)' }}>
              {t('social.headerDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Major Initiatives List */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {initiatives.map((item, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="initiative-row-card"
                >
                  {/* Left Column: Image with Viettel-style number badge */}
                  <div style={{ position: 'relative', minHeight: '360px', overflow: 'hidden', order: isEven ? 2 : 1 }}>
                    <img
                      src={item.cover_image}
                      alt={lang === 'vi' ? item.title_vi : item.title_en}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                      className="initiative-img"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        boxShadow: '0 4px 12px rgba(238, 0, 51, 0.4)'
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Right Column: Narrative & Metrics */}
                  <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', order: isEven ? 1 : 2 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                      <span className="badge badge-primary">
                        {lang === 'vi' ? item.category_vi : item.category_en}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px', lineHeight: '1.3' }}>
                      <Link to={`${routeMap[lang].social}/${item.slug}`} className="initiative-title-link">
                        {lang === 'vi' ? item.title_vi : item.title_en}
                      </Link>
                    </h2>

                    <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: '1.65', marginBottom: '24px' }}>
                      {lang === 'vi' ? item.summary_vi : item.summary_en}
                    </p>

                    {/* Beneficiaries & Impact Box */}
                    <div style={{ backgroundColor: 'var(--color-bg-page)', borderRadius: '6px', padding: '16px 20px', marginBottom: '24px', borderLeft: '4px solid var(--color-primary)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        {t('social.targetBeneficiaries')}:
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {lang === 'vi' ? item.beneficiaries_vi : item.beneficiaries_en}
                      </div>

                      {item.metric_value && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            {item.metric_value}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            {lang === 'vi' ? item.metric_label_vi : item.metric_label_en}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Link to={`${routeMap[lang].social}/${item.slug}`} className="btn-pri">
                        {t('common.readMore')} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .initiative-row-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--color-border);
        }
        .initiative-row-card:hover .initiative-img {
          transform: scale(1.05);
        }
        .initiative-title-link:hover {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
