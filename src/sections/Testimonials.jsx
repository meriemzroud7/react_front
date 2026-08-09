import { FiFileText, FiTarget, FiMessageSquare, FiBarChart2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const FEATURE_KEYS = [
  { icon: FiFileText, key: 'cvAnalysis' },
  { icon: FiTarget, key: 'matching' },
  { icon: FiMessageSquare, key: 'interview' },
  { icon: FiBarChart2, key: 'analytics' },
];

export default function AiFeatures() {
  const { t } = useTranslation();

  return (
    <section id="ai-features" className="feat">
      <style>{`
        .feat { padding: 88px 0; background: var(--background, #fafbfc); }
        .feat__intro { max-width: 640px; margin: 0 auto 52px; text-align: center; padding: 0 24px; }
        .feat__eyebrow {
          display: inline-block; font-size: 12px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--primary, #2f6fed); margin-bottom: 12px;
        }
        .feat__intro h2 {
          font-size: clamp(28px, 3.2vw, 38px); font-weight: 800;
          margin: 0 0 14px; color: var(--foreground, #0b1220);
        }
        .feat__intro p { font-size: 16px; line-height: 1.6; color: var(--muted, #64748b); margin: 0; }
        .feat__grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
          max-width: 1040px; margin: 0 auto; padding: 0 24px;
        }
        @media (max-width: 720px) { .feat__grid { grid-template-columns: 1fr; } }
        .feat__card {
          padding: 32px; border-radius: 18px; border: 1px solid var(--border, #e7eaf0);
          background: var(--card, #fff);
          transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease;
        }
        .feat__card:hover {
          border-color: var(--primary, #2f6fed); transform: translateY(-3px);
          box-shadow: 0 16px 32px -20px rgba(47,111,237,0.35);
        }
        .feat__icon {
          width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center;
          background: var(--primary-light, rgba(47,111,237,0.12));
          color: var(--primary, #2f6fed); margin-bottom: 20px;
        }
        .feat__card h3 { font-size: 19px; font-weight: 700; margin: 0 0 10px; color: var(--foreground, #0b1220); }
        .feat__card p { font-size: 14.5px; line-height: 1.65; color: var(--muted, #64748b); margin: 0; }
      `}</style>

      <div className="feat__intro">
        <span className="feat__eyebrow">{t('aiFeatures.eyebrow')}</span>
        <h2>{t('aiFeatures.title')}</h2>
        <p>{t('aiFeatures.description')}</p>
      </div>

      <div className="feat__grid">
        {FEATURE_KEYS.map(({ icon: Icon, key }) => (
          <div className="feat__card" key={key}>
            <div className="feat__icon">
              <Icon size={24} />
            </div>
            <h3>{t(`aiFeatures.items.${key}.title`)}</h3>
            <p>{t(`aiFeatures.items.${key}.text`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}