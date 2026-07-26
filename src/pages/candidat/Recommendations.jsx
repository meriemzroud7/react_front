import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiTrendingUp, FiMapPin, FiDollarSign, FiBookmark } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { jobs, savedJobIds } from '../../data/candidatMockData';

export default function Recommendations() {
  const [saved, setSaved] = useState(savedJobIds);
  const toggleSave = (id) => setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const sorted = [...jobs].sort((a, b) => b.match - a.match);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Recommandations IA</h1>
            <p className="rp-subtitle">Des offres sélectionnées pour vous selon votre profil et votre CV</p>
          </div>
        </div>
      </div>

      <div className="rp-card" style={{ marginBottom: '1.25rem', background: 'var(--primary)', border: 'none' }}>
        <div className="rp-card__body" style={{ display: 'flex', gap: '1rem', color: '#fff' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiZap size={20} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Comment ça marche ?</div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', margin: '0.3rem 0 0' }}>
              Notre IA analyse votre CV, vos compétences et vos préférences pour classer les offres selon leur compatibilité avec votre profil.
              Complétez votre profil et vos compétences pour affiner davantage vos recommandations.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sorted.map((job) => (
          <div key={job.id}>
            <div className="rp-card">
              <div className="rp-card__body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="rp-avatar" style={{ width: 48, height: 48, background: job.color, fontSize: '0.95rem' }}>{job.logo}</div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <Link to={`/candidat/offres/${job.id}`} style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', textDecoration: 'none' }}>{job.role}</Link>
                    <button
                      className="rp-btn rp-btn--outline rp-btn--icon"
                      onClick={() => toggleSave(job.id)}
                      style={{ color: saved.includes(job.id) ? 'var(--accent-dark)' : 'var(--muted)' }}
                    >
                      <FiBookmark size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{job.company}</div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.76rem', color: 'var(--muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} />{job.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDollarSign size={12} />{job.salary}</span>
                  </div>
                </div>
                <MatchScore value={job.match} size={56} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.4rem', marginLeft: '0.5rem', fontSize: '0.76rem', color: 'var(--primary)' }}>
              <FiTrendingUp size={12} /> Recommandée car vous maîtrisez {job.matchingSkills.slice(0, 2).join(' et ') || job.skillsRequired[0]}.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
