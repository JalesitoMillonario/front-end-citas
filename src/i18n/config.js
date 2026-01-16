import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationES from './locales/es.json';
import translationEN from './locales/en.json';

const resources = {
  es: {
    translation: translationES,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Pasar la instancia i18n a react-i18next
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    debug: false,

    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    detection: {
      // Orden de detección de idioma
      order: ['localStorage', 'navigator'],
      // Clave en localStorage
      lookupLocalStorage: 'preferred_language',
      // Cache del idioma
      caches: ['localStorage'],
    },
  });

export default i18n;
