import React, { useState } from 'react';
import { FiEye, FiMessageSquare, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { SIGNALEMENTS, statusToBadge } from '../../data/adminMockData';

const PRIORITY_BADGE = { Haute: 'red', Moyenne: 'amber', Basse: 'gray' };

export default function Signalements() {
  const [type, setType] = useState('Tous');
  const [list, setList] = useState(SIGNALEMENTS);

  const filtered = list.filter(s => type === 'Tous' || s.type === type);
  const close = (id) => setList(prev => prev.map(s => s.id === id ? { ...s, status: 'Clôturé' } : s));

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Signalements & Réclamations</h1>
            <p className="rp-subtitle">{filtered.length} signalement(s) — offres, candidats, recruteurs</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input">
            <select value={type} onChange={e => setType(e.target.value)}>
              <option>Tous</option>
              <option>Offre</option>
              <option>Candidat</option>
              <option>Recruteur</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Sujet</th>
                <th>Priorité</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="rp-badge rp-badge--blue">{s.type}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.subject}</td>
                  <td><span className={`rp-badge rp-badge--${PRIORITY_BADGE[s.priority]}`}>{s.priority}</span></td>
                  <td>{s.date}</td>
                  <td><span className={`rp-badge rp-badge--${statusToBadge(s.status)}`}>{s.status}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter"><FiEye size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Répondre"><FiMessageSquare size={14} /></button>
                      {s.status !== 'Clôturé' && (
                        <button className="rp-btn rp-btn--success rp-btn--icon" title="Clôturer" onClick={() => close(s.id)}><FiCheckCircle size={14} /></button>
                      )}
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
