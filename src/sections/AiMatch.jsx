import { useState } from 'react';
import { FiCheck, FiArrowRight, FiMapPin, FiCalendar } from 'react-icons/fi';

const PROFILES = {
  amina: {
    name: 'Amina Ben Salem',
    role: 'Product Designer · Tunis',
    initials: 'AB',
    score: 94,
    note: "Très bon alignement sur la culture et le rythme de l'équipe.",
    tone: 'gold',
  },
  youssef: {
    name: 'Youssef Trabelsi',
    role: 'Data Engineer · Sousse',
    initials: 'YT',
    score: 87,
    note: 'Une expertise technique solide pour accélérer vos projets data.',
    tone: 'blue',
  },
  sarra: {
    name: 'Sarra Gharbi',
    role: 'Growth Manager · Ariana',
    initials: 'SG',
    score: 81,
    note: 'Un profil curieux, avec un potentiel fort sur le marché local.',
    tone: 'lilac',
  },
};

export default function AiMatch() {
  const [profile, setProfile] = useState('amina');
  const selected = PROFILES[profile];

  return (
    <section className="ai-match" id="ai-match">
      <div className="container ai-match__grid">
        <div className="ai-match__copy fade-in-up">
          <div className="ai-match__eyebrow">Intelligence Fursa</div>
          <h2>L'IA qui écoute entre les lignes.</h2>
          <p>
            Un score n'est pas une sentence. C'est un point de départ : une lecture plus fine
            des compétences, de la culture et de ce qui vous fait avancer.
          </p>

          <div className="ai-match__list">
            <div>
              <span className="ai-match__check"><FiCheck size={12} /></span>
              Comprend les trajectoires, pas seulement les titres
            </div>
            <div>
              <span className="ai-match__check"><FiCheck size={12} /></span>
              Respecte vos préférences et votre rythme
            </div>
            <div>
              <span className="ai-match__check"><FiCheck size={12} /></span>
              Vous laisse toujours le dernier mot
            </div>
          </div>

          <div className="ai-match__aside">
            <span className="ai-match__aside-num">03</span>
            <span>Le signal compte autant que le mot-clé.</span>
          </div>
        </div>

        <div className="ai-match__panel fade-in-up">
          <div className="ai-match__panel-head">
            <span><span className="ai-match__dot" /> Le match du jour</span>
            <span className="ai-match__live"><i /> Analyse en direct</span>
          </div>

          <div className="ai-match__tabs" role="tablist" aria-label="Profils de démonstration">
            {Object.keys(PROFILES).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={profile === key}
                className={`ai-match__tab ${profile === key ? 'ai-match__tab--active' : ''}`}
                onClick={() => setProfile(key)}
              >
                {PROFILES[key].name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="ai-match__main" key={profile}>
            <div className={`ai-match__mini ai-match__mini--${selected.tone}`}>
              <div className="ai-match__avatar">{selected.initials}</div>
              <span className="ai-match__mini-label">Profil recommandé</span>
              <h4>{selected.name}</h4>
              <p>{selected.role}</p>
              <div className="ai-match__tags">
                <span>Curiosité</span>
                <span>Impact</span>
              </div>
            </div>

            <div className="ai-match__result">
              <small>Compatibilité avec Product team — La Marsa</small>
              <div>
                <div className="ai-match__score">
                  <strong>{selected.score}</strong>
                  <span>/ 100</span>
                </div>
                <div className="ai-match__meter">
                  <i style={{ width: `${selected.score}%` }} />
                </div>
              </div>
              <button type="button" onClick={() => window.alert(selected.note)}>
                Pourquoi ce match ? <FiArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="ai-match__panel-bottom">
            <span><FiMapPin size={13} /> La Marsa, Tunis</span>
            <span><FiCalendar size={13} /> Mis à jour il y a 2 h</span>
          </div>
        </div>
      </div>
    </section>
  );
}