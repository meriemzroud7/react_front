import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiDownload, FiXCircle } from 'react-icons/fi';
import { applications } from '../../data/candidatMockData';

export default function MyApplications() {
  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Mes candidatures</h1>
            <p className="rp-subtitle">{applications.length} candidature(s) au total</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Poste / Entreprise</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Score IA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="rp-avatar" style={{ width: 32, height: 32, background: a.color, fontSize: '0.7rem' }}>{a.avatar}</div>
                      <div>
                        <Link to={`/candidat/candidatures/${a.id}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)', textDecoration: 'none' }}>{a.role}</Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{a.company}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{a.date}</td>
                  <td><span className={`rp-badge rp-badge--${a.statusClass}`}>{a.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div className="rp-progress" style={{ width: 60 }}>
                        <div className="rp-progress__fill" style={{ width: `${a.aiScore}%`, background: a.aiScore >= 90 ? 'var(--success)' : a.aiScore >= 75 ? 'var(--primary)' : 'var(--accent)' }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{a.aiScore}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rp-table__actions">
                      <Link to={`/candidat/candidatures/${a.id}`} className="rp-btn rp-btn--outline rp-btn--icon"><FiEye size={14} /></Link>
                      <button className="rp-btn rp-btn--outline rp-btn--icon"><FiDownload size={14} /></button>
                      <button className="rp-btn rp-btn--danger rp-btn--icon"><FiXCircle size={14} /></button>
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
