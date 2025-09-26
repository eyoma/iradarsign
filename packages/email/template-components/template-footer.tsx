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
          This document was sent using{' '}
          <Link className="text-[#7AC455]" href="https://iradarsign.com">
            iRadarSign.
          </Link>
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
          iRadarData, Inc.
          <br />
          1505 Laperriere Ave Ottawa, ON Canada K1Z 7S9
        </Text>
      )}
    </Section>
  );
};

export default TemplateFooter;
