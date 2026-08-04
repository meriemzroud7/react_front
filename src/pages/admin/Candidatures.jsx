import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import CandidatureService from '../../services/apiServiceCandidature'; // adapte le chemin selon ton projet
import { getOffreById } from '../../services/apiServiceOffres'; // adapte le chemin selon ton projet

// Essaie plusieurs noms de champs possibles côté backend pour l'entreprise
function extractEntreprise(offre) {
  if (!offre) return '-';
  return (
    offre.entreprise?.nom ||
    offre.entreprise?.nomEntreprise ||
    (typeof offre.entreprise === 'string' ? offre.entreprise : null) ||
    offre.entrepriseNom ||
    offre.nomEntreprise ||
    offre.company ||
    offre.recruteur?.entreprise?.nom ||
    '-'
  );
}

// --- Mapping statut backend <-> libellé affiché ---
// Adapte les clés à gauche à ton enum StatutCandidature exact côté Java
const STATUT_BACKEND_TO_LABEL = {
  EN_ATTENTE: 'En attente',
  ENTRETIEN: 'Entretien',
  RETENU: 'Retenue',
  REFUSE: 'Refusée',
};
const STATUT_LABEL_TO_BACKEND = Object.fromEntries(
  Object.entries(STATUT_BACKEND_TO_LABEL).map(([k, v]) => [v, k])
);

function statusToBadge(label) {
  switch (label) {
    case 'Retenue':
      return 'green';
    case 'Entretien':
      return 'amber';
    case 'Refusée':
      return 'red';
    default:
      return 'gray'; // En attente
  }
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('fr-FR');
  } catch {
    return value;
  }
}

// Styles du select-badge de statut (à déplacer dans ton fichier CSS si tu préfères)
const statusSelectStyles = `
.rp-status-select {
  appearance: none;
  border: none;
  border-radius: 999px;
  padding: 0.32rem 1.75rem 0.32rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  background-repeat: no-repeat;
  background-position: right 0.55rem center;
  background-size: 10px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23555' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
}
.rp-status-select--green { background-color: #e6f6ec; color: #1e8a4c; }
.rp-status-select--amber { background-color: #fff3e0; color: #b06a00; }
.rp-status-select--red   { background-color: #fdeaea; color: #c53030; }
.rp-status-select--gray  { background-color: #eef0f3; color: #566072; }
.rp-status-edit { display: flex; align-items: center; gap: 0.4rem; }
`;

