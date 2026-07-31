import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import {
  getEntretienById, enregistrerNotes, enregistrerEvaluation, enregistrerDecision,
} from '../../services/apiServiceEntretien';

const CRITERES = [
  { key: 'communication', label: 'Communication' },
  { key: 'competencesTechniques', label: 'Compétences techniques' },
  { key: 'cultureEntreprise', label: "Adéquation culture d'entreprise" },
  { key: 'motivation', label: 'Motivation' },
  { key: 'presentation', label: 'Présentation' },
];

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: 'calc(100vh - 0px)' }}>
      {/* Colonne vidéo */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
        <div style={{ padding: '1rem', color: 'white' }}>
          <strong>{entretien.candidatNom}</strong> — {entretien.poste}
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            {connected ? 'Connecté' : 'En attente du candidat...'}
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#1e293b' }} />
          {!connected && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              En attente du candidat...
            </div>
          )}
          <video ref={localVideoRef} autoPlay playsInline muted style={{
            position: 'absolute', bottom: 20, right: 20, width: 180, height: 130,
            borderRadius: 12, objectFit: 'cover', border: '2px solid white',
          }} />
        </div>

        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={toggleMic} style={controlBtnStyle(micOn)}>{micOn ? <FiMic /> : <FiMicOff />}</button>
          <button onClick={toggleCam} style={controlBtnStyle(camOn)}>{camOn ? <FiVideo /> : <FiVideoOff />}</button>
          <button onClick={() => navigate('/recruteur/entretiens')} style={{ ...controlBtnStyle(true), background: '#dc2626' }}>
            <FiPhoneOff />
          </button>
        </div>
      </div>

      {/* Colonne notes / évaluation / décision */}
      <div style={{ borderLeft: '1px solid #eee', padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {entretien.questionsPreparees?.length > 0 && (
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Questions préparées</h4>
            <ul style={{ fontSize: '0.85rem', paddingLeft: 18 }}>
              {entretien.questionsPreparees.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        )}

        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Prenez vos notes pendant l'entretien..."
            style={{ width: '100%', minHeight: 120, padding: '0.6rem', borderRadius: 8, border: '1px solid #e0e4ec', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Évaluation</h4>
          {CRITERES.map((c) => (
            <div key={c.key} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                <span>{c.label}</span>
                <span>{evaluation[c.key]}/5</span>
              </div>
              <input
                type="range" min="0" max="5" value={evaluation[c.key]}
                onChange={(e) => handleCriteriaChange(c.key, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          ))}
          <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={handleSaveEvaluation} disabled={saving}>
            <FiSave size={13} /> {saving ? 'Enregistrement...' : 'Enregistrer l\'évaluation'}
          </button>
        </div>

        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Décision finale</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
  <button className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => handleDecision('RETENU')}>Retenir</button>
  <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={() => handleDecision('A_REVOIR')}>À revoir</button>
  <button className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => handleDecision('REFUSE')}>Refuser</button>
</div>
        </div>
      </div>
    </div>
  );
}

function controlBtnStyle(active) {
  return {
    width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: active ? '#334155' : '#64748b', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
  };
}