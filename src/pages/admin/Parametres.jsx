import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiTrash2, FiSave, FiCheck, FiLock } from 'react-icons/fi';
import { deleteUser } from '../../services/apiServiceUser'; // adapte le chemin vers ton fichier axios

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export default function ParametresAdmin() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language?.split('-')[0] || 'fr';

  const [platformName, setPlatformName] = useState('Fursa — فرصة');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(() => {
    try {
      return localStorage.getItem('platform_logo') || null;
    } catch (e) {
      return null;
    }
  });
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleChangeLanguage = (e) => {
    const code = e.target.value;
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  };

  // build preview when user selects a file
  React.useEffect(() => {
    if (!logoFile) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(logoFile);
    return () => {};
  }, [logoFile]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      // TODO: brancher sur le vrai endpoint quand il existera, ex :
      // const formData = new FormData();
      // formData.append('platformName', platformName);
      // formData.append('language', currentLang);
      // if (logoFile) formData.append('logo', logoFile);
      // await axios.put('http://localhost:8080/api/parametres', formData);

      // simulate network delay
      await new Promise((res) => setTimeout(res, 600));
      // persist platform settings locally for now
      try {
        localStorage.setItem('platform_name', platformName);
        localStorage.setItem('platform_lang', currentLang);
        if (logoPreview) localStorage.setItem('platform_logo', logoPreview);
      } catch (err) {
        console.warn('Impossible de sauvegarder en local', err);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      await deleteUser(currentUser.id);

      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      setDeleteError("Une erreur est survenue lors de la suppression du compte.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Paramètres de la Plateforme</h1>
        <p className="rp-subtitle">Configuration générale</p>
      </div>

      {/* Général */}
      <div className="rp-card">
        <div className="rp-card__header">
          <span className="rp-card__title">Général</span>
        </div>
        <div className="rp-card__body rp-form">
          <div className="rp-field">
            <label className="rp-label">Nom de la plateforme</label>
            <input
              className="rp-input"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
          </div>

          <div className="rp-field">
            <label className="rp-label">Logo</label>
            <input
              ref={fileInputRef}
              className="rp-input"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="rp-btn rp-btn--outline"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload /> {logoFile ? logoFile.name : 'Choisir un fichier'}
            </button>
            {logoPreview && (
              <div style={{ marginTop: 12 }}>
                <img src={logoPreview} alt="Aperçu logo" style={{ maxWidth: 160, maxHeight: 80, borderRadius: 8 }} />
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Langue</label>
            <select className="rp-input rp-input--select" value={currentLang} onChange={handleChangeLanguage}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              type="button"
              className="rp-btn rp-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                'Enregistrement...'
              ) : saved ? (
                <><FiCheck /> Enregistré</>
              ) : (
                <><FiSave /> Enregistrer</>
              )}
            </button>
            {saveError && <span className="rp-error-text">{saveError}</span>}
          </div>
        </div>
      </div>

      {/* Compte */}
      <div className="rp-card">
        <div className="rp-card__header">
          <span className="rp-card__title">Compte</span>
        </div>
        <div className="rp-card__body rp-form">
          <button
            type="button"
            className="rp-btn rp-btn--outline"
            style={{ justifyContent: 'flex-start', gap: '0.65rem' }}
            disabled
            title="Bientôt disponible"
          >
            <FiLock size={15} /> Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Zone sensible */}
      <div className="rp-card rp-card--danger">
        <div className="rp-card__header">
          <span className="rp-card__title rp-card__title--danger">Zone sensible</span>
        </div>
        <div className="rp-card__body">
          <p className="rp-text-muted" style={{ marginBottom: '0.9rem' }}>
            La suppression de votre compte est définitive et irréversible.
          </p>

          <button
            type="button"
            className="rp-btn rp-btn--danger-soft"
            onClick={() => setShowConfirm(true)}
          >
            <FiTrash2 /> Supprimer mon compte
          </button>

          {deleteError && <p className="rp-error-text" style={{ marginTop: '0.6rem' }}>{deleteError}</p>}
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="rp-modal-overlay">
          <div className="rp-modal">
            <h3>Confirmer la suppression</h3>
            <p>Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?</p>
            <div className="rp-modal__actions">
              <button
                type="button"
                className="rp-btn rp-btn--outline"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rp-btn rp-btn--danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}