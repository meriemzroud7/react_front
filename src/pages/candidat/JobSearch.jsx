import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiBookmark } from 'react-icons/fi';
import { getAllOffres, sauvegarderOffre, retirerOffreSauvegardee, getOffresSauvegardees ,getMatchScore } from '../../services/apiServiceOffres';
import { useAuth } from '../../context/AuthContext'; // adapte le chemin si différent
const CONTRACT_FILTERS = [
  { valeur: 'CDI', label: 'CDI' },
  { valeur: 'CDD', label: 'CDD' },
  { valeur: 'STAGE', label: 'Stage' },
  { valeur: 'FREELANCE', label: 'Freelance' },
  { valeur: 'ALTERNANCE', label: 'Alternance' },
];

const API_BASE_URL = 'http://localhost:8080';

const MatchScore = ({ value, size = 56 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '2px solid var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.28,
      fontWeight: 700,
      color: 'var(--accent-dark)',
    }}
    title={`Score de correspondance: ${value}%`}
  >
    {value}%
  </div>
);

export default function JobSearch() {
  
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [saved, setSaved] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [scores, setScores] = useState({});
useEffect(() => {
  async function charger() {
    try {
      const [reponseOffres, reponseSauvegardees] = await Promise.all([
        getAllOffres(),
        user?.id ? getOffresSauvegardees(user.id) : Promise.resolve({ data: [] }),
      ]);
      setJobs(reponseOffres.data);
      setSaved(reponseSauvegardees.data.map((o) => o.id));

      if (user?.id) {
        const resultats = await Promise.allSettled(
          reponseOffres.data.map((job) => getMatchScore(user.id, job.id))
        );
        const scoresMap = {};
        resultats.forEach((res, i) => {
          if (res.status === 'fulfilled') {
            scoresMap[reponseOffres.data[i].id] = res.value.data.matchScore;
          }
        });
        setScores(scoresMap);
      }
    } catch (err) {
      console.error('Erreur chargement des offres :', err);
    } finally {
      setChargement(false);
    }
  }
  charger();
}, [user]);

  const toggleFilter = (f) => setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const toggleSave = async (offreId) => {
    if (!user?.id) return;
    const estSauvegardee = saved.includes(offreId);
    try {
      if (estSauvegardee) {
        await retirerOffreSauvegardee(user.id, offreId);
        setSaved((prev) => prev.filter((id) => id !== offreId));
      } else {
        await sauvegarderOffre(user.id, offreId);
        setSaved((prev) => [...prev, offreId]);
      }
    } catch (err) {
      console.error('Erreur sauvegarde offre :', err);
    }
  };

  const formaterDate = (dateIso) => {
    if (!dateIso) return '';
    const jours = Math.floor((Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24));
    if (jours === 0) return "Publiée aujourd'hui";
    if (jours === 1) return 'Publiée hier';
    return `Publiée il y a ${jours} jours`;
  };

  const results = useMemo(() => jobs.filter((j) => {
    const matchesQuery = !query
      || j.titre?.toLowerCase().includes(query.toLowerCase())
      || j.nomEntreprise?.toLowerCase().includes(query.toLowerCase())
      || j.localisation?.toLowerCase().includes(query.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || activeFilters.some((f) => j.typeContrat === f);
    return matchesQuery && matchesFilters;
  }), [jobs, query, activeFilters]);

  if (chargement) return <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement des offres...</p>;

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Rechercher des offres</h1>
            <p className="rp-subtitle">{results.length} offre(s) correspondant à votre recherche</p>
          </div>
        </div>
      </div>

      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-filters" style={{ border: 'none' }}>
          <div className="rp-filter-input" style={{ flex: 1, minWidth: 240 }}>
            <FiSearch className="rp-filter-icon" />
            <input
              style={{ width: '100%' }}
              placeholder="Mot-clé, entreprise, ville, domaine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0 1.25rem 1.1rem' }}>
          {CONTRACT_FILTERS.map((f) => (
            <button
              key={f.valeur}
              onClick={() => toggleFilter(f.valeur)}
              className={`rp-badge ${activeFilters.includes(f.valeur) ? 'rp-badge--blue' : 'rp-badge--gray'}`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.map((job) => (
          <div key={job.id} className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {job.logoEntreprise ? (
                <img
                  src={`${API_BASE_URL}${job.logoEntreprise}`}
                  alt={job.nomEntreprise}
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div className="rp-avatar" style={{ width: 48, height: 48, background: '#0f766e', fontSize: '0.95rem' }}>
                  {job.nomEntreprise?.substring(0, 2).toUpperCase() || '?'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <Link to={`/candidat/offres/${job.id}`} style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', textDecoration: 'none' }}>{job.titre}</Link>
                  <button
                    className="rp-btn rp-btn--outline rp-btn--icon"
                    onClick={() => toggleSave(job.id)}
                    style={{ color: saved.includes(job.id) ? 'var(--accent-dark)' : 'var(--muted)', borderColor: saved.includes(job.id) ? 'var(--accent)' : 'var(--border)' }}
                  >
                    <FiBookmark size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{job.nomEntreprise}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} />{job.localisation}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} />{formaterDate(job.dateCreation)}</span>
                </div>
                <div className="rp-tags" style={{ marginTop: '0.5rem' }}>
                  <span className="rp-badge rp-badge--blue">
                    {CONTRACT_FILTERS.find((f) => f.valeur === job.typeContrat)?.label || job.typeContrat}
                  </span>
                </div>
              </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1rem' }}>
                {scores[job.id] !== undefined && (
                  <MatchScore value={scores[job.id]} size={56} />
                )}
                <Link to={`/candidat/offres/${job.id}`} className="rp-btn rp-btn--outline rp-btn--sm">Voir l'offre</Link>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem 0' }}>Aucune offre ne correspond à votre recherche.</p>}
      </div>
    </div>
  );
}