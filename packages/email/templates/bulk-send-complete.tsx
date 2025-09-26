import { Body, Container, Head, Html, Img, Preview, Section, Text } from '../components';
import { TemplateFooter } from '../template-components/template-footer';

// Add branding type
type BrandingData = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

export interface BulkSendCompleteEmailProps {
  userName: string;
  templateName: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  errors: string[];
  assetBaseUrl?: string;
  // Add branding prop
  branding?: BrandingData;
}

export const BulkSendCompleteEmail = ({
  userName,
  templateName,
  totalProcessed,
  successCount,
  failedCount,
  errors,
  assetBaseUrl = 'http://localhost:3002',
  branding, // Add branding prop
}: BulkSendCompleteEmailProps) => {
  // Use props instead of context
  const brandingData = branding || {
    brandingEnabled: false,
    brandingUrl: '',
    brandingLogo: '',
    brandingCompanyDetails: '',
    brandingHidePoweredBy: false,
  };

  const previewText = `Bulk send completed for ${templateName}`;

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

              <Text className="text-2xl font-bold text-slate-900">Bulk Send Complete</Text>

              <Text className="mt-4 text-base text-slate-600">Hello {userName},</Text>

              <Text className="mt-4 text-base text-slate-600">
                Your bulk send operation for the template "{templateName}" has been completed.
              </Text>

              <Text className="mt-4 text-base text-slate-600">
                <strong>Summary:</strong>
              </Text>
              <Text className="mt-2 text-base text-slate-600">
                • Total processed: {totalProcessed}
              </Text>
              <Text className="mt-1 text-base text-slate-600">• Successful: {successCount}</Text>
              <Text className="mt-1 text-base text-slate-600">• Failed: {failedCount}</Text>

              {errors.length > 0 && (
                <>
                  <Text className="mt-4 text-base text-slate-600">
                    <strong>Errors encountered:</strong>
                  </Text>
                  {errors.map((error, index) => (
                    <Text key={index} className="mt-1 text-sm text-red-600">
                      • {error}
                    </Text>
                  ))}
                </>
              )}
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

export default BulkSendCompleteEmail;
