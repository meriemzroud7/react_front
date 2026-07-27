import React, { useState } from 'react';
import { FiZap, FiUser, FiBriefcase, FiPlusCircle, FiTrash2, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { genererCv, telechargerPdfCv } from '../../services/apiServiceGenerationCv';
import '../../styles/Generationcv.css';
const LANGUES = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export default function GenerationCv() {
  const [formulaire, setFormulaire] = useState({
    langue: 'fr',
    posteVise: '',
    nomComplet: '',
    email: '',
    telephone: '',
    competences: [''],
    experiences: [{ poste: '', entreprise: '', periode: '', description: '' }],
  });

  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);

  const majChamp = (champ, valeur) => {
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }));
  };

  const majCompetence = (index, valeur) => {
    const competences = [...formulaire.competences];
    competences[index] = valeur;
    majChamp('competences', competences);
  };

  const ajouterCompetence = () => {
    majChamp('competences', [...formulaire.competences, '']);
  };

  const supprimerCompetence = (index) => {
    majChamp('competences', formulaire.competences.filter((_, i) => i !== index));
  };

  const majExperience = (index, champ, valeur) => {
    const experiences = [...formulaire.experiences];
    experiences[index] = { ...experiences[index], [champ]: valeur };
    majChamp('experiences', experiences);
  };

  const ajouterExperience = () => {
    majChamp('experiences', [
      ...formulaire.experiences,
      { poste: '', entreprise: '', periode: '', description: '' },
    ]);
  };

  const supprimerExperience = (index) => {
    majChamp('experiences', formulaire.experiences.filter((_, i) => i !== index));
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    setResultat(null);

    try {
      const donnees = {
        ...formulaire,
        competences: formulaire.competences.filter((c) => c.trim() !== ''),
      };
      const reponse = await genererCv(donnees);
      setResultat(reponse);
    } catch (err) {
      setErreur("La génération a échoué. Vérifie que le backend et le token Hugging Face sont bien configurés.");
    } finally {
      setChargement(false);
    }
  };

  const telechargerPdf = async () => {
    setTelechargementEnCours(true);
    try {
      const blob = await telechargerPdfCv({
        nomComplet: formulaire.nomComplet,
        email: formulaire.email,
        telephone: formulaire.telephone,
        posteVise: formulaire.posteVise,
        langue: formulaire.langue,
        resume: resultat.resume,
        competencesAtsOptimisees: resultat.competencesAtsOptimisees,
        experiencesReformulees: resultat.experiencesReformulees,
      });

      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `CV_${formulaire.nomComplet.replace(/\s+/g, '_') || 'candidat'}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErreur("Le téléchargement du PDF a échoué.");
    } finally {
      setTelechargementEnCours(false);
    }
  };

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Générer mon CV</h1>
            <p className="rp-subtitle">Renseigne tes informations, l'IA rédige un CV optimisé ATS en FR/AR/EN</p>
          </div>
        </div>
      </div>

      <form onSubmit={soumettre} className="rp-card">
        <div className="rp-card__body">
          {/* Langue */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Langue du CV</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              {LANGUES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => majChamp('langue', l.code)}
                  className={`rp-btn rp-btn--sm ${formulaire.langue === l.code ? 'rp-btn--accent' : 'rp-btn--outline'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Infos personnelles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              className="rp-input"
              placeholder="Nom complet"
              value={formulaire.nomComplet}
              onChange={(e) => majChamp('nomComplet', e.target.value)}
              required
            />
            <input
              className="rp-input"
              placeholder="Poste visé (ex: Développeur Full Stack)"
              value={formulaire.posteVise}
              onChange={(e) => majChamp('posteVise', e.target.value)}
              required
            />
            <input
              className="rp-input"
              type="email"
              placeholder="Email"
              value={formulaire.email}
              onChange={(e) => majChamp('email', e.target.value)}
            />
            <input
              className="rp-input"
              placeholder="Téléphone"
              value={formulaire.telephone}
              onChange={(e) => majChamp('telephone', e.target.value)}
            />
          </div>

          {/* Compétences */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Compétences</label>
            {formulaire.competences.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                <input
                  className="rp-input"
                  placeholder="ex: React, Spring Boot..."
                  value={c}
                  onChange={(e) => majCompetence(i, e.target.value)}
                />
                <button type="button" className="rp-btn rp-btn--danger rp-btn--icon" onClick={() => supprimerCompetence(i)}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" className="rp-btn rp-btn--outline rp-btn--sm" style={{ marginTop: '0.5rem' }} onClick={ajouterCompetence}>
              <FiPlusCircle /> Ajouter une compétence
            </button>
          </div>

          {/* Expériences */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Expériences</label>
            {formulaire.experiences.map((exp, i) => (
              <div key={i} className="rp-card" style={{ marginTop: '0.6rem', padding: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    className="rp-input"
                    placeholder="Poste"
                    value={exp.poste}
                    onChange={(e) => majExperience(i, 'poste', e.target.value)}
                  />
                  <input
                    className="rp-input"
                    placeholder="Entreprise"
                    value={exp.entreprise}
                    onChange={(e) => majExperience(i, 'entreprise', e.target.value)}
                  />
                  <input
                    className="rp-input"
                    placeholder="Période (ex: Juin 2025 - Juil 2025)"
                    value={exp.periode}
                    onChange={(e) => majExperience(i, 'periode', e.target.value)}
                  />
                </div>
                <textarea
                  className="rp-input"
                  placeholder="Décris brièvement ce que tu as fait (l'IA reformule pour l'ATS)"
                  value={exp.description}
                  onChange={(e) => majExperience(i, 'description', e.target.value)}
                  style={{ marginTop: '0.5rem', width: '100%', minHeight: 60 }}
                />
                <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" style={{ marginTop: '0.5rem' }} onClick={() => supprimerExperience(i)}>
                  <FiTrash2 size={14} /> Supprimer
                </button>
              </div>
            ))}
            <button type="button" className="rp-btn rp-btn--outline rp-btn--sm" style={{ marginTop: '0.6rem' }} onClick={ajouterExperience}>
              <FiPlusCircle /> Ajouter une expérience
            </button>
          </div>

          <button type="submit" className="rp-btn rp-btn--accent" disabled={chargement}>
            {chargement ? <><FiRefreshCw className="rp-spin" /> Génération en cours...</> : <><FiZap /> Générer avec l'IA</>}
          </button>

          {erreur && <p style={{ color: '#dc2626', marginTop: '0.6rem', fontSize: '0.85rem' }}>{erreur}</p>}
        </div>
      </form>

      {/* Résultat */}
      {resultat && (
        <div className="rp-card" style={{ marginTop: '1.5rem' }}>
          <div className="rp-card__body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <FiUser color="#0f766e" />
              <h3 style={{ fontWeight: 700, margin: 0 }}>Aperçu généré</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{resultat.resume}</p>

            <div style={{ marginTop: '1rem' }}>
              <strong style={{ fontSize: '0.85rem' }}>Compétences optimisées ATS :</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                {resultat.competencesAtsOptimisees?.map((c, i) => (
                  <span key={i} className="rp-badge">{c}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong style={{ fontSize: '0.85rem' }}><FiBriefcase /> Expériences reformulées :</strong>
              <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                {resultat.experiencesReformulees?.map((exp, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem' }}>{exp}</li>
                ))}
              </ul>
            </div>

            <button className="rp-btn rp-btn--outline" style={{ marginTop: '1rem' }} onClick={telechargerPdf} disabled={telechargementEnCours}>
              <FiDownload /> {telechargementEnCours ? 'Génération du PDF...' : 'Télécharger en PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}