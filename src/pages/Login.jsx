import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight, FiLinkedin, FiLoader, FiMoon, FiSun } from 'react-icons/fi';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import LanguageSwitcher from '../composant/LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
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
      {/* Barre de contrôles : langue + thème */}
      <div className="auth__topbar">
        <LanguageSwitcher />
        <button
          type="button"
          className="auth__theme-toggle"
          onClick={toggleTheme}
          aria-label="Changer le thème"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>

      <div className="auth__brand">
        <div className="auth__brand-logo">
          <div className="auth__brand-icon">
            <img src="/logof.png" alt="Fursa" />
          </div>
          <span className="auth__brand-arabic">فرصة</span>
          <span className="auth__brand-name">Fursa</span>
        </div>

        {/* Animation déplacée ici : en dehors de auth__brand-center */}
        {/* Elle se positionne désormais par rapport à .auth__brand (position: relative) */}
        <div className="auth__brand-animation">
          <DotLottieReact
            src="https://lottie.host/927ae890-d9a7-47d6-bc3f-2e132dc81370/aBashAEYRm.lottie"
            loop
            autoplay
          />
        </div>

        <div className="auth__brand-center">
          <p className="auth__brand-tagline">{t('login.tagline')}</p>
          <h2 className="auth__brand-title">
            {t('login.heroTitle1')}<br />{t('login.heroTitle2')}<br />{t('login.heroTitle3')}
          </h2>
          <p className="auth__brand-desc">{t('login.heroDesc')}</p>

          <div className="auth__brand-stats">
            <div className="auth__stat"><strong>15K+</strong><span>{t('login.statOffres')}</span></div>
            <div className="auth__stat"><strong>78%</strong><span>{t('login.statTaux')}</span></div>
            <div className="auth__stat"><strong>2.4K</strong><span>{t('login.statEntreprises')}</span></div>
          </div>
        </div>
      </div>

      <div className="auth__panel">
        <div className="auth__box">
          <div className="auth__mobile-logo">
            <div className="auth__mobile-icon">
              <img src="/logo-fursa.png" alt="Fursa" />
            </div>
            <span className="auth__mobile-arabic">فرصة</span>
          </div>

          <div className="auth__heading">
            <h1>{t('login.welcomeBack')}</h1>
            <p>{t('login.subtitle')}</p>
          </div>

          


          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label>{t('login.emailLabel')}</label>
              <div className="auth__input-wrap">
                <FiMail className="auth__icon-left" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>
            </div>

            <div className="auth__field">
              <div className="auth__field-row">
                <label>{t('login.passwordLabel')}</label>
                <Link to="/forgot-password" className="auth__forgot">{t('login.forgotPassword')}</Link>
              </div>
              <div className="auth__input-wrap">
                <FiLock className="auth__icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t('login.passwordPlaceholder')}
                />
                <button type="button" className="auth__toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth__submit" disabled={isLoading}>
              {isLoading ? (
                <><FiLoader className="auth__spinner" /> {t('login.connecting')}</>
              ) : (
                <>{t('login.submit')} <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth__switch">
            {t('login.noAccount')} <Link to="/register">{t('login.createAccount')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}