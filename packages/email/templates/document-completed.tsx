import { Body, Container, Head, Html, Img, Preview, Section } from '../components';
import type { TemplateDocumentCompletedProps } from '../template-components/template-document-completed';
import { TemplateDocumentCompleted } from '../template-components/template-document-completed';
import { TemplateFooter } from '../template-components/template-footer';

// Add branding type
type BrandingData = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

export type DocumentCompletedEmailTemplateProps = Partial<TemplateDocumentCompletedProps> & {
  customBody?: string;
  // Add branding prop
  branding?: BrandingData;
};

export const DocumentCompletedEmailTemplate = ({
  downloadLink = 'https://documenso.com',
  documentName = 'Open Source Pledge.pdf',
  assetBaseUrl = 'http://localhost:3002',
  customBody,
  branding, // Add branding prop
}: DocumentCompletedEmailTemplateProps) => {
  // Use props instead of context
  const brandingData = branding || {
    brandingEnabled: false,
    brandingUrl: '',
    brandingLogo: '',
    brandingCompanyDetails: '',
    brandingHidePoweredBy: false,
  };

  const previewText = 'Completed Document';

  const getAssetUrl = (path: string) => {
    return new URL(path, assetBaseUrl).toString();
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body className="mx-auto my-auto font-sans">
        <Section className="bg-white">
          <Container className="mx-auto mb-2 mt-8 max-w-xl rounded-lg border border-solid border-slate-200 p-2 backdrop-blur-sm">
            <Section className="p-2">
              {brandingData.brandingEnabled && brandingData.brandingLogo ? (
                <Img src={brandingData.brandingLogo} alt="Branding Logo" className="mb-4 h-6" />
              ) : (
                <Img
                  src={getAssetUrl('/static/logo.png')}
                  alt="Documenso Logo"
                  className="mb-4 h-6"
                />
              )}

              <TemplateDocumentCompleted
                downloadLink={downloadLink}
                documentName={documentName}
                assetBaseUrl={assetBaseUrl}
                customBody={customBody}
              />
            </Section>
          </Container>

          <Container className="mx-auto max-w-xl">
            <TemplateFooter branding={brandingData} />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

export default DocumentCompletedEmailTemplate;
