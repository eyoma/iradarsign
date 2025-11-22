import { Body, Container, Head, Html, Img, Preview, Section } from '../components';
import { TemplateFooter } from '../template-components/template-footer';
import type { TemplateForgotPasswordProps } from '../template-components/template-forgot-password';
import { TemplateForgotPassword } from '../template-components/template-forgot-password';

// Add branding type
type BrandingData = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

export type ForgotPasswordTemplateProps = Partial<TemplateForgotPasswordProps> & {
  // Add branding prop
  branding?: BrandingData;
};

export const ForgotPasswordTemplate = ({
  resetPasswordLink = 'https://documenso.com',
  assetBaseUrl = 'http://localhost:3002',
  branding, // Add branding prop
}: ForgotPasswordTemplateProps) => {
  // Use props instead of context
  const brandingData = branding || {
    brandingEnabled: false,
    brandingUrl: '',
    brandingLogo: '',
    brandingCompanyDetails: '',
    brandingHidePoweredBy: false,
  };

  const previewText = 'Password Reset Requested';

  const getAssetUrl = (path: string) => {
    return new URL(path, assetBaseUrl).toString();
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body className="mx-auto my-auto bg-white font-sans">
        <Section>
          <Container className="mx-auto mb-2 mt-8 max-w-xl rounded-lg border border-solid border-slate-200 p-4 backdrop-blur-sm">
            <Section>

              <TemplateForgotPassword
                resetPasswordLink={resetPasswordLink}
                assetBaseUrl={assetBaseUrl}
              />
            </Section>
          </Container>

          <div className="mx-auto mt-12 max-w-xl" />

          <Container className="mx-auto max-w-xl">
            <TemplateFooter isDocument={false} branding={brandingData} />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

export default ForgotPasswordTemplate;
