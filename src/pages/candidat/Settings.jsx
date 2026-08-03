import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { forgotPassword, deleteUser } from '../../services/apiServiceUser';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language?.split('-')[0] || 'fr';

  const [passwordStatus, setPasswordStatus] = useState('idle'); // idle | loading | sent | error
  const [passwordError, setPasswordError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleChangeLanguage = (e) => {
    const code = e.target.value;
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  // Envoie un vrai code de réinitialisation à l'email du compte connecté,
  // puis redirige vers la page /reset-password (même flux que "mot de passe oublié").
  const handleChangePassword = async () => {
    if (!user?.email) return;
    setPasswordStatus('loading');
    setPasswordError('');
    try {
      await forgotPassword(user.email);
      setPasswordStatus('sent');
      setTimeout(() => {
        navigate('/reset-password', { state: { email: user.email } });
      }, 1200);
    } catch (err) {
      setPasswordStatus('error');
      setPasswordError(err.response?.data?.message || "Erreur lors de l'envoi du code de réinitialisation.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    if (!window.confirm('Cette action est définitive et irréversible. Supprimer votre compte ?')) return;

    setDeleting(true);
    try {
      await deleteUser(user.id);
      logout();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression du compte.');
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Paramètres</h1>
        <p className="rp-subtitle">Gérez votre compte et vos préférences</p>
      </div>

      <div className="rp-grid-2">
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Compte</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/candidat/profil" className="rp-btn rp-btn--outline" style={{ justifyContent: 'flex-start' }}>
              Modifier les informations personnelles
            </Link>

            <button
              className="rp-btn rp-btn--outline"
              style={{ justifyContent: 'flex-start' }}
              onClick={handleChangePassword}
              disabled={passwordStatus === 'loading' || passwordStatus === 'sent'}
            >
              {passwordStatus === 'loading' && 'Envoi en cours...'}
              {passwordStatus === 'sent' && 'Code envoyé, redirection...'}
              {(passwordStatus === 'idle' || passwordStatus === 'error') && 'Changer le mot de passe'}
            </button>
            {passwordStatus === 'error' && (
              <p style={{ color: 'var(--danger, #dc2626)', fontSize: '0.8rem', margin: 0 }}>{passwordError}</p>
            )}

            <div className="rp-field">
              <label className="rp-label">Langue</label>
              <select className="rp-input rp-input--select" value={currentLang} onChange={handleChangeLanguage}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rp-card" style={{ borderColor: 'rgba(224,69,59,0.3)' }}>
          <div className="rp-card__header"><span className="rp-card__title" style={{ color: 'var(--danger)' }}>Zone sensible</span></div>
          <div className="rp-card__body">
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 0 }}>La suppression de votre compte est définitive et irréversible.</p>
            <button className="rp-btn rp-btn--danger" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? 'Suppression en cours...' : 'Supprimer mon compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}