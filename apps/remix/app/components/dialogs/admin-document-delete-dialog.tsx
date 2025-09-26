import { useState } from 'react';

import type { Document } from '@prisma/client';
import { useNavigate } from 'react-router';

import { trpc } from '@documenso/trpc/react';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type AdminDocumentDeleteDialogProps = {
  document: Document;
};

export const AdminDocumentDeleteDialog = ({ document }: AdminDocumentDeleteDialogProps) => {
  const { toast } = useToast();

  const navigate = useNavigate();

  const [reason, setReason] = useState('');

  const { mutateAsync: deleteDocument, isPending: isDeletingDocument } =
    trpc.admin.document.delete.useMutation();

  const handleDeleteDocument = async () => {
    try {
      if (!reason) {
        return;
      }

      await deleteDocument({ id: document.id, reason });

      toast({
        title: "Document deleted",
        description: 'The Document has been deleted successfully.',
        duration: 5000,
      });

      await navigate('/admin/documents');
    } catch (err) {
      toast({
        title: "An unknown error occurred",
        variant: 'destructive',
        description:
          'We encountered an unknown error while attempting to delete your document. Please try again later.',
      });
    }
  };

  return (
    <div>
      <div>
        <Alert
          className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row"
          variant="neutral"
        >
          <div>
            <AlertTitle>
              Delete Document
            </AlertTitle>
            <AlertDescription className="mr-2">
              
                Delete the document. This action is irreversible so proceed with caution.
              
            </AlertDescription>
          </div>

          <div className="flex-shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  Delete Document
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader className="space-y-4">
                  <DialogTitle>
                    Delete Document
                  </DialogTitle>

                  <Alert variant="destructive">
                    <AlertDescription className="selection:bg-red-100">
                      This action is not reversible. Please be certain.
                    </AlertDescription>
                  </Alert>
                </DialogHeader>

                <div>
                  <DialogDescription>
                    To confirm, please enter the reason
                  </DialogDescription>

                  <Input
                    className="mt-2"
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleDeleteDocument}
                    loading={isDeletingDocument}
                    variant="destructive"
                    disabled={!reason}
                  >
                    Delete document
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Alert>
      </div>
    </div>
  );
};
