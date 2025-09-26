import { Trans } from '@lingui/react/macro';

import { Link, Section, Text } from '../components';

// Add branding type
type BrandingData = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

export type TemplateFooterProps = {
  isDocument?: boolean;
  // Add branding prop
  branding?: BrandingData;
};

export const TemplateFooter = ({ isDocument = true, branding }: TemplateFooterProps) => {
  // Use props instead of context
  const brandingData = branding || {
    brandingEnabled: false,
    brandingUrl: '',
    brandingLogo: '',
    brandingCompanyDetails: '',
    brandingHidePoweredBy: false,
  };

  return (
    <Section>
      {isDocument && !brandingData.brandingHidePoweredBy && (
        <Text className="my-4 text-base text-slate-400">
          <Trans>
            This document was sent using{' '}
            <Link className="text-[#7AC455]" href="https://documen.so/mail-footer">
              Documenso.
            </Link>
          </Trans>
        </Text>
      )}

      {brandingData.brandingCompanyDetails ? (
        <Text className="my-8 text-sm text-slate-400">
          {brandingData.brandingCompanyDetails.split('\n').map((line, idx) => {
            return (
              <>
                {idx > 0 && <br />}
                {line}
              </>
            );
          })}
        </Text>
      ) : (
        <Text className="my-8 text-sm text-slate-400">
          Documenso, Inc.
          <br />
          2261 Market Street, #5211, San Francisco, CA 94114, USA
        </Text>
      )}
    </Section>
  );
};

export default TemplateFooter;
