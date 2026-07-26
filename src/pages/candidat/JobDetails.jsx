import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiCalendar, FiBriefcase, FiBookmark, FiSend, FiMessageCircle, FiFlag, FiArrowLeft } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { jobs } from '../../data/candidatMockData';

export default function JobDetails() {
  const { id } = useParams();
  const job = jobs.find((j) => String(j.id) === id) || jobs[0];

  return (
    <div>
      <Link to="/candidat/offres" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1rem' }}>
        <FiArrowLeft /> Retour aux offres
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', gap: '1rem' }}>
              <div className="rp-avatar" style={{ width: 56, height: 56, background: job.color, fontSize: '1.1rem', flexShrink: 0 }}>{job.logo}</div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>{job.role}</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '2px 0 0' }}>{job.company}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} />{job.city}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDollarSign size={12} />{job.salary}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={12} />Date limite : {job.deadline}</span>
                </div>
                <div className="rp-tags" style={{ marginTop: '0.6rem' }}>
                  <span className="rp-badge rp-badge--blue">{job.contract}</span>
                  <span className="rp-badge rp-badge--gray">{job.domain}</span>
                  <span className="rp-badge rp-badge--gray">{job.level}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__body">
              <h3 className="rp-section-title" style={{ marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: 1.6 }}>{job.description}</p>

              <h3 className="rp-section-title" style={{ margin: '1.25rem 0 0.5rem' }}>Missions</h3>
              <ul style={{ paddingLeft: 18, fontSize: '0.85rem', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {job.missions.map((m) => <li key={m}>{m}</li>)}
              </ul>

              <h3 className="rp-section-title" style={{ margin: '1.25rem 0 0.5rem' }}>Profil recherché</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{job.profile}</p>

              <h3 className="rp-section-title" style={{ margin: '1.25rem 0 0.5rem' }}>Avantages</h3>
              <div className="rp-tags">
                {job.benefits.map((b) => <span key={b} className="rp-tag">{b}</span>)}
              </div>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__body">
              <h3 className="rp-section-title" style={{ marginBottom: '0.5rem' }}>
                <span className="rp-section-title-icon"><FiBriefcase size={13} /></span>
                À propos de {job.company}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{job.aboutCompany}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Analyse IA de compatibilité</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}><MatchScore value={job.match} size={100} /></div>
              <div style={{ textAlign: 'left', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>Compétences correspondantes</div>
                  <div className="rp-tags">{job.matchingSkills.map((s) => <span key={s} className="rp-tag rp-tag--ok">{s}</span>)}</div>
                </div>
                {job.missingSkills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>Compétences manquantes</div>
                    <div className="rp-tags">{job.missingSkills.map((s) => <span key={s} className="rp-tag rp-tag--missing">{s}</span>)}</div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Probabilité d'être sélectionné(e)</span>
                  <span style={{ fontWeight: 800, color: 'var(--foreground)' }}>{job.selectionProbability}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button className="rp-btn rp-btn--primary" style={{ justifyContent: 'center' }}><FiSend /> Postuler à cette offre</button>
              <button className="rp-btn rp-btn--outline" style={{ justifyContent: 'center' }}><FiBookmark /> Sauvegarder</button>
              <button className="rp-btn rp-btn--outline" style={{ justifyContent: 'center' }}><FiMessageCircle /> Contacter le recruteur</button>
              <button className="rp-btn" style={{ justifyContent: 'center', background: 'none', color: 'var(--muted)', fontSize: '0.78rem' }}><FiFlag size={13} /> Signaler cette offre</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
