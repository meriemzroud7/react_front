import React, { useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiDownload, FiUser } from 'react-icons/fi';
import { CANDIDATURES, statusToBadge } from '../../data/adminMockData';

export default function Candidatures() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Tous');

  const filtered = CANDIDATURES.filter(c =>
    (status === 'Tous' || c.status === status) &&
    c.candidate.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Candidatures</h1>
            <p className="rp-subtitle">{filtered.length} candidature(s) sur l'ensemble des offres</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un candidat..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Tous</option>
              <option>En attente</option>
              <option>Entretien</option>
              <option>Retenue</option>
              <option>Refusée</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Offre</th>
                <th>Entreprise</th>
                <th>Date</th>
                <th>Score IA</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.candidate}</td>
                  <td>{c.offer}</td>
                  <td>{c.company}</td>
                  <td>{c.date}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="rp-progress" style={{ width: 70 }}>
                        <div className={`rp-progress__fill rp-progress__fill--${c.score >= 85 ? 'green' : c.score >= 70 ? 'amber' : 'red'}`} style={{ width: `${c.score}%` }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{c.score}%</span>
                    </div>
                  </td>
                  <td><span className={`rp-badge rp-badge--${statusToBadge(c.status)}`}>{c.status}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter"><FiEye size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Profil candidat"><FiUser size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Télécharger CV"><FiDownload size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier le statut"><FiEdit2 size={14} /></button>
                      <button className="rp-btn rp-btn--danger rp-btn--icon" title="Supprimer"><FiTrash2 size={14} /></button>
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
