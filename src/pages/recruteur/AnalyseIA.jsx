import React, { useEffect, useState } from 'react';
import { FiCpu, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getOffresByRecruteur, getMatchScore } from '../../services/apiServiceOffres';
import CandidatureService from '../../services/apiServiceCandidature';

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];

// ─────────────────────────────────────────────────────────────
// ⚠️ À ADAPTER : noms des champs de sous-scores renvoyés par
// votre API getMatchScore(). Changez uniquement les clés à droite
// pour matcher exactement ce que votre backend renvoie.
// ─────────────────────────────────────────────────────────────
const SCORE_FIELDS = {
  technique: 'scoreTechnique',
  experience: 'scoreExperience',
  formation: 'scoreFormation',
  langues: 'scoreLangues',
  softSkills: 'scoreSoftSkills',
};

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

// ─────────────────────────────────────────────────────────────
// Radar chart hexagonal (SVG pur, sans dépendance externe)
// 6 axes : Technique, Expérience, Diplôme, Langues, Soft, Compat
// ─────────────────────────────────────────────────────────────
function RadarChart({ axes, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const levels = 4; // nombre d'anneaux de la grille
  const n = axes.length;

  const pointAt = (index, valueRatio) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = radius * valueRatio;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const gridPolygons = Array.from({ length: levels }, (_, lvl) => {
    const ratio = (lvl + 1) / levels;
    const pts = axes.map((_, i) => pointAt(i, ratio).join(',')).join(' ');
    return pts;
  });

  const dataPoints = axes.map((a, i) => pointAt(i, Math.max(0, Math.min(1, (a.value ?? 0) / 100)))).map((p) => p.join(',')).join(' ');

  const labelPositions = axes.map((a, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const lr = radius + 22;
    return { x: cx + lr * Math.cos(angle), y: cy + lr * Math.sin(angle), label: a.label, value: a.value };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="var(--border-light)" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pointAt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border-light)" strokeWidth="1" />;
      })}
      <polygon points={dataPoints} fill="var(--primary)" fillOpacity="0.18" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, Math.max(0, Math.min(1, (a.value ?? 0) / 100)));
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--primary)" />;
      })}
      {labelPositions.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10.5"
          fontWeight="700"
          fill="var(--muted)"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

function ScoreBar({ label, value, color = 'var(--primary)' }) {
  const v = value == null ? null : Math.max(0, Math.min(100, value));
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        <span>{label}</span>
        <span style={{ color }}>{v != null ? `${v}/100` : '—'}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--border-light)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${v ?? 0}%`, background: color, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
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
    const experience = c.candidatUser?.experienceAns != null ? `${c.candidatUser.experienceAns} ans` : 'Non renseignée';
    const formation = (c.candidatUser?.niveauEtude || c.candidatUser?.ecole)
      ? `${c.candidatUser?.niveauEtude || ''} ${c.candidatUser?.ecole ? '— ' + c.candidatUser.ecole : ''}`.trim()
      : 'Non renseignée';

    // Document Word simple : du HTML basique, ouvert nativement par Word
    // grâce à l'extension .doc (aucune librairie nécessaire).
    const html = `
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Calibri, Arial, sans-serif;">
          <h1>Analyse IA — ${nom}</h1>
          <p style="color:#666;">${offre?.titre || ''}</p>

          <h2>Résultats</h2>
          <p><b>Score global :</b> ${c.matchScore ?? '—'}/100</p>
          <p><b>Probabilité de sélection :</b> ${c.selectionProbability ?? '—'}%</p>
          <p><b>Classement :</b> #${selected + 1} / ${candidats.length}</p>

          <h2>Scores détaillés</h2>
          <p><b>Compétences techniques :</b> ${c[SCORE_FIELDS.technique] ?? '—'}/100</p>
          <p><b>Expérience professionnelle :</b> ${c[SCORE_FIELDS.experience] ?? '—'}/100</p>
          <p><b>Formation académique :</b> ${c[SCORE_FIELDS.formation] ?? '—'}/100</p>
          <p><b>Langues :</b> ${c[SCORE_FIELDS.langues] ?? '—'}/100</p>
          <p><b>Soft skills :</b> ${c[SCORE_FIELDS.softSkills] ?? '—'}/100</p>

          <h2>Compétences</h2>
          <p><b>Détectées :</b> ${c.matchingSkills?.join(', ') || '—'}</p>
          <p><b>Manquantes :</b> ${c.missingSkills?.join(', ') || '—'}</p>

          <h2>Profil candidat</h2>
          <p><b>Expérience :</b> ${experience}</p>
          <p><b>Formation :</b> ${formation}</p>

          <h2>Recommandation</h2>
          <p>${getRecommandation(c.matchScore ?? 0, c.missingSkills?.length || 0)}</p>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-ia-${nom.replace(/\s+/g, '-').toLowerCase()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const radarAxes = c
    ? [
        { label: 'Tech', value: c[SCORE_FIELDS.technique] },
        { label: 'Exp', value: c[SCORE_FIELDS.experience] },
        { label: 'Diplôme', value: c[SCORE_FIELDS.formation] },
        { label: 'Langues', value: c[SCORE_FIELDS.langues] },
        { label: 'Soft', value: c[SCORE_FIELDS.softSkills] },
        { label: 'Compat', value: c.selectionProbability },
      ]
    : [];

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Analyse IA des CV</h1>
            <p className="rp-subtitle">Scoring de compatibilité par similarité sémantique (embeddings)</p>
          </div>
          {c && (
            <button
              className="rp-btn-export"
              onClick={handleExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.65rem 1.15rem',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#fff',
                background: 'linear-gradient(135deg, var(--primary), #3b6fd6)',
                boxShadow: '0 4px 14px rgba(30,79,163,0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(30,79,163,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(30,79,163,0.35)';
              }}
            >
              <FiDownload size={15} />
              Exporter l'analyse
            </button>
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
            {/* Score overview + breakdown + radar (comme image 2) */}
            <div className="rp-card">
              <div className="rp-card__body" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                    <div className="rp-avatar" style={{ width: 52, height: 52, background: getAvatarColor(getUserDisplayName(c.candidatUser)), fontSize: '1rem' }}>
                      {getInitials(getUserDisplayName(c.candidatUser))}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{getUserDisplayName(c.candidatUser)}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{offre?.titre}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
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

                  <ScoreBar label="Compétences techniques" value={c[SCORE_FIELDS.technique]} color="var(--primary)" />
                  <ScoreBar label="Expérience professionnelle" value={c[SCORE_FIELDS.experience]} color="var(--success)" />
                  <ScoreBar label="Formation académique" value={c[SCORE_FIELDS.formation]} color="var(--accent)" />
                  <ScoreBar label="Langues" value={c[SCORE_FIELDS.langues]} color="#0891b2" />
                  <ScoreBar label="Soft skills" value={c[SCORE_FIELDS.softSkills]} color="#7c3aed" />
                </div>

                <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 220 }}>
                  <RadarChart axes={radarAxes} />
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