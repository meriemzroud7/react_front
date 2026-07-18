import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiVideo, FiVideoOff, FiMic, FiMicOff, FiMonitor, FiMessageSquare,
  FiArrowLeft, FiSend, FiStar, FiCheckCircle
} from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';

const QUESTIONS = [
  'Parlez-nous de votre expérience avec React et Node.js.',
  'Comment gérez-vous la gestion d\'état dans une application complexe ?',
  'Décrivez un projet difficile que vous avez mené à bien.',
  'Quelle est votre approche pour les code reviews ?',
  'Où vous voyez-vous dans 3 ans ?',
];

const MESSAGES = [
  { from: 'bot', text: 'Entretien démarré. Yasmine Ben Ali est connectée.' },
  { from: 'yasmine', text: 'Bonjour, je suis prête pour l\'entretien.' },
  { from: 'mariem', text: 'Bonjour Yasmine ! Nous allons commencer.' },
];

export default function SalleEntretien() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [messages, setMessages] = useState(MESSAGES);
  const [msgInput, setMsgInput] = useState('');
  const [activeQ, setActiveQ] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [ratings, setRatings] = useState({});
  const [ended, setEnded] = useState(false);
  const [decision, setDecision] = useState('');

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, { from: 'mariem', text: msgInput.trim() }]);
    setMsgInput('');
  };

  const rate = (q, v) => setRatings(prev => ({ ...prev, [q]: v }));

  const CRITERIA = ['Communication', 'Compétences techniques', 'Culture d\'entreprise', 'Motivation', 'Présentation'];

  if (ended) {
    return (
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem', color: 'var(--success)' }}>
          <FiCheckCircle />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Entretien terminé</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Votre évaluation a été enregistrée.</p>
        <div className="rp-card" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
          <div className="rp-card__header"><span className="rp-card__title">Résumé de l'évaluation</span></div>
          <div className="rp-card__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {CRITERIA.map(cr => (
                <div key={cr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                  <span>{cr}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <FiStar key={s} size={14} style={{ color: (ratings[cr] || 0) >= s ? 'var(--accent)' : 'var(--border)' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {notes && <div style={{ fontSize: '0.85rem', color: 'var(--muted)', background: 'var(--background)', padding: '0.75rem', borderRadius: 8 }}>{notes}</div>}
            <div style={{ marginTop: '1rem', fontWeight: 700 }}>Décision : <span style={{ color: decision === 'Retenu' ? 'var(--success)' : decision === 'Refusé' ? 'var(--danger)' : 'var(--muted)' }}>{decision || '–'}</span></div>
          </div>
        </div>
        <Link to="/recruteur/entretiens" className="rp-btn rp-btn--primary" style={{ justifyContent: 'center' }}>Retour aux entretiens</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <Link to="/recruteur/entretiens" className="rp-btn rp-btn--outline rp-btn--sm"><FiArrowLeft size={13} /> Quitter</Link>
          <div>
            <h1 className="rp-title" style={{ fontSize: '1.15rem' }}>Entretien – Yasmine Ben Ali</h1>
            <p className="rp-subtitle" style={{ fontSize: '0.78rem' }}>Software Engineer · {fmt(elapsed)} écoulé</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>En direct</span>
            <span style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>{fmt(elapsed)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Main video area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Videos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Yasmine Ben Ali', initials: 'YB', bg: '#1e4fa3', active: true },
              { label: 'Mariem Khelil (Vous)', initials: 'MK', bg: '#7c3aed', active: camOn },
            ].map((v, i) => (
              <div key={i} style={{ background: '#111827', borderRadius: 'var(--radius-lg)', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="rp-avatar" style={{ width: 56, height: 56, background: v.bg, fontSize: '1.1rem' }}>{v.initials}</div>
                <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: '0.75rem', color: '#fff', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 100 }}>{v.label}</div>
                {!v.active && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiVideoOff size={28} color="#fff" /></div>}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            {[
              { icon: micOn ? <FiMic /> : <FiMicOff />, label: micOn ? 'Micro' : 'Muet', action: () => setMicOn(!micOn), active: micOn },
              { icon: camOn ? <FiVideo /> : <FiVideoOff />, label: camOn ? 'Caméra' : 'Caméra off', action: () => setCamOn(!camOn), active: camOn },
              { icon: <FiMonitor />, label: shareOn ? 'Arrêter' : 'Partager', action: () => setShareOn(!shareOn), active: !shareOn },
              { icon: <FiMessageSquare />, label: 'Chat', action: () => setChatOpen(!chatOpen), active: !chatOpen },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                background: btn.active ? 'var(--primary)' : 'rgba(239,68,68,0.1)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                color: btn.active ? '#fff' : 'var(--danger)',
                padding: '0.65rem 1.25rem', cursor: 'pointer', fontSize: '1.1rem',
                transition: 'all 0.15s'
              }}>
                {btn.icon}
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font)', fontWeight: 500 }}>{btn.label}</span>
              </button>
            ))}
            <button onClick={() => setEnded(true)} style={{
              background: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-sm)',
              color: '#fff', padding: '0.65rem 2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
              fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              Terminer
            </button>
          </div>

          {/* Questions */}
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Questions préparées</span></div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => setActiveQ(activeQ === i ? null : i)} style={{
                  width: '100%', textAlign: 'left', padding: '0.75rem', border: '1.5px solid', borderRadius: 'var(--radius-sm)',
                  borderColor: activeQ === i ? 'var(--primary)' : 'var(--border)',
                  background: activeQ === i ? 'rgba(30,79,163,0.06)' : '#fff',
                  cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.85rem',
                  color: activeQ === i ? 'var(--primary)' : 'var(--foreground)', fontWeight: activeQ === i ? 600 : 400
                }}>
                  {i + 1}. {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 80 }}>
          {/* Chat */}
          {chatOpen && (
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Chat</span></div>
              <div style={{ height: 200, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', padding: '0.5rem 0.7rem', borderRadius: 8, background: m.from === 'mariem' ? 'rgba(30,79,163,0.08)' : 'var(--background)', maxWidth: '90%', alignSelf: m.from === 'mariem' ? 'flex-end' : 'flex-start' }}>
                    {m.from === 'bot' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--muted)', marginBottom: '0.2rem' }}><RiRobot2Line size={11} /> Système</span>}
                    {m.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border-light)' }}>
                <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Message..." style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 100, padding: '0.4rem 0.8rem', fontSize: '0.8rem', outline: 'none', fontFamily: 'var(--font)' }} />
                <button onClick={sendMsg} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiSend size={13} /></button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Bloc-notes</span></div>
            <div className="rp-card__body">
              <textarea placeholder="Prenez vos notes ici..." value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem', fontSize: '0.82rem', fontFamily: 'var(--font)', resize: 'vertical', minHeight: 80, outline: 'none' }} />
            </div>
          </div>

          {/* Evaluation */}
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Évaluation temps réel</span></div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {CRITERIA.map(cr => (
                <div key={cr}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>{cr}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => rate(cr, s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: (ratings[cr] || 0) >= s ? 'var(--accent)' : 'var(--border)', fontSize: '1.1rem' }}>★</button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem' }}>Décision</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Retenu', 'À revoir', 'Refusé'].map(d => (
                    <button key={d} onClick={() => setDecision(d)} className="rp-btn rp-btn--outline rp-btn--sm"
                      style={{ background: decision === d ? (d === 'Retenu' ? 'var(--success)' : d === 'Refusé' ? 'var(--danger)' : 'var(--accent)') : '#fff', color: decision === d ? '#fff' : 'var(--foreground)', borderColor: decision === d ? 'transparent' : 'var(--border)', flex: 1, justifyContent: 'center' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
