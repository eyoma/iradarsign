import { useState } from 'react';

import type { Prisma } from '@prisma/client';
import { useRevalidator } from 'react-router';

import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { extractInitials } from '@documenso/lib/utils/recipient-formatter';
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

export type TeamEmailDeleteDialogProps = {
  trigger?: React.ReactNode;
  teamName: string;
  team: Prisma.TeamGetPayload<{
    include: {
      teamEmail: true;
      emailVerification: {
        select: {
          expiresAt: true;
          name: true;
          email: true;
        };
      };
    };
  }>;
};

export const TeamEmailDeleteDialog = ({ trigger, teamName, team }: TeamEmailDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const { revalidate } = useRevalidator();

  const { mutateAsync: deleteTeamEmail, isPending: isDeletingTeamEmail } =
    trpc.team.email.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Team email has been removed",
          duration: 5000,
        });
      },
      onError: () => {
        toast({
          title: "Something went wrong",
          description: "Unable to remove team email at this time. Please try again.",
          variant: 'destructive',
          duration: 10000,
        });
      },
    });

  const { mutateAsync: deleteTeamEmailVerification, isPending: isDeletingTeamEmailVerification } =
    trpc.team.email.verification.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Email verification has been removed",
          duration: 5000,
        });
      },
      onError: () => {
        toast({
          title: "Something went wrong",
          description: "Unable to remove email verification at this time. Please try again.",
          variant: 'destructive',
          duration: 10000,
        });
      },
    });

  const onRemove = async () => {
    if (team.teamEmail) {
      await deleteTeamEmail({ teamId: team.id });
    }

    if (team.emailVerification) {
      await deleteTeamEmailVerification({ teamId: team.id });
    }

    await revalidate();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive">
            Remove team email
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Are you sure?
          </DialogTitle>

          <DialogDescription className="mt-4">
            
              You are about to delete the following team email from{' '}
              <span className="font-semibold">{teamName}</span>.
            
          </DialogDescription>
        </DialogHeader>

        <Alert variant="neutral" padding="tight">
          <AvatarWithText
            avatarClass="h-12 w-12"
            avatarSrc={formatAvatarUrl(team.avatarImageId)}
            avatarFallback={extractInitials(
              (team.teamEmail?.name || team.emailVerification?.name) ?? '',
            )}
            primaryText={
              <span className="text-foreground/80 text-sm font-semibold">
                {team.teamEmail?.name || team.emailVerification?.name}
              </span>
            }
            secondaryText={
              <span className="text-sm">
                {team.teamEmail?.email || team.emailVerification?.email}
              </span>
            }
          />
        </Alert>

        <fieldset disabled={isDeletingTeamEmail || isDeletingTeamEmailVerification}>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              loading={isDeletingTeamEmail || isDeletingTeamEmailVerification}
              onClick={async () => onRemove()}
            >
              Remove
            </Button>
          </DialogFooter>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};
