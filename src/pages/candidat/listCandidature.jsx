import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiXCircle } from 'react-icons/fi';
import CandidatureService from '../../services/apiServiceCandidature';
import { getOffreById, getMatchScore } from '../../services/apiServiceOffres';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

const STATUT_LABELS = {
  EN_ATTENTE: { label: 'Envoyée', classe: 'gray' },
  ENTRETIEN: { label: 'Entretien', classe: 'blue' },
  RETENU: { label: 'Retenu', classe: 'green' },
  REFUSE: { label: 'Refusée', classe: 'red' },
};

function formaterDate(dateIso) {
  if (!dateIso) return '';
  return new Date(dateIso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ListCandidature() {
  const { user } = useAuth();
  const [candidatures, setCandidatures] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      if (!user?.id) {
        setChargement(false);
        return;
      }
      try {
        const brutes = await CandidatureService.getByCandidat(user.id);

        const enrichies = await Promise.allSettled(
          brutes.map((c) => getOffreById(c.offreId))
        );

        // Pour les candidatures sans score IA sauvegardé (scoreIA null),
        // on le calcule à la volée via le même endpoint que "Rechercher des offres".
        const scoresARecalculer = await Promise.allSettled(
          brutes.map((c) =>
            c.scoreIA == null ? getMatchScore(user.id, c.offreId) : Promise.resolve(null)
          )
        );

        const resultat = brutes.map((c, i) => {
          const offre = enrichies[i].status === 'fulfilled' ? enrichies[i].value.data : null;
          const scoreCalcule = scoresARecalculer[i].status === 'fulfilled' ? scoresARecalculer[i].value?.data?.matchScore : null;

          return {
            ...c,
            titre: offre?.titre || 'Offre indisponible',
            nomEntreprise: offre?.nomEntreprise || '',
            logoEntreprise: offre?.logoEntreprise || null,
            scoreAffiche: c.scoreIA != null ? c.scoreIA : scoreCalcule,
          };
        });

        setCandidatures(resultat);
      } catch (err) {
        console.error('Erreur chargement des candidatures :', err);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Retirer cette candidature ?')) return;
    try {
      await CandidatureService.delete(id);
      setCandidatures((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Erreur suppression candidature :', err);
      alert("Erreur lors de la suppression de la candidature.");
    }
  };

  if (chargement) return <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement de vos candidatures...</p>;

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Mes candidatures</h1>
            <p className="rp-subtitle">{candidatures.length} candidature(s) au total</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Poste / Entreprise</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Score IA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidatures.map((c) => {
                const statutInfo = STATUT_LABELS[c.statut] || { label: c.statut, classe: 'gray' };
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {c.logoEntreprise ? (
                          <img
                            src={`${API_BASE_URL}${c.logoEntreprise}`}
                            alt={c.nomEntreprise}
                            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div className="rp-avatar" style={{ width: 32, height: 32, background: '#0f766e', fontSize: '0.7rem' }}>
                            {c.nomEntreprise?.substring(0, 2).toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <Link to={`/candidat/candidatures/${c.id}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)', textDecoration: 'none' }}>
                            {c.titre}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.nomEntreprise}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{formaterDate(c.dateCandidature)}</td>
                    <td><span className={`rp-badge rp-badge--${statutInfo.classe}`}>{statutInfo.label}</span></td>
                    <td>
                      {c.scoreAffiche != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div className="rp-progress" style={{ width: 60 }}>
                            <div
                              className="rp-progress__fill"
                              style={{
                                width: `${c.scoreAffiche}%`,
                                background: c.scoreAffiche >= 90 ? 'var(--success)' : c.scoreAffiche >= 75 ? 'var(--primary)' : 'var(--accent)',
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{Math.round(c.scoreAffiche)}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted-light)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="rp-table__actions">
                        <Link to={`/candidat/candidatures/${c.id}`} className="rp-btn rp-btn--outline rp-btn--icon"><FiEye size={14} /></Link>
                        <button className="rp-btn rp-btn--danger rp-btn--icon" onClick={() => handleDelete(c.id)}>
                          <FiXCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {candidatures.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                    Vous n'avez postulé à aucune offre pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}