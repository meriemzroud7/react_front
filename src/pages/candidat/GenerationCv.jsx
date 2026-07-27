import React, { useState } from 'react';
import {
  FiZap,
  FiUser,
  FiBriefcase,
  FiPlusCircle,
  FiTrash2,
  FiDownload,
  FiRefreshCw,
  FiAward,
  FiTag,
} from 'react-icons/fi';
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
    formations: [{ diplome: '', etablissement: '', annee: '' }],
  });

  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);

  const majChamp = (champ, valeur) => {
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }));
  };

  // ----- Compétences -----
  const majCompetence = (index, valeur) => {
    const competences = [...formulaire.competences];
    competences[index] = valeur;
    majChamp('competences', competences);
  };
  const ajouterCompetence = () => majChamp('competences', [...formulaire.competences, '']);
  const supprimerCompetence = (index) =>
    majChamp('competences', formulaire.competences.filter((_, i) => i !== index));

  // ----- Expériences -----
  const majExperience = (index, champ, valeur) => {
    const experiences = [...formulaire.experiences];
    experiences[index] = { ...experiences[index], [champ]: valeur };
    majChamp('experiences', experiences);
  };
  const ajouterExperience = () =>
    majChamp('experiences', [
      ...formulaire.experiences,
      { poste: '', entreprise: '', periode: '', description: '' },
    ]);
  const supprimerExperience = (index) =>
    majChamp('experiences', formulaire.experiences.filter((_, i) => i !== index));

  // ----- Formations / diplômes -----
  const majFormation = (index, champ, valeur) => {
    const formations = [...formulaire.formations];
    formations[index] = { ...formations[index], [champ]: valeur };
    majChamp('formations', formations);
  };
  const ajouterFormation = () =>
    majChamp('formations', [
      ...formulaire.formations,
      { diplome: '', etablissement: '', annee: '' },
    ]);
  const supprimerFormation = (index) =>
    majChamp('formations', formulaire.formations.filter((_, i) => i !== index));

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

  const estRtl = formulaire.langue === 'ar';
  const competencesRemplies = formulaire.competences.filter((c) => c.trim() !== '');
  const experiencesRemplies = formulaire.experiences.filter(
    (e) => e.poste.trim() !== '' || e.entreprise.trim() !== ''
  );
  const formationsRemplies = formulaire.formations.filter(
    (f) => f.diplome.trim() !== '' || f.etablissement.trim() !== ''
  );

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Générer mon CV</h1>
            <p className="rp-subtitle">
              Renseigne tes informations, l'IA rédige un CV optimisé ATS en FR/AR/EN
            </p>
          </div>
        </div>
      </div>

      <div className="cvgen-layout">
        {/* ---------------- Colonne formulaire ---------------- */}
        <form onSubmit={soumettre} className="rp-card">
          <div className="rp-card__body">
            {/* Informations personnelles */}
            <div className="cvgen-section">
              <div className="cvgen-section__head">
                <span className="cvgen-section__icon">
                  <FiUser size={14} />
                </span>
                <div>
                  <p className="cvgen-section__title">Informations personnelles</p>
                  <p className="cvgen-section__hint">Langue du CV et coordonnées</p>
                </div>
              </div>

              <div className="cvgen-langue-group">
                {LANGUES.map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => majChamp('langue', l.code)}
                    className={`cvgen-langue-btn ${
                      formulaire.langue === l.code ? 'cvgen-langue-btn--active' : ''
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div className="cvgen-grid-2" style={{ marginTop: '0.75rem' }}>
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
            </div>

            {/* Compétences */}
            <div className="cvgen-section">
              <div className="cvgen-section__head">
                <span className="cvgen-section__icon">
                  <FiTag size={14} />
                </span>
                <div>
                  <p className="cvgen-section__title">Compétences</p>
                  <p className="cvgen-section__hint">Une compétence par champ</p>
                </div>
              </div>

              {formulaire.competences.map((c, i) => (
                <div key={i} className="cvgen-skill-row">
                  <input
                    className="rp-input"
                    placeholder="ex: React, Spring Boot..."
                    value={c}
                    onChange={(e) => majCompetence(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="rp-btn rp-btn--danger rp-btn--icon"
                    onClick={() => supprimerCompetence(i)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rp-btn rp-btn--outline rp-btn--sm cvgen-add-btn"
                onClick={ajouterCompetence}
              >
                <FiPlusCircle /> Ajouter une compétence
              </button>
            </div>

            {/* Formations / diplômes */}
            <div className="cvgen-section">
              <div className="cvgen-section__head">
                <span className="cvgen-section__icon">
                  <FiAward size={14} />
                </span>
                <div>
                  <p className="cvgen-section__title">Formations</p>
                  <p className="cvgen-section__hint">Diplômes et établissements</p>
                </div>
              </div>

              {formulaire.formations.map((f, i) => (
                <div key={i} className="cvgen-exp-card">
                  <div className="cvgen-grid-2">
                    <input
                      className="rp-input"
                      placeholder="Diplôme (ex: Master Informatique)"
                      value={f.diplome}
                      onChange={(e) => majFormation(i, 'diplome', e.target.value)}
                    />
                    <input
                      className="rp-input"
                      placeholder="Établissement"
                      value={f.etablissement}
                      onChange={(e) => majFormation(i, 'etablissement', e.target.value)}
                    />
                  </div>
                  <input
                    className="rp-input"
                    placeholder="Année (ex: 2024)"
                    value={f.annee}
                    onChange={(e) => majFormation(i, 'annee', e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <button
                    type="button"
                    className="rp-btn rp-btn--danger rp-btn--sm cvgen-exp-card__remove"
                    onClick={() => supprimerFormation(i)}
                  >
                    <FiTrash2 size={14} /> Supprimer
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rp-btn rp-btn--outline rp-btn--sm cvgen-add-btn"
                onClick={ajouterFormation}
              >
                <FiPlusCircle /> Ajouter une formation
              </button>
            </div>

            {/* Expériences */}
            <div className="cvgen-section">
              <div className="cvgen-section__head">
                <span className="cvgen-section__icon">
                  <FiBriefcase size={14} />
                </span>
                <div>
                  <p className="cvgen-section__title">Expériences</p>
                  <p className="cvgen-section__hint">L'IA reformule chaque description pour l'ATS</p>
                </div>
              </div>

              {formulaire.experiences.map((exp, i) => (
                <div key={i} className="cvgen-exp-card">
                  <div className="cvgen-grid-2">
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
                  </div>
                  <input
                    className="rp-input"
                    placeholder="Période (ex: Juin 2025 - Juil 2025)"
                    value={exp.periode}
                    onChange={(e) => majExperience(i, 'periode', e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <textarea
                    className="rp-input"
                    placeholder="Décris brièvement ce que tu as fait (l'IA reformule pour l'ATS)"
                    value={exp.description}
                    onChange={(e) => majExperience(i, 'description', e.target.value)}
                    style={{ marginTop: '0.5rem', width: '100%', minHeight: 60 }}
                  />
                  <button
                    type="button"
                    className="rp-btn rp-btn--danger rp-btn--sm cvgen-exp-card__remove"
                    onClick={() => supprimerExperience(i)}
                  >
                    <FiTrash2 size={14} /> Supprimer
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rp-btn rp-btn--outline rp-btn--sm cvgen-add-btn"
                onClick={ajouterExperience}
              >
                <FiPlusCircle /> Ajouter une expérience
              </button>
            </div>

            <button type="submit" className="rp-btn rp-btn--accent cvgen-submit" disabled={chargement}>
              {chargement ? (
                <>
                  <FiRefreshCw className="rp-spin" /> Génération en cours...
                </>
              ) : (
                <>
                  <FiZap /> Générer avec l'IA
                </>
              )}
            </button>

            {erreur && <p className="cvgen-error">{erreur}</p>}
          </div>
        </form>

        {/* ---------------- Colonne aperçu (papier CV) ---------------- */}
        <div className="cvgen-preview-wrap">
          <div className="cvgen-preview" dir={estRtl ? 'rtl' : 'ltr'}>
            <div className="cvgen-preview__ribbon" />
            <div className="cvgen-preview__body">
              <h2
                className={`cvgen-preview__name ${
                  !formulaire.nomComplet ? 'cvgen-preview__name--placeholder' : ''
                }`}
              >
                {formulaire.nomComplet || 'Ton nom complet'}
              </h2>
              {formulaire.posteVise && (
                <p className="cvgen-preview__poste">{formulaire.posteVise}</p>
              )}
              {(formulaire.email || formulaire.telephone) && (
                <p className="cvgen-preview__contact">
                  {[formulaire.email, formulaire.telephone].filter(Boolean).join(' · ')}
                </p>
              )}

              <div className="cvgen-preview__divider" />

              {/* Résumé */}
              <p className="cvgen-preview__section-title">Résumé</p>
              <p
                className={`cvgen-preview__resume ${
                  !resultat ? 'cvgen-preview__resume--placeholder' : ''
                }`}
              >
                {resultat
                  ? resultat.resume
                  : "Le résumé professionnel généré par l'IA apparaîtra ici après la génération."}
              </p>

              <div className="cvgen-preview__divider" />

              {/* Compétences */}
              <p className="cvgen-preview__section-title">Compétences</p>
              <div className="cvgen-preview__skills">
                {(resultat?.competencesAtsOptimisees ?? competencesRemplies).length > 0 ? (
                  (resultat?.competencesAtsOptimisees ?? competencesRemplies).map((c, i) => (
                    <span
                      key={i}
                      className={`cvgen-preview__skill ${
                        !resultat ? 'cvgen-preview__skill--muted' : ''
                      }`}
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <p className="cvgen-preview__empty">Ajoute tes compétences à gauche.</p>
                )}
              </div>

              <div className="cvgen-preview__divider" />

              {/* Formations */}
              <p className="cvgen-preview__section-title">Formations</p>
              {formationsRemplies.length > 0 ? (
                formationsRemplies.map((f, i) => (
                  <div key={i} className="cvgen-preview__exp-item">
                    <strong>{f.diplome || 'Diplôme'}</strong>
                    <span className="cvgen-preview__exp-meta">
                      {[f.etablissement, f.annee].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="cvgen-preview__empty">Ajoute une formation à gauche.</p>
              )}

              <div className="cvgen-preview__divider" />

              {/* Expériences */}
              <p className="cvgen-preview__section-title">Expériences</p>
              {resultat?.experiencesReformulees?.length > 0 ? (
                resultat.experiencesReformulees.map((exp, i) => (
                  <div key={i} className="cvgen-preview__exp-item">
                    {exp}
                  </div>
                ))
              ) : experiencesRemplies.length > 0 ? (
                experiencesRemplies.map((exp, i) => (
                  <div key={i} className="cvgen-preview__exp-item">
                    <strong>{exp.poste || 'Poste'}</strong> — {exp.entreprise}
                    <span className="cvgen-preview__exp-meta">{exp.periode}</span>
                  </div>
                ))
              ) : (
                <p className="cvgen-preview__empty">Ajoute une expérience à gauche.</p>
              )}
            </div>

            <div className="cvgen-preview__footer">
              <span className="cvgen-preview__status">
                <span
                  className={`cvgen-preview__dot ${
                    chargement
                      ? 'cvgen-preview__dot--live'
                      : resultat
                      ? 'cvgen-preview__dot--done'
                      : ''
                  }`}
                />
                {chargement ? 'Génération en cours...' : resultat ? 'CV généré' : 'Aperçu en direct'}
              </span>

              {resultat && (
                <button
                  className="rp-btn rp-btn--outline cvgen-preview__download"
                  onClick={telechargerPdf}
                  disabled={telechargementEnCours}
                >
                  <FiDownload /> {telechargementEnCours ? 'Génération...' : 'Télécharger en PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}