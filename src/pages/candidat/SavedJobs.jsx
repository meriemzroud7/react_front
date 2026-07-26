import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiBookmark } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { jobs, savedJobIds as initialSaved } from '../../data/candidatMockData';

export default function SavedJobs() {
  const [saved, setSaved] = useState(initialSaved);
  const toggleSave = (id) => setSaved((prev) => prev.filter((x) => x !== id));
  const savedJobs = jobs.filter((j) => saved.includes(j.id));

  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Offres sauvegardées</h1>
        <p className="rp-subtitle">{savedJobs.length} offre(s) en favoris</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {savedJobs.map((job) => (
          <div key={job.id} className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="rp-avatar" style={{ width: 48, height: 48, background: job.color, fontSize: '0.9rem' }}>{job.logo}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Link to={`/candidat/offres/${job.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)', textDecoration: 'none' }}>{job.role}</Link>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{job.company}</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.76rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} />{job.city}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDollarSign size={12} />{job.salary}</span>
                </div>
              </div>
              <MatchScore value={job.match} size={52} />
              <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={() => toggleSave(job.id)} style={{ color: 'var(--accent-dark)' }}>
                <FiBookmark size={14} />
              </button>
            </div>
          </div>
        ))}
        {savedJobs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem 0' }}>Vous n'avez sauvegardé aucune offre pour le moment.</p>}
      </div>
    </div>
  );
}
