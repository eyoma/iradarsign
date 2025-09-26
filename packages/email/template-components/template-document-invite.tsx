import { useMemo } from 'react';

import { OrganisationType, RecipientRole } from '@prisma/client';
import { P, match } from 'ts-pattern';

import { Button, Section, Text } from '../components';
import { TemplateDocumentImage } from './template-document-image';

// Plain text constants for recipient roles (no internationalization)
const RECIPIENT_ROLES_ACTION_VERBS = {
  [RecipientRole.SIGNER]: 'sign',
  [RecipientRole.VIEWER]: 'view',
  [RecipientRole.APPROVER]: 'approve',
  [RecipientRole.CC]: 'cc',
  [RecipientRole.ASSISTANT]: 'assist',
} as const;

export interface TemplateDocumentInviteProps {
  inviterName: string;
  inviterEmail: string;
  documentName: string;
  signDocumentLink: string;
  assetBaseUrl: string;
  role: RecipientRole;
  selfSigner: boolean;
  teamName?: string;
  includeSenderDetails?: boolean;
  organisationType?: OrganisationType;
}

export const TemplateDocumentInvite = ({
  inviterName,
  documentName,
  signDocumentLink,
  assetBaseUrl,
  role,
  selfSigner,
  teamName,
  includeSenderDetails,
  organisationType,
}: TemplateDocumentInviteProps) => {
  const actionVerb = RECIPIENT_ROLES_ACTION_VERBS[role];

  const rejectDocumentLink = useMemo(() => {
    const url = new URL(signDocumentLink);
    url.searchParams.set('reject', 'true');
    return url.toString();
  }, [signDocumentLink]);

  return (
    <>
      <TemplateDocumentImage className="mt-6" assetBaseUrl={assetBaseUrl} />

      <Section>
        <Text className="text-primary mx-auto mb-0 max-w-[80%] text-center text-lg font-semibold">
          {match({ selfSigner, organisationType, includeSenderDetails, teamName })
            .with({ selfSigner: true }, () => (
              <>
                Please {actionVerb} your document
                <br />"{documentName}"
              </>
            ))
            .with(
              {
                organisationType: OrganisationType.ORGANISATION,
                includeSenderDetails: true,
                teamName: P.string,
              },
              () => (
                <>
                  {inviterName} on behalf of "{teamName}" has invited you to {actionVerb}
                  <br />"{documentName}"
                </>
              ),
            )
            .with({ organisationType: OrganisationType.ORGANISATION, teamName: P.string }, () => (
              <>
                {teamName} has invited you to {actionVerb}
                <br />"{documentName}"
              </>
            ))
            .otherwise(() => (
              <>
                {inviterName} has invited you to {actionVerb}
                <br />"{documentName}"
              </>
            ))}
        </Text>

        <Text className="my-1 text-center text-base text-slate-400">
          {match(role)
            .with(RecipientRole.SIGNER, () => 'Continue by signing the document.')
            .with(RecipientRole.VIEWER, () => 'Continue by viewing the document.')
            .with(RecipientRole.APPROVER, () => 'Continue by approving the document.')
            .with(RecipientRole.CC, () => '')
            .with(RecipientRole.ASSISTANT, () => 'Continue by assisting with the document.')
            .exhaustive()}
        </Text>

        <Section className="mb-6 mt-8 text-center">
          <Button
            className="mr-4 inline-flex items-center justify-center rounded-lg bg-red-500 px-6 py-3 text-center text-sm font-medium text-black no-underline"
            href={rejectDocumentLink}
          >
            Reject Document
          </Button>

          <Button
            className="bg-documenso-500 inline-flex items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-medium text-black no-underline"
            href={signDocumentLink}
          >
            {match(role)
              .with(RecipientRole.SIGNER, () => 'Sign Document')
              .with(RecipientRole.VIEWER, () => 'View Document')
              .with(RecipientRole.APPROVER, () => 'Approve Document')
              .with(RecipientRole.CC, () => '')
              .with(RecipientRole.ASSISTANT, () => 'Assist Document')
              .exhaustive()}
          </Button>
        </Section>
      </Section>
    </>
  );
};

export default TemplateDocumentInvite;
