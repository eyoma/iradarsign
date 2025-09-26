import { useState } from 'react';

import type { Document, Recipient, Team, User } from '@prisma/client';
import { DocumentStatus } from '@prisma/client';
import {
  Copy,
  Download,
  Edit,
  Loader,
  MoreHorizontal,
  ScrollTextIcon,
  Share,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { downloadPDF } from '@documenso/lib/client-only/download-pdf';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { isDocumentCompleted } from '@documenso/lib/utils/document';
import { formatDocumentsPath } from '@documenso/lib/utils/teams';
import { trpc as trpcClient } from '@documenso/trpc/client';
import { DocumentShareButton } from '@documenso/ui/components/document/document-share-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { DocumentDeleteDialog } from '~/components/dialogs/document-delete-dialog';
import { DocumentDuplicateDialog } from '~/components/dialogs/document-duplicate-dialog';
import { DocumentResendDialog } from '~/components/dialogs/document-resend-dialog';
import { DocumentRecipientLinkCopyDialog } from '~/components/general/document/document-recipient-link-copy-dialog';
import { useCurrentTeam } from '~/providers/team';

export type DocumentPageViewDropdownProps = {
  document: Document & {
    user: Pick<User, 'id' | 'name' | 'email'>;
    recipients: Recipient[];
    team: Pick<Team, 'id' | 'url'> | null;
  };
};

export const DocumentPageViewDropdown = ({ document }: DocumentPageViewDropdownProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const team = useCurrentTeam();

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  const recipient = document.recipients.find((recipient) => recipient.email === user.email);

  const isOwner = document.user.id === user.id;
  const isDraft = document.status === DocumentStatus.DRAFT;
  const isPending = document.status === DocumentStatus.PENDING;
  const isDeleted = document.deletedAt !== null;
  const isComplete = isDocumentCompleted(document);
  const isCurrentTeamDocument = team && document.team?.url === team.url;
  const canManageDocument = Boolean(isOwner || isCurrentTeamDocument);

  const documentsPath = formatDocumentsPath(team.url);

  const onDownloadClick = async () => {
    try {
      const documentWithData = await trpcClient.document.get.query(
        {
          documentId: document.id,
        },
        {
          context: {
            teamId: team?.id?.toString(),
          },
        },
      );

      const documentData = documentWithData?.documentData;

      if (!documentData) {
        return;
      }

      await downloadPDF({ documentData, fileName: document.title });
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "An error occurred while downloading your document.",
        variant: 'destructive',
      });
    }
  };

  const onDownloadOriginalClick = async () => {
    try {
      const documentWithData = await trpcClient.document.get.query(
        {
          documentId: document.id,
        },
        {
          context: {
            teamId: team?.id?.toString(),
          },
        },
      );

      const documentData = documentWithData?.documentData;

      if (!documentData) {
        return;
      }

      await downloadPDF({ documentData, fileName: document.title, version: 'original' });
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "An error occurred while downloading your document.",
        variant: 'destructive',
      });
    }
  };

  const nonSignedRecipients = document.recipients.filter((item) => item.signingStatus !== 'SIGNED');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreHorizontal className="text-muted-foreground h-5 w-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-52" align="end" forceMount>
        <DropdownMenuLabel>
          Action
        </DropdownMenuLabel>

        {(isOwner || isCurrentTeamDocument) && !isComplete && (
          <DropdownMenuItem asChild>
            <Link to={`${documentsPath}/${document.id}/edi"}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}

        {isComplete && (
          <DropdownMenuItem onClick={onDownloadClick}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onDownloadOriginalClick}>
          <Download className="mr-2 h-4 w-4" />
          Download Original
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to={"${documentsPath}/${document.id}/logs`}>
            <ScrollTextIcon className="mr-2 h-4 w-4" />
            Audit Logs
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setDuplicateDialogOpen(true)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} disabled={isDeleted}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>

        <DropdownMenuLabel>
          Share
        </DropdownMenuLabel>

        {canManageDocument && (
          <DocumentRecipientLinkCopyDialog
            recipients={document.recipients}
            trigger={
              <DropdownMenuItem
                disabled={!isPending || isDeleted}
                onSelect={(e) => e.preventDefault()}
              >
                <Copy className="mr-2 h-4 w-4" />
                Signing Links
              </DropdownMenuItem>
            }
          />
        )}

        <DocumentResendDialog document={document} recipients={nonSignedRecipients} />

        <DocumentShareButton
          documentId={document.id}
          token={isOwner ? undefined : recipient?.token}
          trigger={({ loading, disabled }) => (
            <DropdownMenuItem disabled={disabled || isDraft} onSelect={(e) => e.preventDefault()}>
              <div className="flex items-center">
                {loading ? <Loader className="mr-2 h-4 w-4" /> : <Share className="mr-2 h-4 w-4" />}
                Share Signing Card
              </div>
            </DropdownMenuItem>
          )}
        />
      </DropdownMenuContent>

      <DocumentDeleteDialog
        id={document.id}
        status={document.status}
        documentTitle={document.title}
        open={isDeleteDialogOpen}
        canManageDocument={canManageDocument}
        onOpenChange={setDeleteDialogOpen}
        onDelete={() => {
          void navigate(documentsPath);
        }}
      />

      {isDuplicateDialogOpen && (
        <DocumentDuplicateDialog
          id={document.id}
          open={isDuplicateDialogOpen}
          onOpenChange={setDuplicateDialogOpen}
        />
      )}
    </DropdownMenu>
  );
};
