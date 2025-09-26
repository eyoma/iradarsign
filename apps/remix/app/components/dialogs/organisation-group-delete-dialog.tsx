import { useState } from 'react';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
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

export type OrganisationGroupDeleteDialogProps = {
  organisationGroupId: string;
  organisationGroupName: string;
  trigger?: React.ReactNode;
};

export const OrganisationGroupDeleteDialog = ({
  trigger,
  organisationGroupId,
  organisationGroupName,
}: OrganisationGroupDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const organisation = useCurrentOrganisation();

  const { mutateAsync: deleteGroup, isPending: isDeleting } =
    trpc.organisation.group.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You have successfully removed this group from the organisation.",
          duration: 5000,
        });

        setOpen(false);
      },
      onError: () => {
        toast({
          title: "An unknown error occurred",
          description: 
            "We encountered an unknown error while attempting to remove this group. Please try again later.",
          ,
          variant: 'destructive',
          duration: 10000,
        });
      },
    });

  return (
    <Dialog open={open} onOpenChange={(value) => !isDeleting && setOpen(value)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary">
            Delete organisation group
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Are you sure?
          </DialogTitle>

          <DialogDescription className="mt-4">
            
              You are about to remove the following group from{' '}
              <span className="font-semibold">{organisation.name}</span>.
            
          </DialogDescription>
        </DialogHeader>

        <Alert variant="neutral">
          <AlertDescription className="text-center font-semibold">
            {organisationGroupName}
          </AlertDescription>
        </Alert>

        <fieldset disabled={isDeleting}>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              loading={isDeleting}
              onClick={async () =>
                deleteGroup({
                  organisationId: organisation.id,
                  groupId: organisationGroupId,
                })
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};
