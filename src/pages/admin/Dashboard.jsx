import React from 'react';
import {
  FiUsers, FiBriefcase, FiFileText, FiClipboard, FiCalendar,
  FiAward, FiActivity, FiArrowUp, FiArrowDown, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

const STATS = [
  { label: 'Utilisateurs', value: '1 284', delta: '+42', up: true, icon: <FiUsers />, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
  { label: 'Recruteurs', value: '96', delta: '+5', up: true, icon: <FiBriefcase />, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
  { label: 'Candidats', value: '1 152', delta: '+37', up: true, icon: <FiUsers />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { label: 'Entreprises', value: '58', delta: '+3', up: true, icon: <FiBriefcase />, color: '#be185d', bg: 'rgba(190,24,93,0.1)' },
  { label: 'Offres publiées', value: '213', delta: '+18', up: true, icon: <FiFileText />, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  { label: 'Candidatures', value: '3 407', delta: '+201', up: true, icon: <FiClipboard />, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  { label: 'Entretiens réalisés', value: '412', delta: '+29', up: true, icon: <FiCalendar />, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
  { label: 'Recrutements finalisés', value: '87', delta: '-2', up: false, icon: <FiAward />, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  { label: 'Utilisateurs actifs (30j)', value: '742', delta: '+64', up: true, icon: <FiActivity />, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
];

const BAR_DATA = [
  { month: 'Août', inscriptions: 62, candidatures: 210 },
  { month: 'Sep', inscriptions: 74, candidatures: 260 },
  { month: 'Oct', inscriptions: 58, candidatures: 245 },
  { month: 'Nov', inscriptions: 91, candidatures: 310 },
  { month: 'Déc', inscriptions: 70, candidatures: 288 },
  { month: 'Jan', inscriptions: 103, candidatures: 340 },
];
const MAXV = 340;

const ACTIVITIES = [
  { text: 'Sarra Chaari a publié une nouvelle offre "Développeur Full Stack"', time: 'Il y a 20 min' },
  { text: 'Nouvel utilisateur inscrit : Ahmed Maalej (Candidat)', time: 'Il y a 1h' },
  { text: 'Entreprise "InnovLab" en attente de vérification', time: 'Il y a 3h' },
  { text: 'Entretien terminé entre Mohamed Tlili et TechCorp Tunisie', time: 'Il y a 5h' },
];

const ALERTS = [
  { text: '3 entreprises en attente de vérification', level: 'amber' },
  { text: '1 offre signalée comme suspecte', level: 'red' },
  { text: 'Sauvegarde automatique effectuée avec succès', level: 'green' },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Tableau de bord</h1>
            <p className="rp-subtitle">Vue globale sur l'activité de la plateforme Fursa</p>
          </div>
        </div>
      </div>

      <div className="rp-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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

      <div className="rp-grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', marginBottom: '1.25rem' }}>
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Évolution — Inscriptions & Candidatures</span>
          </div>
          <div className="rp-card__body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: 180 }}>
              {BAR_DATA.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: '100%' }}>
                    <div title={`${d.inscriptions} inscriptions`} style={{ width: 14, borderRadius: 4, background: 'var(--primary)', height: `${(d.inscriptions / MAXV) * 100}%` }} />
                    <div title={`${d.candidatures} candidatures`} style={{ width: 14, borderRadius: 4, background: 'var(--accent)', height: `${(d.candidatures / MAXV) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{d.month}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--primary)', marginRight: 6 }} />Inscriptions</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--accent)', marginRight: 6 }} />Candidatures</span>
            </div>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Alertes système</span>
          </div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ALERTS.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', borderRadius: 10, background: 'var(--background)' }}>
                {a.level === 'red' ? <FiAlertTriangle color="var(--danger)" /> : a.level === 'green' ? <FiCheckCircle color="var(--success)" /> : <FiAlertTriangle color="var(--accent-dark)" />}
                <span style={{ fontSize: '0.82rem', color: 'var(--foreground)' }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-card__header">
          <span className="rp-card__title">Activités récentes</span>
        </div>
        <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {ACTIVITIES.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.9rem', borderBottom: i < ACTIVITIES.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{a.text}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
