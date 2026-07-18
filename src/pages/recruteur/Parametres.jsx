import React, { useState } from 'react';
import { FiUser, FiLock, FiBell, FiGlobe, FiMail, FiCalendar, FiSave, FiCamera } from 'react-icons/fi';

const TABS = [
  { key: 'profil', icon: <FiUser />, label: 'Profil' },
  { key: 'securite', icon: <FiLock />, label: 'Sécurité' },
  { key: 'notifications', icon: <FiBell />, label: 'Notifications' },
  { key: 'langue', icon: <FiGlobe />, label: 'Langue & Région' },
  { key: 'emails', icon: <FiMail />, label: 'Signature email' },
  { key: 'entretiens', icon: <FiCalendar />, label: 'Préférences entretiens' },
];

export default function Parametres() {
  const [tab, setTab] = useState('profil');
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ nouvelleCand: true, entretien: true, ia: true, rapport: false, email: true });
  const [langue, setLangue] = useState('fr');
  const [signature, setSignature] = useState('Cordialement,\nMariem Khelil\nResponsable RH – Fursa Tunisia\nEmail : mariem.khelil@fursa.tn');

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Paramètres</h1>
            <p className="rp-subtitle">Gérez votre profil et vos préférences</p>
          </div>
          <button className="rp-btn rp-btn--primary" onClick={save}>
            <FiSave /> Enregistrer
          </button>
        </div>
        {saved && (
          <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ Paramètres enregistrés avec succès
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <div className="rp-card" style={{ padding: '0.5rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.7rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: tab === t.key ? 'rgba(30,79,163,0.08)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--foreground)',
              fontWeight: tab === t.key ? 700 : 500, fontSize: '0.875rem',
              cursor: 'pointer', marginBottom: '0.2rem', fontFamily: 'var(--font)',
              textAlign: 'left', borderLeft: `3px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: '1rem' }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">{TABS.find(t => t.key === tab)?.label}</span></div>
          <div className="rp-card__body">

            {tab === 'profil' && (
              <div className="rp-form">
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ position: 'relative' }}>
                    <div className="rp-avatar" style={{ width: 72, height: 72, background: 'var(--primary)', fontSize: '1.2rem' }}>MK</div>
                    <button style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <FiCamera size={13} />
                    </button>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Mariem Khelil</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Responsable RH · Fursa Tunisia</div>
                    <button className="rp-btn rp-btn--outline rp-btn--sm" style={{ marginTop: '0.5rem' }}>Changer la photo</button>
                  </div>
                </div>

                <div className="rp-form-row">
                  <div className="rp-field"><label className="rp-label">Prénom</label><input className="rp-input" defaultValue="Mariem" /></div>
                  <div className="rp-field"><label className="rp-label">Nom</label><input className="rp-input" defaultValue="Khelil" /></div>
                </div>
                <div className="rp-field"><label className="rp-label">Adresse e-mail</label><input className="rp-input" type="email" defaultValue="mariem.khelil@fursa.tn" /></div>
                <div className="rp-field"><label className="rp-label">Téléphone</label><input className="rp-input" defaultValue="+216 55 123 456" /></div>
                <div className="rp-form-row">
                  <div className="rp-field"><label className="rp-label">Entreprise</label><input className="rp-input" defaultValue="Fursa Tunisia" /></div>
                  <div className="rp-field"><label className="rp-label">Poste</label><input className="rp-input" defaultValue="Responsable RH" /></div>
                </div>
                <div className="rp-field"><label className="rp-label">Biographie</label><textarea className="rp-input rp-input--textarea" defaultValue="Responsable RH avec 8 ans d'expérience dans le recrutement tech en Tunisie." style={{ minHeight: 80 }} /></div>
              </div>
            )}

            {tab === 'securite' && (
              <div className="rp-form">
                <div className="rp-field"><label className="rp-label">Mot de passe actuel</label><input className="rp-input" type="password" placeholder="••••••••" /></div>
                <div className="rp-field"><label className="rp-label">Nouveau mot de passe</label><input className="rp-input" type="password" placeholder="Min. 8 caractères" /></div>
                <div className="rp-field"><label className="rp-label">Confirmer le mot de passe</label><input className="rp-input" type="password" placeholder="••••••••" /></div>
                <div style={{ padding: '1rem', background: 'rgba(30,79,163,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(30,79,163,0.1)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Authentification à deux facteurs</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>Protégez votre compte avec la 2FA via SMS ou application.</div>
                  <button className="rp-btn rp-btn--outline rp-btn--sm">Activer la 2FA</button>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { key: 'nouvelleCand', label: 'Nouvelle candidature', desc: 'Recevez une notification à chaque nouvelle candidature' },
                  { key: 'entretien', label: 'Rappel d\'entretien', desc: 'Rappel 30 min avant chaque entretien programmé' },
                  { key: 'ia', label: 'Analyse IA terminée', desc: 'Notification quand l\'IA finit d\'analyser un CV' },
                  { key: 'rapport', label: 'Rapports hebdomadaires', desc: 'Résumé de vos activités chaque lundi' },
                  { key: 'email', label: 'Notifications par email', desc: 'Recevoir les notifications par email' },
                ].map((n, i) => (
                  <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{n.desc}</div>
                    </div>
                    <div onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))} style={{
                      width: 44, height: 24, borderRadius: 100,
                      background: notifs[n.key] ? 'var(--primary)' : 'var(--border)',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, left: notifs[n.key] ? 23 : 3,
                        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'langue' && (
              <div className="rp-form">
                <div className="rp-field">
                  <label className="rp-label">Langue de l'interface</label>
                  <select className="rp-input rp-input--select" value={langue} onChange={e => setLangue(e.target.value)}>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ar">🇹🇳 العربية</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-label">Fuseau horaire</label>
                  <select className="rp-input rp-input--select">
                    <option>UTC+1 – Tunis (Heure de Tunisie)</option>
                    <option>UTC+0 – Londres</option>
                    <option>UTC+2 – Paris (heure d'été)</option>
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-label">Format de date</label>
                  <select className="rp-input rp-input--select">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            )}

            {tab === 'emails' && (
              <div className="rp-form">
                <div className="rp-field"><label className="rp-label">Nom affiché dans les emails</label><input className="rp-input" defaultValue="Mariem Khelil – RH Fursa" /></div>
                <div className="rp-field"><label className="rp-label">Signature email</label><textarea className="rp-input rp-input--textarea" style={{ minHeight: 120, fontFamily: 'monospace' }} value={signature} onChange={e => setSignature(e.target.value)} /></div>
                <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>Aperçu</div>
                  <div style={{ fontSize: '0.82rem', whiteSpace: 'pre-line', color: 'var(--foreground)' }}>{signature}</div>
                </div>
              </div>
            )}

            {tab === 'entretiens' && (
              <div className="rp-form">
                <div className="rp-field">
                  <label className="rp-label">Durée par défaut des entretiens</label>
                  <select className="rp-input rp-input--select">
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                    <option>90 minutes</option>
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-label">Type d'entretien préféré</label>
                  <select className="rp-input rp-input--select">
                    <option>En ligne (vidéo)</option>
                    <option>Présentiel</option>
                    <option>Téléphonique</option>
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-label">Disponibilités par défaut</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((d, i) => (
                      <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={i < 4} />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rp-form-row">
                  <div className="rp-field"><label className="rp-label">Heure de début</label><input className="rp-input" type="time" defaultValue="09:00" /></div>
                  <div className="rp-field"><label className="rp-label">Heure de fin</label><input className="rp-input" type="time" defaultValue="18:00" /></div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
