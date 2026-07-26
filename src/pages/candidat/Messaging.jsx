import React, { useState } from 'react';
import { FiPaperclip, FiSend } from 'react-icons/fi';
import { conversations, messages as initialMessages } from '../../data/candidatMockData';

export default function Messaging() {
  const [active, setActive] = useState(conversations[0].id);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, from: 'me', text: draft, time: "À l'instant" }]);
    setDraft('');
  };

  const activeConv = conversations.find((c) => c.id === active);

  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Messagerie</h1>
        <p className="rp-subtitle">Échangez directement avec les recruteurs</p>
      </div>

      <div className="rp-card" style={{ display: 'flex', height: 560, overflow: 'hidden' }}>
        <div style={{ width: 280, borderRight: '1px solid var(--border)', overflowY: 'auto', flexShrink: 0 }}>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '0.9rem 1rem',
                border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                background: active === c.id ? 'var(--background)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="rp-avatar" style={{ width: 32, height: 32, background: c.color, fontSize: '0.7rem', flexShrink: 0 }}>{c.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                    {c.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>{activeConv?.name}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '0.6rem 1rem', borderRadius: 16, fontSize: '0.85rem',
                  background: m.from === 'me' ? 'var(--primary)' : 'var(--background)',
                  color: m.from === 'me' ? '#fff' : 'var(--foreground)',
                  borderBottomRightRadius: m.from === 'me' ? 4 : 16,
                  borderBottomLeftRadius: m.from === 'me' ? 16 : 4,
                }}>
                  {m.text}
                  <div style={{ fontSize: '0.65rem', marginTop: 4, opacity: 0.7 }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <button className="rp-btn rp-btn--outline rp-btn--icon"><FiPaperclip size={15} /></button>
            <input
              className="rp-input"
              style={{ borderRadius: 100 }}
              placeholder="Écrire un message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} className="rp-btn rp-btn--primary rp-btn--icon" style={{ borderRadius: '50%' }}><FiSend size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
