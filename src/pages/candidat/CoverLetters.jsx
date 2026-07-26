import React from 'react';
import { FiMail, FiZap, FiEye, FiDownload, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import { coverLetters } from '../../data/candidatMockData';

export default function CoverLetters() {
  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Lettres de motivation</h1>
            <p className="rp-subtitle">Créez, générez avec l'IA, et gérez vos lettres de motivation</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="rp-btn rp-btn--outline"><FiPlusCircle /> Créer une lettre</button>
            <button className="rp-btn rp-btn--accent"><FiZap /> Générer avec l'IA</button>
          </div>
        </div>
      </div>

      <div className="rp-grid-2">
        {coverLetters.map((l) => (
          <div key={l.id} className="rp-card">
            <div className="rp-card__body">
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(15,118,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiMail size={18} color="#0f766e" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)' }}>{l.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>Modifiée le {l.updated}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="rp-btn rp-btn--outline rp-btn--sm"><FiEye /> Prévisualiser</button>
                <button className="rp-btn rp-btn--outline rp-btn--sm"><FiDownload /> Télécharger</button>
                <button className="rp-btn rp-btn--danger rp-btn--icon" style={{ marginLeft: 'auto' }}><FiTrash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
