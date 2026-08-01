import React, { useEffect, useState } from 'react';
import { FiCpu, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getOffresByRecruteur, getMatchScore } from '../../services/apiServiceOffres';
import CandidatureService from '../../services/apiServiceCandidature';

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];

function getAvatarColor(seed = '') {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}
function getUserDisplayName(user) {
  if (!user) return 'Candidat';
  const first = user.prenom || user.firstName;
  const last = user.nom || user.lastName;
  if (first && last) return `${first} ${last}`;
  return first || user.email?.split('@')[0] || 'Candidat';
}

// Recommandation générée à partir du score réel — pas de texte inventé
function getRecommandation(score, missingCount) {
  if (score >= 85) return `Recommandé fortement — score de compatibilité élevé avec l'offre.${missingCount > 0 ? ` ${missingCount} compétence(s) à vérifier en entretien.` : ''}`;
  if (score >= 70) return `Recommandé — bon niveau de compatibilité.${missingCount > 0 ? ` ${missingCount} compétence(s) manquante(s) à confirmer.` : ''}`;
  if (score >= 50) return `À examiner — compatibilité moyenne, ${missingCount} compétence(s) clé(s) manquante(s).`;
  return `Compatibilité faible avec les exigences de l'offre (${missingCount} compétence(s) manquante(s)).`;
}

