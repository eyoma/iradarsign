import { useState } from 'react';

import { Download } from 'lucide-react';

import { downloadPDF } from '@documenso/lib/client-only/download-pdf';
import type { DocumentData } from '@documenso/prisma/client';
import { Button } from '@documenso/ui/primitives/button';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type ShareDocumentDownloadButtonProps = {
  title: string;
  documentData: DocumentData;
};

export const ShareDocumentDownloadButton = ({
  title,
  documentData,
}: ShareDocumentDownloadButtonProps) => {
  const { toast } = useToast();

  const [isDownloading, setIsDownloading] = useState(false);

  const onDownloadClick = async () => {
    try {
      setIsDownloading(true);

      await downloadPDF({ documentData, fileName: title });
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "An error occurred while downloading your document.",
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button loading={isDownloading} onClick={onDownloadClick}>
      {!isDownloading && <Download className="mr-2 h-4 w-4" />}
      Download
    </Button>
  );
};
