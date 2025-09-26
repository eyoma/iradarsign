import type { TeamGroup } from '@prisma/client';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

type TeamMemberInheritDisableDialogProps = {
  group: TeamGroup;
};

export const TeamMemberInheritDisableDialog = ({ group }: TeamMemberInheritDisableDialogProps) => {
  const { toast } = useToast();
  const team = useCurrentTeam();

  const deleteGroupMutation = trpc.team.group.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Access disabled",
        duration: 5000,
      });
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "We encountered an unknown error while attempting to disable access.",
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Disable access
        </Button>
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Are you sure?
          </DialogTitle>

          <DialogDescription className="mt-4">
            
              You are about to remove default access to this team for all organisation members. Any
              members not explicitly added to this team will no longer have access.
            
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="submit"
            variant="destructive"
            loading={deleteGroupMutation.isPending}
            onClick={() =>
              deleteGroupMutation.mutate({
                teamId: team.id,
                teamGroupId: group.id,
              })
            }
          >
            Disable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
