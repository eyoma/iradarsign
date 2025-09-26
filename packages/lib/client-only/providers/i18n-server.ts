/**
 * Minimal i18n server provider for non-internationalized setup
 * Provides basic i18n instance without actual translation
 */

export const getI18nInstance = () => {
  return {
    t: (key: string) => key,
    get: (key: string) => key,
    language: 'en',
    languages: ['en'],
    changeLanguage: () => Promise.resolve(),
  };
};

export const dynamicActivate = async (locale: string) => {
  // No-op for non-internationalized setup
  return Promise.resolve();
};
