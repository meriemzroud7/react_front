import { FiFileText, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__intro fade-in-up">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            <span>IA RECRUTEMENT TUNISIE</span>
          </div>

          <h1 className="hero__title">
            {t('hero.title')} <span>{t('hero.highlight')}</span>
          </h1>

          <div className="hero__divider">
            <div className="hero__divider-line" />
            <p className="hero__arabic">فرصتك تبدأ هنا</p>
          </div>

          <p className="hero__text">
            {t('hero.description')}
          </p>
        </div>

        <div className="hero__panel fade-in-up">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />

          <div className="hero__card hero__card--3d">
            <div className="hero__card-header">
              <div className="hero__card-title">
                <div className="hero__card-icon"><FiFileText size={18} /></div>
                <div>
                  <h3>{t('hero.cvAnalysisTitle')}</h3>
                  <p>{t('hero.cvUpdated')}</p>
                </div>
              </div>
              <span className="hero__card-badge">{t('hero.aiActive')}</span>
            </div>

            <div className="hero__scan">
              <p>{t('hero.skillExtraction')}</p>
            </div>

            <div className="hero__checks">
              <div className="hero__check">
                <FiCheckCircle size={16} />
                <span>{t('hero.detectedSkills')}</span>
              </div>
              <div className="hero__check">
                <FiCheckCircle size={16} />
                <span>{t('hero.experience')}</span>
              </div>
              <div className="hero__match">
                <span>{t('hero.matchScoreLabel')}</span>
                <strong>92%</strong>
              </div>
            </div>
          </div>

          <div className="hero__floating hero__floating--top">
            <div className="hero__floating-avatar hero__floating-avatar--blue">
              <FiTrendingUp size={16} />
            </div>
            <div>
              <p className="hero__floating-name">{t('hero.profileAttention')}</p>
            </div>
          </div>

          <div className="hero__floating hero__floating--bottom">
            <div className="hero__floating-avatar hero__floating-avatar--gold">
              <FiTrendingUp size={16} />
            </div>
            <div>
              <p className="hero__floating-name">{t('hero.newOpportunities')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}