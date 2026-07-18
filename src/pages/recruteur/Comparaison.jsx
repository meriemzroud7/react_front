import React, { useState } from 'react';
import { FiDownload, FiCheck, FiX } from 'react-icons/fi';

const ALL_CANDIDATES = [
  { id: 1, name: 'Yasmine Ben Ali', avatar: 'YB', color: '#1e4fa3', score: 94, exp: '4 ans', formation: 'Ingénieur ENIT', langues: 'FR / EN / AR', soft: 'Leadership, Communication', hard: 'React, Node.js, TS, PG', dispo: 'Immédiate', salaire: '4 000 TND', statut: 'Retenu' },
  { id: 2, name: 'Sarra Chaari', avatar: 'SC', color: '#7c3aed', score: 91, exp: '5 ans', formation: 'Master ESPRIT', langues: 'EN / AR', soft: 'Autonomie, Rigueur', hard: 'React, Docker, AWS, K8s', dispo: '2 semaines', salaire: '3 800 TND', statut: 'Entretien' },
  { id: 3, name: 'Ahmed Maalej', avatar: 'AM', color: '#0f766e', score: 87, exp: '3 ans', formation: 'Master Data Science', langues: 'FR / EN / AR', soft: 'Adaptabilité, Esprit d\'équipe', hard: 'Python, React, SQL, ML', dispo: '1 mois', salaire: '3 200 TND', statut: 'En attente' },
  { id: 4, name: 'Fathi Hamdi', avatar: 'FH', color: '#b45309', score: 83, exp: '6 ans', formation: 'Master Management', langues: 'FR / AR', soft: 'Gestion de projet, Vision', hard: 'PM Tools, Agile, SQL', dispo: 'Immédiate', salaire: '4 500 TND', statut: 'En attente' },
];

const ROWS = [
  { key: 'score', label: 'Score IA', render: (v) => <strong style={{ color: v >= 90 ? 'var(--success)' : v >= 80 ? 'var(--primary)' : 'var(--accent)', fontSize: '1.2rem' }}>{v}/100</strong> },
  { key: 'exp', label: 'Expérience' },
  { key: 'formation', label: 'Formation' },
  { key: 'langues', label: 'Langues' },
  { key: 'soft', label: 'Soft skills' },
  { key: 'hard', label: 'Hard skills' },
  { key: 'dispo', label: 'Disponibilité' },
  { key: 'salaire', label: 'Salaire souhaité' },
];

export default function Comparaison() {
  const [selected, setSelected] = useState([1, 2, 3]);

  const candidates = ALL_CANDIDATES.filter(c => selected.includes(c.id));

  const toggleCandidate = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.length > 2 ? prev.filter(x => x !== id) : prev
        : [...prev, id]
    );
  };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Comparaison des candidats</h1>
            <p className="rp-subtitle">Comparez jusqu'à 4 candidats côte à côte</p>
          </div>
          <button className="rp-btn rp-btn--outline"><FiDownload /> Export PDF</button>
        </div>
      </div>

      {/* Selector */}
      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card__header"><span className="rp-card__title">Sélectionner les candidats à comparer</span></div>
        <div className="rp-card__body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {ALL_CANDIDATES.map(c => (
            <button key={c.id} onClick={() => toggleCandidate(c.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem',
              border: `2px solid ${selected.includes(c.id) ? c.color : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', background: selected.includes(c.id) ? `${c.color}12` : '#fff',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font)'
            }}>
              <div className="rp-avatar" style={{ width: 28, height: 28, background: c.color, fontSize: '0.65rem' }}>{c.avatar}</div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selected.includes(c.id) ? c.color : 'var(--foreground)' }}>{c.name}</span>
              {selected.includes(c.id) && <FiCheck size={13} style={{ color: c.color }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="rp-card">
        <div className="rp-table-wrap">
          <table className="rp-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ width: 160 }}>Critère</th>
                {candidates.map(c => (
                  <th key={c.id} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0' }}>
                      <div className="rp-avatar" style={{ width: 40, height: 40, background: c.color, fontSize: '0.82rem' }}>{c.avatar}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'none' }}>{c.name}</div>
                      <span className={`rp-badge rp-badge--${c.statut === 'Retenu' ? 'green' : c.statut === 'Entretien' ? 'blue' : 'amber'}`}>{c.statut}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr key={row.key}>
                  <td style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.label}</td>
                  {candidates.map(c => (
                    <td key={c.id} style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                      {row.render ? row.render(c[row.key]) : c[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Action row */}
              <tr style={{ background: 'rgba(30,79,163,0.02)' }}>
                <td style={{ fontWeight: 700, fontSize: '0.82rem' }}>Décision</td>
                {candidates.map(c => (
                  <td key={c.id} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button className="rp-btn rp-btn--success rp-btn--sm">
                        <FiCheck size={12} /> Retenir
                      </button>
                      <button className="rp-btn rp-btn--danger rp-btn--sm">
                        <FiX size={12} />
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
