import React, { useState } from 'react';
import { FiSearch, FiPlusCircle, FiEye, FiEdit2, FiCheckCircle, FiSlash, FiTrash2 } from 'react-icons/fi';
import { ENTREPRISES, statusToBadge } from '../../data/adminMockData';

export default function Entreprises() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Toutes');
  const [list, setList] = useState(ENTREPRISES);

  const filtered = list.filter(e =>
    (status === 'Toutes' || e.status === status) &&
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  const verify = (id) => setList(prev => prev.map(e => e.id === id ? { ...e, status: 'Vérifiée' } : e));
  const suspend = (id) => setList(prev => prev.map(e => e.id === id ? { ...e, status: 'Suspendue' } : e));

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Entreprises</h1>
            <p className="rp-subtitle">{filtered.length} entreprise(s) inscrite(s) sur la plateforme</p>
          </div>
          <button className="rp-btn rp-btn--primary"><FiPlusCircle /> Ajouter une entreprise</button>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher une entreprise..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Toutes</option>
              <option>Vérifiée</option>
              <option>En attente</option>
              <option>Suspendue</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Secteur</th>
                <th>Responsable RH</th>
                <th>Email</th>
                <th>Offres</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="rp-avatar" style={{ width: 34, height: 34, background: e.color, fontSize: '0.7rem' }}>{e.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{e.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{e.address}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.sector}</td>
                  <td>{e.hr}</td>
                  <td>{e.email}</td>
                  <td>{e.offers}</td>
                  <td><span className={`rp-badge rp-badge--${statusToBadge(e.status)}`}>{e.status}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter"><FiEye size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier"><FiEdit2 size={14} /></button>
                      {e.status !== 'Vérifiée' && (
                        <button className="rp-btn rp-btn--success rp-btn--icon" title="Vérifier" onClick={() => verify(e.id)}><FiCheckCircle size={14} /></button>
                      )}
                      {e.status !== 'Suspendue' && (
                        <button className="rp-btn rp-btn--danger rp-btn--icon" title="Suspendre" onClick={() => suspend(e.id)}><FiSlash size={14} /></button>
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
