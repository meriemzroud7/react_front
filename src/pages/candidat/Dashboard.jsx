import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiSearch, FiZap, FiBriefcase, FiCalendar, FiVideo } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { candidate, dashboardStats, activityHistory, upcomingInterviews, jobs } from '../../data/candidatMockData';

const SHORTCUTS = [
  { to: '/candidat/offres', icon: <FiSearch />, label: 'Rechercher des offres', color: '#1e4fa3', bg: 'rgba(30,79,163,0.08)' },
  { to: '/candidat/recommandations', icon: <FiZap />, label: 'Recommandations IA', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { to: '/candidat/candidatures', icon: <FiBriefcase />, label: 'Mes candidatures', color: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  { to: '/candidat/entretiens', icon: <FiCalendar />, label: 'Mes entretiens', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
];

export default function Dashboard() {
  const recommended = [...jobs].sort((a, b) => b.match - a.match).slice(0, 3);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Tableau de bord</h1>
            <p className="rp-subtitle">Bonjour {candidate.firstName} 👋 — Voici un aperçu de votre recherche de stage</p>
          </div>
          <Link to="/candidat/offres" className="rp-btn rp-btn--primary">
            <FiSearch /> Rechercher des offres
          </Link>
        </div>
      </div>

      {/* Profile completion */}
      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card__body" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <MatchScore value={candidate.profileCompletion} size={68} label="Profil" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--foreground)' }}>Profil complété à {candidate.profileCompletion}%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              Complétez votre profil pour améliorer vos recommandations IA.
            </div>
          </div>
          <Link to="/candidat/profil" className="rp-btn rp-btn--outline rp-btn--sm">Compléter</Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="rp-stats">
        {dashboardStats.map((s, i) => (
          <div key={i} className="rp-stat">
            <div className="rp-stat__icon" style={{ background: s.bg, color: s.color }}>
              {i === 0 ? <FiBriefcase /> : i === 1 ? <FiZap /> : i === 2 ? <FiCalendar /> : i === 3 ? <FiSearch /> : <FiVideo />}
            </div>
            <div className="rp-stat__value">{s.value}</div>
            <div className="rp-stat__label">{s.label}</div>
            <div className={`rp-stat__delta rp-stat__delta--${s.up ? 'up' : 'down'}`}>
              {s.up ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
              {s.delta} ce mois
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Recommendations */}
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Recommandations IA</span>
            <Link to="/candidat/recommandations" className="rp-btn rp-btn--outline rp-btn--sm">Voir tout</Link>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {recommended.map((job) => (
              <Link key={job.id} to={`/candidat/offres/${job.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                borderRadius: 'var(--radius-sm)', textDecoration: 'none', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="rp-avatar" style={{ width: 38, height: 38, background: job.color, fontSize: '0.75rem' }}>{job.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.role}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{job.company} · {job.city}</div>
                </div>
                <MatchScore value={job.match} size={42} />
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming interviews */}
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Prochains entretiens</span>
            <Link to="/candidat/entretiens" className="rp-btn rp-btn--outline rp-btn--sm">Voir tout</Link>
          </div>
          <div style={{ padding: '0.75rem' }}>
            {upcomingInterviews.map((it) => (
              <div key={it.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                borderRadius: 'var(--radius-sm)', marginBottom: '0.35rem',
                background: 'var(--background)', border: '1px solid var(--border-light)',
              }}>
                <div className="rp-avatar" style={{ width: 36, height: 36, background: it.color, fontSize: '0.75rem', flexShrink: 0 }}>{it.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.company}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{it.role}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--primary)' }}>{it.date}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{it.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Activity */}
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Historique des activités</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activityHistory.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.82rem', paddingBottom: '0.6rem', borderBottom: i < activityHistory.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <span style={{ color: 'var(--foreground)' }}>{a.label}</span>
                <span style={{ color: 'var(--muted-light)', flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Raccourcis</span></div>
          <div className="rp-card__body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {SHORTCUTS.map((s, i) => (
              <Link key={i} to={s.to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '1.25rem 0.75rem', borderRadius: 'var(--radius)',
                background: s.bg, border: `1.5px solid ${s.bg}`, cursor: 'pointer',
                textDecoration: 'none', transition: 'transform 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ color: s.color, fontSize: '1.3rem' }}>{s.icon}</div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: s.color, textAlign: 'center' }}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
