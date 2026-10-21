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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <img
                src="/assets/logo_nav.svg"
                alt="NIRV"
                style={{ height: '40px', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.6', marginBottom: '20px' }}>
              {lang === 'vi'
                ? 'Viện Nghiên cứu Đổi mới & Trí tuệ Nhân tạo NIRV — Trung tâm nghiên cứu xuất sắc về công nghệ nền tảng, AI và khoa học dữ liệu phục vụ sự tiến bộ xã hội.'
                : 'NIRV Institute of Research & Artificial Intelligence — A premier scientific center dedicated to foundational AI and data science for sustainable societal progress.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>
                  {lang === 'vi'
                    ? 'Tòa nhà Viện NIRV, Khu Công nghệ cao Hòa Lạc, Hà Nội, Việt Nam'
                    : 'NIRV Institute Building, Hoa Lac High-Tech Park, Hanoi, Vietnam'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <span>contact@nirv.ac.vn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <span>+84 (024) 3888 6688</span>
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

          {/* Column 3: Research Focus */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '10px' }}>
              {t('footer.researchFocus')}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
              <li>• Multimodal Foundation Models & Generative AI</li>
              <li>• Privacy-Preserving Machine Learning & Safe AI</li>
              <li>• Healthcare & Biomedical Data Intelligence</li>
              <li>• Satellite Remote Sensing & Climate Resilience</li>
              <li>• Autonomous Robotics & Field Perception</li>
              <li>• Smart Energy Systems & Microgrid Optimization</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Clean copyright (NO admin link visible to public!) */}
        <div style={{ paddingTop: '25px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          <div>{t('footer.copyright')}</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>ISO 9001:2015 Research Certified</span>
            <span>Open Science Compliant</span>
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
