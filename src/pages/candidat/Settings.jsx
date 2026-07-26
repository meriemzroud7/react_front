import React, { useState } from 'react';

function Toggle({ label, defaultChecked = true }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{label}</span>
      <button
        onClick={() => setOn((v) => !v)}
        style={{
          width: 42, height: 24, borderRadius: 100, position: 'relative', border: 'none', cursor: 'pointer',
          background: on ? 'var(--primary)' : 'var(--border)', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

export default function Settings() {
  return (
    <div>
      <div className="rp-header">
        <h1 className="rp-title">Paramètres</h1>
        <p className="rp-subtitle">Gérez votre compte, vos préférences et votre confidentialité</p>
      </div>

      <div className="rp-grid-2">
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Compte</span></div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="rp-btn rp-btn--outline" style={{ justifyContent: 'flex-start' }}>Modifier les informations personnelles</button>
            <button className="rp-btn rp-btn--outline" style={{ justifyContent: 'flex-start' }}>Changer le mot de passe</button>
            <div className="rp-field">
              <label className="rp-label">Langue</label>
              <select className="rp-input rp-input--select">
                <option>Français</option>
                <option>العربية</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Préférences de notification</span></div>
          <div className="rp-card__body">
            <Toggle label="Nouvelle offre correspondant à mon profil" />
            <Toggle label="Réponse à une candidature" />
            <Toggle label="Invitation à un entretien" />
            <Toggle label="Nouveau message" />
            <Toggle label="Rappel avant un entretien" defaultChecked={false} />
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Confidentialité du profil</span></div>
          <div className="rp-card__body">
            <Toggle label="Rendre mon profil visible aux recruteurs" />
            <Toggle label="Autoriser le contact direct par les entreprises" />
          </div>
        </div>

        <div className="rp-card" style={{ borderColor: 'rgba(224,69,59,0.3)' }}>
          <div className="rp-card__header"><span className="rp-card__title" style={{ color: 'var(--danger)' }}>Zone sensible</span></div>
          <div className="rp-card__body">
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 0 }}>La suppression de votre compte est définitive et irréversible.</p>
            <button className="rp-btn rp-btn--danger">Supprimer mon compte</button>
          </div>
        </div>
      </div>
    </div>
  );
}
