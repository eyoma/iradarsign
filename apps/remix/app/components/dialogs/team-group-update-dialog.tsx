import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { TeamMemberRole } from '@prisma/client';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TEAM_MEMBER_ROLE_HIERARCHY } from '@documenso/lib/constants/teams';
import { EXTENDED_TEAM_MEMBER_ROLE_MAP } from '@documenso/lib/constants/teams-translations';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

export type TeamGroupUpdateDialogProps = {
  trigger?: React.ReactNode;
  teamGroupId: string;
  teamGroupName: string;
  teamGroupRole: TeamMemberRole;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZUpdateTeamGroupFormSchema = z.object({
  role: z.nativeEnum(TeamMemberRole),
});

type ZUpdateTeamGroupSchema = z.infer<typeof ZUpdateTeamGroupFormSchema>;

export const TeamGroupUpdateDialog = ({
  trigger,
  teamGroupId,
  teamGroupName,
  teamGroupRole,
  ...props
}: TeamGroupUpdateDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const team = useCurrentTeam();

  const form = useForm<ZUpdateTeamGroupSchema>({
    resolver: zodResolver(ZUpdateTeamGroupFormSchema),
    defaultValues: {
      role: teamGroupRole,
    },
  });

  const { mutateAsync: updateTeamGroup } = trpc.team.group.update.useMutation();

  const onFormSubmit = async ({ role }: ZUpdateTeamGroupSchema) => {
    try {
      await updateTeamGroup({
        id: teamGroupId,
        data: {
          teamRole: role,
        },
      });

      toast({
        title: "Success",
        description: "You have updated the team group.",
        duration: 5000,
      });

      setOpen(false);
    } catch {
      toast({
        title: "An unknown error occurred",
        description: 
          "We encountered an unknown error while attempting to update this team member. Please try again later.",
        ,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, team.currentTeamRole, teamGroupRole, form, toast]);

  return (
    <Dialog
      {...props}
      open={open}
      onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}
    >
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
        {trigger ?? (
          <Button variant="secondary">
            Update team group
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Update team group
          </DialogTitle>

          <DialogDescription>
            
              You are currently updating the <span className="font-bold">{teamGroupName}</span> team
              group.
            
          </DialogDescription>
        </DialogHeader>

        {isTeamRoleWithinUserHierarchy(team.currentTeamRole, teamGroupRole) ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <fieldset className="flex h-full flex-col" disabled={form.formState.isSubmitting}>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel required>
                        Role
                      </FormLabel>
                      <FormControl>
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger className="text-muted-foreground">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent className="w-full" position="popper">
                            {TEAM_MEMBER_ROLE_HIERARCHY[team.currentTeamRole].map((role) => (
                              <SelectItem key={role} value={role}>
                                {EXTENDED_TEAM_MEMBER_ROLE_MAP[role] ?? role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-4">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>

                  <Button type="submit" loading={form.formState.isSubmitting}>
                    Update
                  </Button>
                </DialogFooter>
              </fieldset>
            </form>
          </Form>
        ) : (
          <>
            <Alert variant="neutral">
              <AlertDescription className="text-center font-semibold">
                You cannot modify a group which has a higher role than you.
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
