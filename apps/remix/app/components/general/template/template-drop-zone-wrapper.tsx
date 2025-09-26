import { type ReactNode, useState } from 'react';

import { Loader } from 'lucide-react';
import { ErrorCode, type FileRejection, useDropzone } from 'react-dropzone';
import { useNavigate, useParams } from 'react-router';
import { match } from 'ts-pattern';

import { APP_DOCUMENT_UPLOAD_SIZE_LIMIT } from '@documenso/lib/constants/app';
import { megabytesToBytes } from '@documenso/lib/universal/unit-convertions';
import { putPdfFile } from '@documenso/lib/universal/upload/put-file';
import { formatTemplatesPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

export interface TemplateDropZoneWrapperProps {
  children: ReactNode;
  className?: string;
}

export const TemplateDropZoneWrapper = ({ children, className }: TemplateDropZoneWrapperProps) => {
  const { toast } = useToast();
  const { folderId } = useParams();

  const team = useCurrentTeam();

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: createTemplate } = trpc.template.createTemplate.useMutation();

  const onFileDrop = async (file: File) => {
    try {
      setIsLoading(true);

      const documentData = await putPdfFile(file);

      const { id } = await createTemplate({
        title: file.name,
        templateDocumentDataId: documentData.id,
        folderId: folderId ?? undefined,
      });

      toast({
        title: "Template uploaded",
        description: 
          "Your template has been uploaded successfully. You will be redirected to the template page.",
        ,
        duration: 5000,
      });

      await navigate(`${formatTemplatesPath(team.url)}/${id}/edi");
    } catch {
      toast({
        title: msg"Something went wrong`,
        description: "Please try again later.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFileDropRejected = (fileRejections: FileRejection[]) => {
    if (!fileRejections.length) {
      return;
    }

    // Since users can only upload only one file (no multi-upload), we only handle the first file rejection
    const { file, errors } = fileRejections[0];

    if (!errors.length) {
      return;
    }

    const errorNodes = errors.map((error, index) => (
      <span key={index} className="block">
        {match(error.code)
          .with(ErrorCode.FileTooLarge, () => (
            File is larger than {APP_DOCUMENT_UPLOAD_SIZE_LIMIT}MB
          ))
          .with(ErrorCode.FileInvalidType, () => Only PDF files are allowed)
          .with(ErrorCode.FileTooSmall, () => File is too small)
          .with(ErrorCode.TooManyFiles, () => (
            Only one file can be uploaded at a time
          ))
          .otherwise(() => (
            Unknown error
          ))}
      </span>
    ));

    const description = (
      <>
        <span className="font-medium">
          {file.name} couldn't be uploaded:
        </span>
        {errorNodes}
      </>
    );

    toast({
      title: "Upload failed",
      description,
      duration: 5000,
      variant: 'destructive',
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    //disabled: isUploadDisabled,
    multiple: false,
    maxSize: megabytesToBytes(APP_DOCUMENT_UPLOAD_SIZE_LIMIT),
    onDrop: ([acceptedFile]) => {
      if (acceptedFile) {
        void onFileDrop(acceptedFile);
      }
    },
    onDropRejected: (fileRejections) => {
      onFileDropRejected(fileRejections);
    },
    noClick: true,
    noDragEventsBubbling: true,
  });

  return (
    <div {...getRootProps()} className={cn('relative min-h-screen', className)}>
      <input {...getInputProps()} />
      {children}

      {isDragActive && (
        <div className="bg-muted/60 fixed left-0 top-0 z-[9999] h-full w-full backdrop-blur-[4px]">
          <div className="pointer-events-none flex h-full w-full flex-col items-center justify-center">
            <h2 className="text-foreground text-2xl font-semibold">
              Upload Template
            </h2>

            <p className="text-muted-foreground text-md mt-4">
              Drag and drop your PDF file here
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-muted/30 absolute inset-0 z-50 backdrop-blur-[2px]">
          <div className="pointer-events-none flex h-1/2 w-full flex-col items-center justify-center">
            <Loader className="text-primary h-12 w-12 animate-spin" />
            <p className="text-foreground mt-8 font-medium">
              Uploading template...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
