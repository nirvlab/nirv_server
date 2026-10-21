import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { lang, t, routeMap } = useLanguage();

  return (
    <footer style={{ backgroundColor: 'var(--color-bg-dark)', color: '#FFFFFF', paddingTop: '70px', paddingBottom: '40px', borderTop: '3px solid var(--color-primary)' }}>
      <div className="container">
        <div className="grid-3" style={{ gap: '40px', marginBottom: '50px' }}>
          {/* Column 1: Organization & Identity */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
                }}
              >
                <img
                  src="/assets/logo_nav.svg"
                  alt="NIRV — Network for Intelligent Research Vietnam"
                  style={{ height: '36px', width: 'auto', display: 'block' }}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.6', marginBottom: '20px' }}>
              {lang === 'vi'
                ? 'NIRV — Network for Intelligent Research Vietnam — là cộng đồng kết nối những sinh viên và người trẻ quan tâm đến nghiên cứu trí tuệ nhân tạo, thúc đẩy sáng tạo khoa học cởi mở và bền vững.'
                : 'NIRV — Network for Intelligent Research Vietnam — is a research community connecting students and emerging researchers in artificial intelligence to foster open, collaborative scientific innovation.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  {lang === 'vi'
                    ? 'Thành phố Hồ Chí Minh, Việt Nam'
                    : 'Ho Chi Minh City, Vietnam'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <a
                  href="mailto:nirv.colab@gmail.com"
                  style={{ color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'none' }}
                  className="footer-link"
                >
                  nirv.colab@gmail.com
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <a
                  href="tel:+84905935377"
                  style={{ color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'none' }}
                  className="footer-link"
                >
                  +84 905935377
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '10px' }}>
              {t('footer.quickLinks')}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li>
                <Link to={routeMap[lang].about} style={{ color: 'rgba(255,255,255,0.8)', transition: 'color 0.2s' }} className="footer-link">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to={routeMap[lang].social} style={{ color: 'rgba(255,255,255,0.8)', transition: 'color 0.2s' }} className="footer-link">
                  {t('nav.social')}
                </Link>
              </li>
              <li>
                <Link to={routeMap[lang].news} style={{ color: 'rgba(255,255,255,0.8)', transition: 'color 0.2s' }} className="footer-link">
                  {t('nav.news')}
                </Link>
              </li>
              <li>
                <Link to={routeMap[lang].publications} style={{ color: 'rgba(255,255,255,0.8)', transition: 'color 0.2s' }} className="footer-link">
                  {t('nav.publications')}
                </Link>
              </li>
              <li>
                <Link to={routeMap[lang].team} style={{ color: 'rgba(255,255,255,0.8)', transition: 'color 0.2s' }} className="footer-link">
                  {t('nav.team')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Research Focus (Verified 3 Areas Only) */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '10px' }}>
              {t('footer.researchFocus')}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />
                <span>Natural Language Processing (NLP)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />
                <span>Computer Vision (CV)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />
                <span>Large Language Models (LLMs)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Clean copyright (NO admin link visible to public!) */}
        <div style={{ paddingTop: '25px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          <div>{t('footer.copyright')}</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Network for Intelligent Research Vietnam</span>
            <span>Open & Collaborative Research Community</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--color-primary) !important;
          padding-left: 4px;
        }
      `}</style>
    </footer>
  );
}
