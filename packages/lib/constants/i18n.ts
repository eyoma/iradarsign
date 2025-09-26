/**
 * Minimal i18n constants for non-internationalized setup
 * Only supports English to avoid internationalization complexity
 */

export const SUPPORTED_LANGUAGE_CODES = ['en'] as const;

export type SupportedLanguageCodes = (typeof SUPPORTED_LANGUAGE_CODES)[number];

export const SUPPORTED_LANGUAGES = {
  en: {
    short: 'en',
    full: 'English',
  },
} as const;

export const isValidLanguageCode = (code: string): code is SupportedLanguageCodes => {
  return SUPPORTED_LANGUAGE_CODES.includes(code as SupportedLanguageCodes);
};

export const getLanguageName = (code: string): string => {
  return SUPPORTED_LANGUAGES[code as SupportedLanguageCodes]?.full || 'English';
};
