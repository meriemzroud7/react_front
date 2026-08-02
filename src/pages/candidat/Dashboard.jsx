import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiZap, FiBriefcase, FiCalendar, FiBookmark, FiLoader, FiAlertCircle } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../services/apiServiceUser';
import CandidatureService from '../../services/apiServiceCandidature';
import { getEntretiens } from '../../services/apiServiceEntretien';
import { getAllOffres, getOffresSauvegardees, getMatchScore } from '../../services/apiServiceOffres';

const API_BASE_URL = 'http://localhost:8080';

const SHORTCUTS = [
  { to: '/candidat/offres', icon: <FiSearch />, label: 'Rechercher des offres', color: '#1e4fa3', bg: 'rgba(30,79,163,0.08)' },
  { to: '/candidat/recommandations', icon: <FiZap />, label: 'Recommandations IA', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { to: '/candidat/candidatures', icon: <FiBriefcase />, label: 'Mes candidatures', color: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  { to: '/candidat/entretiens', icon: <FiCalendar />, label: 'Mes entretiens', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
];

// Champs pris en compte pour estimer le pourcentage de complétion du profil.
// (adapte cette liste si ton modèle User backend a des champs différents)
const COMPLETION_FIELDS = [
  'prenom', 'nom', 'telephone', 'adresse', 'formationOuPoste',
  'niveauEtude', 'ecole', 'typeContratRecherche', 'salaireSouhaite',
  'mobiliteGeographique', 'linkedin', 'image',
];

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function computeProfileCompletion(profile) {
  if (!profile) return 0;
  const total = COMPLETION_FIELDS.length + 1; // +1 pour les compétences
  let filled = COMPLETION_FIELDS.filter((f) => isFilled(profile[f])).length;
  if (isFilled(profile.competences)) filled += 1;
  return Math.round((filled / total) * 100);
}

function formatRelativeTime(dateIso) {
  if (!dateIso) return '';
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "À l'instant";
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ === 1) return 'Il y a 1 jour';
  return `Il y a ${diffJ} jours`;
}

function formatInterviewDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUT_CANDIDATURE_LABELS = {
  EN_ATTENTE: 'Candidature envoyée',
  ENTRETIEN: 'Convoqué(e) en entretien',
  RETENU: 'Candidature retenue',
  REFUSE: 'Candidature refusée',
};

const STATUT_ENTRETIEN_UPCOMING = ['PROGRAMME', 'CONFIRME'];

export default function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [offresIndex, setOffresIndex] = useState([]); // toutes les offres (pour résoudre entreprise/titre + recommandations)
  const [matchScores, setMatchScores] = useState({}); // offreId -> score
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, mesCandidatures, entretiensRes, savedRes, offresRes] = await Promise.all([
          getUserById(user.id),
          CandidatureService.getByCandidat(user.id),
          getEntretiens(),
          getOffresSauvegardees(user.id),
          getAllOffres(),
        ]);

        if (cancelled) return;

        setProfile(profileRes.data);
        setCandidatures(Array.isArray(mesCandidatures) ? mesCandidatures : []);
        setEntretiens((entretiensRes.data || []).filter((e) => e.candidatId === user.id));
        setSavedJobs(savedRes.data || []);
        setOffresIndex(offresRes.data || []);

        // Calcule le score IA pour les offres auxquelles le candidat n'a pas encore postulé,
        // afin d'alimenter le bloc "Recommandations IA" avec de vraies offres correspondantes.
        const offreIdsDejaPostulees = new Set((mesCandidatures || []).map((c) => c.offreId));
        const offresNonPostulees = (offresRes.data || []).filter((o) => !offreIdsDejaPostulees.has(o.id));

        const scoresResults = await Promise.allSettled(
          offresNonPostulees.map((o) => getMatchScore(user.id, o.id))
        );
        if (cancelled) return;

        const scoresMap = {};
        scoresResults.forEach((res, i) => {
          if (res.status === 'fulfilled') {
            scoresMap[offresNonPostulees[i].id] = res.value.data.matchScore;
          }
        });
        setMatchScores(scoresMap);
      } catch (err) {
        console.error('Erreur lors du chargement du tableau de bord :', err);
        if (!cancelled) setError('Impossible de charger vos données. Vérifie que le backend est bien lancé.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [user]);

  const offresById = useMemo(
    () => Object.fromEntries(offresIndex.map((o) => [o.id, o])),
    [offresIndex]
  );

  const candidaturesById = useMemo(
    () => Object.fromEntries(candidatures.map((c) => [c.id || c._id, c])),
    [candidatures]
  );

  // ── KPIs dérivés des vraies données ──────────────────────────
  const entretiensAVenir = useMemo(
    () => entretiens.filter((e) => STATUT_ENTRETIEN_UPCOMING.includes(e.statut)),
    [entretiens]
  );

  const stats = useMemo(() => [
    { icon: <FiBriefcase />, label: 'Candidatures envoyées', value: candidatures.length, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
    { icon: <FiZap />, label: "En cours d'analyse", value: candidatures.filter((c) => c.statut === 'EN_ATTENTE').length, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
    { icon: <FiCalendar />, label: 'Entretiens programmés', value: entretiensAVenir.length, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    { icon: <FiBookmark />, label: 'Offres sauvegardées', value: savedJobs.length, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  ], [candidatures, entretiensAVenir, savedJobs]);

  // ── Recommandations : top 3 offres non postulées par score IA décroissant ──
  const recommended = useMemo(() => {
    return offresIndex
      .filter((o) => matchScores[o.id] !== undefined)
      .sort((a, b) => matchScores[b.id] - matchScores[a.id])
      .slice(0, 3);
  }, [offresIndex, matchScores]);

  // ── Prochains entretiens, triés par date, enrichis avec l'entreprise via la candidature liée ──
  const upcomingInterviewsEnriched = useMemo(() => {
    return entretiensAVenir
      .map((e) => {
        const candidature = e.candidatureId ? candidaturesById[e.candidatureId] : null;
        const offre = candidature ? offresById[candidature.offreId] : null;
        return {
          ...e,
          nomEntreprise: offre?.nomEntreprise || '',
          logoEntreprise: offre?.logoEntreprise || null,
        };
      })
      .sort((a, b) => new Date(`${a.date}T${a.heure || '00:00'}`) - new Date(`${b.date}T${b.heure || '00:00'}`))
      .slice(0, 4);
  }, [entretiensAVenir, candidaturesById, offresById]);

  // ── Fil d'activité : combine candidatures + entretiens réels, triés par date décroissante ──
  const activityHistory = useMemo(() => {
    const fromCandidatures = candidatures.map((c) => {
      const offre = offresById[c.offreId];
      const statutLabel = STATUT_CANDIDATURE_LABELS[c.statut] || c.statut;
      return {
        label: `${statutLabel} — ${offre?.titre || 'Offre'}${offre?.nomEntreprise ? ` chez ${offre.nomEntreprise}` : ''}`,
        date: c.dateCandidature,
      };
    });
    const fromEntretiens = entretiens.map((e) => ({
      label: `Entretien ${e.statut === 'CONFIRME' ? 'confirmé' : e.statut === 'TERMINE' ? 'terminé' : 'programmé'} — ${e.poste || 'Poste'}`,
      date: e.date,
    }));
    return [...fromCandidatures, ...fromEntretiens]
      .filter((a) => a.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((a) => ({ label: a.label, time: formatRelativeTime(a.date) }));
  }, [candidatures, entretiens, offresById]);

  const profileCompletion = computeProfileCompletion(profile);
  const firstName = profile?.prenom || user?.prenom || '';

  if (loading) {
    return (
      <div className="rp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
        <FiLoader className="rp-spin" /> Chargement de votre tableau de bord...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
        <FiAlertCircle size={28} color="var(--danger, #dc2626)" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Tableau de bord</h1>
            <p className="rp-subtitle">Bonjour {firstName} 👋 — Voici un aperçu de votre recherche de stage</p>
          </div>
          <Link to="/candidat/offres" className="rp-btn rp-btn--primary">
            <FiSearch /> Rechercher des offres
          </Link>
        </div>
      </div>

      {/* Profile completion */}
      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card__body" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <MatchScore value={profileCompletion} size={68} label="Profil" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--foreground)' }}>Profil complété à {profileCompletion}%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              Complétez votre profil pour améliorer vos recommandations IA.
            </div>
          </div>
          <Link to="/candidat/profil" className="rp-btn rp-btn--outline rp-btn--sm">Compléter</Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="rp-stats">
        {stats.map((s, i) => (
          <div key={i} className="rp-stat">
            <div className="rp-stat__icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="rp-stat__value">{s.value}</div>
            <div className="rp-stat__label">{s.label}</div>
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
            {recommended.length === 0 && (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                Aucune recommandation disponible pour le moment.
              </div>
            )}
            {recommended.map((job) => (
              <Link key={job.id} to={`/candidat/offres/${job.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                borderRadius: 'var(--radius-sm)', textDecoration: 'none', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {job.logoEntreprise ? (
                  <img
                    src={`${API_BASE_URL}${job.logoEntreprise}`}
                    alt={job.nomEntreprise}
                    style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div className="rp-avatar" style={{ width: 38, height: 38, background: '#1e4fa3', fontSize: '0.75rem' }}>
                    {job.nomEntreprise?.substring(0, 2).toUpperCase() || '?'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.titre}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{job.nomEntreprise}{job.localisation ? ` · ${job.localisation}` : ''}</div>
                </div>
                <MatchScore value={Math.round(matchScores[job.id])} size={42} />
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
            {upcomingInterviewsEnriched.length === 0 && (
              <div style={{ padding: '1rem 0.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                Aucun entretien programmé pour le moment.
              </div>
            )}
            {upcomingInterviewsEnriched.map((it) => (
              <div key={it.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                borderRadius: 'var(--radius-sm)', marginBottom: '0.35rem',
                background: 'var(--background)', border: '1px solid var(--border-light)',
              }}>
                <div className="rp-avatar" style={{ width: 36, height: 36, background: '#7c3aed', fontSize: '0.75rem', flexShrink: 0 }}>
                  {(it.nomEntreprise || it.poste || '?').substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.nomEntreprise || it.poste}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{it.poste}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--primary)' }}>{formatInterviewDate(it.date)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{it.heure}</div>
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
            {activityHistory.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                Aucune activité récente.
              </div>
            )}
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