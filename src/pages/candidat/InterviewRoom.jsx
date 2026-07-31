import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getEntretienById } from '../../services/apiServiceEntretien';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import { useEffect } from 'react';
import '../../styles/salle-entretien.css';

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
    <div className="se-video-col" style={{ height: '100vh' }}>
      <div className="se-video-header">
        <div className="se-candidate-info">
          <div className="se-avatar"><FiBriefcase size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div className="se-candidate-name">{entretien.poste}</div>
            <div className="se-candidate-poste">Entretien avec le recruteur</div>
          </div>
        </div>
        <div className={`se-status ${connected ? 'se-status--connected' : 'se-status--waiting'}`}>
          <span className="se-status__dot" />
          {connected ? 'Connecté' : 'En attente du recruteur...'}
        </div>
      </div>

      <div className="se-video-stage">
        <video ref={remoteVideoRef} autoPlay playsInline className="se-video-remote" />
        {!connected && (
          <div className="se-video-waiting">
            <div className="se-video-waiting__icon"><FiBriefcase /></div>
            <div className="se-video-waiting__text">En attente du recruteur...</div>
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
        <button onClick={handleLeave} className="se-control-btn se-control-btn--danger" title="Quitter l'entretien">
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
}