import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiDownload, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiArrowLeft, FiCheck, FiX, FiMessageSquare, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import { getUserById } from '../../services/apiServiceUser';
import { getCvsByUser, downloadCv } from '../../services/apiServiceCv';
import { getOffreById } from '../../services/apiServiceOffres';
import { getEntretiens } from '../../services/apiServiceEntretien';
import CandidatureService from '../../services/apiServiceCandidature';

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];

const STATUT_CANDIDATURE = {
  EN_ATTENTE: { label: 'En attente', className: 'amber' },
  RETENU: { label: 'Retenu', className: 'green' },
  ENTRETIEN: { label: 'Entretien', className: 'blue' },
  REFUSE: { label: 'Refusé', className: 'red' },
};

const STATUT_ENTRETIEN = {
  PROGRAMME: { label: 'Programmé', className: 'blue' },
  CONFIRME: { label: 'Confirmé', className: 'green' },
  TERMINE: { label: 'Terminé', className: 'gray' },
  ANNULE: { label: 'Annulé', className: 'red' },
};

// Le modèle User peut utiliser des noms de champs différents selon ton backend,
// on essaie plusieurs variantes courantes - ajuste si besoin.
function getField(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return '';
}

function getInitials(nom = '', prenom = '') {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || '?';
}

function getAvatarColor(seed = '') {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TABS = [
  { key: 'profil', label: 'Profil' },
  { key: 'ia', label: 'Analyse IA' },
  { key: 'historique', label: 'Historique' },
];

export default function ProfilCandidat() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cv, setCv] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState('profil');

  // --- Chargement du vrai profil depuis le backend ---
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, cvsRes, candidaturesBrutes, entretiensRes] = await Promise.all([
        getUserById(id),
        getCvsByUser(id).catch(() => ({ data: [] })),
        CandidatureService.getByCandidat(id).catch(() => []),
        getEntretiens().catch(() => ({ data: [] })),
      ]);

      setUser(userRes.data);

      const cvs = Array.isArray(cvsRes.data) ? cvsRes.data : [];
      setCv(cvs.find((c) => c.isDefault) || cvs[0] || null);

      const listeCandidatures = Array.isArray(candidaturesBrutes) ? candidaturesBrutes : [];
      const candidaturesAvecOffre = await Promise.all(
        listeCandidatures.map(async (c) => {
          try {
            const { data: offre } = await getOffreById(c.offreId);
            return { ...c, offreTitre: offre?.titre || 'Offre indisponible' };
          } catch {
            return { ...c, offreTitre: 'Offre indisponible' };
          }
        })
      );
      candidaturesAvecOffre.sort((a, b) => new Date(b.dateCandidature) - new Date(a.dateCandidature));
      setCandidatures(candidaturesAvecOffre);

      const toutesLesInterviews = Array.isArray(entretiensRes.data) ? entretiensRes.data : [];
      setEntretiens(toutesLesInterviews.filter((e) => e.candidatId === id));
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le profil de ce candidat. Vérifie que le backend est bien lancé.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const nom = getField(user, 'nom', 'lastName', 'lastname');
  const prenom = getField(user, 'prenom', 'firstName', 'firstname');
  const nomComplet = `${prenom} ${nom}`.trim() || 'Candidat (info indisponible)';
  const email = getField(user, 'email');
  const telephone = getField(user, 'telephone', 'phone', 'phoneNumber');
  const ville = getField(user, 'ville', 'adresse', 'address') || 'Non renseignée';
  const dispo = getField(user, 'disponibilite', 'mobiliteGeographique') || 'Non renseignée';
  const titre = getField(user, 'formationOuPoste') || 'Titre professionnel non renseigné';
  const competences = user?.competences?.length ? user.competences : (cv?.competences || []);
  const langues = user?.langues || cv?.langues || null;
  const certifications = user?.certifications || cv?.certifications || [];

  const etudes = useMemo(() => {
    if (cv?.diplomes?.length) return cv.diplomes.map((d) => ({ diplome: d }));
    if (user?.niveauEtude || user?.ecole) {
      return [{ diplome: user?.niveauEtude || 'Diplôme non précisé', ecole: user?.ecole }];
    }
    return [];
  }, [cv, user]);

  const experiences = cv?.experiences?.length ? cv.experiences : [];

  // Dernière candidature = celle utilisée pour les actions rapides (statut, entretien...)
  const derniereCandidature = candidatures[0] || null;
  const statutCfg = derniereCandidature
    ? STATUT_CANDIDATURE[derniereCandidature.statut] || { label: derniereCandidature.statut, className: 'amber' }
    : null;

  const meilleurScore = useMemo(() => {
    const scores = candidatures.map((c) => c.scoreIA).filter((s) => s != null);
    return scores.length ? Math.max(...scores) : null;
  }, [candidatures]);

  const handleDownloadCv = () => {
    if (!cv) return;
    downloadCv(cv.id, cv.fileName);
  };

  const handleContacter = () => {
    navigate('/recruteur/messagerie', { state: { candidatId: id } });
  };

  const handleEntretien = () => {
    navigate('/recruteur/entretiens', { state: { preselectCandidatureId: derniereCandidature?.id } });
  };

  const handleStatutChange = async (nouveauStatut) => {
    if (!derniereCandidature) return;
    setActionLoading(true);
    try {
      const updated = await CandidatureService.updateStatut(derniereCandidature.id, nouveauStatut);
      setCandidatures((prev) => prev.map((c) => (c.id === derniereCandidature.id ? { ...c, ...updated } : c)));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
        <FiLoader className="rp-spin" /> Chargement du profil...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
        <FiAlertCircle size={28} color="var(--danger, #dc2626)" />
        <p>{error || "Candidat introuvable."}</p>
        <button className="rp-btn rp-btn--outline" onClick={fetchAll}>Réessayer</button>
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <Link to="/recruteur/candidatures" className="rp-btn rp-btn--outline rp-btn--sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        <FiArrowLeft size={13} /> Retour aux candidatures
      </Link>

      {/* Hero card */}
      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card__body">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div className="rp-avatar" style={{ width: 80, height: 80, background: getAvatarColor(nomComplet), fontSize: '1.4rem', flexShrink: 0, borderRadius: 20 }}>
              {getInitials(nom, prenom)}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{nomComplet}</h2>
                {statutCfg && <span className={`rp-badge rp-badge--${statutCfg.className}`}>{statutCfg.label}</span>}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{titre}</p>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiMail size={13} />{email || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiPhone size={13} />{telephone || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiMapPin size={13} />{ville}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiCalendar size={13} />Dispo: {dispo}</span>
              </div>
            </div>
            {/* Scores */}
            <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{meilleurScore != null ? meilleurScore : '—'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Meilleur score IA</div>
              </div>
              {cv?.qualityScore != null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)' }}>{cv.qualityScore}%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Qualité du CV</div>
                </div>
              )}
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
              <button className="rp-btn rp-btn--primary rp-btn--sm" onClick={handleEntretien}><FiCalendar size={13} /> Entretien</button>
              <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={handleDownloadCv} disabled={!cv}><FiDownload size={13} /> Télécharger CV</button>
              <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={handleContacter}><FiMessageSquare size={13} /> Contacter</button>
              <button className="rp-btn rp-btn--success rp-btn--sm" onClick={() => handleStatutChange('RETENU')} disabled={actionLoading || !derniereCandidature}><FiCheck size={13} /> Embaucher</button>
              <button className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => handleStatutChange('REFUSE')} disabled={actionLoading || !derniereCandidature}><FiX size={13} /> Rejeter</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-light)', padding: '0 1.25rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.85rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === t.key ? 700 : 500, fontSize: '0.875rem',
              color: tab === t.key ? 'var(--primary)' : 'var(--muted)',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'color 0.15s', fontFamily: 'var(--font)'
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'profil' && (
        <div className="rp-grid-2" style={{ alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Études */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Formation</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {etudes.length > 0 ? etudes.map((e, i) => (
                  <div key={i} style={{ paddingLeft: '0.75rem', borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.diplome}</div>
                    {e.ecole && <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{e.ecole}</div>}
                  </div>
                )) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted-light)' }}>Aucune formation renseignée.</span>
                )}
              </div>
            </div>

            {/* Langues */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Langues</span></div>
              <div className="rp-card__body">
                {langues ? (
                  <span style={{ fontSize: '0.875rem' }}>{Array.isArray(langues) ? langues.join(', ') : langues}</span>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted-light)' }}>Non renseignées.</span>
                )}
              </div>
            </div>

            {/* Certifs */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Certifications</span></div>
              <div className="rp-card__body">
                {certifications.length > 0 ? (
                  <div className="rp-tags">
                    {certifications.map(cert => <span key={cert} className="rp-tag rp-tag--amber">{cert}</span>)}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted-light)' }}>Aucune certification renseignée.</span>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Expériences */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Expériences professionnelles</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {experiences.length > 0 ? experiences.map((exp, i) => (
                  <div key={i} style={{ paddingLeft: '0.75rem', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{exp}</div>
                  </div>
                )) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted-light)' }}>Aucune expérience détectée sur le CV.</span>
                )}
              </div>
            </div>

            {/* Compétences */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Compétences techniques</span></div>
              <div className="rp-card__body">
                {competences.length > 0 ? (
                  <div className="rp-tags">{competences.map(s => <span key={s} className="rp-tag">{s}</span>)}</div>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted-light)' }}>Aucune compétence renseignée.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'historique' && (
        <div className="rp-grid-2" style={{ alignItems: 'start' }}>
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Candidatures</span></div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead><tr><th>Offre</th><th>Date</th><th>Statut</th></tr></thead>
                <tbody>
                  {candidatures.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>Aucune candidature.</td></tr>
                  )}
                  {candidatures.map((ca) => {
                    const cfg = STATUT_CANDIDATURE[ca.statut] || { label: ca.statut, className: 'amber' };
                    return (
                      <tr key={ca.id}>
                        <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>{ca.offreTitre}</td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{formatDate(ca.dateCandidature)}</td>
                        <td><span className={`rp-badge rp-badge--${cfg.className}`}>{cfg.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Entretiens</span></div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead><tr><th>Date</th><th>Type</th><th>Statut</th></tr></thead>
                <tbody>
                  {entretiens.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>Aucun entretien.</td></tr>
                  )}
                  {entretiens.map((e) => {
                    const cfg = STATUT_ENTRETIEN[e.statut] || { label: e.statut, className: 'gray' };
                    return (
                      <tr key={e.id}>
                        <td style={{ fontSize: '0.82rem' }}>{formatDate(e.date)}{e.heure ? ` · ${e.heure}` : ''}</td>
                        <td style={{ fontSize: '0.82rem' }}>{e.type === 'EN_LIGNE' ? 'En ligne' : 'Présentiel'}</td>
                        <td><span className={`rp-badge rp-badge--${cfg.className}`}>{cfg.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'ia' && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          <Link
            to="/recruteur/analyse-ia"
            state={{ candidatId: id, candidatureId: derniereCandidature?.id }}
            className="rp-btn rp-btn--primary"
          >
            Voir l'analyse IA complète
          </Link>
        </div>
      )}
    </div>
  );
}