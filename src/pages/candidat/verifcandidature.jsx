import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiXCircle, FiFileText, FiArrowLeft } from 'react-icons/fi';
import CandidatureService from '../../services/apiServiceCandidature';
import { getOffreById } from '../../services/apiServiceOffres';

const STATUT_LABELS = {
  EN_ATTENTE: { label: 'Envoyée', classe: 'gray' },
  ENTRETIEN: { label: 'Entretien', classe: 'blue' },
  RETENU: { label: 'Retenu', classe: 'green' },
  REFUSE: { label: 'Refusée', classe: 'red' },
};

function formaterDate(dateIso) {
  if (!dateIso) return '';
  return new Date(dateIso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Construit les étapes du suivi en fonction du statut réel de la candidature
function construireEtapes(candidature) {
  const { statut, dateCandidature, scoreIA } = candidature;
  const estRefuse = statut === 'REFUSE';
  const estRetenu = statut === 'RETENU';
  const estEntretien = statut === 'ENTRETIEN' || estRetenu;
  const decisionPrise = estRetenu || estRefuse;

  return [
    {
      titre: 'Candidature envoyée',
      done: true,
      date: formaterDate(dateCandidature),
    },
    {
      titre: 'Analyse IA du profil',
      done: scoreIA != null,
      date: scoreIA != null ? formaterDate(dateCandidature) : 'En attente',
    },
    {
      titre: 'Entretien planifié',
      done: estEntretien,
      date: estEntretien ? 'Confirmé par le recruteur' : 'En attente',
    },
    {
      titre: decisionPrise ? (estRetenu ? 'Décision finale : Retenu(e)' : 'Décision finale : Refusée') : 'Décision finale',
      done: decisionPrise,
      enErreur: estRefuse,
      date: decisionPrise ? formaterDate(dateCandidature) : 'En attente',
    },
  ];
}

export default function VerifCandidature() {
  const { id } = useParams();
  const [candidature, setCandidature] = useState(null);
  const [offre, setOffre] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const c = await CandidatureService.getById(id);
        setCandidature(c);

        if (c.offreId) {
          const reponseOffre = await getOffreById(c.offreId);
          setOffre(reponseOffre.data);
        }
      } catch (err) {
        console.error('Erreur chargement candidature :', err);
        setErreur("Impossible de charger cette candidature.");
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [id]);

  if (chargement) return <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</p>;
  if (erreur || !candidature) return <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>{erreur}</p>;

  const statutInfo = STATUT_LABELS[candidature.statut] || { label: candidature.statut, classe: 'gray' };
  const etapes = construireEtapes(candidature);

  return (
    <div>
      <Link to="/candidat/candidatures" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1rem' }}>
        <FiArrowLeft /> Retour à mes candidatures
      </Link>

      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Suivi de candidature</h1>
            <p className="rp-subtitle">{offre?.titre || 'Offre'} — {offre?.nomEntreprise || ''}</p>
          </div>
          <span className={`rp-badge rp-badge--${statutInfo.classe}`}>{statutInfo.label}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Étapes du recrutement</span></div>
          <div className="rp-card__body">
            {etapes.map((etape, i) => (
              <div key={etape.titre} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {etape.enErreur
                    ? <FiXCircle size={20} color="var(--danger)" />
                    : etape.done
                      ? <FiCheckCircle size={20} color="var(--success)" />
                      : <FiCircle size={20} color="var(--border)" />}
                  {i < etapes.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 32, margin: '4px 0', background: etape.done ? 'var(--success)' : 'var(--border)' }} />
                  )}
                </div>
                <div style={{ paddingBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: etape.done ? 'var(--foreground)' : 'var(--muted-light)' }}>{etape.titre}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{etape.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Documents envoyés</span></div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              {candidature.cvFileName ? (
                <a
                  href={CandidatureService.getCvDownloadUrl(candidature.cvFileName)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--foreground)', textDecoration: 'none' }}
                >
                  <FiFileText color="var(--primary)" /> {candidature.cvOriginalName || 'CV.pdf'}
                </a>
              ) : (
                <span style={{ color: 'var(--muted-light)' }}>Aucun document joint.</span>
              )}
            </div>
          </div>

          {candidature.scoreIA != null && (
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Score IA</span></div>
              <div className="rp-card__body" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="rp-progress" style={{ flex: 1 }}>
                  <div
                    className="rp-progress__fill"
                    style={{
                      width: `${candidature.scoreIA}%`,
                      background: candidature.scoreIA >= 90 ? 'var(--success)' : candidature.scoreIA >= 75 ? 'var(--primary)' : 'var(--accent)',
                    }}
                  />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{candidature.scoreIA}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}