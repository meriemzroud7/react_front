import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiLock, FiBell, FiGlobe, FiCalendar, FiSave, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  getUserById, updateProfile, uploadUserPhoto, forgotPassword, resetPassword,
} from '../../services/apiServiceUser';

const TABS = [
  { key: 'profil', icon: <FiUser />, label: 'Profil' },
  { key: 'securite', icon: <FiLock />, label: 'Sécurité' },
  { key: 'notifications', icon: <FiBell />, label: 'Notifications' },
  { key: 'langue', icon: <FiGlobe />, label: 'Langue' },
  { key: 'entretiens', icon: <FiCalendar />, label: 'Préférences entretiens' },
];

const DEFAULT_NOTIFS = { nouvelleCand: true, entretien: true, email: true };
const DEFAULT_ENTRETIEN_PREFS = { duree: '30', type: 'EN_LIGNE' };

function getInitials(prenom = '', nom = '') {
  return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase() || '?';
}

export default function Parametres() {
  const { user, login } = useAuth();
  const { i18n } = useTranslation();

  const [tab, setTab] = useState('profil');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ---- Profil ----
  const [profile, setProfile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // ---- Sécurité ----
  const [pwdStep, setPwdStep] = useState('idle'); // idle | code-sent | done
  const [pwdCode, setPwdCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ---- Notifications (persistées en local, pas de champ dédié côté backend pour l'instant) ----
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS);

  // ---- Préférences entretiens (idem : local, lu par la page Entretiens pour pré-remplir le formulaire) ----
  const [entretienPrefs, setEntretienPrefs] = useState(DEFAULT_ENTRETIEN_PREFS);

  useEffect(() => {
    if (!user?.id) return;
    getUserById(user.id).then((res) => setProfile(res.data)).catch(console.error);

    const storedNotifs = localStorage.getItem(`fursa_notif_prefs_${user.id}`);
    if (storedNotifs) setNotifs(JSON.parse(storedNotifs));

    const storedEntretienPrefs = localStorage.getItem(`fursa_entretien_prefs_${user.id}`);
    if (storedEntretienPrefs) setEntretienPrefs(JSON.parse(storedEntretienPrefs));
  }, [user?.id]);

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function saveProfile() {
    if (!profile) return;
    try {
      setSaving(true);
      setError('');

      let updated = profile;
      if (photoFile) {
        const res = await uploadUserPhoto(profile.id, photoFile);
        updated = res.data;
      }

      const res = await updateProfile(profile.id, {
        nom: profile.nom,
        prenom: profile.prenom,
        email: profile.email,
        telephone: profile.telephone,
        formationOuPoste: profile.formationOuPoste,
      });
      updated = res.data;

      setProfile(updated);
      login({ ...user, ...updated }); // rafraîchit le nom/l'avatar affichés dans la navbar
      flashSaved();
    } catch (err) {
      console.error(err);
      setError("Échec de l'enregistrement du profil.");
    } finally {
      setSaving(false);
    }
  }

  async function sendPasswordCode() {
    try {
      setSaving(true);
      setError('');
      await forgotPassword(user.email);
      setPwdStep('code-sent');
    } catch (err) {
      console.error(err);
      setError("Échec de l'envoi du code.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmNewPassword() {
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await resetPassword(user.email, pwdCode, newPassword);
      setPwdStep('done');
      setPwdCode(''); setNewPassword(''); setConfirmPassword('');
      flashSaved();
    } catch (err) {
      console.error(err);
      setError('Code invalide ou expiré.');
    } finally {
      setSaving(false);
    }
  }

  function saveNotifs() {
    localStorage.setItem(`fursa_notif_prefs_${user.id}`, JSON.stringify(notifs));
    flashSaved();
  }

  function saveEntretienPrefs() {
    localStorage.setItem(`fursa_entretien_prefs_${user.id}`, JSON.stringify(entretienPrefs));
    flashSaved();
  }

  function handleSave() {
    if (tab === 'profil') saveProfile();
    else if (tab === 'notifications') saveNotifs();
    else if (tab === 'entretiens') saveEntretienPrefs();
    // 'securite' et 'langue' s'enregistrent via leurs propres actions (pas de bouton global pertinent)
  }

  if (!profile) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Paramètres</h1>
            <p className="rp-subtitle">Gérez votre profil et vos préférences</p>
          </div>
          {(tab === 'profil' || tab === 'notifications' || tab === 'entretiens') && (
            <button className="rp-btn rp-btn--primary" onClick={handleSave} disabled={saving}>
              <FiSave /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
        </div>
        {saved && (
          <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ Enregistré avec succès
          </div>
        )}
        {error && (
          <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', background: 'rgba(224,69,59,0.08)', border: '1px solid rgba(224,69,59,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <div className="rp-card" style={{ padding: '0.5rem' }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(''); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.7rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: tab === t.key ? 'rgba(30,79,163,0.08)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--foreground)',
              fontWeight: tab === t.key ? 700 : 500, fontSize: '0.875rem',
              cursor: 'pointer', marginBottom: '0.2rem', fontFamily: 'var(--font)',
              textAlign: 'left', borderLeft: `3px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '1rem' }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">{TABS.find((t) => t.key === tab)?.label}</span></div>
          <div className="rp-card__body">

            {tab === 'profil' && (
              <div className="rp-form">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ position: 'relative' }}>
                    {photoPreview || profile.image ? (
                      <img
                        src={photoPreview || `http://localhost:8080/${profile.image}`}
                        alt="avatar"
                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rp-avatar" style={{ width: 72, height: 72, background: 'var(--primary)', fontSize: '1.2rem' }}>
                        {getInitials(profile.prenom, profile.nom)}
                      </div>
                    )}
                    <label style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <FiCamera size={13} />
                      <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.prenom} {profile.nom}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{profile.formationOuPoste || 'Recruteur'}</div>
                  </div>
                </div>

                <div className="rp-form-row">
                  <div className="rp-field"><label className="rp-label">Prénom</label>
                    <input className="rp-input" value={profile.prenom || ''} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })} />
                  </div>
                  <div className="rp-field"><label className="rp-label">Nom</label>
                    <input className="rp-input" value={profile.nom || ''} onChange={(e) => setProfile({ ...profile, nom: e.target.value })} />
                  </div>
                </div>
                <div className="rp-field"><label className="rp-label">Adresse e-mail</label>
                  <input className="rp-input" type="email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="rp-field"><label className="rp-label">Téléphone</label>
                  <input className="rp-input" value={profile.telephone || ''} onChange={(e) => setProfile({ ...profile, telephone: e.target.value })} />
                </div>
                <div className="rp-field"><label className="rp-label">Poste / Fonction</label>
                  <input className="rp-input" placeholder="Ex: Responsable RH" value={profile.formationOuPoste || ''} onChange={(e) => setProfile({ ...profile, formationOuPoste: e.target.value })} />
                </div>
              </div>
            )}

            {tab === 'securite' && (
              <div className="rp-form">
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 0 }}>
                  Un code de vérification sera envoyé à <strong>{user.email}</strong> pour confirmer le changement de mot de passe.
                </p>

                {pwdStep === 'idle' && (
                  <button className="rp-btn rp-btn--outline" onClick={sendPasswordCode} disabled={saving}>
                    {saving ? 'Envoi...' : 'Envoyer un code de vérification'}
                  </button>
                )}

                {pwdStep === 'code-sent' && (
                  <>
                    <div className="rp-field"><label className="rp-label">Code reçu par email</label>
                      <input className="rp-input" value={pwdCode} onChange={(e) => setPwdCode(e.target.value)} placeholder="6 chiffres" />
                    </div>
                    <div className="rp-field"><label className="rp-label">Nouveau mot de passe</label>
                      <input className="rp-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial" />
                    </div>
                    <div className="rp-field"><label className="rp-label">Confirmer le mot de passe</label>
                      <input className="rp-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <button className="rp-btn rp-btn--primary" onClick={confirmNewPassword} disabled={saving}>
                      {saving ? 'Validation...' : 'Confirmer le nouveau mot de passe'}
                    </button>
                  </>
                )}

                {pwdStep === 'done' && (
                  <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>Mot de passe mis à jour avec succès.</p>
                )}
              </div>
            )}

            {tab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { key: 'nouvelleCand', label: 'Nouvelle candidature', desc: 'Être notifié à chaque nouvelle candidature' },
                  { key: 'entretien', label: "Rappel d'entretien", desc: 'Rappel avant chaque entretien programmé' },
                  { key: 'email', label: 'Notifications par email', desc: 'Recevoir les notifications par email en plus de l’app' },
                ].map((n) => (
                  <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{n.desc}</div>
                    </div>
                    <div onClick={() => setNotifs((prev) => ({ ...prev, [n.key]: !prev[n.key] }))} style={{
                      width: 44, height: 24, borderRadius: 100,
                      background: notifs[n.key] ? 'var(--primary)' : 'var(--border)',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, left: notifs[n.key] ? 23 : 3,
                        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-light)', marginTop: '0.75rem' }}>
                  Ces préférences sont stockées sur cet appareil (pas encore de table de préférences côté backend).
                </p>
              </div>
            )}

            {tab === 'langue' && (
              <div className="rp-form">
                <div className="rp-field">
                  <label className="rp-label">Langue de l'interface</label>
                  <select className="rp-input rp-input--select" value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ar">🇹🇳 العربية</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Le changement est appliqué immédiatement et mémorisé pour vos prochaines visites.</p>
              </div>
            )}

            {tab === 'entretiens' && (
              <div className="rp-form">
                <div className="rp-field">
                  <label className="rp-label">Durée par défaut des entretiens</label>
                  <select className="rp-input rp-input--select" value={entretienPrefs.duree} onChange={(e) => setEntretienPrefs({ ...entretienPrefs, duree: e.target.value })}>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-label">Type d'entretien préféré</label>
                  <select className="rp-input rp-input--select" value={entretienPrefs.type} onChange={(e) => setEntretienPrefs({ ...entretienPrefs, type: e.target.value })}>
                    <option value="EN_LIGNE">En ligne (vidéo)</option>
                    <option value="PRESENTIEL">Présentiel</option>
                  </select>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-light)' }}>
                  Le type par défaut pré-remplit le formulaire "Programmer un entretien". La durée est enregistrée mais n'est pas encore utilisée ailleurs — ton modèle Entretien n'a pas de champ durée pour l'instant.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}