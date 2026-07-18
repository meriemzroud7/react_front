import { FiUpload, FiBriefcase, FiFileText, FiCheckCircle } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__intro fade-in-up">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            <span>IA RECRUTEMENT TUNISIE</span>
          </div>

          <h1 className="hero__title">
            L'IA au service de votre <span>carrière en Tunisie</span>
          </h1>

          <div className="hero__divider">
            <div className="hero__divider-line" />
            <p className="hero__arabic">فرصتك تبدأ هنا</p>
          </div>

          <p className="hero__text">
            Fursa combine l'intelligence artificielle et une compréhension profonde du marché
            local pour matcher les talents tunisiens avec les meilleures opportunités.
          </p>

          <div className="hero__actions">
            <button className="btn btn--primary">
              <FiUpload size={20} /> Déposer mon CV
            </button>
            <button className="btn btn--outline">
              <FiBriefcase size={20} /> Je recrute
            </button>
          </div>
        </div>

        <div className="hero__panel fade-in-up">
          <div className="hero__card">
            <div className="hero__card-header">
              <div className="hero__card-title">
                <div className="hero__card-icon"><FiFileText size={18} /></div>
                <div>
                  <h3>Analyse CV en cours</h3>
                  <p>ahmed_cv_2024.pdf</p>
                </div>
              </div>
              <span className="hero__card-badge">IA Active</span>
            </div>

            <div className="hero__scan">
              <p>Extraction des compétences...</p>
            </div>

            <div className="hero__checks">
              <div className="hero__check">
                <FiCheckCircle size={16} />
                <span>React, Node.js, TypeScript détectés</span>
              </div>
              <div className="hero__check">
                <FiCheckCircle size={16} />
                <span>3 ans d'expérience (Sfax, Tunisie)</span>
              </div>
              <div className="hero__match">
                <span>Score de match ciblé</span>
                <strong>92%</strong>
              </div>
            </div>
          </div>

          <div className="hero__floating hero__floating--top">
            <div className="hero__floating-avatar hero__floating-avatar--blue">V</div>
            <div>
              <p className="hero__floating-name">Vermeg</p>
              <p className="hero__floating-sub">Cherche Dev React</p>
            </div>
          </div>

          <div className="hero__floating hero__floating--bottom">
            <div className="hero__floating-avatar hero__floating-avatar--gold">T</div>
            <div>
              <p className="hero__floating-name">Telnet</p>
              <p className="hero__floating-sub">Match trouvé !</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
