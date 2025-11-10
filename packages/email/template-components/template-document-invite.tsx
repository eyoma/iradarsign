import { OrganisationType, RecipientRole } from '@prisma/client';
import { P, match } from 'ts-pattern';

import { RECIPIENT_ROLES_DESCRIPTION } from '@documenso/lib/constants/recipient-roles';

import { Button, Section, Text } from '../components';
import { TemplateDocumentImage } from './template-document-image';

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


  const { actionVerb } = RECIPIENT_ROLES_DESCRIPTION[role];

  return (
    <>
      <TemplateDocumentImage className="mt-6" assetBaseUrl={assetBaseUrl} />

      <Section>
        <Text className="text-primary mx-auto mb-0 max-w-[80%] text-center text-lg font-semibold">
          {match({ selfSigner, organisationType, includeSenderDetails, teamName })
            .with({ selfSigner: true }, () => (
              <div>
                Please {actionVerb.message} your document
                <br />"{documentName}"
              </div>
            ))
            .with(
              {
                organisationType: OrganisationType.ORGANISATION,
                includeSenderDetails: true,
                teamName: P.string,
              },
              () => (
                <div>
                  {inviterName} on behalf of "{teamName}" has invited you to{' '}
                  {actionVerb.message}
                  <br />"{documentName}"
                </div>
              ),
            )
            .with({ organisationType: OrganisationType.ORGANISATION, teamName: P.string }, () => (
              <div>
                {teamName} has invited you to {actionVerb.message}
                <br />"{documentName}"
              </div>
            ))
            .otherwise(() => (
              <div>
                {inviterName} has invited you to {actionVerb.message}
                <br />"{documentName}"
              </div>
            ))}
        </Text>

        <Text className="my-1 text-center text-base text-slate-400">
          {match(role)
            .with(RecipientRole.SIGNER, () => <div>Continue by signing the document.</div>)
            .with(RecipientRole.VIEWER, () => <div>Continue by viewing the document.</div>)
            .with(RecipientRole.APPROVER, () => <div>Continue by approving the document.</div>)
            .with(RecipientRole.CC, () => '')
            .with(RecipientRole.ASSISTANT, () => (
              <div>Continue by assisting with the document.</div>
            ))
            .exhaustive()}
        </Text>

        <Section className="mb-6 mt-8 text-center">
          <Button
            className="bg-documenso-500 text-sbase inline-flex items-center justify-center rounded-lg px-6 py-3 text-center font-medium text-black no-underline"
            href={signDocumentLink}
          >
            {match(role)
              .with(RecipientRole.SIGNER, () => <div>View Document to sign</div>)
              .with(RecipientRole.VIEWER, () => <div>View Document</div>)
              .with(RecipientRole.APPROVER, () => <div>View Document to approve</div>)
              .with(RecipientRole.CC, () => '')
              .with(RecipientRole.ASSISTANT, () => <div>View Document to assist</div>)
              .exhaustive()}
          </Button>
        </Section>
      </Section>
    </>
  );
};

export default TemplateDocumentInvite;
