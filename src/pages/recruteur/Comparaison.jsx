import React, { useEffect, useState } from 'react';
import { FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getOffresByRecruteur, getMatchScore } from '../../services/apiServiceOffres';
import CandidatureService from '../../services/apiServiceCandidature';

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];

// ─────────────────────────────────────────────────────────────
// ⚠️ À ADAPTER : noms des champs renvoyés par votre API pour le
// profil candidat. Changez uniquement les clés à droite pour
// matcher exactement ce que votre backend renvoie.
// ─────────────────────────────────────────────────────────────
const CANDIDAT_FIELDS = {
  langues: 'langues',
  softSkills: 'softSkills',
  hardSkills: 'hardSkills',
  disponibilite: 'disponibilite',
  salaire: 'salaireSouhaite',
};

// Statut de la candidature (badge). Adaptez la clé si besoin.
const STATUT_FIELD = 'statut';

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
function formatFormation(user) {
  if (!user?.niveauEtude && !user?.ecole) return 'Non renseignée';
  return `${user?.niveauEtude || ''}${user?.ecole ? ' — ' + user.ecole : ''}`.trim();
}
function formatExperience(user) {
  return user?.experienceAns != null ? `${user.experienceAns} an(s)` : 'Non renseignée';
}
function badgeVariant(statut) {
  if (statut === 'Retenu') return 'green';
  if (statut === 'Entretien') return 'blue';
  return 'amber';
}

const ROWS = [
  {
    key: 'score',
    label: 'Score IA',
    render: (v) => <strong style={{ color: v >= 90 ? 'var(--success)' : v >= 80 ? 'var(--primary)' : 'var(--accent)', fontSize: '1.2rem' }}>{v != null ? `${v}/100` : '—'}</strong>,
    text: (v) => (v != null ? `${v}/100` : '—'),
  },
  { key: 'exp', label: 'Expérience' },
  { key: 'formation', label: 'Formation' },
  { key: 'langues', label: 'Langues' },
  { key: 'soft', label: 'Soft skills' },
  { key: 'hard', label: 'Hard skills' },
  { key: 'dispo', label: 'Disponibilité' },
  { key: 'salaire', label: 'Salaire souhaité' },
];

