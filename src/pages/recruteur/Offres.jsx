import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ajuste le chemin si besoin
import { getOffresByRecruteur, deleteOffre, updateOffre, createOffre } from '../../services/apiServiceOffres'; // ajuste le chemin
import {
  FiPlusCircle, FiSearch, FiEdit2, FiTrash2, FiCopy,
  FiXCircle, FiUsers, FiMoreHorizontal, FiFilter, FiLoader, FiAlertCircle
} from 'react-icons/fi';

const STATUS_LABELS = { ACTIVE: 'Ouverte', EXPIREE: 'Expirée', CLOTUREE: 'Fermée' };
const STATUS_CLASSES = { ACTIVE: 'green', EXPIREE: 'gray', CLOTUREE: 'red' };

function formatDate(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Offres() {
  const { user } = useAuth();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const recruteurId = user?.id || user?._id;

  const loadOffres = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOffresByRecruteur(recruteurId);
      setOffres(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  }, [recruteurId]);

  useEffect(() => {
    if (recruteurId) loadOffres();
  }, [loadOffres, recruteurId]);

  const filtered = offres.filter(o => {
    const matchSearch = o.titre?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !statut || o.statut === statut;
    return matchSearch && matchStatut;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette offre définitivement ?')) return;
    setActionLoading(id);
    try {
      await deleteOffre(id);
      setOffres(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleClose = async (offre) => {
    setActionLoading(offre.id);
    try {
      const updated = { ...offre, statut: 'CLOTUREE' };
      await updateOffre(offre.id, updated);
      setOffres(prev => prev.map(o => o.id === offre.id ? { ...o, statut: 'CLOTUREE' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la fermeture');
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleDuplicate = async (offre) => {
    setActionLoading(offre.id);
    try {
      const { id, dateCreation, nombreCandidatures, ...rest } = offre;
      const copy = { ...rest, titre: `${offre.titre} (copie)`, statut: 'ACTIVE' };
      const res = await createOffre(copy);
      setOffres(prev => [res.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la duplication');
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des offres d'emploi</h1>
            <p className="rp-subtitle">
              {offres.length} offres au total · {offres.filter(o => o.statut === 'ACTIVE').length} actives
            </p>
          </div>
          <Link to="/recruteur/offres/nouvelle" className="rp-btn rp-btn--primary">
            <FiPlusCircle /> Créer une offre
          </Link>
        </div>
      </div>

      <div className="rp-card">
        {/* Filters */}
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, minWidth: 200 }}>
            <FiSearch className="rp-filter-icon" />
            <input
              placeholder="Rechercher une offre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div className="rp-filter-input">
            <select value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Ouverte</option>
              <option value="CLOTUREE">Fermée</option>
              <option value="EXPIREE">Expirée</option>
            </select>
          </div>
          <button className="rp-btn rp-btn--outline" onClick={loadOffres} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiFilter size={14} /> Actualiser
          </button>
        </div>

        {error && (
          <div style={{ margin: '0 1rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Table */}
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Titre du poste</th>
                <th>Localisation</th>
                <th>Contrat</th>
                <th>Publication</th>
                <th>Limite</th>
                <th>Candidatures</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  <FiLoader className="rp-spin" /> Chargement des offres...
                </td></tr>
              )}

              {!loading && filtered.map(o => (
                <tr key={o.id}>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.titre}</span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{o.localisation}</td>
                  <td style={{ fontSize: '0.82rem' }}>{o.typeContrat}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{formatDate(o.dateCreation)}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{formatDate(o.dateExpiration)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiUsers size={13} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700 }}>{o.nombreCandidatures || 0}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`rp-badge rp-badge--${STATUS_CLASSES[o.statut] || 'gray'}`}>
                      {STATUS_LABELS[o.statut] || o.statut}
                    </span>
                  </td>
                  <td>
                    <div className="rp-table__actions" style={{ position: 'relative' }}>
                      <Link
                        to={`/recruteur/candidatures?offre=${o.id}`}
                        className="rp-btn rp-btn--outline rp-btn--sm"
                        title="Voir candidatures"
                      >
                        <FiUsers size={13} />
                      </Link>
                      <Link
                        to={`/recruteur/offres/${o.id}/modifier`}
                        className="rp-btn rp-btn--outline rp-btn--sm"
                        title="Modifier"
                      >
                        <FiEdit2 size={13} />
                      </Link>
                      <button
                        className="rp-btn rp-btn--outline rp-btn--sm"
                        title="Dupliquer"
                        onClick={() => handleDuplicate(o)}
                        disabled={actionLoading === o.id}
                      >
                        <FiCopy size={13} />
                      </button>
                      <button
                        className="rp-btn rp-btn--outline rp-btn--sm"
                        onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)}
                      >
                        <FiMoreHorizontal size={13} />
                      </button>
                      {openMenu === o.id && (
                        <div style={{
                          position: 'absolute', top: '100%', right: 0, zIndex: 200,
                          background: '#fff', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)',
                          minWidth: 150, padding: '0.35rem'
                        }}>
                          {o.statut !== 'CLOTUREE' && (
                            <button
                              className="rp-btn rp-btn--danger rp-btn--sm"
                              style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}
                              onClick={() => handleClose(o)}
                              disabled={actionLoading === o.id}
                            >
                              <FiXCircle size={13} /> Fermer l'offre
                            </button>
                          )}
                          <button
                            className="rp-btn rp-btn--danger rp-btn--sm"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem' }}
                            onClick={() => handleDelete(o.id)}
                            disabled={actionLoading === o.id}
                          >
                            <FiTrash2 size={13} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Aucune offre trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}