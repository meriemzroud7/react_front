import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiSave,
  FiUser, FiFileText, FiStar, FiCheckSquare, FiHelpCircle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import {
  getEntretienById, enregistrerNotes, enregistrerEvaluation, enregistrerDecision,
} from '../../services/apiServiceEntretien';
import '../../styles/salle-entretien.css';

const CRITERES = [
  { key: 'communication', label: 'Communication' },
  { key: 'competencesTechniques', label: 'Compétences techniques' },
  { key: 'cultureEntreprise', label: "Adéquation culture d'entreprise" },
  { key: 'motivation', label: 'Motivation' },
  { key: 'presentation', label: 'Présentation' },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

export default function SalleEntretien() {
  const [params] = useSearchParams();
  const entretienId = params.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const userName = user?.prenom ? `${user.prenom} ${user.nom || ''}`.trim() : 'Recruteur';

  const [entretien, setEntretien] = useState(null);
  const [notes, setNotes] = useState('');
  const [evaluation, setEvaluation] = useState({
    communication: 0, competencesTechniques: 0, cultureEntreprise: 0, motivation: 0, presentation: 0,
  });
  const [saving, setSaving] = useState(false);
  const notesTimeoutRef = useRef(null);

  useEffect(() => {
    if (!entretienId) return;
    getEntretienById(entretienId).then((res) => {
      setEntretien(res.data);
      setNotes(res.data.notes || '');
      setEvaluation(res.data.evaluation || evaluation);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entretienId]);

  const { localVideoRef, remoteVideoRef, connected, micOn, camOn, toggleMic, toggleCam } =
    useWebRTCInterview({ salleId: entretien?.salleId, userId, userName });

  // Auto-save des notes après une pause de saisie
  function handleNotesChange(value) {
    setNotes(value);
    clearTimeout(notesTimeoutRef.current);
    notesTimeoutRef.current = setTimeout(() => {
      enregistrerNotes(entretienId, value).catch(console.error);
    }, 1000);
  }

  function handleCriteriaChange(key, value) {
    setEvaluation((prev) => ({ ...prev, [key]: Number(value) }));
  }

  async function handleSaveEvaluation() {
    try {
      setSaving(true);
      await enregistrerEvaluation(entretienId, evaluation);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDecision(decision) {
    try {
      await enregistrerDecision(entretienId, decision);
      navigate('/recruteur/entretiens');
    } catch (err) {
      console.error(err);
      alert("Échec de l'enregistrement de la décision.");
    }
  }

  if (!entretien) return <p style={{ padding: '2rem' }}>Chargement de la salle...</p>;

  return (
    <div className="se-wrap">
      {/* Colonne vidéo */}
      <div className="se-video-col">
        <div className="se-video-header">
          <div className="se-candidate-info">
            <div className="se-avatar">{getInitials(entretien.candidatNom)}</div>
            <div style={{ minWidth: 0 }}>
              <div className="se-candidate-name">{entretien.candidatNom}</div>
              <div className="se-candidate-poste">{entretien.poste}</div>
            </div>
          </div>
          <div className={`se-status ${connected ? 'se-status--connected' : 'se-status--waiting'}`}>
            <span className="se-status__dot" />
            {connected ? 'Connecté' : 'En attente du candidat...'}
          </div>
        </div>

        <div className="se-video-stage">
          <video ref={remoteVideoRef} autoPlay playsInline className="se-video-remote" />
          {!connected && (
            <div className="se-video-waiting">
              <div className="se-video-waiting__icon"><FiUser /></div>
              <div className="se-video-waiting__text">En attente du candidat...</div>
            </div>
          )}
          <video ref={localVideoRef} autoPlay playsInline muted className="se-video-local" />
        </div>

        <div className="se-controls">
          <button onClick={toggleMic} className={`se-control-btn ${!micOn ? 'se-control-btn--off' : ''}`} title={micOn ? 'Couper le micro' : 'Activer le micro'}>
            {micOn ? <FiMic /> : <FiMicOff />}
          </button>
          <button onClick={toggleCam} className={`se-control-btn ${!camOn ? 'se-control-btn--off' : ''}`} title={camOn ? 'Couper la caméra' : 'Activer la caméra'}>
            {camOn ? <FiVideo /> : <FiVideoOff />}
          </button>
          <button onClick={() => navigate('/recruteur/entretiens')} className="se-control-btn se-control-btn--danger" title="Quitter l'entretien">
            <FiPhoneOff />
          </button>
        </div>
      </div>

      {/* Colonne notes / évaluation / décision */}
      <div className="se-side">
        {entretien.questionsPreparees?.length > 0 && (
          <div className="se-card">
            <h4 className="se-card__title"><FiHelpCircle size={14} /> Questions préparées</h4>
            <ul className="se-questions-list">
              {entretien.questionsPreparees.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        )}

        <div className="se-card">
          <h4 className="se-card__title"><FiFileText size={14} /> Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Prenez vos notes pendant l'entretien..."
            className="rp-input rp-input--textarea"
            style={{ minHeight: 120 }}
          />
        </div>

        <div className="se-card">
          <h4 className="se-card__title"><FiStar size={14} /> Évaluation</h4>
          {CRITERES.map((c) => (
            <div key={c.key} className="se-criteria">
              <div className="se-criteria__head">
                <span className="se-criteria__label">{c.label}</span>
                <span className="se-criteria__value">{evaluation[c.key]}/5</span>
              </div>
              <input
                type="range" min="0" max="5" value={evaluation[c.key]}
                onChange={(e) => handleCriteriaChange(c.key, e.target.value)}
                className="se-slider"
                style={{ '--se-fill': `${(evaluation[c.key] / 5) * 100}%` }}
              />
            </div>
          ))}
          <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={handleSaveEvaluation} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
            <FiSave size={13} /> {saving ? 'Enregistrement...' : "Enregistrer l'évaluation"}
          </button>
        </div>

        <div className="se-card">
          <h4 className="se-card__title"><FiCheckSquare size={14} /> Décision finale</h4>
          <div className="se-decision-row">
            <button className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => handleDecision('RETENU')}>Retenir</button>
            <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={() => handleDecision('A_REVOIR')}>À revoir</button>
            <button className="se-btn-refuse" onClick={() => handleDecision('REFUSE')}>Refuser</button>
          </div>
        </div>
      </div>
    </div>
  );
}