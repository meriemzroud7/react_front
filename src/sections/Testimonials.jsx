import { FiMessageCircle } from 'react-icons/fi';

const testimonials = [
  { name: 'Yasmine B.', role: 'Ingénieure, Tunis', text: "Je cherchais depuis 6 mois. J'ai uploadé mon CV sur Fursa, l'IA a mis en valeur mon projet de fin d'études que j'avais négligé. Embauchée chez Sofrecom en 2 semaines." },
  { name: 'Ahmed M.', role: 'Développeur Full Stack, Sfax', text: "Le chatbot m'a aidé à préparer mon entretien technique en simulant des questions spécifiques à l'offre de Proxym. Une expérience incroyable et sans stress." },
  { name: 'Mariem K.', role: 'RH Manager, Sousse', text: 'Fursa a réduit notre temps de présélection de 70%. Nous recevons des profils hautement qualifiés qui correspondent à nos valeurs.' },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="testi">
      <div className="container">
        <div className="testi__intro">
          <h2>Ils ont trouvé leur opportunité</h2>
          <p>Rejoignez des milliers de talents qui ont transformé leur carrière.</p>
        </div>

        <div className="testi__grid">
          {testimonials.map((t) => (
            <div className="testi__card" key={t.name}>
              <FiMessageCircle size={32} className="testi__quote" />
              <p className="testi__text">"{t.text}"</p>
              <div className="testi__author">
                <div className="testi__avatar">{t.name.charAt(0)}</div>
                <div>
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
