import React, { useState } from 'react';
import { FiCpu, FiRefreshCw, FiEye, FiSave } from 'react-icons/fi';

const CRITERIA = [
  { key: 'competences', label: 'Compétences', value: 40 },
  { key: 'experience', label: 'Expérience', value: 25 },
  { key: 'diplomes', label: 'Diplômes', value: 20 },
  { key: 'langues', label: 'Langues', value: 15 },
];

const HISTORY = [
  { id: 1, offer: 'Développeur Full Stack', candidates: 34, avgScore: 78, date: '25/07/2026' },
  { id: 2, offer: 'Data Analyst Junior', candidates: 21, avgScore: 71, date: '24/07/2026' },
  { id: 3, offer: 'Ingénieur DevOps', candidates: 12, avgScore: 65, date: '18/01/2026' },
];

export default function GestionIA() {
  const [weights, setWeights] = useState(CRITERIA);
  const [threshold, setThreshold] = useState(60);
  const total = weights.reduce((a, c) => a + c.value, 0);

  const updateWeight = (key, value) => {
    setWeights(prev => prev.map(w => w.key === key ? { ...w, value: Number(value) } : w));
  };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion de l'IA</h1>
            <p className="rp-subtitle">Superviser le moteur de matching et les analyses automatiques</p>
          </div>
        </div>
      </div>

      <div className="rp-grid-2" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title"><FiCpu style={{ marginRight: 6 }} /> Pondération des critères</span>
          </div>
          <div className="rp-card__body rp-form">
            {weights.map(w => (
              <div className="rp-field" key={w.key}>
                <label className="rp-label">{w.label} — {w.value}%</label>
                <input type="range" min={0} max={100} value={w.value} onChange={e => updateWeight(w.key, e.target.value)} />
              </div>
            ))}
            <p className="rp-hint" style={{ color: total !== 100 ? 'var(--danger)' : 'var(--muted)' }}>
              Total : {total}% {total !== 100 && '— la somme doit être égale à 100%'}
            </p>
            <div className="rp-field">
              <label className="rp-label">Seuil minimal de compatibilité</label>
              <input type="range" min={0} max={100} value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
              <p className="rp-hint">Un candidat doit atteindre {threshold}% pour être proposé au recruteur.</p>
            </div>
            <button className="rp-btn rp-btn--primary" style={{ alignSelf: 'flex-start' }}><FiSave /> Enregistrer les paramètres</button>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">Statistiques des recommandations</span>
          </div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="rp-grid-2" style={{ gap: '0.75rem' }}>
              <div className="rp-stat" style={{ padding: '0.9rem' }}>
                <div className="rp-stat__value" style={{ fontSize: '1.3rem' }}>3 407</div>
                <div className="rp-stat__label">Analyses effectuées</div>
              </div>
              <div className="rp-stat" style={{ padding: '0.9rem' }}>
                <div className="rp-stat__value" style={{ fontSize: '1.3rem' }}>76%</div>
                <div className="rp-stat__label">Score moyen de matching</div>
              </div>
              <div className="rp-stat" style={{ padding: '0.9rem' }}>
                <div className="rp-stat__value" style={{ fontSize: '1.3rem' }}>82%</div>
                <div className="rp-stat__label">Taux d'adoption recruteurs</div>
              </div>
              <div className="rp-stat" style={{ padding: '0.9rem' }}>
                <div className="rp-stat__value" style={{ fontSize: '1.3rem' }}>1.2s</div>
                <div className="rp-stat__label">Temps moyen d'analyse</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-card__header">
          <span className="rp-card__title">Historique des analyses IA</span>
        </div>
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Offre</th>
                <th>Candidats analysés</th>
                <th>Score moyen</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.offer}</td>
                  <td>{h.candidates}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="rp-progress" style={{ width: 70 }}>
                        <div className="rp-progress__fill" style={{ width: `${h.avgScore}%` }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{h.avgScore}%</span>
                    </div>
                  </td>
                  <td>{h.date}</td>
                  <td>
                    <div className="rp-table__actions">
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter"><FiEye size={14} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--icon" title="Relancer l'analyse"><FiRefreshCw size={14} /></button>
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
