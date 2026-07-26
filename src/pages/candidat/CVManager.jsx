import React from 'react';
import { FiFileText, FiDownload, FiTrash2, FiStar, FiUploadCloud, FiEdit3, FiCheckCircle } from 'react-icons/fi';
import MatchScore from '../../composant/MatchScore';
import { cvData } from '../../data/candidatMockData';

export default function CVManager() {
  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Mon CV</h1>
            <p className="rp-subtitle">Importez votre CV ou créez-en un en ligne, analysé automatiquement par l'IA</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__body">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(30,79,163,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FiFileText size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--foreground)' }}>{cvData.fileName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>Importé le {cvData.uploadedAt}</div>
                    {cvData.isDefault && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>
                        <FiStar size={11} /> CV par défaut
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="rp-btn rp-btn--outline rp-btn--icon"><FiDownload size={14} /></button>
                  <button className="rp-btn rp-btn--danger rp-btn--icon"><FiTrash2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button className="rp-btn rp-btn--primary"><FiUploadCloud /> Téléverser un nouveau CV</button>
                <button className="rp-btn rp-btn--outline"><FiEdit3 /> Créer un CV en ligne</button>
              </div>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Extraction automatique</span></div>
            <div className="rp-card__body rp-grid-3">
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: 8 }}>Compétences</div>
                <div className="rp-tags">
                  {cvData.extracted.skills.map((s) => <span key={s} className="rp-tag rp-tag--ok">{s}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: 8 }}>Expériences</div>
                <ul style={{ fontSize: '0.8rem', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 14 }}>
                  {cvData.extracted.experience.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: 8 }}>Diplômes</div>
                <ul style={{ fontSize: '0.8rem', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 14 }}>
                  {cvData.extracted.education.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase' }}>Score de qualité du CV</span>
              <MatchScore value={cvData.qualityScore} size={100} />
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>Bon score ! Quelques ajustements peuvent encore l'améliorer.</p>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Suggestions d'amélioration</span></div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {cvData.suggestions.map((s) => (
                <div key={s} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--foreground)' }}>
                  <FiCheckCircle color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
