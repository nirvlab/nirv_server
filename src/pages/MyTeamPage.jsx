import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Globe, ExternalLink, Code2, BookOpen } from 'lucide-react';

export default function MyTeamPage() {
  const { lang, t } = useLanguage();
  const [teamData, setTeamData] = useState({ leadership: [], researchers: [], advisors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/team')
      .then(res => res.json())
      .then(res => {
        if (res.success) setTeamData(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const renderMemberCard = (member, isLeadership = false) => {
    return (
      <div
        key={member.id}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-smooth)'
        }}
        className="team-profile-card"
      >
        {/* Portrait Photo Container with Viettel subtle zoom hover */}
        <div style={{ position: 'relative', paddingTop: isLeadership ? '95%' : '85%', overflow: 'hidden', backgroundColor: '#E2E2E2' }}>
          <img
            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
            alt={member.name}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            className="portrait-img"
          />
        </div>

        {/* Member Details */}
        <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {lang === 'vi' ? member.title_vi : member.title_en}
          </div>

          <h3 style={{ fontSize: isLeadership ? '1.35rem' : '1.2rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
            {member.name}
          </h3>

          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-body)', marginBottom: '8px' }}>
            {lang === 'vi' ? member.role_vi : member.role_en}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '14px', fontStyle: 'italic' }}>
            {lang === 'vi' ? member.affiliation_vi : member.affiliation_en}
          </div>

          {/* Research Interests */}
          {(member.research_interests_vi || member.research_interests_en) && (
            <div style={{ backgroundColor: 'var(--color-bg-page)', padding: '10px 14px', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '16px' }}>
              <strong style={{ color: 'var(--color-text-main)' }}>{t('team.researchInterests')}:</strong>{' '}
              <span style={{ color: 'var(--color-text-muted)' }}>
                {lang === 'vi' ? member.research_interests_vi : member.research_interests_en}
              </span>
            </div>
          )}

          {/* Bio excerpt */}
          {(member.bio_vi || member.bio_en) && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 }}>
              {lang === 'vi' ? member.bio_vi : member.bio_en}
            </p>
          )}

          {/* External Links Bar */}
          <div style={{ paddingTop: '14px', borderTop: '1px solid var(--color-border-light)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {member.email && (
              <a href={`mailto:${member.email}`} title={member.email} style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center' }} className="icon-link">
                <Mail size={16} />
              </a>
            )}
            {member.google_scholar && (
              <a href={member.google_scholar} target="_blank" rel="noopener noreferrer" title="Google Scholar" style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700 }} className="icon-link">
                <BookOpen size={15} color="var(--color-primary)" /> Scholar
              </a>
            )}
            {member.orcid && (
              <a href={member.orcid} target="_blank" rel="noopener noreferrer" title="ORCID" style={{ color: '#A6CE39', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700 }} className="icon-link">
                iD ORCID
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" title="GitHub" style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center' }} className="icon-link">
                <Code2 size={16} />
              </a>
            )}
            {member.website && (
              <a href={member.website} target="_blank" rel="noopener noreferrer" title="Personal Website" style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center' }} className="icon-link">
                <Globe size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 1. Page Header */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '60px 0 40px 0' }}>
        <div className="container">
          <span className="head-sub">{t('team.headerSub')}</span>
          <h1 className="head-pri" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', margin: '12px 0 16px 0' }}>
            {t('team.headerTitle')}
          </h1>
          <p className="desc-intro">{t('team.headerDesc')}</p>
        </div>
      </section>

      {/* 2. Leadership Section */}
      {teamData.leadership?.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ marginBottom: '40px' }}>
              <span className="head-sub">{lang === 'vi' ? 'LÃNH ĐẠO VIỆN' : 'GOVERNANCE'}</span>
              <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('team.leadership')}</h2>
            </div>

            <div className="grid-3" style={{ gap: '36px' }}>
              {teamData.leadership.map(m => renderMemberCard(m, true))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Research Team Section */}
      {teamData.researchers?.length > 0 && (
        <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ marginBottom: '40px' }}>
              <span className="head-sub">{lang === 'vi' ? 'LỰC LƯỢNG NGHIÊN CỨU' : 'RESEARCH FACULTY'}</span>
              <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('team.researchers')}</h2>
            </div>

            <div className="grid-3" style={{ gap: '32px' }}>
              {teamData.researchers.map(m => renderMemberCard(m, false))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .team-profile-card:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }
        .team-profile-card:hover .portrait-img {
          transform: scale(1.05);
        }
        .icon-link:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
