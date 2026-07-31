import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiBookmark } from 'react-icons/fi';
import { getOffresSauvegardees, retirerOffreSauvegardee } from '../../services/apiServiceOffresSauv';
import { getMatchScore } from '../../services/apiServiceOffres';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

const CONTRACT_LABELS = {
  CDI: 'CDI', CDD: 'CDD', STAGE: 'Stage', FREELANCE: 'Freelance', ALTERNANCE: 'Alternance',
};

function MatchScore({ value, size = 52 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        border: '2px solid var(--accent)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.28, fontWeight: 700, color: 'var(--accent-dark)', flexShrink: 0,
      }}
      title={`Score de correspondance: ${value}%`}
    >
      {Math.round(value)}%
    </div>
  );
}

function formaterDate(dateIso) {
  if (!dateIso) return '';
  const jours = Math.floor((Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24));
  if (jours === 0) return "Publiée aujourd'hui";
  if (jours === 1) return 'Publiée hier';
  return `Publiée il y a ${jours} jours`;
}

export default function SavedJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [scores, setScores] = useState({});
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      if (!user?.id) {
        setChargement(false);
        return;
      }
      try {
        const reponse = await getOffresSauvegardees(user.id);
        setJobs(reponse.data);

        const resultats = await Promise.allSettled(
          reponse.data.map((job) => getMatchScore(user.id, job.id))
        );
        const scoresMap = {};
        resultats.forEach((res, i) => {
          if (res.status === 'fulfilled') {
            scoresMap[reponse.data[i].id] = res.value.data.matchScore;
          }
        });
        setScores(scoresMap);
      } catch (err) {
        console.error('Erreur chargement des offres sauvegardées :', err);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [user]);

  const retirer = async (offreId) => {
    if (!user?.id) return;
    try {
      await retirerOffreSauvegardee(user.id, offreId);
      setJobs((prev) => prev.filter((j) => j.id !== offreId));
    } catch (err) {
      console.error('Erreur retrait offre sauvegardée :', err);
    }
  };

  if (chargement) return <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement de vos offres sauvegardées...</p>;

  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Offres sauvegardées</h1>
        <p className="rp-subtitle">{jobs.length} offre(s) en favoris</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {jobs.map((job) => (
          <div key={job.id} className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {job.logoEntreprise ? (
                <img
                  src={`${API_BASE_URL}${job.logoEntreprise}`}
                  alt={job.nomEntreprise}
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div className="rp-avatar" style={{ width: 48, height: 48, background: '#0f766e', fontSize: '0.9rem' }}>
                  {job.nomEntreprise?.substring(0, 2).toUpperCase() || '?'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <Link to={`/candidat/offres/${job.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)', textDecoration: 'none' }}>
                  {job.titre}
                </Link>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{job.nomEntreprise}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.4rem', fontSize: '0.76rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} />{job.localisation}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} />{formaterDate(job.dateCreation)}</span>
                </div>
                <div className="rp-tags" style={{ marginTop: '0.4rem' }}>
                  <span className="rp-badge rp-badge--blue">{CONTRACT_LABELS[job.typeContrat] || job.typeContrat}</span>
                </div>
              </div>
              {scores[job.id] !== undefined && <MatchScore value={scores[job.id]} size={52} />}
              <button
                className="rp-btn rp-btn--outline rp-btn--icon"
                onClick={() => retirer(job.id)}
                style={{ color: 'var(--accent-dark)', borderColor: 'var(--accent)' }}
                title="Retirer des favoris"
              >
                <FiBookmark size={14} />
              </button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem 0' }}>
            Vous n'avez sauvegardé aucune offre pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}