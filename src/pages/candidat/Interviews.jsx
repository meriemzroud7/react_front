import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntretiens } from '../../services/apiServiceEntretien';
import { useAuth } from '../../context/AuthContext';

export default function Interviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entretiens, setEntretiens] = useState([]);

  useEffect(() => {
    getEntretiens().then((res) => {
      const mine = res.data.filter((e) => e.candidatId === user?.id);
      setEntretiens(mine);
    });
  }, [user]);

  return (
    <div>
      <h1 className="rp-title">Mes entretiens</h1>
      {entretiens.map((e) => (
        <div key={e.id} className="rp-card" style={{ marginTop: '1rem', padding: '1rem' }}>
          <div style={{ fontWeight: 600 }}>{e.poste}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{e.date} à {e.heure}</div>
          {e.statut === 'CONFIRME' && (
            <button className="rp-btn rp-btn--primary" onClick={() => navigate(`/candidat/entretiens/${e.id}/salle`)}>
              Rejoindre la salle
            </button>
          )}
        </div>
      ))}
    </div>
  );
}