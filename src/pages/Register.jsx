import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight,
  FiLinkedin, FiBriefcase, FiLoader, FiCheck,
} from 'react-icons/fi';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('candidat');
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/verify');
    }, 1200);
  };

  const strengthLevel = Math.min(4, Math.floor(form.password.length / 3));

  return (
    <div className="auth">
      <div className="auth__brand">
        <div className="auth__brand-logo">
          <div className="auth__brand-icon">ف</div>
          <span className="auth__brand-arabic">فرصة</span>
          <span className="auth__brand-name">Fursa</span>
        </div>

        <div className="auth__brand-center">
          <p className="auth__brand-tagline">انضم إلى فرصة</p>
          <h2 className="auth__brand-title">Votre carrière<br />commence ici</h2>
          <p className="auth__brand-desc">
            Créez votre profil, uploadez votre CV et laissez l'IA faire le reste.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { step: '01', title: 'Créez votre compte', desc: 'Inscription rapide en 2 minutes' },
              { step: '02', title: 'Uploadez votre CV', desc: "L'IA analyse vos compétences" },
              { step: '03', title: 'Recevez des offres', desc: 'Matchées à votre profil en temps réel' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: 'rgba(234,169,39,0.2)',
                  color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{item.step}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="auth__brand-quote">"Une inscription simple, une IA qui comprend vraiment mon profil." — Ahmed M.</p>
      </div>

      <div className="auth__panel">
        <div className="auth__box">
          <div className="auth__mobile-logo">
            <div className="auth__mobile-icon">ف</div>
            <span className="auth__mobile-arabic">فرصة</span>
          </div>

          <div className="auth__heading">
            <h1>Créer un compte</h1>
            <p>Rejoignez la communauté Fursa Tunisie</p>
          </div>

          <div className="auth__role-toggle">
            <button
              type="button"
              className={`auth__role-btn ${role === 'candidat' ? 'auth__role-btn--active' : ''}`}
              onClick={() => setRole('candidat')}
            >
              <FiUser size={15} /> Je cherche un emploi
            </button>
            <button
              type="button"
              className={`auth__role-btn ${role === 'recruteur' ? 'auth__role-btn--active' : ''}`}
              onClick={() => setRole('recruteur')}
            >
              <FiBriefcase size={15} /> Je recrute
            </button>
          </div>

          <div className="auth__socials">
            <button type="button" className="auth__social-btn">Google</button>
            <button type="button" className="auth__social-btn"><FiLinkedin color="#0A66C2" /> LinkedIn</button>
          </div>

          <div className="auth__divider">
            <div className="auth__divider-line" /><span>ou</span><div className="auth__divider-line" />
          </div>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__row">
              <div className="auth__field">
                <label>Prénom</label>
                <div className="auth__input-wrap">
                  <FiUser className="auth__icon-left" size={16} />
                  <input
                    type="text"
                    required
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder="Yasmine"
                  />
                </div>
              </div>
              <div className="auth__field">
                <label>Nom</label>
                <div className="auth__input-wrap">
                  <FiUser className="auth__icon-left" size={16} />
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Ben Ali"
                  />
                </div>
              </div>
            </div>

            <div className="auth__field">
              <label>Adresse e-mail</label>
              <div className="auth__input-wrap">
                <FiMail className="auth__icon-left" size={16} />
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
              <label>Mot de passe</label>
              <div className="auth__input-wrap">
                <FiLock className="auth__icon-left" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 caractères"
                />
                <button type="button" className="auth__toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="auth__strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`auth__strength-bar ${
                        strengthLevel >= i ? (i <= 2 ? 'auth__strength-bar--weak' : 'auth__strength-bar--strong') : ''
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <label className="auth__terms">
              <span
                className={`auth__checkbox ${agreed ? 'auth__checkbox--checked' : ''}`}
                onClick={(e) => { e.preventDefault(); setAgreed(!agreed); }}
              >
                {agreed && <FiCheck size={13} />}
              </span>
              J'accepte les conditions d'utilisation et la politique de confidentialité de Fursa.
            </label>

            <button type="submit" className="auth__submit" disabled={isLoading || !agreed}>
              {isLoading ? (
                <><FiLoader className="auth__spinner" /> Création en cours...</>
              ) : (
                <>Créer mon compte <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth__switch">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
