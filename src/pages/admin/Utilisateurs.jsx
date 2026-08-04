import React, { useEffect, useMemo, useState } from 'react';
import {
  FiSearch, FiPlusCircle, FiEye, FiEdit2, FiSlash, FiTrash2, FiKey, FiUserCheck,
  FiX, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import {
  getUsers, createUser, updateUser, deleteUser, forgotPassword,
} from '../../services/apiServiceUser';

// ─────────────────────────────────────────────────────────────
// Le modèle User backend n'a pas de champ unique "statut" : le statut
// affiché est déduit de `verified` (compte configuré ou non) et `actif`
// (activé/suspendu par un admin).
// ─────────────────────────────────────────────────────────────
const ROLE_FIELD = 'role';
const ROLES = ['ADMIN', 'RECRUTEUR', 'CANDIDAT'];
const ROLE_LABELS = { ADMIN: 'Administrateur', RECRUTEUR: 'Recruteur', CANDIDAT: 'Candidat' };

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];

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

// Déduit { label, className } à partir des vrais champs verified/actif du backend.
function getStatusInfo(u) {
  if (!u.verified) return { label: 'En attente', className: 'amber' };
  if (u.actif === false) return { label: 'Suspendu', className: 'red' };
  return { label: 'Actif', className: 'green' };
}

// Mot de passe temporaire aléatoire, uniquement pour satisfaire l'API existante
// (qui exige un password) : l'utilisateur ne le connaîtra jamais, il définira le
// sien via "Mot de passe oublié" une fois son compte vérifié.
// Contient volontairement majuscule + minuscule + chiffre + caractère spécial
// pour passer les validations de complexité de mot de passe les plus courantes.
function generateTempPassword() {
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const special = '@$!%*?&'; // doit correspondre exactement au regex backend ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$
  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
  const rest = Array.from({ length: 8 }, () => pick(lower + upper + digits)).join('');
  return pick(upper) + pick(lower) + pick(digits) + pick(special) + rest;
}

// Les erreurs de validation @Valid de Spring renvoient souvent un objet
// { champ: "message d'erreur", ... } plutôt qu'un simple { message: "..." }.
// Cette fonction essaie plusieurs formats pour toujours afficher un message utile.
function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (typeof data === 'object') {
    const parts = Object.entries(data).map(([field, msg]) => `${field} : ${msg}`);
    if (parts.length > 0) return parts.join(' — ');
  }
  return fallback;
}

const EMPTY_FORM = { nom: '', prenom: '', email: '', role: 'CANDIDAT' };

