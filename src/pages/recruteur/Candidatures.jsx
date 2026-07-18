import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiDownload, FiCalendar, FiCheck, FiX,
  FiUser, FiMail, FiPhone, FiFilter, FiLayers
} from 'react-icons/fi';

const CANDIDATES = [
  { id: 1, name: 'Yasmine Ben Ali', email: 'yasmine.ba@gmail.com', phone: '+216 22 345 678', avatar: 'YB', color: '#1e4fa3', date: '12 Jan 2025', score: 94, statut: 'Retenu', statusClass: 'green', exp: '4 ans', formation: 'Ingénieur Informatique', dispo: 'Immédiate' },
  { id: 2, name: 'Ahmed Maalej', email: 'ahmed.maalej@outlook.com', phone: '+216 55 789 012', avatar: 'AM', color: '#0f766e', date: '11 Jan 2025', score: 87, statut: 'En attente', statusClass: 'amber', exp: '3 ans', formation: 'Master Data Science', dispo: '1 mois' },
  { id: 3, name: 'Sarra Chaari', email: 'sarra.chaari@gmail.com', phone: '+216 98 234 567', avatar: 'SC', color: '#7c3aed', date: '10 Jan 2025', score: 91, statut: 'Entretien', statusClass: 'blue', exp: '5 ans', formation: 'Ingénieur DevOps', dispo: '2 semaines' },
  { id: 4, name: 'Mohamed Tlili', email: 'med.tlili@yahoo.fr', phone: '+216 25 678 901', avatar: 'MT', color: '#be185d', date: '09 Jan 2025', score: 72, statut: 'Refusé', statusClass: 'red', exp: '2 ans', formation: 'Licence UX', dispo: '3 mois' },
  { id: 5, name: 'Fathi Hamdi', email: 'fathi.hamdi@gmail.com', phone: '+216 77 456 789', avatar: 'FH', color: '#b45309', date: '08 Jan 2025', score: 83, statut: 'En attente', statusClass: 'amber', exp: '6 ans', formation: 'Master Management', dispo: 'Immédiate' },
  { id: 6, name: 'Inès Sfar', email: 'ines.sfar@gmail.com', phone: '+216 20 123 456', avatar: 'IS', color: '#0891b2', date: '07 Jan 2025', score: 88, statut: 'En attente', statusClass: 'amber', exp: '4 ans', formation: 'Ingénieur Full Stack', dispo: '1 mois' },
];

export default function Candidatures() {
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState('');
  const [statut, setStatut] = useState('');
  const [selected, setSelected] = useState([]);

  const filtered = CANDIDATES.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const msc = !minScore || c.score >= Number(minScore);
    const mst = !statut || c.statut === statut;
    return ms && msc && mst;
  });

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Liste des candidatures</h1>
            <p className="rp-subtitle">Software Engineer – React/Node · {CANDIDATES.length} candidatures</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {selected.length >= 2 && (
              <Link to="/recruteur/comparaison" className="rp-btn rp-btn--outline">
                <FiLayers /> Comparer ({selected.length})
              </Link>
            )}
            <button className="rp-btn rp-btn--outline"><FiDownload /> Exporter</button>
          </div>
        </div>
      </div>

      <div className="rp-card">
        {/* Filters */}
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, minWidth: 220 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un candidat..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option>En attente</option>
              <option>Retenu</option>
              <option>Entretien</option>
              <option>Refusé</option>
            </select>
          </div>
          <div className="rp-filter-input">
            <select value={minScore} onChange={e => setMinScore(e.target.value)}>
              <option value="">Score IA</option>
              <option value="90">90+ (Excellent)</option>
              <option value="80">80+ (Très bon)</option>
              <option value="70">70+ (Bon)</option>
            </select>
          </div>
          <div className="rp-filter-input">
            <select>
              <option value="">Expérience</option>
              <option>0–2 ans</option>
              <option>2–5 ans</option>
              <option>5+ ans</option>
            </select>
          </div>
          <div className="rp-filter-input">
            <select>
              <option value="">Disponibilité</option>
              <option>Immédiate</option>
              <option>1 mois</option>
              <option>2 mois+</option>
            </select>
          </div>
          <button className="rp-btn rp-btn--outline"><FiFilter size={14} /></button>
        </div>

        {/* Table */}
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={e => setSelected(e.target.checked ? CANDIDATES.map(c => c.id) : [])} /></th>
                <th>Candidat</th>
                <th>Contact</th>
                <th>Date candidature</th>
                <th>Expérience</th>
                <th>Score IA</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div className="rp-avatar" style={{ width: 38, height: 38, background: c.color, fontSize: '0.78rem', flexShrink: 0 }}>{c.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.formation}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiMail size={11} /> {c.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiPhone size={11} /> {c.phone}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{c.date}</td>
                  <td style={{ fontSize: '0.82rem' }}>{c.exp}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 48 }}>
                        <div className="rp-progress">
                          <div className="rp-progress__fill" style={{
                            width: `${c.score}%`,
                            background: c.score >= 90 ? 'var(--success)' : c.score >= 75 ? 'var(--primary)' : 'var(--accent)'
                          }} />
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: c.score >= 90 ? 'var(--success)' : 'var(--primary)' }}>{c.score}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>/100</span>
                    </div>
                  </td>
                  <td><span className={`rp-badge rp-badge--${c.statusClass}`}>{c.statut}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      <Link to={`/recruteur/profil/${c.id}`} className="rp-btn rp-btn--outline rp-btn--sm" title="Voir profil">
                        <FiUser size={13} />
                      </Link>
                      <Link to={`/recruteur/analyse-ia`} className="rp-btn rp-btn--outline rp-btn--sm" title="Analyse IA">
                        IA
                      </Link>
                      <button className="rp-btn rp-btn--outline rp-btn--sm" title="CV"><FiDownload size={13} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--sm" title="Entretien"><FiCalendar size={13} /></button>
                      <button className="rp-btn rp-btn--success rp-btn--sm" title="Accepter"><FiCheck size={13} /></button>
                      <button className="rp-btn rp-btn--danger rp-btn--sm" title="Refuser"><FiX size={13} /></button>
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
