import React, { useEffect, useState } from 'react';
import { FiCamera, FiSave, FiLink2, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserById, updateProfile, uploadUserPhoto } from '../../services/apiServiceUser';

// URL de ton backend Spring Boot — adapte si besoin (env de prod, port différent...)
const BACKEND_URL = 'http://localhost:8080';

function getInitials(nom, prenom) {
  const a = (prenom || '').charAt(0);
  const b = (nom || '').charAt(0);
  return (a + b).toUpperCase() || 'U';
}

function Field({ label, name, value, onChange, type = 'text' }) {
  return (
    <div className="rp-field">
      <label className="rp-label">{label}</label>
      <input className="rp-input" name={name} value={value || ''} onChange={onChange} type={type} />
    </div>
  );
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');

  // Charge le vrai profil depuis le backend au montage de la page
  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      setError("Session introuvable, merci de vous reconnecter.");
      return;
    }
    getUserById(authUser.id)
      .then(res => setForm(res.data))
      .catch(() => setError("Impossible de charger votre profil."))
      .finally(() => setLoading(false));
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const res = await updateProfile(form.id, form);
      setForm(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !form) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const res = await uploadUserPhoto(form.id, file);
      setForm(res.data);
    } catch (err) {
      setError("Erreur lors de l'envoi de la photo.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
        <FiLoader /> Chargement du profil...
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
        {error || "Impossible de charger votre profil."}
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Mon profil</h1>
            <p className="rp-subtitle">Gérez vos informations personnelles et professionnelles</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rp-card" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--danger)' }}>
          <div className="rp-card__body" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>
        </div>
      )}

      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card__body" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            {form.image ? (
              <img
                src={`${BACKEND_URL}/${form.image}`}
                alt="Profil"
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="rp-avatar" style={{ width: 72, height: 72, background: 'var(--primary)', fontSize: '1.4rem' }}>
                {getInitials(form.nom, form.prenom)}
              </div>
            )}
            <label
              className="rp-btn rp-btn--primary rp-btn--icon"
              style={{ position: 'absolute', bottom: -4, right: -4, width: 30, height: 30, borderRadius: '50%', cursor: 'pointer' }}
              title="Changer la photo"
            >
              {uploadingPhoto ? <FiLoader size={13} /> : <FiCamera size={13} />}
              <input type="file" accept="image/*" hidden onChange={handlePhotoChange} disabled={uploadingPhoto} />
            </label>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--foreground)' }}>{form.prenom} {form.nom}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {form.formationOuPoste || 'Titre professionnel non renseigné'}
              {form.ecole ? ` · ${form.ecole}` : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="rp-grid-2">
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Informations personnelles</span></div>
          <div className="rp-card__body rp-form">
            <div className="rp-form-row">
              <Field label="Prénom" name="prenom" value={form.prenom} onChange={handleChange} />
              <Field label="Nom" name="nom" value={form.nom} onChange={handleChange} />
            </div>
            <Field label="Adresse" name="adresse" value={form.adresse} onChange={handleChange} />
            <div className="rp-form-row">
              <Field label="Téléphone" name="telephone" value={form.telephone} onChange={handleChange} />
              <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
            </div>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Informations professionnelles</span></div>
          <div className="rp-card__body rp-form">
            <Field label="Titre professionnel" name="formationOuPoste" value={form.formationOuPoste} onChange={handleChange} />
            <div className="rp-form-row">
              <Field label="Niveau d'étude" name="niveauEtude" value={form.niveauEtude} onChange={handleChange} />
              <Field label="École / Université" name="ecole" value={form.ecole} onChange={handleChange} />
            </div>
            <div className="rp-form-row">
              <Field label="Type de contrat recherché" name="typeContratRecherche" value={form.typeContratRecherche} onChange={handleChange} />
              <Field label="Salaire souhaité" name="salaireSouhaite" value={form.salaireSouhaite} onChange={handleChange} />
            </div>
            <Field label="Mobilité géographique" name="mobiliteGeographique" value={form.mobiliteGeographique} onChange={handleChange} />
          </div>
        </div>

        <div className="rp-card" style={{ gridColumn: '1 / -1' }}>
          <div className="rp-card__header"><span className="rp-card__title">Liens professionnels</span></div>
          <div className="rp-card__body rp-form-row rp-form-row--3">
            <Field
              label={<><FiLink2 size={12} style={{ marginRight: 4 }} />LinkedIn</>}
              name="linkedin" value={form.linkedin} onChange={handleChange}
            />
            <Field
              label={<><FiLink2 size={12} style={{ marginRight: 4 }} />GitHub</>}
              name="github" value={form.github} onChange={handleChange}
            />
            <Field
              label={<><FiLink2 size={12} style={{ marginRight: 4 }} />Portfolio</>}
              name="portfolio" value={form.portfolio} onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button className="rp-btn rp-btn--outline">Modifier le mot de passe</button>
        <button className="rp-btn rp-btn--primary" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}