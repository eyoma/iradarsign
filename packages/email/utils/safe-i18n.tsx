import { useLingui } from '@lingui/react';

/**
 * Safe i18n hook that provides fallback translations when useLingui fails
 * This is particularly useful for server-side rendering in email templates
 * Can be disabled via NEXT_PUBLIC_DISABLE_I18N environment variable
 */
export const useSafeLingui = () => {
  // Check if i18n is disabled via environment variable
  const i18nDisabled = process.env.NEXT_PUBLIC_DISABLE_I18N === 'true';

  // Create a fallback translation function
  const fallbackTranslations = (str: string | { id?: string; default?: string }) => {
    if (typeof str === 'string') return str;
    if (str && str.id) return str.id;
    if (str && str.default) return str.default;
    return 'Translation not available';
  };

  // Create a minimal i18n object
  const fallbackI18n = {
    locale: 'en',
    activate: () => {},
    _: fallbackTranslations,
  };

  // Always call useLingui to follow React hooks rules
  const lingui = useLingui();

  // If i18n is disabled, return fallback
  if (i18nDisabled) {
    console.log('i18n is disabled via NEXT_PUBLIC_DISABLE_I18N, using fallback translations');
    return {
      _: fallbackTranslations,
      i18n: fallbackI18n,
    };
  }

  // If lingui is available, use it
  if (lingui && lingui._ && lingui.i18n) {
    return {
      _: lingui._,
      i18n: lingui.i18n,
    };
  }

  // Fallback if lingui is not properly initialized
  console.log('lingui not properly initialized, using fallback translations');
  return {
    _: fallbackTranslations,
    i18n: fallbackI18n,
  };
};
