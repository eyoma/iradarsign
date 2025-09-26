import { useState } from 'react';

import { trpc } from '@documenso/trpc/react';
import type { TFindSubscriptionClaimsResponse } from '@documenso/trpc/server/admin-router/find-subscription-claims.types';
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

import { SubscriptionClaimForm } from '../forms/subscription-claim-form';

export type ClaimUpdateDialogProps = {
  claim: TFindSubscriptionClaimsResponse['data'][number];
  trigger: React.ReactNode;
};

export const ClaimUpdateDialog = ({ claim, trigger }: ClaimUpdateDialogProps) => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const { mutateAsync: updateClaim, isPending } = trpc.admin.claims.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Subscription claim updated successfully.",
      });

      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to update subscription claim.",
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Update Subscription Claim
          </DialogTitle>
          <DialogDescription>
            Modify the details of the subscription claim.
          </DialogDescription>
        </DialogHeader>

        <SubscriptionClaimForm
          subscriptionClaim={claim}
          onFormSubmit={async (data) =>
            await updateClaim({
              id: claim.id,
              data,
            })
          }
          formSubmitTrigger={
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type="submit" loading={isPending}>
                Update Claim
              </Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
};
