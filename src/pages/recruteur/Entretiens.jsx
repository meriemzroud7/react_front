import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiVideo, FiEdit2, FiCalendar, FiXCircle, FiClock, FiUsers } from 'react-icons/fi';

const INTERVIEWS = [
  { id: 1, candidat: 'Yasmine Ben Ali', avatar: 'YB', color: '#1e4fa3', poste: 'Software Engineer', date: '20 Jan 2025', heure: '14:00', type: 'En ligne', intervieweurs: ['Mariem K.', 'Karim B.'], statut: 'Programmé', statusClass: 'blue' },
  { id: 2, candidat: 'Sarra Chaari', avatar: 'SC', color: '#7c3aed', poste: 'Software Engineer', date: '22 Jan 2025', heure: '10:30', type: 'Présentiel', intervieweurs: ['Mariem K.'], statut: 'Confirmé', statusClass: 'green' },
  { id: 3, candidat: 'Ahmed Maalej', avatar: 'AM', color: '#0f766e', poste: 'Data Analyst', date: '23 Jan 2025', heure: '15:00', type: 'En ligne', intervieweurs: ['Mariem K.', 'Sami T.'], statut: 'Programmé', statusClass: 'blue' },
  { id: 4, candidat: 'Fathi Hamdi', avatar: 'FH', color: '#b45309', poste: 'Product Manager', date: '18 Jan 2025', heure: '11:00', type: 'En ligne', intervieweurs: ['Mariem K.'], statut: 'Terminé', statusClass: 'gray' },
  { id: 5, candidat: 'Inès Sfar', avatar: 'IS', color: '#0891b2', poste: 'UX Designer', date: '17 Jan 2025', heure: '09:00', type: 'Présentiel', intervieweurs: ['Mariem K.', 'Nour H.'], statut: 'Annulé', statusClass: 'red' },
];

const STATUT_CLASS = { Programmé: 'blue', Confirmé: 'green', Terminé: 'gray', Annulé: 'red' };

export default function Entretiens() {
  const [filter, setFilter] = useState('');

  const filtered = INTERVIEWS.filter(e => !filter || e.statut === filter);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des entretiens</h1>
            <p className="rp-subtitle">{INTERVIEWS.length} entretiens · {INTERVIEWS.filter(e => e.statut === 'Programmé').length} programmés</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/recruteur/calendrier" className="rp-btn rp-btn--outline"><FiCalendar /> Calendrier</Link>
            <button className="rp-btn rp-btn--primary"><FiPlus /> Programmer</button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: INTERVIEWS.length, color: '#1e4fa3', bg: 'rgba(30,79,163,0.08)' },
          { label: 'Programmés', val: INTERVIEWS.filter(e => e.statut === 'Programmé').length, color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
          { label: 'Confirmés', val: INTERVIEWS.filter(e => e.statut === 'Confirmé').length, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'Terminés', val: INTERVIEWS.filter(e => e.statut === 'Terminé').length, color: '#6b7a8d', bg: 'rgba(107,122,141,0.08)' },
        ].map((s, i) => (
          <div key={i} className="rp-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rp-card">
        {/* Filter */}
        <div className="rp-filters">
          {['', 'Programmé', 'Confirmé', 'Terminé', 'Annulé'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className="rp-btn rp-btn--outline rp-btn--sm"
              style={{ background: filter === s ? 'var(--primary)' : '#fff', color: filter === s ? '#fff' : 'var(--foreground)', borderColor: filter === s ? 'var(--primary)' : 'var(--border)' }}>
              {s || 'Tous'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Poste</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Type</th>
                <th>Intervieweurs</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="rp-avatar" style={{ width: 34, height: 34, background: e.color, fontSize: '0.7rem', flexShrink: 0 }}>{e.avatar}</div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{e.candidat}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{e.poste}</td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{e.date}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}>
                      <FiClock size={12} style={{ color: 'var(--muted)' }} /> {e.heure}
                    </div>
                  </td>
                  <td>
                    <span className={`rp-badge ${e.type === 'En ligne' ? 'rp-badge--blue' : 'rp-badge--amber'}`}>
                      {e.type === 'En ligne' ? <FiVideo size={10} /> : null} {e.type}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
                      <FiUsers size={12} /> {e.intervieweurs.join(', ')}
                    </div>
                  </td>
                  <td><span className={`rp-badge rp-badge--${STATUT_CLASS[e.statut]}`}>{e.statut}</span></td>
                  <td>
                    <div className="rp-table__actions">
                      {e.statut !== 'Terminé' && e.statut !== 'Annulé' && (
                        <Link to="/recruteur/salle-entretien" className="rp-btn rp-btn--primary rp-btn--sm" title="Démarrer">
                          <FiVideo size={12} /> Démarrer
                        </Link>
                      )}
                      <button className="rp-btn rp-btn--outline rp-btn--sm" title="Modifier"><FiEdit2 size={12} /></button>
                      <button className="rp-btn rp-btn--outline rp-btn--sm" title="Reporter"><FiCalendar size={12} /></button>
                      {e.statut !== 'Annulé' && (
                        <button className="rp-btn rp-btn--danger rp-btn--sm" title="Annuler"><FiXCircle size={12} /></button>
                      )}
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
