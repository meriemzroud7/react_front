import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlusCircle, FiSearch, FiEdit2, FiTrash2, FiCopy,
  FiXCircle, FiUsers, FiMoreHorizontal, FiFilter
} from 'react-icons/fi';

const OFFRES = [
  { id: 1, titre: 'Software Engineer – React/Node', dept: 'IT', loc: 'Tunis', contrat: 'CDI', publie: '10 Jan 2025', limite: '10 Fév 2025', cands: 48, statut: 'Ouverte' },
  { id: 2, titre: 'Data Analyst – Machine Learning', dept: 'Data', loc: 'Sfax', contrat: 'CDI', publie: '08 Jan 2025', limite: '08 Fév 2025', cands: 31, statut: 'Ouverte' },
  { id: 3, titre: 'UX/UI Designer Senior', dept: 'Design', loc: 'Tunis', contrat: 'CDD', publie: '05 Jan 2025', limite: '05 Fév 2025', cands: 22, statut: 'Ouverte' },
  { id: 4, titre: 'Chef de Projet Digital', dept: 'Produit', loc: 'Tunis', contrat: 'CDI', publie: '01 Jan 2025', limite: '01 Fév 2025', cands: 15, statut: 'Fermée' },
  { id: 5, titre: 'DevOps Engineer – AWS/K8s', dept: 'IT', loc: 'Sousse', contrat: 'CDI', publie: '28 Déc 2024', limite: '28 Jan 2025', cands: 9, statut: 'Brouillon' },
  { id: 6, titre: 'Responsable Marketing Digital', dept: 'Marketing', loc: 'Tunis', contrat: 'CDI', publie: '20 Déc 2024', limite: '20 Jan 2025', cands: 37, statut: 'Fermée' },
];

const STATUS_CLASSES = { Ouverte: 'green', Fermée: 'red', Brouillon: 'gray' };

export default function Offres() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [statut, setStatut] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = OFFRES.filter(o => {
    const matchSearch = o.titre.toLowerCase().includes(search.toLowerCase());
    const matchDept = !dept || o.dept === dept;
    const matchStatut = !statut || o.statut === statut;
    return matchSearch && matchDept && matchStatut;
  });

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des offres d'emploi</h1>
            <p className="rp-subtitle">{OFFRES.length} offres au total · {OFFRES.filter(o => o.statut === 'Ouverte').length} actives</p>
          </div>
          <Link to="/recruteur/offres/nouvelle" className="rp-btn rp-btn--primary">
            <FiPlusCircle /> Créer une offre
          </Link>
        </div>
      </div>

      <div className="rp-card">
        {/* Filters */}
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, minWidth: 200 }}>
            <FiSearch className="rp-filter-icon" />
            <input
              placeholder="Rechercher une offre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div className="rp-filter-input">
            <select value={dept} onChange={e => setDept(e.target.value)}>
              <option value="">Tous les départements</option>
              <option value="IT">IT</option>
              <option value="Data">Data</option>
              <option value="Design">Design</option>
              <option value="Produit">Produit</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="rp-filter-input">
            <select value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="Ouverte">Ouverte</option>
              <option value="Fermée">Fermée</option>
              <option value="Brouillon">Brouillon</option>
            </select>
          </div>
          <button className="rp-btn rp-btn--outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiFilter size={14} /> Filtrer
          </button>
        </div>

        {/* Table */}
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Titre du poste</th>
                <th>Département</th>
                <th>Localisation</th>
                <th>Contrat</th>
                <th>Publication</th>
                <th>Limite</th>
                <th>Candidatures</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.titre}</span>
                  </td>
                  <td><span className="rp-badge rp-badge--blue">{o.dept}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{o.loc}</td>
                  <td style={{ fontSize: '0.82rem' }}>{o.contrat}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{o.publie}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{o.limite}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiUsers size={13} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700 }}>{o.cands}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`rp-badge rp-badge--${STATUS_CLASSES[o.statut]}`}>
                      {o.statut}
                    </span>
                  </td>
                  <td>
                    <div className="rp-table__actions" style={{ position: 'relative' }}>
                      <Link
                        to={`/recruteur/candidatures?offre=${o.id}`}
                        className="rp-btn rp-btn--outline rp-btn--sm"
                        title="Voir candidatures"
                      >
                        <FiUsers size={13} />
                      </Link>
                      <button className="rp-btn rp-btn--outline rp-btn--sm" title="Modifier">
                        <FiEdit2 size={13} />
                      </button>
                      <button className="rp-btn rp-btn--outline rp-btn--sm" title="Dupliquer">
                        <FiCopy size={13} />
                      </button>
                      <button
                        className="rp-btn rp-btn--outline rp-btn--sm"
                        onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)}
                      >
                        <FiMoreHorizontal size={13} />
                      </button>
                      {openMenu === o.id && (
                        <div style={{
                          position: 'absolute', top: '100%', right: 0, zIndex: 200,
                          background: '#fff', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)',
                          minWidth: 150, padding: '0.35rem'
                        }} onClick={() => setOpenMenu(null)}>
                          {[
                            { icon: <FiXCircle size={13} />, label: 'Fermer l\'offre', cls: 'danger' },
                            { icon: <FiTrash2 size={13} />, label: 'Supprimer', cls: 'danger' },
                          ].map((a, ai) => (
                            <button key={ai} className={`rp-btn rp-btn--${a.cls} rp-btn--sm`} style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              {a.icon} {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Aucune offre trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
