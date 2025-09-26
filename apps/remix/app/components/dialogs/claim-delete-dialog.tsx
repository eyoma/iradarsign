import { useState } from 'react';

import { trpc } from '@documenso/trpc/react';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
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
import { useToast } from '@documenso/ui/primitives/use-toast';

export type ClaimDeleteDialogProps = {
  claimId: string;
  claimName: string;
  claimLocked: boolean;
  trigger: React.ReactNode;
};

export const ClaimDeleteDialog = ({
  claimId,
  claimName,
  claimLocked,
  trigger,
}: ClaimDeleteDialogProps) => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const { mutateAsync: deleteClaim, isPending } = trpc.admin.claims.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Subscription claim deleted successfully.",
      });

      setOpen(false);
    },
    onError: (err) => {
      console.error(err);

      toast({
        title: "Failed to delete subscription claim.",
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(value) => !isPending && setOpen(value)}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete Subscription Claim
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the following claim?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="neutral">
          <AlertDescription className="text-center font-semibold">
            {claimLocked ? This claim is locked and cannot be deleted. : claimName}
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          {!claimLocked && (
            <Button
              type="submit"
              variant="destructive"
              loading={isPending}
              onClick={async () => deleteClaim({ id: claimId })}
            >
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
