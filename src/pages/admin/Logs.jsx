import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { getUsers } from '../../services/apiServiceUser';
import { getAllOffres } from '../../services/apiServiceOffres';
import CandidatureService from '../../services/apiServiceCandidature';
import { getEntretiens } from '../../services/apiServiceEntretien';

const SEVERITY_BADGE = { Info: 'blue', Avertissement: 'amber', Erreur: 'red' };

function getUserField(user, ...keys) {
  for (const k of keys) {
    if (user && user[k] !== undefined && user[k] !== null && user[k] !== '') return user[k];
  }
  return '';
}

function formatDate(dateIso) {
  if (!dateIso) return '';
  const d = new Date(dateIso);
  if (isNaN(d)) return dateIso;
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Logs() {
  const [users, setUsers] = useState([]);
  const [offres, setOffres] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('Tous');

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, offresRes, candidaturesData, entretiensRes] = await Promise.all([
          getUsers(),
          getAllOffres(),
          CandidatureService.getAll(),
          getEntretiens(),
        ]);
        if (cancelled) return;

        setUsers(usersRes.data || []);
        setOffres(offresRes.data || []);
        setCandidatures(Array.isArray(candidaturesData) ? candidaturesData : []);
        setEntretiens(entretiensRes.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement du journal d'activité :", err);
        if (!cancelled) setError("Impossible de charger le journal d'activité.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLogs();
    return () => { cancelled = true; };
  }, []);

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  // ── Journal reconstruit à partir des vraies données (offres, candidatures, entretiens) ──
  const logs = useMemo(() => {
    const fromOffres = offres
      .filter((o) => o.dateCreation)
      .map((o) => ({
        id: `offre-${o.id}`,
        user: o.nomEntreprise || 'Recruteur',
        action: `Publication offre « ${o.titre} »`,
        date: o.dateCreation,
        severity: 'Info',
      }));

    const fromCandidatures = candidatures
      .filter((c) => c.dateCandidature)
      .map((c) => {
        const candidat = usersById[c.candidatId];
        const nom = candidat ? `${getUserField(candidat, 'prenom')} ${getUserField(candidat, 'nom')}`.trim() : '';
        return {
          id: `cand-${c.id}`,
          user: nom || 'Candidat',
          action: 'Candidature soumise',
          date: c.dateCandidature,
          severity: c.statut === 'REFUSE' ? 'Avertissement' : 'Info',
        };
      });

    const fromEntretiens = entretiens
      .filter((e) => e.date)
      .map((e) => ({
        id: `ent-${e.id}`,
        user: e.poste || 'Entretien',
        action: `Entretien ${e.statut === 'TERMINE' ? 'terminé' : e.statut === 'CONFIRME' ? 'confirmé' : 'programmé'}`,
        date: e.date,
        severity: 'Info',
      }));

    return [...fromOffres, ...fromCandidatures, ...fromEntretiens]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [offres, candidatures, entretiens, usersById]);

  const filtered = logs.filter((l) =>
    (severity === 'Tous' || l.severity === severity) &&
    (l.user.toLowerCase().includes(query.toLowerCase()) || l.action.toLowerCase().includes(query.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="rp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
        <FiLoader className="rp-spin" /> Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
        <FiAlertCircle size={28} color="var(--danger, #dc2626)" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Journal d'Activité</h1>
            <p className="rp-subtitle">Historique des actions réalisées sur la plateforme</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un utilisateur ou une action..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={severity} onChange={e => setSeverity(e.target.value)}>
              <option>Tous</option>
              <option>Info</option>
              <option>Avertissement</option>
              <option>Erreur</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Date</th>
                <th>Niveau</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16 }}>Aucun résultat.</td></tr>
              ) : (
                filtered.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.user}</td>
                    <td>{l.action}</td>
                    <td>{formatDate(l.date)}</td>
                    <td><span className={`rp-badge rp-badge--${SEVERITY_BADGE[l.severity]}`}>{l.severity}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}