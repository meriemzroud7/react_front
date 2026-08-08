import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiXCircle, FiRefreshCw, FiClipboard, FiVideo, FiMapPin, FiUsers } from 'react-icons/fi';
import {
  getEntretiens,
  modifierEntretien,
  changerStatut,
  enregistrerEvaluation,
} from '../../services/apiServiceEntretien';

const STATUT_BACKEND_TO_LABEL = {
  PROGRAMME: 'Programmé',
  CONFIRME: 'Confirmé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

const TYPE_BACKEND_TO_LABEL = {
  ONLINE: 'En ligne',
  EN_LIGNE: 'En ligne',
  PRESENTIEL: 'Présentiel',
};

function statusToBadge(label) {
  switch (label) {
    case 'Programmé': return 'blue';
    case 'Confirmé': return 'green';
    case 'En cours': return 'amber';
    case 'Terminé': return 'gray';
    case 'Annulé': return 'red';
    default: return 'gray';
  }
}

export default function Entretiens() {
  const [query, setQuery] = useState('');
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entretienSelectionne, setEntretienSelectionne] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { data: rawEntretiens } = await getEntretiens();

        const rows = rawEntretiens.map(e => ({
          id: e.id,
          candidatId: e.candidatId,
          candidate: e.candidatNom || (e.candidatId ? `Candidat #${e.candidatId}` : '-'),
          poste: e.poste || '-',
          intervieweurs: Array.isArray(e.intervieweurs) && e.intervieweurs.length > 0
            ? e.intervieweurs.join(', ')
            : '-',
          date: e.date || '-',
          heure: e.heure || '-',
          type: TYPE_BACKEND_TO_LABEL[e.type] || e.type || 'En ligne',
          typeBackend: e.type,
          status: STATUT_BACKEND_TO_LABEL[e.statut] || e.statut || 'Programmé',
          statutBackend: e.statut,
          salleId: e.salleId,
          notes: e.notes,
        }));

        if (!cancelled) setEntretiens(rows);
      } catch (err) {
        console.error('Erreur lors du chargement des entretiens :', err);
        if (!cancelled) setError("Impossible de charger les entretiens depuis le serveur.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => entretiens.filter(e => e.candidate.toLowerCase().includes(query.toLowerCase())),
    [entretiens, query]
  );

  async function handleAnnuler(id) {
    if (!window.confirm('Annuler cet entretien ?')) return;
    try {
      await changerStatut(id, 'ANNULE');
      setEntretiens(prev =>
        prev.map(e => (e.id === id ? { ...e, status: 'Annulé', statutBackend: 'ANNULE' } : e))
      );
    } catch (err) {
      console.error("Erreur lors de l'annulation :", err);
      alert("L'annulation a échoué.");
    }
  }

  async function handleReprogrammer(entretien) {
    const nouvelleDate = window.prompt('Nouvelle date (AAAA-MM-JJ) :', entretien.date !== '-' ? entretien.date : '');
    if (!nouvelleDate) return;
    const nouvelleHeure = window.prompt('Nouvelle heure (HH:mm) :', entretien.heure !== '-' ? entretien.heure : '');
    if (!nouvelleHeure) return;
    try {
      const { data } = await modifierEntretien(entretien.id, {
        date: nouvelleDate,
        heure: nouvelleHeure,
        statut: 'PROGRAMME',
      });
      setEntretiens(prev =>
        prev.map(e =>
          e.id === entretien.id
            ? { ...e, date: data.date || nouvelleDate, heure: data.heure || nouvelleHeure, status: 'Programmé', statutBackend: 'PROGRAMME' }
            : e
        )
      );
    } catch (err) {
      console.error('Erreur lors de la reprogrammation :', err);
      alert('La reprogrammation a échoué.');
    }
  }

  async function handleEvaluation(entretien) {
    const note = window.prompt('Note d\'évaluation (0-20) :');
    if (note === null) return;
    const commentaire = window.prompt('Commentaire :') || '';
    try {
      await enregistrerEvaluation(entretien.id, { note: Number(note), commentaire });
      alert('Évaluation enregistrée.');
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'évaluation :", err);
      alert("L'enregistrement de l'évaluation a échoué.");
    }
  }

  function handleVoir(entretien) {
    setEntretienSelectionne(entretien);
  }

  function handleModifier(entretien) {
    const nouveauType = window.prompt('Type d\'entretien (ONLINE / PRESENTIEL) :', entretien.typeBackend || 'ONLINE');
    if (!nouveauType) return;
    modifierEntretien(entretien.id, { type: nouveauType.toUpperCase() })
      .then(({ data }) => {
        setEntretiens(prev =>
          prev.map(e =>
            e.id === entretien.id
              ? { ...e, type: TYPE_BACKEND_TO_LABEL[data.type] || data.type, typeBackend: data.type }
              : e
          )
        );
      })
      .catch(err => {
        console.error('Erreur lors de la modification :', err);
        alert('La modification a échoué.');
      });
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Entretiens</h1>
            <p className="rp-subtitle">{filtered.length} entretien(s) planifiés ou réalisés</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input
              placeholder="Rechercher un candidat..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {loading && <p style={{ padding: '1rem' }}>Chargement des entretiens...</p>}
        {error && <p style={{ padding: '1rem', color: 'crimson' }}>{error}</p>}

        {!loading && !error && (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Poste</th>
                  <th>Intervieweur(s)</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.candidate}</td>
                    <td>{e.poste}</td>
                    <td>{e.intervieweurs}</td>
                    <td>{e.date}</td>
                    <td>{e.heure}</td>
                    <td>
                      <span className="rp-badge rp-badge--blue">
                        {e.type === 'En ligne' ? <FiVideo size={11} /> : <FiMapPin size={11} />} {e.type}
                      </span>
                    </td>
                    <td>
                      <span className={`rp-badge rp-badge--${statusToBadge(e.status)}`}>{e.status}</span>
                    </td>
                    <td>
                      <div className="rp-table__actions">
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter" onClick={() => handleVoir(e)}>
                          <FiEye size={14} />
                        </button>
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier" onClick={() => handleModifier(e)}>
                          <FiEdit2 size={14} />
                        </button>
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Reprogrammer" onClick={() => handleReprogrammer(e)}>
                          <FiRefreshCw size={14} />
                        </button>
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Évaluations" onClick={() => handleEvaluation(e)}>
                          <FiClipboard size={14} />
                        </button>
                        <button
                          className="rp-btn rp-btn--danger rp-btn--icon"
                          title="Annuler"
                          onClick={() => handleAnnuler(e.id)}
                          disabled={e.statutBackend === 'ANNULE'}
                        >
                          <FiXCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem' }}>
                      Aucun entretien trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {entretienSelectionne && (
        <div className="rp-modal-overlay" onClick={() => setEntretienSelectionne(null)}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3 style={{ marginBottom: 4 }}>Détails de l'entretien</h3>
            <span className={`rp-badge rp-badge--${statusToBadge(entretienSelectionne.status)}`} style={{ marginBottom: 16, display: 'inline-block' }}>
              {entretienSelectionne.status}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Candidat</span>
                <strong>{entretienSelectionne.candidate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Poste</span>
                <strong>{entretienSelectionne.poste}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>
                  <FiUsers size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Intervieweur(s)
                </span>
                <strong>{entretienSelectionne.intervieweurs}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Date &amp; heure</span>
                <strong>{entretienSelectionne.date} à {entretienSelectionne.heure}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: entretienSelectionne.salleId ? 8 : 0, borderBottom: entretienSelectionne.salleId ? '1px solid var(--border-light)' : 'none' }}>
                <span style={{ color: 'var(--muted)' }}>Type</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {entretienSelectionne.type === 'En ligne' ? <FiVideo size={13} /> : <FiMapPin size={13} />}
                  {entretienSelectionne.type}
                </strong>
              </div>

              {entretienSelectionne.salleId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--muted)' }}>Salle</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{entretienSelectionne.salleId}</span>
                </div>
              )}
              {entretienSelectionne.notes && (
                <div>
                  <span style={{ color: 'var(--muted)' }}>Notes</span>
                  <p style={{ marginTop: 4 }}>{entretienSelectionne.notes}</p>
                </div>
              )}
            </div>

            <div className="rp-modal__actions" style={{ marginTop: 20 }}>
              <button type="button" className="rp-btn rp-btn--outline" onClick={() => setEntretienSelectionne(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}