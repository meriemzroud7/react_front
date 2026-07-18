import { FiArrowRight } from 'react-icons/fi';

export default function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta__box">
          <h2>Prêt à transformer votre recrutement ?</h2>
          <p>
            Que vous cherchiez le job de vos rêves ou le candidat idéal, l'IA de Fursa
            accélère votre succès en Tunisie.
          </p>
          <div className="cta__actions">
            <button className="btn btn--accent">
              Je crée mon profil <FiArrowRight size={20} />
            </button>
            <button className="btn btn--ghost">Je suis un recruteur</button>
          </div>
        </div>
      </div>
    </section>
  );
}
