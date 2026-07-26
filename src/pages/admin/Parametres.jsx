import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';

export default function ParametresAdmin() {
  const [platformName, setPlatformName] = useState('Fursa — فرصة');
  const [theme, setTheme] = useState('Clair');
  const [langs] = useState(['Français', 'Arabe', 'Anglais']);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Paramètres de la Plateforme</h1>
            <p className="rp-subtitle">Configuration générale, sécurité et intégrations</p>
          </div>
          <button className="rp-btn rp-btn--primary"><FiSave /> Enregistrer</button>
        </div>
      </div>

      <div className="rp-grid-2">
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Général</span></div>
          <div className="rp-card__body rp-form">
            <div className="rp-field">
              <label className="rp-label">Nom de la plateforme</label>
              <input className="rp-input" value={platformName} onChange={e => setPlatformName(e.target.value)} />
            </div>
            <div className="rp-field">
              <label className="rp-label">Logo</label>
              <input className="rp-input" type="file" />
            </div>
            <div className="rp-field">
              <label className="rp-label">Thème</label>
              <select className="rp-input rp-input--select" value={theme} onChange={e => setTheme(e.target.value)}>
                <option>Clair</option>
                <option>Sombre</option>
                <option>Automatique</option>
              </select>
            </div>
            <div className="rp-field">
              <label className="rp-label">Langues disponibles</label>
              <div className="rp-tags">
                {langs.map(l => <span key={l} className="rp-tag">{l}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Emails & Sécurité</span></div>
          <div className="rp-card__body rp-form">
            <div className="rp-field">
              <label className="rp-label">Serveur SMTP</label>
              <input className="rp-input" defaultValue="smtp.gmail.com" />
            </div>
            <div className="rp-form-row">
              <div className="rp-field">
                <label className="rp-label">Port</label>
                <input className="rp-input" defaultValue="587" />
              </div>
              <div className="rp-field">
                <label className="rp-label">Adresse d'envoi</label>
                <input className="rp-input" defaultValue="noreply@fursa.tn" />
              </div>
            </div>
            <hr className="rp-section-divider" />
            <div className="rp-field">
              <label className="rp-label">Politique de mot de passe</label>
              <input className="rp-input" defaultValue="Minimum 8 caractères, 1 chiffre, 1 majuscule (BCrypt)" />
            </div>
            <div className="rp-field">
              <label className="rp-label">Durée de session (minutes)</label>
              <input className="rp-input" defaultValue="60" />
            </div>
          </div>
        </div>
      </div>

      <div className="rp-card" style={{ marginTop: '1.25rem' }}>
        <div className="rp-card__header"><span className="rp-card__title">Intégrations API</span></div>
        <div className="rp-card__body rp-form-row--3" style={{ display: 'grid' }}>
          <div className="rp-field">
            <label className="rp-label">Visioconférence</label>
            <input className="rp-input" defaultValue="Jitsi Meet" />
          </div>
          <div className="rp-field">
            <label className="rp-label">Service IA</label>
            <input className="rp-input" defaultValue="Claude API" />
          </div>
          <div className="rp-field">
            <label className="rp-label">Service Email</label>
            <input className="rp-input" defaultValue="Gmail SMTP" />
          </div>
        </div>
      </div>

      <div className="rp-card" style={{ marginTop: '1.25rem' }}>
        <div className="rp-card__header"><span className="rp-card__title">Documents légaux</span></div>
        <div className="rp-card__body" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="rp-btn rp-btn--outline">Conditions d'utilisation</button>
          <button className="rp-btn rp-btn--outline">Politique de confidentialité</button>
        </div>
      </div>
    </div>
  );
}
