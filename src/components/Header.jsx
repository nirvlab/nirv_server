import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

export default function Header() {
  const { lang, t, switchLanguage, routeMap } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: t('nav.about'), path: routeMap[lang].about },
    { label: t('nav.social'), path: routeMap[lang].social },
    { label: t('nav.news'), path: routeMap[lang].news },
    { label: t('nav.publications'), path: routeMap[lang].publications },
    { label: t('nav.team'), path: routeMap[lang].team }
  ];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 900,
          backgroundColor: '#FFFFFF',
          transition: 'all 0.3s ease',
          boxShadow: isScrolled ? '0 4px 18px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: isScrolled ? 'none' : '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--header-height)' }}>
          {/* Logo on Left */}
          <Link to={`/${lang}`} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/assets/logo_nav.svg"
              alt="NIRV Logo"
              style={{ height: '42px', width: 'auto', display: 'block' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            <ul style={{ display: 'flex', alignItems: 'center', gap: '26px', listStyle: 'none', margin: 0, padding: 0 }}>
              {navLinks.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === `/${lang}`}
                    style={({ isActive }) => ({
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                      padding: '8px 0',
                      position: 'relative',
                      display: 'inline-block'
                    })}
                    className="nav-link-item"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Language Switcher on Right */}
            <div style={{ position: 'relative', borderLeft: '1px solid var(--color-border)', paddingLeft: '24px' }}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--color-text-main)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FAFAFA'
                }}
                aria-label="Language Switcher"
              >
                <Globe size={15} color="var(--color-primary)" />
                <span>{lang === 'vi' ? 'VI' : 'EN'}</span>
                <ChevronDown size={14} />
              </button>

              {langDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--color-border)',
                    minWidth: '130px',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      switchLanguage('vi');
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      fontWeight: lang === 'vi' ? 700 : 500,
                      color: lang === 'vi' ? 'var(--color-primary)' : 'var(--color-text-main)',
                      backgroundColor: lang === 'vi' ? 'var(--color-primary-bg)' : 'transparent'
                    }}
                  >
                    Tiếng Việt (VI)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      fontWeight: lang === 'en' ? 700 : 500,
                      color: lang === 'en' ? 'var(--color-primary)' : 'var(--color-text-main)',
                      backgroundColor: lang === 'en' ? 'var(--color-primary-bg)' : 'transparent'
                    }}
                  >
                    English (EN)
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Right Controls: Language & Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }} className="mobile-controls">
            {/* Mobile Language Button */}
            <button
              type="button"
              onClick={() => switchLanguage(lang === 'vi' ? 'en' : 'vi')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-main)'
              }}
            >
              <Globe size={13} color="var(--color-primary)" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-main)'
              }}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 'var(--header-height)',
              left: 0,
              width: '100%',
              height: 'calc(100vh - var(--header-height))',
              backgroundColor: '#FFFFFF',
              zIndex: 899,
              padding: '24px',
              overflowY: 'auto',
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {navLinks.map((item) => (
                <li key={item.path} style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                  <NavLink
                    to={item.path}
                    end={item.path === `/${lang}`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'block',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)'
                    })}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                {lang === 'vi' ? 'CHỌN NGÔN NGỮ / LANGUAGE' : 'SELECT LANGUAGE'}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => switchLanguage('vi')}
                  className={lang === 'vi' ? 'btn-solid' : 'btn-pri'}
                  style={{ flex: 1, padding: '8px 16px' }}
                >
                  Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('en')}
                  className={lang === 'en' ? 'btn-solid' : 'btn-pri'}
                  style={{ flex: 1, padding: '8px 16px' }}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Media query for desktop nav */}
      <style>{`
        @media (min-width: 992px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-controls {
            display: none !important;
          }
        }
        .nav-link-item:hover {
          color: var(--color-primary) !important;
        }
        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background-color: var(--color-primary);
          transition: width 0.3s ease;
        }
        .nav-link-item.active::after,
        .nav-link-item:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  );
}
