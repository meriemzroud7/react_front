import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCpu, FiSend, FiSave, FiX, FiPlus, FiTrash2,
  FiAlertCircle, FiCheckCircle, FiFileText
} from 'react-icons/fi';

const INIT = {
  titre: '', description: '', missions: '', competences: '',
  niveau: '', experience: '', salaire: '', contrat: '', localisation: '',
  limite: '', obligatoires: [''], souhaitees: [''], poids: {},
};

export default function CreerOffre() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const updateList = (key, idx, val) => {
    const arr = [...form[key]];
    arr[idx] = val;
    set(key, arr);
  };

  const addItem = (key) => set(key, [...form[key], '']);
  const removeItem = (key, idx) => set(key, form[key].filter((_, i) => i !== idx));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const handlePublish = () => { setPublished(true); setTimeout(() => navigate('/recruteur/offres'), 1500); };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Créer une offre d'emploi</h1>
            <p className="rp-subtitle">Remplissez le formulaire et configurez les critères IA de sélection</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="rp-btn rp-btn--outline" onClick={handleSave}>
              <FiSave /> Enregistrer brouillon
            </button>
            <button className="rp-btn rp-btn--primary" onClick={handlePublish}>
              <FiSend /> Publier l'offre
            </button>
          </div>
        </div>
        {saved && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
            <FiCheckCircle /> Brouillon enregistré avec succès
          </div>
        )}
        {published && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'rgba(30,79,163,0.1)', border: '1px solid rgba(30,79,163,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <FiSend /> Offre publiée ! Redirection...
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Main form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Informations générales */}
          <div className="rp-card">
            <div className="rp-card__header">
              <span className="rp-card__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(30,79,163,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiFileText size={14} /></span>
                Informations générales
              </span>
            </div>
            <div className="rp-card__body">
              <div className="rp-form">
                <div className="rp-field">
                  <label className="rp-label">Intitulé du poste <span>*</span></label>
                  <input className="rp-input" placeholder="ex: Software Engineer – React/Node.js" value={form.titre} onChange={e => set('titre', e.target.value)} />
                </div>
                <div className="rp-field">
                  <label className="rp-label">Description du poste <span>*</span></label>
                  <textarea className="rp-input rp-input--textarea" placeholder="Décrivez le poste, l'entreprise, le contexte..." value={form.description} onChange={e => set('description', e.target.value)} />
                </div>
                <div className="rp-field">
                  <label className="rp-label">Missions principales</label>
                  <textarea className="rp-input rp-input--textarea" style={{ minHeight: 80 }} placeholder="– Développer des fonctionnalités front-end&#10;– Participer aux code reviews..." value={form.missions} onChange={e => set('missions', e.target.value)} />
                </div>
                <div className="rp-field">
                  <label className="rp-label">Compétences requises</label>
                  <textarea className="rp-input rp-input--textarea" style={{ minHeight: 70 }} placeholder="React, Node.js, PostgreSQL, Git..." value={form.competences} onChange={e => set('competences', e.target.value)} />
                </div>

                <div className="rp-form-row">
                  <div className="rp-field">
                    <label className="rp-label">Niveau d'études <span>*</span></label>
                    <select className="rp-input rp-input--select" value={form.niveau} onChange={e => set('niveau', e.target.value)}>
                      <option value="">Sélectionner</option>
                      <option>Bac</option>
                      <option>Bac+2 / BTS</option>
                      <option>Bac+3 / Licence</option>
                      <option>Bac+5 / Master / Ingénieur</option>
                      <option>Doctorat</option>
                    </select>
                  </div>
                  <div className="rp-field">
                    <label className="rp-label">Expérience requise <span>*</span></label>
                    <select className="rp-input rp-input--select" value={form.experience} onChange={e => set('experience', e.target.value)}>
                      <option value="">Sélectionner</option>
                      <option>Stage</option>
                      <option>Débutant (0-1 an)</option>
                      <option>Junior (1-3 ans)</option>
                      <option>Confirmé (3-5 ans)</option>
                      <option>Senior (5+ ans)</option>
                    </select>
                  </div>
                </div>

                <div className="rp-form-row">
                  <div className="rp-field">
                    <label className="rp-label">Fourchette salariale (TND)</label>
                    <input className="rp-input" placeholder="ex: 2500 – 4000 TND/mois" value={form.salaire} onChange={e => set('salaire', e.target.value)} />
                  </div>
                  <div className="rp-field">
                    <label className="rp-label">Type de contrat <span>*</span></label>
                    <select className="rp-input rp-input--select" value={form.contrat} onChange={e => set('contrat', e.target.value)}>
                      <option value="">Sélectionner</option>
                      <option>CDI</option>
                      <option>CDD</option>
                      <option>Stage PFE</option>
                      <option>Stage d'été</option>
                      <option>Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="rp-form-row">
                  <div className="rp-field">
                    <label className="rp-label">Localisation <span>*</span></label>
                    <select className="rp-input rp-input--select" value={form.localisation} onChange={e => set('localisation', e.target.value)}>
                      <option value="">Sélectionner la ville</option>
                      {['Tunis','Sfax','Sousse','Bizerte','Nabeul','Monastir','Gabès','Ariana','Ben Arous'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="rp-field">
                    <label className="rp-label">Date limite de candidature <span>*</span></label>
                    <input className="rp-input" type="date" value={form.limite} onChange={e => set('limite', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compétences IA */}
          <div className="rp-card">
            <div className="rp-card__header">
              <span className="rp-card__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(30,79,163,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCpu size={14} /></span>
                Critères IA de sélection
              </span>
            </div>
            <div className="rp-card__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(30,79,163,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(30,79,163,0.1)', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--primary)' }}>
                <FiAlertCircle size={14} /> Ces critères seront utilisés par l'IA pour scorer et classer automatiquement les candidatures.
              </div>

              <div className="rp-form">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label className="rp-label">Compétences obligatoires</label>
                    <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={() => addItem('obligatoires')}>
                      <FiPlus size={12} /> Ajouter
                    </button>
                  </div>
                  {form.obligatoires.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input className="rp-input" placeholder={`Compétence ${i + 1} (ex: React)`} value={c} onChange={e => updateList('obligatoires', i, e.target.value)} />
                      <input className="rp-input" placeholder="Poids %" type="number" min={1} max={100} style={{ width: 80, flexShrink: 0 }} />
                      {form.obligatoires.length > 1 && (
                        <button className="rp-btn rp-btn--danger rp-btn--icon" onClick={() => removeItem('obligatoires', i)}><FiTrash2 size={13} /></button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label className="rp-label">Compétences souhaitées</label>
                    <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={() => addItem('souhaitees')}>
                      <FiPlus size={12} /> Ajouter
                    </button>
                  </div>
                  {form.souhaitees.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input className="rp-input" placeholder={`Compétence souhaitée ${i + 1}`} value={c} onChange={e => updateList('souhaitees', i, e.target.value)} />
                      <input className="rp-input" placeholder="Poids %" type="number" min={1} max={100} style={{ width: 80, flexShrink: 0 }} />
                      {form.souhaitees.length > 1 && (
                        <button className="rp-btn rp-btn--danger rp-btn--icon" onClick={() => removeItem('souhaitees', i)}><FiTrash2 size={13} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 80 }}>
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Récapitulatif</span></div>
            <div className="rp-card__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'Intitulé', val: form.titre || '–' },
                  { label: 'Contrat', val: form.contrat || '–' },
                  { label: 'Lieu', val: form.localisation || '–' },
                  { label: 'Expérience', val: form.experience || '–' },
                  { label: 'Date limite', val: form.limite || '–' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                    <span style={{ fontWeight: 600, maxWidth: 160, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button className="rp-btn rp-btn--primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePublish}>
              <FiSend /> Publier l'offre
            </button>
            <button className="rp-btn rp-btn--outline" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
              <FiSave /> Enregistrer brouillon
            </button>
            <button className="rp-btn rp-btn--danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/recruteur/offres')}>
              <FiX /> Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
