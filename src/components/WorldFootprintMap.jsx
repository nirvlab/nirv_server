import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { visitedLocations as defaultLocations, footprintStats as defaultStats } from '../data/footprintData';
import worldMapPoints from '../data/worldMapPoints.json';
import AnimatedStat from './AnimatedStat';
import { Globe, MapPin, Calendar, Award, Users, ChevronRight, Sparkles, Filter, ExternalLink } from 'lucide-react';

export default function WorldFootprintMap() {
  const { lang, t } = useLanguage();
  const [locations, setLocations] = useState(defaultLocations);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocations[0]);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [filterRegion, setFilterRegion] = useState('all');
  const containerRef = useRef(null);

  // Load destinations dynamically from CMS settings
  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data?.footprint_destinations) {
          try {
            const parsed = JSON.parse(res.data.footprint_destinations);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLocations(parsed);
              setSelectedLocation(parsed[0]);
            }
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Compute live statistics based on real destinations
  const dynamicStats = useMemo(() => {
    const foreign = locations.filter(l => !l.isHome);
    const countries = new Set(locations.map(l => l.country_en || l.country_vi));
    const totalConf = foreign.reduce((sum, l) => sum + Number(l.conferencesCount || 1), 0);
    const totalPapers = foreign.reduce((sum, l) => sum + Number(l.papersCount || 1), 0);
    return {
      countriesCount: countries.size,
      conferencesCount: totalConf,
      papersPresented: totalPapers
    };
  }, [locations]);

  // Active location being displayed in the detail card
  const activeLocation = hoveredLocation || selectedLocation || locations[0];

  // Filter locations by region
  const filteredLocations = useMemo(() => {
    if (filterRegion === 'all') return locations;
    return locations.filter(loc => loc.region === filterRegion);
  }, [filterRegion, locations]);

  const regions = [
    { id: 'all', label_vi: 'Tất cả vùng đất', label_en: 'All Destinations' },
    { id: 'asia', label_vi: 'Đông Nam Á & Châu Á', label_en: 'SE Asia & Asia' },
    { id: 'americas', label_vi: 'Châu Mỹ', label_en: 'Americas' },
    { id: 'africa', label_vi: 'Châu Phi', label_en: 'Africa' },
  ];

  return (
    <section
      id="footprint-section"
      className="section"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'inline-block'
              }}
            />
            <span className="head-sub" style={{ margin: 0 }}>
              {lang === 'vi' ? 'VÙNG ĐẤT ĐÃ ĐẾN' : 'GLOBAL ACADEMIC FOOTPRINT'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 className="head-pri" style={{ marginBottom: '12px' }}>
                {lang === 'vi' ? 'Dấu ấn Báo cáo Khoa học & Hội nghị Quốc tế' : 'International Scientific Conferences & Academic Presence'}
              </h2>
              <p className="desc-intro" style={{ maxWidth: '820px', marginBottom: 0 }}>
                {lang === 'vi'
                  ? 'Cộng đồng NIRV tích cực tham gia báo cáo học thuật, trao đổi chuyên môn và xây dựng cầu nối nghiên cứu Trí tuệ Nhân tạo giữa Việt Nam và các diễn đàn khoa học uy tín toàn cầu.'
                  : 'NIRV actively participates, presents peer-reviewed research, and fosters international scientific partnerships in Artificial Intelligence worldwide.'}
              </p>
            </div>

            {/* Quick Stat Badges with YouTube Counter */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                backgroundColor: 'var(--color-bg-page)',
                padding: '14px 24px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}
            >
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.1 }}>
                  <AnimatedStat value={dynamicStats.countriesCount} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Quốc gia' : 'Countries'}
                </div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
                  <AnimatedStat value={dynamicStats.conferencesCount} suffix={dynamicStats.conferencesCount > 0 ? '+' : ''} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Hội nghị quốc tế' : 'Conferences'}
                </div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
                  <AnimatedStat value={dynamicStats.papersPresented} suffix={dynamicStats.papersPresented > 0 ? '+' : ''} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Báo cáo / Bài báo' : 'Presentations'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginRight: '6px' }}>
            <Filter size={15} /> {lang === 'vi' ? 'Khu vực:' : 'Region:'}
          </div>
          {regions.map((reg) => {
            const isActive = filterRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setFilterRegion(reg.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isActive ? 'var(--color-primary)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {lang === 'vi' ? reg.label_vi : reg.label_en}
              </button>
            );
          })}
        </div>

        {/* Interactive Map Canvas Container */}
        <div
          ref={containerRef}
          style={{
            backgroundColor: '#FAFAFC',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '24px 20px',
            position: 'relative',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Grid Watermark / Background Note */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block' }} />
            {lang === 'vi' ? 'Chấm đỏ tương tác: Nhấn hoặc rê chuột để xem chi tiết hội nghị' : 'Interactive pins: Click or hover to inspect conference reports'}
          </div>

          {/* SVG Dotted World Map */}
          <div style={{ width: '100%', position: 'relative' }}>
            <svg
              viewBox={`0 0 ${worldMapPoints.width} ${worldMapPoints.height}`}
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '620px'
              }}
              aria-label="NIRV World Footprint Interactive Map"
            >
              {/* 1. Base Dotted Matrix (Continents) */}
              <g fill="#D1D5DB">
                {worldMapPoints.points.map(([x, y], idx) => (
                  <circle
                    key={`dot-${idx}`}
                    cx={x}
                    cy={y}
                    r="0.28"
                  />
                ))}
              </g>

              {/* 2. Interactive Location Markers (Red Nodes matching reference design) */}
              {locations.map((loc) => {
                const isSelected = activeLocation.id === loc.id;
                const isMatchRegion = filterRegion === 'all' || loc.region === filterRegion;

                return (
                  <g
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    onMouseEnter={() => setHoveredLocation(loc)}
                    onMouseLeave={() => setHoveredLocation(null)}
                    style={{
                      cursor: 'pointer',
                      opacity: isMatchRegion ? 1 : 0.25,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    {/* Pulsing Sonar Ripple for Active or Home Pin */}
                    {(isSelected || loc.isHome) && (
                      <>
                        <circle
                          cx={loc.x}
                          cy={loc.y}
                          r="1.4"
                          fill="none"
                          stroke="var(--color-primary)"
                          className="map-pulse-ring"
                        />
                        <circle
                          cx={loc.x}
                          cy={loc.y}
                          r="2.2"
                          fill="none"
                          stroke="var(--color-primary)"
                          className="map-pulse-ring-delayed"
                        />
                      </>
                    )}

                    {/* Red Center Marker Dot */}
                    <circle
                      cx={loc.x}
                      cy={loc.y}
                      r={isSelected ? '0.95' : '0.65'}
                      fill="var(--color-primary)"
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? '0.35' : '0.2'}
                      style={{
                        transition: 'r 0.2s ease, stroke-width 0.2s ease',
                        filter: isSelected ? 'drop-shadow(0 0 2px rgba(238,0,51,0.6))' : 'none'
                      }}
                    />

                    {/* Invisible Larger Target Circle for Easy Hover / Touch */}
                    <circle
                      cx={loc.x}
                      cy={loc.y}
                      r="2.5"
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Location Detail Card (Glassmorphic Card Anchored inside Map) */}
          <div
            style={{
              marginTop: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '18px 22px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ flex: '1 1 540px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{activeLocation.flag}</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {lang === 'vi' ? activeLocation.country_vi : activeLocation.country_en}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>•</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {lang === 'vi' ? activeLocation.city_vi : activeLocation.city_en}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(238, 0, 51, 0.08)',
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {activeLocation.year}
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                {lang === 'vi' ? activeLocation.conference_vi : activeLocation.conference_en}
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-body)', margin: 0 }}>
                <strong style={{ color: 'var(--color-text-main)' }}>
                  {lang === 'vi' ? 'Báo cáo / Chủ đề:' : 'Topic / Report:'}
                </strong>{' '}
                {lang === 'vi' ? activeLocation.topic_vi : activeLocation.topic_en}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.82rem',
                color: 'var(--color-text-muted)',
                borderLeft: '1px solid var(--color-border)',
                paddingLeft: '18px',
                minWidth: '220px'
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-text-main)' }}>
                  {lang === 'vi' ? 'Vai trò:' : 'Role:'}
                </strong>{' '}
                {lang === 'vi' ? activeLocation.role_vi : activeLocation.role_en}
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-main)' }}>
                  {lang === 'vi' ? 'Đoàn công tác:' : 'Delegation:'}
                </strong>{' '}
                {lang === 'vi' ? activeLocation.delegation_vi : activeLocation.delegation_en}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Country Navigation Chips Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            {lang === 'vi' ? 'Quốc gia tiêu biểu đã báo cáo:' : 'Featured conference countries:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {filteredLocations.map((loc) => {
              const isSelected = activeLocation.id === loc.id;
              return (
                <button
                  type="button"
                  key={`chip-${loc.id}`}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setHoveredLocation(null);
                  }}
                  onMouseEnter={() => setHoveredLocation(loc)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(238, 0, 51, 0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{loc.flag}</span>
                  <span>{lang === 'vi' ? loc.country_vi : loc.country_en}</span>
                </button>
              );
            })}
            {locations.length <= 1 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginLeft: '6px' }}>
                • {lang === 'vi' ? 'Dữ liệu các chuyến công tác và báo cáo hội nghị quốc tế sẽ được cập nhật liên tục qua CMS khi đoàn khởi hành.' : 'Upcoming international conferences will be continuously updated via CMS.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
