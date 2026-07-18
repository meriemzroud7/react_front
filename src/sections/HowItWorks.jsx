const steps = [
  { num: '01', title: 'Déposez votre CV', desc: "Uploadez votre CV en PDF. Notre IA le lit instantanément." },
  { num: '02', title: 'Analyse sémantique', desc: "L'IA comprend vos compétences réelles, pas juste des mots." },
  { num: '03', title: 'Matching précis', desc: 'Recevez les offres qui correspondent exactement à votre profil.' },
  { num: '04', title: 'Entretien ciblé', desc: 'Les recruteurs savent déjà pourquoi vous êtes le bon candidat.' },
];

export default function HowItWorks() {
  return (
    <section className="how">
      <div className="container">
        <div className="how__intro">
          <h2>Le processus le plus simple</h2>
          <p className="how__arabic">بكل سهولة</p>
        </div>

        <div className="how__grid">
          {steps.map((step) => (
            <div className="how__step" key={step.num}>
              <div className="how__num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
