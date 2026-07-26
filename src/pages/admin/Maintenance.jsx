import React, { useState } from 'react';
import { FiDatabase, FiRotateCcw, FiServer, FiHardDrive, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const SERVERS = [
  { name: 'API Backend (Spring Boot)', status: 'En ligne', load: 42 },
  { name: 'Base de données (MongoDB)', status: 'En ligne', load: 58 },
  { name: 'Service Email (Gmail SMTP)', status: 'En ligne', load: 12 },
];

const VERSIONS = [
  { version: 'v1.4.0', date: '20/07/2026', note: 'Ajout matching IA v2' },
  { version: 'v1.3.2', date: '02/07/2026', note: 'Corrections mineures' },
  { version: 'v1.3.0', date: '15/06/2026', note: 'Module entretiens en ligne' },
];

export default function Maintenance() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Sauvegarde & Maintenance</h1>
            <p className="rp-subtitle">État des serveurs, sauvegardes et mode maintenance</p>
          </div>
        </div>
      </div>

      <div className="rp-grid-2" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title"><FiServer style={{ marginRight: 6 }} /> État des serveurs</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {SERVERS.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.name}</span>
                  <span className="rp-badge rp-badge--green">{s.status}</span>
                </div>
                <div className="rp-progress"><div className="rp-progress__fill" style={{ width: `${s.load}%` }} /></div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Charge : {s.load}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title"><FiHardDrive style={{ marginRight: 6 }} /> Stockage</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="rp-stat" style={{ padding: '0.9rem' }}>
              <div className="rp-stat__value" style={{ fontSize: '1.3rem' }}>3.2 Go / 10 Go</div>
              <div className="rp-stat__label">Utilisation du stockage MongoDB</div>
            </div>
            <div className="rp-progress"><div className="rp-progress__fill rp-progress__fill--amber" style={{ width: '32%' }} /></div>
            <button className="rp-btn rp-btn--primary" style={{ alignSelf: 'flex-start' }}><FiDatabase /> Lancer une sauvegarde manuelle</button>
          </div>
        </div>
      </div>

      <div className="rp-grid-2">
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Gestion des versions</span></div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead><tr><th>Version</th><th>Date</th><th>Notes</th><th>Actions</th></tr></thead>
              <tbody>
                {VERSIONS.map((v, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{v.version}</td>
                    <td>{v.date}</td>
                    <td>{v.note}</td>
                    <td>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Restaurer cette version"><FiRotateCcw size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Mode maintenance</span></div>
          <div className="rp-card__body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1rem', borderRadius: 12, background: 'var(--background)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Activer le mode maintenance</div>
                <p className="rp-hint">La plateforme sera inaccessible aux utilisateurs le temps des opérations.</p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: maintenanceMode ? 'var(--primary)' : 'var(--muted-light)' }}
              >
                {maintenanceMode ? <FiToggleRight size={34} /> : <FiToggleLeft size={34} />}
              </button>
            </div>
            {maintenanceMode && (
              <p style={{ marginTop: '0.9rem', color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>
                ⚠ Le mode maintenance est actif — les utilisateurs ne peuvent pas accéder à la plateforme.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
