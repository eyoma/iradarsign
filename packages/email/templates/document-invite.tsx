import type { RecipientRole } from '@prisma/client';
import { OrganisationType } from '@prisma/client';

import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from '../components';
import type { TemplateDocumentInviteProps } from '../template-components/template-document-invite';
import { TemplateDocumentInvite } from '../template-components/template-document-invite';
import { TemplateFooter } from '../template-components/template-footer';

// Add branding type
type BrandingData = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

export type DocumentInviteEmailTemplateProps = Partial<TemplateDocumentInviteProps> & {
  customBody?: string;
  role: RecipientRole;
  selfSigner?: boolean;
  teamName?: string;
  teamEmail?: string;
  includeSenderDetails?: boolean;
  organisationType?: OrganisationType;
  // Add branding prop
  branding?: BrandingData;
};

export const DocumentInviteEmailTemplate = ({
  inviterName = 'Lucas Smith',
  inviterEmail = 'lucas@documenso.com',
  documentName = 'Open Source Pledge.pdf',
  signDocumentLink = 'https://documenso.com',
  assetBaseUrl = 'http://localhost:3002',
  customBody,
  role,
  selfSigner = false,
  teamName = '',
  includeSenderDetails,
  organisationType,
  branding, // Add branding prop
}: DocumentInviteEmailTemplateProps) => {
  // Use props instead of context
  const brandingData = branding || {
    brandingEnabled: false,
    brandingUrl: '',
    brandingLogo: '',
    brandingCompanyDetails: '',
    brandingHidePoweredBy: false,
  };

  // Fix the action verb issue - use a string instead of message descriptor
  const action = role === 'SIGNER' ? 'sign' : role === 'APPROVER' ? 'approve' : 'review';

  let previewText = `${inviterName} has invited you to ${action} ${documentName}`;

  if (organisationType === OrganisationType.ORGANISATION) {
    previewText = includeSenderDetails
      ? `${inviterName} on behalf of "${teamName}" has invited you to ${action} ${documentName}`
      : `${teamName} has invited you to ${action} ${documentName}`;
  }

  if (selfSigner) {
    previewText = `Please ${action} your document ${documentName}`;
  }

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

              <TemplateDocumentInvite
                inviterName={inviterName}
                inviterEmail={inviterEmail}
                documentName={documentName}
                signDocumentLink={signDocumentLink}
                assetBaseUrl={assetBaseUrl}
                role={role}
                selfSigner={selfSigner}
                organisationType={organisationType}
                teamName={teamName}
                includeSenderDetails={includeSenderDetails}
              />
            </Section>
          </Container>

          <Container className="mx-auto mt-12 max-w-xl">
            <Section>
              {organisationType === OrganisationType.PERSONAL && (
                <Text className="my-4 text-base font-semibold">
                  {inviterName}{' '}
                  <Link className="font-normal text-slate-400" href="mailto:{inviterEmail}">
                    ({inviterEmail})
                  </Link>
                </Text>
              )}

              <Text className="mt-2 text-base text-slate-400">
                {customBody ? (
                  <pre className="font-sans text-base text-slate-400">{customBody}</pre>
                ) : (
                  `${inviterName} has invited you to ${action} the document "${documentName}".`
                )}
              </Text>
            </Section>
          </Container>

          <Hr className="mx-auto mt-12 max-w-xl" />

          <Container className="mx-auto max-w-xl">
            <TemplateFooter branding={brandingData} />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

export default DocumentInviteEmailTemplate;
