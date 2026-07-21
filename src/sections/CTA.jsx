import { FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function CTA() {
  const { t } = useTranslation();

  return (
    <section className="cta">
      <div className="container">
        <div className="cta__box">
          <h2>{t('cta.title')}</h2>
          <p>
            {t('cta.description')}
          </p>
          <div className="cta__actions">
            <button className="btn btn--accent">
              {t('cta.primaryButton')} <FiArrowRight size={20} />
            </button>
            <button className="btn btn--ghost">{t('cta.secondaryButton')}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
