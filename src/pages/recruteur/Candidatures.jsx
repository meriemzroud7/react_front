import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiDownload, FiCalendar, FiCheck, FiX,
  FiUser, FiMail, FiPhone, FiFilter, FiLayers, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import CandidatureService from '../../services/apiServiceCandidature';
import { useAuth } from '../../context/AuthContext'; // ⚠️ adapte le chemin exact à ton projet

// --- Config statut : adapte les clés à ton enum StatutCandidature côté backend ---
const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', className: 'amber' },
  RETENU: { label: 'Retenu', className: 'green' },
  ENTRETIEN: { label: 'Entretien', className: 'blue' },
  REFUSE: { label: 'Refusé', className: 'red' },
};
const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];

// Le modèle User peut utiliser des noms de champs différents selon ton backend.
// Cette fonction essaie plusieurs variantes courantes - ajuste si besoin.
function getUserField(user, ...keys) {
  for (const k of keys) {
    if (user && user[k] !== undefined && user[k] !== null && user[k] !== '') return user[k];
  }
  return '';
}

function getInitials(nom = '', prenom = '') {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || '?';
}

function getAvatarColor(seed = '') {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PAGE_SIZE = 5;

export default function Candidatures() {
  // Si ta route est du type /recruteur/offres/:offreId/candidatures
  const { offreId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 récupère le recruteur connecté

  const [candidatures, setCandidatures] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  // --- Chargement des candidatures depuis le backend ---
  const fetchCandidatures = async () => {
    setLoading(true);
    setError(null);
    try {
      // Si un offreId est présent dans l'URL, on filtre sur cette offre.
      // Sinon on charge les candidatures des offres du recruteur connecté uniquement.
      const data = offreId
        ? await CandidatureService.getByOffre(offreId)
        : await CandidatureService.getByRecruteur(user.id); // 👈 remplace getAll()
      const list = Array.isArray(data) ? data : [];
      setCandidatures(list);

      // Enrichissement : on récupère les infos candidat (nom/email/tel) via candidatId
      const users = await CandidatureService.getUsersByIds(list.map(c => c.candidatId));
      setUsersById(users);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les candidatures. Vérifie que le backend est bien lancé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offreId || user?.id) {
      fetchCandidatures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offreId, user]);

  // --- Filtrage côté client ---
  const filtered = useMemo(() => {
    return candidatures.filter(c => {
      const user = usersById[c.candidatId];
      const nom = getUserField(user, 'nom', 'lastName', 'lastname');
      const prenom = getUserField(user, 'prenom', 'firstName', 'firstname');
      const email = getUserField(user, 'email');
      const nomComplet = `${prenom} ${nom}`.toLowerCase();
      const matchSearch = nomComplet.includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
      const matchStatut = !statutFilter || c.statut === statutFilter;
      return matchSearch && matchStatut;
    });
  }, [candidatures, usersById, search, statutFilter]);

  // --- Pagination côté client (le backend ne fournit pas encore d'endpoint paginé) ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1); // reset à la page 1 quand les filtres changent
  }, [search, statutFilter]);

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  // --- Actions statut ---
  const handleStatutChange = async (id, nouveauStatut) => {
    setActionLoadingId(id);
    try {
      const updated = await CandidatureService.updateStatut(id, nouveauStatut);
      setCandidatures(prev => prev.map(c => ((c.id || c._id) === id ? updated : c)));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadCv = (fileName) => {
    if (!fileName) return;
    window.open(CandidatureService.getCvDownloadUrl(fileName), '_blank');
  };

  if (loading) {
    return (
      <div className="rp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
        <FiLoader className="rp-spin" /> Chargement des candidatures...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
        <FiAlertCircle size={28} color="var(--danger, #dc2626)" />
        <p>{error}</p>
        <button className="rp-btn rp-btn--outline" onClick={fetchCandidatures}>Réessayer</button>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Liste des candidatures</h1>
            <p className="rp-subtitle">{filtered.length} candidature{filtered.length > 1 ? 's' : ''}</p>
          </div>
         <div style={{ display: 'flex', gap: '0.75rem' }}>
  {selected.length >= 2 && (
    <Link to="/recruteur/comparaison" state={{ ids: selected }} className="rp-btn rp-btn--outline">
      <FiLayers /> Comparer ({selected.length})
    </Link>
  )}
</div>
        </div>
      </div>

      <div className="rp-card">
        {/* Filters */}
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, minWidth: 220 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un candidat..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
              <option value="">Tous les statuts</option>
              {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <button className="rp-btn rp-btn--outline" onClick={fetchCandidatures} title="Rafraîchir">
            <FiFilter size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every(c => selected.includes(c.id || c._id))}
                    onChange={e => setSelected(e.target.checked
                      ? Array.from(new Set([...selected, ...paginated.map(c => c.id || c._id)]))
                      : selected.filter(id => !paginated.some(c => (c.id || c._id) === id)))}
                  />
                </th>
                <th>Candidat</th>
                <th>Contact</th>
                <th>Date candidature</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                    Aucune candidature trouvée.
                  </td>
                </tr>
              )}
              {paginated.map(c => {
                const rowId = c.id || c._id;
                const user = usersById[c.candidatId];
                const nom = getUserField(user, 'nom', 'lastName', 'lastname');
                const prenom = getUserField(user, 'prenom', 'firstName', 'firstname');
                const email = getUserField(user, 'email');
                const telephone = getUserField(user, 'telephone', 'phone', 'phoneNumber');
                const nomComplet = `${prenom} ${nom}`.trim() || 'Candidat (info indisponible)';
                const statutCfg = STATUT_CONFIG[c.statut] || { label: c.statut, className: 'amber' };
                const isRowLoading = actionLoadingId === rowId;

                return (
                  <tr key={rowId}>
                    <td>
                      <input type="checkbox" checked={selected.includes(rowId)} onChange={() => toggleSelect(rowId)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <div className="rp-avatar" style={{ width: 38, height: 38, background: getAvatarColor(nomComplet), fontSize: '0.78rem', flexShrink: 0 }}>
                          {getInitials(nom, prenom)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{nomComplet}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.cvOriginalName || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiMail size={11} /> {email || '—'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiPhone size={11} /> {telephone || '—'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDate(c.dateCandidature)}</td>
                    <td><span className={`rp-badge rp-badge--${statutCfg.className}`}>{statutCfg.label}</span></td>
                    <td>
                      <div className="rp-table__actions">
                        <Link to={`/recruteur/profil/${c.candidatId}`} className="rp-btn rp-btn--outline rp-btn--sm" title="Voir profil">
                          <FiUser size={13} />
                        </Link>
                        <Link to={`/recruteur/analyse-ia`} state={{ candidatureId: rowId }} className="rp-btn rp-btn--outline rp-btn--sm" title="Analyse IA">
                          IA
                        </Link>
                        <button className="rp-btn rp-btn--outline rp-btn--sm" title="CV" onClick={() => handleDownloadCv(c.cvFileName)}>
                          <FiDownload size={13} />
                        </button>
                        <button
                          className="rp-btn rp-btn--outline rp-btn--sm"
                          title="Planifier un entretien"
                          onClick={() => navigate('/recruteur/entretiens', { state: { preselectCandidatureId: rowId } })}
                        >
                          <FiCalendar size={13} />
                        </button>
                        <button
                          className="rp-btn rp-btn--success rp-btn--sm"
                          title="Accepter"
                          disabled={isRowLoading}
                          onClick={() => handleStatutChange(rowId, 'RETENU')}
                        >
                          <FiCheck size={13} />
                        </button>
                        <button
                          className="rp-btn rp-btn--danger rp-btn--sm"
                          title="Refuser"
                          disabled={isRowLoading}
                          onClick={() => handleStatutChange(rowId, 'REFUSE')}
                        >
                          <FiX size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Page {page} sur {totalPages} · {filtered.length} résultats
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="rp-btn rp-btn--outline rp-btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`rp-btn rp-btn--sm ${n === page ? 'rp-btn--success' : 'rp-btn--outline'}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className="rp-btn rp-btn--outline rp-btn--sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}