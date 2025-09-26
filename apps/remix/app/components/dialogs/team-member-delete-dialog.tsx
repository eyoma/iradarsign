import { useState } from 'react';

import { trpc } from '@documenso/trpc/react';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
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

export type TeamMemberDeleteDialogProps = {
  teamId: number;
  teamName: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  isInheritMemberEnabled: boolean | null;
  trigger?: React.ReactNode;
};

export const TeamMemberDeleteDialog = ({
  trigger,
  teamId,
  teamName,
  memberId,
  memberName,
  memberEmail,
  isInheritMemberEnabled,
}: TeamMemberDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const { mutateAsync: deleteTeamMember, isPending: isDeletingTeamMember } =
    trpc.team.member.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You have successfully removed this user from the team.",
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
    <Dialog open={open} onOpenChange={(value) => !isDeletingTeamMember && setOpen(value)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary">
            Remove team member
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
              <span className="font-semibold">{teamName}</span>.
            
          </DialogDescription>
        </DialogHeader>

        {isInheritMemberEnabled ? (
          <Alert variant="neutral">
            <AlertDescription>
              
                You cannot remove members from this team if the inherit member feature is enabled.
              
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="neutral" padding="tight">
            <AvatarWithText
              avatarClass="h-12 w-12"
              avatarFallback={memberName.slice(0, 1).toUpperCase()}
              primaryText={<span className="font-semibold">{memberName}</span>}
              secondaryText={memberEmail}
            />
          </Alert>
        )}

        <fieldset disabled={isDeletingTeamMember}>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>

            {!isInheritMemberEnabled && (
              <Button
                type="submit"
                variant="destructive"
                disabled={Boolean(isInheritMemberEnabled)}
                loading={isDeletingTeamMember}
                onClick={async () => deleteTeamMember({ teamId, memberId })}
              >
                Remove
              </Button>
            )}
          </DialogFooter>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};
