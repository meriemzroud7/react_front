import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiUsers, FiCalendar, FiCheckCircle, FiAward,
  FiPlusCircle, FiCpu, FiBarChart2,
} from 'react-icons/fi';
import { getOffresByRecruteur } from '../../services/apiServiceOffres';
import CandidatureService from '../../services/apiServiceCandidature';
import { getEntretiens } from '../../services/apiServiceEntretien';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', className: 'amber' },
  RETENU: { label: 'Retenu', className: 'green' },
  ENTRETIEN: { label: 'Entretien', className: 'blue' },
  REFUSE: { label: 'Refusé', className: 'red' },
};

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];
const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const SHORTCUTS = [
  { to: '/recruteur/offres/nouvelle', icon: <FiPlusCircle />, label: 'Créer une offre', color: '#1e4fa3', bg: 'rgba(30,79,163,0.08)' },
  { to: '/recruteur/candidatures', icon: <FiUsers />, label: 'Voir candidatures', color: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  { to: '/recruteur/analyse-ia', icon: <FiCpu />, label: 'Analyse IA', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { to: '/recruteur/rapports', icon: <FiBarChart2 />, label: 'Rapports', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
];

function getAvatarColor(seed = '') {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}
function getUserDisplayName(user) {
  if (!user) return 'Candidat';
  const first = user.prenom || user.firstName;
  const last = user.nom || user.lastName;
  if (first && last) return `${first} ${last}`;
  return first || user.email?.split('@')[0] || 'Candidat';
}
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}
function formatEntretienDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === tomorrow.toDateString()) return 'Demain';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const recruteurId = user?.id || user?._id;

  const [offres, setOffres] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recruteurId) return;

    (async () => {
      try {
        setLoading(true);
        const [offresRes, allCandidatures, entretiensRes] = await Promise.all([
          getOffresByRecruteur(recruteurId),
          CandidatureService.getAll(),
          getEntretiens(),
        ]);

        const myOffres = offresRes.data;
        const myOffreIds = new Set(myOffres.map((o) => o.id || o._id));
        const myCandidatures = allCandidatures.filter((c) => myOffreIds.has(c.offreId));
        const myCandidatureIds = new Set(myCandidatures.map((c) => c.id || c._id));
        const myEntretiens = entretiensRes.data.filter((e) => myCandidatureIds.has(e.candidatureId));

        setOffres(myOffres);
        setCandidatures(myCandidatures);
        setEntretiens(myEntretiens);

        const users = await CandidatureService.getUsersByIds(myCandidatures.map((c) => c.candidatId));
        setUsersMap(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [recruteurId]);

  const stats = useMemo(() => {
    const retenus = candidatures.filter((c) => c.statut === 'RETENU').length;
    const finalises = entretiens.filter((e) => e.statut === 'TERMINE' && e.decision === 'RETENU').length;
    return [
      { label: 'Offres publiées', value: offres.length, icon: <FiBriefcase />, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
      { label: 'Candidatures reçues', value: candidatures.length, icon: <FiUsers />, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
      { label: 'Entretiens programmés', value: entretiens.length, icon: <FiCalendar />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
      { label: 'Candidats retenus', value: retenus, icon: <FiCheckCircle />, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      { label: 'Recrutements finalisés', value: finalises, icon: <FiAward />, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    ];
  }, [offres, candidatures, entretiens]);

  const recentApps = useMemo(() => {
    return [...candidatures]
      .sort((a, b) => new Date(b.dateCandidature) - new Date(a.dateCandidature))
      .slice(0, 5)
      .map((c) => {
        const nom = getUserDisplayName(usersMap[c.candidatId]);
        const offre = offres.find((o) => (o.id || o._id) === c.offreId);
        const statutCfg = STATUT_CONFIG[c.statut] || { label: c.statut, className: 'gray' };
        return {
          id: c.id || c._id,
          name: nom,
          role: offre?.titre || '—',
          statut: statutCfg,
          avatar: getInitials(nom),
          color: getAvatarColor(nom),
          time: timeAgo(c.dateCandidature),
        };
      });
  }, [candidatures, offres, usersMap]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return entretiens
      .filter((e) => e.statut === 'PROGRAMME' || e.statut === 'CONFIRME')
      .filter((e) => e.date && new Date(e.date) >= new Date(now.toDateString()))
      .sort((a, b) => `${a.date}${a.heure}`.localeCompare(`${b.date}${b.heure}`))
      .slice(0, 4)
      .map((e) => ({
        id: e.id,
        name: e.candidatNom || 'Candidat',
        role: e.poste || '—',
        date: formatEntretienDate(e.date),
        time: e.heure,
        type: e.type === 'EN_LIGNE' ? 'En ligne' : 'Présentiel',
        avatar: getInitials(e.candidatNom || ''),
        color: getAvatarColor(e.candidatNom || ''),
      }));
  }, [entretiens]);

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTHS_SHORT[d.getMonth()], val: 0 });
    }
    candidatures.forEach((c) => {
      if (!c.dateCandidature) return;
      const d = new Date(c.dateCandidature);
      const bucket = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
      if (bucket) bucket.val += 1;
    });
    const max = Math.max(1, ...months.map((m) => m.val));
    return { months, max };
  }, [candidatures]);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Tableau de bord</h1>
            <p className="rp-subtitle">Bonjour {user?.prenom || 'Recruteur'} 👋 — Voici un aperçu de vos activités de recrutement</p>
          </div>
          <Link to="/recruteur/offres/nouvelle" className="rp-btn rp-btn--primary">
            <FiPlusCircle /> Nouvelle offre
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '1rem 0' }}>Chargement du tableau de bord...</p>
      ) : (
        <>
          <div className="rp-stats">
            {stats.map((s, i) => (
              <div key={i} className="rp-stat">
                <div className="rp-stat__icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="rp-stat__value">{s.value}</div>
                <div className="rp-stat__label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="rp-card">
              <div className="rp-card__header">
                <span className="rp-card__title">Candidatures récentes</span>
                <Link to="/recruteur/candidatures" className="rp-btn rp-btn--outline rp-btn--sm">Voir tout</Link>
              </div>
              {recentApps.length === 0 ? (
                <p style={{ padding: '1.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Aucune candidature reçue pour le moment.</p>
              ) : (
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr><th>Candidat</th><th>Poste</th><th>Statut</th><th>Reçu</th></tr>
                    </thead>
                    <tbody>
                      {recentApps.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div className="rp-avatar" style={{ width: 32, height: 32, background: r.color, fontSize: '0.7rem' }}>{r.avatar}</div>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{r.role}</td>
                          <td><span className={`rp-badge rp-badge--${r.statut.className}`}>{r.statut.label}</span></td>
                          <td style={{ color: 'var(--muted-light)', fontSize: '0.78rem' }}>{r.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rp-card">
              <div className="rp-card__header">
                <span className="rp-card__title">Entretiens à venir</span>
                <Link to="/recruteur/calendrier" className="rp-btn rp-btn--outline rp-btn--sm">Calendrier</Link>
              </div>
              <div style={{ padding: '0.75rem' }}>
                {upcoming.length === 0 ? (
                  <p style={{ padding: '0.75rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Aucun entretien à venir.</p>
                ) : upcoming.map((u) => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.35rem',
                    background: 'var(--background)', border: '1px solid var(--border-light)',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="rp-card">
              <div className="rp-card__header">
                <span className="rp-card__title">Évolution des candidatures</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>6 derniers mois</span>
              </div>
              <div className="rp-card__body">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: 130 }}>
                  {chartData.months.map((b, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>{b.val}</span>
                      <div style={{
                        width: '100%', borderRadius: '6px 6px 0 0',
                        background: i === chartData.months.length - 1
                          ? 'linear-gradient(180deg, var(--primary-light), var(--primary))'
                          : 'rgba(30,79,163,0.15)',
                        height: `${(b.val / chartData.max) * 100}px`,
                        transition: 'height 0.4s ease',
                      }} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Raccourcis</span></div>
              <div className="rp-card__body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {SHORTCUTS.map((s, i) => (
                  <Link key={i} to={s.to} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '1.25rem 0.75rem', borderRadius: 'var(--radius)',
                    background: s.bg, border: `1.5px solid ${s.bg}`, cursor: 'pointer',
                    textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ color: s.color, fontSize: '1.3rem' }}>{s.icon}</div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: s.color, textAlign: 'center' }}>{s.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}