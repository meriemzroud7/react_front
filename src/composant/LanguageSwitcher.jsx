import { useTranslation } from 'react-i18next';


const languages = [
  { code: 'fr', label: 'Français', countryCode: 'fr' },
  { code: 'en', label: 'English', countryCode: 'gb' },
  { code: 'ar', label: 'العربية', countryCode: 'tn' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] || 'fr';

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  return (
    <div className="nav__lang-switcher" role="group" aria-label="Sélecteur de langue">
      {languages.map((lang) => {
        const active = current === lang.code;
        return (
          <button
            key={lang.code}
            className={`nav__lang-btn${active ? ' active' : ''}`}
            onClick={() => changeLanguage(lang.code)}
            aria-label={`Changer la langue vers ${lang.label}`}
            title={lang.label}
          >
            <img
              src={`https://flagcdn.com/w40/${lang.countryCode}.png`}
              srcSet={`https://flagcdn.com/w80/${lang.countryCode}.png 2x`}
              alt={lang.label}
              className="nav__lang-flag"
            />
          </button>
        );
      })}
    </div>
  );
}