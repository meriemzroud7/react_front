import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiMessageSquare, FiPhoneOff } from 'react-icons/fi';
import { upcomingInterviews } from '../../data/candidatMockData';

export default function InterviewRoom() {
  const { id } = useParams();
  const it = upcomingInterviews.find((i) => String(i.id) === id) || upcomingInterviews[0];
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ended, setEnded] = useState(false);

  if (ended) {
    return (
      <div>
        <div className="rp-header">
          <h1 className="rp-title">Entretien terminé</h1>
          <p className="rp-subtitle">{it.company} — {it.role}</p>
        </div>
        <div className="rp-card" style={{ maxWidth: 460, margin: '2rem auto', textAlign: 'center' }}>
          <div className="rp-card__body">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--foreground)' }}>Merci pour votre participation !</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Votre présence a bien été confirmée. Le recruteur vous communiquera sa décision prochainement via la messagerie.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Salle d'entretien en ligne</h1>
        <p className="rp-subtitle">{it.company} — {it.role} · {it.date} à {it.time}</p>
      </div>

      <div style={{ background: '#0f1f3d', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', padding: '1rem' }}>
          <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>{camOn ? 'Votre caméra' : 'Caméra désactivée'}</span>
            <span style={{ position: 'absolute', top: 10, left: 10, fontSize: '0.7rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: 100 }}>00:12:34</span>
          </div>
          <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>Recruteur</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', paddingBottom: '1.5rem' }}>
          <button onClick={() => setMicOn((v) => !v)} className="rp-btn rp-btn--icon" style={{ width: 44, height: 44, borderRadius: '50%', background: micOn ? 'rgba(255,255,255,0.1)' : 'var(--danger)', color: '#fff' }}>
            {micOn ? <FiMic size={18} /> : <FiMicOff size={18} />}
          </button>
          <button onClick={() => setCamOn((v) => !v)} className="rp-btn rp-btn--icon" style={{ width: 44, height: 44, borderRadius: '50%', background: camOn ? 'rgba(255,255,255,0.1)' : 'var(--danger)', color: '#fff' }}>
            {camOn ? <FiVideo size={18} /> : <FiVideoOff size={18} />}
          </button>
          <button className="rp-btn rp-btn--icon" style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
            <FiMonitor size={18} />
          </button>
          <button className="rp-btn rp-btn--icon" style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
            <FiMessageSquare size={18} />
          </button>
          <button onClick={() => setEnded(true)} className="rp-btn rp-btn--icon" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--danger)', color: '#fff' }}>
            <FiPhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