export default function AnalyseIA() {
  const { user } = useAuth();
  const recruteurId = user?.id || user?._id;

  const [offres, setOffres] = useState([]);
  const [selectedOffreId, setSelectedOffreId] = useState('');
  const [candidats, setCandidats] = useState([]); // enrichis avec le score de matching
  const [selected, setSelected] = useState(0);
  const [loadingOffres, setLoadingOffres] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!recruteurId) return;
    getOffresByRecruteur(recruteurId)
      .then((res) => setOffres(res.data))
      .finally(() => setLoadingOffres(false));
  }, [recruteurId]);

  useEffect(() => {
    if (!selectedOffreId) return;

    (async () => {
      try {
        setLoadingScores(true);
        setCandidats([]);
        setSelected(0);

        const candidatures = await CandidatureService.getByOffre(selectedOffreId);
        const usersMap = await CandidatureService.getUsersByIds(candidatures.map((c) => c.candidatId));

        setProgress({ done: 0, total: candidatures.length });

        const enriched = [];
        for (const cand of candidatures) {
          try {
            const res = await getMatchScore(cand.candidatId, selectedOffreId);
            enriched.push({ candidature: cand, candidatUser: usersMap[cand.candidatId], ...res.data });
          } catch (err) {
            console.error('Échec du calcul de score pour', cand.candidatId, err);
            enriched.push({ candidature: cand, candidatUser: usersMap[cand.candidatId], matchScore: null, matchingSkills: [], missingSkills: [], selectionProbability: null });
          }
          setProgress((p) => ({ ...p, done: p.done + 1 }));
        }

        enriched.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
        setCandidats(enriched);
      } finally {
        setLoadingScores(false);
      }
    })();
  }, [selectedOffreId]);

  const offre = offres.find((o) => (o.id || o._id) === selectedOffreId);
  const c = candidats[selected];

  function handleExport() {
    if (!c) return;
    const nom = getUserDisplayName(c.candidatUser);
    const lines = [
      `Analyse IA — ${nom}`,
      `Offre : ${offre?.titre || '—'}`,
      `Score global : ${c.matchScore ?? '—'}/100`,
      `Probabilité de sélection : ${c.selectionProbability ?? '—'}%`,
      `Classement : #${selected + 1} / ${candidats.length}`,
      '',
      `Compétences détectées : ${c.matchingSkills?.join(', ') || '—'}`,
      `Compétences manquantes : ${c.missingSkills?.join(', ') || '—'}`,
      '',
      `Expérience : ${c.candidatUser?.experienceAns != null ? `${c.candidatUser.experienceAns} ans` : 'Non renseignée'}`,
      `Formation : ${c.candidatUser?.niveauEtude || c.candidatUser?.ecole ? `${c.candidatUser?.niveauEtude || ''} ${c.candidatUser?.ecole ? '— ' + c.candidatUser.ecole : ''}`.trim() : 'Non renseignée'}`,
      '',
      `Recommandation : ${getRecommandation(c.matchScore ?? 0, c.missingSkills?.length || 0)}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-ia-${nom.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Analyse IA des CV</h1>
            <p className="rp-subtitle">Scoring de compatibilité par similarité sémantique (embeddings)</p>
          </div>
          {c && (
            <button className="rp-btn rp-btn--outline" onClick={handleExport}><FiDownload /> Exporter l'analyse</button>
          )}
        </div>
      </div>

      <div className="rp-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <label className="rp-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Choisir une offre à analyser</label>
        <select
          className="rp-input rp-input--select"
          value={selectedOffreId}
          onChange={(e) => setSelectedOffreId(e.target.value)}
          disabled={loadingOffres}
          style={{ maxWidth: 420 }}
        >
          <option value="" disabled>{loadingOffres ? 'Chargement...' : 'Sélectionner une offre'}</option>
          {offres.map((o) => (
            <option key={o.id || o._id} value={o.id || o._id}>{o.titre}</option>
          ))}
        </select>
      </div>

      {!selectedOffreId ? (
        <div className="rp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          Sélectionnez une offre ci-dessus pour analyser les candidatures reçues.
        </div>
      ) : loadingScores ? (
        <div className="rp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          Calcul des scores en cours ({progress.done}/{progress.total})...
        </div>
      ) : candidats.length === 0 ? (
        <div className="rp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          Aucune candidature pour cette offre.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Candidate selector */}
          <div className="rp-card" style={{ position: 'sticky', top: 80 }}>
            <div className="rp-card__header"><span className="rp-card__title">Candidats</span></div>
            <div style={{ padding: '0.5rem' }}>
              {candidats.map((cd, i) => {
                const nom = getUserDisplayName(cd.candidatUser);
                return (
                  <button key={cd.candidature.id || cd.candidature._id} onClick={() => setSelected(i)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
                    padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: selected === i ? 'rgba(30,79,163,0.08)' : 'transparent',
                    cursor: 'pointer', marginBottom: '0.25rem', textAlign: 'left',
                    borderLeft: selected === i ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    <div className="rp-avatar" style={{ width: 36, height: 36, background: getAvatarColor(nom), fontSize: '0.75rem', flexShrink: 0 }}>{getInitials(nom)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nom}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Score : <strong style={{ color: 'var(--primary)' }}>{cd.matchScore ?? '—'}/100</strong></div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: (cd.matchScore ?? 0) >= 90 ? 'var(--success)' : 'var(--primary)' }}>#{i + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analysis panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Score overview */}
            <div className="rp-card">
              <div className="rp-card__body" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="rp-avatar" style={{ width: 52, height: 52, background: getAvatarColor(getUserDisplayName(c.candidatUser)), fontSize: '1rem' }}>
                    {getInitials(getUserDisplayName(c.candidatUser))}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{getUserDisplayName(c.candidatUser)}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{offre?.titre}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{c.matchScore ?? '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Score global /100</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>{c.selectionProbability ?? '—'}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Probabilité de sélection</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>#{selected + 1}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Classement / {candidats.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="rp-grid-2">
              <div className="rp-card">
                <div className="rp-card__header"><span className="rp-card__title" style={{ color: 'var(--success)' }}>✓ Compétences détectées</span></div>
                <div className="rp-card__body">
                  <div className="rp-tags">
                    {c.matchingSkills?.length > 0
                      ? c.matchingSkills.map((s) => <span key={s} className="rp-tag rp-tag--ok">{s}</span>)
                      : <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Aucune</span>}
                  </div>
                </div>
              </div>
              <div className="rp-card">
                <div className="rp-card__header"><span className="rp-card__title" style={{ color: 'var(--danger)' }}>✗ Compétences manquantes</span></div>
                <div className="rp-card__body">
                  <div className="rp-tags">
                    {c.missingSkills?.length > 0
                      ? c.missingSkills.map((s) => <span key={s} className="rp-tag rp-tag--missing">{s}</span>)
                      : <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Aucune</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Details (uniquement des champs réellement présents sur le profil candidat) */}
            <div className="rp-card">
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: 'Expérience', content: c.candidatUser?.experienceAns != null ? `${c.candidatUser.experienceAns} an(s)` : 'Non renseignée' },
                  { title: 'Formation', content: (c.candidatUser?.niveauEtude || c.candidatUser?.ecole) ? `${c.candidatUser?.niveauEtude || ''}${c.candidatUser?.ecole ? ' — ' + c.candidatUser.ecole : ''}` : 'Non renseignée' },
                ].map((item, i) => (
                  <div key={i} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.content}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* IA Recommendation — générée depuis le score réel, pas un texte inventé */}
            <div style={{ padding: '1.25rem', background: 'rgba(30,79,163,0.05)', border: '1.5px solid rgba(30,79,163,0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><FiCpu size={16} /></div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Recommandation</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
                  {getRecommandation(c.matchScore ?? 0, c.missingSkills?.length || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}