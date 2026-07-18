import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight, FiLinkedin, FiLoader } from 'react-icons/fi';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/verify');
    }, 1200);
  };

  return (
    <div className="auth">
      <div className="auth__brand">
        <div className="auth__brand-logo">
          <div className="auth__brand-icon">ف</div>
          <span className="auth__brand-arabic">فرصة</span>
          <span className="auth__brand-name">Fursa</span>
        </div>

        <div className="auth__brand-center">
          <p className="auth__brand-tagline">فرصتك تبدأ هنا</p>
          <h2 className="auth__brand-title">
            L'intelligence<br />artificielle au service<br />de votre carrière
          </h2>
          <p className="auth__brand-desc">
            Rejoignez 85 000+ professionnels tunisiens qui ont trouvé leur opportunité avec Fursa.
          </p>

          <div className="auth__brand-stats">
            <div className="auth__stat"><strong>15K+</strong><span>Offres actives</span></div>
            <div className="auth__stat"><strong>78%</strong><span>Taux placement</span></div>
            <div className="auth__stat"><strong>2.4K</strong><span>Entreprises</span></div>
          </div>
        </div>

        <p className="auth__brand-quote">"Fursa m'a trouvé un poste chez Vermeg en 2 semaines." — Yasmine B., Ingénieure</p>
      </div>

      <div className="auth__panel">
        <div className="auth__box">
          <div className="auth__mobile-logo">
            <div className="auth__mobile-icon">ف</div>
            <span className="auth__mobile-arabic">فرصة</span>
          </div>

          <div className="auth__heading">
            <h1>Bon retour !</h1>
            <p>Connectez-vous à votre compte Fursa</p>
          </div>

          <div className="auth__socials">
            <button type="button" className="auth__social-btn">Google</button>
            <button type="button" className="auth__social-btn"><FiLinkedin color="#0A66C2" /> LinkedIn</button>
          </div>

          <div className="auth__divider">
            <div className="auth__divider-line" /><span>ou</span><div className="auth__divider-line" />
          </div>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label>Adresse e-mail</label>
              <div className="auth__input-wrap">
                <FiMail className="auth__icon-left" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div className="auth__field">
              <div className="auth__field-row">
                <label>Mot de passe</label>
                <a href="#top" className="auth__forgot">Mot de passe oublié ?</a>
              </div>
              <div className="auth__input-wrap">
                <FiLock className="auth__icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Votre mot de passe"
                />
                <button type="button" className="auth__toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth__submit" disabled={isLoading}>
              {isLoading ? (
                <><FiLoader className="auth__spinner" /> Connexion en cours...</>
              ) : (
                <>Se connecter <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth__switch">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
