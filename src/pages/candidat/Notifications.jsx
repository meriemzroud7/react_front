import React from 'react';
import { FiZap, FiCalendar, FiMessageCircle, FiRefreshCw, FiSend } from 'react-icons/fi';
import { notifications } from '../../data/candidatMockData';

const ICONS = {
  offer: { icon: <FiZap size={15} />, color: 'var(--accent-dark)', bg: 'rgba(240,165,0,0.1)' },
  interview: { icon: <FiCalendar size={15} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  message: { icon: <FiMessageCircle size={15} />, color: 'var(--primary)', bg: 'rgba(30,79,163,0.1)' },
  status: { icon: <FiRefreshCw size={15} />, color: 'var(--success)', bg: 'rgba(26,156,107,0.1)' },
  application: { icon: <FiSend size={15} />, color: 'var(--muted)', bg: 'var(--border-light)' },
};

export default function Notifications() {
  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Notifications</h1>
        <p className="rp-subtitle">Restez informé(e) de toute activité concernant votre profil</p>
      </div>

      <div className="rp-card">
        {notifications.map((n, i) => {
          const cfg = ICONS[n.type] || ICONS.status;
          return (
            <div key={n.id} style={{
              display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem',
              borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none',
              background: !n.read ? 'rgba(234,169,39,0.05)' : 'transparent',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: !n.read ? 600 : 400, color: !n.read ? 'var(--foreground)' : 'var(--muted)' }}>{n.text}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--muted-light)' }}>{n.time}</p>
              </div>
              {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
