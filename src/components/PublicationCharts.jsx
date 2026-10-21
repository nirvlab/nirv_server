import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react';

export default function PublicationCharts({ stats }) {
  const { lang, t } = useLanguage();

  if (!stats) return null;

  const { total = 0, total_citations = 0, by_year = [], by_type = [], by_ranking = [] } = stats;

  // Max value calculation for bar scales
  const maxYearCount = Math.max(...by_year.map(i => i.count), 1);
  const maxTypeCount = Math.max(...by_type.map(i => i.count), 1);
  const maxRankingCount = Math.max(...by_ranking.map(i => i.count), 1);

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '36px', marginBottom: '50px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Top 2 Big Numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', paddingBottom: '30px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)', marginTop: '4px' }}>
              {t('publications.statsTotal')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Được kiểm chứng từ CSDL</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FFF7E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={28} color="#D46B08" />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#D46B08', lineHeight: 1 }}>{total_citations.toLocaleString()}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)', marginTop: '4px' }}>
              {t('publications.statsCitations')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Google Scholar & Scopus</div>
          </div>
        </div>
      </div>

      {/* 3 Detailed Distribution Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', paddingTop: '32px' }}>
        {/* Chart 1: Publications by Year */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <BarChart3 size={18} color="var(--color-primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)' }}>
              {t('publications.statsByYear')}
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {by_year.map((item) => {
              const pct = (item.count / maxYearCount) * 100;
              return (
                <div key={item.year} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '42px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{item.year}</span>
                  <div style={{ flex: 1, backgroundColor: '#F0EEEE', borderRadius: '4px', height: '14px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: '4px',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                  <span style={{ width: '28px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Publications by Venue / Type */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Award size={18} color="var(--color-primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)' }}>
              {t('publications.statsByVenue')}
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {by_type.map((item) => {
              const pct = (item.count / maxTypeCount) * 100;
              return (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '90px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.type}>
                    {item.type}
                  </span>
                  <div style={{ flex: 1, backgroundColor: '#F0EEEE', borderRadius: '4px', height: '14px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: '#141719',
                        borderRadius: '4px',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                  <span style={{ width: '28px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: By Ranking Category */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Award size={18} color="#D46B08" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-main)' }}>
              {t('publications.statsByRanking')}
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {by_ranking.map((item) => {
              const pct = (item.count / maxRankingCount) * 100;
              return (
                <div key={item.ranking} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '70px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>{item.ranking}</span>
                  <div style={{ flex: 1, backgroundColor: '#F0EEEE', borderRadius: '4px', height: '14px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #EE0033, #FF5C7A)',
                        borderRadius: '4px',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                  <span style={{ width: '28px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
