import { FiFileText, FiTarget, FiMessageSquare, FiBarChart2 } from 'react-icons/fi';

const features = [
  {
    icon: FiFileText,
    title: 'Analyse de CV par IA',
    text: "Notre moteur lit chaque CV en profondeur, détecte les compétences réelles et met en valeur les projets et expériences qui font la différence — pas seulement les mots-clés.",
  },
  {
    icon: FiTarget,
    title: 'Matching intelligent',
    text: "Chaque candidat est rapproché des offres les plus pertinentes, et chaque recruteur reçoit une liste de profils déjà classés par pertinence pour son poste.",
  },
  {
    icon: FiMessageSquare,
    title: "Simulateur d'entretien",
    text: "Le chatbot Fursa prépare les candidats avec des questions techniques adaptées à l'offre visée, pour arriver en entretien plus confiant et mieux préparé.",
  },
  {
    icon: FiBarChart2,
    title: 'Analytics RH',
    text: "Les recruteurs suivent en temps réel leurs délais de recrutement, la qualité des candidatures et la performance de chaque offre publiée.",
  },
];

export default function AiFeatures() {
  return (
    <section id="ai-features" className="feat">
      <style>{`
        .feat {
          padding: 88px 0;
          background: #fafbfc;
        }
        .feat__intro {
          max-width: 640px;
          margin: 0 auto 52px;
          text-align: center;
          padding: 0 24px;
        }
        .feat__eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--primary, #2f6fed);
          margin-bottom: 12px;
        }
        .feat__intro h2 {
          font-size: clamp(28px, 3.2vw, 38px);
          font-weight: 800;
          margin: 0 0 14px;
          color: var(--ink, #0b1220);
        }
        .feat__intro p {
          font-size: 16px;
          line-height: 1.6;
          color: var(--muted, #64748b);
          margin: 0;
        }
        .feat__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 720px) {
          .feat__grid { grid-template-columns: 1fr; }
        }
        .feat__card {
          padding: 32px;
          border-radius: 18px;
          border: 1px solid #e7eaf0;
          background: #fff;
          transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease;
        }
        .feat__card:hover {
          border-color: var(--primary, #2f6fed);
          transform: translateY(-3px);
          box-shadow: 0 16px 32px -20px rgba(47,111,237,0.35);
        }
        .feat__icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: color-mix(in srgb, var(--primary, #2f6fed) 12%, white);
          color: var(--primary, #2f6fed);
          margin-bottom: 20px;
        }
        .feat__card h3 {
          font-size: 19px;
          font-weight: 700;
          margin: 0 0 10px;
          color: var(--ink, #0b1220);
        }
        .feat__card p {
          font-size: 14.5px;
          line-height: 1.65;
          color: var(--muted, #64748b);
          margin: 0;
        }
      `}</style>

      <div className="feat__intro">
        <span className="feat__eyebrow">Fursa AI</span>
        <h2>L'intelligence artificielle au service du recrutement</h2>
        <p>
          De la lecture du CV à la préparation de l'entretien, chaque étape est assistée par
          l'IA pour un recrutement plus rapide et plus juste.
        </p>
      </div>

      <div className="feat__grid">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div className="feat__card" key={f.title}>
              <div className="feat__icon">
                <Icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}