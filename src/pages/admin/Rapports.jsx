import React from 'react';
import { FiDownload, FiFileText, FiTrendingUp } from 'react-icons/fi';

const TOP_OFFERS = [
  { title: 'Développeur Full Stack React/Spring', company: 'TechCorp Tunisie', views: 1240, apps: 34 },
  { title: 'Data Analyst Junior', company: 'InnovLab', views: 980, apps: 21 },
  { title: 'Ingénieur DevOps', company: 'TechCorp Tunisie', views: 740, apps: 12 },
];

const SECTORS = [
  { name: 'Informatique', value: 42 },
  { name: 'IA / Data', value: 24 },
  { name: 'Textile', value: 14 },
  { name: 'Santé numérique', value: 12 },
  { name: 'Autres', value: 8 },
];

export default function Rapports() {
  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Rapports & Statistiques</h1>
            <p className="rp-subtitle">Performances globales de la plateforme et du moteur IA</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="rp-btn rp-btn--outline"><FiDownload /> Export PDF</button>
            <button className="rp-btn rp-btn--outline"><FiDownload /> Export Excel</button>
          </div>
        </div>
      </div>

      <div className="rp-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="rp-stat">
          <div className="rp-stat__value">87%</div>
          <div className="rp-stat__label">Taux de réussite des recrutements</div>
        </div>
        <div className="rp-stat">
          <div className="rp-stat__value">213</div>
          <div className="rp-stat__label">Offres actives</div>
        </div>
        <div className="rp-stat">
          <div className="rp-stat__value">18 j</div>
          <div className="rp-stat__label">Délai moyen de recrutement</div>
        </div>
        <div className="rp-stat">
          <div className="rp-stat__value">76%</div>
          <div className="rp-stat__label">Performance moteur IA</div>
        </div>
      </div>

      <div className="rp-grid-2">
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title"><FiTrendingUp style={{ marginRight: 6 }} /> Offres les plus consultées</span>
          </div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead><tr><th>Offre</th><th>Vues</th><th>Candidatures</th></tr></thead>
              <tbody>
                {TOP_OFFERS.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{o.company}</div>
                    </td>
                    <td>{o.views}</td>
                    <td>{o.apps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title"><FiFileText style={{ marginRight: 6 }} /> Secteurs les plus actifs</span>
          </div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {SECTORS.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span>{s.name}</span>
                  <span style={{ fontWeight: 700 }}>{s.value}%</span>
                </div>
                <div className="rp-progress"><div className="rp-progress__fill" style={{ width: `${s.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
