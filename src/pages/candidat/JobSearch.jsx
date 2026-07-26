import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiDollarSign, FiClock, FiBookmark } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { jobs, savedJobIds as initialSaved } from '../../data/candidatMockData';

const CONTRACT_FILTERS = ['CDI', 'CDD', 'Stage', 'Alternance', 'Télétravail', 'Temps plein', 'Temps partiel'];

export default function JobSearch() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [saved, setSaved] = useState(initialSaved);

  const toggleFilter = (f) => setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  const toggleSave = (id) => setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const results = useMemo(() => jobs.filter((j) => {
    const matchesQuery = !query || j.role.toLowerCase().includes(query.toLowerCase()) || j.company.toLowerCase().includes(query.toLowerCase()) || j.city.toLowerCase().includes(query.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || activeFilters.some((f) => j.contract === f);
    return matchesQuery && matchesFilters;
  }), [query, activeFilters]);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Rechercher des offres</h1>
            <p className="rp-subtitle">{results.length} offre(s) correspondant à votre recherche</p>
          </div>
        </div>
      </div>

      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-filters" style={{ border: 'none' }}>
          <div className="rp-filter-input" style={{ flex: 1, minWidth: 240 }}>
            <FiSearch className="rp-filter-icon" />
            <input
              style={{ width: '100%' }}
              placeholder="Mot-clé, entreprise, ville, domaine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0 1.25rem 1.1rem' }}>
          {CONTRACT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={`rp-badge ${activeFilters.includes(f) ? 'rp-badge--blue' : 'rp-badge--gray'}`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.map((job) => (
          <div key={job.id} className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="rp-avatar" style={{ width: 48, height: 48, background: job.color, fontSize: '0.95rem' }}>{job.logo}</div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <Link to={`/candidat/offres/${job.id}`} style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', textDecoration: 'none' }}>{job.role}</Link>
                  <button
                    className="rp-btn rp-btn--outline rp-btn--icon"
                    onClick={() => toggleSave(job.id)}
                    style={{ color: saved.includes(job.id) ? 'var(--accent-dark)' : 'var(--muted)', borderColor: saved.includes(job.id) ? 'var(--accent)' : 'var(--border)' }}
                  >
                    <FiBookmark size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{job.company}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} />{job.city}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDollarSign size={12} />{job.salary}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} />{job.published}</span>
                </div>
                <div className="rp-tags" style={{ marginTop: '0.5rem' }}>
                  <span className="rp-badge rp-badge--blue">{job.contract}</span>
                  <span className="rp-badge rp-badge--gray">{job.domain}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1rem' }}>
                <MatchScore value={job.match} size={56} />
                <Link to={`/candidat/offres/${job.id}`} className="rp-btn rp-btn--outline rp-btn--sm">Voir l'offre</Link>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem 0' }}>Aucune offre ne correspond à votre recherche.</p>}
      </div>
    </div>
  );
}
