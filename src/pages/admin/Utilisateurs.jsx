import React, { useState } from 'react';
import { FiSearch, FiPlusCircle, FiEye, FiEdit2, FiSlash, FiTrash2, FiKey, FiUserCheck } from 'react-icons/fi';
import { USERS, statusToBadge } from '../../data/adminMockData';

export default function Utilisateurs() {
  const [role, setRole] = useState('Tous');
  const [status, setStatus] = useState('Tous');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(USERS);

  const filtered = users.filter(u =>
    (role === 'Tous' || u.role === role) &&
    (status === 'Tous' || u.status === status) &&
    (u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
  );

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Actif' ? 'Suspendu' : 'Actif' } : u));
  };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Utilisateurs</h1>
            <p className="rp-subtitle">{filtered.length} compte(s) — administrateurs, recruteurs, candidats</p>
          </div>
          <button className="rp-btn rp-btn--primary"><FiPlusCircle /> Ajouter un utilisateur</button>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un nom ou un email..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option>Tous</option>
              <option>Administrateur</option>
              <option>Recruteur</option>
              <option>Candidat</option>
            </select>
          </div>
          <div className="rp-filter-input">
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Tous</option>
              <option>Actif</option>
              <option>Suspendu</option>
              <option>En attente</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Inscription</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="rp-avatar" style={{ width: 34, height: 34, background: u.color, fontSize: '0.72rem' }}>{u.avatar}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.date}</td>
                  <td><span className={`rp-badge rp-badge--${statusToBadge(u.status)}`}>{u.status}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter le profil"><FiEye size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier"><FiEdit2 size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Réinitialiser le mot de passe"><FiKey size={14} /></button>
                      <button
                        className={`rp-btn rp-btn--icon ${u.status === 'Actif' ? 'rp-btn--danger' : 'rp-btn--success'}`}
                        title={u.status === 'Actif' ? 'Désactiver' : 'Activer'}
                        onClick={() => toggleStatus(u.id)}
                      >
                        {u.status === 'Actif' ? <FiSlash size={14} /> : <FiUserCheck size={14} />}
                      </button>
                      <button className="rp-btn rp-btn--danger rp-btn--icon" title="Supprimer"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Aucun utilisateur ne correspond aux filtres.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
