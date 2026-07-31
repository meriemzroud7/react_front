import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiVideo, FiMapPin, FiUsers, FiCalendar } from 'react-icons/fi';
import { getEntretiens } from '../../services/apiServiceEntretien';
import { useAuth } from '../../context/AuthContext';

const STATUT_CONFIG = {
  PROGRAMME: { label: 'Programmé', className: 'blue' },
  CONFIRME: { label: 'Confirmé', className: 'green' },
  TERMINE: { label: 'Terminé', className: 'gray' },
  ANNULE: { label: 'Annulé', className: 'red' },
};

function formatDateLabel(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Interviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getEntretiens()
      .then((res) => {
        const mine = res.data.filter((e) => e.candidatId === user.id);
        setEntretiens(mine);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <div className="rp-header">
        <div>
          <h1 className="rp-title">Mes entretiens</h1>
          <p className="rp-subtitle">Vos entretiens programmés avec les recruteurs</p>
        </div>
      </div>

      <div className="rp-card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <p style={{ padding: '1rem 0', color: 'var(--muted)' }}>Chargement...</p>
        ) : entretiens.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>
            <FiCalendar size={28} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>Aucun entretien programmé pour le moment.</p>
          </div>
        ) : (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Poste</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Type</th>
                  <th>Intervieweurs</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entretiens.map((e) => {
                  const statutCfg = STATUT_CONFIG[e.statut] || { label: e.statut, className: 'gray' };
                  const isEnLigne = e.type === 'EN_LIGNE';
                  const canJoin = e.statut === 'CONFIRME';

                  return (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{e.poste}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDateLabel(e.date)}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiClock size={12} /> {e.heure}</span>
                      </td>
                      <td>
                        <span className={`rp-badge rp-badge--${isEnLigne ? 'blue' : 'amber'}`}>
                          {isEnLigne ? <FiVideo size={11} /> : <FiMapPin size={11} />} {isEnLigne ? 'En ligne' : 'Présentiel'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiUsers size={12} /> {(e.intervieweurs || []).join(', ') || '—'}
                        </span>
                      </td>
                      <td><span className={`rp-badge rp-badge--${statutCfg.className}`}>{statutCfg.label}</span></td>
                      <td>
                        {canJoin ? (
                          <button className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => navigate(`/candidat/entretiens/${e.id}/salle`)}>
                            <FiVideo size={13} /> Rejoindre
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted-light)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}