import { useLingui } from '@lingui/react';

/**
 * Safe version of useLingui that provides fallbacks when the context is not available
 * This is particularly useful for email templates that are rendered server-side
 */
export const useSafeLingui = () => {
  const lingui = useLingui();

  // Fallback function for when Lingui context is not available
  const _ = lingui?._ || ((text: string) => text);

  return {
    _,
    i18n: lingui?.i18n,
    locale: lingui?.i18n?.locale,
  };
};
