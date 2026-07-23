import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOffreById, updateOffre } from '../../services/apiServiceOffres'; // ajuste le chemin
import {
  FiSave, FiX, FiPlus, FiTrash2, FiAlertCircle,
  FiCheckCircle, FiFileText, FiLoader
} from 'react-icons/fi';

const CONTRATS = ['CDI', 'CDD', 'STAGE', 'FREELANCE', 'ALTERNANCE'];
const STATUTS = [
  { value: 'ACTIVE', label: 'Ouverte' },
  { value: 'CLOTUREE', label: 'Fermée' },
  { value: 'EXPIREE', label: 'Expirée' },
];
const VILLES = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Monastir', 'Gabès', 'Ariana', 'Ben Arous'];

export default function ModifierOffre() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null); // null tant que pas chargé
  const [competenceInput, setCompetenceInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getOffreById(id);
        if (mounted) {
          const data = res.data;
          setForm({
            titre: data.titre || '',
            description: data.description || '',
            competencesRequises: data.competencesRequises || [],
            localisation: data.localisation || '',
            typeContrat: data.typeContrat || '',
            dateExpiration: data.dateExpiration ? data.dateExpiration.slice(0, 10) : '',
            statut: data.statut || 'ACTIVE',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Impossible de charger l'offre");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addCompetence = () => {
    const val = competenceInput.trim();
    if (!val) return;
    set('competencesRequises', [...form.competencesRequises, val]);
    setCompetenceInput('');
  };

  const removeCompetence = (idx) => {
    set('competencesRequises', form.competencesRequises.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!form.titre.trim()) return 'Le titre est obligatoire';
    if (!form.description.trim()) return 'La description est obligatoire';
    if (!form.localisation) return 'La localisation est obligatoire';
    if (!form.typeContrat) return 'Le type de contrat est obligatoire';
    if (!form.dateExpiration) return 'La date limite est obligatoire';
    return '';
  };

  const handleSave = async () => {
    setError('');
    const v = validate();
    if (v) { setError(v); return; }

    setSaving(true);
    try {
      const payload = {
        titre: form.titre,
        description: form.description,
        competencesRequises: form.competencesRequises,
        localisation: form.localisation,
        typeContrat: form.typeContrat,
        dateExpiration: `${form.dateExpiration}T23:59:59`,
        statut: form.statut,
      };
      await updateOffre(id, payload);
      setSaved(true);
      setTimeout(() => navigate('/recruteur/offres'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
        <FiLoader className="rp-spin" /> Chargement de l'offre...
      </div>
    );
  }

  if (error && !form) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
          <FiAlertCircle /> {error}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/recruteur/offres" className="rp-btn rp-btn--outline">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  // Sécurité supplémentaire : évite le crash "Cannot read properties of null" si form n'est pas encore prêt
  if (!form) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
        <FiLoader className="rp-spin" /> Chargement...
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Modifier l'offre</h1>
            <p className="rp-subtitle">Mettez à jour les informations de l'offre "{form.titre}"</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="rp-btn rp-btn--outline" onClick={() => navigate('/recruteur/offres')}>
              <FiX /> Annuler
            </button>
            <button className="rp-btn rp-btn--primary" onClick={handleSave} disabled={saving}>
              <FiSave /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
            <FiAlertCircle /> {error}
          </div>
        )}
        {saved && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
            <FiCheckCircle /> Offre mise à jour ! Redirection...
          </div>
        )}
      </div>

      <div className="rp-card">
        <div className="rp-card__header">
          <span className="rp-card__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(30,79,163,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiFileText size={14} /></span>
            Informations de l'offre
          </span>
        </div>
        <div className="rp-card__body">
          <div className="rp-form">
            <div className="rp-field">
              <label className="rp-label">Intitulé du poste <span>*</span></label>
              <input className="rp-input" value={form.titre} onChange={e => set('titre', e.target.value)} />
            </div>

            <div className="rp-field">
              <label className="rp-label">Description <span>*</span></label>
              <textarea className="rp-input rp-input--textarea" style={{ minHeight: 160 }} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="rp-form-row">
              <div className="rp-field">
                <label className="rp-label">Localisation <span>*</span></label>
                <select className="rp-input rp-input--select" value={form.localisation} onChange={e => set('localisation', e.target.value)}>
                  <option value="">Sélectionner la ville</option>
                  {VILLES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="rp-field">
                <label className="rp-label">Type de contrat <span>*</span></label>
                <select className="rp-input rp-input--select" value={form.typeContrat} onChange={e => set('typeContrat', e.target.value)}>
                  <option value="">Sélectionner</option>
                  {CONTRATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="rp-form-row">
              <div className="rp-field">
                <label className="rp-label">Date limite de candidature <span>*</span></label>
                <input className="rp-input" type="date" value={form.dateExpiration} onChange={e => set('dateExpiration', e.target.value)} />
              </div>
              <div className="rp-field">
                <label className="rp-label">Statut de l'offre</label>
                <select className="rp-input rp-input--select" value={form.statut} onChange={e => set('statut', e.target.value)}>
                  {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="rp-label">Compétences requises</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input
                  className="rp-input"
                  placeholder="Ajouter une compétence (ex: React)"
                  value={competenceInput}
                  onChange={e => setCompetenceInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompetence(); } }}
                />
                <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={addCompetence} type="button">
                  <FiPlus size={12} /> Ajouter
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {form.competencesRequises.map((c, i) => (
                  <span key={i} className="rp-badge rp-badge--blue" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {c}
                    <FiTrash2 size={11} style={{ cursor: 'pointer' }} onClick={() => removeCompetence(i)} />
                  </span>
                ))}
                {form.competencesRequises.length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Aucune compétence ajoutée</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}