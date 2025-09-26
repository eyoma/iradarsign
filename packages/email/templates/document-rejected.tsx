import { Body, Container, Head, Html, Img, Preview, Section } from '../components';
import { TemplateDocumentRejected } from '../template-components/template-document-rejected';
import { TemplateFooter } from '../template-components/template-footer';

// Add branding type
type BrandingData = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

type DocumentRejectedEmailProps = {
  recipientName: string;
  documentName: string;
  documentUrl: string;
  rejectionReason: string;
  assetBaseUrl?: string;
  // Add branding prop
  branding?: BrandingData;
};

export function DocumentRejectedEmail({
  recipientName,
  documentName,
  documentUrl,
  rejectionReason,
  assetBaseUrl = 'http://localhost:3002',
  branding, // Add branding prop
}: DocumentRejectedEmailProps) {
  // Use props instead of context
  const brandingData = branding || {
    brandingEnabled: false,
    brandingUrl: '',
    brandingLogo: '',
    brandingCompanyDetails: '',
    brandingHidePoweredBy: false,
  };

  const previewText = `${recipientName} has rejected the document '${documentName}'`;

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
              {brandingData.brandingEnabled && brandingData.brandingLogo ? (
                <Img src={brandingData.brandingLogo} alt="Branding Logo" className="mb-4 h-6" />
              ) : (
                <Img
                  src={getAssetUrl('/static/logo.png')}
                  alt="Documenso Logo"
                  className="mb-4 h-6"
                />
              )}

              <TemplateDocumentRejected
                recipientName={recipientName}
                documentName={documentName}
                documentUrl={documentUrl}
                rejectionReason={rejectionReason}
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
}

export default DocumentRejectedEmail;
