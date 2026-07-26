import React from 'react';
import { Link } from 'react-router-dom';
import { FiVideo, FiMapPin, FiCalendar, FiClock, FiXCircle } from 'react-icons/fi';
import { upcomingInterviews } from '../../data/candidatMockData';

export default function Interviews() {
  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Mes entretiens</h1>
            <p className="rp-subtitle">Retrouvez vos entretiens programmés et accédez à la salle en ligne</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {upcomingInterviews.map((it) => (
          <div key={it.id} className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="rp-avatar" style={{ width: 48, height: 48, background: it.color, fontSize: '0.9rem' }}>{it.avatar}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--foreground)' }}>{it.role}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{it.company}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.4rem', fontSize: '0.76rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={12} />{it.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} />{it.time}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{it.type === 'En ligne' ? <FiVideo size={12} /> : <FiMapPin size={12} />}{it.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="rp-badge rp-badge--amber">Confirmé</span>
                {it.type === 'En ligne' && (
                  <Link to={`/candidat/entretiens/${it.id}/salle`} className="rp-btn rp-btn--primary rp-btn--sm">Rejoindre</Link>
                )}
                <button className="rp-btn rp-btn--danger rp-btn--icon"><FiXCircle size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
