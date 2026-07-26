import React, { useEffect, useRef, useState } from 'react';
import { FiSend, FiX, FiCpu } from 'react-icons/fi';
import { getCoachHistory, sendCoachMessage } from '../services/apiServiceCoach';
import { useAuth } from '../context/AuthContext';
import '../styles/coach-chat-widget.css';

const QUICK_ACTIONS = [
  "Comment améliorer mon CV ?",
  "Propose-moi une version plus forte de mon CV",
  "Quels sont mes points faibles ?",
];

export default function CoachChatWidget() {
  const { user } = useAuth();
  const userId = user?.id; // adapte en user?._id si nécessaire

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && userId && messages.length === 0) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function loadHistory() {
    try {
      setLoadingHistory(true);
      const res = await getCoachHistory(userId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSend(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || !userId || sending) return;

    setMessages((prev) => [...prev, { role: 'USER', content: text, id: `tmp-${Date.now()}` }]);
    setInput('');
    setSending(true);

    try {
      const res = await sendCoachMessage(userId, text);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'ASSISTANT', content: "Erreur de connexion au coach IA. Réessayez.", id: `err-${Date.now()}` }]);
    } finally {
      setSending(false);
    }
  }

  if (!userId) return null;

  return (
    <>
      <button className="coach-fab" onClick={() => setOpen(true)} style={{ display: open ? 'none' : 'flex' }}>
        <FiCpu size={24} />
        <span className="coach-fab__dot" />
      </button>

      {open && (
        <div className="coach-panel">
          <div className="coach-panel__header">
            <div className="coach-panel__title">
              <div className="coach-panel__avatar"><FiCpu size={18} /></div>
              <div>
                <div className="coach-panel__name">Coach Fursa</div>
                <div className="coach-panel__status">En ligne</div>
              </div>
            </div>
            <button className="coach-panel__close" onClick={() => setOpen(false)}><FiX size={18} /></button>
          </div>

          <div className="coach-panel__body">
            {loadingHistory && <p className="coach-empty">Chargement de la conversation...</p>}

            {!loadingHistory && messages.length === 0 && (
              <div className="coach-bubble coach-bubble--bot">
                Bonjour ! Je suis Fursa, votre coach carrière IA. Je peux analyser votre CV, répondre à vos questions et vous proposer une version améliorée. Comment puis-je vous aider ?
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`coach-bubble ${m.role === 'USER' ? 'coach-bubble--user' : 'coach-bubble--bot'}`}>
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="coach-bubble coach-bubble--bot coach-bubble--typing">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 0 && !loadingHistory && (
            <div className="coach-quick-actions">
              {QUICK_ACTIONS.map((q) => (
                <button key={q} onClick={() => handleSend(q)}>{q}</button>
              ))}
            </div>
          )}

          <div className="coach-panel__input">
            <input
              type="text"
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={sending}
            />
            <button onClick={() => handleSend()} disabled={sending || !input.trim()}>
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}