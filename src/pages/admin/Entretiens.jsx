import React, { useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiXCircle, FiRefreshCw, FiClipboard, FiVideo, FiMapPin } from 'react-icons/fi';
import { ENTRETIENS, statusToBadge } from '../../data/adminMockData';

export default function Entretiens() {
  const [query, setQuery] = useState('');

  const filtered = ENTRETIENS.filter(e => e.candidate.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Entretiens</h1>
            <p className="rp-subtitle">{filtered.length} entretien(s) planifiés ou réalisés</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un candidat..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Recruteur</th>
                <th>Offre</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.candidate}</td>
                  <td>{e.recruiter}</td>
                  <td>{e.offer}</td>
                  <td>{e.date}</td>
                  <td>{e.time}</td>
                  <td>
                    <span className="rp-badge rp-badge--blue">
                      {e.type === 'En ligne' ? <FiVideo size={11} /> : <FiMapPin size={11} />} {e.type}
                    </span>
                  </td>
                  <td><span className={`rp-badge rp-badge--${statusToBadge(e.status)}`}>{e.status}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter"><FiEye size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier"><FiEdit2 size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Reprogrammer"><FiRefreshCw size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Évaluations"><FiClipboard size={14} /></button>
                      <button className="rp-btn rp-btn--danger rp-btn--icon" title="Annuler"><FiXCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
