import React, { useEffect, useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiArchive, FiXCircle, FiRotateCcw } from 'react-icons/fi';
import { getAllOffres, deleteOffre, updateOffre } from '../../services/apiServiceOffres';

export default function Offres() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Toutes');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    async function loadOffers() {
      try {
        setLoading(true);
        const response = await getAllOffres();
        const offres = response?.data || [];
        setList(offres);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des offres:', err);
        setError('Erreur lors du chargement des offres');
        setList([]);
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, []);

  const mapBackendStatus = (offreStatus) => {
    const statusMap = {
      'active': 'Publiée',
      'published': 'Publiée',
      'inactive': 'Fermée',
      'closed': 'Fermée',
      'draft': 'En attente',
      'pending': 'En attente',
      'archived': 'Archivée'
    };
    return statusMap[offreStatus?.toLowerCase?.()] || (offreStatus || 'Publiée');
  };

  const statusToBadgeColor = (status) => {
    const colors = {
      'Publiée': 'green',
      'Fermée': 'red',
      'En attente': 'amber',
      'Archivée': 'gray'
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateIso) => {
    if (!dateIso) return '-';
    try {
      return new Date(dateIso).toLocaleDateString('fr-FR');
    } catch {
      return dateIso;
    }
  };

  const filtered = list.filter(o => {
    const displayStatus = mapBackendStatus(o.status);
    const matchesStatus = statusFilter === 'Toutes' || displayStatus === statusFilter;
    const matchesQuery = (o.titre?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (o.nomEntreprise?.toLowerCase() || '').includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const setOfferStatus = async (id, newStatus) => {
    try {
      const offer = list.find(o => o.id === id || o._id === id);
      if (offer) {
        const statusMap = {
          'Publiée': 'published',
          'Fermée': 'closed',
          'En attente': 'draft',
          'Archivée': 'archived'
        };
        await updateOffre(id || offer._id, { status: statusMap[newStatus] || newStatus });
        setList(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await deleteOffre(id);
        setList(prev => prev.filter(o => o.id !== id && o._id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setEditFormData({
      titre: offer.titre || '',
      nomEntreprise: offer.nomEntreprise || offer.entreprise || '',
      typeContrat: offer.typeContrat || 'CDI',
      description: offer.description || '',
      localisation: offer.localisation || '',
      salaire: offer.salaire || '',
      dateExpiration: offer.dateExpiration || ''
    });
    setShowEditModal(true);
  };

  const handleSaveOffer = async () => {
    if (!editingOffer) return;
    try {
      const offerId = editingOffer.id || editingOffer._id;
      await updateOffre(offerId, editFormData);
      setList(prev => prev.map(o => 
        (o.id === offerId || o._id === offerId) 
          ? { ...o, ...editFormData }
          : o
      ));
      setShowEditModal(false);
      setEditingOffer(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert('Erreur lors de la sauvegarde de l\'offre');
    }
  };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Offres d'Emploi</h1>
            <p className="rp-subtitle">{filtered.length} offre(s) publiées par les entreprises</p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher une offre..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>Toutes</option>
              <option>Publiée</option>
              <option>En attente</option>
              <option>Fermée</option>
              <option>Archivée</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
            Chargement des offres...
          </div>
        ) : (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Intitulé</th>
                  <th>Entreprise</th>
                  <th>Type de contrat</th>
                  <th>Publiée le</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Aucune offre trouvée
                    </td>
                  </tr>
                ) : (
                  filtered.map(o => {
                    const displayStatus = mapBackendStatus(o.status);
                    const badgeColor = statusToBadgeColor(displayStatus);
                    return (
                      <tr key={o.id || o._id}>
                        <td style={{ fontWeight: 600 }}>{o.titre || 'Sans titre'}</td>
                        <td>{o.nomEntreprise || o.entreprise || 'N/A'}</td>
                        <td>
                          <span className="rp-badge rp-badge--blue">
                            {o.typeContrat || 'CDI'}
                          </span>
                        </td>
                        <td>{formatDate(o.dateCreation)}</td>
                        <td>
                          <span className={`rp-badge rp-badge--${badgeColor}`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td>
                          <div className="rp-table__actions">
                            <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter">
                              <FiEye size={14} />
                            </button>
                            <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier" onClick={() => handleEditOffer(o)}>
                              <FiEdit2 size={14} />
                            </button>
                            {displayStatus !== 'Fermée' ? (
                              <button
                                className="rp-btn rp-btn--danger rp-btn--icon"
                                title="Fermer l'offre"
                                onClick={() => setOfferStatus(o.id || o._id, 'Fermée')}
                              >
                                <FiXCircle size={14} />
                              </button>
                            ) : (
                              <button
                                className="rp-btn rp-btn--success rp-btn--icon"
                                title="Restaurer"
                                onClick={() => setOfferStatus(o.id || o._id, 'Publiée')}
                              >
                                <FiRotateCcw size={14} />
                              </button>
                            )}
                            <button className="rp-btn rp-btn--outline rp-btn--icon" title="Archiver">
                              <FiArchive size={14} />
                            </button>
                            <button
                              className="rp-btn rp-btn--danger rp-btn--icon"
                              title="Supprimer"
                              onClick={() => handleDeleteOffer(o.id || o._id)}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Édition */}
      {showEditModal && editingOffer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card)',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid var(--border)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Modifier l'offre</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Intitulé *</label>
              <input
                type="text"
                value={editFormData.titre || ''}
                onChange={(e) => setEditFormData({ ...editFormData, titre: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  boxSizing: 'border-box'
                }}
                placeholder="Titre de l'offre"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Entreprise *</label>
              <input
                type="text"
                value={editFormData.nomEntreprise || ''}
                onChange={(e) => setEditFormData({ ...editFormData, nomEntreprise: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  boxSizing: 'border-box'
                }}
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Type de contrat</label>
                <input
                  type="text"
                  value={editFormData.typeContrat || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, typeContrat: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--background)',
                    color: 'var(--text)',
                    boxSizing: 'border-box'
                  }}
                  placeholder="CDI, CDD..."
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Localisation</label>
                <input
                  type="text"
                  value={editFormData.localisation || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, localisation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--background)',
                    color: 'var(--text)',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ville, région..."
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Salaire</label>
              <input
                type="text"
                value={editFormData.salaire || ''}
                onChange={(e) => setEditFormData({ ...editFormData, salaire: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  boxSizing: 'border-box'
                }}
                placeholder="Fourchette de salaire"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
              <textarea
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="Description de l'offre"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOffer(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveOffer}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
