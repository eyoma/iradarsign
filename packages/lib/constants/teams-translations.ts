import type { TeamMemberRole } from '@prisma/client';

export const TEAM_MEMBER_ROLE_MAP: Record<keyof typeof TeamMemberRole, MessageDescriptor> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  MEMBER: "Member",
};

export const EXTENDED_TEAM_MEMBER_ROLE_MAP: Record<keyof typeof TeamMemberRole, MessageDescriptor> =
  {
    ADMIN: "Team Admin",
    MANAGER: "Team Manager",
    MEMBER: "Team Member",
  };
