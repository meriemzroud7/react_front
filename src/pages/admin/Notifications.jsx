import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiCalendar, FiMessageCircle, FiRefreshCw, FiSend, FiBell, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getMyNotifications, markAsRead, markAllAsRead } from '../../services/apiServiceNotification';

// Correspondance avec l'enum TypeNotification côté backend.
// Côté admin, la grande majorité des notifications seront de type SYSTEME
// (nouvel utilisateur inscrit, entreprise en attente, etc.).
const ICONS = {
  NOUVELLE_OFFRE: { icon: <FiZap size={15} />, color: 'var(--accent-dark)', bg: 'rgba(240,165,0,0.1)' },
  ENTRETIEN: { icon: <FiCalendar size={15} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  MESSAGE: { icon: <FiMessageCircle size={15} />, color: 'var(--primary)', bg: 'rgba(30,79,163,0.1)' },
  CANDIDATURE_STATUT: { icon: <FiRefreshCw size={15} />, color: 'var(--success)', bg: 'rgba(26,156,107,0.1)' },
  CANDIDATURE_ENVOYEE: { icon: <FiSend size={15} />, color: 'var(--muted)', bg: 'var(--border-light)' },
  SYSTEME: { icon: <FiBell size={15} />, color: 'var(--primary)', bg: 'rgba(30,79,163,0.1)' },
};

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ === 1) return 'Il y a 1 jour';
  return `Il y a ${diffJ} jours`;
}

export default function NotificationsAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMyNotifications(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les notifications. Vérifie que le backend est bien lancé.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleClick = async (n) => {
    if (!n.read) {
      try {
        await markAsRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      } catch (err) {
        console.error(err);
      }
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead(user.id);
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  if (loading) {
    return (
      <div className="rp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
        <FiLoader className="rp-spin" /> Chargement des notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
        <FiAlertCircle size={28} color="var(--danger, #dc2626)" />
        <p>{error}</p>
        <button className="rp-btn rp-btn--outline" onClick={fetchNotifications}>Réessayer</button>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Notifications</h1>
            <p className="rp-subtitle">Activité système de la plateforme</p>
          </div>
          {hasUnread && (
            <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={handleMarkAllAsRead}>
              <FiCheck size={14} /> Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      <div className="rp-card">
        {notifications.length === 0 && (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)' }}>
            Aucune notification pour le moment.
          </div>
        )}
        {notifications.map((n, i) => {
          const cfg = ICONS[n.type] || ICONS.SYSTEME;
          return (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none',
                background: !n.read ? 'rgba(234,169,39,0.05)' : 'transparent',
                cursor: n.link || !n.read ? 'pointer' : 'default',
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: !n.read ? 600 : 400, color: !n.read ? 'var(--foreground)' : 'var(--muted)' }}>
                  {n.title}{n.message ? ` — ${n.message}` : ''}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--muted-light)' }}>{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}