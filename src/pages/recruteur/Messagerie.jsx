import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FiSearch, FiSend, FiMoreVertical, FiMail, FiEdit } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  getUserConversations,
  getConversationHistory,
  markConversationAsRead,
  getOrCreateConversation,
} from '../../services/apiServiceMessagerie';
import {
  connectWebSocket,
  subscribeToUserStatus,
  sendChatMessage,
  sendReadReceipt,
  sendEditMessage,
  sendDeleteMessage,
  disconnectWebSocket,
} from '../../services/websocketMessagerie';
import { getUserById, getUsers } from '../../services/apiServiceUser'; // <-- adapte le nom du fichier si ton service User s'appelle autrement

const TEMPLATES = [
  'Bonjour [Nom], votre candidature a bien été reçue. Nous revenons vers vous prochainement.',
  'Nous sommes heureux de vous inviter pour un entretien le [Date] à [Heure].',
  'Merci pour votre entretien. Nous délibérons et reviendrons vers vous sous 48h.',
  'Félicitations ! Nous souhaitons vous faire une offre pour le poste de [Poste].',
];

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#0369a1'];

// ---- petits helpers d'affichage (pas de logique metier) ----
function displayName(user) {
  if (!user) return 'Utilisateur';
  const full = `${user.prenom ?? user.firstName ?? ''} ${user.nom ?? user.lastName ?? ''}`.trim();
  return full || user.email || 'Utilisateur';
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

function colorFromId(id) {
  const str = String(id ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';
  return date.toLocaleDateString('fr-FR', { weekday: 'short' });
}

export default function Messagerie() {
  const { user: currentUser } = useAuth(); // <-- meme source que Dashboard.jsx
  const currentUserId = currentUser?.id;

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState({}); // { [conversationId]: ChatMessage[] }
  const [input, setInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const endRef = useRef(null);

  const activeConv = conversations.find((c) => c.conversationId === activeConvId);
  const msgs = useMemo(() => messages[activeConvId] || [], [messages, activeConvId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, activeConvId]);

  // ---- chargement initial des conversations + enrichissement (nom/avatar du candidat) ----
  useEffect(() => {
    if (!currentUserId) return;

    (async () => {
      try {
        const { data } = await getUserConversations(currentUserId);

        const enriched = await Promise.all(
          data.map(async (conv) => {
            const otherUserId = conv.participantIds.find((id) => id !== currentUserId);
            let otherUser = null;
            try {
              const res = await getUserById(otherUserId);
              otherUser = res.data;
            } catch {
              otherUser = null;
            }
            const name = displayName(otherUser);
            return {
              conversationId: conv.id,
              otherUserId,
              name,
              avatar: initials(name),
              color: colorFromId(otherUserId),
              last: conv.lastMessage,
              time: formatTime(conv.lastMessageDate),
              unread: conv.unreadCount?.[currentUserId] || 0,
              online: false,
            };
          })
        );

        setConversations(enriched);
        if (enriched.length > 0) setActiveConvId(enriched[0].conversationId);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUserId]);

  // ---- connexion websocket : reception des messages + statut en ligne + edition/suppression ----
  useEffect(() => {
    if (!currentUserId) return;

    connectWebSocket(currentUserId, {
      onConnected: () => {
        conversations.forEach((c) =>
          subscribeToUserStatus(c.otherUserId, (userId, status) => {
            setConversations((prev) =>
              prev.map((c) => (c.otherUserId === userId ? { ...c, online: status === 'ONLINE' } : c))
            );
          })
        );
      },
      onMessageReceived: (message) => {
        setMessages((prev) => ({
          ...prev,
          [message.conversationId]: [...(prev[message.conversationId] || []), message],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === message.conversationId
              ? {
                  ...c,
                  last: message.content,
                  time: formatTime(message.timestamp),
                  unread:
                    c.conversationId === activeConvId ? 0 : (c.unread || 0) + (message.senderId !== currentUserId ? 1 : 0),
                }
              : c
          )
        );
      },
      onMessageEdited: (updatedMessage) => {
        setMessages((prev) => ({
          ...prev,
          [updatedMessage.conversationId]: (prev[updatedMessage.conversationId] || []).map((m) =>
            m.id === updatedMessage.id ? { ...m, content: updatedMessage.content, edited: true } : m
          ),
        }));
      },
      onMessageDeleted: ({ conversationId, messageId }) => {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((m) =>
            m.id === messageId ? { ...m, content: null, deleted: true } : m
          ),
        }));
      },
    });

    return () => disconnectWebSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, conversations.length]);

  // ---- ouverture d'une conversation : charge l'historique + marque comme lu ----
  const openConversation = useCallback(
    async (conversationId) => {
      setActiveConvId(conversationId);

      if (!messages[conversationId]) {
        const { data } = await getConversationHistory(conversationId);
        setMessages((prev) => ({ ...prev, [conversationId]: data }));
      }

      sendReadReceipt(conversationId, currentUserId);
      markConversationAsRead(conversationId, currentUserId).catch(() => {});
      setConversations((prev) => prev.map((c) => (c.conversationId === conversationId ? { ...c, unread: 0 } : c)));
    },
    [messages, currentUserId]
  );

  // ---- ouvre le panneau "nouveau message" et charge tous les utilisateurs (candidats) ----
  const openNewChat = useCallback(async () => {
    setShowNewChat(true);
    if (allUsers.length > 0) return; // deja charge

    setLoadingUsers(true);
    try {
      const { data } = await getUsers();
      setAllUsers(data.filter((u) => u.id !== currentUserId));
    } finally {
      setLoadingUsers(false);
    }
  }, [allUsers.length, currentUserId]);

  // ---- demarre (ou rouvre) une conversation avec un utilisateur choisi dans la liste ----
  const startConversationWith = useCallback(
    async (otherUser) => {
      const otherUserId = otherUser.id;

      // si la conversation existe deja localement, on l'ouvre simplement
      const existing = conversations.find((c) => c.otherUserId === otherUserId);
      if (existing) {
        setShowNewChat(false);
        openConversation(existing.conversationId);
        return;
      }

      const { data: conv } = await getOrCreateConversation(currentUserId, otherUserId, null);
      const name = displayName(otherUser);
      const newConv = {
        conversationId: conv.id,
        otherUserId,
        name,
        avatar: initials(name),
        color: colorFromId(otherUserId),
        last: conv.lastMessage,
        time: formatTime(conv.lastMessageDate),
        unread: 0,
        online: false,
      };

      setConversations((prev) => [newConv, ...prev]);
      setShowNewChat(false);
      setActiveConvId(newConv.conversationId);
      subscribeToUserStatus(otherUserId, (userId, status) => {
        setConversations((prev) =>
          prev.map((c) => (c.otherUserId === userId ? { ...c, online: status === 'ONLINE' } : c))
        );
      });
    },
    [conversations, currentUserId, openConversation]
  );

  // ---- envoi normal ou confirmation d'edition selon le contexte ----
  const send = () => {
    if (editingMessageId) {
      confirmEditMessage();
      return;
    }
    if (!input.trim() || !activeConv) return;

    sendChatMessage({
      senderId: currentUserId,
      senderName: displayName(currentUser),
      receiverId: activeConv.otherUserId,
      receiverName: activeConv.name,
      content: input.trim(),
    });

    setInput('');
    setShowTemplates(false);
  };

  // ---- passage en mode edition d'un message existant ----
  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setInput(message.content);
  };

  // ---- confirmation de l'edition (envoi via websocket + maj optimiste locale) ----
  const confirmEditMessage = () => {
    if (!input.trim() || !editingMessageId || !activeConv) return;

    sendEditMessage({
      messageId: editingMessageId,
      conversationId: activeConvId,
      editorId: currentUserId,
      newContent: input.trim(),
    });

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map((m) =>
        m.id === editingMessageId ? { ...m, content: input.trim(), edited: true } : m
      ),
    }));

    setEditingMessageId(null);
    setInput('');
  };

  // ---- annulation du mode edition ----
  const cancelEdit = () => {
    setEditingMessageId(null);
    setInput('');
  };

  // ---- suppression d'un message (envoi via websocket + maj optimiste locale) ----
  const deleteMessage = (message) => {
    if (!window.confirm('Supprimer ce message ?')) return;

    sendDeleteMessage({
      messageId: message.id,
      conversationId: activeConvId,
      requesterId: currentUserId,
    });

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map((m) =>
        m.id === message.id ? { ...m, content: null, deleted: true } : m
      ),
    }));
  };

  if (!currentUserId) {
    return <div style={{ padding: '2rem' }}>Utilisateur non connecté.</div>;
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement des conversations...</div>;
  }

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
        <div style={{ borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} size={14} />
              <input placeholder="Rechercher..." style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1.5px solid var(--border)', borderRadius: 100, fontSize: '0.82rem', outline: 'none', fontFamily: 'var(--font)' }} />
            </div>
            <button className="rp-btn rp-btn--primary rp-btn--icon" onClick={openNewChat} title="Nouveau message">
              <FiEdit size={15} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {showNewChat ? (
              <>
                <div style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Choisir un candidat</span>
                  <button onClick={() => setShowNewChat(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Annuler</button>
                </div>
                {loadingUsers && <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>Chargement...</div>}
                {!loadingUsers && allUsers.map((u) => {
                  const name = displayName(u);
                  return (
                    <div key={u.id} onClick={() => startConversationWith(u)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                      cursor: 'pointer', borderBottom: '1px solid var(--border-light)'
                    }}>
                      <div className="rp-avatar" style={{ width: 36, height: 36, background: colorFromId(u.id), fontSize: '0.75rem' }}>{initials(name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        {u.email && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{u.email}</div>}
                      </div>
                    </div>
                  );
                })}
                {!loadingUsers && allUsers.length === 0 && (
                  <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>Aucun candidat trouvé.</div>
                )}
              </>
            ) : (
              conversations.map((c) => (
              <div key={c.conversationId} onClick={() => openConversation(c.conversationId)} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem',
                cursor: 'pointer', borderBottom: '1px solid var(--border-light)',
                background: activeConvId === c.conversationId ? 'rgba(30,79,163,0.06)' : 'transparent',
                borderLeft: `3px solid ${activeConvId === c.conversationId ? 'var(--primary)' : 'transparent'}`,
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
            ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <div className="rp-avatar" style={{ width: 38, height: 38, background: activeConv?.color, fontSize: '0.8rem', flexShrink: 0 }}>{activeConv?.avatar}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{activeConv?.name}</div>
              <div style={{ fontSize: '0.72rem', color: activeConv?.online ? 'var(--success)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {activeConv?.online ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> En ligne</> : 'Hors ligne'}
              </div>
            </div>
            <button className="rp-btn rp-btn--outline rp-btn--sm" style={{ marginLeft: 'auto' }}><FiMoreVertical size={14} /></button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {msgs.map((m) => (
              <div
                key={m.id ?? `${m.senderId}-${m.timestamp}`}
                className="rp-message-row"
                style={{ display: 'flex', flexDirection: m.senderId === currentUserId ? 'row-reverse' : 'row', gap: '0.5rem', alignItems: 'flex-end' }}
              >
                {m.senderId !== currentUserId && <div className="rp-avatar" style={{ width: 28, height: 28, background: activeConv?.color, fontSize: '0.6rem', flexShrink: 0 }}>{activeConv?.avatar}</div>}
                <div style={{ display: 'flex', flexDirection: m.senderId === currentUserId ? 'row-reverse' : 'row', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{
                    maxWidth: '75%', padding: '0.65rem 0.9rem', borderRadius: 14, fontSize: '0.85rem', lineHeight: 1.5,
                    background: m.senderId === currentUserId ? 'var(--primary)' : 'var(--background)',
                    color: m.senderId === currentUserId ? '#fff' : 'var(--foreground)',
                    borderBottomRightRadius: m.senderId === currentUserId ? 4 : 14,
                    borderBottomLeftRadius: m.senderId !== currentUserId ? 4 : 14,
                    fontStyle: m.deleted ? 'italic' : 'normal',
                    opacity: m.deleted ? 0.6 : 1,
                  }}>
                    {m.deleted ? 'Message supprimé' : m.content}
                    {m.edited && !m.deleted && (
                      <span style={{ fontSize: '0.65rem', opacity: 0.7, marginLeft: 6 }}>(modifié)</span>
                    )}
                  </div>

                  {m.senderId === currentUserId && !m.deleted && (
                    <div className="rp-message-actions" style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => startEditMessage(m)}
                        title="Modifier"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.7rem' }}
                      >
                        <FiEdit size={12} />
                      </button>
                      <button
                        onClick={() => deleteMessage(m)}
                        title="Supprimer"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger, #dc2626)', fontSize: '0.7rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Templates */}
          {showTemplates && (
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)', background: 'var(--background)', maxHeight: '35vh', overflowY: 'auto' }}>
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
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)', background: '#fff', flexShrink: 0 }}>
            <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={() => setShowTemplates(!showTemplates)} title="Modèles">
              <FiMail size={15} />
            </button>
            {editingMessageId && (
              <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={cancelEdit} title="Annuler la modification">
                Annuler
              </button>
            )}
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={editingMessageId ? 'Modifier le message...' : 'Écrire un message...'}
              style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 100, padding: '0.55rem 1rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'var(--font)', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={send} className="rp-btn rp-btn--primary rp-btn--icon">
              <FiSend size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}