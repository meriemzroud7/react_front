import React, { useState } from 'react';
import { FiDownload, FiTrendingUp, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';

const MONTHLY = [
  { month: 'Juil', recrutements: 4, candidatures: 62, entretiens: 12 },
  { month: 'Août', recrutements: 3, candidatures: 48, entretiens: 9 },
  { month: 'Sep', recrutements: 6, candidatures: 87, entretiens: 18 },
  { month: 'Oct', recrutements: 5, candidatures: 73, entretiens: 14 },
  { month: 'Nov', recrutements: 8, candidatures: 110, entretiens: 22 },
  { month: 'Déc', recrutements: 4, candidatures: 58, entretiens: 10 },
  { month: 'Jan', recrutements: 9, candidatures: 187, entretiens: 32 },
];

const DEPTS = [
  { name: 'IT / Tech', count: 42, pct: 45, color: '#1e4fa3' },
  { name: 'Data & IA', count: 18, pct: 19, color: '#7c3aed' },
  { name: 'Design / UX', count: 12, pct: 13, color: '#0891b2' },
  { name: 'Marketing', count: 15, pct: 16, color: '#d97706' },
  { name: 'Produit', count: 7, pct: 7, color: '#be185d' },
];

const SOURCES = [
  { name: 'Candidature directe', pct: 54, color: '#1e4fa3' },
  { name: 'LinkedIn', pct: 22, color: '#0A66C2' },
  { name: 'Recommandation', pct: 14, color: '#0f766e' },
  { name: 'Jobboards', pct: 10, color: '#d97706' },
];

const maxCands = Math.max(...MONTHLY.map(m => m.candidatures));
const maxRec = Math.max(...MONTHLY.map(m => m.recrutements));

export default function Rapports() {
  const [period, setPeriod] = useState('7m');

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Rapports & Statistiques</h1>
            <p className="rp-subtitle">Analyse complète de vos performances de recrutement</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', background: 'var(--border-light)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
              {['3m', '7m', '1an'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '0.35rem 0.75rem', border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.78rem', fontFamily: 'var(--font)',
                  background: period === p ? '#fff' : 'transparent',
                  color: period === p ? 'var(--primary)' : 'var(--muted)', transition: 'all 0.15s'
                }}>{p}</button>
              ))}
            </div>
            <button className="rp-btn rp-btn--outline"><FiDownload /> PDF</button>
            <button className="rp-btn rp-btn--outline"><FiDownload /> Excel</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: <FiCheckCircle />, val: 9, label: 'Recrutements finalisés', delta: '+3 vs mois dernier', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { icon: <FiUsers />, val: '187', label: 'Candidatures reçues', delta: '+21 vs mois dernier', color: '#1e4fa3', bg: 'rgba(30,79,163,0.08)' },
          { icon: <FiClock />, val: '18j', label: 'Délai moyen recrutement', delta: '-3j vs mois dernier', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
          { icon: <FiTrendingUp />, val: '78%', label: 'Taux d\'acceptation', delta: '+5% vs mois dernier', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
        ].map((k, i) => (
          <div key={i} className="rp-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.3rem 0' }}>{k.label}</div>
            <div style={{ fontSize: '0.72rem', color: k.color, fontWeight: 600 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="rp-grid-2" style={{ marginBottom: '1.25rem', alignItems: 'start' }}>
        {/* Candidatures chart */}
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Évolution mensuelle</span>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} />Candidatures</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)', display: 'inline-block' }} />Recrutements</span>
            </div>
          </div>
          <div className="rp-card__body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: 160 }}>
              {MONTHLY.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', height: 130 }}>
                    <div style={{ flex: 1, background: 'rgba(30,79,163,0.2)', borderRadius: '4px 4px 0 0', height: `${(m.candidatures / maxCands) * 100}%`, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, var(--primary-light), var(--primary))', borderRadius: '4px 4px 0 0', opacity: i === MONTHLY.length - 1 ? 1 : 0.5 }} />
                    </div>
                    <div style={{ flex: 1, background: 'var(--success)', borderRadius: '4px 4px 0 0', height: `${(m.recrutements / maxRec) * 100}%`, opacity: i === MONTHLY.length - 1 ? 1 : 0.5 }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Répartition by dept */}
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Répartition par département</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {DEPTS.map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                  <span style={{ color: 'var(--muted)' }}>{d.count} candidats · {d.pct}%</span>
                </div>
                <div className="rp-progress" style={{ height: 8 }}>
                  <div className="rp-progress__fill" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sources + Funnel */}
      <div className="rp-grid-2" style={{ alignItems: 'start' }}>
        {/* Sources */}
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Sources de candidatures</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {SOURCES.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>{s.pct}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>{s.name}</div>
                  <div className="rp-progress" style={{ height: 6 }}>
                    <div className="rp-progress__fill" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment funnel */}
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Entonnoir de recrutement</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Candidatures reçues', val: 187, pct: 100, color: '#1e4fa3' },
              { label: 'Profils présélectionnés', val: 68, pct: 36, color: '#0891b2' },
              { label: 'Entretiens réalisés', val: 32, pct: 17, color: '#7c3aed' },
              { label: 'Candidats retenus', val: 15, pct: 8, color: '#d97706' },
              { label: 'Offres acceptées', val: 9, pct: 5, color: '#16a34a' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 130, fontSize: '0.78rem', color: 'var(--muted)', flexShrink: 0 }}>{f.label}</div>
                <div style={{ flex: 1 }}>
                  <div className="rp-progress" style={{ height: 20, borderRadius: 6 }}>
                    <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.4rem', transition: 'width 0.6s ease' }}>
                      <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 700 }}>{f.val}</span>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', width: 32, textAlign: 'right', flexShrink: 0 }}>{f.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
