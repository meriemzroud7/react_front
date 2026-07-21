import { useTranslation } from 'react-i18next';

const steps = [
  { num: '01', key: 'step1' },
  { num: '02', key: 'step2' },
  { num: '03', key: 'step3' },
  { num: '04', key: 'step4' },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="how">
      <div className="container">
        <div className="how__intro">
          <h2>{t('how.title')}</h2>
          <p className="how__arabic">{t('how.arabic')}</p>
        </div>

        <div className="how__grid">
          {steps.map((step) => (
            <div className="how__step" key={step.num}>
              <div className="how__num">{step.num}</div>
              <h3>{t(`how.${step.key}Title`)}</h3>
              <p>{t(`how.${step.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
