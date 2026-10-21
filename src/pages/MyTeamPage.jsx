import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Globe, ExternalLink, Code2, BookOpen, Users, Compass, Cpu, Layers, Sparkles } from 'lucide-react';

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

  const getInitials = (name) => {
    if (!name) return 'N';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderMemberCard = (member, isLeadership = false) => {
    const initials = getInitials(member.name);
    const avatarSrc = member.avatar || (member.name === 'Trần Duy Nhân' ? '/assets/Tran_Duy_Nhan_avt.svg' : null);
    const hasValidPhoto = avatarSrc && !avatarSrc.includes('unsplash.com') && !avatarSrc.includes('placeholder');

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
        {/* Avatar Container: Authentic Photo or Clean Monogram Badge */}
        <div
          style={{
            height: '240px',
            backgroundColor: 'var(--color-bg-page)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderBottom: '1px solid var(--color-border-light)',
            overflow: 'hidden'
          }}
        >
          {hasValidPhoto ? (
            <img
              src={avatarSrc}
              alt={member.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="portrait-img"
            />
          ) : (
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '3px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(238, 0, 51, 0.15)'
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Member Details */}
        <div style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            {lang === 'vi' ? member.role_vi : member.role_en}
          </div>

          <h3 style={{ fontSize: isLeadership ? '1.4rem' : '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
            {member.name}
          </h3>

          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            {lang === 'vi' ? member.affiliation_vi : member.affiliation_en}
          </div>

          {/* Research Interests */}
          {(member.research_interests_vi || member.research_interests_en) && (
            <div style={{ backgroundColor: 'var(--color-bg-page)', padding: '12px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
              <strong style={{ color: 'var(--color-text-main)' }}>{t('team.researchInterests')}:</strong>{' '}
              <span style={{ color: 'var(--color-text-muted)' }}>
                {lang === 'vi' ? member.research_interests_vi : member.research_interests_en}
              </span>
            </div>
          )}

          {/* Bio excerpt */}
          {(member.bio_vi || member.bio_en) && (
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)', lineHeight: '1.65', marginBottom: '20px', flexGrow: 1 }}>
              {lang === 'vi' ? member.bio_vi : member.bio_en}
            </p>
          )}

          {/* External Links Bar */}
          <div style={{ paddingTop: '14px', borderTop: '1px solid var(--color-border-light)', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            {member.email && (
              <a href={`mailto:${member.email}`} title={member.email} style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }} className="icon-link">
                <Mail size={16} color="var(--color-primary)" /> {member.email}
              </a>
            )}
            {member.google_scholar && (
              <a href={member.google_scholar} target="_blank" rel="noopener noreferrer" title="Google Scholar" style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }} className="icon-link">
                <BookOpen size={14} color="var(--color-primary)" /> Scholar
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" title="GitHub" style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }} className="icon-link">
                <Code2 size={15} /> GitHub
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="network-node-dot" />
            <span className="head-sub">{t('team.headerSub')}</span>
          </div>
          <h1 className="head-pri" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', margin: '12px 0 16px 0' }}>
            {t('team.headerTitle')}
          </h1>
          <p className="desc-intro">{t('team.headerDesc')}</p>
        </div>
      </section>

      {/* 2. Founder Section */}
      {teamData.leadership?.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ marginBottom: '36px' }}>
              <span className="head-sub">{lang === 'vi' ? 'NGƯỜI SÁNG LẬP CỘNG ĐỒNG' : 'COMMUNITY FOUNDER'}</span>
              <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('team.leadership')}</h2>
            </div>

            <div style={{ maxWidth: '520px' }}>
              {teamData.leadership.map(m => renderMemberCard(m, true))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Research Community Members & Collaborators Section */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <span className="head-sub">{lang === 'vi' ? 'THÀNH VIÊN & CỘNG TÁC VIÊN' : 'MEMBERS & COLLABORATORS'}</span>
            <h2 className="head-pri" style={{ marginBottom: 0 }}>{t('team.researchers')}</h2>
          </div>

          {teamData.researchers?.length > 0 ? (
            <div className="grid-3" style={{ gap: '32px' }}>
              {teamData.researchers.map(m => renderMemberCard(m, false))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '48px 36px',
                textAlign: 'center',
                maxWidth: '720px',
                margin: '0 auto'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-bg)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Users size={28} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '10px' }}>
                {lang === 'vi' ? 'Cùng Tham Gia Nghiên Cứu Với NIRV' : 'Collaborate With NIRV'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.65', marginBottom: '24px' }}>
                {lang === 'vi'
                  ? 'NIRV là cộng đồng cởi mở luôn chào đón những sinh viên và người trẻ quan tâm đến nghiên cứu AI trong các lĩnh vực NLP, CV và LLMs. Hãy kết nối với chúng tôi để cùng trao đổi ý tưởng và phát triển nghiên cứu.'
                  : 'NIRV is an open community welcoming students and emerging researchers passionate about AI in NLP, CV, and LLMs. Connect with us to exchange ideas and collaborate.'}
              </p>
              <a href="mailto:nirv.colab@gmail.com" className="btn-solid" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} /> nirv.colab@gmail.com
              </a>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .team-profile-card:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }
        .icon-link:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
