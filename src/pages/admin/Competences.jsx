import React, { useState } from 'react';
import { FiSearch, FiPlusCircle, FiEdit2, FiTrash2, FiGitMerge } from 'react-icons/fi';
import { SKILLS } from '../../data/adminMockData';

export default function Competences() {
  const [query, setQuery] = useState('');
  const filtered = SKILLS.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Compétences</h1>
            <p className="rp-subtitle">Bibliothèque des compétences utilisées dans le matching IA</p>
          </div>
          <button className="rp-btn rp-btn--primary"><FiPlusCircle /> Ajouter une compétence</button>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher une compétence..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <button className="rp-btn rp-btn--outline"><FiGitMerge /> Fusionner des compétences similaires</button>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Compétence</th>
                <th>Catégorie</th>
                <th>Utilisée dans</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="rp-tag">{s.name}</span></td>
                  <td>{s.category}</td>
                  <td>{s.usage} profils</td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier"><FiEdit2 size={14} /></button>
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
