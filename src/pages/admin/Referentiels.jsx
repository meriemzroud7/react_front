import React, { useState } from 'react';
import { FiPlusCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { REFERENTIELS } from '../../data/adminMockData';

const TABS = [
  { key: 'secteurs', label: "Secteurs d'activité" },
  { key: 'contrats', label: 'Types de contrats' },
  { key: 'niveauxEtudes', label: "Niveaux d'études" },
  { key: 'niveauxExperience', label: "Niveaux d'expérience" },
  { key: 'langues', label: 'Langues' },
];

export default function Referentiels() {
  const [active, setActive] = useState('secteurs');
  const items = REFERENTIELS[active];

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Catégories & Référentiels</h1>
            <p className="rp-subtitle">Gérez les listes de valeurs utilisées dans toute la plateforme</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div style={{ display: 'flex', gap: '0.4rem', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`rp-btn rp-btn--sm ${active === t.key ? 'rp-btn--primary' : 'rp-btn--outline'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rp-card__header">
          <span className="rp-card__title">{TABS.find(t => t.key === active).label}</span>
          <button className="rp-btn rp-btn--primary rp-btn--sm"><FiPlusCircle /> Ajouter</button>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Valeur</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{v}</td>
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
