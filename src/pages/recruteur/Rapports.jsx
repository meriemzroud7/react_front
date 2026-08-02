import React, { useEffect, useMemo, useState } from 'react';
import {  FiTrendingUp, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getOffresByRecruteur } from '../../services/apiServiceOffres';
import CandidatureService from '../../services/apiServiceCandidature';

// ─────────────────────────────────────────────────────────────
// ⚠️ À ADAPTER : noms de champs et valeurs de statut utilisés par
// votre backend. Comme on ne connaît pas le schéma exact côté
// candidature/offre, tout ce qui dépend de ces champs est calculé
// ici — mais affichera "—" / "Non disponible" si le champ n'existe
// pas plutôt que d'inventer un chiffre.
// ─────────────────────────────────────────────────────────────
const CANDIDATURE_FIELDS = {
  date: 'createdAt',       // date de dépôt de la candidature
  statut: 'statut',        // valeur parmi STAGE_VALUES ci-dessous
  source: 'source',        // ex: "LinkedIn", "Candidature directe", ...
  decisionDate: 'decisionAt', // date de la décision finale (pour le délai moyen)
};
const OFFRE_FIELDS = {
  departement: 'departement', // ex: "IT / Tech", "Data & IA", ...
};

// Statuts possibles d'une candidature, dans l'ordre du parcours.
// Adaptez les valeurs (à droite) à celles utilisées par votre backend.
const STAGE_VALUES = {
  recu: null, // toute candidature compte comme "reçue"
  preselectionne: 'Présélectionné',
  entretien: 'Entretien',
  retenu: 'Retenu',
  accepte: 'Accepté',
};
const STAGE_ORDER = ['recu', 'preselectionne', 'entretien', 'retenu', 'accepte'];

const PERIOD_MONTHS = { '3m': 3, '7m': 7, '1an': 12 };

function stageIndex(statut) {
  if (statut === STAGE_VALUES.accepte) return 4;
  if (statut === STAGE_VALUES.retenu) return 3;
  if (statut === STAGE_VALUES.entretien) return 2;
  if (statut === STAGE_VALUES.preselectionne) return 1;
  return 0; // reçue, pas encore avancée
}

function monthLabel(date) {
  return date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
}

const DEPT_COLORS = ['#1e4fa3', '#7c3aed', '#0891b2', '#d97706', '#be185d', '#0f766e'];
const SOURCE_COLORS = { 'LinkedIn': '#0A66C2', 'Candidature directe': '#1e4fa3', 'Recommandation': '#0f766e', 'Jobboards': '#d97706' };

