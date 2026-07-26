import React, { useState } from 'react';
import { FiSend, FiCalendar } from 'react-icons/fi';
import { NOTIFICATIONS_HISTORY, statusToBadge } from '../../data/adminMockData';

export default function NotificationsAdmin() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('Tous');

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Notifications</h1>
            <p className="rp-subtitle">Créer et diffuser des notifications globales</p>
          </div>
        </div>
      </div>

      <div className="rp-grid-2" style={{ gridTemplateColumns: '1fr 1.2fr', marginBottom: '1.25rem' }}>
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Nouvelle notification</span></div>
          <div className="rp-card__body rp-form">
            <div className="rp-field">
              <label className="rp-label">Titre<span>*</span></label>
              <input className="rp-input" placeholder="Ex : Maintenance planifiée" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="rp-field">
              <label className="rp-label">Message<span>*</span></label>
              <textarea className="rp-input rp-input--textarea" placeholder="Détails du message..." value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <div className="rp-field">
              <label className="rp-label">Destinataires</label>
              <select className="rp-input rp-input--select" value={target} onChange={e => setTarget(e.target.value)}>
                <option>Tous</option>
                <option>Recruteurs</option>
                <option>Candidats</option>
                <option>Administrateurs</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="rp-btn rp-btn--primary"><FiSend /> Envoyer à tous</button>
              <button className="rp-btn rp-btn--outline"><FiCalendar /> Planifier l'envoi</button>
            </div>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Historique des notifications</span></div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead><tr><th>Titre</th><th>Cible</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>
                {NOTIFICATIONS_HISTORY.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>{n.title}</td>
                    <td>{n.target}</td>
                    <td>{n.date}</td>
                    <td><span className={`rp-badge rp-badge--${statusToBadge(n.status)}`}>{n.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
