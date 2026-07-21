import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  ar: { translation: ar },
};

const isRTL = (lng) => ['ar'].includes(lng);

const detectorOptions = {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'ar'],
    detection: detectorOptions,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export const setDocumentDirection = (lng = i18n.language || 'fr') => {
  const dir = isRTL(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  document.body.setAttribute('dir', dir);
};

setDocumentDirection(i18n.language || 'fr');
i18n.on('languageChanged', (lng) => setDocumentDirection(lng));

export default i18n;