export default function Comparaison() {
  const { user } = useAuth();
  const recruteurId = user?.id || user?._id;

  const [offres, setOffres] = useState([]);
  const [selectedOffreId, setSelectedOffreId] = useState('');
  const [loadingOffres, setLoadingOffres] = useState(true);
  const [loadingCandidats, setLoadingCandidats] = useState(false);

  const [allCandidats, setAllCandidats] = useState([]); // toutes les candidatures de l'offre, enrichies
  const [selected, setSelected] = useState([]); // ids de candidature sélectionnés pour comparaison

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
        setLoadingCandidats(true);
        setAllCandidats([]);
        setSelected([]);

        const candidatures = await CandidatureService.getByOffre(selectedOffreId);
        const usersMap = await CandidatureService.getUsersByIds(candidatures.map((c) => c.candidatId));

        const resultatsScores = await Promise.allSettled(
  candidatures.map((cand) => getMatchScore(cand.candidatId, selectedOffreId))
);

const enriched = candidatures.map((cand, i) => {
  const res = resultatsScores[i];
  const matchScore = res.status === 'fulfilled' ? (res.value.data?.matchScore ?? null) : null;
  const candidatUser = usersMap[cand.candidatId];
  return {
    id: cand.id || cand._id,
    candidature: cand,
    candidatUser,
    name: getUserDisplayName(candidatUser),
            avatar: getInitials(getUserDisplayName(candidatUser)),
            color: getAvatarColor(getUserDisplayName(candidatUser)),
            statut: cand[STATUT_FIELD] || 'En attente',
            score: matchScore,
            exp: formatExperience(candidatUser),
            formation: formatFormation(candidatUser),
            langues: candidatUser?.[CANDIDAT_FIELDS.langues] || 'Non renseignées',
            soft: candidatUser?.[CANDIDAT_FIELDS.softSkills] || 'Non renseignés',
            hard: candidatUser?.[CANDIDAT_FIELDS.hardSkills] || 'Non renseignés',
            dispo: candidatUser?.[CANDIDAT_FIELDS.disponibilite] || 'Non renseignée',
            salaire: candidatUser?.[CANDIDAT_FIELDS.salaire] || 'Non renseigné',
          };
        });

        enriched.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        setAllCandidats(enriched);
        setSelected(enriched.slice(0, 3).map((c) => c.id));
      } finally {
        setLoadingCandidats(false);
      }
    })();
  }, [selectedOffreId]);

  const candidates = allCandidats.filter((c) => selected.includes(c.id));

  const toggleCandidate = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? (prev.length > 2 ? prev.filter((x) => x !== id) : prev)
        : (prev.length >= 4 ? prev : [...prev, id])
    );
  };

  // Export Word (.doc) — du HTML basique, aucune librairie nécessaire,
  // Word l'ouvre nativement grâce à l'extension .doc.
  function handleExport() {
    if (candidates.length === 0) return;

    const headerCells = candidates.map((c) => `
      <th style="text-align:center; padding:10px; border:1px solid #ddd; background:#f5f7fb;">
        <div style="font-weight:700;">${c.name}</div>
        <div style="font-size:11px; color:#666; text-transform:uppercase;">${c.statut}</div>
      </th>
    `).join('');

    const bodyRows = ROWS.map((row) => `
      <tr>
        <td style="padding:8px 10px; border:1px solid #ddd; font-weight:600; color:#555; white-space:nowrap;">${row.label}</td>
        ${candidates.map((c) => `
          <td style="padding:8px 10px; border:1px solid #ddd; text-align:center;">
            ${row.text ? row.text(c[row.key]) : c[row.key]}
          </td>
        `).join('')}
      </tr>
    `).join('');

    const html = `
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Calibri, Arial, sans-serif;">
          <h1>Comparaison des candidats</h1>
          <p style="color:#666;">${candidates.map((c) => c.name).join(' vs ')}</p>
          <table style="border-collapse:collapse; width:100%;">
            <thead>
              <tr>
                <th style="padding:10px; border:1px solid #ddd; background:#f5f7fb;">Critère</th>
                ${headerCells}
              </tr>
            </thead>
            <tbody>
              ${bodyRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparaison-${candidates.map((c) => c.avatar).join('-').toLowerCase()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Comparaison des candidats</h1>
            <p className="rp-subtitle">Comparez jusqu'à 4 candidats côte à côte</p>
          </div>
          {candidates.length > 0 && (
            <button
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
              <FiDownload size={15} /> Exporter (Word)
            </button>
          )}
        </div>
      </div>

      {/* Offre selector */}
      <div className="rp-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <label className="rp-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Choisir une offre</label>
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
          Sélectionnez une offre ci-dessus pour comparer ses candidats.
        </div>
      ) : loadingCandidats ? (
        <div className="rp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          Chargement des candidats...
        </div>
      ) : allCandidats.length === 0 ? (
        <div className="rp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          Aucune candidature pour cette offre.
        </div>
      ) : (
        <>
          {/* Selector */}
          <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
            <div className="rp-card__header"><span className="rp-card__title">Sélectionner les candidats à comparer (2 à 4)</span></div>
            <div className="rp-card__body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {allCandidats.map((c) => (
                <button key={c.id} onClick={() => toggleCandidate(c.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem',
                  border: `2px solid ${selected.includes(c.id) ? c.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', background: selected.includes(c.id) ? `${c.color}12` : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font)'
                }}>
                  <div className="rp-avatar" style={{ width: 28, height: 28, background: c.color, fontSize: '0.65rem' }}>{c.avatar}</div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selected.includes(c.id) ? c.color : 'var(--foreground)' }}>{c.name}</span>
                  {selected.includes(c.id) && <FiCheck size={13} style={{ color: c.color }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Comparison table */}
          <div className="rp-card">
            <div className="rp-table-wrap">
              <table className="rp-table" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th style={{ width: 160 }}>Critère</th>
                    {candidates.map((c) => (
                      <th key={c.id} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0' }}>
                          <div className="rp-avatar" style={{ width: 40, height: 40, background: c.color, fontSize: '0.82rem' }}>{c.avatar}</div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'none' }}>{c.name}</div>
                          <span className={`rp-badge rp-badge--${badgeVariant(c.statut)}`}>{c.statut}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key}>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.label}</td>
                      {candidates.map((c) => (
                        <td key={c.id} style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                          {row.render ? row.render(c[row.key]) : c[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Action row */}
                  <tr style={{ background: 'rgba(30,79,163,0.02)' }}>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem' }}>Décision</td>
                    {candidates.map((c) => (
                      <td key={c.id} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button className="rp-btn rp-btn--success rp-btn--sm">
                            <FiCheck size={12} /> Retenir
                          </button>
                          <button className="rp-btn rp-btn--danger rp-btn--sm">
                            <FiX size={12} />
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}