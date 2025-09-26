import { useState } from 'react';

import type { TeamMemberRole } from '@prisma/client';

import { isTeamRoleWithinUserHierarchy } from '@documenso/lib/utils/teams';
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

import { useCurrentTeam } from '~/providers/team';

export type TeamGroupDeleteDialogProps = {
  trigger?: React.ReactNode;
  teamGroupId: string;
  teamGroupName: string;
  teamGroupRole: TeamMemberRole;
};

export const TeamGroupDeleteDialog = ({
  trigger,
  teamGroupId,
  teamGroupName,
  teamGroupRole,
}: TeamGroupDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const team = useCurrentTeam();

  const { mutateAsync: deleteGroup, isPending: isDeleting } = trpc.team.group.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully removed this group from the team.",
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
            Delete team group
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
              <span className="font-semibold">{team.name}</span>.
            
          </DialogDescription>
        </DialogHeader>

        {isTeamRoleWithinUserHierarchy(team.currentTeamRole, teamGroupRole) ? (
          <>
            <Alert variant="neutral">
              <AlertDescription className="text-center font-semibold">
                {teamGroupName}
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
                      teamId: team.id,
                      teamGroupId: teamGroupId,
                    })
                  }
                >
                  Delete
                </Button>
              </DialogFooter>
            </fieldset>
          </>
        ) : (
          <>
            <Alert variant="neutral">
              <AlertDescription className="text-center font-semibold">
                You cannot delete a group which has a higher role than you.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
