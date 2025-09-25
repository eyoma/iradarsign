import type { I18n, Messages } from '@lingui/core';
import { setupI18n } from '@lingui/core';

import {
  APP_I18N_OPTIONS,
  SUPPORTED_LANGUAGE_CODES,
  isValidLanguageCode,
} from '../../constants/i18n';
import { remember } from '../../utils/remember';

type SupportedLanguages = (typeof SUPPORTED_LANGUAGE_CODES)[number];

export async function loadCatalog(lang: SupportedLanguages): Promise<{
  [k: string]: Messages;
}> {
  // Always use .mjs files as they are JavaScript modules
  const extension = 'mjs';

  try {
    const { messages } = await import(`../../translations/${lang}/web.${extension}`);
    return {
      [lang]: messages,
    };
  } catch (err) {
    console.error(`Failed to load catalog for language ${lang}:`, err);
    // Return empty messages as fallback
    return {
      [lang]: {},
    };
  }
}

const catalogs = Promise.all(SUPPORTED_LANGUAGE_CODES.map(loadCatalog));

// transform array of catalogs into a single object
const allMessages = async () => {
  return await catalogs.then((catalogs) =>
    catalogs.reduce((acc, oneCatalog) => {
      return {
        ...acc,
        ...oneCatalog,
      };
    }, {}),
  );
};

type AllI18nInstances = { [K in SupportedLanguages]: I18n };

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const allI18nInstances = remember('i18n.allI18nInstances', async () => {
  // Check if i18n is disabled via environment variable
  const i18nDisabled = process.env.NEXT_PUBLIC_DISABLE_I18N === 'true';

  if (i18nDisabled) {
    console.log('i18n is disabled via NEXT_PUBLIC_DISABLE_I18N, returning minimal i18n instances');
    // Return minimal instances when i18n is disabled
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return SUPPORTED_LANGUAGE_CODES.reduce((acc, lang) => {
      const i18n = setupI18n({
        locale: lang,
        messages: { [lang]: {} },
      });
      return { ...acc, [lang]: i18n };
    }, {}) as AllI18nInstances;
  }

  try {
    const loadedMessages = await allMessages();

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return SUPPORTED_LANGUAGE_CODES.reduce((acc, lang) => {
      const messages = loadedMessages[lang] ?? {};

      const i18n = setupI18n({
        locale: lang,
        messages: { [lang]: messages },
      });

      return { ...acc, [lang]: i18n };
    }, {}) as AllI18nInstances;
  } catch (err) {
    console.error('Failed to create all i18n instances:', err);
    // Return minimal instances as fallback
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return SUPPORTED_LANGUAGE_CODES.reduce((acc, lang) => {
      const i18n = setupI18n({
        locale: lang,
        messages: { [lang]: {} },
      });
      return { ...acc, [lang]: i18n };
    }, {}) as AllI18nInstances;
  }
});

// eslint-disable-next-line @typescript-eslint/ban-types
export const getI18nInstance = async (lang?: SupportedLanguages | (string & {})) => {
  // Check if i18n is disabled via environment variable
  const i18nDisabled = process.env.NEXT_PUBLIC_DISABLE_I18N === 'true';

  if (i18nDisabled) {
    console.log('i18n is disabled via NEXT_PUBLIC_DISABLE_I18N, returning minimal i18n instance');
    const { setupI18n } = await import('@lingui/core');
    return setupI18n({
      locale: APP_I18N_OPTIONS.sourceLang,
      messages: { [APP_I18N_OPTIONS.sourceLang]: {} },
    });
  }

  try {
    console.log(`Getting i18n instance for language: ${lang}`);
    const instances = await allI18nInstances;
    console.log(`Available instances:`, Object.keys(instances));

    if (!isValidLanguageCode(lang)) {
      console.log(
        `Invalid language code ${lang}, using source language: ${APP_I18N_OPTIONS.sourceLang}`,
      );
      return instances[APP_I18N_OPTIONS.sourceLang];
    }

    const instance = instances[lang] ?? instances[APP_I18N_OPTIONS.sourceLang];
    console.log(`Using i18n instance for language: ${lang}`);
    return instance;
  } catch (err) {
    console.error('Failed to get i18n instance:', err);
    // Return a minimal i18n instance as fallback
    const { setupI18n } = await import('@lingui/core');
    return setupI18n({
      locale: APP_I18N_OPTIONS.sourceLang,
      messages: { [APP_I18N_OPTIONS.sourceLang]: {} },
    });
  }
};
