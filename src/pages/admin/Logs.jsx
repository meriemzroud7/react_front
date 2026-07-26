import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { LOGS } from '../../data/adminMockData';

const SEVERITY_BADGE = { Info: 'blue', Avertissement: 'amber', Erreur: 'red' };

export default function Logs() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('Tous');

  const filtered = LOGS.filter(l =>
    (severity === 'Tous' || l.severity === severity) &&
    (l.user.toLowerCase().includes(query.toLowerCase()) || l.action.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Journal d'Activité</h1>
            <p className="rp-subtitle">Historique des actions réalisées sur la plateforme</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un utilisateur ou une action..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={severity} onChange={e => setSeverity(e.target.value)}>
              <option>Tous</option>
              <option>Info</option>
              <option>Avertissement</option>
              <option>Erreur</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Date</th>
                <th>Niveau</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.user}</td>
                  <td>{l.action}</td>
                  <td>{l.date}</td>
                  <td><span className={`rp-badge rp-badge--${SEVERITY_BADGE[l.severity]}`}>{l.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
