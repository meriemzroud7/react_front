import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiBookmark, FiSend, FiMessageCircle, FiFlag, FiArrowLeft } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { getOffreById, sauvegarderOffre, getMatchScore } from '../../services/apiServiceOffres';
import { useAuth } from '../../context/AuthContext'; // adapte le chemin si différent

const API_BASE_URL = 'http://localhost:8080';

// Sépare le texte "description" concaténé (Description + Missions + Niveau + Expérience + Salaire)
// en sous-parties, sans toucher au backend.
function parseOffreDescription(texte) {
  const resultat = { description: '', missions: '', niveauEtudes: '', experience: '', salaire: '' };
  if (!texte) return resultat;

  const marqueurs = [
    { cle: 'missions', label: '\n\nMissions:\n' },
    { cle: 'niveauEtudes', label: "\n\nNiveau d'études: " },
    { cle: 'experience', label: '\nExpérience requise: ' },
    { cle: 'salaire', label: '\nSalaire: ' },
  ];

  const positions = marqueurs
    .map((m) => ({ ...m, index: texte.indexOf(m.label) }))
    .filter((m) => m.index !== -1)
    .sort((a, b) => a.index - b.index);

  if (positions.length === 0) {
    resultat.description = texte.trim();
    return resultat;
  }

  resultat.description = texte.substring(0, positions[0].index).trim();

  positions.forEach((m, i) => {
    const debut = m.index + m.label.length;
    const fin = i + 1 < positions.length ? positions[i + 1].index : texte.length;
    resultat[m.cle] = texte.substring(debut, fin).trim();
  });

  return resultat;
}

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [matching, setMatching] = useState(null);
  const [chargementMatching, setChargementMatching] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const reponseOffre = await getOffreById(id);
        setJob(reponseOffre.data);

        if (user?.id) {
          setChargementMatching(true);
          const reponseMatching = await getMatchScore(user.id, id);
          setMatching(reponseMatching.data);
        }
      } catch (err) {
        console.error('Erreur chargement offre / matching :', err);
      } finally {
        setChargementMatching(false);
      }
    }
    charger();
  }, [id, user]);

  const sauvegarder = async () => {
    if (!user?.id) return;
    try {
      await sauvegarderOffre(user.id, id);
    } catch (err) {
      console.error('Erreur sauvegarde :', err);
    }
  };

  const formaterDate = (dateIso) => {
    if (!dateIso) return 'Non précisée';
    return new Date(dateIso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!job) return <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</p>;

  const parsed = parseOffreDescription(job.description);

  return (
    <div>
      <Link to="/candidat/offres" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1rem' }}>
        <FiArrowLeft /> Retour aux offres
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', gap: '1rem' }}>
              {job.logoEntreprise ? (
                <img
                  src={`${API_BASE_URL}${job.logoEntreprise}`}
                  alt={job.nomEntreprise}
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div className="rp-avatar" style={{ width: 56, height: 56, background: '#0f766e', fontSize: '1.1rem', flexShrink: 0 }}>
                  {job.nomEntreprise?.substring(0, 2).toUpperCase() || '?'}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>{job.titre}</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '2px 0 0' }}>{job.nomEntreprise}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} />{job.localisation}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={12} />Date limite : {formaterDate(job.dateExpiration)}</span>
                </div>
                <div className="rp-tags" style={{ marginTop: '0.6rem' }}>
                  <span className="rp-badge rp-badge--blue">{job.typeContrat}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__body">
              <h3 className="rp-section-title" style={{ marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: 1.6 }}>{parsed.description}</p>
            </div>
          </div>

          {parsed.missions && (
            <div className="rp-card">
              <div className="rp-card__body">
                <h3 className="rp-section-title" style={{ marginBottom: '0.5rem' }}>Missions</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{parsed.missions}</p>
              </div>
            </div>
          )}

          {(parsed.niveauEtudes || parsed.experience || parsed.salaire) && (
            <div className="rp-card">
              <div className="rp-card__body">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {parsed.niveauEtudes && (
                    <div>
                      <h3 className="rp-section-title" style={{ marginBottom: '0.3rem' }}>Niveau d'études</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{parsed.niveauEtudes}</p>
                    </div>
                  )}
                  {parsed.experience && (
                    <div>
                      <h3 className="rp-section-title" style={{ marginBottom: '0.3rem' }}>Expérience requise</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{parsed.experience}</p>
                    </div>
                  )}
                  {parsed.salaire && (
                    <div>
                      <h3 className="rp-section-title" style={{ marginBottom: '0.3rem' }}>Salaire</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{parsed.salaire}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {job.competencesRequises?.length > 0 && (
            <div className="rp-card">
              <div className="rp-card__body">
                <h3 className="rp-section-title" style={{ marginBottom: '0.5rem' }}>Compétences requises</h3>
                <div className="rp-tags">
                  {job.competencesRequises.map((c) => <span key={c} className="rp-tag">{c}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Analyse IA de compatibilité</div>

              {chargementMatching ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Calcul en cours...</p>
              ) : matching ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><MatchScore value={matching.matchScore} size={100} /></div>
                  <div style={{ textAlign: 'left', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>Compétences correspondantes</div>
                      <div className="rp-tags">{matching.matchingSkills.map((s) => <span key={s} className="rp-tag rp-tag--ok">{s}</span>)}</div>
                    </div>
                    {matching.missingSkills.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>Compétences manquantes</div>
                        <div className="rp-tags">{matching.missingSkills.map((s) => <span key={s} className="rp-tag rp-tag--missing">{s}</span>)}</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Probabilité d'être sélectionné(e)</span>
                      <span style={{ fontWeight: 800, color: 'var(--foreground)' }}>{matching.selectionProbability}%</span>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Connecte-toi pour voir ton score de compatibilité.</p>
              )}
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button className="rp-btn rp-btn--primary" style={{ justifyContent: 'center' }}><FiSend /> Postuler à cette offre</button>
              <button className="rp-btn rp-btn--outline" style={{ justifyContent: 'center' }} onClick={sauvegarder}><FiBookmark /> Sauvegarder</button>
              <button className="rp-btn rp-btn--outline" style={{ justifyContent: 'center' }}><FiMessageCircle /> Contacter le recruteur</button>
              <button className="rp-btn" style={{ justifyContent: 'center', background: 'none', color: 'var(--muted)', fontSize: '0.78rem' }}><FiFlag size={13} /> Signaler cette offre</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}