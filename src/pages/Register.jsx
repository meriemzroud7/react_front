import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight,
   FiBriefcase, FiLoader, FiCheck, FiMoon, FiSun,
} from 'react-icons/fi';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import LanguageSwitcher from '../composant/LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
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

        {/* Animation Lottie */}
        <div className="auth__brand-animation">
          <DotLottieReact
            src="https://lottie.host/1e582b1c-248d-4162-8dd1-cfa7dd1aa2e7/cWvyxI0mEO.lottie"
            loop
            autoplay
          />
        </div>

        <div className="auth__brand-center">
          <p className="auth__brand-tagline">{t('register.tagline')}</p>
          <h2 className="auth__brand-title">
            {t('register.heroTitle1')}<br />{t('register.heroTitle2')}
          </h2>
          <p className="auth__brand-desc">{t('register.heroDesc')}</p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { step: '01', title: t('register.step1Title'), desc: t('register.step1Desc') },
              { step: '02', title: t('register.step2Title'), desc: t('register.step2Desc') },
              { step: '03', title: t('register.step3Title'), desc: t('register.step3Desc') },
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
      </div>

      <div className="auth__panel">
        <div className="auth__box">
          <div className="auth__mobile-logo">
            <div className="auth__mobile-icon">
              <img src="/logof.png" alt="Fursa" />
            </div>
            <span className="auth__mobile-arabic">فرصة</span>
          </div>

          <div className="auth__heading">
            <h1>{t('register.heading')}</h1>
            <p>{t('register.subtitle')}</p>
          </div>

          <div className="auth__role-toggle">
            <button
              type="button"
              className={`auth__role-btn ${role === 'candidat' ? 'auth__role-btn--active' : ''}`}
              onClick={() => setRole('candidat')}
            >
              <FiUser size={15} /> {t('register.roleCandidat')}
            </button>
            <button
              type="button"
              className={`auth__role-btn ${role === 'recruteur' ? 'auth__role-btn--active' : ''}`}
              onClick={() => setRole('recruteur')}
            >
              <FiBriefcase size={15} /> {t('register.roleRecruteur')}
            </button>
          </div>


          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__row">
              <div className="auth__field">
                <label>{t('register.firstNameLabel')}</label>
                <div className="auth__input-wrap">
                  <FiUser className="auth__icon-left" size={16} />
                  <input
                    type="text"
                    required
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder={t('register.firstNamePlaceholder')}
                  />
                </div>
              </div>
              <div className="auth__field">
                <label>{t('register.lastNameLabel')}</label>
                <div className="auth__input-wrap">
                  <FiUser className="auth__icon-left" size={16} />
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder={t('register.lastNamePlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div className="auth__field">
              <label>{t('register.emailLabel')}</label>
              <div className="auth__input-wrap">
                <FiMail className="auth__icon-left" size={16} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('register.emailPlaceholder')}
                />
              </div>
            </div>

            <div className="auth__field">
              <label>{t('register.passwordLabel')}</label>
              <div className="auth__input-wrap">
                <FiLock className="auth__icon-left" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t('register.passwordPlaceholder')}
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
              {t('register.terms')}
            </label>

            <button type="submit" className="auth__submit" disabled={isLoading || !agreed}>
              {isLoading ? (
                <><FiLoader className="auth__spinner" /> {t('register.creating')}</>
              ) : (
                <>{t('register.submit')} <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth__switch">
            {t('register.alreadyAccount')} <Link to="/login">{t('register.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}