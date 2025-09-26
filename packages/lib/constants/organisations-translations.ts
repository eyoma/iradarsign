/**
 * These constants are in a different file to avoid E2E tests from importing `"
 * which will break it.
 */
import type { OrganisationMemberRole } from '@prisma/client';

export const ORGANISATION_MEMBER_ROLE_MAP: Record<
  keyof typeof OrganisationMemberRole,
  MessageDescriptor
> = {
  ADMIN: msg"Admin`,
  MANAGER: "Manager",
  MEMBER: "Member",
};

export const EXTENDED_ORGANISATION_MEMBER_ROLE_MAP: Record<
  keyof typeof OrganisationMemberRole,
  MessageDescriptor
> = {
  ADMIN: "Organisation Admin",
  MANAGER: "Organisation Manager",
  MEMBER: "Organisation Member",
};
