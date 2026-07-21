import { useState } from "react";
import "../styles/ResetPassword.css";

const Lock = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const KeyRound = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

const ArrowRight = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const Eye = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.53 13.53 0 0 0 2 11s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <path d="M2 2l20 20" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const params = new URLSearchParams({ email, code, newPassword });
      const response = await fetch(
        `http://localhost:8080/api/users/reset-password?${params.toString()}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Code invalide ou expiré. Veuillez réessayer.");
      }

      setStatus("success");
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
          {status === "success" ? (
            <>
              <h2 className="fursa-title">Mot de passe mis à jour !</h2>
              <p className="fursa-subtitle">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez
                maintenant vous connecter avec vos nouveaux identifiants.
              </p>
              <a className="fursa-btn fursa-btn-link" href="/login">
                Se connecter <ArrowRight size={18} />
              </a>
            </>
          ) : (
            <>
              <h2 className="fursa-title">Réinitialiser le mot de passe</h2>
              <p className="fursa-subtitle">
                Entrez le code reçu par e-mail ainsi que votre nouveau mot de
                passe.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="fursa-label" htmlFor="email">
                  Adresse e-mail
                </label>
                <div className="fursa-input-group">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="fursa-input fursa-input-noicon"
                  />
                </div>

                <label className="fursa-label" htmlFor="code">
                  Code de vérification
                </label>
                <div className="fursa-input-group">
                  <KeyRound size={18} className="fursa-input-icon" />
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="fursa-input fursa-code-input"
                  />
                </div>

                <label className="fursa-label" htmlFor="newPassword">
                  Nouveau mot de passe
                </label>
                <div className="fursa-input-group">
                  <Lock size={18} className="fursa-input-icon" />
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Votre nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="fursa-input"
                  />
                  <button
                    type="button"
                    className="fursa-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {status === "error" && (
                  <p className="fursa-error">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="fursa-btn"
                >
                  {status === "loading"
                    ? "Vérification..."
                    : "Réinitialiser le mot de passe"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="fursa-footer-link">
                Vous n'avez pas reçu de code ?{" "}
                <a href="/forgot-password">Renvoyer</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}