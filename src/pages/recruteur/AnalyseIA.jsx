import React, { useState } from 'react';
import { FiCpu, FiDownload } from 'react-icons/fi';

const CANDIDATES = [
  {
    id: 1, name: 'Yasmine Ben Ali', avatar: 'YB', color: '#1e4fa3', poste: 'Software Engineer',
    score: 94, compat: 96,
    skills_ok: ['React', 'Node.js', 'TypeScript', 'Git', 'PostgreSQL'],
    skills_miss: ['Docker', 'Kubernetes'],
    exp: '4 ans (Vermeg, Telnet)', diplome: 'Ingénieur en Informatique – ENIT 2020',
    langues: ['Arabe (natif)', 'Français (courant)', 'Anglais (professionnel)'],
    certifs: ['AWS Cloud Practitioner', 'React Developer Certification'],
    points_forts: ['Solide expérience React/Node', 'Excellentes compétences backend', 'Profil complet et structuré'],
    points_faibles: ['Pas d\'expérience Docker/K8s', 'Mobilité limitée'],
    recommandation: 'RECOMMANDÉ FORTEMENT – Profil senior très adapté au poste. Score élevé sur toutes les compétences critiques.',
    rang: 1,
  },
  {
    id: 2, name: 'Sarra Chaari', avatar: 'SC', color: '#7c3aed', poste: 'Software Engineer',
    score: 91, compat: 89,
    skills_ok: ['React', 'TypeScript', 'Docker', 'AWS', 'CI/CD'],
    skills_miss: ['Node.js', 'PostgreSQL'],
    exp: '5 ans (Proxym Group)', diplome: 'Master Systèmes Distribués – ESPRIT 2019',
    langues: ['Arabe (natif)', 'Anglais (courant)', 'Français (intermédiaire)'],
    certifs: ['AWS Solutions Architect', 'Docker Certified'],
    points_forts: ['Très forte expertise DevOps', 'Expérience Docker/Cloud', 'Profil senior'],
    points_faibles: ['Moins d\'expérience Node.js', 'Background plus DevOps que Full Stack'],
    recommandation: 'RECOMMANDÉ – Excellent profil DevOps/Cloud. Quelques lacunes côté backend Node.js.',
    rang: 2,
  },
];

function RadarChart({ skills }) {
  const cx = 80, cy = 80, r = 60;
  const n = skills.length;
  const pts = skills.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const ratio = s.val / 100;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle), lx: cx + (r + 18) * Math.cos(angle), ly: cy + (r + 18) * Math.sin(angle), label: s.name };
  });
  const polyPts = pts.map(p => `${p.x},${p.y}`).join(' ');
  const gridLevels = [0.25, 0.5, 0.75, 1];
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {gridLevels.map(lvl =>
        skills.map((_, i) => {
          const a1 = (Math.PI * 2 * i) / n - Math.PI / 2;
          const a2 = (Math.PI * 2 * ((i + 1) % n)) / n - Math.PI / 2;
          return <line key={`${lvl}-${i}`} x1={cx + r * lvl * Math.cos(a1)} y1={cy + r * lvl * Math.sin(a1)} x2={cx + r * lvl * Math.cos(a2)} y2={cy + r * lvl * Math.sin(a2)} stroke="var(--border)" strokeWidth={0.8} />;
        })
      )}
      {skills.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="var(--border)" strokeWidth={0.8} />;
      })}
      <polygon points={polyPts} fill="rgba(30,79,163,0.18)" stroke="var(--primary)" strokeWidth={1.5} />
      {pts.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="var(--muted)" fontFamily="Poppins, sans-serif">{p.label}</text>
      ))}
    </svg>
  );
}

