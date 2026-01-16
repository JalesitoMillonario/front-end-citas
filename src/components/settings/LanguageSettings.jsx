import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const LanguageSettings = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
    localStorage.setItem('preferred_language', lang);
  };

  const languages = [
    {
      code: 'es',
      name: t('settings.language.languages.es'),
      flag: '🇪🇸',
    },
    {
      code: 'en',
      name: t('settings.language.languages.en'),
      flag: '🇺🇸',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('settings.language.title')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('settings.language.selectLanguage')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('settings.language.language')}
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                selectedLanguage === lang.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="text-3xl">{lang.flag}</span>
              <span className="font-medium text-gray-900">{lang.name}</span>
              {selectedLanguage === lang.code && (
                <Check className="w-5 h-5 text-blue-600 absolute right-4" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">ℹ️ {t('common.info')}:</strong> {t('settings.language.selectLanguage')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('settings.saved')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
