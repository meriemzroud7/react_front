import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getEntretienById } from '../../services/apiServiceEntretien';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import { useEffect } from 'react';

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const userName = user?.prenom ? `${user.prenom} ${user.nom || ''}`.trim() : 'Utilisateur';

  const [entretien, setEntretien] = useState(null);

  useEffect(() => {
    getEntretienById(id).then((res) => setEntretien(res.data)).catch(console.error);
  }, [id]);

  const { localVideoRef, remoteVideoRef, connected, micOn, camOn, toggleMic, toggleCam } =
    useWebRTCInterview({ salleId: entretien?.salleId, userId, userName });

  function handleLeave() {
    navigate('/candidat/entretiens');
  }

  if (!entretien) return <p style={{ padding: '2rem' }}>Chargement de la salle d'entretien...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
      <div style={{ padding: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>{entretien.poste}</strong>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            {connected ? 'Connecté' : 'En attente du recruteur...'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#1e293b' }} />
        {!connected && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            En attente de l'autre participant...
          </div>
        )}
        <video ref={localVideoRef} autoPlay playsInline muted style={{
          position: 'absolute', bottom: 20, right: 20, width: 200, height: 150,
          borderRadius: 12, objectFit: 'cover', border: '2px solid white',
        }} />
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button onClick={toggleMic} style={controlBtnStyle(micOn)}>{micOn ? <FiMic /> : <FiMicOff />}</button>
        <button onClick={toggleCam} style={controlBtnStyle(camOn)}>{camOn ? <FiVideo /> : <FiVideoOff />}</button>
        <button onClick={handleLeave} style={{ ...controlBtnStyle(true), background: '#dc2626' }}>
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
}

function controlBtnStyle(active) {
  return {
    width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: active ? '#334155' : '#64748b', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
  };
}