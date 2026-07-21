import { useState } from "react";
import "../styles/ForgotPassword.css";

const Mail = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ArrowRight = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/forgot-password?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Impossible d'envoyer le code. Vérifiez votre adresse e-mail.");
      }

      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="fursa-shell">
      {/* Panneau gauche - branding */}
      <div className="fursa-left">
        <div className="fursa-blob fursa-blob-top" />
        <div className="fursa-blob fursa-blob-bottom" />

        <div className="fursa-left-content">
          <div className="fursa-logo">
            <span className="fursa-logo-badge">ف</span>
            <span className="fursa-logo-text">فرصة Fursa</span>
          </div>

          <p className="fursa-eyebrow">فرصتك تبدأ هنا</p>

          <h1 className="fursa-headline">
            L'intelligence
            <br />
            artificielle au service
            <br />
            de votre carrière
          </h1>

          <p className="fursa-sub">
            Rejoignez 85 000+ professionnels tunisiens qui ont trouvé leur
            opportunité avec Fursa.
          </p>

          <div className="fursa-stats">
            <div className="fursa-stat">
              <span className="fursa-stat-num">15K+</span>
              <span className="fursa-stat-label">Offres actives</span>
            </div>
            <div className="fursa-stat">
              <span className="fursa-stat-num">78%</span>
              <span className="fursa-stat-label">Taux placement</span>
            </div>
            <div className="fursa-stat">
              <span className="fursa-stat-num">2.4K</span>
              <span className="fursa-stat-label">Entreprises</span>
            </div>
          </div>

          <p className="fursa-quote">
            "Fursa m'a trouvé un poste chez Vermeg en 2 semaines." — Yasmine
            B., Ingénieure
          </p>
        </div>
      </div>

      {/* Panneau droit - formulaire */}
      <div className="fursa-right">
        <div className="fursa-form-wrap">
          {status === "sent" ? (
            <>
              <h2 className="fursa-title">E-mail envoyé !</h2>
              <p className="fursa-subtitle">
                Un code de vérification à 6 chiffres a été envoyé à{" "}
                <strong>{email}</strong>. Vérifiez votre boîte de réception.
              </p>
              <a className="fursa-link-back" href="/reset-password">
                Saisir le code reçu <ArrowRight size={16} />
              </a>
            </>
          ) : (
            <>
              <h2 className="fursa-title">Mot de passe oublié ?</h2>
              <p className="fursa-subtitle">
                Entrez votre adresse e-mail, nous vous enverrons un code pour
                réinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="fursa-label" htmlFor="email">
                  Adresse e-mail
                </label>
                <div className="fursa-input-group">
                  <Mail size={18} className="fursa-input-icon" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="fursa-input"
                  />
                </div>

                {status === "error" && (
                  <p className="fursa-error">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="fursa-btn"
                >
                  {status === "loading" ? "Envoi en cours..." : "Envoyer le code"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="fursa-footer-link">
                Vous vous souvenez de votre mot de passe ?{" "}
                <a href="/login">Se connecter</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}