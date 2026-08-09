import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__brand-row">
            <img
          src="/logof.png"
            alt="Fursa Logo"
         className="footer__brand-icon" />
  <span className="footer__brand-name">Fursa</span>
</div>
            <p className="footer__text">
              La première plateforme de recrutement propulsée par l'IA conçue pour le marché tunisien.
            </p>
          </div>

          <div>
            <h4>Candidats</h4>
            <ul>
              <li><a href="#top">Déposer mon CV</a></li>
              <li><a href="#jobs">Offres d'emploi</a></li>
              <li><a href="#top">Coach Carrière IA</a></li>
            </ul>
          </div>

          <div>
            <h4>Entreprises</h4>
            <ul>
              <li><a href="#top">Publier une offre</a></li>
              <li><a href="#top">Recherche de profils</a></li>
              <li><a href="#top">Tarifs</a></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>contact@fursa.tn</li>
              <li>Tunis, Tunisie</li>
              <li className="footer__arabic">معاً نحو النجاح</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Fursa. Fait avec ❤️ en Tunisie.</p>
        </div>
      </div>
    </footer>
  );
}