export default function Candidatures() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Tous');
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftStatus, setDraftStatus] = useState('En attente');

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Récupérer toutes les candidatures
        const rawCandidatures = await CandidatureService.getAll();

        // 2. Récupérer les candidats (dédupliqués) en parallèle
        const candidatIds = rawCandidatures.map(c => c.candidatId);
        const usersMap = await CandidatureService.getUsersByIds(candidatIds);

        // 3. Récupérer les offres (dédupliquées) en parallèle
        const uniqueOffreIds = [...new Set(rawCandidatures.map(c => c.offreId).filter(Boolean))];
        const offresResults = await Promise.allSettled(
          uniqueOffreIds.map(id => getOffreById(id).then(r => r.data))
        );
        const offresMap = {};
        offresResults.forEach((res, i) => {
          if (res.status === 'fulfilled') offresMap[uniqueOffreIds[i]] = res.value;
        });

        // 4. Construire les lignes affichées
        const rows = rawCandidatures.map(c => {
          const candidat = usersMap[c.candidatId];
          const offre = offresMap[c.offreId];

          return {
            id: c.id,
            candidatId: c.candidatId,
            offreId: c.offreId,
            candidate: candidat
              ? `${candidat.prenom || candidat.firstName || ''} ${candidat.nom || candidat.lastName || ''}`.trim() || candidat.email
              : `Candidat #${c.candidatId}`,
            offer: offre?.titre || offre?.title || `Offre #${c.offreId}`,
            company: extractEntreprise(offre),
            date: formatDate(c.dateCandidature || c.date || c.createdAt),
            status: STATUT_BACKEND_TO_LABEL[c.statut] || c.statut || 'En attente',
            statutBackend: c.statut,
            cvFileName: c.cvFileName || c.cv,
          };
        });

        if (!cancelled) setCandidatures(rows);
      } catch (err) {
        console.error('Erreur lors du chargement des candidatures :', err);
        if (!cancelled) setError("Impossible de charger les candidatures depuis le serveur.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      candidatures.filter(
        c =>
          (status === 'Tous' || c.status === status) &&
          c.candidate.toLowerCase().includes(query.toLowerCase())
      ),
    [candidatures, query, status]
  );

  async function handleUpdateStatut(id, newLabel) {
    const backendValue = STATUT_LABEL_TO_BACKEND[newLabel];
    try {
      await CandidatureService.updateStatut(id, backendValue);
      setCandidatures(prev =>
        prev.map(c => (c.id === id ? { ...c, status: newLabel, statutBackend: backendValue } : c))
      );
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut :', err);
      alert("La mise à jour du statut a échoué.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette candidature ?')) return;
    try {
      await CandidatureService.delete(id);
      setCandidatures(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert("La suppression a échoué.");
    }
  }

  function handleDownloadCv(cvFileName) {
    if (!cvFileName) return;
    window.open(CandidatureService.getCvDownloadUrl(cvFileName), '_blank');
  }

  function startEditStatut(c) {
    setEditingId(c.id);
    setDraftStatus(c.status);
  }

  function cancelEditStatut() {
    setEditingId(null);
  }

  async function confirmEditStatut(id) {
    await handleUpdateStatut(id, draftStatus);
    setEditingId(null);
  }

  return (
    <div>
      <style>{statusSelectStyles}</style>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Candidatures</h1>
            <p className="rp-subtitle">{filtered.length} candidature(s) sur l'ensemble des offres</p>
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
          <div className="rp-filter-input">
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Tous</option>
              <option>En attente</option>
              <option>Entretien</option>
              <option>Retenue</option>
              <option>Refusée</option>
            </select>
          </div>
        </div>

        {loading && <p style={{ padding: '1rem' }}>Chargement des candidatures...</p>}
        {error && <p style={{ padding: '1rem', color: 'crimson' }}>{error}</p>}

        {!loading && !error && (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Offre</th>
                  <th>Entreprise</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.candidate}</td>
                    <td>{c.offer}</td>
                    <td>{c.company}</td>
                    <td>{c.date}</td>
                    <td>
                      {editingId === c.id ? (
                        <div className="rp-status-edit">
                          <select
                            value={draftStatus}
                            onChange={e => setDraftStatus(e.target.value)}
                            autoFocus
                            className={`rp-status-select rp-status-select--${statusToBadge(draftStatus)}`}
                          >
                            <option>En attente</option>
                            <option>Entretien</option>
                            <option>Retenue</option>
                            <option>Refusée</option>
                          </select>
                          <button
                            className="rp-btn rp-btn--outline rp-btn--icon"
                            title="Valider"
                            onClick={() => confirmEditStatut(c.id)}
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            className="rp-btn rp-btn--outline rp-btn--icon"
                            title="Annuler"
                            onClick={cancelEditStatut}
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className={`rp-badge rp-badge--${statusToBadge(c.status)}`}>{c.status}</span>
                      )}
                    </td>
                    <td>
                      <div className="rp-table__actions">
                        <button
                          className="rp-btn rp-btn--outline rp-btn--icon"
                          title="Modifier le statut"
                          onClick={() => startEditStatut(c)}
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="rp-btn rp-btn--outline rp-btn--icon"
                          title="Télécharger CV"
                          onClick={() => handleDownloadCv(c.cvFileName)}
                          disabled={!c.cvFileName}
                        >
                          <FiDownload size={14} />
                        </button>
                        <button
                          className="rp-btn rp-btn--danger rp-btn--icon"
                          title="Supprimer"
                          onClick={() => handleDelete(c.id)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem' }}>
                      Aucune candidature trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}