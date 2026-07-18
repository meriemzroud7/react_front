import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiSend, FiPaperclip, FiMoreVertical, FiMail } from 'react-icons/fi';

const CONVERSATIONS = [
  { id: 1, name: 'Yasmine Ben Ali', avatar: 'YB', color: '#1e4fa3', last: 'Merci pour votre retour...', time: '14:32', unread: 2, online: true },
  { id: 2, name: 'Ahmed Maalej', avatar: 'AM', color: '#0f766e', last: 'Je serai disponible demain.', time: '11:15', unread: 0, online: false },
  { id: 3, name: 'Sarra Chaari', avatar: 'SC', color: '#7c3aed', last: 'Parfait, à bientôt !', time: 'Hier', unread: 0, online: true },
  { id: 4, name: 'Fathi Hamdi', avatar: 'FH', color: '#b45309', last: 'Bonjour, j\'ai une question...', time: 'Lun', unread: 1, online: false },
];

const INIT_MESSAGES = {
  1: [
    { from: 'them', text: 'Bonjour, j\'ai bien reçu votre invitation à l\'entretien.' },
    { from: 'me', text: 'Bonjour Yasmine ! Parfait, nous vous attendons le 20 janvier à 14h.' },
    { from: 'them', text: 'Merci pour votre retour, je confirme ma présence.' },
    { from: 'them', text: 'Dois-je préparer quelque chose de particulier ?' },
  ],
  2: [
    { from: 'me', text: 'Bonjour Ahmed, votre candidature est à l\'étude.' },
    { from: 'them', text: 'Bonjour, merci. Je serai disponible demain pour un entretien.' },
  ],
  3: [
    { from: 'them', text: 'Bonjour, j\'ai uploadé mon CV mis à jour.' },
    { from: 'me', text: 'Reçu ! Notre IA l\'analysera dans les prochaines minutes.' },
    { from: 'them', text: 'Parfait, à bientôt !' },
  ],
  4: [
    { from: 'them', text: 'Bonjour, j\'ai une question concernant le poste Product Manager.' },
  ],
};

const TEMPLATES = [
  'Bonjour [Nom], votre candidature a bien été reçue. Nous revenons vers vous prochainement.',
  'Nous sommes heureux de vous inviter pour un entretien le [Date] à [Heure].',
  'Merci pour votre entretien. Nous délibérons et reviendrons vers vous sous 48h.',
  'Félicitations ! Nous souhaitons vous faire une offre pour le poste de [Poste].',
];

export default function Messagerie() {
  const [activeConv, setActiveConv] = useState(1);
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeConv]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), { from: 'me', text: input.trim() }] }));
    setInput('');
    setShowTemplates(false);
  };

  const conv = CONVERSATIONS.find(c => c.id === activeConv);
  const msgs = messages[activeConv] || [];

  return (
    <div>
      <div className="rp-header">
        <div>
          <h1 className="rp-title">Messagerie</h1>
          <p className="rp-subtitle">Communiquez avec vos candidats</p>
        </div>
      </div>

      <div className="rp-card" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '70vh', overflow: 'hidden' }}>
        {/* Conversations list */}
        <div style={{ borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} size={14} />
              <input placeholder="Rechercher..." style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1.5px solid var(--border)', borderRadius: 100, fontSize: '0.82rem', outline: 'none', fontFamily: 'var(--font)' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {CONVERSATIONS.map(c => (
              <div key={c.id} onClick={() => setActiveConv(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem',
                cursor: 'pointer', borderBottom: '1px solid var(--border-light)',
                background: activeConv === c.id ? 'rgba(30,79,163,0.06)' : 'transparent',
                borderLeft: `3px solid ${activeConv === c.id ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.15s'
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="rp-avatar" style={{ width: 40, height: 40, background: c.color, fontSize: '0.8rem' }}>{c.avatar}</div>
                  {c.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: 'var(--success)', border: '2px solid #fff' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-light)', flexShrink: 0, marginLeft: '0.5rem' }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last}</div>
                </div>
                {c.unread > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <div className="rp-avatar" style={{ width: 38, height: 38, background: conv?.color, fontSize: '0.8rem', flexShrink: 0 }}>{conv?.avatar}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{conv?.name}</div>
              <div style={{ fontSize: '0.72rem', color: conv?.online ? 'var(--success)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {conv?.online ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> En ligne</> : 'Hors ligne'}
              </div>
            </div>
            <button className="rp-btn rp-btn--outline rp-btn--sm" style={{ marginLeft: 'auto' }}><FiMoreVertical size={14} /></button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: m.from === 'me' ? 'row-reverse' : 'row', gap: '0.5rem', alignItems: 'flex-end' }}>
                {m.from === 'them' && <div className="rp-avatar" style={{ width: 28, height: 28, background: conv?.color, fontSize: '0.6rem', flexShrink: 0 }}>{conv?.avatar}</div>}
                <div style={{
                  maxWidth: '75%', padding: '0.65rem 0.9rem', borderRadius: 14, fontSize: '0.85rem', lineHeight: 1.5,
                  background: m.from === 'me' ? 'var(--primary)' : 'var(--background)',
                  color: m.from === 'me' ? '#fff' : 'var(--foreground)',
                  borderBottomRightRadius: m.from === 'me' ? 4 : 14,
                  borderBottomLeftRadius: m.from === 'them' ? 4 : 14,
                }}>{m.text}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Templates */}
          {showTemplates && (
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)', background: 'var(--background)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Modèles de messages</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => { setInput(t); setShowTemplates(false); }} style={{
                    textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)',
                    background: '#fff', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--foreground)', fontFamily: 'var(--font)'
                  }}>{t.length > 70 ? t.slice(0, 70) + '…' : t}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)', background: '#fff' }}>
            <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={() => setShowTemplates(!showTemplates)} title="Modèles">
              <FiMail size={15} />
            </button>
            <button className="rp-btn rp-btn--outline rp-btn--icon" title="Fichier"><FiPaperclip size={15} /></button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Écrire un message..." style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 100, padding: '0.55rem 1rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'var(--font)', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <button onClick={send} className="rp-btn rp-btn--primary rp-btn--icon"><FiSend size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
