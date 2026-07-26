import React, { useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiArchive, FiXCircle, FiRotateCcw } from 'react-icons/fi';
import { OFFRES, statusToBadge } from '../../data/adminMockData';

export default function Offres() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Toutes');
  const [list, setList] = useState(OFFRES);

  const filtered = list.filter(o =>
    (status === 'Toutes' || o.status === status) &&
    o.title.toLowerCase().includes(query.toLowerCase())
  );

  const setOfferStatus = (id, s) => setList(prev => prev.map(o => o.id === id ? { ...o, status: s } : o));

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Offres d'Emploi</h1>
            <p className="rp-subtitle">{filtered.length} offre(s) publiées par les entreprises</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher une offre..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Toutes</option>
              <option>Publiée</option>
              <option>En attente</option>
              <option>Fermée</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Intitulé</th>
                <th>Entreprise</th>
                <th>Recruteur</th>
                <th>Contrat</th>
                <th>Publiée le</th>
                <th>Candidatures</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.title}</td>
                  <td>{o.company}</td>
                  <td>{o.recruiter}</td>
                  <td><span className="rp-badge rp-badge--blue">{o.type}</span></td>
                  <td>{o.date}</td>
                  <td>{o.apps}</td>
                  <td><span className={`rp-badge rp-badge--${statusToBadge(o.status)}`}>{o.status}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter"><FiEye size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier"><FiEdit2 size={14} /></button>
                      {o.status !== 'Fermée' ? (
                        <button className="rp-btn rp-btn--danger rp-btn--icon" title="Fermer l'offre" onClick={() => setOfferStatus(o.id, 'Fermée')}><FiXCircle size={14} /></button>
                      ) : (
                        <button className="rp-btn rp-btn--success rp-btn--icon" title="Restaurer" onClick={() => setOfferStatus(o.id, 'Publiée')}><FiRotateCcw size={14} /></button>
                      )}
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Archiver"><FiArchive size={14} /></button>
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
