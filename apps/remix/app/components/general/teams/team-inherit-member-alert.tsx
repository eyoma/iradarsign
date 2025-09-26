import type { TeamGroup } from '@prisma/client';

import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';

import { TeamMemberInheritDisableDialog } from '~/components/dialogs/team-inherit-member-disable-dialog';
import { TeamMemberInheritEnableDialog } from '~/components/dialogs/team-inherit-member-enable-dialog';

type TeamInheritMemberAlertProps = {
  memberAccessTeamGroup: TeamGroup | null;
};

export const TeamInheritMemberAlert = ({ memberAccessTeamGroup }: TeamInheritMemberAlertProps) => {
  return (
    <Alert
      className="flex flex-col justify-between p-6 sm:flex-row sm:items-center"
      variant="neutral"
    >
      <div className="mb-4 sm:mb-0">
        <AlertTitle>
          Inherit organisation members
        </AlertTitle>

        <AlertDescription className="mr-2">
          {memberAccessTeamGroup ? (
            Currently all organisation members can access this team
          ) : (
            
              You can enable access to allow all organisation members to access this team by
              default.
            
          )}
        </AlertDescription>
      </div>

      {memberAccessTeamGroup ? (
        <TeamMemberInheritDisableDialog group={memberAccessTeamGroup} />
      ) : (
        <TeamMemberInheritEnableDialog />
      )}
    </Alert>
  );
};
