import { useState } from 'react';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { trpc } from '@documenso/trpc/react';
import { Alert } from '@documenso/ui/primitives/alert';
import { AvatarWithText } from '@documenso/ui/primitives/avatar';
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

export type OrganisationMemberDeleteDialogProps = {
  organisationMemberId: string;
  organisationMemberName: string;
  organisationMemberEmail: string;
  trigger?: React.ReactNode;
};

export const OrganisationMemberDeleteDialog = ({
  trigger,
  organisationMemberId,
  organisationMemberName,
  organisationMemberEmail,
}: OrganisationMemberDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const organisation = useCurrentOrganisation();

  const { mutateAsync: deleteOrganisationMembers, isPending: isDeletingOrganisationMember } =
    trpc.organisation.member.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You have successfully removed this user from the organisation.",
          duration: 5000,
        });

        setOpen(false);
      },
      onError: () => {
        toast({
          title: "An unknown error occurred",
          description: 
            "We encountered an unknown error while attempting to remove this user. Please try again later.",
          ,
          variant: 'destructive',
          duration: 10000,
        });
      },
    });

  return (
    <Dialog open={open} onOpenChange={(value) => !isDeletingOrganisationMember && setOpen(value)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary">
            Delete organisation member
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Are you sure?
          </DialogTitle>

          <DialogDescription className="mt-4">
            
              You are about to remove the following user from{' '}
              <span className="font-semibold">{organisation.name}</span>.
            
          </DialogDescription>
        </DialogHeader>

        <Alert variant="neutral" padding="tight">
          <AvatarWithText
            avatarClass="h-12 w-12"
            avatarFallback={organisationMemberName.slice(0, 1).toUpperCase()}
            primaryText={<span className="font-semibold">{organisationMemberName}</span>}
            secondaryText={organisationMemberEmail}
          />
        </Alert>

        <fieldset disabled={isDeletingOrganisationMember}>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              loading={isDeletingOrganisationMember}
              onClick={async () =>
                deleteOrganisationMembers({
                  organisationId: organisation.id,
                  organisationMemberId,
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
