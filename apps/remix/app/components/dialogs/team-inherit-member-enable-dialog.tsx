import { OrganisationGroupType, OrganisationMemberRole, TeamMemberRole } from '@prisma/client';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
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

export const TeamMemberInheritEnableDialog = () => {
  const organisation = useCurrentOrganisation();
  const team = useCurrentTeam();

  const { toast } = useToast();
  const { mutateAsync: createTeamGroups, isPending } = trpc.team.group.createMany.useMutation({
    onSuccess: () => {
      toast({
        title: "Access enabled",
        duration: 5000,
      });
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "We encountered an unknown error while attempting to enable access.",
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const organisationGroupQuery = trpc.organisation.group.find.useQuery({
    organisationId: organisation.id,
    perPage: 1,
    types: [OrganisationGroupType.INTERNAL_ORGANISATION],
    organisationRoles: [OrganisationMemberRole.MEMBER],
  });

  const enableAccessGroup = async () => {
    if (!organisationGroupQuery.data?.data[0]?.id) {
      return;
    }

    await createTeamGroups({
      teamId: team.id,
      groups: [
        {
          organisationGroupId: organisationGroupQuery.data?.data[0]?.id,
          teamRole: TeamMemberRole.MEMBER,
        },
      ],
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Enable access
        </Button>
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Are you sure?
          </DialogTitle>

          <DialogDescription className="mt-4">
            
              You are about to give all organisation members access to this team under their
              organisation role.
            
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
            disabled={organisationGroupQuery.isPending}
            loading={isPending}
            onClick={enableAccessGroup}
          >
            Enable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