export default function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text }

  const [role, setRole] = useState('Tous');
  const [statut, setStatut] = useState('Tous');
  const [query, setQuery] = useState('');

  // modalMode: null | 'create' | 'edit' | 'view'
  const [modalMode, setModalMode] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les utilisateurs. Vérifie que le backend est bien lancé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const nom = getUserField(u, 'nom', 'lastName', 'lastname');
      const prenom = getUserField(u, 'prenom', 'firstName', 'firstname');
      const email = getUserField(u, 'email');
      const nomComplet = `${prenom} ${nom}`.toLowerCase();
      const statusInfo = getStatusInfo(u);
      const matchRole = role === 'Tous' || u[ROLE_FIELD] === role;
      const matchStatut = statut === 'Tous' || statusInfo.label === statut;
      const matchQuery = nomComplet.includes(query.toLowerCase()) || email.toLowerCase().includes(query.toLowerCase());
      return matchRole && matchStatut && matchQuery;
    });
  }, [users, role, statut, query]);

  // ── Modales ──────────────────────────────────────────────
  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalMode('create');
  };

  const openEditModal = (u) => {
    setModalUser(u);
    setForm({
      nom: getUserField(u, 'nom'),
      prenom: getUserField(u, 'prenom'),
      email: getUserField(u, 'email'),
      role: u[ROLE_FIELD] || 'CANDIDAT',
    });
    setFormError('');
    setModalMode('edit');
  };

  const openViewModal = (u) => {
    setModalUser(u);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setModalUser(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  // ── Créer / modifier ────────────────────────────────────
  async function handleSubmitForm() {
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setFormError('Nom, prénom et email sont obligatoires.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (modalMode === 'create') {
        // Réutilise EXACTEMENT le même endpoint que l'inscription publique (POST /api/users) :
        // il envoie déjà automatiquement un email de vérification, sans rien changer côté backend.
        const res = await createUser({ ...form, password: generateTempPassword() });
        setUsers((prev) => [res.data, ...prev]);

        // Envoie tout de suite un email "définir mon mot de passe" (endpoint existant lui aussi),
        // pour que l'utilisateur puisse choisir son propre mot de passe sans jamais connaître le temporaire.
        try {
          await forgotPassword(form.email);
        } catch (mailErr) {
          console.error('Compte créé mais échec de l\'envoi de l\'email de définition du mot de passe :', mailErr);
        }

        setFeedback({
          type: 'success',
          text: `Compte créé pour ${form.prenom} ${form.nom}. ${form.email} va recevoir un email de vérification, puis un second email pour définir son mot de passe.`,
        });
      } else if (modalMode === 'edit' && modalUser) {
        const id = modalUser.id || modalUser._id;
        const res = await updateUser(id, { ...modalUser, ...form });
        setUsers((prev) => prev.map((x) => ((x.id || x._id) === id ? res.data : x)));
        setFeedback({ type: 'success', text: 'Informations mises à jour.' });
      }
      closeModal();
    } catch (err) {
      console.error('Détail erreur backend :', err.response?.status, err.response?.data);
      setFormError(extractErrorMessage(err, "Erreur lors de l'enregistrement."));
    } finally {
      setSaving(false);
    }
  }

  // ── Activer / suspendre ─────────────────────────────────
  // ⚠️ Réutilise l'endpoint existant PUT /api/users/{id} (updateUser). Pour que ce
  // changement soit réellement sauvegardé, il faut que la méthode updateUser() de ton
  // UserServiceImpl.java prenne aussi en compte le champ "actif" — ajoute simplement
  // cette ligne dans la méthode existante (aucun nouvel endpoint requis) :
  //     user.setActif(userDetails.getActif());
  // Sans cette ligne, le backend ignorera le champ actif et le changement ne persistera pas.
  async function handleToggleStatus(u) {
    const id = u.id || u._id;
    const nouveauActif = !(u.actif !== false);
    setActionLoadingId(id);
    try {
      const res = await updateUser(id, { ...u, actif: nouveauActif });
      setUsers((prev) => prev.map((x) => ((x.id || x._id) === id ? res.data : x)));
      setFeedback({
        type: 'success',
        text: `${getUserField(u, 'prenom')} ${getUserField(u, 'nom')} a été ${nouveauActif ? 'réactivé(e)' : 'suspendu(e)'}.`,
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erreur lors de la mise à jour du statut.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  // ── Supprimer ────────────────────────────────────────────
  async function handleDelete(u) {
    const id = u.id || u._id;
    const nom = `${getUserField(u, 'prenom', 'firstName', 'firstname')} ${getUserField(u, 'nom', 'lastName', 'lastname')}`.trim() || 'cet utilisateur';
    if (!window.confirm(`Supprimer définitivement ${nom} ? Un email de notification lui sera envoyé.`)) return;
    setActionLoadingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((x) => (x.id || x._id) !== id));
      setFeedback({ type: 'success', text: `${nom} a été supprimé(e) et notifié(e) par email.` });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erreur lors de la suppression.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  // ── Réinitialiser le mot de passe ──────────────────────
  async function handleResetPassword(u) {
    const email = getUserField(u, 'email');
    if (!email) return;
    setActionLoadingId(u.id || u._id);
    try {
      await forgotPassword(email);
      setFeedback({ type: 'success', text: `Un code de réinitialisation a été envoyé à ${email}.` });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: "Erreur lors de l'envoi de la réinitialisation." });
    } finally {
      setActionLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
        <FiLoader className="rp-spin" /> Chargement des utilisateurs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
        <FiAlertCircle size={28} color="var(--danger, #dc2626)" />
        <p>{error}</p>
        <button className="rp-btn rp-btn--outline" onClick={fetchUsers}>Réessayer</button>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Utilisateurs</h1>
            <p className="rp-subtitle">{filtered.length} compte(s) — administrateurs, recruteurs, candidats</p>
          </div>
          <button className="rp-btn rp-btn--primary" onClick={openCreateModal}>
            <FiPlusCircle /> Ajouter un utilisateur
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className="rp-card"
          style={{
            marginBottom: '1rem', padding: '0.85rem 1.1rem',
            borderColor: feedback.type === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(224,69,59,0.35)',
            color: feedback.type === 'success' ? 'var(--success)' : 'var(--danger)',
            fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          {feedback.text}
        </div>
      )}

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input placeholder="Rechercher un nom ou un email..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="rp-filter-input">
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="Tous">Tous</option>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="rp-filter-input">
            <select value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="Tous">Tous</option>
              <option value="Actif">Actif</option>
              <option value="Suspendu">Suspendu</option>
              <option value="En attente">En attente</option>
            </select>
          </div>
        </div>

        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const id = u.id || u._id;
                const nom = getUserField(u, 'nom', 'lastName', 'lastname');
                const prenom = getUserField(u, 'prenom', 'firstName', 'firstname');
                const email = getUserField(u, 'email');
                const nomComplet = `${prenom} ${nom}`.trim() || 'Utilisateur';
                const roleLabel = ROLE_LABELS[u[ROLE_FIELD]] || u[ROLE_FIELD] || '—';
                const statusInfo = getStatusInfo(u);
                const isRowLoading = actionLoadingId === id;

                return (
                  <tr key={id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="rp-avatar" style={{ width: 34, height: 34, background: getAvatarColor(nomComplet), fontSize: '0.72rem' }}>{getInitials(nom, prenom)}</div>
                        <span style={{ fontWeight: 600 }}>{nomComplet}</span>
                      </div>
                    </td>
                    <td>{email || '—'}</td>
                    <td>{roleLabel}</td>
                    <td><span className={`rp-badge rp-badge--${statusInfo.className}`}>{statusInfo.label}</span></td>
                    <td>
                      <div className="rp-table__actions">
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter le profil" onClick={() => openViewModal(u)}>
                          <FiEye size={14} />
                        </button>
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier" onClick={() => openEditModal(u)}>
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="rp-btn rp-btn--outline rp-btn--icon"
                          title="Réinitialiser le mot de passe"
                          disabled={isRowLoading}
                          onClick={() => handleResetPassword(u)}
                        >
                          <FiKey size={14} />
                        </button>
                        <button
                          className={`rp-btn rp-btn--icon ${statusInfo.label === 'Actif' ? 'rp-btn--danger' : 'rp-btn--success'}`}
                          title={statusInfo.label === 'Actif' ? 'Désactiver' : 'Activer'}
                          disabled={isRowLoading}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {statusInfo.label === 'Actif' ? <FiSlash size={14} /> : <FiUserCheck size={14} />}
                        </button>
                        <button
                          className="rp-btn rp-btn--danger rp-btn--icon"
                          title="Supprimer"
                          disabled={isRowLoading}
                          onClick={() => handleDelete(u)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Aucun utilisateur ne correspond aux filtres.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création / édition */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={closeModal}
        >
          <div className="rp-card" style={{ width: 460, maxWidth: '92vw' }} onClick={(e) => e.stopPropagation()}>
            <div className="rp-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="rp-card__title">{modalMode === 'create' ? 'Ajouter un utilisateur' : "Modifier l'utilisateur"}</span>
              <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={closeModal}><FiX size={14} /></button>
            </div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {modalMode === 'create' && (
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
                  {form.email.trim()
                    ? `${form.email} recevra un email de vérification, puis un email pour définir son mot de passe.`
                    : "La personne recevra un email de vérification, puis un email pour définir son mot de passe."}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="rp-field" style={{ flex: 1 }}>
                  <label className="rp-label">Prénom</label>
                  <input className="rp-input" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div className="rp-field" style={{ flex: 1 }}>
                  <label className="rp-label">Nom</label>
                  <input className="rp-input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
              </div>
              <div className="rp-field">
                <label className="rp-label">Email</label>
                <input className="rp-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={modalMode === 'edit'} />
                {modalMode === 'edit' && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: '0.3rem 0 0' }}>L'email ne peut pas être modifié ici.</p>
                )}
              </div>
              <div className="rp-field">
                <label className="rp-label">Rôle</label>
                <select className="rp-input rp-input--select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              {formError && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', margin: 0 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="rp-btn rp-btn--outline" onClick={closeModal}>Annuler</button>
                <button className="rp-btn rp-btn--primary" onClick={handleSubmitForm} disabled={saving}>
                  {saving ? 'Enregistrement...' : modalMode === 'create' ? "Créer et envoyer l'invitation" : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal consultation (lecture seule) */}
      {modalMode === 'view' && modalUser && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={closeModal}
        >
          <div className="rp-card" style={{ width: 420, maxWidth: '92vw' }} onClick={(e) => e.stopPropagation()}>
            <div className="rp-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="rp-card__title">Profil utilisateur</span>
              <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={closeModal}><FiX size={14} /></button>
            </div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div className="rp-avatar" style={{ width: 48, height: 48, background: getAvatarColor(`${getUserField(modalUser, 'prenom')} ${getUserField(modalUser, 'nom')}`), fontSize: '1rem' }}>
                  {getInitials(getUserField(modalUser, 'nom'), getUserField(modalUser, 'prenom'))}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{`${getUserField(modalUser, 'prenom')} ${getUserField(modalUser, 'nom')}`.trim()}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{ROLE_LABELS[modalUser[ROLE_FIELD]] || modalUser[ROLE_FIELD]}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem' }}><strong>Email :</strong> {modalUser.email}</div>
              <div style={{ fontSize: '0.85rem' }}><strong>Statut :</strong> {getStatusInfo(modalUser).label}</div>
              {modalUser.telephone && <div style={{ fontSize: '0.85rem' }}><strong>Téléphone :</strong> {modalUser.telephone}</div>}
              {modalUser.adresse && <div style={{ fontSize: '0.85rem' }}><strong>Adresse :</strong> {modalUser.adresse}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}