import { createContext, useContext } from 'react';

type BrandingContextValue = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

const defaultBrandingContextValue: BrandingContextValue = {
  brandingEnabled: false,
  brandingUrl: '',
  brandingLogo: '',
  brandingCompanyDetails: '',
  brandingHidePoweredBy: false,
};

export const BrandingProvider = (props: {
  branding?: BrandingContextValue | Record<string, unknown>; // Allow any branding object
  children: React.ReactNode;
}) => {
  console.log('[BrandingProvider] Provider initialized');
  console.log('[BrandingProvider] Props branding:', props.branding);

  // Extract only the branding fields we need, regardless of the input structure
  const contextValue: BrandingContextValue = {
    brandingEnabled:
      Boolean(props.branding?.brandingEnabled) ?? defaultBrandingContextValue.brandingEnabled,
    brandingUrl:
      String(props.branding?.brandingUrl || '') || defaultBrandingContextValue.brandingUrl,
    brandingLogo:
      String(props.branding?.brandingLogo || '') || defaultBrandingContextValue.brandingLogo,
    brandingCompanyDetails:
      String(props.branding?.brandingCompanyDetails || '') ||
      defaultBrandingContextValue.brandingCompanyDetails,
    brandingHidePoweredBy:
      Boolean(props.branding?.brandingHidePoweredBy) ??
      defaultBrandingContextValue.brandingHidePoweredBy,
  };

  console.log('[BrandingProvider] Extracted context value:', contextValue);
  console.log('[BrandingProvider] Context value being provided:', {
    brandingEnabled: contextValue.brandingEnabled,
    brandingUrl: contextValue.brandingUrl,
    brandingLogo: contextValue.brandingLogo,
    brandingCompanyDetails: contextValue.brandingCompanyDetails,
    brandingHidePoweredBy: contextValue.brandingHidePoweredBy,
  });

  return <BrandingContext.Provider value={contextValue}>{props.children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);

  // Add comprehensive logging to debug context issues
  console.log('[useBranding] Hook called');
  console.log('[useBranding] Context value:', ctx);
  console.log('[useBranding] Context type:', typeof ctx);
  console.log('[useBranding] Context is undefined:', ctx === undefined);
  console.log('[useBranding] Context is null:', ctx === null);

  // Log the React component tree context
  console.log('[useBranding] React context debug info:', {
    hasContext: ctx !== undefined,
    contextKeys: ctx ? Object.keys(ctx) : 'N/A',
    brandingEnabled: ctx?.brandingEnabled,
    brandingUrl: ctx?.brandingUrl,
    brandingLogo: ctx?.brandingLogo,
  });

  if (!ctx) {
    console.error('[useBranding] ERROR: Branding context not found');
    console.error(
      '[useBranding] This usually means the component is not wrapped in a BrandingProvider',
    );
    console.error(
      '[useBranding] Check that the email template is being rendered through the render() function',
    );
    console.error('[useBranding] Current React context tree may not include BrandingProvider');
    console.error('[useBranding] This might be a React Email rendering timing issue');

    throw new Error(
      'Branding context not found - ensure the component is wrapped in BrandingProvider',
    );
  }

  console.log('[useBranding] Successfully retrieved branding context');
  return ctx;
};

export type BrandingSettings = BrandingContextValue;