export default function AnalyseIA() {
  const [selected, setSelected] = useState(0);
  const c = CANDIDATES[selected];

  const RADAR = [
    { name: 'Tech', val: c.score }, { name: 'Exp', val: Math.round(c.score * 0.95) },
    { name: 'Diplôme', val: Math.round(c.score * 0.9) }, { name: 'Langues', val: Math.round(c.score * 0.85) },
    { name: 'Soft', val: Math.round(c.score * 0.88) }, { name: 'Compat', val: c.compat },
  ];

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Analyse IA des CV</h1>
            <p className="rp-subtitle">Scoring automatique et analyse détaillée par intelligence artificielle</p>
          </div>
          <button className="rp-btn rp-btn--outline"><FiDownload /> Exporter l'analyse</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Candidate selector */}
        <div className="rp-card" style={{ position: 'sticky', top: 80 }}>
          <div className="rp-card__header"><span className="rp-card__title">Candidats</span></div>
          <div style={{ padding: '0.5rem' }}>
            {CANDIDATES.map((cd, i) => (
              <button key={cd.id} onClick={() => setSelected(i)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none',
                background: selected === i ? 'rgba(30,79,163,0.08)' : 'transparent',
                cursor: 'pointer', marginBottom: '0.25rem', textAlign: 'left',
                borderLeft: selected === i ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s'
              }}>
                <div className="rp-avatar" style={{ width: 36, height: 36, background: cd.color, fontSize: '0.75rem', flexShrink: 0 }}>{cd.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cd.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Score : <strong style={{ color: 'var(--primary)' }}>{cd.score}/100</strong></div>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: cd.score >= 90 ? 'var(--success)' : 'var(--primary)' }}>#{cd.rang}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Score overview */}
          <div className="rp-card">
            <div className="rp-card__body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="rp-avatar" style={{ width: 52, height: 52, background: c.color, fontSize: '1rem' }}>{c.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{c.poste}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{c.score}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Score global /100</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>{c.compat}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Compatibilité</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>#{c.rang}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Classement</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'Compétences techniques', val: c.score },
                  { label: 'Expérience professionnelle', val: Math.round(c.score * 0.95) },
                  { label: 'Formation académique', val: Math.round(c.score * 0.9) },
                  { label: 'Langues', val: Math.round(c.score * 0.85) },
                  { label: 'Soft skills', val: Math.round(c.score * 0.88) },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--muted)' }}>{item.label}</span>
                      <span style={{ fontWeight: 700 }}>{item.val}/100</span>
                    </div>
                    <div className="rp-progress" style={{ height: 6 }}>
                      <div className="rp-progress__fill" style={{ width: `${item.val}%`, background: item.val >= 90 ? 'var(--success)' : item.val >= 70 ? 'var(--primary)' : 'var(--accent)' }} />
                    </div>
                  </div>
                ))}
              </div>

              <RadarChart skills={RADAR} />
            </div>
          </div>

          {/* Skills */}
          <div className="rp-grid-2">
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title" style={{ color: 'var(--success)' }}>✓ Compétences détectées</span></div>
              <div className="rp-card__body">
                <div className="rp-tags">
                  {c.skills_ok.map(s => <span key={s} className="rp-tag rp-tag--ok">{s}</span>)}
                </div>
              </div>
            </div>
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title" style={{ color: 'var(--danger)' }}>✗ Compétences manquantes</span></div>
              <div className="rp-card__body">
                <div className="rp-tags">
                  {c.skills_miss.map(s => <span key={s} className="rp-tag rp-tag--missing">{s}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rp-card">
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Expérience détectée', content: c.exp },
                { title: 'Diplômes détectés', content: c.diplome },
                { title: 'Langues', content: c.langues.join(' · ') },
                { title: 'Certifications', content: c.certifs.join(' · ') },
              ].map((item, i) => (
                <div key={i} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.content}</div>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success)', letterSpacing: '0.4px', marginBottom: '0.4rem' }}>Points forts</div>
                  {c.points_forts.map((p, i) => <div key={i} style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', marginBottom: '0.25rem' }}><span style={{ color: 'var(--success)' }}>✓</span>{p}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--danger)', letterSpacing: '0.4px', marginBottom: '0.4rem' }}>Points faibles</div>
                  {c.points_faibles.map((p, i) => <div key={i} style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', marginBottom: '0.25rem' }}><span style={{ color: 'var(--danger)' }}>✗</span>{p}</div>)}
                </div>
              </div>
            </div>
          </div>

          {/* IA Recommendation */}
          <div style={{ padding: '1.25rem', background: 'rgba(30,79,163,0.05)', border: '1.5px solid rgba(30,79,163,0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><FiCpu size={16} /></div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Recommandation IA</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: 1.6 }}>{c.recommandation}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
