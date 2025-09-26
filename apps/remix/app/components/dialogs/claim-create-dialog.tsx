import { useState } from 'react';

import type { z } from 'zod';

import { generateDefaultSubscriptionClaim } from '@documenso/lib/utils/organisations-claims';
import { trpc } from '@documenso/trpc/react';
import type { ZCreateSubscriptionClaimRequestSchema } from '@documenso/trpc/server/admin-router/create-subscription-claim.types';
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

export type CreateClaimFormValues = z.infer<typeof ZCreateSubscriptionClaimRequestSchema>;

export const ClaimCreateDialog = () => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const { mutateAsync: createClaim, isPending } = trpc.admin.claims.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Subscription claim created successfully.",
      });

      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to create subscription claim.",
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild={true}>
        <Button className="flex-shrink-0" variant="secondary">
          Create claim
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Create Subscription Claim
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new subscription claim.
          </DialogDescription>
        </DialogHeader>

        <SubscriptionClaimForm
          subscriptionClaim={{
            ...generateDefaultSubscriptionClaim(),
          }}
          onFormSubmit={createClaim}
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
                Create Claim
              </Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
};