export default function Rapports() {
  const { user } = useAuth();
  const recruteurId = user?.id || user?._id;

  const [period, setPeriod] = useState('7m');
  const [loading, setLoading] = useState(true);
  // offres value isn't used elsewhere (we only fetch candidatures per offre),
  // keep setter to trigger any potential updates but avoid unused-vars warning
  const [, setOffres] = useState([]);
  const [candidatures, setCandidatures] = useState([]); // toutes offres confondues, enrichies avec offreId + departement

  useEffect(() => {
    if (!recruteurId) return;

    (async () => {
      try {
        setLoading(true);
        const offresRes = await getOffresByRecruteur(recruteurId);
        const offresList = offresRes.data || [];
        setOffres(offresList);

        const all = [];
        for (const offre of offresList) {
          const offreId = offre.id || offre._id;
          try {
            const cands = await CandidatureService.getByOffre(offreId);
            cands.forEach((c) => all.push({ ...c, __offre: offre }));
          } catch (err) {
            console.error('Échec de récupération des candidatures pour', offreId, err);
          }
        }
        setCandidatures(all);
      } finally {
        setLoading(false);
      }
    })();
  }, [recruteurId]);

  // Filtrage par période sélectionnée (basé sur la date de candidature)
  const filtered = useMemo(() => {
    const months = PERIOD_MONTHS[period] || 7;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    return candidatures.filter((c) => {
      const raw = c[CANDIDATURE_FIELDS.date];
      if (!raw) return true; // pas de date connue → on ne l'exclut pas
      const d = new Date(raw);
      return !isNaN(d) && d >= cutoff;
    });
  }, [candidatures, period]);

  // ── KPIs ──────────────────────────────────────────────
  const totalCandidatures = filtered.length;
  const recrutementsFinalises = filtered.filter((c) => c[CANDIDATURE_FIELDS.statut] === STAGE_VALUES.accepte).length;
  const entretiensRealises = filtered.filter((c) => stageIndex(c[CANDIDATURE_FIELDS.statut]) >= 2).length;
  const tauxAcceptation = entretiensRealises > 0 ? Math.round((recrutementsFinalises / entretiensRealises) * 100) : null;

  const delaisMoyens = useMemo(() => {
    const delays = filtered
      .filter((c) => c[CANDIDATURE_FIELDS.date] && c[CANDIDATURE_FIELDS.decisionDate])
      .map((c) => {
        const start = new Date(c[CANDIDATURE_FIELDS.date]);
        const end = new Date(c[CANDIDATURE_FIELDS.decisionDate]);
        return (end - start) / (1000 * 60 * 60 * 24);
      })
      .filter((d) => d >= 0);
    if (delays.length === 0) return null;
    return Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
  }, [filtered]);

  const kpis = [
    { icon: <FiCheckCircle />, val: recrutementsFinalises, label: 'Recrutements finalisés', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { icon: <FiUsers />, val: totalCandidatures, label: 'Candidatures reçues', color: '#1e4fa3', bg: 'rgba(30,79,163,0.08)' },
    { icon: <FiClock />, val: delaisMoyens != null ? `${delaisMoyens}j` : '—', label: 'Délai moyen recrutement', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { icon: <FiTrendingUp />, val: tauxAcceptation != null ? `${tauxAcceptation}%` : '—', label: "Taux d'acceptation", color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  ];

  // ── Évolution mensuelle ──────────────────────────────
  const monthly = useMemo(() => {
    const months = PERIOD_MONTHS[period] || 7;
    const buckets = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: monthLabel(d), candidatures: 0, recrutements: 0 });
    }
    filtered.forEach((c) => {
      const raw = c[CANDIDATURE_FIELDS.date];
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (!bucket) return;
      bucket.candidatures += 1;
      if (c[CANDIDATURE_FIELDS.statut] === STAGE_VALUES.accepte) bucket.recrutements += 1;
    });
    return buckets;
  }, [filtered, period]);

  const maxCands = Math.max(1, ...monthly.map((m) => m.candidatures));
  const maxRec = Math.max(1, ...monthly.map((m) => m.recrutements));

  // ── Répartition par département ──────────────────────
  const depts = useMemo(() => {
    const counts = {};
    filtered.forEach((c) => {
      const dep = c.__offre?.[OFFRE_FIELDS.departement] || 'Autre';
      counts[dep] = (counts[dep] || 0) + 1;
    });
    const total = totalCandidatures || 1;
    return Object.entries(counts)
      .map(([name, count], i) => ({ name, count, pct: Math.round((count / total) * 100), color: DEPT_COLORS[i % DEPT_COLORS.length] }))
      .sort((a, b) => b.count - a.count);
  }, [filtered, totalCandidatures]);

  // ── Sources de candidatures ───────────────────────────
  const sources = useMemo(() => {
    const counts = {};
    filtered.forEach((c) => {
      const src = c[CANDIDATURE_FIELDS.source];
      if (!src) return; // champ absent → on ne l'affiche pas comme "source inconnue" inventée
      counts[src] = (counts[src] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100), color: SOURCE_COLORS[name] || '#64748b' }))
      .sort((a, b) => b.pct - a.pct);
  }, [filtered]);

  // ── Entonnoir de recrutement ──────────────────────────
  const funnel = useMemo(() => {
    const labels = [
      { key: 'recu', label: 'Candidatures reçues', color: '#1e4fa3' },
      { key: 'preselectionne', label: 'Profils présélectionnés', color: '#0891b2' },
      { key: 'entretien', label: 'Entretiens réalisés', color: '#7c3aed' },
      { key: 'retenu', label: 'Candidats retenus', color: '#d97706' },
      { key: 'accepte', label: 'Offres acceptées', color: '#16a34a' },
    ];
    const base = totalCandidatures || 1;
    return labels.map((l) => {
      const idx = STAGE_ORDER.indexOf(l.key);
      const val = filtered.filter((c) => stageIndex(c[CANDIDATURE_FIELDS.statut]) >= idx).length;
      return { ...l, val, pct: Math.round((val / base) * 100) };
    });
  }, [filtered, totalCandidatures]);

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Rapports & Statistiques</h1>
            <p className="rp-subtitle">Analyse complète de vos performances de recrutement</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
  <div style={{ display: 'flex', background: 'var(--border-light)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
    {['3m', '7m', '1an'].map(p => (
      <button key={p} onClick={() => setPeriod(p)} style={{
        padding: '0.35rem 0.75rem', border: 'none', borderRadius: 8, cursor: 'pointer',
        fontWeight: 600, fontSize: '0.78rem', fontFamily: 'var(--font)',
        background: period === p ? '#fff' : 'transparent',
        color: period === p ? 'var(--primary)' : 'var(--muted)', transition: 'all 0.15s'
      }}>{p}</button>
    ))}
  </div>
</div>
        </div>
      </div>

      {loading ? (
        <div className="rp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          Chargement des statistiques...
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {kpis.map((k, i) => (
              <div key={i} className="rp-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{k.icon}</div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.3rem 0' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="rp-grid-2" style={{ marginBottom: '1.25rem', alignItems: 'start' }}>
            {/* Candidatures chart */}
            <div className="rp-card">
              <div className="rp-card__header">
                <span className="rp-card__title">Évolution mensuelle</span>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} />Candidatures</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)', display: 'inline-block' }} />Recrutements</span>
                </div>
              </div>
              <div className="rp-card__body">
                {monthly.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem 0' }}>Aucune donnée sur cette période.</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: 160 }}>
                    {monthly.map((m, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', height: 130 }}>
                          <div style={{ flex: 1, background: 'rgba(30,79,163,0.2)', borderRadius: '4px 4px 0 0', height: `${(m.candidatures / maxCands) * 100}%`, position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, var(--primary-light), var(--primary))', borderRadius: '4px 4px 0 0', opacity: i === monthly.length - 1 ? 1 : 0.5 }} />
                          </div>
                          <div style={{ flex: 1, background: 'var(--success)', borderRadius: '4px 4px 0 0', height: `${(m.recrutements / maxRec) * 100}%`, opacity: i === monthly.length - 1 ? 1 : 0.5 }} />
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{m.month}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Répartition by dept */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Répartition par département</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {depts.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '1rem 0' }}>Aucune donnée disponible.</div>
                ) : depts.map((d, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                      <span style={{ color: 'var(--muted)' }}>{d.count} candidats · {d.pct}%</span>
                    </div>
                    <div className="rp-progress" style={{ height: 8 }}>
                      <div className="rp-progress__fill" style={{ width: `${d.pct}%`, background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sources + Funnel */}
          <div className="rp-grid-2" style={{ alignItems: 'start' }}>
            {/* Sources */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Sources de candidatures</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sources.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '1rem 0' }}>
                    Champ "source" non renseigné sur les candidatures.
                  </div>
                ) : sources.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>{s.pct}%</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>{s.name}</div>
                      <div className="rp-progress" style={{ height: 6 }}>
                        <div className="rp-progress__fill" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment funnel */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Entonnoir de recrutement</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {funnel.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 130, fontSize: '0.78rem', color: 'var(--muted)', flexShrink: 0 }}>{f.label}</div>
                    <div style={{ flex: 1 }}>
                      <div className="rp-progress" style={{ height: 20, borderRadius: 6 }}>
                        <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.4rem', transition: 'width 0.6s ease' }}>
                          <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 700 }}>{f.val}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', width: 32, textAlign: 'right', flexShrink: 0 }}>{f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}