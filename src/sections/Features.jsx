import { FiZap } from 'react-icons/fi';
import { RiSparklingLine, RiFocus3Line, RiRobot2Line } from 'react-icons/ri';

export default function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features__intro">
          <h2>
            L'intelligence artificielle, <br />
            <span>votre atout recrutement</span>
          </h2>
          <p>
            Notre technologie analyse au-delà des mots-clés pour comprendre la véritable valeur
            de chaque profil et les besoins spécifiques des entreprises tunisiennes.
          </p>
        </div>

        <div className="features__grid">
          <div className="features__list">
            <div className="features__item">
              <div className="features__icon features__icon--primary"><RiSparklingLine size={24} /></div>
              <div>
                <h3>Parsing Intelligent de CV</h3>
                <p>L'IA de Fursa lit les CV en français, arabe et anglais. Elle extrait automatiquement les compétences, expériences et formations avec une précision inégalée.</p>
              </div>
            </div>
            <div className="features__item">
              <div className="features__icon features__icon--accent"><RiFocus3Line size={24} /></div>
              <div>
                <h3>Matching Sémantique</h3>
                <p>Fini les recherches par mots-clés. Notre algorithme comprend le contexte. Un "Développeur Front-end" matche intelligemment avec une offre "Ingénieur React".</p>
              </div>
            </div>
            <div className="features__item">
              <div className="features__icon features__icon--blue"><RiRobot2Line size={24} /></div>
              <div>
                <h3>Coach Carrière IA</h3>
                <p>Un assistant conversationnel disponible 24/7 pour préparer vos entretiens, améliorer votre CV ou cibler les meilleures offres sur le marché tunisien.</p>
              </div>
            </div>
          </div>

          <div className="features__chat">
            <div className="features__chat-header">
              <div className="features__chat-avatar"><RiRobot2Line size={20} /></div>
              <div>
                <h4>Fursa Coach IA</h4>
                <p>En ligne</p>
              </div>
            </div>

            <div className="features__chat-body">
              <div className="features__msg">
                <div className="features__msg-avatar"><RiRobot2Line size={14} /></div>
                <div className="features__bubble features__bubble--bot">
                  Bonjour ! Je vois que vous cherchez un poste de Développeur Full Stack à Sfax. Voulez-vous que je révise votre CV pour les standards actuels ?
                </div>
              </div>
              <div className="features__msg features__msg--user">
                <div className="features__msg-avatar features__msg-avatar--accent">AM</div>
                <div className="features__bubble features__bubble--user">
                  Oui s'il vous plaît. J'ai ajouté mon expérience avec Node.js.
                </div>
              </div>
              <div className="features__msg">
                <div className="features__msg-avatar"><RiRobot2Line size={14} /></div>
                <div className="features__bubble features__bubble--bot">
                  <span className="features__bubble-tag"><FiZap size={14} /> Excellente initiative.</span>
                  J'ai reformulé l'impact de vos projets. Je vous ai aussi trouvé 3 offres chez Digital Mania et Proxym qui correspondent à 90%+ !
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
