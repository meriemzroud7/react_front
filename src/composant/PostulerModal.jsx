import React, { useEffect, useState } from 'react';
import { FiX, FiFileText, FiUploadCloud, FiSend, FiAlertCircle } from 'react-icons/fi';
import { getCvsByUser, downloadCvBlob } from '../services/apiServiceCv';
import CandidatureService from '../services/apiServiceCandidature';

export default function PostulerModal({ offreId, candidatId, onClose, onSuccess }) {
  const [cvs, setCvs] = useState([]);
  const [cvSelectionneId, setCvSelectionneId] = useState('');
  const [nouveauFichier, setNouveauFichier] = useState(null);
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const res = await getCvsByUser(candidatId);
        setCvs(res.data);
        const parDefaut = res.data.find((c) => c.isDefault) || res.data[0];
        if (parDefaut) setCvSelectionneId(parDefaut.id);
      } catch (err) {
        console.error('Erreur chargement des CV :', err);
      } finally {
        setLoadingCvs(false);
      }
    }
    charger();
  }, [candidatId]);

  const handleNouveauFichier = (e) => {
    const fichier = e.target.files[0];
    if (fichier) {
      setNouveauFichier(fichier);
      setCvSelectionneId('');
    }
  };

  const handlePostuler = async () => {
    setErreur('');

    if (!nouveauFichier && !cvSelectionneId) {
      setErreur("Merci de sélectionner ou d'importer un CV avant de postuler.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      let fichierAEnvoyer = nouveauFichier;

      // Si un CV existant est sélectionné (pas de nouveau fichier importé),
      // on le retélécharge depuis le serveur pour le renvoyer avec la candidature.
      if (!fichierAEnvoyer && cvSelectionneId) {
        const cvChoisi = cvs.find((c) => c.id === cvSelectionneId);
        const reponseBlob = await downloadCvBlob(cvSelectionneId);
        fichierAEnvoyer = new File([reponseBlob.data], cvChoisi?.fileName || 'cv.pdf', {
          type: 'application/pdf',
        });
      }

      await CandidatureService.postuler(candidatId, offreId, fichierAEnvoyer);
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'envoi de la candidature.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="rp-card"
        style={{ width: 460, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rp-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="rp-card__title">Postuler à cette offre</span>
          <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={onClose}>
            <FiX size={14} />
          </button>
        </div>

        <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
            Choisissez le CV à joindre à votre candidature.
          </p>

          {loadingCvs ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Chargement de vos CV...</p>
          ) : cvs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cvs.map((cv) => (
                <label
                  key={cv.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.65rem 0.85rem', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: cvSelectionneId === cv.id ? 'rgba(30,79,163,0.06)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="cv"
                    checked={cvSelectionneId === cv.id}
                    onChange={() => { setCvSelectionneId(cv.id); setNouveauFichier(null); }}
                  />
                  <FiFileText size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cv.fileName}</span>
                  {cv.isDefault && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginLeft: 'auto' }}>Par défaut</span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Aucun CV importé pour le moment.</p>
          )}

          <label
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.85rem', border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: nouveauFichier ? 'rgba(30,79,163,0.06)' : 'transparent',
            }}
          >
            <FiUploadCloud size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem' }}>
              {nouveauFichier ? nouveauFichier.name : 'Importer un nouveau CV pour cette candidature'}
            </span>
            <input type="file" accept=".pdf" onChange={handleNouveauFichier} style={{ display: 'none' }} />
          </label>

          {erreur && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.82rem' }}>
              <FiAlertCircle size={14} /> {erreur}
            </div>
          )}

          <button
            className="rp-btn rp-btn--primary"
            style={{ justifyContent: 'center' }}
            onClick={handlePostuler}
            disabled={envoiEnCours}
          >
            <FiSend /> {envoiEnCours ? 'Envoi en cours...' : 'Envoyer ma candidature'}
          </button>
        </div>
      </div>
    </div>
  );
}