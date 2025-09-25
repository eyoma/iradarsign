import { type BrandingSettings, useBranding } from '../providers/branding';

/**
 * Safe branding hook that provides fallback branding when BrandingProvider is not available
 * This is particularly useful for server-side rendering in email templates
 */
export const useSafeBranding = (): BrandingSettings => {
  // Always call useBranding to follow React hooks rules
  const branding = useBranding();

  // If branding is available, return it
  if (branding) {
    return branding;
  }

  // Fallback branding
  return {
    brandingEnabled: false,
    brandingUrl: '',
    brandingLogo: '',
    brandingCompanyDetails: '',
    brandingHidePoweredBy: false,
  };
};
