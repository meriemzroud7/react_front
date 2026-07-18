import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiDownload, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiArrowLeft, FiCheck, FiX, FiMessageSquare
} from 'react-icons/fi';

const CANDIDATE = {
  id: 1, name: 'Yasmine Ben Ali', avatar: 'YB', color: '#1e4fa3',
  email: 'yasmine.ba@gmail.com', phone: '+216 22 345 678', ville: 'Tunis', dispo: 'Immédiate',
  score: 94, compat: 96, rang: 1,
  titre: 'Software Engineer – 4 ans d\'expérience',
  etudes: [
    { diplome: 'Ingénieur en Génie Informatique', ecole: 'ENIT – École Nationale d\'Ingénieurs de Tunis', annee: '2020', mention: 'Très bien' },
    { diplome: 'Baccalauréat Sciences de l\'Informatique', ecole: 'Lycée Pilote de Sfax', annee: '2015', mention: 'Mention Très Bien' },
  ],
  experiences: [
    { poste: 'Software Engineer', entreprise: 'Vermeg', periode: 'Janv. 2022 – Présent', desc: 'Développement d\'applications financières en React/Node.js. Architecture microservices AWS.' },
    { poste: 'Développeur Full Stack Junior', entreprise: 'Telnet Holding', periode: 'Juin 2020 – Déc. 2021', desc: 'Développement d\'APIs REST et interfaces React pour des clients bancaires.' },
  ],
  certifs: ['AWS Cloud Practitioner', 'React Developer Certification'],
  langues: [
    { lang: 'Arabe', niveau: 'Natif' }, { lang: 'Français', niveau: 'Courant (C2)' }, { lang: 'Anglais', niveau: 'Professionnel (B2)' }
  ],
  competences: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Git', 'AWS', 'REST APIs', 'Agile/Scrum'],
  candidatures: [
    { offre: 'Software Engineer – React/Node', date: '12 Jan 2025', statut: 'Retenu', statusClass: 'green' },
    { offre: 'Full Stack Developer', date: '10 Déc 2024', statut: 'Refusé', statusClass: 'red' },
  ],
  entretiens: [
    { date: '20 Jan 2025', type: 'En ligne', statut: 'Programmé', statusClass: 'blue' }
  ],
};

export default function ProfilCandidat() {
  useParams();
  const [tab, setTab] = useState('profil');
  const c = CANDIDATE;

  const TABS = [
    { key: 'profil', label: 'Profil' },
    { key: 'ia', label: 'Analyse IA' },
    { key: 'historique', label: 'Historique' },
  ];

  return (
    <div>
      {/* Back */}
      <Link to="/recruteur/candidatures" className="rp-btn rp-btn--outline rp-btn--sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        <FiArrowLeft size={13} /> Retour aux candidatures
      </Link>

      {/* Hero card */}
      <div className="rp-card" style={{ marginBottom: '1.25rem' }}>
        <div className="rp-card__body">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div className="rp-avatar" style={{ width: 80, height: 80, background: c.color, fontSize: '1.4rem', flexShrink: 0, borderRadius: 20 }}>{c.avatar}</div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{c.name}</h2>
                <span className="rp-badge rp-badge--green">Retenu · #{c.rang}</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{c.titre}</p>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiMail size={13} />{c.email}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiPhone size={13} />{c.phone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiMapPin size={13} />{c.ville}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--muted)' }}><FiCalendar size={13} />Dispo: {c.dispo}</span>
              </div>
            </div>
            {/* Scores */}
            <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
              {[{ val: c.score, label: 'Score IA', color: 'var(--primary)' }, { val: `${c.compat}%`, label: 'Compatibilité', color: 'var(--success)' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
              <button className="rp-btn rp-btn--primary rp-btn--sm"><FiCalendar size={13} /> Entretien</button>
              <button className="rp-btn rp-btn--outline rp-btn--sm"><FiDownload size={13} /> Télécharger CV</button>
              <button className="rp-btn rp-btn--outline rp-btn--sm"><FiMessageSquare size={13} /> Contacter</button>
              <button className="rp-btn rp-btn--success rp-btn--sm"><FiCheck size={13} /> Embaucher</button>
              <button className="rp-btn rp-btn--danger rp-btn--sm"><FiX size={13} /> Rejeter</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-light)', padding: '0 1.25rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.85rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === t.key ? 700 : 500, fontSize: '0.875rem',
              color: tab === t.key ? 'var(--primary)' : 'var(--muted)',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'color 0.15s', fontFamily: 'var(--font)'
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'profil' && (
        <div className="rp-grid-2" style={{ alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Études */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Formation</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {c.etudes.map((e, i) => (
                  <div key={i} style={{ paddingLeft: '0.75rem', borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.diplome}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{e.ecole} · {e.annee}</div>
                    <span className="rp-badge rp-badge--green" style={{ marginTop: '0.25rem' }}>{e.mention}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Langues */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Langues</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {c.langues.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{l.lang}</span>
                    <span className="rp-badge rp-badge--blue">{l.niveau}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifs */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Certifications</span></div>
              <div className="rp-card__body">
                <div className="rp-tags">
                  {c.certifs.map(cert => <span key={cert} className="rp-tag rp-tag--amber">{cert}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Expériences */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Expériences professionnelles</span></div>
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {c.experiences.map((exp, i) => (
                  <div key={i} style={{ paddingLeft: '0.75rem', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{exp.poste}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>{exp.entreprise}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>{exp.periode}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--foreground)' }}>{exp.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences */}
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Compétences techniques</span></div>
              <div className="rp-card__body">
                <div className="rp-tags">{c.competences.map(s => <span key={s} className="rp-tag">{s}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'historique' && (
        <div className="rp-grid-2" style={{ alignItems: 'start' }}>
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Candidatures</span></div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead><tr><th>Offre</th><th>Date</th><th>Statut</th></tr></thead>
                <tbody>
                  {c.candidatures.map((ca, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>{ca.offre}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{ca.date}</td>
                      <td><span className={`rp-badge rp-badge--${ca.statusClass}`}>{ca.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Entretiens</span></div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead><tr><th>Date</th><th>Type</th><th>Statut</th></tr></thead>
                <tbody>
                  {c.entretiens.map((e, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.82rem' }}>{e.date}</td>
                      <td style={{ fontSize: '0.82rem' }}>{e.type}</td>
                      <td><span className={`rp-badge rp-badge--${e.statusClass}`}>{e.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'ia' && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          <Link to="/recruteur/analyse-ia" className="rp-btn rp-btn--primary">Voir l'analyse IA complète</Link>
        </div>
      )}
    </div>
  );
}
