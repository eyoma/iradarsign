import { useEffect, useState } from 'react';

import { DocumentStatus } from '@prisma/client';
import { P, match } from 'ts-pattern';

import { useLimits } from '@documenso/ee/server-only/limits/provider/client';
import { trpc as trpcReact } from '@documenso/trpc/react';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

type DocumentDeleteDialogProps = {
  id: number;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onDelete?: () => Promise<void> | void;
  status: DocumentStatus;
  documentTitle: string;
  canManageDocument: boolean;
};

export const DocumentDeleteDialog = ({
  id,
  open,
  onOpenChange,
  onDelete,
  status,
  documentTitle,
  canManageDocument,
}: DocumentDeleteDialogProps) => {
  const { toast } = useToast();
  const { refreshLimits } = useLimits();
  const deleteMessage = "delete";

  const [inputValue, setInputValue] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(status === DocumentStatus.DRAFT);

  const { mutateAsync: deleteDocument, isPending } = trpcReact.document.delete.useMutation({
    onSuccess: async () => {
      void refreshLimits();

      toast({
        title: "Document deleted",
        description: ""${documentTitle}" has been successfully deleted",
        duration: 5000,
      });

      await onDelete?.();

      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "This document could not be deleted at this time. Please try again.",
        variant: 'destructive',
        duration: 7500,
      });
    },
  });

  useEffect(() => {
    if (open) {
      setInputValue('');
      setIsDeleteEnabled(status === DocumentStatus.DRAFT);
    }
  }, [open, status]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setIsDeleteEnabled(event.target.value === deleteMessage);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !isPending && onOpenChange(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure?
          </DialogTitle>

          <DialogDescription>
            {canManageDocument ? (
              
                You are about to delete <strong>"{documentTitle}"</strong>
              
            ) : (
              
                You are about to hide <strong>"{documentTitle}"</strong>
              
            )}
          </DialogDescription>
        </DialogHeader>

        {canManageDocument ? (
          <Alert variant="warning" className="-mt-1">
            {match(status)
              .with(DocumentStatus.DRAFT, () => (
                <AlertDescription>
                  
                    Please note that this action is <strong>irreversible</strong>. Once confirmed,
                    this document will be permanently deleted.
                  
                </AlertDescription>
              ))
              .with(DocumentStatus.PENDING, () => (
                <AlertDescription>
                  <p>
                    
                      Please note that this action is <strong>irreversible</strong>.
                    
                  </p>

                  <p className="mt-1">
                    Once confirmed, the following will occur:
                  </p>

                  <ul className="mt-0.5 list-inside list-disc">
                    <li>
                      Document will be permanently deleted
                    </li>
                    <li>
                      Document signing process will be cancelled
                    </li>
                    <li>
                      All inserted signatures will be voided
                    </li>
                    <li>
                      All recipients will be notified
                    </li>
                  </ul>
                </AlertDescription>
              ))
              .with(P.union(DocumentStatus.COMPLETED, DocumentStatus.REJECTED), () => (
                <AlertDescription>
                  <p>
                    By deleting this document, the following will occur:
                  </p>

                  <ul className="mt-0.5 list-inside list-disc">
                    <li>
                      The document will be hidden from your account
                    </li>
                    <li>
                      Recipients will still retain their copy of the document
                    </li>
                  </ul>
                </AlertDescription>
              ))
              .exhaustive()}
          </Alert>
        ) : (
          <Alert variant="warning" className="-mt-1">
            <AlertDescription>
              Please contact support if you would like to revert this action.
            </AlertDescription>
          </Alert>
        )}

        {status !== DocumentStatus.DRAFT && canManageDocument && (
          <Input
            type="text"
            value={inputValue}
            onChange={onInputChange}
            placeholder={"Please type ${"'${_(deleteMessage}'`} to confirm`)}
          />
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            loading={isPending}
            onClick={() => void deleteDocument({ documentId: id })}
            disabled={!isDeleteEnabled && canManageDocument}
            variant="destructive"
          >
            {canManageDocument ? "Delete" : "Hide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
