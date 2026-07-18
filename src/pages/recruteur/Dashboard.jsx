import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiUsers, FiCalendar, FiCheckCircle, FiAward,
  FiArrowUp, FiArrowDown, FiPlusCircle, FiCpu, FiBarChart2
} from 'react-icons/fi';

const STATS = [
  { label: 'Offres publiées', value: '24', delta: '+3', up: true, icon: <FiBriefcase />, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
  { label: 'Candidatures reçues', value: '187', delta: '+21', up: true, icon: <FiUsers />, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
  { label: 'Entretiens programmés', value: '12', delta: '+4', up: true, icon: <FiCalendar />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { label: 'Candidats retenus', value: '38', delta: '+7', up: true, icon: <FiCheckCircle />, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  { label: 'Recrutements finalisés', value: '9', delta: '-1', up: false, icon: <FiAward />, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
];

const RECENT_APPS = [
  { name: 'Yasmine Ben Ali', role: 'Software Engineer', score: 94, status: 'Retenu', statusClass: 'green', avatar: 'YB', color: '#1e4fa3', time: 'Il y a 1h' },
  { name: 'Ahmed Maalej', role: 'Data Analyst', score: 87, status: 'En attente', statusClass: 'amber', avatar: 'AM', color: '#0f766e', time: 'Il y a 2h' },
  { name: 'Sarra Chaari', role: 'DevOps Engineer', score: 91, status: 'Entretien', statusClass: 'blue', avatar: 'SC', color: '#7c3aed', time: 'Il y a 4h' },
  { name: 'Mohamed Tlili', role: 'UX Designer', score: 78, status: 'Refusé', statusClass: 'red', avatar: 'MT', color: '#be185d', time: 'Il y a 6h' },
];

const UPCOMING = [
  { name: 'Yasmine Ben Ali', role: 'Software Engineer', date: 'Aujourd\'hui', time: '14:00', type: 'En ligne', avatar: 'YB', color: '#1e4fa3' },
  { name: 'Sarra Chaari', role: 'DevOps Engineer', date: 'Demain', time: '10:30', type: 'Présentiel', avatar: 'SC', color: '#7c3aed' },
  { name: 'Fathi Hamdi', role: 'Product Manager', date: '22 Jan', time: '15:00', type: 'En ligne', avatar: 'FH', color: '#0f766e' },
];

const BAR_DATA = [
  { month: 'Août', val: 12, max: 25 }, { month: 'Sep', val: 18, max: 25 }, { month: 'Oct', val: 15, max: 25 },
  { month: 'Nov', val: 22, max: 25 }, { month: 'Déc', val: 19, max: 25 }, { month: 'Jan', val: 25, max: 25 },
];

const SHORTCUTS = [
  { to: '/recruteur/offres/nouvelle', icon: <FiPlusCircle />, label: 'Créer une offre', color: '#1e4fa3', bg: 'rgba(30,79,163,0.08)' },
  { to: '/recruteur/candidatures', icon: <FiUsers />, label: 'Voir candidatures', color: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  { to: '/recruteur/analyse-ia', icon: <FiCpu />, label: 'Analyse IA', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { to: '/recruteur/rapports', icon: <FiBarChart2 />, label: 'Rapports', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
];

export default function Dashboard() {
  return (
    <div>
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Tableau de bord</h1>
            <p className="rp-subtitle">Bonjour Mariem 👋 — Voici un aperçu de vos activités de recrutement</p>
          </div>
          <Link to="/recruteur/offres/nouvelle" className="rp-btn rp-btn--primary">
            <FiPlusCircle /> Nouvelle offre
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="rp-stats">
        {STATS.map((s, i) => (
          <div key={i} className="rp-stat">
            <div className="rp-stat__icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="rp-stat__value">{s.value}</div>
            <div className="rp-stat__label">{s.label}</div>
            <div className={`rp-stat__delta rp-stat__delta--${s.up ? 'up' : 'down'}`}>
              {s.up ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
              {s.delta} ce mois
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Recent applications */}
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Candidatures récentes</span>
            <Link to="/recruteur/candidatures" className="rp-btn rp-btn--outline rp-btn--sm">Voir tout</Link>
          </div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Poste</th>
                  <th>Score IA</th>
                  <th>Statut</th>
                  <th>Reçu</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_APPS.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="rp-avatar" style={{ width: 32, height: 32, background: r.color, fontSize: '0.7rem' }}>{r.avatar}</div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{r.role}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div className="rp-progress" style={{ width: 60 }}>
                          <div className="rp-progress__fill" style={{ width: `${r.score}%`, background: r.score >= 90 ? 'var(--success)' : r.score >= 75 ? 'var(--primary)' : 'var(--accent)' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.score}</span>
                      </div>
                    </td>
                    <td><span className={`rp-badge rp-badge--${r.statusClass}`}>{r.status}</span></td>
                    <td style={{ color: 'var(--muted-light)', fontSize: '0.78rem' }}>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming interviews */}
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Entretiens à venir</span>
            <Link to="/recruteur/calendrier" className="rp-btn rp-btn--outline rp-btn--sm">Calendrier</Link>
          </div>
          <div style={{ padding: '0.75rem' }}>
            {UPCOMING.map((u, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                marginBottom: '0.35rem',
                background: 'var(--background)',
                border: '1px solid var(--border-light)'
              }}>
                <div className="rp-avatar" style={{ width: 36, height: 36, background: u.color, fontSize: '0.75rem', flexShrink: 0 }}>{u.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{u.role}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>{u.date}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{u.time}</div>
                  <span className="rp-badge rp-badge--blue" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', marginTop: '0.2rem' }}>{u.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Chart */}
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Évolution des candidatures</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>6 derniers mois</span>
          </div>
          <div className="rp-card__body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: 130 }}>
              {BAR_DATA.map((b, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>{b.val}</span>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: i === BAR_DATA.length - 1
                      ? 'linear-gradient(180deg, var(--primary-light), var(--primary))'
                      : 'rgba(30,79,163,0.15)',
                    height: `${(b.val / b.max) * 100}px`,
                    transition: 'height 0.4s ease'
                  }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{b.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick shortcuts */}
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Raccourcis</span>
          </div>
          <div className="rp-card__body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {SHORTCUTS.map((s, i) => (
              <Link key={i} to={s.to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '1.25rem 0.75rem', borderRadius: 'var(--radius)',
                background: s.bg, border: `1.5px solid ${s.bg}`, cursor: 'pointer',
                textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s'
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
