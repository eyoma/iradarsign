import { useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router';
import { match } from 'ts-pattern';

import { useLimits } from '@documenso/ee/server-only/limits/provider/client';
import { useAnalytics } from '@documenso/lib/client-only/hooks/use-analytics';
import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { APP_DOCUMENT_UPLOAD_SIZE_LIMIT } from '@documenso/lib/constants/app';
import { DEFAULT_DOCUMENT_TIME_ZONE, TIME_ZONES } from '@documenso/lib/constants/time-zones';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { putPdfFile } from '@documenso/lib/universal/upload/put-file';
import { formatDocumentsPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
import { DocumentDropzone } from '@documenso/ui/primitives/document-upload';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@documenso/ui/primitives/tooltip';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

export type DocumentUploadDropzoneProps = {
  className?: string;
};

export const DocumentUploadDropzone = ({ className }: DocumentUploadDropzoneProps) => {
  const { toast } = useToast();
  const { user } = useSession();
  const { folderId } = useParams();

  const team = useCurrentTeam();

  const navigate = useNavigate();
  const analytics = useAnalytics();
  const organisation = useCurrentOrganisation();

  const userTimezone =
    TIME_ZONES.find((timezone) => timezone === Intl.DateTimeFormat().resolvedOptions().timeZone) ??
    DEFAULT_DOCUMENT_TIME_ZONE;

  const { quota, remaining, refreshLimits } = useLimits();

  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: createDocument } = trpc.document.create.useMutation();

  const disabledMessage = useMemo(() => {
    if (organisation.subscription && remaining.documents === 0) {
      return "Document upload disabled due to unpaid invoices";
    }

    if (remaining.documents === 0) {
      return "You have reached your document limit.";
    }

    if (!user.emailVerified) {
      return "Verify your email to upload documents.";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining.documents, user.emailVerified, team]);

  const onFileDrop = async (file: File) => {
    try {
      setIsLoading(true);

      const response = await putPdfFile(file);

      const { id } = await createDocument({
        title: file.name,
        documentDataId: response.id,
        timezone: userTimezone, // Note: When migrating to v2 document upload remember to pass this through as a 'userTimezone' field.
        folderId: folderId ?? undefined,
      });

      void refreshLimits();

      await navigate(`${formatDocumentsPath(team.url)}/${id}/edi");

      toast({
        title: msg"Document uploaded`,
        description: "Your document has been uploaded successfully.",
        duration: 5000,
      });

      analytics.capture('App: Document Uploaded', {
        userId: user.id,
        documentId: id,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const error = AppError.parseError(err);

      console.error(err);

      const errorMessage = match(error.code)
        .with('INVALID_DOCUMENT_FILE', () => "You cannot upload encrypted PDFs")
        .with(
          AppErrorCode.LIMIT_EXCEEDED,
          () => "You have reached your document limit for this month. Please upgrade your plan.",
        )
        .otherwise(() => "An error occurred while uploading your document.");

      toast({
        title: "Error",
        description: errorMessage,
        variant: 'destructive',
        duration: 7500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFileDropRejected = () => {
    toast({
      title: "Your document failed to upload.",
      description: "File cannot be larger than ${APP_DOCUMENT_UPLOAD_SIZE_LIMIT}MB",
      duration: 5000,
      variant: 'destructive',
    });
  };

  return (
    <div className={cn('relative', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DocumentDropzone
                loading={isLoading}
                disabled={remaining.documents === 0 || !user.emailVerified}
                disabledMessage={disabledMessage}
                onDrop={onFileDrop}
                onDropRejected={onFileDropRejected}
              />
            </div>
          </TooltipTrigger>

          {team?.id === undefined &&
            remaining.documents > 0 &&
            Number.isFinite(remaining.documents) && (
              <TooltipContent>
                <p className="text-sm">
                  
                    {remaining.documents} of {quota.documents} documents remaining this month.
                  
                </p>
              </TooltipContent>
            )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
