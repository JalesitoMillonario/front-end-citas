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

    // Normalizar códigos de idioma
    load: 'languageOnly', // Solo usar 'es' en lugar de 'es-ES'

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
      // Convertir códigos como 'es-ES' a 'es'
      convertDetectedLanguage: (lng) => lng.split('-')[0],
    },
  });

export default i18n;
