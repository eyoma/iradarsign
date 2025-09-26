import { DocumentStatus, RecipientRole, SigningStatus } from '@prisma/client';
import type { Document, Recipient } from '@prisma/client';
import {
  AlertTriangle,
  CheckIcon,
  Clock,
  MailIcon,
  MailOpenIcon,
  PenIcon,
  PlusIcon,
  UserIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import { match } from 'ts-pattern';

import { RECIPIENT_ROLES_DESCRIPTION } from '@documenso/lib/constants/recipient-roles';
import { isDocumentCompleted } from '@documenso/lib/utils/document';
import { formatSigningLink } from '@documenso/lib/utils/recipients';
import { CopyTextButton } from '@documenso/ui/components/common/copy-text-button';
import { SignatureIcon } from '@documenso/ui/icons/signature';
import { AvatarWithText } from '@documenso/ui/primitives/avatar';
import { Badge } from '@documenso/ui/primitives/badge';
import { PopoverHover } from '@documenso/ui/primitives/popover';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type DocumentPageViewRecipientsProps = {
  document: Document & {
    recipients: Recipient[];
  };
  documentRootPath: string;
};

export const DocumentPageViewRecipients = ({
  document,
  documentRootPath,
}: DocumentPageViewRecipientsProps) => {
  const { toast } = useToast();

  const recipients = document.recipients;

  return (
    <section className="dark:bg-background border-border bg-widget flex flex-col rounded-xl border">
      <div className="flex flex-row items-center justify-between px-4 py-3">
        <h1 className="text-foreground font-medium">
          Recipients
        </h1>

        {!isDocumentCompleted(document.status) && (
          <Link
            to={`${documentRootPath}/${document.id}/edit?step=signers`}
            title={"Modify recipients"}
            className="flex flex-row items-center justify-between"
          >
            {recipients.length === 0 ? (
              <PlusIcon className="ml-2 h-4 w-4" />
            ) : (
              <PenIcon className="ml-2 h-3 w-3" />
            )}
          </Link>
        )}
      </div>

      <ul className="text-muted-foreground divide-y border-t">
        {recipients.length === 0 && (
          <li className="flex flex-col items-center justify-center py-6 text-sm">
            No recipients
          </li>
        )}

        {recipients.map((recipient) => (
          <li key={recipient.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <AvatarWithText
              avatarFallback={recipient.email.slice(0, 1).toUpperCase()}
              primaryText={<p className="text-muted-foreground text-sm">{recipient.email}</p>}
              secondaryText={
                <p className="text-muted-foreground/70 text-xs">
                  {RECIPIENT_ROLES_DESCRIPTION[recipient.role].roleName}
                </p>
              }
            />

            <div className="flex flex-row items-center">
              {document.status !== DocumentStatus.DRAFT &&
                recipient.signingStatus === SigningStatus.SIGNED && (
                  <Badge variant="default">
                    {match(recipient.role)
                      .with(RecipientRole.APPROVER, () => (
                        <>
                          <CheckIcon className="mr-1 h-3 w-3" />
                          Approved
                        </>
                      ))
                      .with(RecipientRole.CC, () =>
                        document.status === DocumentStatus.COMPLETED ? (
                          <>
                            <MailIcon className="mr-1 h-3 w-3" />
                            Sent
                          </>
                        ) : (
                          <>
                            <CheckIcon className="mr-1 h-3 w-3" />
                            Ready
                          </>
                        ),
                      )

                      .with(RecipientRole.SIGNER, () => (
                        <>
                          <SignatureIcon className="mr-1 h-3 w-3" />
                          Signed
                        </>
                      ))
                      .with(RecipientRole.VIEWER, () => (
                        <>
                          <MailOpenIcon className="mr-1 h-3 w-3" />
                          Viewed
                        </>
                      ))
                      .with(RecipientRole.ASSISTANT, () => (
                        <>
                          <UserIcon className="mr-1 h-3 w-3" />
                          Assisted
                        </>
                      ))
                      .exhaustive()}
                  </Badge>
                )}

              {document.status !== DocumentStatus.DRAFT &&
                recipient.signingStatus === SigningStatus.NOT_SIGNED && (
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}

              {document.status !== DocumentStatus.DRAFT &&
                recipient.signingStatus === SigningStatus.REJECTED && (
                  <PopoverHover
                    trigger={
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Rejected
                      </Badge>
                    }
                  >
                    <p className="text-sm">
                      Reason for rejection: 
                    </p>

                    <p className="text-muted-foreground mt-1 text-sm">
                      {recipient.rejectionReason}
                    </p>
                  </PopoverHover>
                )}

              {document.status === DocumentStatus.PENDING &&
                recipient.signingStatus === SigningStatus.NOT_SIGNED &&
                recipient.role !== RecipientRole.CC && (
                  <CopyTextButton
                    value={formatSigningLink(recipient.token)}
                    onCopySuccess={() => {
                      toast({
                        title: "Copied to clipboard",
                        description: "The signing link has been copied to your clipboard.",
                      });
                    }}
                  />
                )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
