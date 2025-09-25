import { I18nProvider } from '@lingui/react';

import type { RenderOptions } from '@documenso/email/render';
import { render } from '@documenso/email/render';

import { getI18nInstance } from '../client-only/providers/i18n-server';
import {
  APP_I18N_OPTIONS,
  type SupportedLanguageCodes,
  isValidLanguageCode,
} from '../constants/i18n';

export const renderEmailWithI18N = async (
  component: React.ReactElement,
  options?: RenderOptions & {
    // eslint-disable-next-line @typescript-eslint/ban-types
    lang?: SupportedLanguageCodes | (string & {});
  },
) => {
  // Check if i18n is disabled via environment variable
  const i18nDisabled = process.env.NEXT_PUBLIC_DISABLE_I18N === 'true';

  if (i18nDisabled) {
    console.log(
      'i18n is disabled via NEXT_PUBLIC_DISABLE_I18N, rendering email without i18n context',
    );
    const { lang: _providedLang, ...otherOptions } = options ?? {};
    return render(component, otherOptions);
  }

  try {
    const { lang: providedLang, ...otherOptions } = options ?? {};

    const lang = isValidLanguageCode(providedLang) ? providedLang : APP_I18N_OPTIONS.sourceLang;

    console.log(`Rendering email with i18n for language: ${lang}`);

    const i18n = await getI18nInstance(lang);

    if (!i18n) {
      throw new Error(`Failed to get i18n instance for language: ${lang}`);
    }

    // Activate the language before rendering
    i18n.activate(lang);

    console.log(`I18n instance activated for language: ${lang}`);

    // Create the wrapped component with I18nProvider
    const wrappedComponent = <I18nProvider i18n={i18n}>{component}</I18nProvider>;

    console.log(`Rendering wrapped component with I18nProvider`);

    return render(wrappedComponent, otherOptions);
  } catch (err) {
    console.error('Failed to render email with i18n:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to render email: ${errorMessage}`);
  }
};
